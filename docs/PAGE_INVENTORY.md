# StayNest — Complete Page & Route Inventory

This inventory documents all 45 routes in the StayNest Next.js 15 application. It covers layout shell hierarchies, target personas, primary backend entities, and user workflows.

---

## 1. Public & Marketing Routes

| Route | Layout Shell | Target Audience | Primary Function & Interactivity |
| :--- | :--- | :--- | :--- |
| **`/`** | Root Layout | Prospective Residents, Public | Landing page featuring verified PG/Hostel showcase, feature highlights, roommate matching engine explainer, testimonials, and persona quick-switch. |
| **`/properties`** | Root Layout | Prospective Residents | Multi-attribute search catalog: filters for locality, PG vs Hostel, COED/Boys/Girls, AC/Food/WiFi amenities, and budget slider. |
| **`/properties/[id]`** | Root Layout | Prospective Residents | Detailed property listing: photo carousel, building specifications, amenity tags, room sharing types, starting rent, and direct booking inquiries. |
| **`/login`** | Root Layout | All Users | JWT authentication login screen with demo persona fast-fill pills for instant switching between Tenant, Owner, Warden, Staff, and Admin. |
| **`/signup`** | Root Layout | New Residents / Owners | Registration portal: full name, email, phone, password, and account role selection. |
| **`/profile`** | Root Layout | Authenticated User | Personal account settings, contact details update, active role badge, and session security status. |
| **`/_not-found`** | Root Layout | All Users | Custom branded 404 error screen with intelligent redirection back to respective user dashboard. |

---

## 2. Tenant Portal (`/dashboard/*`)
*Protected by `app/dashboard/layout.tsx` shell featuring `<Sidebar />` with Tenant navigation items.*

| Route | Target Persona | Primary Entities | Key Workflows & User Actions |
| :--- | :--- | :--- | :--- |
| **`/dashboard`** | `TENANT` | `Allocation`, `Invoice`, `Complaint`, `Notice` | Resident Command Center: Quick view of allocated room & bed, next rent due date, active maintenance ticket status, and recent pinned notices. |
| **`/dashboard/room`** | `TENANT` | `Allocation`, `Room`, `Bed`, `User` | My Room & Roommates: Dynamic view of current bed, roommates sharing the room with avatars and contacts, building/floor specs, and allocated rent. |
| **`/dashboard/payments`** | `TENANT` | `Invoice`, `Payment` | Rent Ledger & Checkout: Real-time rent summary, upcoming invoices, Razorpay checkout with instant verification, and official downloadable tax receipts. |
| **`/dashboard/complaints`** | `TENANT` | `Complaint` | Maintenance & Support Center: Raise incident tickets with real-time AI triage department and priority suggestions; transparent 4-stage resolution tracking. |
| **`/dashboard/notices`** | `TENANT` | `Notice` | Official Notice Board: Chronological circulars, meal menus, gate curfews, and maintenance circulars with pinned priority notices. |
| **`/dashboard/documents`** | `TENANT` | `Document` | KYC & Identity Vault: Upload government Aadhaar/Passport, college ID, and signed lease agreement; view AES-256 encrypted verification statuses. |
| **`/dashboard/roommates`** | `TENANT` | `RoommatePreference`, `User` | Scientific Roommate Matching: 5-dimension radar chart (sleep, cleanliness, noise, lifestyle, academics), preference editor, and match compatibility ranking. |

---

## 3. Property Owner Portal (`/owner/*`)
*Protected by `app/owner/layout.tsx` shell with RBAC checking for `PROPERTY_OWNER` or `SUPER_ADMIN`.*

| Route | Target Persona | Primary Entities | Key Workflows & User Actions |
| :--- | :--- | :--- | :--- |
| **`/owner/dashboard`** | `PROPERTY_OWNER` | `Property`, `Bed`, `Complaint`, `Invoice` | Portfolio Console: Scoped occupancy rates, total contracted MRR, live property bed distribution chart, and complaint categories breakdown. |
| **`/owner/properties`** | `PROPERTY_OWNER` | `Property`, `Building` | Portfolio Manager: Filter and search owned PGs/Hostels, review total vs occupied beds, vacancy percentages, and starting rents. |
| **`/owner/properties/new`** | `PROPERTY_OWNER` | `Property`, `Building`, `Floor`, `Room`, `Bed` | Property Onboarding Wizard: Gather property metadata, amenities, and floor/room/bed counts; automatically scaffolds building hierarchy in PostgreSQL. |
| **`/owner/properties/[id]`** | `PROPERTY_OWNER` | `Property`, `Building`, `Floor` | Property Details: Deep-dive into building blocks, floor breakdowns, occupancy counts, and direct links to Bed Management console. |
| **`/owner/rooms`** | `PROPERTY_OWNER` | `Room`, `Floor`, `Bed` | Bed & Floor Management Console: Property selector, floor tabs, interactive `BedGrid` with live status toggling (Available, Maintenance) and move-ins. |
| **`/owner/tenants`** | `PROPERTY_OWNER` | `Allocation`, `User`, `Bed` | Resident Directory & Leases: Active resident roster across all owned buildings, contracted rent amounts, check-in dates, and vacate actions. |
| **`/owner/staff`** | `PROPERTY_OWNER` | `User`, `Property` | Personnel Roster: Directory of assigned Chief Wardens and maintenance staff with shift schedules and emergency phone/email contacts. |
| **`/owner/payments`** | `PROPERTY_OWNER` | `Invoice`, `Payment` | Revenue & Invoices: Track rent collections, outstanding arrears, generate custom resident invoices, and inspect official receipts. |
| **`/owner/complaints`** | `PROPERTY_OWNER` | `Complaint` | Maintenance Operations: Ticket queue across owned properties, review AI triage recommendations, and assign or resolve repairs. |
| **`/owner/analytics`** | `PROPERTY_OWNER` | `Property`, `Bed`, `Invoice` | Occupancy Analytics & Yield: RevPAB calculations, property-by-property utilization bar charts, and monthly estimated yield breakdown. |
| **`/owner/notices`** | `PROPERTY_OWNER` | `Notice` | Campus Notice Broadcaster: Issue property-wide announcements, policy updates, and inspection notices with pinned priority. |

---

## 4. Hostel Warden Portal (`/warden/*`)
*Protected by `app/warden/layout.tsx` shell with RBAC checking for `WARDEN` or `SUPER_ADMIN`.*

| Route | Target Persona | Primary Entities | Key Workflows & User Actions |
| :--- | :--- | :--- | :--- |
| **`/warden/dashboard`** | `WARDEN` | `Allocation`, `Complaint`, `Notice`, `Property` | Operations Command: Today's check-ins, current hostel occupancy, urgent incident reports, and fast-action move-in links. |
| **`/warden/residents`** | `WARDEN` | `Allocation`, `User` | Resident Register: Official inmate roster, room & bed assignments, KYC verification status, and bed release controls. |
| **`/warden/rooms`** | `WARDEN` | `Room`, `Bed` | Bed Status Map: Floor-by-floor inspection view using `BedGrid` with real status transitions. |
| **`/warden/allocations`** | `WARDEN` | `Allocation`, `Bed`, `User` | Allocation Desk: Select available bed, input tenant ID, set rent/deposit, and execute formal check-in; vacate checkout tool. |
| **`/warden/complaints`** | `WARDEN` | `Complaint` | Incident Center: Review student maintenance requests, dispatch staff, escalate severe violations to owner, and mark tickets fixed. |
| **`/warden/notices`** | `WARDEN` | `Notice` | Discipline & Curfew Bulletins: Post gate closure rules, mess meal changes, and inspection circulars. |

---

## 5. Staff & Maintenance Portal (`/staff/*`)
*Protected by `app/staff/layout.tsx` shell with RBAC checking for `STAFF`, `WARDEN`, or `SUPER_ADMIN`.*

| Route | Target Persona | Primary Entities | Key Workflows & User Actions |
| :--- | :--- | :--- | :--- |
| **`/staff/dashboard`** | `STAFF` | `Complaint`, `Room` | Field Maintenance Desk: Open work orders, high-priority SLA defects, completed repairs counter, and supervised room inventory. |
| **`/staff/residents`** | `STAFF` | `Allocation`, `User` | Resident Room Directory: Field directory for room access during housekeeping rounds and repair dispatches. |
| **`/staff/allocations`** | `STAFF` | `Room`, `Bed` | Bed Turnover & Inspection Ledger: Field inspection tool using `BedGrid` to tag beds as sanitized vs needing maintenance. |
| **`/staff/complaints`** | `STAFF` | `Complaint` | Trade Work Queue: Categorized by Plumbing, Electrical, WiFi, Cleanliness with one-click status transitions (Start Work -> Mark Done). |
| **`/staff/maintenance`** | `STAFF` | Facility Schedules | Preventive Care Schedule: Statutory recurring maintenance for RO purifiers, backup generators, fire extinguishers, and water tanks. |
| **`/staff/notices`** | `STAFF` | `Notice` | Facility Bulletins: Broadcast planned water or electricity shutdown advisories to residents. |

---

## 6. Super Admin Portal (`/admin/*`)
*Protected by `app/admin/layout.tsx` shell with RBAC strictly checking for `SUPER_ADMIN`.*

| Route | Target Persona | Primary Entities | Key Workflows & User Actions |
| :--- | :--- | :--- | :--- |
| **`/admin/dashboard`** | `SUPER_ADMIN` | `Property`, `User`, `Invoice`, Telemetry | Governance Console: Global platform health (FastAPI latency, PostgreSQL pool, Razorpay settlement), network bed capacity, and gross transacted MRR. |
| **`/admin/organizations`** | `SUPER_ADMIN` | Organization Entities | Enterprise Entities: Directory of multi-facility operators, university housing trusts, and verified enterprise partners. |
| **`/admin/users`** | `SUPER_ADMIN` | `User` | Master User Registry: Complete directory across all 5 roles (`TENANT`, `PROPERTY_OWNER`, `WARDEN`, `STAFF`, `SUPER_ADMIN`) with KYC statuses. |
| **`/admin/properties`** | `SUPER_ADMIN` | `Property` | Property Oversight: Network-wide inventory audit with verified status tags, bed counts, and base rental rates. |
| **`/admin/analytics`** | `SUPER_ADMIN` | `DashboardStats` | Global Telemetry: Multi-campus capacity utilization charts, occupancy trends, and platform revenue metrics. |
| **`/admin/payments`** | `SUPER_ADMIN` | `Invoice`, `Payment` | Escrow Ledger: Master transaction reconciliation tracking settled funds, pending escrow balances, and T+1 disbursement health. |
| **`/admin/audit-logs`** | `SUPER_ADMIN` | Security Journal | Immutable Audit Trail: Cryptographically logged events recording allocations, check-outs, KYC uploads, and SLA ticket escalations with IP timestamps. |
| **`/admin/settings`** | `SUPER_ADMIN` | System Parameters | System Governance: FastAPI endpoint configuration, JWT token expiry, notification gateway toggles, and database pool telemetry. |
