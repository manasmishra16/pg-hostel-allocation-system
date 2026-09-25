-- ============================================================================
-- STAYNEST SEED DATA: Bengaluru-First Production Dataset
-- ============================================================================

-- Fixed UUID constants for seamless cross-table relational integrity
-- Password for all test accounts is: StayNest@2026 (bcrypt hashed)
-- Hash: $2b$12$K1r.mZ8lK3hP9o9F4HqyUeWz0YvJ7L4W2kC/d7j1G6.b3mFp8lG9S (or standard mock hash)

DO $$ 
DECLARE
    uid_admin UUID := 'a0000000-0000-0000-0000-000000000001';
    uid_owner UUID := 'a0000000-0000-0000-0000-000000000002';
    uid_warden UUID := 'a0000000-0000-0000-0000-000000000003';
    uid_staff UUID := 'a0000000-0000-0000-0000-000000000004';
    uid_manas UUID := 'a0000000-0000-0000-0000-000000000005';
    uid_rahul UUID := 'a0000000-0000-0000-0000-000000000006';
    uid_priya UUID := 'a0000000-0000-0000-0000-000000000007';
    uid_arjun UUID := 'a0000000-0000-0000-0000-000000000008';
    uid_sneha UUID := 'a0000000-0000-0000-0000-000000000009';

    pid_sunrise UUID := 'b0000000-0000-0000-0000-000000000001';
    pid_elite UUID := 'b0000000-0000-0000-0000-000000000002';
    pid_greenvalley UUID := 'b0000000-0000-0000-0000-000000000003';

    bid_a UUID := 'c0000000-0000-0000-0000-000000000001';
    bid_b UUID := 'c0000000-0000-0000-0000-000000000002';
    
    fid_a1 UUID := 'd0000000-0000-0000-0000-000000000001';
    fid_a2 UUID := 'd0000000-0000-0000-0000-000000000002';

    rid_101 UUID := 'e0000000-0000-0000-0000-000000000001';
    rid_102 UUID := 'e0000000-0000-0000-0000-000000000002';

    bid_101a UUID := 'f0000000-0000-0000-0000-000000000001';
    bid_101b UUID := 'f0000000-0000-0000-0000-000000000002';
    bid_101c UUID := 'f0000000-0000-0000-0000-000000000003';
    bid_101d UUID := 'f0000000-0000-0000-0000-000000000004';

    inv_1 UUID := '11111111-1111-1111-1111-111111111111';
    pw_hash VARCHAR := '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'; -- 'password123'
BEGIN

    -- 1. USERS
    INSERT INTO users (id, email, hashed_password, full_name, phone, role, avatar_url) VALUES
    (uid_admin, 'admin@staynest.com', pw_hash, 'StayNest Admin', '+91 98765 00001', 'SUPER_ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    (uid_owner, 'owner@staynest.com', pw_hash, 'Vikramaditya Roy', '+91 98765 43210', 'PROPERTY_OWNER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
    (uid_warden, 'warden@staynest.com', pw_hash, 'Rajesh Sharma', '+91 98765 11111', 'WARDEN', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
    (uid_staff, 'staff@staynest.com', pw_hash, 'Anita Gupta', '+91 98765 22222', 'STAFF', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
    (uid_manas, 'manas@staynest.com', pw_hash, 'Manas Mishra', '+91 98765 33333', 'TENANT', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
    (uid_rahul, 'rahul.joshi@staynest.com', pw_hash, 'Rahul Joshi', '+91 98765 44444', 'TENANT', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'),
    (uid_priya, 'priya.singh@staynest.com', pw_hash, 'Priya Singh', '+91 98765 55555', 'TENANT', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'),
    (uid_arjun, 'arjun.reddy@staynest.com', pw_hash, 'Arjun Reddy', '+91 98765 66666', 'TENANT', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'),
    (uid_sneha, 'sneha.gupta@staynest.com', pw_hash, 'Sneha Gupta', '+91 98765 77777', 'TENANT', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150')
    ON CONFLICT (id) DO NOTHING;

    -- 2. PROPERTIES (Sunrise PG, Elite Hostel, Green Valley PG)
    INSERT INTO properties (id, owner_id, name, slug, property_type, gender_type, description, address, locality, city, starting_rent, rating, total_reviews, is_verified, is_featured, cover_image, images_json, contact_phone, contact_email) VALUES
    (pid_sunrise, uid_owner, 'Sunrise PG', 'sunrise-pg-koramangala', 'PG', 'COED', 
     'A premium PG with modern amenities, comfortable rooms, home-cooked nutritious food and a homely environment. Located 5 minutes away from Sony World Junction, perfect for working professionals and students.',
     '#42, 4th Cross, 5th Block, Near Sony Signal, Koramangala', 'Koramangala', 'Bengaluru', 8000.00, 4.8, 120, TRUE, TRUE,
     'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
     '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200", "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200"]'::jsonb,
     '+91 98765 43210', 'sunrise@staynest.com'),
    
    (pid_elite, uid_owner, 'Elite Hostel', 'elite-hostel-hsr-layout', 'HOSTEL', 'BOYS',
     'Spacious boys hostel featuring ergonomic study desks, high-speed fiber internet, gym facilities, and freshly prepared North/South Indian meals. Walkable distance to BDA complex.',
     '#12, 14th Main, Sector 4, HSR Layout', 'HSR Layout', 'Bengaluru', 6500.00, 4.6, 88, TRUE, TRUE,
     'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200',
     '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"]'::jsonb,
     '+91 98765 43210', 'elite@staynest.com'),

    (pid_greenvalley, uid_owner, 'Green Valley PG', 'green-valley-pg-indiranagar', 'PG', 'GIRLS',
     'Luxury boutique PG in central Indiranagar with 24/7 CCTV surveillance, biometric security, air-conditioned designer rooms, and a rooftop recreation cafe.',
     '#88, 100 Feet Road, Near Metro Station, Indiranagar', 'Indiranagar', 'Bengaluru', 9000.00, 4.7, 76, TRUE, TRUE,
     'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
     '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200"]'::jsonb,
     '+91 98765 43210', 'greenvalley@staynest.com')
    ON CONFLICT (id) DO NOTHING;

    -- 3. BUILDINGS & FLOORS
    INSERT INTO buildings (id, property_id, name, total_floors) VALUES
    (bid_a, pid_sunrise, 'Block A', 3),
    (bid_b, pid_sunrise, 'Block B', 3)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO floors (id, building_id, floor_number, floor_name) VALUES
    (fid_a1, bid_a, 1, 'First Floor'),
    (fid_a2, bid_a, 2, 'Second Floor')
    ON CONFLICT (id) DO NOTHING;

    -- 4. ROOMS
    INSERT INTO rooms (id, floor_id, room_number, room_type, capacity, base_rent, is_active, image_url) VALUES
    (rid_101, fid_a1, 'A-101', 'FOUR_SHARING', 4, 8000.00, TRUE, 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800'),
    (rid_102, fid_a1, 'A-102', 'DOUBLE', 2, 9500.00, TRUE, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800')
    ON CONFLICT (id) DO NOTHING;

    -- 5. BEDS (Bed A, Bed B, Bed C, Bed D for Room A-101)
    INSERT INTO beds (id, room_id, bed_code, monthly_rent, status, current_tenant_id) VALUES
    (bid_101a, rid_101, 'Bed A', 8000.00, 'OCCUPIED', uid_manas),
    (bid_101b, rid_101, 'Bed B', 8000.00, 'OCCUPIED', uid_rahul),
    (bid_101c, rid_101, 'Bed C', 8000.00, 'AVAILABLE', NULL),
    (bid_101d, rid_101, 'Bed D', 8000.00, 'AVAILABLE', NULL)
    ON CONFLICT (id) DO NOTHING;

    -- 6. ALLOCATIONS
    INSERT INTO allocations (id, bed_id, tenant_id, check_in_date, status, monthly_rent, deposit_amount) VALUES
    ('20000000-0000-0000-0000-000000000001', bid_101a, uid_manas, '2026-08-01', 'ACTIVE', 8000.00, 16000.00),
    ('20000000-0000-0000-0000-000000000002', bid_101b, uid_rahul, '2026-08-01', 'ACTIVE', 8000.00, 16000.00)
    ON CONFLICT (id) DO NOTHING;

    -- 7. ROOMMATE PREFERENCES (Manas & Rahul compatibility)
    INSERT INTO roommate_preferences (id, tenant_id, course, year_of_study, sleep_schedule, noise_tolerance, cleanliness, smoking, drinking, food_preference, study_habits, bio, hobbies) VALUES
    ('30000000-0000-0000-0000-000000000001', uid_manas, 'Computer Science', 3, 'night_owl', 2, 5, 'non_smoker', 'non_drinker', 'vegetarian', 'focused_silent', 'Software engineering student, quiet and organized.', 'Coding, Chess, Badminton'),
    ('30000000-0000-0000-0000-000000000002', uid_rahul, 'Computer Science', 3, 'night_owl', 3, 4, 'non_smoker', 'non_drinker', 'vegetarian', 'focused_silent', 'Tech enthusiast, friendly and respectful of quiet hours.', 'Guitar, Coding, Gym')
    ON CONFLICT (id) DO NOTHING;

    -- 8. INVOICES & ITEMS
    INSERT INTO invoices (id, invoice_number, tenant_id, property_id, billing_period, due_date, subtotal, electricity_charges, maintenance_charges, total_amount, status) VALUES
    (inv_1, 'INV-2026-091', uid_manas, pid_sunrise, 'September 2026', '2026-09-15', 8000.00, 650.00, 300.00, 8950.00, 'PENDING')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO invoice_items (invoice_id, description, amount) VALUES
    (inv_1, 'Monthly Bed Rent (Bed A - Room A-101)', 8000.00),
    (inv_1, 'Electricity Submeter Charges (65 Units)', 650.00),
    (inv_1, 'Common Area & High-Speed WiFi Maintenance', 300.00)
    ON CONFLICT DO NOTHING;

    -- 9. PAYMENTS (Past cleared payments for Manas)
    INSERT INTO payments (id, tenant_id, amount, status, payment_date, transaction_id, razorpay_payment_id, month_year, description) VALUES
    ('40000000-0000-0000-0000-000000000001', uid_manas, 8000.00, 'COMPLETED', '2026-08-01', 'TXN-2026-AUG', 'pay_aug_123', 'August 2026', 'Rent - August'),
    ('40000000-0000-0000-0000-000000000002', uid_manas, 8000.00, 'COMPLETED', '2026-07-01', 'TXN-2026-JUL', 'pay_jul_456', 'July 2026', 'Rent - July'),
    ('40000000-0000-0000-0000-000000000003', uid_manas, 8000.00, 'COMPLETED', '2026-06-01', 'TXN-2026-JUN', 'pay_jun_789', 'June 2026', 'Rent - June')
    ON CONFLICT (id) DO NOTHING;

    -- 10. COMPLAINTS (Matching Mockup 09)
    INSERT INTO complaints (id, tenant_id, property_id, room_id, title, description, category, priority, status, created_at) VALUES
    ('50000000-0000-0000-0000-000000000001', uid_manas, pid_sunrise, rid_101, 'Water leakage in bathroom', 'Water leakage from the main shower mixer tap causing water accumulation on floor.', 'PLUMBING', 'HIGH', 'PENDING', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('50000000-0000-0000-0000-000000000002', uid_manas, pid_sunrise, rid_101, 'Fan not working', 'Ceiling fan regulator is stuck at speed 1 and makes humming noise.', 'ELECTRICAL', 'MEDIUM', 'IN_PROGRESS', CURRENT_TIMESTAMP - INTERVAL '3 days'),
    ('50000000-0000-0000-0000-000000000003', uid_manas, pid_sunrise, rid_101, 'WiFi issue in room', '5GHz Wi-Fi signal drops frequently in evening hours.', 'WIFI', 'LOW', 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '7 days'),
    ('50000000-0000-0000-0000-000000000004', uid_manas, pid_sunrise, rid_101, 'Light not working', 'Study table warm LED tube light fused.', 'ELECTRICAL', 'LOW', 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '10 days')
    ON CONFLICT (id) DO NOTHING;

    -- 11. NOTICES (Matching Mockup 04)
    INSERT INTO notices (id, property_id, title, description, priority, is_pinned) VALUES
    ('60000000-0000-0000-0000-000000000001', pid_sunrise, 'Mess menu updated', 'New wholesome seasonal dinner menu including weekend special biryani & paneer dishes has been posted.', 'HIGH', TRUE),
    ('60000000-0000-0000-0000-000000000002', pid_sunrise, 'Water supply maintenance', 'Overhead water tank deep sanitization scheduled for Thursday 10 AM to 1 PM. Please store essential water.', 'MEDIUM', FALSE),
    ('60000000-0000-0000-0000-000000000003', pid_sunrise, 'Festival holiday announcement', 'Special dinner buffet will be arranged on Diwali evening. Residents can invite registered guests.', 'NORMAL', FALSE)
    ON CONFLICT (id) DO NOTHING;

    -- 12. NOTIFICATIONS
    INSERT INTO notifications (id, user_id, title, message, type) VALUES
    ('70000000-0000-0000-0000-000000000001', uid_manas, 'Rent Due Reminder', 'Your September rent invoice INV-2026-091 of ₹8,950 is due on 15 Sep 2026.', 'PAYMENT'),
    ('70000000-0000-0000-0000-000000000002', uid_manas, 'Complaint Assigned', 'Plumber Ramu has been assigned to your complaint "Water leakage in bathroom".', 'COMPLAINT'),
    ('70000000-0000-0000-0000-000000000003', uid_manas, 'New Notice Published', 'Mess committee has published an updated weekly dinner menu.', 'NOTICE')
    ON CONFLICT (id) DO NOTHING;

END $$;
