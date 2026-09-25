# 📡 StayNest REST API Specification

All backend endpoints are prefixed with `/api/v1/`. Responses return standard JSON payloads.

---

## 1. Authentication & Profile (`/api/v1/auth`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate with email & password, return JWT token | Public |
| `POST` | `/api/v1/auth/signup` | Register new resident/user | Public |
| `GET` | `/api/v1/auth/me` | Fetch current session profile & role | Authenticated |

---

## 2. Properties & Discovery (`/api/v1/properties`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/properties` | Search & filter properties by location, price, gender, amenities | Public |
| `GET` | `/api/v1/properties/{id}` | Detailed property view with building floors & live beds | Public |
| `POST` | `/api/v1/properties` | Create new property and scaffold buildings | `PROPERTY_OWNER`, `SUPER_ADMIN` |

---

## 3. Rooms & Beds (`/api/v1/rooms`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/rooms` | Retrieve rooms list with bed occupancy | Authenticated |
| `GET` | `/api/v1/rooms/{id}` | Get room details, amenities, and bed layout | Authenticated |

---

## 4. Allocations & Leases (`/api/v1/allocations`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/allocations/my` | Get current tenant's active room & bed assignment | `TENANT` |
| `POST` | `/api/v1/allocations` | Book/allocate a bed (strictly prevents double-booking) | Authenticated |
| `POST` | `/api/v1/allocations/{id}/terminate` | Terminate lease and free bed | `STAFF`, `WARDEN`, `OWNER` |

---

## 5. Roommate Compatibility (`/api/v1/roommates`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/roommates/matches` | Run weighted compatibility algorithm against co-residents | `TENANT` |
| `POST` | `/api/v1/roommates/preferences` | Save lifestyle survey (sleep, noise, clean, diet) | `TENANT` |

---

## 6. Financials & Payments (`/api/v1/invoices`, `/api/v1/payments`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/invoices` | List invoices and billing statements | Authenticated |
| `POST` | `/api/v1/payments/create-order` | Create server-side Razorpay payment order | `TENANT` |
| `POST` | `/api/v1/payments/verify` | Verify Razorpay HMAC signature & mark invoice `PAID` | Authenticated |

---

## 7. Complaints & Maintenance (`/api/v1/complaints`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/complaints` | List active maintenance requests | Authenticated |
| `POST` | `/api/v1/complaints` | Submit maintenance ticket with AI categorization | `TENANT` |
| `POST` | `/api/v1/complaints/triage` | Preview OpenAI/Rule triage for complaint description | Authenticated |
| `PATCH` | `/api/v1/complaints/{id}` | Update status (`ASSIGNED`, `IN_PROGRESS`, `RESOLVED`) | `STAFF`, `WARDEN` |

---

## 8. Notices & Analytics (`/api/v1/notices`, `/api/v1/analytics`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/notices` | Fetch pinned and recent hostel notices | Authenticated |
| `POST` | `/api/v1/notices` | Broadcast new circular to residents | `STAFF`, `WARDEN`, `OWNER` |
| `GET` | `/api/v1/analytics/admin` | Platform KPIs, occupancy rate, resident growth | `SUPER_ADMIN` |
| `GET` | `/api/v1/analytics/owner` | Portfolio revenue, bed status, occupancy | `PROPERTY_OWNER` |
