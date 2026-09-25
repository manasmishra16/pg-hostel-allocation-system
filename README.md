# 🏡 STAYNEST

> *"Your home away from home."*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.12-yellow?style=flat&logo=python)](https://www.python.org/)

**StayNest** is an enterprise-grade full-stack SaaS platform engineered for PG (Paying Guest) and Hostel management. Built with a high-performance **FastAPI** backend, an architectural dark-luxury **Next.js 15** frontend, and a **PostgreSQL** database enforcing atomic bed-level inventory allocation.

---

## 📸 Mockup-Accurate Visual Design

StayNest is designed with a dark luxury cinematic UI inspired by modern architectural hospitality:
- **Cinematic Dark Aesthetics:** Deep midnight glass (`#090D14`), translucent glassmorphic containers, subtle borders (`rgba(255, 255, 255, 0.08)`), and backdrop blur.
- **Accents:** Emerald `#10B981` accents and warm amber warning highlights.
- **9 Core Interfaces:**
  1. **Landing Page:** Hero discovery, floating search bar, animated statistics, curated Bengaluru properties.
  2. **Property Discovery:** Multi-parameter search & quick-filter pills (Boys, Girls, AC, Food, WiFi).
  3. **Property Details:** Photographic gallery, interactive live bed selector, and booking card.
  4. **Student/Tenant Dashboard:** Active room & bed cards, rent due date, recent announcements, quick actions.
  5. **Bed-Level Room Visualizer:** Real-time occupancy state of every bed in the hostel.
  6. **Roommate Compatibility:** Multi-factor weighted lifestyle algorithm (Circadian, Cleanliness, Noise, Study habits).
  7. **Invoicing & Razorpay Payments:** Cryptographically verified HMAC transactions and rent history.
  8. **Maintenance & AI Triage:** OpenAI/Rule assisted auto-categorization and priority routing.
  9. **Owner & Admin Enterprise Portals:** Portfolio oversight, Recharts occupancy trends, and staff operations.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, Glassmorphic Design System
- **State & Data:** TanStack Query, React Context
- **Icons & Visuals:** Lucide React, Recharts, Framer Motion

### Backend
- **Framework:** FastAPI, Python 3.12 (`uv` package manager)
- **Data Validation & ORM:** Pydantic v2, SQLAlchemy 2.0, Alembic
- **Security:** Native `bcrypt`, JWT Tokens, Strict Role-Based Access Control (`SUPER_ADMIN`, `PROPERTY_OWNER`, `WARDEN`, `STAFF`, `TENANT`)
- **Payments:** Razorpay Server SDK with cryptographic HMAC signature verification
- **Testing:** Pytest (100% test pass rate)

### Database
- **Engine:** PostgreSQL 16 (or Supabase)
- **Inventory Model:** Atomic `Property -> Building -> Floor -> Room -> Bed -> Allocation -> Tenant`

---

## 🛠️ Project Structure

```
pg-hostel-allocation-system/
├── frontend/                     # Next.js 15 App Router Frontend
│   ├── app/                      # Routes: landing, discovery, dashboard, owner, admin, auth
│   ├── components/               # Navbar, Sidebar, Header, Footer, Glass Cards
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Typed API client, Auth context with persona switcher
│   ├── types/                    # TypeScript domain interfaces
│   └── public/                   # Static assets
│
├── backend/                      # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py               # Application entrypoint & auto-seeding
│   │   ├── core/                 # Config, Database engine, Security (Bcrypt/JWT), RBAC
│   │   ├── models/               # SQLAlchemy 2.0 ORM Entities
│   │   ├── schemas/              # Pydantic v2 domain schemas
│   │   ├── services/             # Allocation, Roommate matching, Payments, Complaints
│   │   ├── api/v1/               # REST Endpoints (/auth, /properties, /rooms, /invoices, etc.)
│   │   └── ai/                   # AI Complaint Triage module
│   ├── tests/                    # Pytest test suite
│   ├── alembic/                  # Database migration versioning
│   └── Dockerfile                # Production containerfile
│
├── database/                     # PostgreSQL DDL & Seed Data
│   ├── schema/staynest_schema.sql
│   ├── seed/seed_data.sql        # Bengaluru sample dataset (Koramangala, HSR, Indiranagar)
│   └── legacy/                   # Historical archived legacy schema
│
├── docs/                         # Comprehensive Documentation
│   ├── LEGACY_ANALYSIS.md        # Complete audit of legacy system
│   ├── ARCHITECTURE.md           # Deep dive into system architecture & algorithms
│   ├── API.md                    # Full REST API documentation
│   └── DATABASE.md               # Database schema & entity relationships
│
├── docker-compose.yml            # Multi-service local orchestration
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js** >= 18.18
- **Python** >= 3.12 (or `uv`)
- **PostgreSQL** or Docker

### 1. Backend Setup

```bash
cd backend

# Create virtual environment & install dependencies
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000`.  
Swagger interactive API docs: `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Frontend will be live at `http://localhost:3000`.

### 3. Docker Compose (All Services)

```bash
docker-compose up --build
```

---

## 🔑 Pre-Configured Demo Personas

The application includes a 1-click **Persona Switcher** in the navigation bar to immediately test all role experiences without needing manual credentials:

| Persona | Role | Email | Password |
|---|---|---|---|
| **Manas Mishra** | `TENANT` | `manas@staynest.com` | `password123` |
| **Rajesh Sharma** | `PROPERTY_OWNER` | `owner@staynest.com` | `password123` |
| **Vipin Rao** | `WARDEN` | `warden@staynest.com` | `password123` |
| **Suresh Kumar** | `STAFF` | `staff@staynest.com` | `password123` |
| **Priya Nair** | `SUPER_ADMIN` | `admin@staynest.com` | `password123` |

---

## 🧪 Running Tests

```bash
cd backend
pytest tests/test_staynest.py -v
```
**Test Coverage:**
- Authentication & JWT Token generation
- Double-allocation prevention on beds
- Weighted roommate compatibility algorithm
- Razorpay HMAC payment verification
- Complaint lifecycle & AI triage
- RBAC permission enforcement
