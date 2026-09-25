-- ============================================================================
-- STAYNEST DATABASE MIGRATION 002: REAL FEATURES IMPLEMENTATION
-- PostgreSQL 15+ compatible DDL
-- Features: StayMatch, Commute Intelligence, Move-In Readiness, Predictive Maintenance, Trust Score
-- ============================================================================

-- 1. ALTER PROPERTIES: Add amenities and coordinate columns if not present
ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities_json JSONB DEFAULT '[]'::jsonb;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7);

-- 2. STAYMATCH: User Stay Preferences
CREATE TABLE IF NOT EXISTS user_stay_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    max_budget NUMERIC(10, 2) NOT NULL DEFAULT 15000.00,
    preferred_localities JSONB DEFAULT '[]'::jsonb,
    preferred_gender_type VARCHAR(50) NOT NULL DEFAULT 'ANY',
    preferred_room_types JSONB DEFAULT '[]'::jsonb,
    required_amenities JSONB DEFAULT '[]'::jsonb,
    lifestyle_preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_stay_pref_user_id ON user_stay_preferences(user_id);

-- 3. COMMUTE INTELLIGENCE: User Saved Destinations & Route Cache
CREATE TABLE IF NOT EXISTS user_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    destination_type VARCHAR(50) NOT NULL DEFAULT 'WORK',
    address VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    travel_mode VARCHAR(50) NOT NULL DEFAULT 'DRIVING',
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_destinations_user_id ON user_destinations(user_id);

CREATE TABLE IF NOT EXISTS commute_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_lat DECIMAL(10, 7) NOT NULL,
    origin_lng DECIMAL(10, 7) NOT NULL,
    dest_lat DECIMAL(10, 7) NOT NULL,
    dest_lng DECIMAL(10, 7) NOT NULL,
    travel_mode VARCHAR(50) NOT NULL DEFAULT 'DRIVING',
    distance_km NUMERIC(6, 2) NOT NULL,
    duration_mins NUMERIC(6, 1) NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'OSRM',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commute_cache_coords ON commute_cache(origin_lat, origin_lng, dest_lat, dest_lng, travel_mode);

-- 4. MOVE-IN READINESS: Finite State Machine Workflow & Audit Log
CREATE TABLE IF NOT EXISTS move_in_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    allocation_id UUID NOT NULL UNIQUE REFERENCES allocations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    bed_id UUID NOT NULL REFERENCES beds(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'INITIATED',
    kyc_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    kyc_verified_at TIMESTAMP WITH TIME ZONE,
    kyc_verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    agreement_signed_at TIMESTAMP WITH TIME ZONE,
    agreement_document_url VARCHAR(500),
    agreement_signature VARCHAR(255),
    deposit_paid_at TIMESTAMP WITH TIME ZONE,
    deposit_payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    inspection_notes TEXT,
    inspection_passed BOOLEAN,
    inspection_completed_at TIMESTAMP WITH TIME ZONE,
    inspected_by UUID REFERENCES users(id) ON DELETE SET NULL,
    key_number VARCHAR(50),
    key_handed_over_at TIMESTAMP WITH TIME ZONE,
    key_handed_over_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_move_in_workflows_tenant ON move_in_workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_move_in_workflows_property ON move_in_workflows(property_id);
CREATE INDEX IF NOT EXISTS idx_move_in_workflows_status ON move_in_workflows(status);

CREATE TABLE IF NOT EXISTS move_in_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES move_in_workflows(id) ON DELETE CASCADE,
    from_status VARCHAR(50) NOT NULL,
    to_status VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_move_in_audit_workflow ON move_in_audit_logs(workflow_id);

-- 5. PREDICTIVE MAINTENANCE: Preventive Actions & Risk Records
CREATE TABLE IF NOT EXISTS preventive_maintenance_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'PLUMBING',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    risk_level VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'RECOMMENDED',
    scheduled_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
    cost_estimate NUMERIC(10, 2),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_preventive_maint_property ON preventive_maintenance_actions(property_id);
CREATE INDEX IF NOT EXISTS idx_preventive_maint_room ON preventive_maintenance_actions(room_id);
CREATE INDEX IF NOT EXISTS idx_preventive_maint_status ON preventive_maintenance_actions(status);

-- 6. STAYNEST TRUST SCORE: Real Computed Trust Metrics
CREATE TABLE IF NOT EXISTS property_trust_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
    overall_trust_score NUMERIC(5, 2) NOT NULL DEFAULT 85.00,
    verification_score NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
    availability_accuracy_score NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
    complaint_resolution_score NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
    payment_reliability_score NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
    resident_experience_score NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
    breakdown_json JSONB DEFAULT '{}'::jsonb,
    last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_trust_property ON property_trust_metrics(property_id);
