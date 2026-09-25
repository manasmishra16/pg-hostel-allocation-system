# 🏛️ StayNest System Architecture

> **Tagline:** *"Your home away from home."*  
> **Repository:** `pg-hostel-allocation-system`  
> **Platform Version:** 2.0 Production-Ready Architecture

---

## 1. High-Level Architecture Overview

StayNest is architected as an enterprise-grade multi-tenant SaaS platform decoupled into:
1. **Next.js 15 Client Layer** (TypeScript, React 19, Tailwind CSS, TanStack Query, Framer Motion, Recharts)
2. **FastAPI Business Core** (Python 3.12, Pydantic v2, SQLAlchemy 2.0, Alembic, Native Bcrypt, Razorpay SDK)
3. **PostgreSQL Data Layer** (Supabase Managed or Self-Hosted PostgreSQL with UUID primary keys, strict bed-level constraints, and audit trails)

```
┌────────────────────────────────────────────────────────┐
│               STAYNEST CLIENT APPLICATION              │
│       Next.js 15 (App Router) • React 19 • Tailwind    │
└──────────────────────────┬─────────────────────────────┘
                           │ Typed HTTP/JSON Client
                           ▼
┌────────────────────────────────────────────────────────┐
│               FASTAPI REST CONTROLLERS                 │
│         /api/v1/ (Properties, Rooms, Beds, Invoices)   │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
      Core Security & RBAC         Service Layer
   (JWT, Roles, Native Bcrypt)    (Allocation, Roommates)
               │                          │
               └──────────────┬───────────┘
                              │
                    SQLAlchemy 2.0 ORM
                              │
                              ▼
┌────────────────────────────────────────────────────────┐
│                  POSTGRESQL DATABASE                   │
│   Bed-Level Constraints • UUIDs • Triggers & Enums     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Bed-Level Inventory Hierarchy

Unlike legacy hostel systems that allocate at the room level without tracking individual physical occupancy, StayNest enforces an immutable 7-level structural hierarchy:

$$\text{Organization} \longrightarrow \text{Property} \longrightarrow \text{Building} \longrightarrow \text{Floor} \longrightarrow \text{Room} \longrightarrow \text{Bed} \longrightarrow \text{Allocation}$$

### Hierarchy Rules:
- **No Room Overbooking:** Rooms have explicit capacities (`SINGLE`, `DOUBLE`, `TRIPLE`, `FOUR_SHARING`).
- **Bed Isolation:** Each bed has a unique identifier (e.g., `A-101-BedA`) with states: `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `RESERVED`.
- **Atomic Double-Allocation Prevention:** The backend `AllocationService` wraps booking in a transaction with row-level locks (`SELECT ... FOR UPDATE`), immediately rejecting overlapping active leases.

---

## 3. Roommate Matching Engine

StayNest replaces arbitrary roommate assignments with a multi-factor weighted compatibility algorithm:

$$\text{Total Score} = w_1 \cdot S_{\text{sleep}} + w_2 \cdot S_{\text{clean}} + w_3 \cdot S_{\text{noise}} + w_4 \cdot S_{\text{life}} + w_5 \cdot S_{\text{acad}}$$

- **Circadian / Sleep Alignment ($w_1 = 25\%$):** Compares bedtime windows (`early_bird`, `night_owl`, `flexible`).
- **Cleanliness Standard ($w_2 = 25\%$):** Absolute distance matching across a 1–5 scalar scale ($100 - |C_1 - C_2| \times 20$).
- **Noise Tolerance ($w_3 = 20\%$):** Study environment expectations (`silent`, `moderate`, `social`).
- **Dietary & Smoking ($w_4 = 15\%$):** Matches strict lifestyle boundaries.
- **Academic / Professional Synergy ($w_5 = 15\%$):** Course, branch, and company affinity.

---

## 4. Payment Verification Workflow (Razorpay)

StayNest ensures tamper-proof transactions through server-side HMAC-SHA256 signature verification:

1. **Order Creation:** Tenant initiates rent payment $\rightarrow$ FastAPI creates a verifiable order on Razorpay with amount, currency (`INR`), and unique invoice ID.
2. **Client Checkout:** Frontend opens Razorpay Checkout modal $\rightarrow$ Tenant completes payment via UPI, Cards, or Netbanking.
3. **Cryptographic Verification:**
   $$\text{Expected Signature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{key\_secret})$$
4. **State Transition:** If signatures match, FastAPI atomically marks the invoice as `PAID`, records transaction metadata, generates receipt number, and emits a payment confirmation event.

---

## 5. AI Complaint Triage Pipeline

When a resident submits a complaint:
1. The text is passed to `app.ai.complaint_classifier`.
2. The triage model extracts:
   - **Category:** `plumbing`, `electrical`, `wifi`, `cleaning`, `food`, `furniture`, `security`.
   - **Severity / Priority:** `low`, `medium`, `high`, `critical`.
   - **Target Department:** Dispatches directly to the assigned maintenance contractor or staff queue.
3. **Escalation Watchdog:** If an unresolved `HIGH` or `CRITICAL` complaint remains open beyond 48 hours, background tasks automatically promote its status to `ESCALATED` and notify the Property Owner.
