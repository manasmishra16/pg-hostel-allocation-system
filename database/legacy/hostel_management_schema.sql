-- ============================================================================
-- PostgreSQL Database Schema: PG and Hostel Room Allocation & Complaint System
-- ============================================================================
-- Clean & Production-Ready with Sample Data
-- ============================================================================

-- Drop existing objects (for fresh deployment)
DROP TABLE IF EXISTS complaint_assignments CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS roommate_preferences CASCADE;
DROP TABLE IF EXISTS room_allocations CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing enums
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS complaint_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('student', 'staff', 'admin');
CREATE TYPE complaint_status AS ENUM ('pending', 'in_progress', 'resolved', 'escalated');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users Table: Stores user information (students, staff, admins)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role user_role NOT NULL DEFAULT 'student',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Rooms Table: Stores hostel room information
CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    building VARCHAR(100) NOT NULL,
    floor INT NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    current_occupancy INT NOT NULL DEFAULT 0 CHECK (current_occupancy >= 0 AND current_occupancy <= capacity),
    room_type VARCHAR(50) NOT NULL DEFAULT 'standard',
    rent_amount DECIMAL(10, 2) NOT NULL CHECK (rent_amount > 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rooms_building ON rooms(building);
CREATE INDEX idx_rooms_is_available ON rooms(is_available);
CREATE INDEX idx_rooms_floor ON rooms(floor);

-- Room Allocations Table: Tracks which student is allocated to which room (one-to-one mapping)
CREATE TABLE room_allocations (
    allocation_id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    student_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(student_id, is_active)
);

CREATE INDEX idx_room_allocations_room_id ON room_allocations(room_id);
CREATE INDEX idx_room_allocations_student_id ON room_allocations(student_id);
CREATE INDEX idx_room_allocations_is_active ON room_allocations(is_active);

-- Roommate Preferences Table: Stores roommate preferences for students
CREATE TABLE roommate_preferences (
    preference_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    preferred_course VARCHAR(100),
    preferred_year INT,
    habits_description TEXT,
    smoking_preference VARCHAR(20),
    noise_level_preference VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(student_id)
);

CREATE INDEX idx_roommate_preferences_student_id ON roommate_preferences(student_id);

-- Complaints Table: Main complaints table for hostel issues
CREATE TABLE complaints (
    complaint_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    status complaint_status NOT NULL DEFAULT 'pending',
    escalated BOOLEAN NOT NULL DEFAULT FALSE,
    escalated_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_complaints_student_id ON complaints(student_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);

-- Complaint Assignments Table: Assigns complaints to staff members
CREATE TABLE complaint_assignments (
    assignment_id SERIAL PRIMARY KEY,
    complaint_id INT NOT NULL,
    staff_id INT NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_complaint_assignments_complaint_id ON complaint_assignments(complaint_id);
CREATE INDEX idx_complaint_assignments_staff_id ON complaint_assignments(staff_id);

-- Payments Table: Tracks hostel fee payments
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    status payment_status NOT NULL DEFAULT 'pending',
    payment_date DATE,
    due_date DATE NOT NULL,
    month_year VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);

-- ============================================================================
-- TRIGGERS (for automatic timestamp updates)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_allocations_updated_at BEFORE UPDATE ON room_allocations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roommate_preferences_updated_at BEFORE UPDATE ON roommate_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaint_assignments_updated_at BEFORE UPDATE ON complaint_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA: 50+ RECORDS PER TABLE
-- ============================================================================

-- Insert 50 Students
INSERT INTO users (name, email, password, phone, role, is_active) VALUES
('Aman Kumar', 'aman.kumar@university.edu', 'hashed_pw', '9876543210', 'student', TRUE),
('Priya Singh', 'priya.singh@university.edu', 'hashed_pw', '9876543211', 'student', TRUE),
('Raj Patel', 'raj.patel@university.edu', 'hashed_pw', '9876543212', 'student', TRUE),
('Neha Verma', 'neha.verma@university.edu', 'hashed_pw', '9876543213', 'student', TRUE),
('Vikas Sharma', 'vikas.sharma@university.edu', 'hashed_pw', '9876543214', 'student', TRUE),
('Divya Nair', 'divya.nair@university.edu', 'hashed_pw', '9876543215', 'student', TRUE),
('Arjun Reddy', 'arjun.reddy@university.edu', 'hashed_pw', '9876543216', 'student', TRUE),
('Sneha Gupta', 'sneha.gupta@university.edu', 'hashed_pw', '9876543217', 'student', TRUE),
('Rohan Joshi', 'rohan.joshi@university.edu', 'hashed_pw', '9876543218', 'student', TRUE),
('Anjali Desai', 'anjali.desai@university.edu', 'hashed_pw', '9876543219', 'student', TRUE),
('Karan Singh', 'karan.singh@university.edu', 'hashed_pw', '9876543220', 'student', TRUE),
('Pooja Sharma', 'pooja.sharma@university.edu', 'hashed_pw', '9876543221', 'student', TRUE),
('Nikhil Rao', 'nikhil.rao@university.edu', 'hashed_pw', '9876543222', 'student', TRUE),
('Aisha Khan', 'aisha.khan@university.edu', 'hashed_pw', '9876543223', 'student', TRUE),
('Vikram Patel', 'vikram.patel@university.edu', 'hashed_pw', '9876543224', 'student', TRUE),
('Ritika Verma', 'ritika.verma@university.edu', 'hashed_pw', '9876543225', 'student', TRUE),
('Sameer Kumar', 'sameer.kumar@university.edu', 'hashed_pw', '9876543226', 'student', TRUE),
('Deepika Singh', 'deepika.singh@university.edu', 'hashed_pw', '9876543227', 'student', TRUE),
('Ashok Gupta', 'ashok.gupta@university.edu', 'hashed_pw', '9876543228', 'student', TRUE),
('Shreya Nair', 'shreya.nair@university.edu', 'hashed_pw', '9876543229', 'student', TRUE),
('Manish Reddy', 'manish.reddy@university.edu', 'hashed_pw', '9876543230', 'student', TRUE),
('Isha Patel', 'isha.patel@university.edu', 'hashed_pw', '9876543231', 'student', TRUE),
('Harsh Joshi', 'harsh.joshi@university.edu', 'hashed_pw', '9876543232', 'student', TRUE),
('Nidhi Sharma', 'nidhi.sharma@university.edu', 'hashed_pw', '9876543233', 'student', TRUE),
('Sanjay Kumar', 'sanjay.kumar@university.edu', 'hashed_pw', '9876543234', 'student', TRUE),
('Ananya Singh', 'ananya.singh@university.edu', 'hashed_pw', '9876543235', 'student', TRUE),
('Ravi Rao', 'ravi.rao@university.edu', 'hashed_pw', '9876543236', 'student', TRUE),
('Preeti Gupta', 'preeti.gupta@university.edu', 'hashed_pw', '9876543237', 'student', TRUE),
('Mohit Verma', 'mohit.verma@university.edu', 'hashed_pw', '9876543238', 'student', TRUE),
('Swati Nair', 'swati.nair@university.edu', 'hashed_pw', '9876543239', 'student', TRUE),
('Aryan Singh', 'aryan.singh@university.edu', 'hashed_pw', '9876543240', 'student', TRUE),
('Kavya Patel', 'kavya.patel@university.edu', 'hashed_pw', '9876543241', 'student', TRUE),
('Rahul Joshi', 'rahul.joshi@university.edu', 'hashed_pw', '9876543242', 'student', TRUE),
('Zara Khan', 'zara.khan@university.edu', 'hashed_pw', '9876543243', 'student', TRUE),
('Vikash Reddy', 'vikash.reddy@university.edu', 'hashed_pw', '9876543244', 'student', TRUE),
('Shruti Sharma', 'shruti.sharma@university.edu', 'hashed_pw', '9876543245', 'student', TRUE),
('Chintan Patel', 'chintan.patel@university.edu', 'hashed_pw', '9876543246', 'student', TRUE),
('Meera Nair', 'meera.nair@university.edu', 'hashed_pw', '9876543247', 'student', TRUE),
('Aditya Kumar', 'aditya.kumar@university.edu', 'hashed_pw', '9876543248', 'student', TRUE),
('Ishita Singh', 'ishita.singh@university.edu', 'hashed_pw', '9876543249', 'student', TRUE),
('Vedant Rao', 'vedant.rao@university.edu', 'hashed_pw', '9876543250', 'student', TRUE),
('Tanvi Gupta', 'tanvi.gupta@university.edu', 'hashed_pw', '9876543251', 'student', TRUE),
('Himanshu Joshi', 'himanshu.joshi@university.edu', 'hashed_pw', '9876543252', 'student', TRUE),
('Avni Verma', 'avni.verma@university.edu', 'hashed_pw', '9876543253', 'student', TRUE),
('Sahil Kumar', 'sahil.kumar@university.edu', 'hashed_pw', '9876543254', 'student', TRUE),
('Niya Patel', 'niya.patel@university.edu', 'hashed_pw', '9876543255', 'student', TRUE),
('Yash Singh', 'yash.singh@university.edu', 'hashed_pw', '9876543256', 'student', TRUE),
('Chhavi Nair', 'chhavi.nair@university.edu', 'hashed_pw', '9876543257', 'student', TRUE),
('Amod Reddy', 'amod.reddy@university.edu', 'hashed_pw', '9876543258', 'student', TRUE);

-- Insert 10 Staff Members
INSERT INTO users (name, email, password, phone, role, is_active) VALUES
('Anita Gupta', 'anita.gupta@university.edu', 'hashed_pw', '9876543300', 'staff', TRUE),
('Rajesh Kumar', 'rajesh.kumar@university.edu', 'hashed_pw', '9876543301', 'staff', TRUE),
('Priya Mishra', 'priya.mishra@university.edu', 'hashed_pw', '9876543302', 'staff', TRUE),
('Vikram Singh', 'vikram.singh@university.edu', 'hashed_pw', '9876543303', 'staff', TRUE),
('Riya Nair', 'riya.nair@university.edu', 'hashed_pw', '9876543304', 'staff', TRUE),
('Arun Patel', 'arun.patel@university.edu', 'hashed_pw', '9876543305', 'staff', TRUE),
('Meera Sharma', 'meera.sharma@university.edu', 'hashed_pw', '9876543306', 'staff', TRUE),
('Deepak Verma', 'deepak.verma@university.edu', 'hashed_pw', '9876543307', 'staff', TRUE),
('Neha Joshi', 'neha.joshi@university.edu', 'hashed_pw', '9876543308', 'staff', TRUE),
('Sanjay Rao', 'sanjay.rao@university.edu', 'hashed_pw', '9876543309', 'staff', TRUE);

-- Insert Admin
INSERT INTO users (name, email, password, phone, role, is_active) VALUES
('Admin User', 'admin@university.edu', 'hashed_pw', '9876543400', 'admin', TRUE);

-- Insert 60 Rooms across 4 Buildings
INSERT INTO rooms (room_number, building, floor, capacity, current_occupancy, room_type, rent_amount, is_available) VALUES
('A101', 'Building A', 1, 2, 1, 'double', 5000.00, TRUE),
('A102', 'Building A', 1, 2, 2, 'double', 5000.00, FALSE),
('A103', 'Building A', 1, 1, 1, 'single', 3000.00, FALSE),
('A104', 'Building A', 1, 2, 0, 'double', 5000.00, TRUE),
('A105', 'Building A', 1, 3, 2, 'triple', 7500.00, TRUE),
('A201', 'Building A', 2, 2, 1, 'double', 5000.00, TRUE),
('A202', 'Building A', 2, 1, 1, 'single', 3000.00, FALSE),
('A203', 'Building A', 2, 2, 2, 'double', 5000.00, FALSE),
('A204', 'Building A', 2, 3, 3, 'triple', 7500.00, FALSE),
('A205', 'Building A', 2, 2, 1, 'double', 5000.00, TRUE),
('A301', 'Building A', 3, 2, 0, 'double', 5000.00, TRUE),
('A302', 'Building A', 3, 1, 1, 'single', 3000.00, FALSE),
('A303', 'Building A', 3, 2, 2, 'double', 5000.00, FALSE),
('A304', 'Building A', 3, 3, 2, 'triple', 7500.00, TRUE),
('A305', 'Building A', 3, 2, 1, 'double', 5000.00, TRUE),
('B101', 'Building B', 1, 2, 2, 'double', 5500.00, FALSE),
('B102', 'Building B', 1, 3, 3, 'triple', 8000.00, FALSE),
('B103', 'Building B', 1, 1, 1, 'single', 3500.00, FALSE),
('B104', 'Building B', 1, 2, 1, 'double', 5500.00, TRUE),
('B105', 'Building B', 1, 2, 0, 'double', 5500.00, TRUE),
('B201', 'Building B', 2, 2, 2, 'double', 5500.00, FALSE),
('B202', 'Building B', 2, 1, 0, 'single', 3500.00, TRUE),
('B203', 'Building B', 2, 3, 2, 'triple', 8000.00, TRUE),
('B204', 'Building B', 2, 2, 1, 'double', 5500.00, TRUE),
('B205', 'Building B', 2, 2, 2, 'double', 5500.00, FALSE),
('B301', 'Building B', 3, 2, 1, 'double', 5500.00, TRUE),
('B302', 'Building B', 3, 3, 3, 'triple', 8000.00, FALSE),
('B303', 'Building B', 3, 1, 1, 'single', 3500.00, FALSE),
('B304', 'Building B', 3, 2, 0, 'double', 5500.00, TRUE),
('B305', 'Building B', 3, 2, 1, 'double', 5500.00, TRUE),
('C101', 'Building C', 1, 2, 0, 'double', 6000.00, TRUE),
('C102', 'Building C', 1, 2, 2, 'double', 6000.00, FALSE),
('C103', 'Building C', 1, 1, 1, 'single', 4000.00, FALSE),
('C104', 'Building C', 1, 3, 2, 'triple', 8500.00, TRUE),
('C105', 'Building C', 1, 2, 1, 'double', 6000.00, TRUE),
('C201', 'Building C', 2, 2, 2, 'double', 6000.00, FALSE),
('C202', 'Building C', 2, 1, 0, 'single', 4000.00, TRUE),
('C203', 'Building C', 2, 2, 1, 'double', 6000.00, TRUE),
('C204', 'Building C', 2, 3, 3, 'triple', 8500.00, FALSE),
('C205', 'Building C', 2, 2, 0, 'double', 6000.00, TRUE),
('C301', 'Building C', 3, 2, 1, 'double', 6000.00, TRUE),
('C302', 'Building C', 3, 1, 1, 'single', 4000.00, FALSE),
('C303', 'Building C', 3, 2, 2, 'double', 6000.00, FALSE),
('C304', 'Building C', 3, 3, 2, 'triple', 8500.00, TRUE),
('C305', 'Building C', 3, 2, 1, 'double', 6000.00, TRUE),
('D101', 'Building D', 1, 2, 1, 'double', 5500.00, TRUE),
('D102', 'Building D', 1, 3, 3, 'triple', 8000.00, FALSE),
('D103', 'Building D', 1, 1, 0, 'single', 3500.00, TRUE),
('D104', 'Building D', 1, 2, 2, 'double', 5500.00, FALSE),
('D105', 'Building D', 1, 2, 1, 'double', 5500.00, TRUE),
('D201', 'Building D', 2, 2, 0, 'double', 5500.00, TRUE),
('D202', 'Building D', 2, 1, 1, 'single', 3500.00, FALSE),
('D203', 'Building D', 2, 3, 2, 'triple', 8000.00, TRUE),
('D204', 'Building D', 2, 2, 1, 'double', 5500.00, TRUE),
('D205', 'Building D', 2, 2, 1, 'double', 5500.00, TRUE),
('D301', 'Building D', 3, 2, 2, 'double', 5500.00, FALSE),
('D302', 'Building D', 3, 1, 1, 'single', 3500.00, FALSE);

-- Insert 50 Room Allocations
INSERT INTO room_allocations (room_id, student_id, check_in_date, check_out_date, is_active) VALUES
(1, 1, '2025-08-01', NULL, TRUE),
(2, 2, '2025-08-01', NULL, TRUE),
(3, 3, '2025-08-01', NULL, TRUE),
(5, 4, '2025-08-15', NULL, TRUE),
(6, 5, '2025-09-01', NULL, TRUE),
(7, 6, '2025-09-10', NULL, TRUE),
(9, 7, '2025-07-15', NULL, TRUE),
(10, 8, '2025-07-20', NULL, TRUE),
(11, 9, '2025-08-05', NULL, TRUE),
(12, 10, '2025-08-10', NULL, TRUE),
(13, 11, '2025-08-15', NULL, TRUE),
(14, 12, '2025-08-20', NULL, TRUE),
(15, 13, '2025-08-25', NULL, TRUE),
(17, 14, '2025-09-01', NULL, TRUE),
(18, 15, '2025-09-05', NULL, TRUE),
(19, 16, '2025-09-10', NULL, TRUE),
(20, 17, '2025-09-15', NULL, TRUE),
(21, 18, '2025-07-01', NULL, TRUE),
(23, 19, '2025-07-05', NULL, TRUE),
(24, 20, '2025-07-10', NULL, TRUE),
(25, 21, '2025-08-01', NULL, TRUE),
(26, 22, '2025-08-02', NULL, TRUE),
(27, 23, '2025-08-03', NULL, TRUE),
(28, 24, '2025-08-04', NULL, TRUE),
(29, 25, '2025-08-05', NULL, TRUE),
(31, 26, '2025-08-06', NULL, TRUE),
(32, 27, '2025-08-07', NULL, TRUE),
(33, 28, '2025-08-08', NULL, TRUE),
(34, 29, '2025-08-09', NULL, TRUE),
(35, 30, '2025-08-10', NULL, TRUE),
(36, 31, '2025-08-11', NULL, TRUE),
(37, 32, '2025-08-12', NULL, TRUE),
(38, 33, '2025-08-13', NULL, TRUE),
(39, 34, '2025-08-14', NULL, TRUE),
(40, 35, '2025-08-15', NULL, TRUE),
(41, 36, '2025-08-16', NULL, TRUE),
(42, 37, '2025-08-17', NULL, TRUE),
(43, 38, '2025-08-18', NULL, TRUE),
(44, 39, '2025-08-19', NULL, TRUE),
(45, 40, '2025-08-20', NULL, TRUE),
(46, 41, '2025-08-21', NULL, TRUE),
(47, 42, '2025-08-22', NULL, TRUE),
(48, 43, '2025-08-23', NULL, TRUE),
(49, 44, '2025-08-24', NULL, TRUE),
(50, 45, '2025-08-25', NULL, TRUE),
(51, 46, '2025-08-26', NULL, TRUE),
(52, 47, '2025-08-27', NULL, TRUE),
(53, 48, '2025-08-28', NULL, TRUE),
(54, 49, '2025-08-29', NULL, TRUE),
(55, 50, '2025-08-30', NULL, TRUE);

-- Insert 50 Roommate Preferences
INSERT INTO roommate_preferences (student_id, preferred_course, preferred_year, habits_description, smoking_preference, noise_level_preference) VALUES
(1, 'Computer Science', 2, 'Early riser, clean and organized', 'non-smoker', 'quiet'),
(2, 'Computer Science', 2, 'Studious, likes quiet environment', 'non-smoker', 'quiet'),
(3, 'Electronics', 1, 'Social, likes group activities', 'no_preference', 'moderate'),
(4, 'Mechanical Engineering', 3, 'Fitness enthusiast, busy schedule', 'non-smoker', 'active'),
(5, 'Civil Engineering', 2, 'Night owl, creative hobbies', 'smoker', 'moderate'),
(6, 'Computer Science', 3, 'Quiet type, loves books', 'non-smoker', 'quiet'),
(7, 'IT', 1, 'Gaming enthusiast, night person', 'no_preference', 'active'),
(8, 'Electronics', 2, 'Sports person, morning exercise', 'non-smoker', 'moderate'),
(9, 'Mechanical', 1, 'Organized, punctual', 'non-smoker', 'quiet'),
(10, 'CSE', 2, 'Talkative, outgoing', 'smoker', 'active'),
(11, 'ECE', 3, 'Music lover, creative', 'no_preference', 'moderate'),
(12, 'Civil', 2, 'Research oriented', 'non-smoker', 'quiet'),
(13, 'ME', 1, 'Party guy, social butterfly', 'smoker', 'active'),
(14, 'CSE', 2, 'Gym enthusiast', 'non-smoker', 'moderate'),
(15, 'IT', 3, 'Introverted, homebody', 'non-smoker', 'quiet'),
(16, 'ECE', 1, 'Movie buff', 'no_preference', 'moderate'),
(17, 'Mechanical', 2, 'Reading fanatic', 'non-smoker', 'quiet'),
(18, 'Civil', 3, 'Travel enthusiast', 'smoker', 'active'),
(19, 'CSE', 1, 'Coding geek', 'non-smoker', 'quiet'),
(20, 'IT', 2, 'Fitness trainer', 'non-smoker', 'active'),
(21, 'Electronics', 2, 'Quiet studious', 'non-smoker', 'quiet'),
(22, 'Mechanical', 3, 'Artistic person', 'smoker', 'moderate'),
(23, 'Civil', 1, 'Adventure seeker', 'no_preference', 'active'),
(24, 'CSE', 2, 'Corporate ambitious', 'non-smoker', 'moderate'),
(25, 'IT', 3, 'Music producer', 'smoker', 'moderate'),
(26, 'Electronics', 1, 'Lab rat', 'non-smoker', 'quiet'),
(27, 'Mechanical', 2, 'Organized planner', 'non-smoker', 'quiet'),
(28, 'Civil', 3, 'Environmental conscious', 'smoker', 'moderate'),
(29, 'CSE', 1, 'Blockchain developer', 'non-smoker', 'quiet'),
(30, 'IT', 2, 'Yoga practitioner', 'non-smoker', 'quiet'),
(31, 'Electronics', 2, 'Photography hobbyist', 'no_preference', 'moderate'),
(32, 'Mechanical', 3, 'Chef in making', 'smoker', 'active'),
(33, 'Civil', 1, 'Philosopher wannabe', 'non-smoker', 'quiet'),
(34, 'CSE', 2, 'AI enthusiast', 'non-smoker', 'moderate'),
(35, 'IT', 3, 'Fashion blogger', 'smoker', 'active'),
(36, 'Electronics', 1, 'Electronics tinkerer', 'non-smoker', 'quiet'),
(37, 'Mechanical', 2, 'CAD expert', 'non-smoker', 'quiet'),
(38, 'Civil', 3, 'Site engineer', 'smoker', 'moderate'),
(39, 'CSE', 1, 'Web developer', 'non-smoker', 'quiet'),
(40, 'IT', 2, 'Database analyst', 'non-smoker', 'moderate'),
(41, 'Electronics', 2, 'Circuit designer', 'no_preference', 'quiet'),
(42, 'Mechanical', 3, 'Manufacturing interest', 'smoker', 'active'),
(43, 'Civil', 1, 'Sustainability focused', 'non-smoker', 'quiet'),
(44, 'CSE', 2, 'Mobile app dev', 'non-smoker', 'moderate'),
(45, 'IT', 3, 'Data scientist', 'smoker', 'quiet'),
(46, 'Electronics', 1, 'Communication engineer', 'non-smoker', 'quiet'),
(47, 'Mechanical', 2, 'Automation engineer', 'non-smoker', 'moderate'),
(48, 'Civil', 3, 'Structural analyst', 'smoker', 'quiet'),
(49, 'CSE', 1, 'Cloud architect', 'non-smoker', 'moderate'),
(50, 'IT', 2, 'Security enthusiast', 'non-smoker', 'quiet');

-- Insert 50 Complaints
INSERT INTO complaints (student_id, title, description, image_url, status, escalated, created_at) VALUES
(1, 'Broken Window', 'Window in room cracked', 'https://example.com/1.jpg', 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(2, 'Plumbing Issue', 'Water leakage from ceiling', 'https://example.com/2.jpg', 'in_progress', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(3, 'Electrical Problem', 'Fan not working', NULL, 'resolved', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(4, 'Noise Disturbance', 'Neighbors making excessive noise', NULL, 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '4 days'),
(5, 'Maintenance Request', 'AC filter needs cleaning', NULL, 'escalated', TRUE, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(6, 'Door Lock Issue', 'Door lock broken', 'https://example.com/6.jpg', 'in_progress', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(7, 'Water Shortage', 'No water supply', NULL, 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(8, 'Bed Problem', 'Bed frame is broken', 'https://example.com/8.jpg', 'resolved', FALSE, CURRENT_TIMESTAMP - INTERVAL '3 hours'),
(9, 'Light Bulb', 'Bulb not working', NULL, 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '6 days'),
(10, 'Shelf Damage', 'Shelf came off wall', 'https://example.com/10.jpg', 'in_progress', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(11, 'WiFi Issue', 'No internet connectivity', NULL, 'resolved', FALSE, CURRENT_TIMESTAMP - INTERVAL '12 hours'),
(12, 'Paint Peeling', 'Paint peeling from walls', 'https://example.com/12.jpg', 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '7 days'),
(13, 'Floor Damage', 'Floor tile broken', 'https://example.com/13.jpg', 'escalated', TRUE, CURRENT_TIMESTAMP - INTERVAL '6 days'),
(14, 'Window Latch', 'Window latch not working', NULL, 'in_progress', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(15, 'Desk Problem', 'Desk drawer stuck', 'https://example.com/15.jpg', 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(16, 'Ceiling Stain', 'Water stain on ceiling', 'https://example.com/16.jpg', 'resolved', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(17, 'Ventilation Issue', 'Fan not ventilating properly', NULL, 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(18, 'Mirror Damage', 'Mirror is cracked', 'https://example.com/18.jpg', 'in_progress', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(19, 'Socket Problem', 'Electrical socket not working', 'https://example.com/19.jpg', 'resolved', FALSE, CURRENT_TIMESTAMP - INTERVAL '8 hours'),
(20, 'Door Hinge', 'Door hinge is loose', NULL, 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '4 days'),
(21, 'Carpet Issue', 'Carpet has hole', 'https://example.com/21.jpg', 'in_progress', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(22, 'Curtain Rod', 'Curtain rod fell down', 'https://example.com/22.jpg', 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(23, 'Heating Problem', 'Heater not working', NULL, 'escalated', TRUE, CURRENT_TIMESTAMP - INTERVAL '8 days'),
(24, 'Furniture Damage', 'Chair is broken', 'https://example.com/24.jpg', 'resolved', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(25, 'Window Seal', 'Window seal is broken', 'https://example.com/25.jpg', 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(26, 'Bathtub Issue', 'Bathtub drain clogged', NULL, 'in_progress', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(27, 'Sink Problem', 'Sink faucet leaking', 'https://example.com/27.jpg', 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(28, 'Towel Rack', 'Towel rack came off', 'https://example.com/28.jpg', 'resolved', FALSE, CURRENT_TIMESTAMP - INTERVAL '16 hours'),
(29, 'Closet Rod', 'Closet rod is bent', NULL, 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '4 days'),
(30, 'Locker Issue', 'Locker key broken', 'https://example.com/30.jpg', 'in_progress', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(31, 'Wall Damage', 'Wall has large hole', 'https://example.com/31.jpg', 'escalated', TRUE, CURRENT_TIMESTAMP - INTERVAL '7 days'),
(32, 'Door Frame', 'Door frame is damaged', NULL, 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(33, 'Tile Crack', 'Floor tile cracked', 'https://example.com/33.jpg', 'resolved', FALSE, CURRENT_TIMESTAMP - INTERVAL '20 hours'),
(34, 'Screen Mesh', 'Window screen torn', 'https://example.com/34.jpg', 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(35, 'Handle Loose', 'Door handle is loose', NULL, 'in_progress', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(36, 'Paint Chip', 'Paint chipped off', 'https://example.com/36.jpg', 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '4 days'),
(37, 'Socket Outlet', 'Socket outlet burnt', 'https://example.com/37.jpg', 'escalated', TRUE, CURRENT_TIMESTAMP - INTERVAL '6 days'),
(38, 'Hinge Squeak', 'Door hinge squeaks', NULL, 'resolved', FALSE, CURRENT_TIMESTAMP - INTERVAL '4 hours'),
(39, 'Lock Jam', 'Door lock is jammed', 'https://example.com/39.jpg', 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(40, 'Glass Break', 'Window glass broken', 'https://example.com/40.jpg', 'in_progress', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(41, 'Pipe Burst', 'Water pipe burst', NULL, 'escalated', TRUE, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(42, 'Switch Issue', 'Light switch not working', 'https://example.com/42.jpg', 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(43, 'Alarm Bell', 'Alarm bell not ringing', 'https://example.com/43.jpg', 'resolved', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(44, 'Plug Loose', 'Power plug loose', NULL, 'in_progress', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(45, 'Wall Crack', 'Large wall crack', 'https://example.com/45.jpg', 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '6 days'),
(46, 'Door Squeak', 'Door creaks badly', 'https://example.com/46.jpg', 'resolved', FALSE, CURRENT_TIMESTAMP - INTERVAL '3 hours'),
(47, 'Window Stuck', 'Window stuck closed', NULL, 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '4 days'),
(48, 'Blind Broken', 'Blinds not rolling', 'https://example.com/48.jpg', 'in_progress', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(49, 'Paint Smell', 'Strong paint smell', 'https://example.com/49.jpg', 'pending', FALSE, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(50, 'Vent Blocked', 'Air vent blocked', NULL, 'escalated', TRUE, CURRENT_TIMESTAMP - INTERVAL '7 days');

-- Insert 50 Complaint Assignments
INSERT INTO complaint_assignments (complaint_id, staff_id, assigned_at, completed_at, notes) VALUES
(1, 51, CURRENT_TIMESTAMP - INTERVAL '2.5 days', NULL, 'Pending materials'),
(2, 52, CURRENT_TIMESTAMP - INTERVAL '1.5 days', NULL, 'Plumber contacted'),
(3, 51, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '6 hours', 'Issue resolved, fan replaced'),
(4, 53, CURRENT_TIMESTAMP - INTERVAL '3 days', NULL, 'Awaiting follow-up'),
(5, 54, CURRENT_TIMESTAMP - INTERVAL '4 days', NULL, 'Escalated due to no progress'),
(6, 55, CURRENT_TIMESTAMP - INTERVAL '1.5 days', NULL, 'Lock specialist scheduled'),
(7, 56, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '12 hours', 'Water supply restored'),
(8, 57, CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour', 'Bed repaired'),
(9, 58, CURRENT_TIMESTAMP - INTERVAL '5 days', NULL, 'Bulb replacement pending'),
(10, 59, CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, 'Wall reinforcement planned'),
(11, 60, CURRENT_TIMESTAMP - INTERVAL '12 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours', 'Router replaced'),
(12, 56, CURRENT_TIMESTAMP - INTERVAL '6 days', NULL, 'Paint contractor assigned'),
(13, 51, CURRENT_TIMESTAMP - INTERVAL '5 days', NULL, 'Major damage - priority'),
(14, 52, CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, 'Technician to visit'),
(15, 53, CURRENT_TIMESTAMP - INTERVAL '2 days', NULL, 'Drawer repair scheduled'),
(16, 54, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '3 hours', 'Stain cleaned'),
(17, 55, CURRENT_TIMESTAMP - INTERVAL '4 days', NULL, 'Ventilation check needed'),
(18, 56, CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, 'Mirror replacement ordered'),
(19, 57, CURRENT_TIMESTAMP - INTERVAL '8 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours', 'Socket rewired'),
(20, 58, CURRENT_TIMESTAMP - INTERVAL '3 days', NULL, 'Hinge adjustment pending'),
(21, 59, CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, 'Carpet repair scheduled'),
(22, 60, CURRENT_TIMESTAMP - INTERVAL '2 days', NULL, 'Rod replacement pending'),
(23, 51, CURRENT_TIMESTAMP - INTERVAL '7 days', NULL, 'Heater maintenance urgent'),
(24, 51, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 'Chair replaced'),
(25, 52, CURRENT_TIMESTAMP - INTERVAL '2 days', NULL, 'Window seal replacement'),
(26, 53, CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, 'Plumber coming tomorrow'),
(27, 54, CURRENT_TIMESTAMP - INTERVAL '4 days', NULL, 'Faucet replacement pending'),
(28, 55, CURRENT_TIMESTAMP - INTERVAL '16 hours', CURRENT_TIMESTAMP - INTERVAL '4 hours', 'Towel rack fixed'),
(29, 56, CURRENT_TIMESTAMP - INTERVAL '3 days', NULL, 'Rod straightening needed'),
(30, 57, CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, 'New key to be issued'),
(31, 58, CURRENT_TIMESTAMP - INTERVAL '6 days', NULL, 'Wall reconstruction - urgent'),
(32, 59, CURRENT_TIMESTAMP - INTERVAL '4 days', NULL, 'Frame repair needed'),
(33, 60, CURRENT_TIMESTAMP - INTERVAL '20 hours', CURRENT_TIMESTAMP - INTERVAL '8 hours', 'Tile replaced'),
(34, 51, CURRENT_TIMESTAMP - INTERVAL '2 days', NULL, 'Screen mesh ordered'),
(35, 51, CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, 'Handle tightening scheduled'),
(36, 52, CURRENT_TIMESTAMP - INTERVAL '3 days', NULL, 'Paint touch-up pending'),
(37, 53, CURRENT_TIMESTAMP - INTERVAL '5 days', NULL, 'Electrical inspection urgent'),
(38, 54, CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour', 'Hinge oiled'),
(39, 55, CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, 'Locksmith scheduled'),
(40, 56, CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, 'Glass replacement ordered'),
(41, 57, CURRENT_TIMESTAMP - INTERVAL '4 days', NULL, 'Emergency plumber needed'),
(42, 58, CURRENT_TIMESTAMP - INTERVAL '2 days', NULL, 'Switch replacement pending'),
(43, 59, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '6 hours', 'Bell wiring fixed'),
(44, 60, CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, 'Outlet inspection needed'),
(45, 51, CURRENT_TIMESTAMP - INTERVAL '5 days', NULL, 'Wall repair contractor assigned'),
(46, 51, CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour', 'Door hinges oiled'),
(47, 52, CURRENT_TIMESTAMP - INTERVAL '3 days', NULL, 'Window lubricant needed'),
(48, 53, CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, 'Blind repair specialist called'),
(49, 54, CURRENT_TIMESTAMP - INTERVAL '2 days', NULL, 'Ventilation check scheduled'),
(50, 55, CURRENT_TIMESTAMP - INTERVAL '6 days', NULL, 'HVAC system inspection urgent');

-- Insert 100 Payments
INSERT INTO payments (student_id, amount, status, payment_date, due_date, month_year, transaction_id) VALUES
(1, 5000.00, 'completed', '2025-08-05', '2025-08-10', 'August 2025', 'TXN001'),
(1, 5000.00, 'completed', '2025-09-05', '2025-09-10', 'September 2025', 'TXN002'),
(2, 3000.00, 'completed', '2025-08-08', '2025-08-10', 'August 2025', 'TXN003'),
(2, 3000.00, 'pending', NULL, '2025-09-10', 'September 2025', NULL),
(3, 7500.00, 'completed', '2025-08-15', '2025-08-20', 'August 2025', 'TXN005'),
(3, 7500.00, 'failed', '2025-09-05', '2025-09-10', 'September 2025', 'TXN006'),
(4, 5000.00, 'pending', NULL, '2025-09-10', 'September 2025', NULL),
(5, 3000.00, 'completed', '2025-09-12', '2025-09-20', 'September 2025', 'TXN007'),
(6, 5000.00, 'completed', '2025-08-12', '2025-08-15', 'August 2025', 'TXN008'),
(6, 5000.00, 'pending', NULL, '2025-09-15', 'September 2025', NULL),
(7, 5500.00, 'completed', '2025-08-18', '2025-08-20', 'August 2025', 'TXN009'),
(7, 5500.00, 'completed', '2025-09-18', '2025-09-20', 'September 2025', 'TXN010'),
(8, 6000.00, 'completed', '2025-08-22', '2025-08-25', 'August 2025', 'TXN011'),
(8, 6000.00, 'pending', NULL, '2025-09-25', 'September 2025', NULL),
(9, 5500.00, 'completed', '2025-08-25', '2025-08-28', 'August 2025', 'TXN012'),
(9, 5500.00, 'failed', '2025-09-10', '2025-09-28', 'September 2025', 'TXN013'),
(10, 7500.00, 'pending', NULL, '2025-08-10', 'August 2025', NULL),
(10, 7500.00, 'completed', '2025-09-08', '2025-09-15', 'September 2025', 'TXN014'),
(11, 3500.00, 'completed', '2025-08-28', '2025-08-30', 'August 2025', 'TXN015'),
(11, 3500.00, 'pending', NULL, '2025-09-30', 'September 2025', NULL),
(12, 4000.00, 'completed', '2025-08-10', '2025-08-12', 'August 2025', 'TXN016'),
(12, 4000.00, 'completed', '2025-09-11', '2025-09-15', 'September 2025', 'TXN017'),
(13, 8000.00, 'pending', NULL, '2025-08-15', 'August 2025', NULL),
(13, 8000.00, 'failed', '2025-09-05', '2025-09-15', 'September 2025', 'TXN018'),
(14, 5500.00, 'completed', '2025-08-14', '2025-08-17', 'August 2025', 'TXN019'),
(14, 5500.00, 'pending', NULL, '2025-09-17', 'September 2025', NULL),
(15, 6000.00, 'completed', '2025-08-16', '2025-08-20', 'August 2025', 'TXN020'),
(15, 6000.00, 'completed', '2025-09-16', '2025-09-20', 'September 2025', 'TXN021'),
(16, 5000.00, 'pending', NULL, '2025-08-18', 'August 2025', NULL),
(16, 5000.00, 'completed', '2025-09-15', '2025-09-18', 'September 2025', 'TXN022'),
(17, 3500.00, 'completed', '2025-08-19', '2025-08-22', 'August 2025', 'TXN023'),
(17, 3500.00, 'pending', NULL, '2025-09-22', 'September 2025', NULL),
(18, 7500.00, 'completed', '2025-08-20', '2025-08-25', 'August 2025', 'TXN024'),
(18, 7500.00, 'failed', '2025-09-01', '2025-09-25', 'September 2025', 'TXN025'),
(19, 5500.00, 'pending', NULL, '2025-08-22', 'August 2025', NULL),
(19, 5500.00, 'completed', '2025-09-19', '2025-09-22', 'September 2025', 'TXN026'),
(20, 5000.00, 'completed', '2025-08-23', '2025-08-27', 'August 2025', 'TXN027'),
(20, 5000.00, 'pending', NULL, '2025-09-27', 'September 2025', NULL),
(21, 8500.00, 'completed', '2025-08-24', '2025-08-30', 'August 2025', 'TXN028'),
(21, 8500.00, 'completed', '2025-09-24', '2025-09-30', 'September 2025', 'TXN029'),
(22, 5500.00, 'pending', NULL, '2025-08-25', 'August 2025', NULL),
(22, 5500.00, 'failed', '2025-09-12', '2025-09-25', 'September 2025', 'TXN030'),
(23, 6000.00, 'completed', '2025-08-26', '2025-08-31', 'August 2025', 'TXN031'),
(23, 6000.00, 'pending', NULL, '2025-09-30', 'September 2025', NULL),
(24, 4000.00, 'completed', '2025-08-27', '2025-09-02', 'August 2025', 'TXN032'),
(24, 4000.00, 'completed', '2025-09-27', '2025-10-02', 'September 2025', 'TXN033'),
(25, 3500.00, 'pending', NULL, '2025-08-28', 'August 2025', NULL),
(25, 3500.00, 'completed', '2025-09-20', '2025-09-28', 'September 2025', 'TXN034'),
(26, 5000.00, 'completed', '2025-08-29', '2025-09-03', 'August 2025', 'TXN035'),
(26, 5000.00, 'pending', NULL, '2025-10-03', 'September 2025', NULL),
(27, 7500.00, 'completed', '2025-08-30', '2025-09-05', 'August 2025', 'TXN036'),
(27, 7500.00, 'failed', '2025-09-02', '2025-09-05', 'September 2025', 'TXN037'),
(28, 5500.00, 'pending', NULL, '2025-08-31', 'August 2025', NULL),
(28, 5500.00, 'completed', '2025-09-28', '2025-10-05', 'September 2025', 'TXN038'),
(29, 3500.00, 'completed', '2025-09-01', '2025-09-05', 'September 2025', 'TXN039'),
(29, 3500.00, 'pending', NULL, '2025-10-05', 'October 2025', NULL),
(30, 6000.00, 'completed', '2025-09-02', '2025-09-08', 'September 2025', 'TXN040'),
(30, 6000.00, 'completed', '2025-10-02', '2025-10-08', 'October 2025', 'TXN041'),
(31, 4000.00, 'pending', NULL, '2025-09-05', 'September 2025', NULL),
(31, 4000.00, 'failed', '2025-09-15', '2025-09-10', 'September 2025', 'TXN042'),
(32, 5500.00, 'completed', '2025-09-03', '2025-09-10', 'September 2025', 'TXN043'),
(32, 5500.00, 'pending', NULL, '2025-10-10', 'October 2025', NULL),
(33, 7500.00, 'completed', '2025-09-04', '2025-09-12', 'September 2025', 'TXN044'),
(33, 7500.00, 'completed', '2025-10-04', '2025-10-12', 'October 2025', 'TXN045'),
(34, 5000.00, 'pending', NULL, '2025-09-08', 'September 2025', NULL),
(34, 5000.00, 'completed', '2025-09-28', '2025-10-08', 'September 2025', 'TXN046'),
(35, 8500.00, 'completed', '2025-09-05', '2025-09-15', 'September 2025', 'TXN047'),
(35, 8500.00, 'failed', '2025-09-20', '2025-10-15', 'September 2025', 'TXN048'),
(36, 3500.00, 'pending', NULL, '2025-09-10', 'September 2025', NULL),
(36, 3500.00, 'completed', '2025-09-25', '2025-10-10', 'September 2025', 'TXN049'),
(37, 5000.00, 'completed', '2025-09-06', '2025-09-12', 'September 2025', 'TXN050'),
(37, 5000.00, 'pending', NULL, '2025-10-12', 'October 2025', NULL),
(38, 6000.00, 'completed', '2025-09-07', '2025-09-14', 'September 2025', 'TXN051'),
(38, 6000.00, 'completed', '2025-10-07', '2025-10-14', 'October 2025', 'TXN052'),
(39, 4000.00, 'pending', NULL, '2025-09-12', 'September 2025', NULL),
(39, 4000.00, 'failed', '2025-09-25', '2025-09-12', 'September 2025', 'TXN053'),
(40, 5500.00, 'completed', '2025-09-08', '2025-09-15', 'September 2025', 'TXN054'),
(40, 5500.00, 'pending', NULL, '2025-10-15', 'October 2025', NULL),
(41, 7500.00, 'completed', '2025-09-09', '2025-09-18', 'September 2025', 'TXN055'),
(41, 7500.00, 'completed', '2025-10-09', '2025-10-18', 'October 2025', 'TXN056'),
(42, 3500.00, 'pending', NULL, '2025-09-15', 'September 2025', NULL),
(42, 3500.00, 'completed', '2025-09-28', '2025-10-15', 'September 2025', 'TXN057'),
(43, 5000.00, 'completed', '2025-09-10', '2025-09-18', 'September 2025', 'TXN058'),
(43, 5000.00, 'failed', '2025-09-22', '2025-10-18', 'September 2025', 'TXN059'),
(44, 8000.00, 'pending', NULL, '2025-09-18', 'September 2025', NULL),
(44, 8000.00, 'completed', '2025-10-05', '2025-10-18', 'October 2025', 'TXN060'),
(45, 5500.00, 'completed', '2025-09-11', '2025-09-20', 'September 2025', 'TXN061'),
(45, 5500.00, 'pending', NULL, '2025-10-20', 'October 2025', NULL),
(46, 6000.00, 'completed', '2025-09-12', '2025-09-22', 'September 2025', 'TXN062'),
(46, 6000.00, 'completed', '2025-10-12', '2025-10-22', 'October 2025', 'TXN063'),
(47, 4000.00, 'pending', NULL, '2025-09-20', 'September 2025', NULL),
(47, 4000.00, 'failed', '2025-09-28', '2025-09-20', 'September 2025', 'TXN064'),
(48, 5500.00, 'completed', '2025-09-13', '2025-09-25', 'September 2025', 'TXN065'),
(48, 5500.00, 'pending', NULL, '2025-10-25', 'October 2025', NULL),
(49, 3500.00, 'completed', '2025-09-14', '2025-09-28', 'September 2025', 'TXN066'),
(49, 3500.00, 'completed', '2025-10-14', '2025-10-28', 'October 2025', 'TXN067'),
(50, 7500.00, 'pending', NULL, '2025-09-25', 'September 2025', NULL),
(50, 7500.00, 'completed', '2025-10-10', '2025-10-25', 'October 2025', 'TXN068');

-- ============================================================================
-- CORE QUERIES FOR YOUR PROJECT
-- ============================================================================

-- Query 1: Find available rooms
SELECT 
    r.room_id, r.room_number, r.building, r.floor, r.capacity,
    r.current_occupancy, (r.capacity - r.current_occupancy) AS available_slots,
    r.room_type, r.rent_amount
FROM rooms r
WHERE r.is_available = TRUE AND r.current_occupancy < r.capacity
ORDER BY r.building, r.floor, r.room_number;

-- Query 2: Get complaints pending for more than 48 hours
SELECT 
    c.complaint_id, c.title, u.name AS student_name, u.email AS student_email,
    c.status, c.created_at, EXTRACT(HOUR FROM (CURRENT_TIMESTAMP - c.created_at))::INT AS hours_pending,
    s.name AS assigned_staff, ca.assigned_at
FROM complaints c
JOIN users u ON c.student_id = u.user_id
LEFT JOIN complaint_assignments ca ON c.complaint_id = ca.complaint_id
LEFT JOIN users s ON ca.staff_id = s.user_id
WHERE c.status != 'resolved' AND (CURRENT_TIMESTAMP - c.created_at) > INTERVAL '48 hours'
ORDER BY c.created_at ASC;

-- Query 3: Get complaints per student
SELECT 
    u.user_id, u.name AS student_name, u.email,
    COUNT(c.complaint_id) AS total_complaints,
    SUM(CASE WHEN c.status = 'pending' THEN 1 ELSE 0 END) AS pending_complaints,
    SUM(CASE WHEN c.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_complaints,
    SUM(CASE WHEN c.status = 'resolved' THEN 1 ELSE 0 END) AS resolved_complaints,
    SUM(CASE WHEN c.status = 'escalated' THEN 1 ELSE 0 END) AS escalated_complaints
FROM users u
LEFT JOIN complaints c ON u.user_id = c.student_id
WHERE u.role = 'student'
GROUP BY u.user_id, u.name, u.email
ORDER BY total_complaints DESC;

-- Query 4: Get total payments per student
SELECT 
    u.user_id, u.name AS student_name, u.email, u.phone,
    SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) AS total_paid,
    SUM(CASE WHEN p.status = 'pending' THEN p.amount ELSE 0 END) AS total_pending,
    SUM(CASE WHEN p.status = 'failed' THEN p.amount ELSE 0 END) AS total_failed,
    SUM(p.amount) AS total_due
FROM users u
LEFT JOIN payments p ON u.user_id = p.student_id
WHERE u.role = 'student'
GROUP BY u.user_id, u.name, u.email, u.phone
ORDER BY total_pending DESC;

-- Query 5: Student room allocation with current status
SELECT 
    u.user_id, u.name AS student_name, u.email,
    r.room_number, r.building, r.floor, r.room_type, r.rent_amount,
    ra.check_in_date, ra.check_out_date, ra.is_active
FROM users u
LEFT JOIN room_allocations ra ON u.user_id = ra.student_id AND ra.is_active = TRUE
LEFT JOIN rooms r ON ra.room_id = r.room_id
WHERE u.role = 'student'
ORDER BY u.name;

-- Query 6: Staff workload analysis
SELECT 
    u.user_id, u.name AS staff_name, u.email,
    COUNT(ca.assignment_id) AS total_assignments,
    COUNT(CASE WHEN ca.completed_at IS NULL THEN 1 END) AS active_assignments,
    COUNT(CASE WHEN ca.completed_at IS NOT NULL THEN 1 END) AS completed_assignments,
    ROUND(100.0 * COUNT(CASE WHEN ca.completed_at IS NOT NULL THEN 1 END) / 
        NULLIF(COUNT(ca.assignment_id), 0), 2) AS completion_rate_percent
FROM users u
LEFT JOIN complaint_assignments ca ON u.user_id = ca.staff_id
WHERE u.role IN ('staff', 'admin')
GROUP BY u.user_id, u.name, u.email
ORDER BY active_assignments DESC;

-- Query 7: Room occupancy analysis
SELECT 
    r.room_id, r.room_number, r.building, r.floor, r.room_type, r.capacity, r.current_occupancy,
    (r.capacity - r.current_occupancy) AS empty_slots,
    ROUND(100.0 * r.current_occupancy / r.capacity, 2) AS occupancy_percentage,
    CASE 
        WHEN r.current_occupancy = 0 THEN 'Empty'
        WHEN r.current_occupancy < r.capacity THEN 'Partially Occupied'
        WHEN r.current_occupancy = r.capacity THEN 'Full'
    END AS occupancy_status
FROM rooms r
ORDER BY r.building, r.floor, r.room_number;

-- Query 8: Auto-escalation report
SELECT 
    c.complaint_id, c.title, u.name AS student_name, c.status, c.created_at,
    EXTRACT(HOUR FROM (CURRENT_TIMESTAMP - c.created_at))::INT AS hours_since_creation,
    CASE 
        WHEN (CURRENT_TIMESTAMP - c.created_at) > INTERVAL '48 hours' 
            AND c.status != 'resolved' AND c.escalated = FALSE 
        THEN 'YES - AUTO ESCALATE'
        ELSE 'NO - OK'
    END AS should_escalate
FROM complaints c
JOIN users u ON c.student_id = u.user_id
WHERE c.status IN ('pending', 'in_progress')
ORDER BY c.created_at ASC;

-- Query 9: Payment defaulters
SELECT 
    u.user_id, u.name AS student_name, u.email, u.phone, p.payment_id, p.amount,
    p.due_date, CURRENT_DATE - p.due_date AS days_overdue, p.month_year
FROM users u
JOIN payments p ON u.user_id = p.student_id
WHERE p.status = 'pending' AND p.due_date < CURRENT_DATE AND u.role = 'student'
ORDER BY days_overdue DESC, p.due_date ASC;

-- Query 10: Complaint resolution time analysis
SELECT 
    u.user_id, u.name AS student_name, c.complaint_id, c.title, c.status,
    c.created_at, c.resolved_at,
    EXTRACT(HOUR FROM (c.resolved_at - c.created_at))::INT AS resolution_hours
FROM complaints c
JOIN users u ON c.student_id = u.user_id
WHERE c.resolved_at IS NOT NULL
ORDER BY resolution_hours DESC;

-- ============================================================================
-- VALIDATION TRIGGER (created after data load to avoid constraint violations)
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_staff_assignment()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE user_id = NEW.staff_id 
        AND role IN ('staff', 'admin')
    ) THEN
        RAISE EXCEPTION 'Staff ID must belong to a user with staff or admin role';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_complaint_assignment_staff BEFORE INSERT OR UPDATE ON complaint_assignments
    FOR EACH ROW EXECUTE FUNCTION validate_staff_assignment();

-- ============================================================================
-- END OF CLEANED SCHEMA
-- ============================================================================
