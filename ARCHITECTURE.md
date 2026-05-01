# LaunchBoard — Architecture Document

## Summary
LaunchBoard is a single-user project management app with a FastAPI backend, vanilla JS frontend, and PostgreSQL database. Designed for simplicity and fast iteration.

## Architectural Goals
1. Simplicity first — minimal abstractions, clear data flow
2. Single-user — no auth complexity for MVP
3. Fast feedback loop — backend + frontend run locally with hot reload
4. Stateless backend — all state in PostgreSQL
5. API-driven — frontend consumes REST API exclusively

## System Context
```
┌─────────────┐     HTTP/REST      ┌─────────────┐     SQL      ┌─────────────┐
│   Browser   │ ◄──────────────► │  FastAPI    │ ◄──────────► │ PostgreSQL  │
│  (Vanilla   │                    │  Backend    │              │             │
│     JS)     │                    │  (Python)   │              │             │
└─────────────┘                    └─────────────┘              └─────────────┘
```

## Component Architecture

### Backend (FastAPI)
- **Main app**: `main.py` — FastAPI instance, CORS, lifespan events
- **Models**: SQLAlchemy models for Project and Task
- **Schemas**: Pydantic models for request/response validation
- **CRUD**: Reusable CRUD operations for projects and tasks
- **Routers**: `/api/projects`, `/api/tasks`, `/api/dashboard`, `/api/health`
- **Database**: SQLAlchemy + asyncpg (or psycopg2 sync for simplicity)
- **Config**: Environment-based config (`.env` support)

### Frontend (Vanilla JS)
- **index.html**: Main HTML shell
- **app.js**: Application logic, routing, state management
- **api.js**: HTTP client wrapper
- **components/**: Reusable UI components (cards, forms, filters)
- **styles.css**: Custom CSS (no framework, ~300 lines)

### Database (PostgreSQL)
- Two tables: `projects` and `tasks`
- One-to-many relationship: project → tasks
- Indexes on: status, priority, created_at, project_id

## Data Flow
1. User interacts with frontend (click, form submit)
2. Frontend calls REST API via `fetch()`
3. Backend validates request with Pydantic schemas
4. Backend performs CRUD operation via SQLAlchemy
5. Backend returns JSON response
6. Frontend updates UI

## API & Integration Boundaries
- Frontend ↔ Backend: JSON over HTTP
- No authentication headers required (MVP)
- CORS enabled for local development
- Content-Type: application/json

## Database Architecture
- PostgreSQL 14+
- SQLAlchemy ORM (sync mode for simplicity)
- Auto-migration via SQLAlchemy create_all (MVP — Alembic for production)
- Connection pooling via SQLAlchemy engine

## Auth & Permission Architecture
- **MVP**: No auth. Single implicit user.
- **Future**: JWT or session-based auth added without schema changes

## Reliability & Failure Design
- Backend crashes: Frontend shows "Service unavailable"
- DB connection fails: Backend returns 500 with error detail
- Invalid API calls: 422 validation errors with field-level messages
- Not found: 404 with clear message

## Scalability & Performance Considerations
- Single-user MVP — no horizontal scaling needed
- Backend stateless, can scale if needed later
- Database queries use indexes for filtering/sorting
- No pagination needed for MVP (expect < 100 projects)

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | FastAPI over Flask/Django | Modern, async-ready, built-in validation |
| Frontend | Vanilla JS over Vue/React | Zero build step, faster iteration |
| Database | PostgreSQL over SQLite | Production-ready, supports future multi-user |
| ORM | SQLAlchemy over raw SQL | Maintainable, migration-ready |
| Auth | None for MVP | Removes complexity, focus on core features |
| Styling | Custom CSS over Tailwind | No build step, minimal overhead |

## Downstream Agent Handoff
- **Vault**: Refine database schema with indexes and constraints
- **Covenant**: Design API contracts with request/response schemas
- **Ludwig**: Implement backend and frontend per this architecture
- **Hawkeye**: Test all API endpoints and user flows

## Open Questions
- Do we want due dates in MVP? (No — out of scope)
- Do we want tags/labels? (No — out of scope)
- Do we want drag-and-drop task ordering? (No — out of scope)
