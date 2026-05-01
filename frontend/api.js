const API_BASE = 'http://localhost:8000/api';

async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    if (response.status === 204) {
      return { ok: true, status: 204 };
    }

    const data = response.ok ? await response.json() : null;
    const errorData = !response.ok && response.headers.get('content-type')?.includes('application/json')
      ? await response.json()
      : { detail: `HTTP ${response.status}` };

    if (!response.ok) {
      const error = new Error(errorData.detail || `Request failed: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError') {
      const error = new Error('Unable to connect to server. Is the backend running?');
      error.isNetwork = true;
      throw error;
    }
    throw err;
  }
}

const API = {
  // Health
  health: () => apiRequest('/health'),

  // Dashboard
  dashboard: () => apiRequest('/dashboard'),

  // Projects
  getProjects: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.append('search', params.search);
    if (params.status) qs.append('status', params.status);
    if (params.priority) qs.append('priority', params.priority);
    return apiRequest(`/projects?${qs}`);
  },
  getProject: (id) => apiRequest(`/projects/${id}`),
  createProject: (data) => apiRequest('/projects', { method: 'POST', body: data }),
  updateProject: (id, data) => apiRequest(`/projects/${id}`, { method: 'PUT', body: data }),
  deleteProject: (id) => apiRequest(`/projects/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: (projectId, params = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.append('status', params.status);
    if (params.priority) qs.append('priority', params.priority);
    if (params.search) qs.append('search', params.search);
    return apiRequest(`/projects/${projectId}/tasks?${qs}`);
  },
  createTask: (projectId, data) => apiRequest(`/projects/${projectId}/tasks`, { method: 'POST', body: data }),
  updateTask: (id, data) => apiRequest(`/tasks/${id}`, { method: 'PUT', body: data }),
  deleteTask: (id) => apiRequest(`/tasks/${id}`, { method: 'DELETE' }),
};
