from contextlib import asynccontextmanager
from datetime import date, datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models.entities import (
    User, Property, Building, Floor, Room, Bed, Allocation, RoommatePreference,
    Invoice, InvoiceItem, Payment, Complaint, Notice, Notification,
    UserStayPreference, UserDestination, MoveInWorkflow, MoveInAuditLog,
    PreventiveMaintenanceAction, PropertyTrustMetric
)
from app.api.v1.auth import router as auth_router
from app.api.v1.properties import router as properties_router
from app.api.v1.rooms import router as rooms_router
from app.api.v1.allocations import router as allocations_router
from app.api.v1.roommates import router as roommates_router
from app.api.v1.invoices import router as invoices_router
from app.api.v1.payments import router as payments_router
from app.api.v1.complaints import router as complaints_router
from app.api.v1.notices import router as notices_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.documents import router as documents_router
from app.api.v1.staymatch import router as staymatch_router
from app.api.v1.commute import router as commute_router
from app.api.v1.move_in import router as move_in_router
from app.api.v1.maintenance import router as maintenance_router
from app.api.v1.trust import router as trust_router
from app.core.security import get_password_hash


def seed_initial_data(db):
    if db.query(User).first():
        return  # Already seeded

    # Seed core users
    admin = User(
        id="a0000000-0000-0000-0000-000000000001",
        email="admin@staynest.com",
        hashed_password=get_password_hash("password123"),
        full_name="StayNest Admin",
        phone="+91 98765 00001",
        role="SUPER_ADMIN",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    )
    owner = User(
        id="a0000000-0000-0000-0000-000000000002",
        email="owner@staynest.com",
        hashed_password=get_password_hash("password123"),
        full_name="Vikramaditya Roy",
        phone="+91 98765 43210",
        role="PROPERTY_OWNER",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    )
    warden = User(
        id="a0000000-0000-0000-0000-000000000003",
        email="warden@staynest.com",
        hashed_password=get_password_hash("password123"),
        full_name="Rajesh Sharma",
        phone="+91 98765 11111",
        role="WARDEN",
        avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    )
    staff = User(
        id="a0000000-0000-0000-0000-000000000004",
        email="staff@staynest.com",
        hashed_password=get_password_hash("password123"),
        full_name="Anita Gupta",
        phone="+91 98765 22222",
        role="STAFF",
        avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    )
    manas = User(
        id="a0000000-0000-0000-0000-000000000005",
        email="manas@staynest.com",
        hashed_password=get_password_hash("password123"),
        full_name="Manas Mishra",
        phone="+91 98765 33333",
        role="TENANT",
        avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
    )
    rahul = User(
        id="a0000000-0000-0000-0000-000000000006",
        email="rahul.joshi@staynest.com",
        hashed_password=get_password_hash("password123"),
        full_name="Rahul Joshi",
        phone="+91 98765 44444",
        role="TENANT",
        avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"
    )

    db.add_all([admin, owner, warden, staff, manas, rahul])
    db.commit()

    # Seed Properties
    prop1 = Property(
        id="b0000000-0000-0000-0000-000000000001",
        owner_id=owner.id,
        name="Sunrise PG",
        slug="sunrise-pg-koramangala",
        property_type="PG",
        gender_type="COED",
        description="A premium PG with modern amenities, comfortable rooms, home food and a homely environment. Perfect for students and working professionals.",
        address="#42, 4th Cross, 5th Block, Near Sony Signal, Koramangala",
        locality="Koramangala",
        city="Bengaluru",
        state="Karnataka",
        pincode="560034",
        starting_rent=8000.0,
        rating=4.8,
        total_reviews=120,
        is_verified=True,
        is_featured=True,
        cover_image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
        images_json=[
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
            "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200"
        ],
        contact_phone="+91 98765 43210",
        contact_email="sunrise@staynest.com",
        latitude=12.9352,
        longitude=77.6245,
        amenities_json=["High-speed WiFi", "Nutritious Food", "Air Conditioning", "Daily Housekeeping", "Power Backup"]
    )
    prop2 = Property(
        id="b0000000-0000-0000-0000-000000000002",
        owner_id=owner.id,
        name="Elite Hostel",
        slug="elite-hostel-hsr-layout",
        property_type="HOSTEL",
        gender_type="BOYS",
        description="Spacious boys hostel featuring ergonomic study desks, high-speed fiber internet, and freshly prepared North/South Indian meals.",
        address="#12, 14th Main, Sector 4, HSR Layout",
        locality="HSR Layout",
        city="Bengaluru",
        state="Karnataka",
        pincode="560102",
        starting_rent=6500.0,
        rating=4.6,
        total_reviews=88,
        is_verified=True,
        is_featured=True,
        cover_image="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200",
        images_json=["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200"],
        contact_phone="+91 98765 43210",
        contact_email="elite@staynest.com",
        latitude=12.9121,
        longitude=77.6446,
        amenities_json=["High-speed WiFi", "Nutritious Food", "Daily Housekeeping", "Power Backup", "Gym"]
    )
    prop3 = Property(
        id="b0000000-0000-0000-0000-000000000003",
        owner_id=owner.id,
        name="Green Valley PG",
        slug="green-valley-pg-indiranagar",
        property_type="PG",
        gender_type="GIRLS",
        description="Luxury boutique PG in central Indiranagar with 24/7 CCTV surveillance, biometric security, air-conditioned rooms, and rooftop cafe.",
        address="#88, 100 Feet Road, Near Metro Station, Indiranagar",
        locality="Indiranagar",
        city="Bengaluru",
        state="Karnataka",
        pincode="560038",
        starting_rent=9000.0,
        rating=4.7,
        total_reviews=76,
        is_verified=True,
        is_featured=True,
        cover_image="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
        images_json=["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200"],
        contact_phone="+91 98765 43210",
        contact_email="greenvalley@staynest.com",
        latitude=12.9784,
        longitude=77.6408,
        amenities_json=["High-speed WiFi", "Nutritious Food", "Air Conditioning", "Daily Housekeeping", "24/7 CCTV Security", "Power Backup"]
    )
    db.add_all([prop1, prop2, prop3])
    db.commit()

    # Seed Building, Floor, Room, Beds
    bldg = Building(
        id="c0000000-0000-0000-0000-000000000001",
        property_id=prop1.id,
        name="Block A",
        total_floors=3
    )
    db.add(bldg)
    db.commit()

    flr = Floor(
        id="d0000000-0000-0000-0000-000000000001",
        building_id=bldg.id,
        floor_number=1,
        floor_name="First Floor"
    )
    db.add(flr)
    db.commit()

    room = Room(
        id="e0000000-0000-0000-0000-000000000001",
        floor_id=flr.id,
        room_number="A-101",
        room_type="FOUR_SHARING",
        capacity=4,
        base_rent=8000.0,
        image_url="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"
    )
    db.add(room)
    db.commit()

    bed_a = Bed(id="f0000000-0000-0000-0000-000000000001", room_id=room.id, bed_code="Bed A", monthly_rent=8000.0, status="OCCUPIED", current_tenant_id=manas.id)
    bed_b = Bed(id="f0000000-0000-0000-0000-000000000002", room_id=room.id, bed_code="Bed B", monthly_rent=8000.0, status="OCCUPIED", current_tenant_id=rahul.id)
    bed_c = Bed(id="f0000000-0000-0000-0000-000000000003", room_id=room.id, bed_code="Bed C", monthly_rent=8000.0, status="AVAILABLE", current_tenant_id=None)
    bed_d = Bed(id="f0000000-0000-0000-0000-000000000004", room_id=room.id, bed_code="Bed D", monthly_rent=8000.0, status="AVAILABLE", current_tenant_id=None)
    db.add_all([bed_a, bed_b, bed_c, bed_d])
    db.commit()

    # Allocations
    alloc1 = Allocation(
        id="20000000-0000-0000-0000-000000000001",
        bed_id=bed_a.id,
        tenant_id=manas.id,
        check_in_date=date(2026, 8, 1),
        status="ACTIVE",
        monthly_rent=8000.0,
        deposit_amount=16000.0
    )
    alloc2 = Allocation(
        id="20000000-0000-0000-0000-000000000002",
        bed_id=bed_b.id,
        tenant_id=rahul.id,
        check_in_date=date(2026, 8, 1),
        status="ACTIVE",
        monthly_rent=8000.0,
        deposit_amount=16000.0
    )
    db.add_all([alloc1, alloc2])
    db.commit()

    # Preferences
    pref1 = RoommatePreference(
        tenant_id=manas.id,
        course="Computer Science",
        year_of_study=3,
        sleep_schedule="night_owl",
        noise_tolerance=2,
        cleanliness=5,
        smoking="non_smoker",
        drinking="non_drinker",
        food_preference="vegetarian",
        study_habits="focused_silent",
        bio="Software engineer & computer science senior. Respectful and tidy.",
        hobbies="Coding, Chess, Badminton"
    )
    pref2 = RoommatePreference(
        tenant_id=rahul.id,
        course="Computer Science",
        year_of_study=3,
        sleep_schedule="night_owl",
        noise_tolerance=3,
        cleanliness=4,
        smoking="non_smoker",
        drinking="non_drinker",
        food_preference="vegetarian",
        study_habits="focused_silent",
        bio="Tech enthusiast, friendly and respectful of quiet study hours.",
        hobbies="Guitar, Coding, Gym"
    )
    db.add_all([pref1, pref2])
    db.commit()

    # Invoices & Items
    inv1 = Invoice(
        id="11111111-1111-1111-1111-111111111111",
        invoice_number="INV-2026-091",
        tenant_id=manas.id,
        property_id=prop1.id,
        billing_period="September 2026",
        due_date=date(2026, 9, 15),
        subtotal=8000.0,
        electricity_charges=650.0,
        maintenance_charges=300.0,
        total_amount=8950.0,
        status="PENDING"
    )
    db.add(inv1)
    db.commit()

    item1 = InvoiceItem(invoice_id=inv1.id, description="Rent (Bed A - Room A-101)", amount=8000.0)
    item2 = InvoiceItem(invoice_id=inv1.id, description="Electricity Submeter (65 Units)", amount=650.0)
    item3 = InvoiceItem(invoice_id=inv1.id, description="Maintenance & High-Speed WiFi", amount=300.0)
    db.add_all([item1, item2, item3])
    db.commit()

    # Payments
    pay1 = Payment(
        id="40000000-0000-0000-0000-000000000001",
        tenant_id=manas.id,
        amount=8000.0,
        status="COMPLETED",
        payment_date=date(2026, 8, 1),
        transaction_id="TXN-2026-AUG",
        month_year="August 2026",
        description="Rent - August"
    )
    pay2 = Payment(
        id="40000000-0000-0000-0000-000000000002",
        tenant_id=manas.id,
        amount=8000.0,
        status="COMPLETED",
        payment_date=date(2026, 7, 1),
        transaction_id="TXN-2026-JUL",
        month_year="July 2026",
        description="Rent - July"
    )
    pay3 = Payment(
        id="40000000-0000-0000-0000-000000000003",
        tenant_id=manas.id,
        amount=8000.0,
        status="COMPLETED",
        payment_date=date(2026, 6, 1),
        transaction_id="TXN-2026-JUN",
        month_year="June 2026",
        description="Rent - June"
    )
    db.add_all([pay1, pay2, pay3])
    db.commit()

    # Complaints (Matching Mockup 09)
    c1 = Complaint(
        tenant_id=manas.id,
        property_id=prop1.id,
        room_id=room.id,
        title="Water leakage in bathroom",
        description="Water leakage from bathroom pipe causing water accumulation on floor.",
        category="PLUMBING",
        priority="HIGH",
        status="PENDING",
        suggested_department="Maintenance"
    )
    c2 = Complaint(
        tenant_id=manas.id,
        property_id=prop1.id,
        room_id=room.id,
        title="Fan not working",
        description="Ceiling fan regulator stuck at low speed with humming sound.",
        category="ELECTRICAL",
        priority="MEDIUM",
        status="IN_PROGRESS",
        suggested_department="Electrical"
    )
    c3 = Complaint(
        tenant_id=manas.id,
        property_id=prop1.id,
        room_id=room.id,
        title="WiFi issue",
        description="5GHz WiFi router signal drop in common room.",
        category="WIFI",
        priority="LOW",
        status="RESOLVED",
        suggested_department="Networking"
    )
    c4 = Complaint(
        tenant_id=manas.id,
        property_id=prop1.id,
        room_id=room.id,
        title="Light not working",
        description="Study lamp tube replacement needed.",
        category="ELECTRICAL",
        priority="LOW",
        status="RESOLVED",
        suggested_department="Electrical"
    )
    db.add_all([c1, c2, c3, c4])
    db.commit()

    # Notices (Matching Mockup 04)
    n1 = Notice(
        property_id=prop1.id,
        title="Mess menu updated",
        description="New nutritious seasonal dinner menu has been published on the dining notice board.",
        priority="HIGH",
        is_pinned=True
    )
    n2 = Notice(
        property_id=prop1.id,
        title="Water supply maintenance",
        description="Overhead water tank deep sanitization scheduled for Thursday 10 AM to 1 PM.",
        priority="MEDIUM"
    )
    n3 = Notice(
        property_id=prop1.id,
        title="Festival holiday announcement",
        description="Special dinner buffet and celebration arrangements for the upcoming festival.",
        priority="NORMAL"
    )
    db.add_all([n1, n2, n3])
    db.commit()

    # Notifications
    notif1 = Notification(
        user_id=manas.id,
        title="Next Rent Due",
        message="Your September rent invoice INV-2026-091 of ₹8,950 is due on 15 Sep 2026.",
        type="PAYMENT"
    )
    notif2 = Notification(
        user_id=manas.id,
        title="Complaint Assigned",
        message="Staff has been assigned to investigate your bathroom plumbing complaint.",
        type="COMPLAINT"
    )
    db.add_all([notif1, notif2])
    db.commit()

    # Seed User Stay Preference
    pref_stay = UserStayPreference(
        user_id=manas.id,
        max_budget=12000.0,
        preferred_localities=["Koramangala", "HSR Layout"],
        preferred_gender_type="COED",
        preferred_room_types=["DOUBLE", "FOUR_SHARING"],
        required_amenities=["High-speed WiFi", "Nutritious Food", "Air Conditioning", "Daily Housekeeping"],
        lifestyle_preferences={"food": "vegetarian", "cleanliness": 5, "quiet_hours": True}
    )
    db.add(pref_stay)
    db.commit()

    # Seed User Destinations
    dest1 = UserDestination(
        user_id=manas.id,
        name="Christ University (Central Campus)",
        destination_type="COLLEGE",
        address="Hosur Road, Bhavani Nagar, S.G. Palya, Bengaluru 560029",
        latitude=12.9344,
        longitude=77.6060,
        travel_mode="DRIVING",
        is_primary=True
    )
    dest2 = UserDestination(
        user_id=manas.id,
        name="Embassy TechVillage (Tech Hub)",
        destination_type="WORK",
        address="Outer Ring Road, Devarabisanahalli, Bellandur, Bengaluru 560103",
        latitude=12.9288,
        longitude=77.6917,
        travel_mode="DRIVING",
        is_primary=False
    )
    db.add_all([dest1, dest2])
    db.commit()

    # Seed MoveInWorkflow for alloc1 (Manas in Bed A)
    wf1 = MoveInWorkflow(
        id="90000000-0000-0000-0000-000000000001",
        allocation_id=alloc1.id,
        tenant_id=manas.id,
        property_id=prop1.id,
        bed_id=bed_a.id,
        status="AGREEMENT_SIGNED",
        agreement_signed_at=datetime(2026, 8, 1, 10, 0),
        agreement_signature="Manas Mishra",
        agreement_document_url=f"/documents/agreement_{alloc1.id}.pdf",
        kyc_verified_at=datetime(2026, 7, 30, 15, 30),
        kyc_verified_by=warden.id
    )
    db.add(wf1)
    db.commit()

    audit1 = MoveInAuditLog(
        workflow_id=wf1.id,
        from_status="NONE",
        to_status="INITIATED",
        action="INITIALIZE_WORKFLOW",
        performed_by=manas.id,
        notes="Move-in onboarding initiated upon bed allocation.",
        timestamp=datetime(2026, 7, 28, 11, 0)
    )
    audit2 = MoveInAuditLog(
        workflow_id=wf1.id,
        from_status="INITIATED",
        to_status="KYC_SUBMITTED",
        action="SUBMIT_KYC",
        performed_by=manas.id,
        notes="Government Aadhaar card and university enrollment certificate submitted.",
        timestamp=datetime(2026, 7, 29, 14, 0)
    )
    audit3 = MoveInAuditLog(
        workflow_id=wf1.id,
        from_status="KYC_SUBMITTED",
        to_status="KYC_VERIFIED",
        action="VERIFY_KYC",
        performed_by=warden.id,
        notes="Tenant KYC and identity verified against official database by Rajesh Sharma.",
        timestamp=datetime(2026, 7, 30, 15, 30)
    )
    audit4 = MoveInAuditLog(
        workflow_id=wf1.id,
        from_status="KYC_VERIFIED",
        to_status="AGREEMENT_SIGNED",
        action="SIGN_AGREEMENT",
        performed_by=manas.id,
        notes="Standard 11-month electronic PG tenancy agreement signed.",
        timestamp=datetime(2026, 8, 1, 10, 0)
    )
    db.add_all([audit1, audit2, audit3, audit4])
    db.commit()

    # Seed Preventive Maintenance Action for Room A-101 (due to water leakage complaint)
    p_action = PreventiveMaintenanceAction(
        id="80000000-0000-0000-0000-000000000001",
        property_id=prop1.id,
        room_id=room.id,
        category="PLUMBING",
        title="Bathroom Pressure Regulator & Seal Replacement",
        description="Preventive replacement of water inlet seal and gasket in Room A-101 bathroom to eliminate recurring joint leakage.",
        risk_level="HIGH",
        status="SCHEDULED",
        scheduled_date=date(2026, 9, 20),
        assigned_staff_id=staff.id,
        cost_estimate=1200.0,
        created_by=warden.id
    )
    db.add(p_action)
    db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is created
    Base.metadata.create_all(bind=engine)
    # Seed initial test data
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"Production Full-Stack SaaS API for PG & Hostel Allocation - {settings.TAGLINE}",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api/v1
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(properties_router, prefix=api_prefix)
app.include_router(rooms_router, prefix=api_prefix)
app.include_router(allocations_router, prefix=api_prefix)
app.include_router(roommates_router, prefix=api_prefix)
app.include_router(invoices_router, prefix=api_prefix)
app.include_router(payments_router, prefix=api_prefix)
app.include_router(complaints_router, prefix=api_prefix)
app.include_router(notices_router, prefix=api_prefix)
app.include_router(notifications_router, prefix=api_prefix)
app.include_router(analytics_router, prefix=api_prefix)
app.include_router(documents_router, prefix=api_prefix)
app.include_router(staymatch_router, prefix=api_prefix)
app.include_router(commute_router, prefix=api_prefix)
app.include_router(move_in_router, prefix=api_prefix)
app.include_router(maintenance_router, prefix=api_prefix)
app.include_router(trust_router, prefix=api_prefix)


@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "healthy"
    }


@app.get("/health")
def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
