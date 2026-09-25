# StayNest — Modern Frontend Architecture & Design System Specification

## 1. Architectural Philosophy & Overview

StayNest's frontend is constructed on **Next.js 15 (App Router)**, **React 19**, and **TypeScript 5**, engineered from the ground up to operate as a high-density, multi-tenant enterprise accommodation platform. 

The architecture strictly rejects dummy components, simulated timers, hardcoded metrics, and generic cloned dashboards. Every pixel and interaction directly corresponds to real transactional state in the **FastAPI 0.115** and **PostgreSQL** backend.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Browser                                │
│  (Next.js 15 App Router · React 19 · Dark Glassmorphism Design System)  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                 Bearer JWT Authorization Header (PBKDF2/HS256)
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 Typed Frontend API Layer (lib/api/*)                    │
│  client.ts ─┬─ auth.ts        ─┬─ rooms.ts       ─┬─ complaints.ts      │
│             ├─ properties.ts  ├─ allocations.ts ├─ invoices.ts        │
│             ├─ analytics.ts   ├─ documents.ts   ├─ notices.ts         │
│             └─ roommates.ts   └─ payments.ts    └─ notifications.ts   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                        RESTful JSON / Multipart
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 FastAPI Backend (/api/v1/* Endpoints)                   │
│   Auth · Properties · Rooms · Allocations · Complaints · Invoices · etc │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design System Tokens & Aesthetics

StayNest utilizes a bespoke **Dark Glassmorphism** design token system designed for visual elegance, reduced cognitive strain in high-density operational workflows, and responsive visual hierarchy.

### 2.1 Color Palette & Surface Tokens

| Token Name | Hex / RGBA Value | Usage & Meaning |
| :--- | :--- | :--- |
| **Canvas Deep** | `#06080D` | Base page background color |
| **Surface Dark** | `#090D14` | Primary cards, panels, and modal containers |
| **Surface Elevated** | `#0D131F` | Hovered cards, selected rows, sub-elements |
| **Glass Border** | `rgba(255, 255, 255, 0.06)` | Subtle dividing line across glass surfaces |
| **Glass Border Hover** | `rgba(255, 255, 255, 0.15)` | Highlighting borders upon focus or hover |
| **Backdrop Blur** | `blur(12px)` to `blur(20px)` | Translucent glass layering effect |

### 2.2 Semantic Accent Accents

| State / Domain | Token | Hex | Background Tint |
| :--- | :--- | :--- | :--- |
| **Available / Success / Paid** | Emerald | `#10B981` | `rgba(16, 185, 129, 0.1)` |
| **Occupied / Primary** | Indigo / Violet | `#6366F1` | `rgba(99, 102, 241, 0.1)` |
| **Reserved / In Triage / Pending** | Amber | `#F59E0B` | `rgba(245, 158, 11, 0.1)` |
| **Maintenance / Urgent / Rejected** | Rose | `#F43F5E` | `rgba(244, 63, 94, 0.1)` |
| **Telemetry / AI / Analytics** | Cyan / Teal | `#06B6D4` | `rgba(6, 182, 212, 0.1)` |
| **Text High Contrast** | Slate 100 | `#F1F5F9` | Primary headings, values, and titles |
| **Text Muted** | Slate 400 | `#94A3B8` | Body text, labels, subheadings |
| **Text Subtle** | Slate 600 | `#475569` | Meta timestamps, disabled indicators |

### 2.3 Typography & Micro-Animations
- **Font Stack**: Modern Sans-Serif system hierarchy (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Tabular Numerics**: Monospaced font features for financial ledgers, room identifiers, and telemetry counters (`font-mono`).
- **Transitions**: Smooth 150ms-200ms cubic bezier transitions for hover states, modal entries, and tab toggling (`transition-all duration-200 ease-out`).

---

## 3. Layout Shell Architecture & Role Isolation

### 3.1 Elimination of Nested Wrappers & Duplicate Sidebars
In legacy versions, individual page components repeatedly imported `<Sidebar />` and wrapped themselves in `min-h-screen flex` wrappers. This resulted in duplicate sidebars, layout displacement, and hydration mismatches.

The reconstructed architecture implements a single-responsibility **Role Layout Shell** pattern:

```
frontend/app/
├── (public)
│   ├── layout.tsx         <-- Public Navbar + Footer
│   ├── page.tsx
│   ├── properties/
│   ├── login/
│   └── signup/
├── dashboard/
│   ├── layout.tsx         <-- TENANT Layout Shell (Sidebar with Tenant Nav)
│   ├── page.tsx           <-- Overview (NO Sidebar import)
│   ├── room/page.tsx
│   ├── payments/page.tsx
│   ├── complaints/page.tsx
│   ├── notices/page.tsx
│   ├── documents/page.tsx
│   └── roommates/page.tsx
├── owner/
│   ├── layout.tsx         <-- PROPERTY_OWNER Shell (Sidebar with Owner Nav)
│   ├── dashboard/page.tsx
│   ├── properties/
│   ├── rooms/page.tsx
│   ├── tenants/page.tsx
│   ├── staff/page.tsx
│   ├── payments/page.tsx
│   ├── complaints/page.tsx
│   ├── analytics/page.tsx
│   └── notices/page.tsx
├── warden/
│   ├── layout.tsx         <-- WARDEN Shell (Sidebar with Warden Nav)
│   ├── dashboard/page.tsx
│   ├── residents/page.tsx
│   ├── rooms/page.tsx
│   ├── allocations/page.tsx
│   ├── complaints/page.tsx
│   └── notices/page.tsx
├── staff/
│   ├── layout.tsx         <-- STAFF Shell (Sidebar with Staff Nav)
│   ├── dashboard/page.tsx
│   ├── residents/page.tsx
│   ├── allocations/page.tsx
│   ├── complaints/page.tsx
│   ├── maintenance/page.tsx
│   └── notices/page.tsx
└── admin/
    ├── layout.tsx         <-- SUPER_ADMIN Shell (Sidebar with Admin Nav)
    ├── dashboard/page.tsx
    ├── organizations/page.tsx
    ├── users/page.tsx
    ├── properties/page.tsx
    ├── analytics/page.tsx
    ├── payments/page.tsx
    ├── audit-logs/page.tsx
    └── settings/page.tsx
```

### 3.2 Role Guarding & Authentication Flow
Each role shell's `layout.tsx` performs immediate client-side verification:
1. Inspects `localStorage.getItem("token")` and `localStorage.getItem("user")`.
2. If token is absent, saves redirect intent and redirects to `/login`.
3. If user's `role` does not match the portal's authorized roles:
   - For `/dashboard`: Requires `TENANT` (or allows `SUPER_ADMIN`).
   - For `/owner`: Requires `PROPERTY_OWNER` or `SUPER_ADMIN`.
   - For `/warden`: Requires `WARDEN` or `SUPER_ADMIN`.
   - For `/staff`: Requires `STAFF`, `WARDEN`, or `SUPER_ADMIN`.
   - For `/admin`: Requires `SUPER_ADMIN`.
4. Unauthorized attempts trigger an alert and redirect to their appropriate home dashboard.

---

## 4. Modular Typed API Client Architecture (`lib/api/*`)

All communication with the backend is centralized under `frontend/lib/api/` and strictly typed against TypeScript interfaces defined in `frontend/types/index.ts`.

### 4.1 Core Fetcher (`client.ts`)
The base fetch client encapsulates:
- **Automatic JWT Injection**: Extracts `localStorage.getItem("token")` and injects `Authorization: Bearer <token>`.
- **Intelligent Content Negotiation**: Auto-injects `Content-Type: application/json` for standard payloads, but automatically preserves boundary headers when handling `FormData` (e.g., document file uploads).
- **Uniform Error Parsing**: Unboxes FastAPI `HTTPException` detail payloads into readable JavaScript `Error` messages.
- **Session Expiry Handling**: Intercepts `401 Unauthorized` responses and redirects cleanly to `/login`.

### 4.2 Specialized Domain Modules

| API Module | Corresponding Backend Service | Key Operations |
| :--- | :--- | :--- |
| `auth.ts` | `auth.py` | `login`, `signup`, `getMe`, `logout` |
| `properties.ts` | `properties.py` | `getAll`, `getById`, `create`, `update`, `delete`, `getStats` |
| `rooms.ts` | `rooms.py` | `getRooms`, `getBeds`, `createRoom`, `updateBedStatus`, `getFloors` |
| `allocations.ts` | `allocations.py` | `getAllocations`, `getMyRoom`, `allocate`, `vacate` |
| `invoices.ts` | `invoices.py` | `getInvoices`, `getMyInvoices`, `createInvoice`, `getReceipt` |
| `payments.ts` | `payments.py` | `createOrder`, `verifyPayment` |
| `complaints.ts` | `complaints.py` | `getComplaints`, `createComplaint`, `assign`, `resolve`, `escalate` |
| `notices.ts` | `notices.py` | `getNotices`, `createNotice`, `deleteNotice` |
| `notifications.ts`| `notifications.py` | `getNotifications`, `markAsRead` |
| `documents.ts` | `documents.py` | `getDocuments`, `uploadDocument`, `downloadDocument`, `deleteDocument` |
| `roommates.ts` | `roommates.py` | `getProfile`, `updateProfile`, `getMatches` |
| `analytics.ts` | `analytics.py` | `getOwnerAnalytics`, `getAdminAnalytics` |

---

## 5. Domain Component Architecture

### 5.1 Atomic Bed Management (`components/bed/`)
The foundational business unit of StayNest is the **Bed**. To guarantee consistency across Tenant, Owner, Warden, and Staff portals, bed interactions are encapsulated into atomic components:

- `BedStatusBadge`: Color-coded indicator with pulse animations representing `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, or `RESERVED`.
- `BedActionModal`: Transactional dialog for administrative actions:
  - Direct status transitions (`AVAILABLE` ↔ `MAINTENANCE` ↔ `RESERVED`).
  - Bed allocation with Tenant ID, start date, deposit, and rent inputs.
  - Vacating workflow with reason and inspection checklist.
- `BedItem`: Interactive bed node displaying identifier, status, occupant name, and quick-action menu.
- `BedGrid`: Floor-by-floor and room-by-room matrix grouping beds into physical rooms (`Single`, `Double`, `Triple`), providing at-a-glance occupancy intelligence.

### 5.2 Primitive UI Components (`components/ui/`)
- `Card`: Translucent glassmorphic container with configurable hover highlights and gradient headers.
- `Badge`: Standardized chip for statuses, categories, and role identifiers.
- `Button`: Primary, secondary, danger, and ghost variants with integrated loading spinners.
- `Modal`: Accessible portal modal with backdrop-blur, escape-key listeners, and focus trap.
- `LoadingState`: Skeleton and pulse loaders eliminating layout shift during initial data fetch.
- `EmptyState`: Contextual illustration and call-to-action for empty lists (e.g., zero complaints, no documents).
- `ErrorState`: Friendly error card with retry triggers for network or authorization failures.
- `Tabs`: Accessible tab navigation for switching between sub-views.

---

## 6. Next.js 15 App Router Conventions & Optimization

1. **Client-Side Boundaries**: Components utilizing hooks (`useState`, `useEffect`, `useRouter`, `useSearchParams`) explicitly declare `'use client'` at the top.
2. **Dynamic Route Prerendering**: Routes reading query string parameters (such as `app/owner/rooms/page.tsx`) explicitly declare `export const dynamic = "force-dynamic"` to satisfy Next.js 15 build constraints and avoid static prerender bailouts.
3. **Hydration Integrity**: All datetime formatting runs in `useEffect` or uses standardized ISO transformations to avoid server/client locale mismatch warnings.
4. **Bundle Performance**: Heavy charting libraries (Recharts) are scoped only to dedicated analytics dashboards and render dynamically on the client, keeping public landing and tenant mobile pages lightweight.
