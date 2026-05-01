# LaunchBoard — Implementation Notes

## What Was Built

### Backend (FastAPI)
- **database.py** — SQLAlchemy engine with SQLite (default) or PostgreSQL via `DATABASE_URL` env var
- **models.py** — `Project` and `Task` models with all fields, constraints, cascade delete, and auto-updating timestamps
- **schemas.py** — Pydantic v2 schemas for all request/response types with validation (enum constraints, length limits)
- **crud.py** — Full CRUD for projects and tasks with search (case-insensitive ILIKE), status/priority filters, and dashboard stats
- **routers/projects.py** — REST endpoints: `GET /api/projects`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id`
- **routers/tasks.py** — REST endpoints: `GET /api/projects/:id/tasks`, `POST`, `GET /api/tasks/:id`, `PUT`, `DELETE`
- **routers/dashboard.py** — `GET /api/dashboard` returning aggregate stats
- **routers/health.py** — `GET /api/health` with DB connectivity check
- **main.py** — FastAPI app with CORS enabled for `localhost:3000`, all routers mounted at `/api`
- **init_db.py** — Standalone script to initialize the database

### Frontend (Vanilla JS)
- **index.html** — SPA shell with navbar, main content area, modal overlay, and toast container
- **styles.css** — Custom responsive CSS (~400 lines) with cards, badges, modals, forms, toasts, empty/error states
- **api.js** — Fetch wrapper with error handling, network error detection, and all API methods
- **app.js** — Full SPA router with:
  - Dashboard view (stat cards + recent projects)
  - Projects list view (search, status filter, priority filter)
  - Project detail view (task management with filters)
  - Create/edit modals for projects and tasks
  - Quick status change dropdowns on tasks
  - Delete confirmations
  - Toast notifications
  - Loading, empty, and error states

## Deviations from Plan
- Used Python-side sorting (via dict lookup) instead of SQLAlchemy `func.case()` for priority ordering — SQLAlchemy 2.x changed the `case()` API and the in-Python approach is more portable across SQLite/PostgreSQL
- `lazy="dynamic"` was removed from the `Project.tasks` relationship to fix an issue with `len()` on dynamic queries in the list endpoint; standard `lazy="select"` works correctly
- Timestamps use `datetime.utcnow()` (not timezone-aware) for SQLite compatibility; PostgreSQL users should switch to `datetime.now(timezone.utc)`

## Running
```bash
# Backend
cd backend/launchboard
python3 init_db.py
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
python3 -m http.server 3000
```

## Testing Verified
- All CRUD endpoints return correct JSON (200, 201, 204, 404)
- Dashboard stats update correctly after operations
- Search and filters work on projects and tasks
- Cascade delete: deleting a project removes all its tasks
- Health endpoint returns `{"status":"ok","database":"connected"}`