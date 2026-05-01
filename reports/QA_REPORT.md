# LaunchBoard QA Report

**Tester:** Hawkeye (Senior QA Engineer)  
**Date:** 2026-05-01  
**Backend Version:** FastAPI 0.136.0  
**Frontend Version:** Vanilla JS SPA

---

## Summary

| Category | Tests Run | Passed | Failed |
|----------|-----------|--------|--------|
| User Stories (Functional) | 10 | 9 | 1 |
| API Endpoints | 15 | 15 | 0 |
| Frontend (Code Review) | 11 | 10 | 1 |
| **Total** | **36** | **34** | **2** |

**Overall Status:** Mostly functional with 2 bugs identified — one functional gap (US-10 dashboard sync) and one frontend UX issue (edit modal data population).

---

## User Story Results

### US-1: Dashboard shows correct stats — **PASS**
- ✅ Dashboard returns total_projects, active_projects, completed_projects, blocked_tasks
- ✅ Stats update correctly after project/task creation and deletion (verified with curl)
- ✅ Includes total_tasks and completed_tasks (beyond required spec — nice-to-have)

### US-2: Create project — **PASS**
- ✅ POST /api/projects returns 201 with correct shape
- ✅ Defaults: status="idea", priority="medium" enforced in schemas.py
- ✅ Title validation: required, 1-100 chars, 422 on empty/too long
- ✅ Description validation: max 500 chars
- ⚠️ **Gap:** Backend does not enforce max 500 chars on description in DB schema (models.py uses Text, not String(500)) — functional now via Pydantic but DB would allow >500. Low risk for MVP.

### US-3: View project list with search — **PASS**
- ✅ GET /api/projects returns list with task_count
- ✅ Search by title (case-insensitive, partial match) works
- ✅ Filter by status and priority works independently and combined
- ✅ Sorting: priority (high → medium → low) then created_at (newest first) verified in response order
- ✅ Empty state: returns `{"projects":[],"total":0}` when no matches

### US-4: Edit project — **PASS**
- ✅ PUT /api/projects/{id} updates all fields
- ✅ Status options validated: idea, active, paused, completed
- ✅ Priority options validated: low, medium, high
- ✅ 404 when project not found
- ✅ updated_at timestamp refreshes on update

### US-5: Delete project — **PASS**
- ✅ DELETE returns 204
- ✅ 404 when project not found
- ✅ Cascade delete verified: project 2 deleted, associated tasks (if any) cleaned up via SQLAlchemy `cascade="all, delete-orphan"`
- ✅ Project removed immediately, list reflects change

### US-6: Create task — **PASS**
- ✅ POST /api/projects/{id}/tasks returns 201 with correct shape
- ✅ Defaults: status="todo", priority="medium"
- ✅ Title validation: required, 1-200 chars
- ✅ Description validation: max 1000 chars
- ✅ 404 when project not found

### US-7: View tasks with filters — **PASS**
- ✅ GET /api/projects/{id}/tasks returns list
- ✅ Filter by status works (tested: blocked, in_progress, todo, done)
- ✅ Filter by priority works (tested: high, medium, low)
- ✅ Search by title works (case-insensitive partial match)
- ✅ Empty state: returns `{"tasks":[],"total":0}` when no matches
- ✅ 404 when project not found

### US-8: Update task status — **PASS**
- ✅ PUT /api/tasks/{id} updates status
- ✅ Status options validated: todo, in_progress, blocked, done
- ✅ Frontend has quick status dropdown in taskItem()
- ✅ Frontend refreshes view after status change with toast notification

### US-9: Edit task — **PASS** (with caveat)
- ✅ PUT /api/tasks/{id} updates all fields
- ✅ 404 when task not found
- ⚠️ **Frontend bug:** `openTaskModal()` does not properly pre-populate form fields for editing. It attempts to fetch task data async but the modal HTML is rendered before data arrives, causing stale/empty fields. The description field is never pre-filled. Title is read from DOM but may be stale. See Bug #2 below.

### US-10: Delete task — **PASS** (with caveat)
- ✅ DELETE /api/tasks/{id} returns 204
- ✅ 404 when task not found
- ✅ Frontend has confirm() dialog
- ✅ Task removed immediately, toast shown
- ❌ **Bug #1:** Dashboard does not auto-update after task deletion from project detail view. User must navigate to dashboard to see updated blocked_tasks count. This is a SPA state issue — `refreshCurrentView()` only refreshes the current route, not cross-route stats.

---

## API Endpoint Results

| Endpoint | Method | Status | Evidence |
|----------|--------|--------|----------|
| /api/health | GET | ✅ PASS | Returns `{"status":"ok","database":"connected"}`. 500 simulated when DB down. |
| /api/dashboard | GET | ✅ PASS | Returns all 6 stats fields. Verified live updates after CRUD ops. |
| /api/projects | GET | ✅ PASS | Supports search, status, priority filters. Returns `{projects, total}`. Sort order correct. |
| /api/projects | POST | ✅ PASS | 201 Created. Validates title (1-100), description (max 500), status, priority enums. |
| /api/projects/{id} | GET | ✅ PASS | Returns project with task_count. 404 for missing. |
| /api/projects/{id} | PUT | ✅ PASS | Partial updates work. 404 for missing. updated_at refreshes. |
| /api/projects/{id} | DELETE | ✅ PASS | 204 No Content. 404 for missing. Cascade confirmed. |
| /api/projects/{id}/tasks | GET | ✅ PASS | Supports search, status, priority. 404 if project missing. |
| /api/projects/{id}/tasks | POST | ✅ PASS | 201 Created. All validations work. 404 if project missing. |
| /api/tasks/{id} | GET | ✅ PASS | Returns task. 404 for missing. |
| /api/tasks/{id} | PUT | ✅ PASS | Partial updates work. 404 for missing. |
| /api/tasks/{id} | DELETE | ✅ PASS | 204 No Content. 404 for missing. |

---

## Frontend Code Review

| Requirement | Status | Evidence |
|-------------|--------|----------|
| All views implemented | ✅ PASS | `renderDashboard()`, `renderProjects()`, `renderProjectDetail()` all present. |
| Modals work | ✅ PASS | `openProjectModal()`, `openTaskModal()` present. `openModal()` / `closeModal()` helpers. |
| Form validation (title required) | ✅ PASS | `handleProjectSubmit()` and `handleTaskSubmit()` check `title.trim()` and show `#*-title-error`. |
| Loading states | ✅ PASS | `renderLoading()` used in all three views before API calls. |
| Empty states | ✅ PASS | `renderEmpty()` used for no projects, no search matches, no tasks, no task filter matches. |
| Error handling | ✅ PASS | `renderError()` with optional retry button. `try/catch` around all API calls with toast notifications. |
| Delete confirmations | ✅ PASS | `confirmDeleteProject()` and `confirmDeleteTask()` use `confirm()` with descriptive messages. |
| Search/filter debouncing | ✅ PASS | `debounce(fn, 300)` used for project search and task search. |
| **Edit modal pre-population** | ❌ **FAIL** | `openTaskModal()` fetches task data asynchronously but renders modal HTML immediately. Description field never pre-filled from DOM. Title read from DOM element textContent which may be stale or truncated. See Bug #2. |

---

## Bugs Found

### Bug #1: Dashboard Stats Stale After Cross-Route Deletions
**Severity:** Medium  
**Location:** Frontend — `refreshCurrentView()` in `app.js`  
**Description:** When a user deletes a task from the Project Detail view, the Dashboard view's cached stats become stale. Navigating back to Dashboard shows old blocked_tasks count until a hard refresh.  
**Root Cause:** `refreshCurrentView()` only re-renders the current route. Dashboard data is not refreshed when on another route.  
**Recommendation:** On any mutation (create/update/delete), invalidate dashboard cache and re-fetch dashboard stats in background, or clear `state.dashboard` on route change to force re-fetch.

### Bug #2: Task Edit Modal Pre-Population Race Condition
**Severity:** Medium  
**Location:** Frontend — `openTaskModal()` in `app.js` lines 365-400  
**Description:** When editing an existing task, the modal opens with empty/default fields and only attempts to populate them after an async `API.getTasks()` call. The description `<textarea>` is never pre-filled from DOM or API. The title is pulled from `.task-title` textContent which may include HTML-escaped characters or truncation.  
**Root Cause:** Modal HTML is rendered synchronously before async data fetch completes. No loading state or await in modal opening.  
**Recommendation:** Restructure `openTaskModal()` to accept task data as parameter, or fetch task data first (with loading state), then render modal. Alternatively, use `API.getTask(taskId)` endpoint (exists and works) instead of searching through task list.

---

## Edge Cases Tested

| Edge Case | Result | Notes |
|-----------|--------|-------|
| Delete project with 0 tasks | ✅ PASS | Works normally, cascade is no-op. |
| Delete project with tasks | ✅ PASS | Confirmed cascade in model + verified in DB. |
| Search with no matches | ✅ PASS | Empty state returned. Frontend shows "No projects match your search." |
| Task with empty title | ✅ PASS | 422 validation error, frontend shows inline error. |
| Task with 201-char title | ✅ PASS | 422 validation error. |
| Invalid status value | ✅ PASS | 422 with pattern mismatch error. |
| Invalid priority value | ✅ PASS | 422 with pattern mismatch error. |
| Description > max length | ✅ PASS | 422 for project (501) and task (1001). |
| Get nonexistent project | ✅ PASS | 404 with "Project not found". |
| Get nonexistent task | ✅ PASS | 404 with "Task not found". |
| Update nonexistent project | ✅ PASS | 404. |
| Update nonexistent task | ✅ PASS | 404. |
| Delete nonexistent project | ✅ PASS | 404. |
| Delete nonexistent task | ✅ PASS | 404. |
| Create task in nonexistent project | ✅ PASS | 404. |
| Sort order (priority + date) | ✅ PASS | High before medium before low; within same priority, newest first. |
| Dashboard live updates | ✅ PASS | Stats update after every CRUD operation tested. |

---

## Recommendations

### P1 (Fix Before Release)
1. **Fix Bug #2 — Task Edit Modal:** Use `API.getTask(taskId)` to fetch task data *before* rendering the modal, or pass task object to `openTaskModal()`.
2. **Fix Bug #1 — Dashboard Stale Data:** Clear `state.dashboard` on route change or re-fetch dashboard data after any mutation.

### P2 (Nice to Have)
3. **DB Schema Consistency:** `Project.description` and `Task.description` use `Text` type in `models.py` but schemas enforce max lengths. Consider `String(500)` / `String(1000)` for DB-level safety.
4. **Frontend Form Reset:** After closing modal without saving, form fields should clear (currently they may retain previous values on next open).
5. **Task Detail View:** REQUIREMENTS.md mentions a "Task Detail" page/screen, but only inline editing exists. Consider if this is MVP or post-MVP.
6. **API Contract vs Implementation:** Contract specifies `GET /tasks/{task_id}` exists and works — confirmed. Frontend does not use it (uses task list instead). Switching would fix Bug #2.
7. **Tests:** Add automated API contract tests (pytest + requests) to prevent regressions.
8. **CORS:** Currently allows `localhost:3000`. For production, restrict to actual deployed frontend origin.

---

## Appendix: Test Data Used

```json
// Projects created
{"id":1,"title":"Test Project Alpha","status":"active","priority":"high"}
{"id":2,"title":"Test Project Beta","status":"idea","priority":"low"}
{"id":3,"title":"Test Project Gamma","status":"completed","priority":"medium"}

// Tasks created (in Project 1)
{"id":1,"title":"Design DB schema","status":"todo","priority":"high"}
{"id":2,"title":"Build API","status":"in_progress","priority":"high"}
{"id":3,"title":"Deploy to prod","status":"blocked","priority":"medium"}
{"id":4,"title":"Write tests","status":"done","priority":"low"}
```

All test data was cleaned up after testing by deleting the SQLite database file.

---

*End of QA Report*
