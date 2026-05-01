# Setup Guide

Get LaunchBoard running in under 2 minutes.

---

## Quick Start (5 commands)

```bash
cd ~/.openclaw/workspace/revenue-streams/apps/launchboard
python3 -m venv venv && source venv/bin/activate
pip install -r backend/launchboard/requirements.txt
cp backend/launchboard/.env.example backend/launchboard/.env
cd backend/launchboard && uvicorn main:app --reload --port 8000
```

In a second terminal:
```bash
cd frontend && python3 -m http.server 3000
```

Open http://localhost:3000 — done.

---

## Local Development Setup

### 1. Python Environment

```bash
# Create venv inside project root
cd launchboard/
python3 -m venv venv

# Activate
source venv/bin/activate      # Linux/Mac
venv\Scripts\activate         # Windows

# Install deps
pip install -r backend/launchboard/requirements.txt
```

Verify:
```bash
python -c "import fastapi; print(fastapi.__version__)"
# Should print version number, no errors
```

### 2. Environment File

```bash
cp backend/launchboard/.env.example backend/launchboard/.env
```

Default uses SQLite — zero additional setup. See Database Setup below if you want PostgreSQL.

### 3. Start Backend

```bash
cd backend/launchboard
uvicorn main:app --reload --port 8000
```

Verify it works:
```bash
curl http://localhost:8000/api/health
# Should return: {"status":"ok","database":"connected"}
```

Auto-generated API docs available at http://localhost:8000/docs

### 4. Start Frontend

```bash
cd frontend
python3 -m http.server 3000
```

Verify:
- Open http://localhost:3000
- You should see the LaunchBoard navbar with Dashboard / Projects links
- Check browser console — no errors on load

---

## Docker Setup

> **Status:** Docker Compose not yet configured. Planned for V2.

When available, the setup will be:

```bash
docker-compose up --build
```

Services planned:
- `backend` — FastAPI app (port 8000)
- `db` — PostgreSQL 14 (port 5432)
- `frontend` — Static file server (port 3000)

---

## Database Setup

### Option A: SQLite (Default — Recommended for MVP)

Zero configuration. The `.env` default is:
```bash
DATABASE_URL=sqlite:///./launchboard.db
```

On first backend startup, SQLAlchemy auto-creates tables. A `launchboard.db` file appears in `backend/launchboard/`.

**Good for:** solo use, quick iteration, no extra services.

**Limitations:** not ideal for concurrent writes, harder to inspect than PostgreSQL.

### Option B: PostgreSQL

1. Install PostgreSQL 14+ and create a database:
```bash
createdb launchboard
```

2. Update `.env`:
```bash
DATABASE_URL=postgresql://user:password@localhost/launchboard
```

3. Install the driver:
```bash
pip install psycopg2-binary
```

4. Restart backend. Tables auto-create on startup.

**Good for:** production, multi-user future, inspecting data with `psql` or GUI tools.

---

## Troubleshooting

### `ModuleNotFoundError: No module named 'fastapi'`

You forgot to activate the venv or install deps:
```bash
source venv/bin/activate
pip install -r backend/launchboard/requirements.txt
```

### Backend starts but frontend shows blank page

Check CORS — frontend must be served from port 3000. Verify:
```bash
curl -I http://localhost:3000
```

If you changed the frontend port, update `allow_origins` in `backend/launchboard/main.py`.

### Database locked (SQLite error)

SQLite doesn't handle concurrent writes well. If you see "database is locked":
- Make sure only one uvicorn worker is running
- Or switch to PostgreSQL

### Port already in use

Find and kill the process, or use a different port:
```bash
# Check what's on port 8000
lsof -i :8000

# Run backend on alternate port
uvicorn main:app --reload --port 8001
```

If you change the backend port, update `api.js` in the frontend to match.

### `frontend/api.js` can't reach backend

Open `frontend/api.js` and verify the `BASE_URL` matches your backend port:
```javascript
const BASE_URL = 'http://localhost:8000/api';
```

### Changes to `.env` not picking up

Restart uvicorn — it reads `.env` on startup, not dynamically.

---

## Verification Checklist

- [ ] `curl http://localhost:8000/api/health` returns `{"status":"ok"}`
- [ ] http://localhost:3000 loads with no console errors
- [ ] Can create a project from the UI
- [ ] Can create a task inside that project
- [ ] Dashboard shows updated counts
- [ ] API docs at http://localhost:8000/docs load without errors
