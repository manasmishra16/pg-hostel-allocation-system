import io
import uuid
import pytest
from concurrent.futures import ThreadPoolExecutor
from fastapi.testclient import TestClient
from app.main import app, seed_initial_data
from app.core.database import Base, engine, SessionLocal
from app.services.roommate_service import RoommateService
from app.services.invoice_service import InvoiceService
from app.models.entities import RoommatePreference, User, Bed, Allocation, Property, Invoice, Complaint, Notification
from app.ai.complaint_classifier import ComplaintClassifier
from app.schemas.domain import InvoiceCreate, InvoiceItemCreate




client = TestClient(app)


def get_token_for(email: str, password: str = "password123") -> str:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["access_token"]


# ============================================================================
# 1. ROOT & HEALTH
# ============================================================================
def test_root_health():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["app"] == "StayNest API"
    assert res.json()["status"] == "healthy"


# ============================================================================
# 2. AUTHENTICATION & PASSWORD HASHING
# ============================================================================
def test_auth_signup_and_login():
    test_email = f"audit_user_{uuid.uuid4().hex[:6]}@staynest.com"
    signup_res = client.post("/api/v1/auth/signup", json={
        "email": test_email,
        "password": "SecurePassword123!",
        "full_name": "Audit Test User",
        "phone": "+91 99999 11111",
        "role": "TENANT"
    })
    assert signup_res.status_code == 200
    data = signup_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == test_email
    assert data["user"]["role"] == "TENANT"

    # Login with newly created user
    login_res = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200

    # Login with wrong password must be rejected
    bad_login = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

    # Logout
    token = login_res.json()["access_token"]
    logout_res = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_res.status_code == 200


# ============================================================================
# 3. RBAC (ROLE-BASED ACCESS CONTROL) AUTHORIZATION
# ============================================================================
def test_rbac_unauthorized_requests():
    tenant_token = get_token_for("manas@staynest.com")
    tenant_headers = {"Authorization": f"Bearer {tenant_token}"}

    staff_token = get_token_for("staff@staynest.com")
    staff_headers = {"Authorization": f"Bearer {staff_token}"}

    owner_token = get_token_for("owner@staynest.com")
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    # 1. TENANT attempting to call OWNER-only endpoint (create property) -> Must be 403 Forbidden
    res_tenant_prop = client.post("/api/v1/properties", json={
        "name": "Unauthorized Property",
        "property_type": "PG",
        "gender_type": "COED",
        "address": "Test Street",
        "locality": "HSR Layout",
        "city": "Bengaluru",
        "pincode": "560102"
    }, headers=tenant_headers)
    assert res_tenant_prop.status_code == 403

    # 2. TENANT attempting to create a Bed Allocation -> Must be 403 Forbidden
    res_tenant_alloc = client.post("/api/v1/allocations", json={
        "bed_id": "f0000000-0000-0000-0000-000000000002",
        "tenant_id": "a0000000-0000-0000-0000-000000000006",
        "monthly_rent": 8500.0
    }, headers=tenant_headers)
    assert res_tenant_alloc.status_code == 403

    # 3. TENANT attempting to view Admin/Owner dashboard analytics -> Must be 403 Forbidden
    res_tenant_analytics = client.get("/api/v1/analytics/dashboard", headers=tenant_headers)
    assert res_tenant_analytics.status_code == 403

    # 4. OWNER attempting to delete or modify a property owned by someone else -> Must be 403 Forbidden
    # First create a second owner
    other_owner_email = f"other_owner_{uuid.uuid4().hex[:6]}@staynest.com"
    client.post("/api/v1/auth/signup", json={
        "email": other_owner_email,
        "password": "password123",
        "full_name": "Second Owner",
        "role": "PROPERTY_OWNER"
    })
    other_token = get_token_for(other_owner_email)
    other_headers = {"Authorization": f"Bearer {other_token}"}

    # Second owner attempts to delete Sunrise PG (owned by Vikramaditya Roy) -> Must be 403
    del_res = client.delete("/api/v1/properties/b0000000-0000-0000-0000-000000000001", headers=other_headers)
    assert del_res.status_code == 403


# ============================================================================
# 4. PROPERTY CRUD & RELATIONSHIPS
# ============================================================================
def test_property_crud():
    owner_token = get_token_for("owner@staynest.com")
    headers = {"Authorization": f"Bearer {owner_token}"}

    # 1. CREATE Property with automatic scaffolding
    create_res = client.post("/api/v1/properties", json={
        "name": "Audit Test Luxury Hostel",
        "property_type": "HOSTEL",
        "gender_type": "BOYS",
        "description": "Premium student residency with gym and study hall.",
        "address": "12th Main Road, Indiranagar",
        "locality": "Indiranagar",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560038",
        "starting_price": 9500.0,
        "total_floors": 2,
        "rooms_per_floor": 2,
        "beds_per_room": 2,
        "amenities": ["High-speed WiFi", "Nutritious Food", "Air Conditioning", "Daily Housekeeping"],
        "images": ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200"]
    }, headers=headers)
    assert create_res.status_code == 200
    prop_data = create_res.json()
    prop_id = prop_data["id"]
    assert prop_data["name"] == "Audit Test Luxury Hostel"
    assert prop_data["total_beds"] == 8  # 2 floors * 2 rooms * 2 beds = 8 beds
    assert prop_data["occupied_beds"] == 0

    # 2. READ Property
    read_res = client.get(f"/api/v1/properties/{prop_id}")
    assert read_res.status_code == 200
    assert len(read_res.json()["buildings"]) == 1
    assert len(read_res.json()["buildings"][0]["floors"]) == 2

    # 3. UPDATE Property
    update_res = client.put(f"/api/v1/properties/{prop_id}", json={
        "name": "Audit Test Luxury Hostel Updated",
        "property_type": "HOSTEL",
        "gender_type": "COED",
        "address": "12th Main Road, Indiranagar",
        "locality": "Indiranagar",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560038",
        "starting_price": 10000.0,
        "description": "Updated description with enhanced amenities."
    }, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Audit Test Luxury Hostel Updated"
    assert update_res.json()["gender_type"] == "COED"

    # 4. DELETE Property
    del_res = client.delete(f"/api/v1/properties/{prop_id}", headers=headers)
    assert del_res.status_code == 200

    # Confirm it is gone
    get_del = client.get(f"/api/v1/properties/{prop_id}")
    assert get_del.status_code == 404


# ============================================================================
# 5. HIERARCHY ENTITY CREATION (Building -> Floor -> Room -> Bed)
# ============================================================================
def test_entity_hierarchy_creation():
    # 1. Create building under Sunrise PG
    bldg_res = client.post("/api/v1/rooms/buildings", json={
        "property_id": "b0000000-0000-0000-0000-000000000001",
        "name": "Block C (Annex)",
        "total_floors": 1
    })
    assert bldg_res.status_code == 200
    bldg_id = bldg_res.json()["id"]

    # 2. Create floor
    floor_res = client.post("/api/v1/rooms/floors", json={
        "building_id": bldg_id,
        "floor_number": 1,
        "floor_name": "Annex Ground Floor"
    })
    assert floor_res.status_code == 200
    floor_id = floor_res.json()["id"]

    # 3. Create room
    room_res = client.post("/api/v1/rooms", json={
        "floor_id": floor_id,
        "room_number": "C-101",
        "room_type": "DOUBLE",
        "capacity": 2,
        "base_rent": 8500.0
    })
    assert room_res.status_code == 200
    room_id = room_res.json()["id"]

    # 4. Create bed
    bed_res = client.post("/api/v1/rooms/beds", json={
        "room_id": room_id,
        "bed_code": "Bed C1",
        "monthly_rent": 8500.0,
        "status": "AVAILABLE"
    })
    assert bed_res.status_code == 200
    assert bed_res.json()["bed_code"] == "Bed C1"
    assert bed_res.json()["status"] == "AVAILABLE"


# ============================================================================
# 6. PROPERTY DISCOVERY & ADVANCED DATABASE FILTERING
# ============================================================================
def test_advanced_property_filters():
    # Locality filter
    res_loc = client.get("/api/v1/properties?locality=Koramangala")
    assert res_loc.status_code == 200
    assert len(res_loc.json()) >= 1
    assert all("Koramangala" in p["locality"] for p in res_loc.json())

    # Budget filter
    res_budget = client.get("/api/v1/properties?min_budget=7000&max_budget=8500")
    assert res_budget.status_code == 200
    assert all(7000 <= p["starting_rent"] <= 8500 for p in res_budget.json())

    # Sorting filter
    res_sort = client.get("/api/v1/properties?sort_by=price_asc")
    assert res_sort.status_code == 200
    prices = [p["starting_rent"] for p in res_sort.json()]
    assert prices == sorted(prices)

    # Amenity filters
    res_food = client.get("/api/v1/properties?has_food=true")
    assert res_food.status_code == 200


# ============================================================================
# 7. BED STATUS TRANSITIONS & GUARDS
# ============================================================================
def test_bed_status_transitions():
    # 1. Update available bed to MAINTENANCE
    patch_res = client.patch("/api/v1/rooms/beds/f0000000-0000-0000-0000-000000000004/status", json={
        "status": "MAINTENANCE"
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "MAINTENANCE"

    # 2. Reset back to AVAILABLE
    patch_avail = client.patch("/api/v1/rooms/beds/f0000000-0000-0000-0000-000000000004/status", json={
        "status": "AVAILABLE"
    })
    assert patch_avail.status_code == 200
    assert patch_avail.json()["status"] == "AVAILABLE"

    # 3. Prohibit direct jump to OCCUPIED without allocation
    patch_bad = client.patch("/api/v1/rooms/beds/f0000000-0000-0000-0000-000000000004/status", json={
        "status": "OCCUPIED"
    })
    assert patch_bad.status_code == 400
    assert "direct transition" in patch_bad.json()["detail"].lower()

    # 4. Prohibit moving an OCCUPIED bed to AVAILABLE without vacating
    patch_occupied = client.patch("/api/v1/rooms/beds/f0000000-0000-0000-0000-000000000001/status", json={
        "status": "AVAILABLE"
    })
    assert patch_occupied.status_code == 400
    assert "cannot transition occupied bed" in patch_occupied.json()["detail"].lower()


# ============================================================================
# 8. CONCURRENT DOUBLE ALLOCATION TEST (CRITICAL REQUIREMENT)
# ============================================================================
def test_concurrent_double_allocation():
    """
    Spawns concurrent requests attempting to allocate the same Bed to two different tenants simultaneously.
    Verifies that database locking and allocation constraints ensure EXACTLY ONE succeeds and the other fails.
    """
    admin_token = get_token_for("admin@staynest.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Bed D in Room 101 (initially available)
    target_bed_id = "f0000000-0000-0000-0000-000000000004"

    # Create two fresh test tenants
    uid1 = str(uuid.uuid4())
    uid2 = str(uuid.uuid4())
    db = SessionLocal()
    try:
        t1 = User(id=uid1, email=f"tenant_race_1_{uid1[:6]}@staynest.com", hashed_password="pw", full_name="Racer 1", role="TENANT")
        t2 = User(id=uid2, email=f"tenant_race_2_{uid2[:6]}@staynest.com", hashed_password="pw", full_name="Racer 2", role="TENANT")
        db.add_all([t1, t2])
        # Reset target bed to AVAILABLE
        bed = db.query(Bed).filter(Bed.id == target_bed_id).first()
        if bed:
            bed.status = "AVAILABLE"
            bed.current_tenant_id = None
            db.query(Allocation).filter(Allocation.bed_id == target_bed_id, Allocation.status == "ACTIVE").delete()
        db.commit()
    finally:
        db.close()

    def attempt_allocation(tenant_id: str):
        c = TestClient(app)
        return c.post("/api/v1/allocations", json={
            "bed_id": target_bed_id,
            "tenant_id": tenant_id,
            "monthly_rent": 8000.0
        }, headers=headers)

    with ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(attempt_allocation, uid1)
        f2 = executor.submit(attempt_allocation, uid2)
        r1 = f1.result()
        r2 = f2.result()

    statuses = [r1.status_code, r2.status_code]
    # Exactly one must succeed (200), and one must fail (400 Bad Request)
    assert 200 in statuses, f"Expected at least one success, got {statuses}"
    assert 400 in statuses, f"Expected one 400 rejection for double allocation, got {statuses}"

    # Verify state in DB: exactly 1 active allocation exists for this bed
    db = SessionLocal()
    try:
        active_allocs = db.query(Allocation).filter(
            Allocation.bed_id == target_bed_id,
            Allocation.status == "ACTIVE"
        ).count()
        assert active_allocs == 1
    finally:
        db.close()


# ============================================================================
# 9. ROOMMATE COMPATIBILITY FORMULA & TRANSPARENCY
# ============================================================================
def test_roommate_formula_transparency():
    p1 = RoommatePreference(
        course="Computer Science",
        year_of_study=3,
        sleep_schedule="night_owl",
        noise_tolerance=4,
        cleanliness=5,
        smoking="non_smoker",
        drinking="non_drinker",
        food_preference="vegetarian"
    )
    p2 = RoommatePreference(
        course="Computer Science",
        year_of_study=3,
        sleep_schedule="night_owl",
        noise_tolerance=4,
        cleanliness=4,
        smoking="non_smoker",
        drinking="non_drinker",
        food_preference="vegetarian"
    )

    scores = RoommateService.calculate_compatibility(p1, p2)
    assert scores["overall"] >= 90
    assert scores["circadian"] == 100
    assert scores["cleanliness"] == 80
    assert scores["noise"] == 100
    assert scores["lifestyle"] == 100
    assert scores["academic"] == 100
    assert scores["weights"]["circadian"] == "25%"
    assert scores["weights"]["cleanliness"] == "25%"
    assert scores["weights"]["noise"] == "20%"
    assert scores["weights"]["lifestyle"] == "15%"
    assert scores["weights"]["academic"] == "15%"


# ============================================================================
# 10. COMPLAINT FULL LIFECYCLE & AI TRIAGE
# ============================================================================
def test_complaints_lifecycle():
    tenant_token = get_token_for("manas@staynest.com")
    tenant_headers = {"Authorization": f"Bearer {tenant_token}"}
    staff_token = get_token_for("staff@staynest.com")
    staff_headers = {"Authorization": f"Bearer {staff_token}"}

    # 1. Create complaint
    create_res = client.post("/api/v1/complaints", json={
        "title": "Severe water tap leakage",
        "description": "The bathroom tap is continuously leaking and overflowing onto the room floor.",
        "category": "PLUMBING",
        "priority": "HIGH",
        "property_id": "b0000000-0000-0000-0000-000000000001",
        "room_id": "e0000000-0000-0000-0000-000000000001"
    }, headers=tenant_headers)
    assert create_res.status_code == 200
    c_data = create_res.json()
    c_id = c_data["id"]
    assert c_data["status"] == "PENDING"
    assert c_data["suggested_department"] == "Plumbing & Maintenance"

    # 2. View complaint
    view_res = client.get(f"/api/v1/complaints/{c_id}", headers=tenant_headers)
    assert view_res.status_code == 200

    # 3. Staff assigns complaint
    assign_res = client.post(f"/api/v1/complaints/{c_id}/assign?staff_id=a0000000-0000-0000-0000-000000000004", headers=staff_headers)
    assert assign_res.status_code == 200
    assert assign_res.json()["status"] == "ASSIGNED"

    # 4. Escalate complaint
    esc_res = client.post(f"/api/v1/complaints/{c_id}/escalate", headers=tenant_headers)
    assert esc_res.status_code == 200
    assert esc_res.json()["status"] == "ESCALATED"
    assert esc_res.json()["escalated"] is True

    # 5. Resolve complaint
    res_res = client.post(f"/api/v1/complaints/{c_id}/resolve", headers=staff_headers)
    assert res_res.status_code == 200
    assert res_res.json()["status"] == "RESOLVED"
    assert res_res.json()["resolved_at"] is not None


# ============================================================================
# 11. INVOICE SYSTEM & BACKEND TOTAL CALCULATION
# ============================================================================
def test_invoice_creation_and_calculation():
    owner_token = get_token_for("owner@staynest.com")
    headers = {"Authorization": f"Bearer {owner_token}"}

    create_res = client.post("/api/v1/invoices", json={
        "tenant_id": "a0000000-0000-0000-0000-000000000005",
        "property_id": "b0000000-0000-0000-0000-000000000001",
        "billing_period": "October 2026",
        "subtotal": 8000.0,
        "electricity_charges": 550.0,
        "maintenance_charges": 300.0,
        "discount": 100.0,
        "items": [
            {"description": "Room Rent", "amount": 8000.0},
            {"description": "Electricity Units", "amount": 550.0},
            {"description": "Common Area Maintenance", "amount": 300.0}
        ]
    }, headers=headers)
    assert create_res.status_code == 200
    inv = create_res.json()
    # Backend strict math: 8000 + 550 + 300 - 100 = 8750.0
    assert inv["total_amount"] == 8750.0
    assert inv["status"] == "PENDING"
    inv_id = inv["id"]

    # Receipt retrieval
    receipt_res = client.get(f"/api/v1/invoices/{inv_id}/receipt", headers=headers)
    assert receipt_res.status_code == 200
    assert receipt_res.json()["total_amount"] == 8750.0


# ============================================================================
# 12. PAYMENT & RAZORPAY INTEGRATION WITH DUPLICATE REJECTION
# ============================================================================
def test_payment_and_duplicate_prevention():
    tenant_token = get_token_for("manas@staynest.com")
    headers = {"Authorization": f"Bearer {tenant_token}"}
    admin_token = get_token_for("admin@staynest.com")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Create fresh pending invoice for payment verification
    inv_res = client.post("/api/v1/invoices", json={
        "tenant_id": "a0000000-0000-0000-0000-000000000005",
        "property_id": "b0000000-0000-0000-0000-000000000001",
        "billing_period": f"Period-{uuid.uuid4().hex[:4]}",
        "subtotal": 8500.0
    }, headers=admin_headers)
    assert inv_res.status_code == 200
    inv_id = inv_res.json()["id"]

    # 1. Create Order
    order_res = client.post("/api/v1/payments/create-order", json={
        "invoice_id": inv_id,
        "amount": 8500.0
    }, headers=headers)
    assert order_res.status_code == 200
    assert "order_id" in order_res.json()

    # 2. Verify Payment (first time -> SUCCESS)
    verify_res = client.post("/api/v1/payments/verify", json={
        "invoice_id": inv_id,
        "razorpay_order_id": order_res.json()["order_id"],
        "razorpay_payment_id": f"pay_audit_{uuid.uuid4().hex[:8]}",
        "razorpay_signature": "simulated_valid_signature"
    }, headers=headers)
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "COMPLETED"

    # 3. Duplicate payment attempt on the SAME settled invoice -> MUST FAIL
    dup_res = client.post("/api/v1/payments/verify", json={
        "invoice_id": inv_id,
        "razorpay_order_id": order_res.json()["order_id"],
        "razorpay_payment_id": f"pay_audit_dup_{uuid.uuid4().hex[:8]}",
        "razorpay_signature": "simulated_valid_signature"
    }, headers=headers)
    assert dup_res.status_code == 400
    assert "already been paid" in dup_res.json()["detail"].lower()


# ============================================================================
# 13. NOTIFICATIONS SYSTEM
# ============================================================================
def test_notifications_lifecycle():
    tenant_token = get_token_for("manas@staynest.com")
    headers = {"Authorization": f"Bearer {tenant_token}"}

    # Get notifications
    res = client.get("/api/v1/notifications", headers=headers)
    assert res.status_code == 200
    notifs = res.json()
    assert len(notifs) >= 1
    target_notif = notifs[0]

    # Mark as read
    patch_res = client.patch(f"/api/v1/notifications/{target_notif['id']}/read", headers=headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["is_read"] is True


# ============================================================================
# 14. DOCUMENT STORAGE & PRIVATE ACCESS AUTHORIZATION
# ============================================================================
def test_documents_authorization():
    tenant_token = get_token_for("manas@staynest.com")
    tenant_headers = {"Authorization": f"Bearer {tenant_token}"}

    other_tenant_token = get_token_for("rahul.joshi@staynest.com")
    other_headers = {"Authorization": f"Bearer {other_tenant_token}"}

    # 1. Manas uploads private document (Aadhaar Card)
    file_content = b"%PDF-1.4 Mock Aadhaar Card Content"
    upload_res = client.post(
        "/api/v1/documents/upload",
        data={"title": "Manas Aadhaar Card", "document_type": "ID_PROOF", "is_private": "true"},
        files={"file": ("aadhaar.pdf", io.BytesIO(file_content), "application/pdf")},
        headers=tenant_headers
    )
    assert upload_res.status_code == 200
    doc_id = upload_res.json()["id"]

    # 2. Manas can download his own private document
    dl_owner = client.get(f"/api/v1/documents/{doc_id}/download", headers=tenant_headers)
    assert dl_owner.status_code == 200

    # 3. Rahul (unrelated tenant) attempts to download Manas's private document -> 403 Forbidden!
    dl_unauth = client.get(f"/api/v1/documents/{doc_id}/download", headers=other_headers)
    assert dl_unauth.status_code == 403

    # 4. Manas deletes his document
    del_res = client.delete(f"/api/v1/documents/{doc_id}", headers=tenant_headers)
    assert del_res.status_code == 200
