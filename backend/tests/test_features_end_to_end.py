import pytest
from datetime import datetime, date
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.entities import (
    User, Property, Allocation, Bed, Room, Complaint,
    UserStayPreference, UserDestination, MoveInWorkflow, MoveInAuditLog,
    PreventiveMaintenanceAction, PropertyTrustMetric
)

client = TestClient(app)


def get_token_for(email: str, password: str = "password123") -> str:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["access_token"]


# ============================================================================
# 1. STAYMATCH TESTS
# ============================================================================

def test_staymatch_preferences_get_and_update():
    token = get_token_for("manas@staynest.com")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get preferences
    res = client.get("/api/v1/staymatch/preferences", headers=headers)
    assert res.status_code == 200
    pref = res.json()
    assert "max_budget" in pref
    assert "preferred_localities" in pref

    # 2. Update preferences
    update_res = client.put(
        "/api/v1/staymatch/preferences",
        headers=headers,
        json={
            "max_budget": 16000.0,
            "preferred_localities": ["Koramangala", "Indiranagar"],
            "preferred_room_types": ["DOUBLE", "SINGLE"],
            "required_amenities": ["High-speed WiFi", "Air Conditioning"]
        }
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["max_budget"] == 16000.0
    assert "Indiranagar" in updated["preferred_localities"]


def test_staymatch_fit_score_calculation():
    token = get_token_for("manas@staynest.com")
    headers = {"Authorization": f"Bearer {token}"}

    prop_res = client.get("/api/v1/properties")
    assert prop_res.status_code == 200
    properties = prop_res.json()
    assert len(properties) > 0
    prop_id = properties[0]["id"]

    # Calculate score
    res = client.get(f"/api/v1/staymatch/property/{prop_id}", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["property_id"] == prop_id
    assert 0 <= data["total_score"] <= 100
    assert len(data["category_scores"]) == 5
    assert len(data["reasons"]) > 0

    # Verify category scores sum up to total score
    category_sum = sum(c["score"] for c in data["category_scores"])
    assert abs(category_sum - data["total_score"]) < 0.1

    # Verify zero hardcoding: check all properties score
    all_scores_res = client.get("/api/v1/staymatch/all", headers=headers)
    assert all_scores_res.status_code == 200
    all_scores = all_scores_res.json()
    assert len(all_scores) == len(properties)
    # Ensure scores are sorted descending
    scores = [s["total_score"] for s in all_scores]
    assert scores == sorted(scores, reverse=True)


# ============================================================================
# 2. COMMUTE INTELLIGENCE TESTS
# ============================================================================

def test_user_destinations_crud_and_calculation():
    token = get_token_for("manas@staynest.com")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get initial destinations
    res = client.get("/api/v1/commute/destinations", headers=headers)
    assert res.status_code == 200
    dests = res.json()
    assert len(dests) >= 1

    # 2. Add a new destination
    add_res = client.post(
        "/api/v1/commute/destinations",
        headers=headers,
        json={
            "name": "Koramangala BDA Complex",
            "destination_type": "OTHER",
            "address": "80 Feet Rd, 4th Block, Koramangala, Bengaluru 560034",
            "latitude": 12.9340,
            "longitude": 77.6220,
            "travel_mode": "DRIVING",
            "is_primary": False
        }
    )
    assert add_res.status_code == 201
    new_dest = add_res.json()
    dest_id = new_dest["id"]

    # 3. Calculate commute from Sunrise PG
    prop_id = "b0000000-0000-0000-0000-000000000001"
    calc_res = client.get(
        f"/api/v1/commute/calculate?property_id={prop_id}&destination_id={dest_id}",
        headers=headers
    )
    assert calc_res.status_code == 200
    calc_data = calc_res.json()
    assert calc_data["status"] in ["AVAILABLE", "UNAVAILABLE"]
    if calc_data["status"] == "AVAILABLE":
        assert calc_data["distance_km"] is not None
        assert calc_data["duration_mins"] is not None
    else:
        assert calc_data["message"] is not None  # Transparent error, no fake numbers

    # 4. Calculate for all destinations of property
    all_calc_res = client.get(f"/api/v1/commute/property/{prop_id}", headers=headers)
    assert all_calc_res.status_code == 200
    assert len(all_calc_res.json()) >= 2

    # 5. Delete destination
    del_res = client.delete(f"/api/v1/commute/destinations/{dest_id}", headers=headers)
    assert del_res.status_code == 200


# ============================================================================
# 3. MOVE-IN READINESS TESTS
# ============================================================================

def test_move_in_status_and_rbac():
    tenant_token = get_token_for("manas@staynest.com")
    tenant_headers = {"Authorization": f"Bearer {tenant_token}"}

    # 1. Get current status
    res = client.get("/api/v1/move-in/status", headers=tenant_headers)
    assert res.status_code == 200
    wf = res.json()
    assert wf is not None
    workflow_id = wf["id"]
    assert wf["status"] in [
        "INITIATED", "KYC_SUBMITTED", "KYC_VERIFIED", "AGREEMENT_SIGNED",
        "DEPOSIT_PAID", "INSPECTION_COMPLETED", "KEY_HANDED_OVER", "MOVE_IN_COMPLETED"
    ]
    assert len(wf["audit_logs"]) > 0

    # 2. RBAC: Tenant attempting to verify own KYC -> 403 Forbidden
    rbac_fail = client.post(
        f"/api/v1/move-in/{workflow_id}/action",
        headers=tenant_headers,
        json={"action": "VERIFY_KYC", "notes": "I verify myself"}
    )
    assert rbac_fail.status_code == 403

    # 3. Invalid FSM transition: Tenant attempting to handover keys before inspection -> 403 or 400
    invalid_action = client.post(
        f"/api/v1/move-in/{workflow_id}/action",
        headers=tenant_headers,
        json={"action": "HANDOVER_KEYS"}
    )
    assert invalid_action.status_code in [400, 403]


def test_move_in_full_workflow_end_to_end():
    db = SessionLocal()
    try:
        # Create dedicated allocation for clean end-to-end flow
        tenant = db.query(User).filter(User.email == "rahul.joshi@staynest.com").first()
        prop = db.query(Property).first()
        bed = db.query(Bed).filter(Bed.status == "AVAILABLE").first()
        if not bed:
            bed = Bed(room_id=prop.buildings[0].floors[0].rooms[0].id, bed_code="Bed Test", monthly_rent=7500.0)
            db.add(bed)
            db.commit()

        alloc = Allocation(
            bed_id=bed.id,
            tenant_id=tenant.id,
            check_in_date=date.today(),
            status="ACTIVE",
            monthly_rent=7500.0
        )
        db.add(alloc)
        db.commit()
        alloc_id = alloc.id
    finally:
        db.close()

    tenant_token = get_token_for("rahul.joshi@staynest.com")
    tenant_headers = {"Authorization": f"Bearer {tenant_token}"}
    warden_token = get_token_for("warden@staynest.com")
    warden_headers = {"Authorization": f"Bearer {warden_token}"}

    # Step 1: Check status -> INITIATED
    s1 = client.get("/api/v1/move-in/status", headers=tenant_headers)
    assert s1.status_code == 200
    wf_id = s1.json()["id"]

    # Step 2: Tenant submits KYC
    s2 = client.post(
        f"/api/v1/move-in/{wf_id}/action",
        headers=tenant_headers,
        json={"action": "SUBMIT_KYC", "notes": "Govt Aadhaar card uploaded"}
    )
    assert s2.status_code == 200
    assert s2.json()["status"] == "KYC_SUBMITTED"

    # Step 3: Warden verifies KYC
    s3 = client.post(
        f"/api/v1/move-in/{wf_id}/action",
        headers=warden_headers,
        json={"action": "VERIFY_KYC", "notes": "Verified against DigiLocker"}
    )
    assert s3.status_code == 200
    assert s3.json()["status"] == "KYC_VERIFIED"
    assert s3.json()["kyc_verified_at"] is not None

    # Step 4: Tenant signs agreement
    s4 = client.post(
        f"/api/v1/move-in/{wf_id}/action",
        headers=tenant_headers,
        json={"action": "SIGN_AGREEMENT", "signature": "Rahul Joshi"}
    )
    assert s4.status_code == 200
    assert s4.json()["status"] == "AGREEMENT_SIGNED"

    # Step 5: Tenant pays deposit
    s5 = client.post(
        f"/api/v1/move-in/{wf_id}/action",
        headers=tenant_headers,
        json={"action": "PAY_DEPOSIT", "payment_id": "TXN-DEP-123"}
    )
    assert s5.status_code == 200
    assert s5.json()["status"] == "DEPOSIT_PAID"

    # Step 6: Warden conducts inspection
    s6 = client.post(
        f"/api/v1/move-in/{wf_id}/action",
        headers=warden_headers,
        json={
            "action": "COMPLETE_INSPECTION",
            "inspection_passed": True,
            "inspection_notes": "Mattress, desk, cupboard in flawless condition"
        }
    )
    assert s6.status_code == 200
    assert s6.json()["status"] == "INSPECTION_COMPLETED"

    # Step 7: Warden hands over keys
    s7 = client.post(
        f"/api/v1/move-in/{wf_id}/action",
        headers=warden_headers,
        json={"action": "HANDOVER_KEYS", "key_number": "KEY-101-B"}
    )
    assert s7.status_code == 200
    assert s7.json()["status"] == "KEY_HANDED_OVER"
    assert s7.json()["key_number"] == "KEY-101-B"

    # Step 8: Finalize move-in
    s8 = client.post(
        f"/api/v1/move-in/{wf_id}/action",
        headers=warden_headers,
        json={"action": "COMPLETE_MOVE_IN"}
    )
    assert s8.status_code == 200
    final_data = s8.json()
    assert final_data["status"] == "MOVE_IN_COMPLETED"
    # Verify complete audit history
    assert len(final_data["audit_logs"]) >= 7


# ============================================================================
# 4. PREDICTIVE MAINTENANCE TESTS
# ============================================================================

def test_predictive_maintenance_risk_engine():
    token = get_token_for("manas@staynest.com")
    headers = {"Authorization": f"Bearer {token}"}
    owner_token = get_token_for("owner@staynest.com")
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    prop_id = "b0000000-0000-0000-0000-000000000001"

    # 1. Fetch statistical risk evaluation
    res = client.get(f"/api/v1/maintenance/risk/{prop_id}", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "overall_risk_score" in data
    assert "category_risks" in data
    assert len(data["category_risks"]) >= 3
    # Check that PLUMBING risk reflects existing complaints
    plumbing_risk = next((c for c in data["category_risks"] if c["category"] == "PLUMBING"), None)
    assert plumbing_risk is not None
    assert plumbing_risk["complaint_count_90d"] >= 1
    assert len(plumbing_risk["reasons"]) > 0

    # 2. Staff/Owner creates a preventive maintenance action
    create_res = client.post(
        "/api/v1/maintenance/actions",
        headers=owner_headers,
        json={
            "property_id": prop_id,
            "category": "ELECTRICAL",
            "title": "Main Distribution Panel Thermography",
            "description": "Infrared thermal scan of circuit breakers to detect loose contacts.",
            "risk_level": "MEDIUM",
            "scheduled_date": str(date(2026, 9, 25)),
            "cost_estimate": 2500.0
        }
    )
    assert create_res.status_code == 201
    action = create_res.json()
    action_id = action["id"]
    assert action["status"] == "SCHEDULED"

    # 3. Update action to COMPLETED
    patch_res = client.patch(
        f"/api/v1/maintenance/actions/{action_id}",
        headers=owner_headers,
        json={"status": "COMPLETED", "notes": "Thermal scan completed, no hotspots found."}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "COMPLETED"
    assert patch_res.json()["completed_at"] is not None


# ============================================================================
# 5. STAYNEST TRUST SCORE TESTS
# ============================================================================

def test_trust_score_calculation_and_recalculation():
    token = get_token_for("manas@staynest.com")
    headers = {"Authorization": f"Bearer {token}"}

    prop_id = "b0000000-0000-0000-0000-000000000001"

    # 1. Fetch trust score
    res = client.get(f"/api/v1/trust/property/{prop_id}", headers=headers)
    assert res.status_code == 200
    trust_data = res.json()
    assert 0 <= trust_data["overall_trust_score"] <= 100
    assert len(trust_data["submetrics"]) == 5
    # Verify submetrics
    names = [s["name"] for s in trust_data["submetrics"]]
    assert "Verification Integrity" in names
    assert "Inventory & Availability Accuracy" in names
    assert "Complaint Resolution & SLA" in names
    assert "Transaction & Payment Reliability" in names
    assert "Resident Experience & Longevity" in names

    # 2. Recalculate trust score
    recalc_res = client.post(f"/api/v1/trust/property/{prop_id}/recalculate", headers=headers)
    assert recalc_res.status_code == 200
    recalc_data = recalc_res.json()
    assert recalc_data["overall_trust_score"] == trust_data["overall_trust_score"]
    assert recalc_data["last_calculated_at"] is not None
