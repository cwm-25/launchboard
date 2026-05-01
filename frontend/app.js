/**
 * LaunchBoard — Frontend Application Logic
 * Vanilla JS single-page app with hash-based routing.
 */

/* ── State ── */
const state = {
  currentView: null,
  dashboard: null,
  projects: [],
  tasks: {}, // projectId -> tasks array
  loading: false,
};

/* ── DOM refs ── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  main: $('#main-content'),
  modalOverlay: $('#modal-overlay'),
  modalContent: $('#modal-content'),
  toastContainer: $('#toast-container'),
  navLinks: $$('.nav-link'),
};

/* ── Helpers ── */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── Toast ── */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  els.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ── Modal ── */
let modalCloseHandler = null;

function openModal(contentHtml, onClose) {
  els.modalContent.innerHTML = contentHtml;
  els.modalOverlay.classList.remove('hidden');
  modalCloseHandler = onClose || null;
  // Close on backdrop click
  els.modalOverlay.onclick = (e) => {
    if (e.target === els.modalOverlay) closeModal();
  };
}

function closeModal() {
  els.modalOverlay.classList.add('hidden');
  els.modalOverlay.onclick = null;
  if (modalCloseHandler) {
    const cb = modalCloseHandler;
    modalCloseHandler = null;
    cb();
  }
}

/* ── Loading / Error / Empty helpers ── */
function renderLoading() {
  return `<div class="loading">Loading…</div>`;
}

function renderError(message, onRetry) {
  const retryBtn = onRetry ? `<button class="btn btn-primary" onclick="${onRetry}()">Retry</button>` : '';
  return `<div class="error-state">
    <div>⚠️ ${escapeHtml(message)}</div>
    ${retryBtn}
  </div>`;
}

function renderEmpty(message, icon = '📭') {
  return `<div class="empty-state">
    <div class="icon">${icon}</div>
    <div>${escapeHtml(message)}</div>
  </div>`;
}

/* ── Badge helpers ── */
function statusBadge(status) {
  const cls = `badge-status-${status}`;
  return `<span class="badge ${cls}">${escapeHtml(status.replace('_', ' '))}</span>`;
}

function priorityBadge(priority) {
  const cls = `badge-priority-${priority}`;
  return `<span class="badge ${cls}">${escapeHtml(priority)}</span>`;
}

/* ── Routing ── */
function navigate(hash) {
  window.location.hash = hash;
}

function parseRoute() {
  const hash = window.location.hash.slice(1) || 'dashboard';
  const [pathPart, qsPart] = hash.split('?');
  const parts = pathPart.split('/');
  const qs = qsPart ? new URLSearchParams(qsPart) : new URLSearchParams();
  if (parts[0] === 'projects' && parts[1]) {
    return { view: 'projectDetail', projectId: parts[1], qs };
  }
  return { view: parts[0], qs };
}

function updateNav() {
  const { view } = parseRoute();
  els.navLinks.forEach((link) => {
    const linkView = link.dataset.view;
    if (view === linkView || (view === 'projectDetail' && linkView === 'projects')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ── Views ── */
async function renderDashboard() {
  els.main.innerHTML = renderLoading();
  try {
    const data = state.dashboard ?? await API.dashboard();
    state.dashboard = data;
    const stats = [
      { label: 'Total Projects', value: data.total_projects || 0 },
      { label: 'Active', value: data.active_projects || 0 },
      { label: 'Completed', value: data.completed_projects || 0 },
      { label: 'Blocked Tasks', value: data.blocked_tasks || 0, blocked: true },
    ];

    let projectsHtml = '';
    try {
      const projData = await API.getProjects({});
      const recent = (projData.projects || []).slice(0, 5);
      if (recent.length === 0) {
        projectsHtml = renderEmpty('No projects yet. Create your first project!', '🚀');
      } else {
        projectsHtml = `<div class="card-grid">${recent.map((p) => projectCard(p)).join('')}</div>`;
      }
    } catch (e) {
      projectsHtml = renderError('Failed to load projects');
    }

    els.main.innerHTML = `
      <div id="dashboard">
        <div class="dashboard-header">
          <h1>Dashboard</h1>
        </div>
        <div class="stats-grid">
          ${stats.map((s) => `
            <div class="stat-card ${s.blocked ? 'blocked' : ''} ${s.label === 'Completed' ? 'completed' : ''}">
              <div class="stat-value">${s.value}</div>
              <div class="stat-label">${escapeHtml(s.label)}</div>
            </div>
          `).join('')}
        </div>
        <div class="section-header">
          <h2>Recent Projects</h2>
          <button class="btn btn-primary" onclick="openProjectModal()">+ New Project</button>
        </div>
        ${projectsHtml}
      </div>
    `;
  } catch (err) {
    els.main.innerHTML = renderError(err.message || 'Failed to load dashboard', 'renderDashboard');
  }
}

function projectCard(p) {
  return `
    <div class="card" onclick="navigate('projects/${p.id}')">
      <div class="card-title">${escapeHtml(p.title)}</div>
      <div class="card-meta">
        ${statusBadge(p.status)}
        ${priorityBadge(p.priority)}
      </div>
      <div class="card-description">${escapeHtml(p.description || '')}</div>
      <div class="card-footer">
        <span>${p.task_count || 0} tasks</span>
      </div>
    </div>
  `;
}

async function renderProjects() {
  const { qs } = parseRoute();
  const search = qs.get('search') || '';
  const status = qs.get('status') || '';
  const priority = qs.get('priority') || '';

  els.main.innerHTML = renderLoading();
  try {
    const data = await API.getProjects({ search, status, priority });
    const projects = data.projects || [];

    const searchVal = escapeHtml(search);
    const statusVal = escapeHtml(status);
    const priorityVal = escapeHtml(priority);

    let listHtml = '';
    if (projects.length === 0) {
      listHtml = renderEmpty(search ? 'No projects match your search.' : 'No projects yet. Create your first project!', '🚀');
    } else {
      listHtml = `<div class="card-grid">${projects.map((p) => projectCard(p)).join('')}</div>`;
    }

    els.main.innerHTML = `
      <div id="projects">
        <div class="dashboard-header">
          <h1>Projects</h1>
        </div>
        <div class="filters">
          <input type="text" id="project-search" placeholder="Search projects…" value="${searchVal}">
          <select id="project-status">
            <option value="" ${!status ? 'selected' : ''}>All Status</option>
            <option value="idea" ${status === 'idea' ? 'selected' : ''}>Idea</option>
            <option value="active" ${status === 'active' ? 'selected' : ''}>Active</option>
            <option value="paused" ${status === 'paused' ? 'selected' : ''}>Paused</option>
            <option value="completed" ${status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
          <select id="project-priority">
            <option value="" ${!priority ? 'selected' : ''}>All Priority</option>
            <option value="low" ${priority === 'low' ? 'selected' : ''}>Low</option>
            <option value="medium" ${priority === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="high" ${priority === 'high' ? 'selected' : ''}>High</option>
          </select>
          <button class="btn btn-primary" onclick="openProjectModal()">+ New Project</button>
        </div>
        ${listHtml}
      </div>
    `;

    // Wire up filter events
    $('#project-search')?.addEventListener('input', debounce(applyProjectFilters, 300));
    $('#project-status')?.addEventListener('change', applyProjectFilters);
    $('#project-priority')?.addEventListener('change', applyProjectFilters);
  } catch (err) {
    els.main.innerHTML = renderError(err.message || 'Failed to load projects', 'renderProjects');
  }
}

function applyProjectFilters() {
  const search = $('#project-search')?.value || '';
  const status = $('#project-status')?.value || '';
  const priority = $('#project-priority')?.value || '';
  const qs = new URLSearchParams();
  if (search) qs.set('search', search);
  if (status) qs.set('status', status);
  if (priority) qs.set('priority', priority);
  navigate(`projects${qs.toString() ? '?' + qs.toString() : ''}`);
}

async function renderProjectDetail(projectId) {
  els.main.innerHTML = renderLoading();
  try {
    const project = await API.getProject(projectId);
    const taskData = await API.getTasks(projectId, {});
    const tasks = taskData.tasks || [];

    els.main.innerHTML = `
      <div id="project-detail">
        <a href="#projects" class="back-link">← Back to Projects</a>
        <div class="project-detail">
          <div class="project-detail-header">
            <div>
              <h1>${escapeHtml(project.title)}</h1>
              <div class="card-meta" style="margin-top:8px">
                ${statusBadge(project.status)}
                ${priorityBadge(project.priority)}
              </div>
            </div>
            <div class="project-detail-actions">
              <button class="btn btn-secondary btn-sm" onclick="openProjectModal('${projectId}')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="confirmDeleteProject('${projectId}')">Delete</button>
            </div>
          </div>
          <p style="color:var(--text-secondary)">${escapeHtml(project.description || '')}</p>
        </div>

        <div class="section-header">
          <h2>Tasks (${tasks.length})</h2>
          <button class="btn btn-primary" onclick="openTaskModal('${projectId}')">+ New Task</button>
        </div>

        <div class="filters">
          <input type="text" id="task-search" placeholder="Search tasks…">
          <select id="task-status">
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>
          <select id="task-priority">
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div id="task-list-container">
          ${tasks.length === 0
            ? renderEmpty('No tasks yet. Create your first task!', '✅')
            : `<div class="task-list">${tasks.map((t) => taskItem(t, projectId)).join('')}</div>`}
        </div>
      </div>
    `;

    // Wire up task filters
    $('#task-search')?.addEventListener('input', debounce(() => filterTasks(projectId), 300));
    $('#task-status')?.addEventListener('change', () => filterTasks(projectId));
    $('#task-priority')?.addEventListener('change', () => filterTasks(projectId));
  } catch (err) {
    els.main.innerHTML = renderError(err.message || 'Failed to load project', 'renderProjectDetail');
  }
}

async function filterTasks(projectId) {
  const search = $('#task-search')?.value || '';
  const status = $('#task-status')?.value || '';
  const priority = $('#task-priority')?.value || '';
  const container = $('#task-list-container');
  if (!container) return;
  try {
    const data = await API.getTasks(projectId, { search, status, priority });
    const tasks = data.tasks || [];
    if (tasks.length === 0) {
      container.innerHTML = renderEmpty(search ? 'No tasks match your filters.' : 'No tasks yet. Create your first task!', '✅');
    } else {
      container.innerHTML = `<div class="task-list">${tasks.map((t) => taskItem(t, projectId)).join('')}</div>`;
    }
  } catch (err) {
    container.innerHTML = renderError(err.message || 'Failed to load tasks');
  }
}

function taskItem(t, projectId) {
  return `
    <div class="task-item" data-task-id="${t.id}">
      <div class="task-info">
        <div class="task-title">${escapeHtml(t.title)}</div>
        <div class="task-meta">
          ${statusBadge(t.status)}
          ${priorityBadge(t.priority)}
          ${t.description ? `<span style="color:var(--text-secondary);font-size:0.8rem">${escapeHtml(t.description.substring(0, 60))}${t.description.length > 60 ? '…' : ''}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        <select class="status-dropdown" onchange="quickChangeTaskStatus('${t.id}', this.value)">
          <option value="todo" ${t.status === 'todo' ? 'selected' : ''}>To Do</option>
          <option value="in_progress" ${t.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
          <option value="blocked" ${t.status === 'blocked' ? 'selected' : ''}>Blocked</option>
          <option value="done" ${t.status === 'done' ? 'selected' : ''}>Done</option>
        </select>
        <button class="btn btn-secondary btn-sm" onclick="openTaskModal('${projectId}', '${t.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="confirmDeleteTask('${t.id}')">Delete</button>
      </div>
    </div>
  `;
}

async function quickChangeTaskStatus(taskId, newStatus) {
  try {
    await API.updateTask(taskId, { status: newStatus });
    state.dashboard = null;
    showToast('Task status updated', 'success');
    refreshCurrentView();
  } catch (err) {
    showToast(err.message || 'Failed to update task', 'error');
    refreshCurrentView(); // reset dropdown
  }
}

/* ── Modals: Project ── */
async function openProjectModal(projectId = null) {
  const isEdit = !!projectId;
  let project = null;
  if (isEdit) {
    // Try to find in current state, else fetch
    const found = state.projects.find((p) => String(p.id) === String(projectId));
    if (found) {
      project = found;
    } else {
      try {
        project = await API.getProject(projectId);
      } catch (err) {
        showToast('Failed to load project for editing', 'error');
        return;
      }
    }
  }

  const title = isEdit ? 'Edit Project' : 'New Project';
  const btnText = isEdit ? 'Save Changes' : 'Create Project';
  const t = isEdit ? escapeHtml(project?.title || '') : '';
  const d = isEdit ? escapeHtml(project?.description || '') : '';
  const s = isEdit ? project?.status : 'idea';
  const p = isEdit ? project?.priority : 'medium';

  const html = `
    <div class="modal-header">
      <h3>${title}</h3>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <form id="project-form" onsubmit="handleProjectSubmit(event, '${projectId || ''}')">
        <div class="form-group">
          <label for="proj-title">Title *</label>
          <input type="text" id="proj-title" value="${t}" required maxlength="100">
          <div class="error" id="proj-title-error"></div>
        </div>
        <div class="form-group">
          <label for="proj-desc">Description</label>
          <textarea id="proj-desc" rows="3" maxlength="500">${d}</textarea>
        </div>
        <div class="form-group">
          <label for="proj-status">Status</label>
          <select id="proj-status">
            <option value="idea" ${s === 'idea' ? 'selected' : ''}>Idea</option>
            <option value="active" ${s === 'active' ? 'selected' : ''}>Active</option>
            <option value="paused" ${s === 'paused' ? 'selected' : ''}>Paused</option>
            <option value="completed" ${s === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
        <div class="form-group">
          <label for="proj-priority">Priority</label>
          <select id="proj-priority">
            <option value="low" ${p === 'low' ? 'selected' : ''}>Low</option>
            <option value="medium" ${p === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="high" ${p === 'high' ? 'selected' : ''}>High</option>
          </select>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="document.getElementById('project-form').requestSubmit()">${btnText}</button>
    </div>
  `;

  openModal(html, () => {
    // optional cleanup
  });
}

async function handleProjectSubmit(e, projectId) {
  e.preventDefault();
  const titleEl = $('#proj-title');
  const title = titleEl.value.trim();
  const errorEl = $('#proj-title-error');

  if (!title) {
    errorEl.textContent = 'Title is required';
    return;
  }
  errorEl.textContent = '';

  const data = {
    title,
    description: $('#proj-desc').value.trim(),
    status: $('#proj-status').value,
    priority: $('#proj-priority').value,
  };

  try {
    if (projectId) {
      await API.updateProject(projectId, data);
      showToast('Project updated', 'success');
    } else {
      await API.createProject(data);
      showToast('Project created', 'success');
    }
    state.dashboard = null;
    closeModal();
    refreshCurrentView();
  } catch (err) {
    errorEl.textContent = err.message || 'Something went wrong';
    showToast(err.message || 'Failed to save project', 'error');
  }
}

async function confirmDeleteProject(projectId) {
  if (!confirm('Are you sure you want to delete this project? All tasks will also be deleted.')) return;
  try {
    await API.deleteProject(projectId);
    state.dashboard = null;
    showToast('Project deleted', 'success');
    navigate('projects');
  } catch (err) {
    showToast(err.message || 'Failed to delete project', 'error');
  }
}

/* ── Modals: Task ── */
async function openTaskModal(projectId, taskId = null) {
  const isEdit = !!taskId;
  let task = null;

  if (isEdit) {
    try {
      task = await API.getTask(taskId);
    } catch (err) {
      showToast('Failed to load task for editing', 'error');
      return;
    }
  }

  const title = isEdit ? 'Edit Task' : 'New Task';
  const btnText = isEdit ? 'Save Changes' : 'Create Task';
  const t = isEdit ? escapeHtml(task?.title || '') : '';
  const d = isEdit ? escapeHtml(task?.description || '') : '';
  const s = isEdit ? task?.status : 'todo';
  const p = isEdit ? task?.priority : 'medium';

  const html = `
    <div class="modal-header">
      <h3>${title}</h3>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <form id="task-form" onsubmit="handleTaskSubmit(event, '${projectId}', '${taskId || ''}')">
        <div class="form-group">
          <label for="task-title">Title *</label>
          <input type="text" id="task-title" value="${t}" required maxlength="200">
          <div class="error" id="task-title-error"></div>
        </div>
        <div class="form-group">
          <label for="task-desc">Description</label>
          <textarea id="task-desc" rows="3" maxlength="1000">${d}</textarea>
        </div>
        <div class="form-group">
          <label for="task-status">Status</label>
          <select id="task-status">
            <option value="todo" ${s === 'todo' ? 'selected' : ''}>To Do</option>
            <option value="in_progress" ${s === 'in_progress' ? 'selected' : ''}>In Progress</option>
            <option value="blocked" ${s === 'blocked' ? 'selected' : ''}>Blocked</option>
            <option value="done" ${s === 'done' ? 'selected' : ''}>Done</option>
          </select>
        </div>
        <div class="form-group">
          <label for="task-priority">Priority</label>
          <select id="task-priority">
            <option value="low" ${p === 'low' ? 'selected' : ''}>Low</option>
            <option value="medium" ${p === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="high" ${p === 'high' ? 'selected' : ''}>High</option>
          </select>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="document.getElementById('task-form').requestSubmit()">${btnText}</button>
    </div>
  `;

  openModal(html, () => {
    // optional cleanup
  });
}

async function handleTaskSubmit(e, projectId, taskId) {
  e.preventDefault();
  const titleEl = $('#task-title');
  const title = titleEl.value.trim();
  const errorEl = $('#task-title-error');

  if (!title) {
    errorEl.textContent = 'Title is required';
    return;
  }
  errorEl.textContent = '';

  const data = {
    title,
    description: $('#task-desc').value.trim(),
    status: $('#task-status').value,
    priority: $('#task-priority').value,
  };

  try {
    if (taskId) {
      await API.updateTask(taskId, data);
      showToast('Task updated', 'success');
    } else {
      await API.createTask(projectId, data);
      showToast('Task created', 'success');
    }
    state.dashboard = null;
    closeModal();
    refreshCurrentView();
  } catch (err) {
    errorEl.textContent = err.message || 'Something went wrong';
    showToast(err.message || 'Failed to save task', 'error');
  }
}

async function confirmDeleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  try {
    await API.deleteTask(taskId);
    state.dashboard = null;
    showToast('Task deleted', 'success');
    refreshCurrentView();
  } catch (err) {
    showToast(err.message || 'Failed to delete task', 'error');
  }
}

/* ── View dispatch ── */
async function refreshCurrentView() {
  const { view, projectId } = parseRoute();
  updateNav();
  if (view === 'dashboard') {
    await renderDashboard();
  } else if (view === 'projects') {
    await renderProjects();
  } else if (view === 'projectDetail') {
    await renderProjectDetail(projectId);
  } else {
    navigate('dashboard');
  }
}

function handleRoute() {
  state.dashboard = null;
  refreshCurrentView();
}

/* ── Utilities ── */
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/* ── Init ── */
window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', handleRoute);
