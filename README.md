# 🚀 LaunchBoard

Lightweight project management for solo builders and small teams. No Jira bloat, no Asana complexity — just projects, tasks, and a clean dashboard.

<!-- ![LaunchBoard Screenshot](screenshots/dashboard.png) -->

---

## Features

- **Project CRUD** — create, edit, track projects with statuses (idea → active → paused → completed)
- **Task CRUD** — tasks live inside projects with todo / in_progress / blocked / done states
- **Priority levels** — low, medium, high on both projects and tasks
- **Search & Filter** — find projects and tasks by title, filter by status or priority
- **Dashboard** — at-a-glance stats: active projects, blocked tasks, completion counts
- **Fast & Local** — runs entirely on your machine, zero external dependencies

---

## Prerequisites

- **Python 3.11+**
- (Optional) **PostgreSQL 14+** if you want to switch from SQLite
- (Optional) **Docker** if you prefer containerized setup later

---

## Installation

```bash
# 1. Clone
cd ~/.openclaw/workspace/revenue-streams/apps/launchboard

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r backend/launchboard/requirements.txt

# 4. Copy environment file
cp backend/launchboard/.env.example backend/launchboard/.env
```

---

## Running Locally

**Backend (port 8000):**
```bash
cd backend/launchboard
uvicorn main:app --reload --port 8000
```
You should see:
```
Uvicorn running on http://127.0.0.1:8000
```

**Frontend (port 3000):**
```bash
cd frontend
python3 -m http.server 3000
```
You should see:
```
Serving HTTP on 0.0.0.0 port 3000
```

Open http://localhost:3000 in your browser.

---

## Environment Variables

Copy `.env.example` to `.env` and adjust:

```bash
# SQLite (default — zero setup)
DATABASE_URL=sqlite:///./launchboard.db

# PostgreSQL (switch when ready)
# DATABASE_URL=postgresql://user:password@localhost/launchboard
```

No other env vars needed for MVP — this app runs without auth keys or external services.

---

## API Overview

Base URL: `http://localhost:8000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service + DB health check |
| GET | `/projects` | List projects (search, status, priority filters) |
| POST | `/projects` | Create a new project |
| GET | `/projects/{id}` | Get single project |
| PUT | `/projects/{id}` | Update project |
| DELETE | `/projects/{id}` | Delete project |
| GET | `/projects/{id}/tasks` | List tasks in a project |
| POST | `/projects/{id}/tasks` | Create task in project |
| GET | `/tasks/{id}` | Get single task |
| PUT | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |
| GET | `/dashboard` | Summary stats |

Interactive docs: http://localhost:8000/docs

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI + SQLAlchemy + Pydantic + Uvicorn |
| Frontend | Vanilla JS + Custom CSS (~300 lines) |
| Database | SQLite (default) / PostgreSQL (optional) |
| API Style | REST JSON, no auth for MVP |

---

## Project Structure

```
launchboard/
├── backend/
│   └── launchboard/
│       ├── main.py              # FastAPI app, CORS, router wiring
│       ├── database.py          # SQLAlchemy engine + session
│       ├── models.py            # Project & Task ORM models
│       ├── schemas.py           # Pydantic request/response models
│       ├── crud.py              # Reusable DB operations
│       ├── .env.example         # Environment template
│       ├── requirements.txt     # Python deps
│       └── routers/
│           ├── health.py        # GET /health
│           ├── projects.py      # Project CRUD
│           ├── tasks.py         # Task CRUD
│           └── dashboard.py     # GET /dashboard stats
├── frontend/
│   ├── index.html
│   ├── app.js                   # App logic, routing, state
│   ├── api.js                   # fetch() wrapper
│   └── styles.css               # Custom styles
├── PROJECT_BRIEF.md
├── ARCHITECTURE.md
├── API_CONTRACT.md
└── DATABASE_SCHEMA.md
```

---

## Future Improvements

- [ ] User auth / multi-user support
- [ ] Due dates + calendar view
- [ ] Task comments / notes
- [ ] File attachments
- [ ] Drag-and-drop task ordering
- [ ] Dark mode
- [ ] Docker Compose setup
- [ ] Alembic migrations for production
