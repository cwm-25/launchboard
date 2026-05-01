# LaunchBoard — Database Schema

## Entity Overview

### Project
A project is a container for tasks. It has a title, description, status, and priority.

### Task
A task belongs to a project. It has a title, description, status, and priority.

## Relationship Model
```
Project ||--o{ Task : contains
```
- One project has many tasks
- Deleting a project cascades and deletes all tasks

## Schema Design

### Table: `projects`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, auto-increment | Unique identifier |
| `title` | VARCHAR(100) | NOT NULL | Project name |
| `description` | TEXT | NULL | Project description |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'idea' | idea, active, paused, completed |
| `priority` | VARCHAR(10) | NOT NULL, DEFAULT 'medium' | low, medium, high |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_projects_status` on `status`
- `idx_projects_priority` on `priority`
- `idx_projects_created_at` on `created_at`

### Table: `tasks`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, auto-increment | Unique identifier |
| `project_id` | INTEGER | NOT NULL, FK → projects.id | Parent project |
| `title` | VARCHAR(200) | NOT NULL | Task name |
| `description` | TEXT | NULL | Task description |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'todo' | todo, in_progress, blocked, done |
| `priority` | VARCHAR(10) | NOT NULL, DEFAULT 'medium' | low, medium, high |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_tasks_project_id` on `project_id`
- `idx_tasks_status` on `status`
- `idx_tasks_priority` on `priority`
- `idx_tasks_created_at` on `created_at`

**Foreign Key:**
- `fk_tasks_project` → `projects(id)` with `ON DELETE CASCADE`

## Constraints

### Check Constraints
```sql
ALTER TABLE projects ADD CONSTRAINT chk_project_status 
  CHECK (status IN ('idea', 'active', 'paused', 'completed'));

ALTER TABLE projects ADD CONSTRAINT chk_project_priority 
  CHECK (priority IN ('low', 'medium', 'high'));

ALTER TABLE tasks ADD CONSTRAINT chk_task_status 
  CHECK (status IN ('todo', 'in_progress', 'blocked', 'done'));

ALTER TABLE tasks ADD CONSTRAINT chk_task_priority 
  CHECK (priority IN ('low', 'medium', 'high'));
```

## Lifecycle / State Models

### Project Status Transitions
```
idea → active → completed
  ↓      ↓
paused ←┘
```
- Any status can transition to any other (no strict enforcement at DB level)

### Task Status Transitions
```
todo → in_progress → done
  ↓       ↓
blocked ←┘
```
- Any status can transition to any other

## Query Patterns

### Dashboard Stats
```sql
SELECT 
  COUNT(*) as total_projects,
  COUNT(*) FILTER (WHERE status = 'active') as active_projects,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_projects
FROM projects;

SELECT COUNT(*) as blocked_tasks 
FROM tasks 
WHERE status = 'blocked';
```

### Project List with Search
```sql
SELECT p.*, COUNT(t.id) as task_count
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
WHERE p.title ILIKE '%search%'
GROUP BY p.id
ORDER BY 
  CASE p.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
  p.created_at DESC;
```

### Task List by Project
```sql
SELECT * FROM tasks 
WHERE project_id = ? 
  AND status = COALESCE(?, status)
  AND priority = COALESCE(?, priority)
  AND title ILIKE '%' || COALESCE(?, '') || '%'
ORDER BY 
  CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
  created_at DESC;
```

## Data Sensitivity & Privacy
- No PII stored
- No user data (single-user MVP)
- No sensitive fields

## Migration Strategy
- MVP: SQLAlchemy `create_all()` on startup
- Production: Alembic migrations

## Data Quality Rules
| Rule | Severity | Detection |
|------|----------|-----------|
| Empty project title | Error | NOT NULL constraint |
| Empty task title | Error | NOT NULL constraint |
| Invalid status | Error | CHECK constraint |
| Invalid priority | Error | CHECK constraint |
| Orphan tasks | Prevented | ON DELETE CASCADE |

## Downstream Agent Handoff
- **Ludwig**: Implement SQLAlchemy models matching this schema
- **Covenant**: API responses must include `task_count` for projects
- **Hawkeye**: Verify constraints work, test cascade delete
