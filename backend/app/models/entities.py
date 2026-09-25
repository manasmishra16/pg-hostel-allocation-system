import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Date, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(String(50), nullable=False, default="TENANT", index=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owned_properties = relationship("Property", back_populates="owner", cascade="all, delete-orphan")
    allocations = relationship("Allocation", back_populates="tenant")
    roommate_preference = relationship("RoommatePreference", back_populates="tenant", uselist=False, cascade="all, delete-orphan")
    stay_preference = relationship("UserStayPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    destinations = relationship("UserDestination", back_populates="user", cascade="all, delete-orphan")
    move_in_workflows = relationship("MoveInWorkflow", back_populates="tenant", foreign_keys="[MoveInWorkflow.tenant_id]")
    complaints = relationship("Complaint", back_populates="tenant")
    invoices = relationship("Invoice", back_populates="tenant")
    payments = relationship("Payment", back_populates="tenant")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")


class Property(Base):
    __tablename__ = "properties"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    property_type = Column(String(50), nullable=False, default="PG")  # 'PG', 'HOSTEL', 'CO_LIVING'
    gender_type = Column(String(50), nullable=False, default="COED")  # 'BOYS', 'GIRLS', 'COED'
    description = Column(Text, nullable=True)
    address = Column(String(500), nullable=False)
    locality = Column(String(100), nullable=False, index=True)
    city = Column(String(100), nullable=False, default="Bengaluru", index=True)
    state = Column(String(100), nullable=False, default="Karnataka")
    pincode = Column(String(20), nullable=False, default="560034")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    starting_rent = Column(Float, nullable=False, default=8000.0)
    rating = Column(Float, default=4.8)
    total_reviews = Column(Integer, default=0)
    is_verified = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    cover_image = Column(String(500), nullable=True)
    images_json = Column(JSON, default=list)
    rules_json = Column(JSON, default=list)
    amenities_json = Column(JSON, default=list)
    contact_phone = Column(String(50), nullable=True)
    contact_email = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="owned_properties")
    buildings = relationship("Building", back_populates="property", cascade="all, delete-orphan")
    notices = relationship("Notice", back_populates="property", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="property")
    trust_metric = relationship("PropertyTrustMetric", back_populates="property", uselist=False, cascade="all, delete-orphan")
    preventive_actions = relationship("PreventiveMaintenanceAction", back_populates="property", cascade="all, delete-orphan")


class Building(Base):
    __tablename__ = "buildings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    property_id = Column(String(36), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    total_floors = Column(Integer, default=3, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    property = relationship("Property", back_populates="buildings")
    floors = relationship("Floor", back_populates="building", cascade="all, delete-orphan")


class Floor(Base):
    __tablename__ = "floors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    building_id = Column(String(36), ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    floor_number = Column(Integer, nullable=False)
    floor_name = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    building = relationship("Building", back_populates="floors")
    rooms = relationship("Room", back_populates="floor", cascade="all, delete-orphan")


class Room(Base):
    __tablename__ = "rooms"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    floor_id = Column(String(36), ForeignKey("floors.id", ondelete="CASCADE"), nullable=False)
    room_number = Column(String(50), nullable=False)
    room_type = Column(String(50), nullable=False, default="DOUBLE")  # 'SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR_SHARING'
    capacity = Column(Integer, nullable=False, default=2)
    base_rent = Column(Float, nullable=False, default=8000.0)
    is_active = Column(Boolean, default=True, nullable=False)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    floor = relationship("Floor", back_populates="rooms")
    beds = relationship("Bed", back_populates="room", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="room")


class Bed(Base):
    __tablename__ = "beds"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    room_id = Column(String(36), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    bed_code = Column(String(20), nullable=False)  # e.g., 'Bed A', 'Bed B'
    monthly_rent = Column(Float, nullable=False, default=8000.0)
    status = Column(String(50), nullable=False, default="AVAILABLE")  # 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE'
    current_tenant_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    room = relationship("Room", back_populates="beds")
    current_tenant = relationship("User", foreign_keys=[current_tenant_id])
    allocations = relationship("Allocation", back_populates="bed")


class Allocation(Base):
    __tablename__ = "allocations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    bed_id = Column(String(36), ForeignKey("beds.id", ondelete="RESTRICT"), nullable=False)
    tenant_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    check_in_date = Column(Date, nullable=False, default=date.today)
    check_out_date = Column(Date, nullable=True)
    status = Column(String(50), nullable=False, default="ACTIVE")  # 'ACTIVE', 'COMPLETED', 'CANCELLED'
    monthly_rent = Column(Float, nullable=False, default=8000.0)
    deposit_amount = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    bed = relationship("Bed", back_populates="allocations")
    tenant = relationship("User", back_populates="allocations")
    move_in_workflow = relationship("MoveInWorkflow", back_populates="allocation", uselist=False, cascade="all, delete-orphan")


class RoommatePreference(Base):
    __tablename__ = "roommate_preferences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    course = Column(String(100), default="Computer Science")
    year_of_study = Column(Integer, default=3)
    sleep_schedule = Column(String(50), default="night_owl")  # 'early_bird', 'night_owl', 'flexible'
    noise_tolerance = Column(Integer, default=3)  # 1 to 5
    cleanliness = Column(Integer, default=4)      # 1 to 5
    smoking = Column(String(20), default="non_smoker")
    drinking = Column(String(20), default="non_drinker")
    food_preference = Column(String(50), default="vegetarian")
    study_habits = Column(String(50), default="focused_silent")
    bio = Column(Text, nullable=True)
    hobbies = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    tenant = relationship("User", back_populates="roommate_preference")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_number = Column(String(100), unique=True, nullable=False, index=True)
    tenant_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    property_id = Column(String(36), ForeignKey("properties.id", ondelete="SET NULL"), nullable=True)
    billing_period = Column(String(50), nullable=False)  # e.g., 'September 2026'
    due_date = Column(Date, nullable=False)
    subtotal = Column(Float, nullable=False)
    electricity_charges = Column(Float, default=0.0)
    maintenance_charges = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="PENDING", nullable=False)  # 'PENDING', 'PAID', 'OVERDUE'
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    tenant = relationship("User", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="invoice", uselist=False)


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_id = Column(String(36), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    description = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)

    invoice = relationship("Invoice", back_populates="items")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_id = Column(String(36), ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True)
    tenant_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(50), default="PENDING", nullable=False)  # 'PENDING', 'COMPLETED', 'FAILED'
    payment_date = Column(Date, nullable=True)
    payment_method = Column(String(50), default="RAZORPAY")
    transaction_id = Column(String(255), unique=True, nullable=True)
    razorpay_order_id = Column(String(255), nullable=True)
    razorpay_payment_id = Column(String(255), nullable=True)
    razorpay_signature = Column(String(255), nullable=True)
    receipt_url = Column(String(500), nullable=True)
    month_year = Column(String(50), nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    tenant = relationship("User", back_populates="payments")
    invoice = relationship("Invoice", back_populates="payment")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    property_id = Column(String(36), ForeignKey("properties.id", ondelete="CASCADE"), nullable=True)
    room_id = Column(String(36), ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), default="OTHER", nullable=False)  # 'PLUMBING', 'ELECTRICAL', 'WIFI', 'CLEANING', etc.
    priority = Column(String(50), default="MEDIUM", nullable=False) # 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
    status = Column(String(50), default="PENDING", nullable=False)   # 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'
    image_url = Column(String(500), nullable=True)
    ai_summary = Column(Text, nullable=True)
    suggested_department = Column(String(100), nullable=True)
    escalated = Column(Boolean, default=False)
    escalated_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    tenant = relationship("User", back_populates="complaints")
    property = relationship("Property", back_populates="complaints")
    room = relationship("Room", back_populates="complaints")
    assignments = relationship("ComplaintAssignment", back_populates="complaint", cascade="all, delete-orphan")


class ComplaintAssignment(Base):
    __tablename__ = "complaint_assignments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    staff_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

    complaint = relationship("Complaint", back_populates="assignments")
    staff = relationship("User")


class Notice(Base):
    __tablename__ = "notices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    property_id = Column(String(36), ForeignKey("properties.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(50), default="NORMAL", nullable=False)
    author_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_pinned = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    property = relationship("Property", back_populates="notices")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(String(500), nullable=False)
    type = Column(String(50), default="INFO", nullable=False)
    is_read = Column(Boolean, default=False)
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(50), default="GOVT_ID", nullable=False)
    title = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    verification_status = Column(String(50), default="PENDING", nullable=False)
    is_private = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="documents")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(100), nullable=True)
    metadata_json = Column(JSON, default=dict)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


# ============================================================================
# REAL FEATURES EXTENSION MODELS
# ============================================================================

class UserStayPreference(Base):
    __tablename__ = "user_stay_preferences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    max_budget = Column(Float, nullable=False, default=15000.0)
    preferred_localities = Column(JSON, default=list)  # e.g. ["Koramangala", "HSR Layout", "Indiranagar"]
    preferred_gender_type = Column(String(50), default="ANY")  # 'COED', 'BOYS', 'GIRLS', 'ANY'
    preferred_room_types = Column(JSON, default=list)  # e.g. ["SINGLE", "DOUBLE", "FOUR_SHARING"]
    required_amenities = Column(JSON, default=list)  # e.g. ["High-speed WiFi", "Nutritious Food", "Air Conditioning"]
    lifestyle_preferences = Column(JSON, default=dict)  # e.g. {"food": "vegetarian", "cleanliness": 5, "quiet_hours": True}
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="stay_preference")


class UserDestination(Base):
    __tablename__ = "user_destinations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)  # e.g. 'Embassy TechVillage' or 'Christ University'
    destination_type = Column(String(50), default="WORK")  # 'WORK', 'COLLEGE', 'OTHER'
    address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    travel_mode = Column(String(50), default="DRIVING")  # 'DRIVING', 'TRANSIT', 'TWO_WHEELER', 'WALKING'
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="destinations")


class CommuteCache(Base):
    __tablename__ = "commute_cache"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    dest_lat = Column(Float, nullable=False)
    dest_lng = Column(Float, nullable=False)
    travel_mode = Column(String(50), default="DRIVING", nullable=False)
    distance_km = Column(Float, nullable=False)
    duration_mins = Column(Float, nullable=False)
    provider = Column(String(50), default="OSRM", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)


class MoveInWorkflow(Base):
    __tablename__ = "move_in_workflows"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    allocation_id = Column(String(36), ForeignKey("allocations.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    tenant_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    property_id = Column(String(36), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    bed_id = Column(String(36), ForeignKey("beds.id", ondelete="CASCADE"), nullable=False)
    
    # State Machine: INITIATED -> KYC_SUBMITTED -> KYC_VERIFIED -> AGREEMENT_SIGNED -> DEPOSIT_PAID -> INSPECTION_COMPLETED -> KEY_HANDED_OVER -> MOVE_IN_COMPLETED
    status = Column(String(50), default="INITIATED", nullable=False, index=True)
    
    # KYC
    kyc_document_id = Column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    kyc_verified_at = Column(DateTime, nullable=True)
    kyc_verified_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Agreement
    agreement_signed_at = Column(DateTime, nullable=True)
    agreement_document_url = Column(String(500), nullable=True)
    agreement_signature = Column(String(255), nullable=True)
    
    # Deposit & Payment
    deposit_paid_at = Column(DateTime, nullable=True)
    deposit_payment_id = Column(String(36), ForeignKey("payments.id", ondelete="SET NULL"), nullable=True)
    
    # Inspection
    inspection_notes = Column(Text, nullable=True)
    inspection_passed = Column(Boolean, nullable=True)
    inspection_completed_at = Column(DateTime, nullable=True)
    inspected_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Key Handover
    key_number = Column(String(50), nullable=True)
    key_handed_over_at = Column(DateTime, nullable=True)
    key_handed_over_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    allocation = relationship("Allocation", back_populates="move_in_workflow")
    tenant = relationship("User", foreign_keys=[tenant_id])
    property = relationship("Property")
    bed = relationship("Bed")
    audit_logs = relationship("MoveInAuditLog", back_populates="workflow", cascade="all, delete-orphan", order_by="MoveInAuditLog.timestamp.desc()")


class MoveInAuditLog(Base):
    __tablename__ = "move_in_audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workflow_id = Column(String(36), ForeignKey("move_in_workflows.id", ondelete="CASCADE"), nullable=False, index=True)
    from_status = Column(String(50), nullable=False)
    to_status = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    performed_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    workflow = relationship("MoveInWorkflow", back_populates="audit_logs")
    performer = relationship("User", foreign_keys=[performed_by])


class PreventiveMaintenanceAction(Base):
    __tablename__ = "preventive_maintenance_actions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    property_id = Column(String(36), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    room_id = Column(String(36), ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True, index=True)
    category = Column(String(50), default="PLUMBING", nullable=False)  # 'PLUMBING', 'ELECTRICAL', 'HVAC', 'APPLIANCE', 'STRUCTURE', 'WIFI'
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    risk_level = Column(String(50), default="MEDIUM", nullable=False)  # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    status = Column(String(50), default="RECOMMENDED", nullable=False)  # 'RECOMMENDED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED'
    scheduled_date = Column(Date, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    assigned_staff_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    cost_estimate = Column(Float, nullable=True)
    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    property = relationship("Property", back_populates="preventive_actions")
    room = relationship("Room")
    assigned_staff = relationship("User", foreign_keys=[assigned_staff_id])
    creator = relationship("User", foreign_keys=[created_by])


class PropertyTrustMetric(Base):
    __tablename__ = "property_trust_metrics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    property_id = Column(String(36), ForeignKey("properties.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    overall_trust_score = Column(Float, nullable=False, default=85.0)  # 0 to 100
    verification_score = Column(Float, nullable=False, default=20.0)    # 0 to 20
    availability_accuracy_score = Column(Float, nullable=False, default=20.0)  # 0 to 20
    complaint_resolution_score = Column(Float, nullable=False, default=15.0)   # 0 to 20
    payment_reliability_score = Column(Float, nullable=False, default=15.0)    # 0 to 20
    resident_experience_score = Column(Float, nullable=False, default=15.0)    # 0 to 20
    breakdown_json = Column(JSON, default=dict)
    last_calculated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    property = relationship("Property", back_populates="trust_metric")
