# LaunchBoard — Infrastructure & Deployment Report

**Prepared by:** Shepard (DevOps)  
**Date:** 2026-05-01  
**Status:** Ready for local development + Docker deployment

---

## Table of Contents

1. [Local Development (SQLite)](#local-dev)
2. [Docker Deployment (PostgreSQL)](#docker-deploy)
3. [Environment Variables](#env-vars)
4. [Health Check Verification](#health-check)
5. [Build & Run Commands](#commands)
6. [Known Issues & Limitations](#issues)
7. [Architecture Overview](#architecture)

---

## 1. Local Development (SQLite) {#local-dev}

### Prerequisites
- Python 3.11+
- pip

### Setup

```bash
cd backend/launchboard

# 1. Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### What happens on startup
- `main.py` calls `Base.metadata.create_all(bind=engine)` → creates SQLite tables automatically
- SQLite file: `launchboard.db` (in `backend/launchboard/`)
- No manual migration needed for MVP

### Frontend (local)
Open `frontend/index.html` directly in browser, or serve with any static server:
```bash
cd frontend
python3 -m http.server 3000
```

---

## 2. Docker Deployment (PostgreSQL) {#docker-deploy}

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+

### Setup

```bash
cd /path/to/launchboard

# 1. Create .env file (copy from example)
cp backend/launchboard/.env.example .env
# Edit .env and set PostgreSQL credentials

# 2. Build and start all services
docker-compose up --build -d

# 3. Verify services are running
docker-compose ps
docker-compose logs -f backend
```

### What the stack includes
| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `postgres` | `postgres:latest` | 5432 | PostgreSQL database |
| `backend` | Built from `backend/launchboard/Dockerfile` | 8000 | FastAPI application |
| `frontend` | `nginx:alpine` | 3000 | Static file server for HTML/JS/CSS |

### Stopping
```bash
docker-compose down          # Stop containers
docker-compose down -v       # Stop + remove volumes (⚠️ deletes DB data)
```

---

## 3. Environment Variables {#env-vars}

### `.env` File (Docker)
```bash
# PostgreSQL credentials (used by docker-compose.yml)
POSTGRES_USER=launchboard
POSTGRES_PASSWORD=changeme
POSTGRES_DB=launchboard
```

### `backend/launchboard/.env` (Local Dev)
```bash
# SQLite (default for local development)
DATABASE_URL=sqlite:///./launchboard.db

# PostgreSQL (switch to this for Docker or local PostgreSQL)
# DATABASE_URL=postgresql://launchboard:changeme@localhost/launchboard
```

### Variable Reference
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `sqlite:///./launchboard.db` | SQLAlchemy connection string |
| `POSTGRES_USER` | Yes (Docker) | `launchboard` | PostgreSQL username |
| `POSTGRES_PASSWORD` | Yes (Docker) | `launchboard` | PostgreSQL password |
| `POSTGRES_DB` | Yes (Docker) | `launchboard` | PostgreSQL database name |

---

## 4. Health Check Verification {#health-check}

### Endpoint
```
GET http://localhost:8000/api/health
```

### Expected Response
```json
{
  "status": "ok",
  "database": "connected"
}
```

### How to verify
```bash
# cURL
curl http://localhost:8000/api/health

# Browser
# Open http://localhost:8000/api/health

# Python
python3 -c "import urllib.request; print(urllib.request.urlopen('http://localhost:8000/api/health').read())"
```

### Container Health Check
The `backend` Dockerfile includes a `HEALTHCHECK` instruction that polls `/api/health` every 30 seconds.

---

## 5. Build & Run Commands {#commands}

### Quick Reference

| Action | Command |
|--------|---------|
| Local dev (backend) | `cd backend/launchboard && uvicorn main:app --reload` |
| Local dev (frontend) | `cd frontend && python3 -m http.server 3000` |
| Docker build | `docker-compose up --build -d` |
| Docker rebuild | `docker-compose up --build --force-recreate -d` |
| View logs | `docker-compose logs -f [service]` |
| Stop all | `docker-compose down` |
| Clean stop | `docker-compose down -v` |
| Backend shell | `docker-compose exec backend bash` |
| DB shell | `docker-compose exec postgres psql -U launchboard` |

### Useful Docker Commands
```bash
# Check running containers
docker ps

# Inspect backend logs
docker logs launchboard_backend

# Restart a service
docker-compose restart backend

# Scale (not needed for single-user, but possible)
# docker-compose up -d --scale backend=2
```

---

## 6. Known Issues & Limitations {#issues}

### Current

| Issue | Severity | Notes |
|-------|----------|-------|
| **No database migrations** | Medium | Uses `create_all()` — fine for MVP, needs Alembic for production schema changes |
| **No persistent SQLite in Docker** | Low | Docker uses PostgreSQL; SQLite is local-dev only |
| **No HTTPS/TLS** | Medium | Add reverse proxy (nginx/traefik + certbot) for production |
| **No auth/session management** | Low | By design for MVP — single user only |
| **Frontend on port 3000, backend on 8000** | Low | CORS pre-configured for these origins |
| **Nginx serves frontend as static files only** | Low | No SSR, no build step — aligns with vanilla JS architecture |
| **psycopg2-binary not in requirements.txt** | Low | `requirements.txt` only has `sqlalchemy` — psycopg2 is pulled by SQLAlchemy when needed or add explicitly |

### Recommended Next Steps
1. Add `psycopg2-binary` to `requirements.txt` for explicit PostgreSQL support
2. Set up Alembic for database migrations before production schema changes
3. Configure `nginx.conf` with gzip, caching headers, and security headers
4. Add `.env.production` template with stricter defaults
5. Set up log rotation for containers

---

## 7. Architecture Overview {#architecture}

```
┌─────────────┐     HTTP:3000      ┌─────────────┐     HTTP:8000      ┌─────────────┐     SQL      ┌─────────────┐
│   Browser   │ ◄──────────────► │   Nginx     │ ◄──────────────► │   FastAPI   │ ◄──────────► │  PostgreSQL │
│             │                    │  (frontend) │                    │  (backend)  │              │             │
│             │                    │  static     │                    │  API        │              │             │
└─────────────┘                    └─────────────┘                    └─────────────┘              └─────────────┘
                                        ↑                                                                  ↑
                                        │                                                                  │
                                   ┌─────────────┐                                              ┌─────────────┐
                                   │ frontend/   │                                              │   Volume    │
                                   │ (mounted)   │                                              │ postgres_data│
                                   └─────────────┘                                              └─────────────┘
```

---

## File Inventory

| File | Purpose |
|------|---------|
| `backend/launchboard/Dockerfile` | Python 3.11 slim container for FastAPI |
| `backend/.dockerignore` | Excludes Python cache, .env, SQLite, etc. |
| `docker-compose.yml` | Orchestrates postgres + backend + frontend |
| `backend/launchboard/.env.example` | Template for local dev environment |
| `reports/infra_report.md` | This document |

---

*End of report.*
