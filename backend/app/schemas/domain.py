from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict


# --- USER & AUTH SCHEMAS ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str = "TENANT"


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- BED & ROOM SCHEMAS ---
class BuildingCreate(BaseModel):
    property_id: str
    name: str
    total_floors: int = 3


class FloorCreate(BaseModel):
    building_id: str
    floor_number: int
    floor_name: str


class RoomCreate(BaseModel):
    floor_id: str
    room_number: str
    room_type: str = "DOUBLE"
    capacity: int = 2
    base_rent: float = 8000.0
    image_url: Optional[str] = None


class BedCreate(BaseModel):
    room_id: str
    bed_code: str
    monthly_rent: float = 8000.0
    status: str = "AVAILABLE"


class BedStatusUpdate(BaseModel):
    status: str  # 'AVAILABLE', 'MAINTENANCE', 'RESERVED'


class BedResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    room_id: str
    bed_code: str
    monthly_rent: float
    status: str
    current_tenant_id: Optional[str] = None
    current_tenant_name: Optional[str] = None


class RoomResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    floor_id: str
    room_number: str
    room_type: str
    capacity: int
    base_rent: float
    is_active: bool
    image_url: Optional[str] = None
    beds: List[BedResponse] = []
    occupied_count: int = 0
    available_count: int = 0


class FloorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    building_id: str
    floor_number: int
    floor_name: str
    rooms: List[RoomResponse] = []


class BuildingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    property_id: str
    name: str
    total_floors: int
    floors: List[FloorResponse] = []


# --- PROPERTY SCHEMAS ---
class PropertyBase(BaseModel):
    name: str
    property_type: str = "PG"
    gender_type: str = "COED"
    description: Optional[str] = None
    address: str
    locality: str
    city: str = "Bengaluru"
    state: str = "Karnataka"
    pincode: str = "560034"
    starting_rent: float = 8000.0
    cover_image: Optional[str] = None
    images_json: List[str] = []
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None


class PropertyCreate(PropertyBase):
    starting_price: Optional[float] = None
    amenities: Optional[List[str]] = []
    images: Optional[List[str]] = None
    total_floors: Optional[int] = 3
    rooms_per_floor: Optional[int] = 4
    beds_per_room: Optional[int] = 2


class PropertyResponse(PropertyBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    owner_id: str
    rating: float = 4.8
    total_reviews: int = 0
    is_verified: bool = True
    is_featured: bool = False
    created_at: datetime
    rules_json: Optional[List[str]] = []
    amenities: Optional[List[str]] = []
    images: Optional[List[str]] = []
    total_beds: int = 0
    occupied_beds: int = 0
    buildings: List[BuildingResponse] = []


# --- ALLOCATION SCHEMAS ---
class AllocationCreate(BaseModel):
    bed_id: str
    tenant_id: str
    check_in_date: Optional[date] = None
    monthly_rent: Optional[float] = None
    deposit_amount: Optional[float] = 0.0
    notes: Optional[str] = None


class AllocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    bed_id: str
    tenant_id: str
    check_in_date: date
    check_out_date: Optional[date] = None
    status: str
    monthly_rent: float
    deposit_amount: float
    notes: Optional[str] = None
    created_at: datetime
    bed_code: Optional[str] = None
    room_number: Optional[str] = None
    property_name: Optional[str] = None
    tenant_name: Optional[str] = None


# --- ROOMMATE SCHEMAS ---
class RoommatePreferenceBase(BaseModel):
    course: Optional[str] = "Computer Science"
    year_of_study: Optional[int] = 3
    sleep_schedule: Optional[str] = "night_owl"
    noise_tolerance: Optional[int] = 3
    cleanliness: Optional[int] = 4
    smoking: Optional[str] = "non_smoker"
    drinking: Optional[str] = "non_drinker"
    food_preference: Optional[str] = "vegetarian"
    study_habits: Optional[str] = "focused_silent"
    bio: Optional[str] = None
    hobbies: Optional[str] = None


class RoommatePreferenceResponse(RoommatePreferenceBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    created_at: datetime


class RoommateMatchCard(BaseModel):
    tenant_id: str
    full_name: str
    avatar_url: Optional[str] = None
    course: str
    year_of_study: int
    overall_compatibility: int
    academic_compatibility: int
    lifestyle_compatibility: int
    sleep_compatibility: int
    cleanliness_compatibility: int
    noise_compatibility: int = 85
    match_tag: str
    room_number: Optional[str] = None
    bed_code: Optional[str] = None
    bio: Optional[str] = None
    hobbies: Optional[str] = None


# --- INVOICE & PAYMENT SCHEMAS ---
class InvoiceItemCreate(BaseModel):
    description: str
    amount: float


class InvoiceCreate(BaseModel):
    tenant_id: str
    property_id: Optional[str] = None
    billing_period: str
    due_date: Optional[date] = None
    subtotal: float
    electricity_charges: float = 0.0
    maintenance_charges: float = 0.0
    discount: float = 0.0
    items: List[InvoiceItemCreate] = []


class InvoiceItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    description: str
    amount: float


class InvoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    invoice_number: str
    tenant_id: str
    property_id: Optional[str] = None
    billing_period: str
    due_date: date
    subtotal: float
    electricity_charges: float
    maintenance_charges: float
    total_amount: float
    status: str
    paid_at: Optional[datetime] = None
    created_at: datetime
    items: List[InvoiceItemResponse] = []


class PaymentOrderCreate(BaseModel):
    invoice_id: str
    amount: float


class PaymentOrderResponse(BaseModel):
    order_id: str
    amount: float
    currency: str = "INR"
    key_id: str
    invoice_number: str


class PaymentVerifyRequest(BaseModel):
    invoice_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    invoice_id: Optional[str] = None
    tenant_id: str
    amount: float
    status: str
    payment_date: Optional[date] = None
    payment_method: str
    transaction_id: Optional[str] = None
    month_year: str
    description: Optional[str] = None
    receipt_url: Optional[str] = None
    created_at: datetime


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    document_type: str
    title: str
    file_url: str
    signed_url: Optional[str] = None
    verification_status: str
    is_private: bool
    created_at: datetime


# --- COMPLAINT SCHEMAS ---
class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: str = "OTHER"
    priority: str = "MEDIUM"
    property_id: Optional[str] = None
    room_id: Optional[str] = None
    image_url: Optional[str] = None


class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_staff_id: Optional[str] = None
    notes: Optional[str] = None


class ComplaintResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    property_id: Optional[str] = None
    room_id: Optional[str] = None
    title: str
    description: str
    category: str
    priority: str
    status: str
    image_url: Optional[str] = None
    ai_summary: Optional[str] = None
    suggested_department: Optional[str] = None
    escalated: bool
    created_at: datetime
    resolved_at: Optional[datetime] = None
    tenant_name: Optional[str] = None
    room_number: Optional[str] = None
    staff_name: Optional[str] = None


class AITriageResponse(BaseModel):
    category: str
    priority: str
    department: str
    summary: str


# --- NOTICE & NOTIFICATION SCHEMAS ---
class NoticeCreate(BaseModel):
    property_id: Optional[str] = None
    title: str
    description: str
    priority: str = "NORMAL"
    is_pinned: bool = False


class NoticeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    property_id: Optional[str] = None
    title: str
    description: str
    priority: str
    is_pinned: bool
    is_active: bool
    created_at: datetime


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime


# --- DASHBOARD & ANALYTICS SCHEMAS ---
class DashboardStatsResponse(BaseModel):
    total_properties: int
    total_residents: int
    occupancy_rate: float
    monthly_revenue: float
    pending_complaints: int
    pending_invoices_amount: float
    recent_complaints: List[ComplaintResponse] = []
    recent_notices: List[NoticeResponse] = []


# ============================================================================
# REAL FEATURES SCHEMAS
# ============================================================================

# 1. STAYMATCH SCHEMAS
class UserStayPreferenceUpdate(BaseModel):
    max_budget: Optional[float] = None
    preferred_localities: Optional[List[str]] = None
    preferred_gender_type: Optional[str] = None
    preferred_room_types: Optional[List[str]] = None
    required_amenities: Optional[List[str]] = None
    lifestyle_preferences: Optional[Dict[str, Any]] = None


class UserStayPreferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    max_budget: float
    preferred_localities: List[str] = []
    preferred_gender_type: str
    preferred_room_types: List[str] = []
    required_amenities: List[str] = []
    lifestyle_preferences: Dict[str, Any] = {}
    updated_at: datetime


class StayMatchCategoryScore(BaseModel):
    category: str
    score: float
    max_score: float
    percentage: float
    details: str


class StayMatchScoreResponse(BaseModel):
    property_id: str
    property_name: str
    locality: str
    city: str
    starting_rent: float
    total_score: float  # 0 to 100
    category_scores: List[StayMatchCategoryScore]
    reasons: List[str]


# 2. COMMUTE INTELLIGENCE SCHEMAS
class UserDestinationCreate(BaseModel):
    name: str
    destination_type: str = "WORK"  # 'WORK', 'COLLEGE', 'OTHER'
    address: str
    latitude: float
    longitude: float
    travel_mode: str = "DRIVING"  # 'DRIVING', 'TRANSIT', 'TWO_WHEELER', 'WALKING'
    is_primary: bool = False


class UserDestinationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    destination_type: str
    address: str
    latitude: float
    longitude: float
    travel_mode: str
    is_primary: bool
    created_at: datetime


class CommuteCalculationResponse(BaseModel):
    destination_id: str
    destination_name: str
    property_id: str
    property_name: str
    travel_mode: str
    distance_km: Optional[float] = None
    duration_mins: Optional[float] = None
    provider: str
    is_cached: bool = False
    status: str  # 'AVAILABLE', 'UNAVAILABLE'
    message: Optional[str] = None


# 3. MOVE-IN READINESS SCHEMAS
class MoveInActionRequest(BaseModel):
    action: str  # SUBMIT_KYC, VERIFY_KYC, SIGN_AGREEMENT, PAY_DEPOSIT, COMPLETE_INSPECTION, HANDOVER_KEYS, COMPLETE_MOVE_IN, REJECT
    notes: Optional[str] = None
    document_id: Optional[str] = None
    signature: Optional[str] = None
    payment_id: Optional[str] = None
    inspection_passed: Optional[bool] = None
    inspection_notes: Optional[str] = None
    key_number: Optional[str] = None


class MoveInAuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workflow_id: str
    from_status: str
    to_status: str
    action: str
    performed_by: Optional[str] = None
    performer_name: Optional[str] = None
    notes: Optional[str] = None
    timestamp: datetime


class MoveInWorkflowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    allocation_id: str
    tenant_id: str
    tenant_name: Optional[str] = None
    property_id: str
    property_name: Optional[str] = None
    bed_id: str
    bed_code: Optional[str] = None
    room_number: Optional[str] = None
    status: str
    kyc_document_id: Optional[str] = None
    kyc_verified_at: Optional[datetime] = None
    agreement_signed_at: Optional[datetime] = None
    agreement_document_url: Optional[str] = None
    deposit_paid_at: Optional[datetime] = None
    inspection_notes: Optional[str] = None
    inspection_passed: Optional[bool] = None
    inspection_completed_at: Optional[datetime] = None
    key_number: Optional[str] = None
    key_handed_over_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    audit_logs: List[MoveInAuditLogResponse] = []


# 4. PREDICTIVE MAINTENANCE SCHEMAS
class PreventiveActionCreate(BaseModel):
    property_id: str
    room_id: Optional[str] = None
    category: str = "PLUMBING"
    title: str
    description: str
    risk_level: str = "MEDIUM"
    scheduled_date: Optional[date] = None
    assigned_staff_id: Optional[str] = None
    cost_estimate: Optional[float] = None


class PreventiveActionUpdate(BaseModel):
    status: Optional[str] = None
    scheduled_date: Optional[date] = None
    completed_at: Optional[datetime] = None
    assigned_staff_id: Optional[str] = None
    notes: Optional[str] = None


class PreventiveActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    property_id: str
    room_id: Optional[str] = None
    room_number: Optional[str] = None
    category: str
    title: str
    description: str
    risk_level: str
    status: str
    scheduled_date: Optional[date] = None
    completed_at: Optional[datetime] = None
    assigned_staff_id: Optional[str] = None
    assigned_staff_name: Optional[str] = None
    cost_estimate: Optional[float] = None
    created_at: datetime


class RoomRiskAssessment(BaseModel):
    room_id: str
    room_number: str
    risk_score: float  # 0 to 100
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    complaint_count_90d: int
    primary_category: str
    reasons: List[str]


class CategoryRiskAssessment(BaseModel):
    category: str
    risk_score: float  # 0 to 100
    risk_level: str
    complaint_count_90d: int
    recurring_count: int
    avg_mttr_hours: Optional[float] = None
    reasons: List[str]


class PropertyMaintenanceRiskResponse(BaseModel):
    property_id: str
    property_name: str
    overall_risk_score: float
    overall_risk_level: str
    category_risks: List[CategoryRiskAssessment]
    high_risk_rooms: List[RoomRiskAssessment]
    recommended_actions: List[PreventiveActionResponse] = []
    total_historical_complaints: int


# 5. TRUST SCORE SCHEMAS
class TrustScoreSubmetric(BaseModel):
    name: str
    score: float
    max_score: float
    weight_pct: float
    evidence: str


class PropertyTrustScoreResponse(BaseModel):
    property_id: str
    property_name: str
    overall_trust_score: float  # 0 to 100
    verification_score: float
    availability_accuracy_score: float
    complaint_resolution_score: float
    payment_reliability_score: float
    resident_experience_score: float
    submetrics: List[TrustScoreSubmetric]
    audit_summary: str
    last_calculated_at: datetime

