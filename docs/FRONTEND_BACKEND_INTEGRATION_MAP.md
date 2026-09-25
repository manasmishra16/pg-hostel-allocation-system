# StayNest — Frontend-Backend Integration Map

This document establishes the verified contract mapping between the Next.js 15 frontend application, the typed API client layer (`lib/api/*`), FastAPI route handlers (`backend/app/api/v1/*`), domain services (`backend/app/services/*`), and SQLAlchemy entities (`backend/app/models/entities.py`).

---

## 1. Authentication & Identity Layer (`authApi`)

| User Action / Page | Frontend API Method | HTTP & Route | FastAPI Controller | Service / Entity Layer |
| :--- | :--- | :--- | :--- | :--- |
| Sign in with password | `api.auth.login(credentials)` | `POST /api/v1/auth/login` | `app.api.v1.auth.login` | `AuthService.authenticate_user`<br>`User` (`email`, `hashed_password`) |
| Register new account | `api.auth.signup(data)` | `POST /api/v1/auth/signup` | `app.api.v1.auth.signup` | `AuthService.create_user`<br>`User` (`role`, `phone`, `full_name`) |
| Hydrate session on load | `api.auth.getMe()` | `GET /api/v1/auth/me` | `app.api.v1.auth.get_me` | `get_current_user` dependency (JWT Bearer decode) |
| Persona switch in demo | `demoLogin(role)` in `AuthContext` | Switches JWT Bearer token | Mock / Seed user token generation | Role switching across 5 personas |

---

## 2. Properties & Facility Hierarchy (`propertiesApi`)

| User Action / Page | Frontend API Method | HTTP & Route | FastAPI Controller | Service / Entity Layer |
| :--- | :--- | :--- | :--- | :--- |
| Explore all PGs / Hostels (`/properties`) | `api.properties.getAll(filters)` | `GET /api/v1/properties` | `app.api.v1.properties.get_properties` | Filters by `locality`, `city`, `property_type`, `gender_type`, `budget`<br>`Property` |
| View property details (`/properties/[id]`) | `api.properties.getById(id)` | `GET /api/v1/properties/{id}` | `app.api.v1.properties.get_property` | `Property`, `Building`, `Floor`, `Room`, `Bed` |
| Onboard new property (`/owner/properties/new`) | `api.properties.create(data)` | `POST /api/v1/properties` | `app.api.v1.properties.create_property` | Automatic blueprint scaffolding:<br>`Property` -> `Building` -> `Floor` -> `Room` -> `Bed` |
| Update property amenities | `api.properties.update(id, data)` | `PUT /api/v1/properties/{id}` | `app.api.v1.properties.update_property` | `Property` |

---

## 3. Rooms & Bed Management (`roomsApi`)

| User Action / Page | Frontend API Method | HTTP & Route | FastAPI Controller | Service / Entity Layer |
| :--- | :--- | :--- | :--- | :--- |
| Inspect rooms with beds (`/owner/rooms`, `/warden/rooms`) | `api.rooms.getRooms(propertyId)` | `GET /api/v1/rooms?property_id={id}` | `app.api.v1.rooms.get_rooms` | Joins `Room`, `Floor`, `Building`, `Bed`, calculates `occupied_count`, `available_count` |
| Filter beds by status (`BedGrid`, `BedItem`) | `api.rooms.getBeds(roomId, status)` | `GET /api/v1/rooms/beds` | `app.api.v1.rooms.get_beds` | `Bed` query with `status_filter` |
| Create room in floor (`AddRoomModal`) | `api.rooms.createRoom(payload)` | `POST /api/v1/rooms` | `app.api.v1.rooms.create_room` | `Room` (`room_number`, `capacity`, `base_rent`, `room_type`) |
| Toggle bed status (`BedActionModal`) | `api.rooms.updateBedStatus(id, status)` | `PATCH /api/v1/rooms/beds/{id}/status` | `app.api.v1.rooms.update_bed_status` | Enforces business rule: cannot occupy without allocation, cannot free occupied bed without checkout release |

---

## 4. Bed Allocations & Move-In Lifecycle (`allocationsApi`)

| User Action / Page | Frontend API Method | HTTP & Route | FastAPI Controller | Service / Entity Layer |
| :--- | :--- | :--- | :--- | :--- |
| Tenant views my room (`/dashboard/room`) | `api.allocations.getMyRoom()` | `GET /api/v1/allocations/my-room` | `app.api.v1.allocations.get_my_room` | Fetches active allocation, current room, roommates, building info, and lease rent |
| List resident allocations (`/owner/tenants`, `/warden/residents`) | `api.allocations.getAll(propertyId, status)` | `GET /api/v1/allocations` | `app.api.v1.allocations.get_allocations` | Joins `Allocation`, `Bed`, `Room`, `Building`, `User`<br>`AllocationResponse` |
| Execute resident move-in (`/warden/allocations`) | `api.allocations.create(data)` | `POST /api/v1/allocations` | `app.api.v1.allocations.create_allocation` | `AllocationService.allocate_bed`<br>Sets `Bed.status = 'OCCUPIED'`, assigns `current_tenant_id` |
| Vacate bed & checkout resident | `api.allocations.release(id)` | `POST /api/v1/allocations/{id}/release` | `app.api.v1.allocations.release_allocation` | `AllocationService.release_bed`<br>Sets `Allocation.status = 'COMPLETED'`, `Bed.status = 'AVAILABLE'`, frees tenant |

---

## 5. Invoices & Razorpay Rent Payments (`invoicesApi` & `paymentsApi`)

| User Action / Page | Frontend API Method | HTTP & Route | FastAPI Controller | Service / Entity Layer |
| :--- | :--- | :--- | :--- | :--- |
| Tenant views rent summary (`/dashboard/payments`) | `api.payments.getSummary()` | `GET /api/v1/payments/summary` | `app.api.v1.payments.get_payment_summary` | Computes next due invoice amount, due date, total paid, and total pending |
| Tenant views my bills | `api.invoices.getMy()` | `GET /api/v1/invoices/my` | `app.api.v1.invoices.get_my_invoices` | `Invoice` filtered by `tenant_id == current_user.id` |
| Generate owner invoice (`/owner/payments`) | `api.invoices.create(data)` | `POST /api/v1/invoices` | `app.api.v1.invoices.create_invoice` | Generates unique invoice number (`INV-YYYY-MM-XXXX`), stores breakdown |
| View official receipt (`ReceiptModal`) | `api.invoices.getReceipt(id)` | `GET /api/v1/invoices/{id}/receipt` | `app.api.v1.invoices.get_invoice_receipt` | Line item items, GST breakdown, payment status |
| Initiate Razorpay checkout | `api.payments.createOrder(invoiceId, amount)` | `POST /api/v1/payments/create-order` | `app.api.v1.payments.create_order` | `PaymentService.create_razorpay_order`<br>Generates Razorpay order ID |
| Verify signature & settle invoice | `api.payments.verify(data)` | `POST /api/v1/payments/verify` | `app.api.v1.payments.verify_payment` | `PaymentService.verify_payment_signature`<br>Updates `Invoice.status = 'PAID'`, logs `Payment` |

---

## 6. Complaints & AI Maintenance Triage (`complaintsApi`)

| User Action / Page | Frontend API Method | HTTP & Route | FastAPI Controller | Service / Entity Layer |
| :--- | :--- | :--- | :--- | :--- |
| List maintenance tickets (`/owner/complaints`, `/staff/complaints`) | `api.complaints.getAll(statusFilter)` | `GET /api/v1/complaints` | `app.api.v1.complaints.get_complaints` | Filtered by status and current user role scoping |
| Resident raises ticket (`/dashboard/complaints`) | `api.complaints.create(data)` | `POST /api/v1/complaints` | `app.api.v1.complaints.create_complaint` | `ComplaintService.create_complaint`<br>Runs automated keyword AI triage |
| Real-time AI triage preview on typing | `api.complaints.previewTriage(title, desc)` | `POST /api/v1/complaints/ai-triage` | `app.api.v1.complaints.preview_ai_triage` | `ComplaintService.ai_triage`<br>Returns suggested department and priority |
| Assign ticket to field staff | `api.complaints.assign(id, staffId, notes)` | `POST /api/v1/complaints/{id}/assign` | `app.api.v1.complaints.assign_complaint` | Updates status to `ASSIGNED`, sets `staff_id` |
| Mark ticket resolved | `api.complaints.resolve(id, notes)` | `POST /api/v1/complaints/{id}/resolve` | `app.api.v1.complaints.resolve_complaint` | Sets status to `RESOLVED`, records `resolved_at` |
| Escalate SLA breached ticket | `api.complaints.escalate(id, reason)` | `POST /api/v1/complaints/{id}/escalate` | `app.api.v1.complaints.escalate_complaint` | Sets `escalated = True`, logs escalation event |

---

## 7. KYC Documents & Identity Vault (`documentsApi`)

| User Action / Page | Frontend API Method | HTTP & Route | FastAPI Controller | Service / Entity Layer |
| :--- | :--- | :--- | :--- | :--- |
| Tenant views uploaded documents (`/dashboard/documents`) | `api.documents.getMy()` | `GET /api/v1/documents` | `app.api.v1.documents.get_my_documents` | Returns `DocumentResponse` with verification status and signed URLs |
| Upload ID / Lease / Police form | `api.documents.upload(file, title, type, isPrivate)` | `POST /api/v1/documents/upload` | `app.api.v1.documents.upload_document` | `DocumentStorageService.upload_document`<br>Stores file securely in local/cloud storage |
| Secure download / view | `api.documents.download(id)` | `GET /api/v1/documents/{id}/download` | `app.api.v1.documents.download_document` | Authorizes access and returns `FileResponse` or signed link |
| Remove document | `api.documents.delete(id)` | `DELETE /api/v1/documents/{id}` | `app.api.v1.documents.delete_document` | Removes record and disk file |

---

## 8. Notice Board & Announcements (`noticesApi`)

| User Action / Page | Frontend API Method | HTTP & Route | FastAPI Controller | Service / Entity Layer |
| :--- | :--- | :--- | :--- | :--- |
| View circulars (`/dashboard/notices`, `/warden/notices`) | `api.notices.getAll()` | `GET /api/v1/notices` | `app.api.v1.notices.get_notices` | Fetches active notices ordered by `is_pinned` and date |
| Broadcast new circular | `api.notices.create(data)` | `POST /api/v1/notices` | `app.api.v1.notices.create_notice` | `Notice` (`title`, `description`, `priority`, `is_pinned`) |

---

## 9. Analytics & Business Intelligence (`analyticsApi`)

| User Action / Page | Frontend API Method | HTTP & Route | FastAPI Controller | Service / Entity Layer |
| :--- | :--- | :--- | :--- | :--- |
| Owner dashboard metrics (`/owner/dashboard`, `/owner/analytics`) | `api.analytics.getOwnerDashboard()` | `GET /api/v1/analytics/owner` | `app.api.v1.analytics.get_owner_dashboard` | `AnalyticsService.get_dashboard_metrics(db, owner_id)`<br>Strictly scopes beds, occupancy, and MRR to owner properties |
| Platform enterprise metrics (`/admin/dashboard`, `/admin/analytics`) | `api.analytics.getAdminDashboard()` | `GET /api/v1/analytics/admin` | `app.api.v1.analytics.get_admin_dashboard` | `AnalyticsService.get_dashboard_metrics(db)`<br>Calculates global network metrics across all properties |

---

## 10. Roommate Compatibility Engine (`roommatesApi`)

| User Action / Page | Frontend API Method | HTTP & Route | FastAPI Controller | Service / Entity Layer |
| :--- | :--- | :--- | :--- | :--- |
| Calculate compatibility radar (`/dashboard/roommates`) | `api.roommates.getMatches()` | `GET /api/v1/roommates/matches` | `app.api.v1.roommates.get_roommate_matches` | Computes 5-dimension vector similarity (sleep, cleanliness, noise, lifestyle, academics) |
| Save resident preferences | `api.roommates.updatePreferences(prefs)` | `PUT /api/v1/roommates/preferences` | `app.api.v1.roommates.update_preferences` | Stores `RoommatePreference` in PostgreSQL |
