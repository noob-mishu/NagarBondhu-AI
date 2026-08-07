const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      response.ok
        ? 'The server returned an invalid response.'
        : 'Cannot reach the server — make sure the backend is running (cd backend && npm run dev).'
    );
  }

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

const request = async (url, options = {}, isFormData = false) => {
  const headers = getAuthHeaders();
  if (isFormData) {
    delete headers['Content-Type'];
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${url}`, {
      headers,
      ...options,
    });
  } catch {
    throw new Error(
      'Cannot reach the API server. Start the backend on port 5000, or set VITE_API_BASE_URL to your deployed backend URL.'
    );
  }

  return parseResponse(response);
};

const requestForm = (url, method, formData) => {
  const token = localStorage.getItem('token');
  return fetch(`${API_BASE}${url}`, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  }).then(parseResponse);
};

const api = {
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMyProfile: () => request('/users/me'),

  updateMyProfile: (data) =>
    request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getImpactStats: () => request('/users/me/impact-stats'),

  getDailyInsight: () => request('/users/me/daily-insight'),

  createReport: (formData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then(parseResponse);
  },

  getActiveReports: (ward, limit = 10, page = 1, status = null) => {
    const params = new URLSearchParams({ limit, page });
    if (ward) params.append('ward', ward);
    if (status) params.append('status', status);
    return request(`/reports/active?${params}`);
  },

  getMyReports: (limit = 10, page = 1) =>
    request(`/reports/my-reports?limit=${limit}&page=${page}`),

  getReportById: (id) => request(`/reports/${id}`),

  toggleUpvote: (id) =>
    request(`/reports/${id}/upvote`, { method: 'PUT' }),

  saveReportAnalysis: (id, analysis) =>
    request(`/reports/${id}/ai-analysis`, {
      method: 'PUT',
      body: JSON.stringify(analysis),
    }),

  getReportComments: (id) => request(`/reports/${id}/comments`),

  addReportComment: (id, comment) =>
    request(`/reports/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  deleteReportComment: (commentId) =>
    request(`/reports/comments/${commentId}`, { method: 'DELETE' }),

  updateReportStatus: (id, status) =>
    request(`/reports/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getCommunityPulse: (ward, limit = 10) => {
    const params = new URLSearchParams({ limit });
    if (ward) params.append('ward', ward);
    return request(`/community/pulse?${params}`);
  },

  getDiscussions: ({ search, category, status, pinned, sort, limit = 10, page = 1 } = {}) => {
    const params = new URLSearchParams({ limit, page });
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    if (pinned) params.append('pinned', 'true');
    if (sort) params.append('sort', sort);
    return request(`/discussions?${params}`);
  },

  getDiscussionById: (id) => request(`/discussions/${id}`),

  createDiscussion: (formData) => requestForm('/discussions', 'POST', formData),

  updateDiscussion: (id, formData) => requestForm(`/discussions/${id}`, 'PUT', formData),

  deleteDiscussion: (id) => request(`/discussions/${id}`, { method: 'DELETE' }),

  togglePinDiscussion: (id) => request(`/discussions/${id}/pin`, { method: 'PATCH' }),

  voteOnPoll: (id, optionIndex) =>
    request(`/discussions/${id}/poll/vote`, {
      method: 'PATCH',
      body: JSON.stringify({ optionIndex }),
    }),

  setDiscussionStatus: (id, status) =>
    request(`/discussions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getComments: (discussionId) => request(`/comments/discussion/${discussionId}`),

  createComment: (formData) => requestForm('/comments', 'POST', formData),

  updateComment: (id, comment) =>
    request(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ comment }),
    }),

  deleteComment: (id) => request(`/comments/${id}`, { method: 'DELETE' }),

  toggleHighlightComment: (id) => request(`/comments/${id}/highlight`, { method: 'PATCH' }),

  markBestSuggestion: (id) => request(`/comments/${id}/best`, { method: 'PATCH' }),

  reactToComment: (id, type) =>
    request(`/comments/${id}/react`, {
      method: 'PATCH',
      body: JSON.stringify({ type }),
    }),

  searchUsers: (q) => request(`/users/search?q=${encodeURIComponent(q)}`),

  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  deleteNotification: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),

  getAdminStats: () => request('/admin/stats'),

  getAdminReports: ({ status, category, search, limit = 10, page = 1 } = {}) => {
    const params = new URLSearchParams({ limit, page });
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return request(`/admin/reports?${params}`);
  },
};

export default api;
