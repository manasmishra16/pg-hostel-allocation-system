# STAYNEST FRONTEND AUDIT & ARCHITECTURAL INVENTORY
**Date:** September 2026  
**Auditor:** Antigravity Agentic Team  
**Scope:** Frontend (`frontend/`), Backend API contracts (`backend/app/api/`), Database entities & services (`backend/app/models/`, `backend/app/services/`), Packages, and Routes.

---

## EXECUTIVE SUMMARY
An exhaustive audit of the StayNest codebase reveals that while the backend FastAPI application and SQLite/PostgreSQL schema possess advanced domain models, transactional services, and 14 passing automated tests, the frontend is severely compromised by:
1. **Critical Route Deficits & Information Architecture Duplication:** Entire user roles (such as `WARDEN`) have zero dedicated routes, while `SUPER_ADMIN`, `PROPERTY_OWNER`, and `STAFF` share identical metrics or navigate back to the same pages.
2. **Broken & Circular Navigation Links:** Multiple sidebar links in `Sidebar.tsx` route to wrong destinations (e.g. Owner "Rooms" points to tenant public search `/properties`; Owner "Staff" and "Tenants" point back to `/owner/dashboard`; Owner "Analytics" points to `/admin/dashboard`; Tenant "Documents" points to `/dashboard/payments`).
3. **Hardcoded Mock/Static Datasets in Production Views:**
   - Super Admin dashboard hardcodes `occupancyTrendData` and `platformVolumeData`, "+14% QoQ", and fallback numbers.
   - Owner dashboard hardcodes 6-month historical graphs (`occupancyData`, `revenueData`, `residentGrowthData`, `complaintsCategoryData`) and displays fake metrics.
   - Tenant room visualizer (`/dashboard/room`) hardcodes Bed A, B, C, D details and names instead of rendering the backend payload from `/allocations/my-room`.
   - Payment checkout (`/dashboard/payments`) generates fake random Razorpay payment IDs using `Math.random()` and calls browser `alert()` instead of downloading generated receipts.
   - Roommates matching (`/dashboard/roommates`) hardcodes fallback demo cards in component state.
4. **Under-Engineered Form Workflows:** The Property creation wizard (`/owner/properties/new`) collects building, floor, room, and bed counts in Step 2, but completely discards them when submitting the form to the backend.
5. **Missing Operational Pages:** Core operational pages specified in the system requirements (`/warden/*`, `/owner/properties`, `/owner/properties/[id]`, `/owner/rooms`, `/owner/tenants`, `/owner/staff`, `/owner/payments`, `/owner/complaints`, `/staff/residents`, `/staff/allocations`, `/staff/maintenance`, `/admin/users`, `/admin/organizations`, `/admin/audit-logs`, `/dashboard/documents`, `/profile`) do not exist.
6. **Unused Dependencies:** `framer-motion`, `react-hook-form`, `zod`, `tailwind-merge`, and `clsx` are installed in `package.json` but never imported anywhere in application source files.

---

## 1. EVERY FRONTEND ROUTE
| Route | Role / Owner | File Path | Current Status / Implementation |
|---|---|---|---|
| `/` | Public | `frontend/app/page.tsx` | Landing page. Mixes backend `/properties` query with fallback data. |
| `/(auth)/login` | Public | `frontend/app/(auth)/login/page.tsx` | Login screen with 1-click evaluator persona switcher. |
| `/(auth)/signup` | Public | `frontend/app/(auth)/signup/page.tsx` | Signup screen supporting TENANT and PROPERTY_OWNER. |
| `/properties` | Public / Tenant | `frontend/app/properties/page.tsx` | Catalog search with filters (locality, type, budget, search). |
| `/properties/[id]` | Public / Tenant | `frontend/app/properties/[id]/page.tsx` | Property details with bed list. Booking button simply redirects to `/dashboard/room` without calling backend allocation. |
| `/dashboard` | Tenant | `frontend/app/dashboard/page.tsx` | Tenant dashboard. Consumes `/allocations/my-room`, `/payments/summary`, `/complaints`, `/notices`. |
| `/dashboard/room` | Tenant | `frontend/app/dashboard/room/page.tsx` | Room & bed visualizer. Consumes `/allocations/my-room` but hardcodes bed layout and roommate details in JSX. |
| `/dashboard/roommates` | Tenant | `frontend/app/dashboard/roommates/page.tsx` | Roommate compatibility. Consumes `/roommates/matches` and `/roommates/preferences` but contains hardcoded fallback demo state. |
| `/dashboard/payments` | Tenant | `frontend/app/dashboard/payments/page.tsx` | Invoices & payment history. Integrates test order creation and verification, but uses `Math.random()` and mock alerts for receipts. |
| `/dashboard/complaints` | Tenant | `frontend/app/dashboard/complaints/page.tsx` | Complaint tickets. Consumes `/complaints` and `/complaints/ai-triage`. |
| `/dashboard/notices` | Tenant | `frontend/app/dashboard/notices/page.tsx` | Notice board. Consumes `/notices`. |
| `/owner/dashboard` | Property Owner | `frontend/app/owner/dashboard/page.tsx` | Owner dashboard. Consumes `/properties` and `/analytics/dashboard`, but hardcodes 4 Recharts data series and growth percentages. |
| `/owner/properties/new` | Property Owner | `frontend/app/owner/properties/new/page.tsx` | 3-step property creation wizard. Discards building/floor/room/bed scaffolding parameters before calling API. |
| `/staff/dashboard` | Staff / Warden | `frontend/app/staff/dashboard/page.tsx` | Mixed staff/warden dashboard with tabs for tickets, bed roster, and notice broadcast. |
| `/admin/dashboard` | Super Admin | `frontend/app/admin/dashboard/page.tsx` | Super Admin dashboard. Calls `/analytics/dashboard` (same endpoint as owner), hardcodes charts and audit event stream. |

---

## 2. EVERY LAYOUT
- `frontend/app/layout.tsx`: Root HTML layout with `Inter` font, `Providers` wrapper (React Query), and dark background styling.
- **Missing Role-Specific Layouts:**
  - No `/dashboard/layout.tsx` for shared tenant shell and persistent sidebar/header.
  - No `/owner/layout.tsx` for owner shell.
  - No `/warden/layout.tsx` for warden shell.
  - No `/staff/layout.tsx` for staff shell.
  - No `/admin/layout.tsx` for admin shell.
  Currently, every single page manually renders `<Sidebar />` and `<Header />`, repeating container wrappers and boilerplate.

---

## 3. EVERY PAGE
*(Detailed audit of all 15 existing page components)*
1. **`app/page.tsx`**: 583 lines. Rich visual landing page with architectural photography and category filters. Fallback mock array `fallbackFeatured` is used if backend returns empty properties.
2. **`app/(auth)/login/page.tsx`**: Functional authentication page connected to `/auth/login`. Includes demo login buttons.
3. **`app/(auth)/signup/page.tsx`**: Functional registration page connected to `/auth/signup`.
4. **`app/properties/page.tsx`**: Catalog page querying `/properties`.
5. **`app/properties/[id]/page.tsx`**: Details page. Fetches `/properties/{id}`. Displays rooms and beds. Reservation action is stubbed with client redirect.
6. **`app/dashboard/page.tsx`**: Tenant overview. Calls real APIs. Displays high-level summary cards.
7. **`app/dashboard/room/page.tsx`**: Room visualizer. While connected to `/allocations/my-room`, the 2D layout grid contains hardcoded JSX for Beds A, B, C, D and hardcoded occupant names.
8. **`app/dashboard/roommates/page.tsx`**: Connected to `/roommates/matches`, but injects a mock array if no matches are found.
9. **`app/dashboard/payments/page.tsx`**: Connected to `/payments/summary`, `/invoices/my`, `/payments/history`. Uses `Math.random()` for test transaction IDs and lacks true PDF receipt download.
10. **`app/dashboard/complaints/page.tsx`**: Connected to `/complaints` and AI triage.
11. **`app/dashboard/notices/page.tsx`**: Connected to `/notices`.
12. **`app/owner/dashboard/page.tsx`**: KPI cards fall back to static numbers (`|| 148`, `|| 94%`, `|| 14.8L`). 4 Recharts charts use hardcoded arrays (`occupancyData`, `revenueData`, etc.).
13. **`app/owner/properties/new/page.tsx`**: Onboarding wizard. Step 2 inputs (`totalFloors`, `roomsPerFloor`, `bedsPerRoom`) are omitted from the payload sent to `api.createProperty`.
14. **`app/staff/dashboard/page.tsx`**: Operates on `/rooms` and `/complaints`. Merges Warden and Staff responsibilities into one screen with tab switches.
15. **`app/admin/dashboard/page.tsx`**: Displays enterprise cards with hardcoded fallbacks and mock monthly Recharts series. Audit log is a static 3-item array.

---

## 4. EVERY MAJOR COMPONENT
Currently, only 4 shared components exist across the entire frontend:
1. `frontend/components/dashboard/Sidebar.tsx`: Collapsible sidebar with mobile bottom bar and drawer. Contains critical routing errors and circular links.
2. `frontend/components/dashboard/Header.tsx`: Basic header component rendering a title, subtitle, and user status badge.
3. `frontend/components/layout/Navbar.tsx`: Public navigation bar with logo, links to `/properties`, and authentication actions.
4. `frontend/components/layout/Footer.tsx`: Public footer with copyright and link directory.

**Missing Component Architecture:**
No components exist in `components/ui/`, `components/forms/`, `components/property/`, `components/room/`, `components/bed/`, `components/tenant/`, `components/payments/`, `components/complaints/`, or `components/analytics/`. Monolithic page files (some 400-580 lines) duplicate table rows, modal overlays, and stat cards.

---

## 5. EVERY API CLIENT
- `frontend/lib/api.ts`: Centralized fetcher wrapper against `http://localhost:8000/api/v1`.
  - Modules: `auth`, `properties`, `allocations`, `roommates`, `invoices`, `payments`, `complaints`, `notices`, `notifications`, `analytics`.
  - Flaws:
    - `getOwnerAnalytics` and `getAdminAnalytics` point to the exact same URL: `/analytics/dashboard`.
    - Lacks granular endpoints for buildings, floors, rooms, bed status updates (`PATCH /rooms/beds/{id}/status`), allocation releases, user management, and documents.

---

## 6. EVERY HOOK
- Currently **zero** custom hooks exist in `frontend/hooks/` (the folder is empty).
- All API queries and mutations directly instantiate `@tanstack/react-query` inside page components, leading to duplicate query keys and inconsistent caching logic.

---

## 7. EVERY PACKAGE
| Package | Version | Type | Status | Assessment |
|---|---|---|---|---|
| `next` | `^15.1.0` | Dependency | REQUIRED | Next.js App Router core framework. |
| `react` | `^19.0.0` | Dependency | REQUIRED | React 19 core library. |
| `react-dom` | `^19.0.0` | Dependency | REQUIRED | DOM renderer for React. |
| `@tanstack/react-query` | `^5.62.0` | Dependency | REQUIRED | Efficient server-state management. |
| `lucide-react` | `^0.468.0` | Dependency | REQUIRED | Modern SVG icon set. |
| `recharts` | `^2.15.0` | Dependency | REQUIRED | Responsive SVG chart visualizations. |
| `clsx` | `^2.1.1` | Dependency | UNUSED | Never imported; utility for conditional classnames. |
| `tailwind-merge` | `^2.5.5` | Dependency | UNUSED | Never imported; utility for resolving Tailwind conflicts. |
| `react-hook-form` | `^7.54.0` | Dependency | UNUSED | Never imported; form state is managed via raw `useState`. |
| `zod` | `^3.24.1` | Dependency | UNUSED | Never imported; schema validation is not implemented on client. |
| `framer-motion` | `^12.4.7` | Dependency | UNUSED | Never imported in any source file. |
| `tailwindcss` | `^3.4.16` | DevDependency | REQUIRED | Utility CSS styling engine. |
| `postcss` | `^8.4.49` | DevDependency | REQUIRED | CSS post-processing for Tailwind. |
| `autoprefixer` | `^10.6.0` | DevDependency | REQUIRED | CSS vendor prefixing. |
| `typescript` | `^5.7.2` | DevDependency | REQUIRED | TypeScript static typing engine. |

---

## 8. EVERY DUPLICATED COMPONENT
- **KPI Stat Cards:** Each dashboard (`AdminDashboard`, `OwnerDashboard`, `StaffDashboard`, `TenantDashboard`) manually codes 4-5 glass cards with icon, metric, label, and trend chip.
- **Glass Modals:** `PaymentsPage` and `ComplaintsPage` define inline modals with custom backdrop overlays and close buttons instead of using a shared `Modal` component.
- **Bed Item Cards:** Repeated in `room/page.tsx`, `staff/dashboard/page.tsx`, and `properties/[id]/page.tsx`.

---

## 9. EVERY DUPLICATED DASHBOARD
- **Owner Dashboard (`/owner/dashboard`) vs. Super Admin Dashboard (`/admin/dashboard`):**
  - Both fetch `/analytics/dashboard`.
  - Both display almost the exact same Recharts visualizations (Occupancy Trend AreaChart, Monthly Financial Inflow BarChart).
  - Both use hardcoded static arrays for their charts.
  - The Super Admin view provides no platform-level governance, organization tracking, or system telemetry—it is merely a reskinned property owner view.
- **Staff Dashboard (`/staff/dashboard`):**
  - Attempts to act as both Warden and Maintenance Staff via tabs.
  - Mixes room roster inspection, ticket dispatch, and notice broadcasting into one monolithic view without dedicated allocation or resident tracking workflows.

---

## 10. EVERY MOCK / STATIC DATASET
1. `AdminDashboard`:
   - `occupancyTrendData` (Jan-Sep hardcoded array).
   - `platformVolumeData` (Jan-Sep hardcoded array).
   - `+14% QoQ` and `+4.2% MoM` hardcoded strings.
   - Platform Audit stream (static 3-item array).
2. `OwnerDashboard`:
   - `occupancyData` (Apr-Sep hardcoded array).
   - `revenueData` (Apr-Sep hardcoded array).
   - `residentGrowthData` (Apr-Sep hardcoded array).
   - `complaintsCategoryData` (hardcoded category counts).
3. `MyRoomPage` (`/dashboard/room`):
   - Hardcoded Bed A, Bed B, Bed C, Bed D cards with fixed occupant names and status tags regardless of actual room configuration in database.
4. `PaymentsPage` (`/dashboard/payments`):
   - `pay_${Math.random().toString(36)...}` generates fake payment IDs.
   - `alert("Downloading official PDF receipt...")` mocks receipt download.
5. `RoommatesPage` (`/dashboard/roommates`):
   - Hardcoded fallback demo cards for Rahul Joshi and Amit Patel injected into state.
6. `LandingPage` (`/`):
   - `fallbackFeatured` static array.

---

## 11. EVERY UNUSED PACKAGE
- `framer-motion`: 0 imports.
- `react-hook-form`: 0 imports.
- `zod`: 0 imports.
- `clsx`: 0 imports.
- `tailwind-merge`: 0 imports.

---

## 12. EVERY UNUSED COMPONENT
- Currently there are no dead standalone component files because only 4 components exist in the entire project (`Header`, `Sidebar`, `Navbar`, `Footer`), all of which are imported. The problem is an acute *lack* of components rather than orphaned components.

---

## 13. EVERY DEAD ROUTE
- None of the existing 15 routes 404, but routes like `/owner/dashboard` and `/staff/dashboard` are overloaded with responsibilities because dedicated child routes were never created.

---

## 14. EVERY BROKEN NAVIGATION LINK
*(Inspected from `frontend/components/dashboard/Sidebar.tsx`)*
- `ownerNav`:
  - `Properties` -> `/owner/dashboard` (Circular; redirects back to dashboard instead of property list).
  - `Rooms` -> `/properties` (Incorrect; sends property owner to public tenant discovery search).
  - `Tenants` -> `/owner/dashboard` (Circular; no tenant management view exists).
  - `Staff` -> `/owner/dashboard` (Circular; no staff management view exists).
  - `Payments` -> `/dashboard/payments` (Incorrect; sends property owner to Tenant self-payment screen).
  - `Complaints` -> `/dashboard/complaints` (Incorrect; sends property owner to Tenant ticket submission screen).
  - `Analytics` -> `/admin/dashboard` (Incorrect; sends property owner to Super Admin dashboard).
- `staffNav`:
  - `Rooms` -> `/staff/dashboard` (Circular).
  - `Allocations` -> `/staff/dashboard` (Circular).
  - `Students` -> `/staff/dashboard` (Circular).
  - `Complaints` -> `/dashboard/complaints` (Incorrect; tenant complaints view).
  - `Payments` -> `/dashboard/payments` (Incorrect; tenant payment view).
  - `Notices` -> `/dashboard/notices` (Incorrect; tenant view).
- `adminNav`:
  - `Users` -> `/admin/dashboard` (Circular).
  - `Properties` -> `/properties` (Incorrect; public tenant catalog).
  - `Analytics` -> `/admin/dashboard` (Circular).
  - `Audit Logs` -> `/admin/dashboard` (Circular).
- `tenantNav`:
  - `Documents` -> `/dashboard/payments` (Incorrect; points to payments instead of documents).
  - `Profile` -> `/dashboard` (Circular; points to dashboard instead of user profile).

---

## 15. EVERY FRONTEND / BACKEND INTEGRATION POINT
| Feature Area | Frontend Component / Page | Current Client Call | Actual Backend Endpoint | Integration Status | Defect / Disconnect |
|---|---|---|---|---|---|
| Auth: Login | `/login` | `api.auth.login` | `POST /auth/login` | 🟢 Connected | Working. Stores token in `localStorage`. |
| Auth: Signup | `/signup` | `api.auth.signup` | `POST /auth/signup` | 🟢 Connected | Working. Returns JWT and user profile. |
| Auth: Session | `auth-context.tsx` | `api.auth.getMe` | `GET /auth/me` | 🟢 Connected | Working. Validates token on mount. |
| Public Properties | `/properties` | `api.properties.getAll` | `GET /properties` | 🟢 Connected | Working with query parameters. |
| Property Details | `/properties/[id]` | `api.properties.getById` | `GET /properties/{id}` | 🟢 Connected | Returns property with buildings, floors, rooms, beds. |
| Create Property | `/owner/properties/new` | `api.properties.create` | `POST /properties` | 🟡 Broken Payload | Form drops floors, rooms, and beds from payload. |
| My Room | `/dashboard/room` | `api.allocations.getMyRoom` | `GET /allocations/my-room` | 🟡 Visual Mock | API called, but JSX renders hardcoded Bed A-D. |
| Bed Status Update | Not implemented | None | `PATCH /rooms/beds/{id}/status` | 🔴 Disconnected | Backend endpoint exists; frontend cannot toggle status. |
| Bed Allocation | Not implemented | None | `POST /allocations` | 🔴 Disconnected | Staff/Warden cannot allocate bed from UI. |
| Bed Release (Vacate)| Not implemented | None | `POST /allocations/{id}/release`| 🔴 Disconnected | Backend endpoint exists; frontend has no action button. |
| Roommate Matches | `/dashboard/roommates`| `api.roommates.getMatches` | `GET /roommates/matches` | 🟢 Connected | Working; contains fallback mock array if empty. |
| Roommate Prefs | `/dashboard/roommates`| `api.roommates.updatePreferences`| `PUT /roommates/preferences` | 🟢 Connected | Updates questionnaire in DB. |
| Tenant Invoices | `/dashboard/payments` | `api.invoices.getMy` | `GET /invoices/my` | 🟢 Connected | Fetches invoice items and dues. |
| Razorpay Order | `/dashboard/payments` | `api.payments.createOrder` | `POST /payments/create-order` | 🟢 Connected | Creates order in backend. |
| Razorpay Verify | `/dashboard/payments` | `api.payments.verify` | `POST /payments/verify` | 🟡 Partial | Verifies payment, but frontend passes fake transaction ID. |
| Download Receipt | `/dashboard/payments` | None | `GET /invoices/{id}/receipt` | 🔴 Disconnected | Frontend triggers browser alert instead of fetching receipt. |
| Complaints List | `/dashboard/complaints`| `api.complaints.getAll` | `GET /complaints` | 🟢 Connected | Filters by user role automatically. |
| Create Complaint | `/dashboard/complaints`| `api.complaints.create` | `POST /complaints` | 🟢 Connected | Creates ticket and triggers AI triage. |
| AI Triage Preview| `/dashboard/complaints`| `api.complaints.previewTriage`| `POST /complaints/ai-triage` | 🟢 Connected | Runs rule-based classifier. |
| Update Complaint | `/staff/dashboard` | `api.complaints.update` | `PATCH /complaints/{id}` | 🟢 Connected | Updates ticket status. |
| Notices List | `/dashboard/notices` | `api.notices.getAll` | `GET /notices` | 🟢 Connected | Fetches active notices. |
| Post Notice | `/staff/dashboard` | `api.notices.create` | `POST /notices` | 🟢 Connected | Creates notice and broadcasts notifications. |
| Owner Analytics | `/owner/dashboard` | `api.analytics.getDashboard` | `GET /analytics/dashboard` | 🟡 Duplicated | Calls global endpoint; charts use static arrays. |
| Admin Analytics | `/admin/dashboard` | `api.analytics.getDashboard` | `GET /analytics/dashboard` | 🟡 Duplicated | Calls same endpoint; charts use static arrays. |
| Document Upload | None | None | `POST /documents/upload` | 🔴 Disconnected | Backend supports multipart upload; no UI exists. |
| Document List | None | None | `GET /documents` | 🔴 Disconnected | Backend supports private doc list; no UI exists. |
