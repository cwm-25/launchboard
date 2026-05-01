# LaunchBoard — Project Brief

## What Are We Building?
LaunchBoard is a lightweight project management app designed for solo builders and small teams who need to track projects and tasks without the bloat of enterprise PM tools.

## Who Is It For?
- Solo builders managing multiple side projects
- Small teams (2-5 people) who need simple project visibility
- Anyone who wants a clean, fast PM tool without Jira/Asana complexity

## What Problem Does It Solve?
- Existing PM tools are overkill for solo builders
- Spreadsheets get messy when tracking tasks across projects
- No quick way to see "what's active, what's blocked, what's done" at a glance

## MVP vs Later
### MVP (This Build)
- Project CRUD (create, read, update, delete)
- Task CRUD within projects
- Task statuses: todo, in_progress, blocked, done
- Project statuses: idea, active, paused, completed
- Priority levels: low, medium, high
- Search projects and tasks by title
- Filter tasks by status and priority
- Dashboard summary view (active projects, blocked tasks, completed count)
- Health endpoint

### Out of Scope (V2+)
- User auth / multi-user support
- Due dates with calendar view
- Comments / notes on tasks
- File attachments
- Email notifications
- Drag-and-drop reordering
- Dark mode
- Mobile app

## Success Criteria
- User can create a project in < 10 seconds
- User can view all projects on one screen
- User can filter tasks by status/priority
- Dashboard shows meaningful summary stats
- App loads in < 2 seconds
- No console errors on core flows
- Backend responds to all API calls in < 200ms (local)

## Risks
- Over-engineering the UI (keep it minimal)
- Database schema too rigid for future features
- SQLite limitations if we migrate to multi-user later
- Scope creep on "nice-to-have" features

## Tech Stack
- Backend: FastAPI (Python)
- Frontend: Vanilla JS (no framework bloat for MVP)
- Database: PostgreSQL
- API: REST
- Auth: None (single local user mode)

## Agents Required
- Compass (Product Owner): Requirements
- Architect: System design
- Vault: Database schema
- Covenant: API contracts
- Ludwig (Full-Stack): Implementation
- Hawkeye (QA): Testing
- Shepard (DevOps): Infrastructure review
- Scribe: Documentation
