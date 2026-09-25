# 🗄️ StayNest Database Architecture & Schema

StayNest utilizes a relational PostgreSQL database engineered with strict normalization, bed-level constraints, and automated audit tracking.

---

## 1. Schema Design Principles

- **Primary Keys:** UUIDv4 generated on insertion (`gen_random_uuid()`).
- **Referential Integrity:** Explicit foreign keys with appropriate `ON DELETE CASCADE` or `ON DELETE SET NULL`.
- **Bed-Level Granularity:** Overbooking is physically impossible at the database level using unique allocation bounds and state tracking on individual beds.
- **Audit Logging:** Every table contains `created_at` and `updated_at` triggers syncing timestamp mutations.

---

## 2. Core Entities & Hierarchy

```
organizations (Enterprise / Brand)
    └── properties (e.g. Sunrise PG Koramangala)
          └── buildings (Block A, Block B)
                └── floors (Ground, 1st, 2nd, 3rd)
                      └── rooms (A-101, B-202)
                            └── beds (Bed-A, Bed-B)
                                  └── allocations (Tenant Lease)
                                        └── users / profiles (Resident)
```

---

## 3. Key Tables

### `properties`
Stores physical real estate entities:
- `id` (UUID, PK)
- `name` (VARCHAR)
- `property_type` (`PG`, `HOSTEL`, `COLIVING`)
- `gender_type` (`BOYS`, `GIRLS`, `UNISEX`)
- `address`, `locality`, `city`, `pincode`
- `amenities` (JSONB)
- `images` (JSONB)
- `starting_price` (NUMERIC)

### `beds`
Atomic residential units:
- `id` (UUID, PK)
- `room_id` (UUID, FK -> rooms)
- `bed_label` (VARCHAR, e.g. "Bed A", "Bed B")
- `status` (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `RESERVED`)

### `allocations`
Tenant occupancy records:
- `id` (UUID, PK)
- `bed_id` (UUID, FK -> beds)
- `tenant_id` (UUID, FK -> users)
- `start_date`, `end_date` (DATE)
- `monthly_rent` (NUMERIC)
- `deposit_amount` (NUMERIC)
- `status` (`ACTIVE`, `PENDING_CHECKIN`, `CHECKED_OUT`, `CANCELLED`)

### `roommate_preferences`
Variables driving the compatibility engine:
- `user_id` (UUID, FK -> users)
- `sleep_schedule` (`early_bird`, `night_owl`, `flexible`)
- `cleanliness_level` (INT, 1-5)
- `noise_tolerance` (`silent`, `moderate`, `high`)
- `diet` (`vegetarian`, `non_vegetarian`, `vegan`, `eggetarian`)
- `smoking` (BOOLEAN)
- `course` (VARCHAR)

### `invoices` & `payments`
Financial ledger:
- `invoices`: `id`, `tenant_id`, `amount`, `due_date`, `status` (`PENDING`, `PAID`, `OVERDUE`)
- `payments`: `id`, `invoice_id`, `amount`, `payment_method`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `status`

### `complaints`
Maintenance ticket lifecycle:
- `id` (UUID, PK)
- `tenant_id` (UUID, FK -> users)
- `property_id`, `room_id` (UUID, FKs)
- `title`, `description` (TEXT)
- `category` (`plumbing`, `electrical`, `wifi`, `cleaning`, etc.)
- `priority` (`low`, `medium`, `high`, `critical`)
- `status` (`PENDING`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `ESCALATED`)

---

## 4. DDL & Migration Scripts

The complete database schema DDL is located in:
- [staynest_schema.sql](file:///c:/Users/MANAS/Desktop/pg-hostel-allocation-system/database/schema/staynest_schema.sql)
- [seed_data.sql](file:///c:/Users/MANAS/Desktop/pg-hostel-allocation-system/database/seed/seed_data.sql)

Legacy reference schema:
- [hostel_management_schema.sql](file:///c:/Users/MANAS/Desktop/pg-hostel-allocation-system/database/legacy/hostel_management_schema.sql)
