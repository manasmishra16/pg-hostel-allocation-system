# StayNest Legacy Repository & Database Analysis Report

**Project Name**: StayNest  
**Tagline**: "Your home away from home."  
**Repository**: [https://github.com/manasmishra16/pg-hostel-allocation-system](https://github.com/manasmishra16/pg-hostel-allocation-system)  
**Date**: September 13, 2026  
**Auditor**: Senior Full-Stack & Database Architect

---

## 1. Existing Repository Structure

Prior to the rebuild, the repository contained a mix of prototype backend artifacts, a Vite-based React frontend template, and historical PostgreSQL schema definitions:

```
pg-hostel-allocation-system/
├── backend/
│   ├── .pytest_cache/
│   ├── .venv/                         # Local virtualenv with Python 3.12 packages
│   ├── __pycache__/                   # Compiled bytecode
│   ├── app/
│   │   ├── ai/                        # Complaint classification pyc
│   │   ├── api/v1/                    # Endpoint pyc files (auth, properties, rooms, etc.)
│   │   ├── core/                      # Config, security, database pyc files
│   │   ├── models/                    # Model pyc files
│   │   ├── schemas/                   # Schema pyc files
│   │   └── services/                  # Business logic pyc files
│   ├── staynest.db                    # 204 KB SQLite prototype database with 17 tables
│   └── tests/
├── frontend/
│   ├── node_modules/
│   ├── dist/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/ui/             # Empty directory
│   │   ├── pages/                     # Scaffolding directories (admin, auth, landing, etc.)
│   │   ├── services/                  # Empty directory
│   │   ├── App.tsx                    # Default Vite starter counter screen
│   │   ├── index.css                  # Tailwind CSS import
│   │   └── main.tsx                   # React 19 bootstrap
│   ├── package.json                   # Vite 6 + React 19 + React Router v7
│   ├── vite.config.ts
│   └── tsconfig.json
├── hostel_management_schema.sql       # 788-line PostgreSQL reference DDL and seed queries
├── README.md                          # Minimal 3-line description
└── .gitignore
```

---

## 2. Existing Backend Analysis

1. **Framework & Architecture**:
   - The compiled prototype pyc files indicate a FastAPI application structure partitioned into `core`, `models`, `schemas`, `api/v1`, and `services`.
   - **Database Connection**: Configured for local SQLite (`staynest.db`).
   - **Authentication**: Custom JWT authentication prototype using email and hashed passwords.
   - **Authorization**: Primitive role checks without centralized fine-grained RBAC.
   - **Room & Bed Allocation Logic**: Included initial models for `buildings`, `floors`, `rooms`, `beds`, and `allocations`.
   - **Complaints & AI Triage**: Included OpenAI category classification prototypes (`ai/complaint_classifier`).
   - **Payments**: Included basic invoice and payment records with placeholder Razorpay fields.
   - **Testing**: A Pytest configuration was present in `.pytest_cache`.

2. **Critical Deficiencies**:
   - Source `.py` files were absent from the active worktree (only stale `.pyc` files remained).
   - Tied to SQLite instead of PostgreSQL with Alembic migrations.
   - Missing Supabase Auth integration and secure webhook signatures.
   - Lacked clean Pydantic v2 schemas and SQLAlchemy 2.0 async/sync production models.

---

## 3. Existing Frontend Analysis

1. **Framework & Stack**:
   - Built on **Vite 6 + React 19** with `@tailwindcss/vite` and `react-router-dom` v7.
   - `App.tsx` was the default Vite spinning-logo counter page.
   - Component directories (`components/ui`, `pages/properties`, `pages/student`, `services`) were empty scaffold folders.
   - No actual UI matching the reference glassmorphic mockup was implemented.

2. **Required Paradigm Shift**:
   - Complete replacement with **Next.js 15 App Router** (`frontend/app/`), Server/Client components, TanStack Query v5, Framer Motion, and Tailwind CSS.
   - The UI must strictly follow the dark glassmorphic architectural aesthetic of the StayNest reference mockup.

---

## 4. Existing Database Analysis (`hostel_management_schema.sql` & `staynest.db`)

### Comparison & Findings

| Feature | `hostel_management_schema.sql` | `staynest.db` Prototype | StayNest Target SaaS Schema |
|---|---|---|---|
| **Primary Keys** | `SERIAL` (Integers) | `INTEGER PRIMARY KEY` | **UUID / Integer with UUIDs for Public Facing** |
| **Hierarchy** | Flat: `rooms.building` VARCHAR | `properties` → `buildings` → `floors` → `rooms` → `beds` | **Full 5-tier Hierarchy: `properties` → `buildings` → `floors` → `rooms` → `beds`** |
| **Allocation Target** | Room (via `capacity` counter) | Bed (`bed_id`) | **Bed (`bed_id`) with unique active constraint** |
| **User Roles** | `student`, `staff`, `admin` | `SUPER_ADMIN`, `PROPERTY_OWNER`, `WARDEN`, `STAFF`, `TENANT` | **Full 5 SaaS Roles + Supabase Auth UUID integration** |
| **Roommate Matching** | Course, year, habits, smoking, noise | Course, year, habits, smoking, noise, clean, diet | **Weighted Compatibility Engine (Academic, Lifestyle, Habits, Sleep, Cleanliness)** |
| **Invoicing & Billing** | Flat `payments` table | `invoices`, `invoice_items`, `payments` | **Normalized Invoices, Itemized Bills & Razorpay Integration** |
| **Complaints** | Title, desc, image, status, escalated | Title, desc, ai_summary, category, status | **Complaint Lifecycle, AI triage summary, assignments & timeline** |
| **Notices & Alerts** | Missing | `notices`, `notifications` | **Property-scoped Notices & Real-time Notification bell** |
| **Documents & KYC** | Missing | `documents` (ID, student proof, agreement) | **Tenant KYC documents with Supabase Storage** |
| **Audit Logs** | Missing | `audit_logs` | **System-wide audit trail** |

---

## 5. Useful Functionality to Preserve

1. **Realistic Domain Seed Data**:
   - Bengaluru properties: **Sunrise PG** (Koramangala), **Elite Hostel** (HSR Layout), **Green Valley PG** (Indiranagar).
   - Realistic Indian names, emails, room numbers (`A-101`, `B-201`), and rental values in INR (₹5,000 – ₹9,000/month).
2. **Roommate Compatibility Dimensions**:
   - Study habits, year of study, noise preference, sleep schedules (night owl vs. early bird), smoking, and cleanliness score.
3. **Complaint Workflow Rules**:
   - Status pipeline: `PENDING` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` / `ESCALATED`.
   - 48-hour auto-escalation rule from `hostel_management_schema.sql`.
4. **Staff Assignment Validation**:
   - Ensuring only users with `STAFF` or `WARDEN` / `ADMIN` roles can be assigned to complaints.

---

## 6. Functionality to Redesign

1. **Bed-Level Allocation**:
   - Eliminate room-level occupancy guessing. Beds are discrete assets with codes (`Bed A`, `Bed B`). A room's occupancy is computed dynamically as `COUNT(beds WHERE status='OCCUPIED')`.
2. **Decoupled Auth & Profiles**:
   - Integrate Supabase Auth JWTs. Passwords are never stored in plain application tables.
3. **Itemized Invoicing Engine**:
   - Introduce `invoices` and `invoice_items` with automated generation of monthly rent, electricity meters, and maintenance surcharges.
4. **Payment Flow**:
   - Razorpay order generation (`order_id`) → frontend modal checkout → backend cryptographic signature verification (`verify_payment`).
5. **Architectural UI**:
   - Build the 9 core glassmorphic screens identified in the design spec: Landing, Discovery, Details, Login/Signup, Tenant Dashboard, Payments, Complaints, Room Visualizer, Staff/Owner/Admin dashboards.

---

## 7. File Action Matrix

### Files / Artifacts to Delete
- `backend/.venv/` (Local environment)
- `backend/__pycache__/` & `backend/app/**/__pycache__/`
- `backend/.pytest_cache/`
- `backend/staynest.db` (Local SQLite file)
- `frontend/node_modules/`
- `frontend/dist/`
- `frontend/src/` (Vite placeholder code)
- `frontend/vite.config.ts`, `frontend/index.html`

### Files to Retain & Relocate
- `hostel_management_schema.sql` → Relocate to `database/legacy/hostel_management_schema.sql` for historical reference.

---

## 8. Proposed New Architecture

```
                    STAYNEST SAAS

               ┌──────────────────────┐
               │    Next.js 15 UI     │
               │ TypeScript, Tailwind │
               │  shadcn/ui aesthetic │
               └──────────┬───────────┘
                          │
                       REST API
                          │
               ┌──────────▼───────────┐
               │    FastAPI Server    │
               │  Pydantic v2 Models  │
               │ Service & Repo Layer │
               └──────────┬───────────┘
                          │
                      SQLAlchemy
                          │
               ┌──────────▼───────────┐
               │  PostgreSQL Database │
               │  Supabase / Alembic  │
               └──────────────────────┘
```

---

## 9. Migration & Execution Strategy

1. **Step 1**: Move `hostel_management_schema.sql` to `database/legacy/`.
2. **Step 2**: Clean out old Vite files and Python bytecode / SQLite database.
3. **Step 3**: Establish `database/schema/` with production PostgreSQL DDL and `database/seed/` with comprehensive Bengaluru seed records.
4. **Step 4**: Build the complete **FastAPI backend** (`backend/app/main.py`, `core`, `models`, `schemas`, `services`, `api/v1`) using Python 3.12 (`uv`).
5. **Step 5**: Build the **Next.js 15 frontend** (`frontend/`) with the dark glassmorphic design system and typed API services.
6. **Step 6**: Implement automated tests (`pytest`) covering authentication, bed allocation, roommate compatibility algorithm, and payments.
7. **Step 7**: Configure Docker orchestration (`docker-compose.yml`) and comprehensive documentation.
