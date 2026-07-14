# Salon App — Booking MVP

Booking-first management system for a single salon. Django REST Framework backend, React + Vite + TypeScript frontend, PostgreSQL.

This repository is intended as a **blueprint**: clone it per salon client and stand up a fresh
instance (see [Cloning this for a new salon](#cloning-this-for-a-new-salon)). No salon data is
ever committed to git — every migration is schema-only (no seed rows), so a freshly migrated
database starts completely empty.

## Stack

- Backend: Python / Django / Django REST Framework / PostgreSQL
- Frontend: React + TypeScript (Vite)
- Auth: Django session auth (staff/admin only). Clients book as guests, no account required.

## Project layout

```
backend/    Django project (config/) + catalog app (Service, Staff, BusinessHours,
            StaffUnavailability, StaffTimeOff, Product) + booking app (Client,
            Appointment, slot logic, API)
frontend/   React + Vite + TypeScript SPA
```

Routing note: the React app owns `/admin/*` (the staff dashboard). Django's own admin site
(used to manage Services, Staff, Products, business hours, and staff unavailability/time off) is
served at `/django-admin/` instead of the usual `/admin/`, to avoid colliding with the React
routes.

## Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL running locally (or reachable via `DATABASE_URL`)

## Backend setup

```bash
cd backend
python -m venv venv
./venv/Scripts/activate        # Windows; use `source venv/bin/activate` on macOS/Linux
pip install -r requirements.txt

cp .env.example .env           # then edit DATABASE_URL etc. if needed
```

Create the database and role (adjust to match your `.env`):

```sql
CREATE ROLE salon_user WITH LOGIN PASSWORD 'salon_pass';
CREATE DATABASE salon_dev OWNER salon_user;
GRANT ALL PRIVILEGES ON DATABASE salon_dev TO salon_user;
ALTER ROLE salon_user CREATEDB;   -- needed so `manage.py test` can create/drop the test DB
```

Then:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend now runs at `http://127.0.0.1:8000`. Django admin (Service/Staff/Product/business hours
management) is at `http://127.0.0.1:8000/django-admin/`.

Run tests with:

```bash
python manage.py test
```

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api`, `/django-admin`, `/static`, and
`/media` to the Django dev server — so from the browser everything is same-origin, no CORS
configuration needed. **The proxy intentionally omits `changeOrigin`**: keeping the original
`Host: localhost:5173` header is what makes Django's CSRF Origin check pass without needing
`CSRF_TRUSTED_ORIGINS` in dev.

## Using it

**Public site** (`http://localhost:5173/`):
- `/` — landing page
- `/services` — services grouped by category
- `/shop` — retail products grouped by category
- `/book` — guest booking flow (category → service → stylist → time → your details → confirm)

**Staff dashboard** (`/admin/login`, session auth): Today, Calendar, Clients, Products, Reports,
Settings. Settings links out to Django admin for catalog management.

To try it end to end:
1. Log into `http://localhost:5173/django-admin/` with your superuser and create at least one
   `Service`, one `Staff` member, some `BusinessHours` for the shop, and optionally a `Product`.
2. Visit `http://localhost:5173/book` and complete a guest booking.
3. Log into `http://localhost:5173/admin/login` with a Django user to see it on the dashboard.

## Cloning this for a new salon

Nothing salon-specific is committed to git — no fixtures, no data migrations, no seed rows. A
fresh clone needs three things set up locally (none of them tracked by git):

1. **A new `.env`** — copy `backend/.env.example` to `backend/.env` (and
   `frontend/.env.example` to `frontend/.env`) and fill in a fresh `SECRET_KEY` and
   `DATABASE_URL`.
2. **A new Postgres database** — create a dedicated role/database for this instance (see
   [Backend setup](#backend-setup) above), then run `python manage.py migrate`. Since every
   migration is pure schema, this produces empty tables — no other salon's clients, staff,
   services, or appointments carry over.
3. **A new superuser** — run `python manage.py createsuperuser` to create the login for this
   salon's own admin.

From there, populate `BusinessHours`, `Service`, `Staff`, and `Product` for the new salon through
Django admin, swap the placeholder brand name in `frontend/src/components/PublicHeader.tsx` and
`frontend/src/pages/Landing.tsx`, and it's ready to run as that salon's own instance.

## Out of scope for this MVP

Cart/checkout and payment processing (the Shop is a browsable catalog only), inventory/stock
quantity tracking, automated SMS/email reminder sending (the `Appointment.reminder_sent_at`
field exists as a schema hook only), staff commission tracking, multi-tenant support (this is a
single-salon-per-instance blueprint, not a shared multi-tenant platform), native mobile app,
Docker (deferred to a later version — config is env-var driven throughout to keep dockerizing
later a packaging exercise, not a refactor), and DB-level exclusion constraints for booking
overlaps (handled at the application layer instead).
