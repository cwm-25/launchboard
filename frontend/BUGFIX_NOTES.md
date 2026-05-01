# LaunchBoard Bug Fixes

## Bug 1: Dashboard Stale After Cross-Route Deletions
**Root cause:** `renderDashboard()` always fetched fresh API data, but `refreshCurrentView()` only re-renders the *current* route. When a task was deleted from Project Detail, the user had to navigate away and back to Dashboard, which still showed cached data from the previous `renderDashboard()` call because the mutation happened on a different route.

**Fix:**
1. Added `state.dashboard` caching: `renderDashboard()` now uses `state.dashboard ?? await API.dashboard()` and stores the result.
2. Invalidate `state.dashboard = null` on every mutation: `handleProjectSubmit`, `confirmDeleteProject`, `handleTaskSubmit`, `confirmDeleteTask`, and `quickChangeTaskStatus` all clear the cache.
3. Clear cache on every route change: `handleRoute()` sets `state.dashboard = null` so navigating back to Dashboard always fetches fresh data.

## Bug 2: Task Edit Modal Race Condition
**Root cause:** `openTaskModal()` was a synchronous function that rendered the modal HTML immediately with empty/default values, then fired an async `API.getTasks()` call to backfill fields. The description field was never populated in the initial HTML, and the title was read from potentially-stale DOM text.

**Fix:**
1. Converted `openTaskModal` to `async`.
2. For edit mode, it now awaits `API.getTask(taskId)` **before** rendering the modal.
3. If the fetch fails, it shows a toast and aborts (doesn’t open a broken modal).
4. All fields (title, description, status, priority) are pre-populated from the fetched task object in the initial HTML string.
5. Removed the post-render fetch-and-patch logic entirely.

## Files Changed
- `revenue-streams/apps/launchboard/frontend/app.js`

## Acceptance Criteria
- [x] After deleting a task from Project Detail, Dashboard shows updated stats
- [x] Task edit modal pre-fills all fields correctly (title, description, status, priority)
- [x] No console errors
- [x] Changes are minimal and focused
