# LaunchBoard — API Contract

## Version
v1.0.0 (MVP)

## Base URL
`http://localhost:8000/api`

## Content Type
All requests/responses use `application/json`

## Error Format
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description",
  "detail": "Additional context or field-level errors"
}
```

## Endpoints

### Health Check
**GET** `/health`

**Response:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

**Errors:**
- `500` — Database unreachable

---

### Projects

#### List Projects
**GET** `/projects`

**Query Parameters:**
- `search` (string, optional) — Filter by title (case-insensitive partial match)
- `status` (string, optional) — Filter by status: `idea`, `active`, `paused`, `completed`
- `priority` (string, optional) — Filter by priority: `low`, `medium`, `high`

**Response:**
```json
{
  "projects": [
    {
      "id": 1,
      "title": "LaunchBoard MVP",
      "description": "Build the project management app",
      "status": "active",
      "priority": "high",
      "task_count": 12,
      "created_at": "2026-05-01T10:00:00Z",
      "updated_at": "2026-05-01T14:30:00Z"
    }
  ],
  "total": 1
}
```

#### Create Project
**POST** `/projects`

**Request Body:**
```json
{
  "title": "LaunchBoard MVP",
  "description": "Build the project management app",
  "status": "idea",
  "priority": "medium"
}
```

**Validation:**
- `title`: required, 1-100 chars
- `description`: optional, max 500 chars
- `status`: optional, default `idea`, enum [`idea`, `active`, `paused`, `completed`]
- `priority`: optional, default `medium`, enum [`low`, `medium`, `high`]

**Response:** `201 Created` — Returns created project object

#### Get Project
**GET** `/projects/{project_id}`

**Response:** Returns single project with task count

**Errors:**
- `404` — Project not found

#### Update Project
**PUT** `/projects/{project_id}`

**Request Body:** Same as Create Project, all fields optional

**Response:** Returns updated project object

**Errors:**
- `404` — Project not found
- `422` — Validation error

#### Delete Project
**DELETE** `/projects/{project_id}`

**Response:** `204 No Content`

**Errors:**
- `404` — Project not found

---

### Tasks

#### List Tasks
**GET** `/projects/{project_id}/tasks`

**Query Parameters:**
- `status` (string, optional) — Filter by status
- `priority` (string, optional) — Filter by priority
- `search` (string, optional) — Filter by title

**Response:**
```json
{
  "tasks": [
    {
      "id": 1,
      "project_id": 1,
      "title": "Design database schema",
      "description": "Create tables and relationships",
      "status": "done",
      "priority": "high",
      "created_at": "2026-05-01T10:00:00Z",
      "updated_at": "2026-05-01T14:30:00Z"
    }
  ],
  "total": 1
}
```

#### Create Task
**POST** `/projects/{project_id}/tasks`

**Request Body:**
```json
{
  "title": "Design database schema",
  "description": "Create tables and relationships",
  "status": "todo",
  "priority": "high"
}
```

**Validation:**
- `title`: required, 1-200 chars
- `description`: optional, max 1000 chars
- `status`: optional, default `todo`, enum [`todo`, `in_progress`, `blocked`, `done`]
- `priority`: optional, default `medium`, enum [`low`, `medium`, `high`]

**Response:** `201 Created` — Returns created task object

**Errors:**
- `404` — Project not found
- `422` — Validation error

#### Get Task
**GET** `/tasks/{task_id}`

**Response:** Returns single task object

**Errors:**
- `404` — Task not found

#### Update Task
**PUT** `/tasks/{task_id}`

**Request Body:** Same as Create Task, all fields optional

**Response:** Returns updated task object

**Errors:**
- `404` — Task not found
- `422` — Validation error

#### Delete Task
**DELETE** `/tasks/{task_id}`

**Response:** `204 No Content`

**Errors:**
- `404` — Task not found

---

### Dashboard

#### Get Dashboard Stats
**GET** `/dashboard`

**Response:**
```json
{
  "total_projects": 10,
  "active_projects": 5,
  "completed_projects": 3,
  "blocked_tasks": 2,
  "total_tasks": 42,
  "completed_tasks": 20
}
```

---

## Pagination
Not implemented for MVP. All lists return full results (expect < 100 items).

## Filtering & Sorting
- `search`: Case-insensitive partial match on title
- `status`: Exact match
- `priority`: Exact match
- Default sort: priority (high → low) then created_at (newest first)

## Status Codes Summary
| Status | Meaning |
|--------|---------|
| `200` | OK |
| `201` | Created |
| `204` | No Content |
| `404` | Not Found |
| `422` | Validation Error |
| `500` | Server Error |

## Contract Tests

### Test: Create and Retrieve Project
1. POST `/projects` with valid data → expect `201`
2. GET `/projects/{id}` → expect `200` with matching data
3. DELETE `/projects/{id}` → expect `204`
4. GET `/projects/{id}` → expect `404`

### Test: Create Task in Project
1. POST `/projects` → create project, get `project_id`
2. POST `/projects/{project_id}/tasks` → expect `201`
3. GET `/projects/{project_id}/tasks` → expect task in list

### Test: Dashboard Updates
1. GET `/dashboard` → note counts
2. POST `/projects` → create project
3. GET `/dashboard` → expect total_projects +1
