# LaunchBoard — Task Breakdown

## Phase 1: Setup & Backend Foundation

### Task 1.1: Initialize FastAPI Project
**Owner:** Ludwig (appbuilder)
**Priority:** Critical
**Context:** Backend foundation for LaunchBoard
**Inputs:** ARCHITECTURE.md, API_CONTRACT.md
**Files Allowed:** backend/launchboard/
**Files Off-Limits:** frontend/
**Expected Output:** FastAPI project with dependencies (requirements.txt), basic app structure
**Acceptance Criteria:**
- `requirements.txt` with FastAPI, SQLAlchemy, psycopg2-binary, uvicorn
- `main.py` with basic FastAPI app instance
- App starts with `uvicorn main:app --reload`
**Validation Required:** Run backend, verify `GET /` returns welcome message
**Risks to Watch:** Dependency conflicts, missing PostgreSQL driver

### Task 1.2: Database Models & Connection
**Owner:** Ludwig
**Priority:** Critical
**Context:** Database layer per DATABASE_SCHEMA.md
**Inputs:** DATABASE_SCHEMA.md
**Files Allowed:** backend/launchboard/models.py, backend/launchboard/database.py
**Expected Output:** SQLAlchemy models for Project and Task, database engine setup
**Acceptance Criteria:**
- `Project` model with all fields and constraints
- `Task` model with all fields, FK, and cascade delete
- Database connection configured via environment variables
- `create_all()` creates tables on startup
**Validation Required:** Connect to PostgreSQL, verify tables created
**Risks to Watch:** Missing CHECK constraints in SQLAlchemy, cascade delete misconfiguration

### Task 1.3: Pydantic Schemas
**Owner:** Ludwig
**Priority:** Critical
**Context:** Request/response validation
**Inputs:** API_CONTRACT.md
**Files Allowed:** backend/launchboard/schemas.py
**Expected Output:** Pydantic models for all API operations
**Acceptance Criteria:**
- `ProjectCreate`, `ProjectUpdate`, `ProjectResponse` schemas
- `TaskCreate`, `TaskUpdate`, `TaskResponse` schemas
- `DashboardStats` schema
- Proper field validation (length limits, enums)
**Validation Required:** Test schema validation with valid and invalid data

### Task 1.4: CRUD Operations
**Owner:** Ludwig
**Priority:** Critical
**Context:** Database operations layer
**Files Allowed:** backend/launchboard/crud.py
**Expected Output:** Reusable CRUD functions for projects and tasks
**Acceptance Criteria:**
- `get_projects()`, `create_project()`, `update_project()`, `delete_project()`
- `get_tasks()`, `create_task()`, `update_task()`, `delete_task()`
- Search/filter support (title ILIKE, status, priority)
- `get_dashboard_stats()`
**Validation Required:** Unit test each CRUD function

### Task 1.5: API Routers
**Owner:** Ludwig
**Priority:** Critical
**Context:** REST endpoints per API_CONTRACT.md
**Files Allowed:** backend/launchboard/routers/*.py, backend/launchboard/main.py
**Expected Output:** All API endpoints implemented and wired
**Acceptance Criteria:**
- `GET /api/health` → status check
- `GET /api/projects` → list with search/filter
- `POST /api/projects` → create
- `GET /api/projects/{id}` → retrieve
- `PUT /api/projects/{id}` → update
- `DELETE /api/projects/{id}` → delete
- `GET /api/projects/{id}/tasks` → list tasks
- `POST /api/projects/{id}/tasks` → create task
- `GET /api/tasks/{id}` → retrieve task
- `PUT /api/tasks/{id}` → update task
- `DELETE /api/tasks/{id}` → delete task
- `GET /api/dashboard` → stats
**Validation Required:** Test all endpoints with curl/httpie
**Risks to Watch:** Route ordering conflicts, missing 404 handling

## Phase 2: Frontend Implementation

### Task 2.1: Frontend Shell & Styling
**Owner:** Ludwig
**Priority:** High
**Context:** UI foundation
**Files Allowed:** frontend/index.html, frontend/styles.css, frontend/app.js
**Expected Output:** Static HTML shell with CSS styling
**Acceptance Criteria:**
- Responsive layout (mobile + desktop)
- Clean card-based design
- Color-coded status badges
- Priority indicators
- No console errors on load
**Validation Required:** Open in browser, verify layout at multiple widths

### Task 2.2: API Client
**Owner:** Ludwig
**Priority:** High
**Context:** Frontend-backend communication
**Files Allowed:** frontend/api.js
**Expected Output:** JavaScript wrapper for all API calls
**Acceptance Criteria:**
- `fetchProjects()`, `createProject()`, `updateProject()`, `deleteProject()`
- `fetchTasks()`, `createTask()`, `updateTask()`, `deleteTask()`
- `getDashboardStats()`
- Error handling for network failures
- JSON parsing and validation
**Validation Required:** Test against running backend

### Task 2.3: Dashboard View
**Owner:** Ludwig
**Priority:** High
**Context:** Main landing page
**Files Allowed:** frontend/app.js (dashboard section)
**Expected Output:** Dashboard with summary cards and project list
**Acceptance Criteria:**
- Summary cards: total, active, completed projects + blocked tasks
- Recent projects list (top 5)
- Quick "Create Project" button
- Empty state when no projects
- Data refreshes on changes
**Validation Required:** Verify stats update after CRUD operations

### Task 2.4: Projects View
**Owner:** Ludwig
**Priority:** High
**Context:** Full project management
**Files Allowed:** frontend/app.js (projects section)
**Expected Output:** Project list with search, create, edit, delete
**Acceptance Criteria:**
- Project cards with title, status, priority, task count
- Search by title (real-time filter)
- Create project modal/form
- Edit project inline or modal
- Delete with confirmation
- Sort by priority then date
**Validation Required:** Full CRUD cycle test

### Task 2.5: Project Detail & Tasks View
**Owner:** Ludwig
**Priority:** High
**Context:** Task management within projects
**Files Allowed:** frontend/app.js (project detail section)
**Expected Output:** Project detail page with task management
**Acceptance Criteria:**
- Project info display
- Task list with status/priority filters
- Create task form
- Quick status change (dropdown or buttons)
- Edit task modal
- Delete task with confirmation
- Search tasks by title
- Empty states for each filter
**Validation Required:** Create project → add tasks → update status → delete task

## Phase 3: Integration & Testing

### Task 3.1: End-to-End Integration Test
**Owner:** Hawkeye (dev-qa)
**Priority:** Critical
**Context:** Verify full stack works together
**Inputs:** REQUIREMENTS.md, API_CONTRACT.md
**Files Allowed:** reports/qa_report.md
**Expected Output:** QA report with test results
**Acceptance Criteria:**
- Create project → appears in dashboard
- Edit project → changes persist after refresh
- Delete project → removes from list
- Create task → appears in project
- Update task status → dashboard updates
- Filter tasks → correct results
- Search → finds matching items
- Backend offline → frontend shows error
- Invalid forms → validation errors shown
**Validation Required:** Manual testing of all user stories

### Task 3.2: Bug Investigation (if needed)
**Owner:** Hawkeye
**Priority:** High
**Context:** Only if Task 3.1 finds issues
**Expected Output:** BUG_REPORT.md with root cause and fix recommendations
**Acceptance Criteria:**
- Bug clearly described
- Reproduction steps
- Likely cause identified
- Fix recommendation provided
**Validation Required:** Verify fix resolves issue

## Phase 4: Infrastructure & Review

### Task 4.1: DevOps Review
**Owner:** Shepard (shepard)
**Priority:** Medium
**Context:** Infrastructure readiness
**Files Allowed:** reports/infra_report.md
**Expected Output:** Infrastructure review document
**Acceptance Criteria:**
- Backend start command documented
- Frontend served (can be static files)
- Database setup instructions
- Environment variables documented
- Health endpoint verified
- Dockerfile created (optional but recommended)
**Validation Required:** Fresh clone → follow setup instructions → app runs

### Task 4.2: Security Review
**Owner:** Sentinel (dev-security)
**Priority:** High
**Context:** Basic security checks
**Files Allowed:** reports/security_review.md
**Expected Output:** Security findings report
**Acceptance Criteria:**
- No secrets in code
- No unsafe eval/dynamic code
- Input validation checked
- Error messages don't leak DB details
- CORS configured appropriately
**Validation Required:** Review code for security issues

## Phase 5: Documentation

### Task 5.1: README & Setup Docs
**Owner:** Scribe (scribe)
**Priority:** Medium
**Context:** User-facing documentation
**Expected Output:** README.md with setup instructions
**Acceptance Criteria:**
- What the app does
- Prerequisites (Python 3.8+, PostgreSQL)
- Installation steps
- Running locally
- Environment variables
- API overview
**Validation Required:** Follow README on clean environment

### Task 5.2: Final Integration Review
**Owner:** Tars (main)
**Priority:** Critical
**Context:** Orchestrator validates everything
**Expected Output:** FINAL_REVIEW.md
**Acceptance Criteria:**
- All requirements satisfied
- API matches frontend usage
- Database supports all flows
- QA passed or bugs documented
- Security review completed
- Infrastructure documented
- README accurate
**Validation Required:** Review all artifacts, verify consistency

## Parallel Execution Plan
```
Phase 1 (Backend): Tasks 1.1 → 1.2 → 1.3 → 1.4 → 1.5 (sequential)
Phase 2 (Frontend): Tasks 2.1 → 2.2 → 2.3 → 2.4 → 2.5 (sequential)
Phase 3 (QA): Task 3.1 (after Phases 1+2 complete)
Phase 4 (Infra): Task 4.1 (after Phase 3, parallel with 4.2)
Phase 4 (Security): Task 4.2 (after Phase 3)
Phase 5 (Docs): Task 5.1 (after Phase 4)
Phase 5 (Review): Task 5.2 (after all phases)
```

## Active File Claims
| File | Owner | Status |
|------|-------|--------|
| backend/launchboard/main.py | Ludwig | Ready |
| backend/launchboard/models.py | Ludwig | Ready |
| backend/launchboard/schemas.py | Ludwig | Ready |
| backend/launchboard/crud.py | Ludwig | Ready |
| backend/launchboard/routers/*.py | Ludwig | Ready |
| frontend/index.html | Ludwig | Ready |
| frontend/styles.css | Ludwig | Ready |
| frontend/app.js | Ludwig | Ready |
| frontend/api.js | Ludwig | Ready |
| reports/qa_report.md | Hawkeye | Pending |
| reports/infra_report.md | Shepard | Pending |
| reports/security_review.md | Sentinel | Pending |
| README.md | Scribe | Pending |
| FINAL_REVIEW.md | Tars | Pending |
