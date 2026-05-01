# LaunchBoard — Requirements Document

## User Stories

### US-1: Project Dashboard
As a user, I want to see a summary of all my projects so that I know what's active, blocked, and completed.

**Acceptance Criteria:**
- Dashboard shows total project count
- Dashboard shows active project count
- Dashboard shows completed project count
- Dashboard shows blocked task count
- Dashboard updates when projects/tasks change
- Empty state shown when no projects exist

### US-2: Create Project
As a user, I want to create a new project so that I can organize my work.

**Acceptance Criteria:**
- Project form has fields: title (required), description (optional)
- Default status: "idea"
- Default priority: "medium"
- Project appears in list immediately after creation
- Validation: title is required, max 100 chars

### US-3: View Project List
As a user, I want to see all my projects so that I can choose which one to work on.

**Acceptance Criteria:**
- Projects displayed in card/list view
- Each project shows: title, status badge, priority badge, task count
- Projects sorted by priority (high → low) then created date (newest first)
- Search filters projects by title (case-insensitive)
- Empty state when no projects match search

### US-4: Edit Project
As a user, I want to update project details so that I can keep information current.

**Acceptance Criteria:**
- Can edit title, description, status, priority
- Status options: idea, active, paused, completed
- Priority options: low, medium, high
- Changes persist after refresh

### US-5: Delete Project
As a user, I want to delete a project so that I can remove completed/abandoned work.

**Acceptance Criteria:**
- Delete button requires confirmation
- Deleting project deletes all associated tasks
- Project removed from list immediately
- Undo not required for MVP

### US-6: Create Task
As a user, I want to add tasks to a project so that I can break work into actionable items.

**Acceptance Criteria:**
- Task form: title (required), description (optional)
- Default status: "todo"
- Default priority: "medium"
- Task appears in project's task list immediately
- Validation: title required, max 200 chars

### US-7: View Tasks
As a user, I want to see all tasks in a project so that I know what needs to be done.

**Acceptance Criteria:**
- Tasks grouped by status or shown in list
- Each task shows: title, priority badge, status badge
- Filter by status: todo, in_progress, blocked, done
- Filter by priority: low, medium, high
- Search tasks by title (case-insensitive)
- Empty states for each filter

### US-8: Update Task Status
As a user, I want to change a task's status so that I can track progress.

**Acceptance Criteria:**
- Quick status change (e.g., dropdown or click)
- Status options: todo, in_progress, blocked, done
- Visual feedback on status change
- Dashboard stats update accordingly

### US-9: Edit Task
As a user, I want to edit task details so that I can refine requirements.

**Acceptance Criteria:**
- Can edit title, description, status, priority
- Changes persist after refresh

### US-10: Delete Task
As a user, I want to delete a task so that I can remove irrelevant work.

**Acceptance Criteria:**
- Delete requires confirmation
- Task removed immediately
- Dashboard stats update

## Screens / Pages

1. **Dashboard** (`/`)
   - Summary cards: total/active/completed projects, blocked tasks
   - Recent projects list (top 5)
   - Quick "Create Project" button

2. **Projects** (`/projects`)
   - All projects list with search
   - Create project button
   - Project cards with task count

3. **Project Detail** (`/projects/:id`)
   - Project info (title, description, status, priority)
   - Task list with filters
   - Create task button
   - Edit/delete project actions

4. **Task Detail** (modal or inline)
   - Task info
   - Edit/delete actions

## Error States
- Backend unreachable: show "Unable to connect" message
- Invalid form: inline validation errors
- Project not found: 404-style message
- General error: friendly error message with retry option

## Edge Cases
- Delete project with 0 tasks → works normally
- Delete project with 50 tasks → all tasks deleted
- Search with no matches → show empty state + clear search
- Task with very long title → truncate with ellipsis
- Rapid status changes → no race conditions
- Browser refresh mid-edit → warn about unsaved changes (optional)
