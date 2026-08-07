/**
 * ============================================================================
 *  API Service — Centralized HTTP Client for NagarBondhu AI
 * ============================================================================
 *
 * This file provides helper functions to communicate with the backend API.
 * Every function returns a Promise with the JSON response data.
 *
 * USAGE:
 *   import api from '../services/api';
 *   const data = await api.getMyProfile();
 */

// Vite forwards /api in development. A deployed frontend needs its backend URL
// supplied through VITE_API_BASE_URL because the Vite proxy is development-only.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

// ─── Helper: get auth headers ────────────────────────────────────────────────

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─── Helper: parse a response, with a clear error when the backend is down ──
// When the backend isn't running, Vite's proxy answers with an empty body;
// blindly calling response.json() on it throws the confusing
// "Unexpected end of JSON input". Detect that case and say what's actually wrong.

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

// ─── Helper: make a fetch call and handle errors ─────────────────────────────

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

// ─── Helper: send FormData (file uploads) ────────────────────────────────────
// The browser sets the multipart Content-Type (with boundary) itself,
// so we only attach the auth token here.

const requestForm = (url, method, formData) => {
  const token = localStorage.getItem('token');
  return fetch(`${API_BASE}${url}`, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  }).then(parseResponse);
};

// ─── Auth ────────────────────────────────────────────────────────────────────

const api = {
  // Register a new user
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Login user
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  // ─── User Profile ──────────────────────────────────────────────────────

  // Get current user's profile
  getMyProfile: () => request('/users/me'),

  // Update current user's profile
  updateMyProfile: (data) =>
    request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Get user's impact stats
  getImpactStats: () => request('/users/me/impact-stats'),

  // Get daily AI insight
  getDailyInsight: () => request('/users/me/daily-insight'),

  // ─── Reports ───────────────────────────────────────────────────────────

  // Create a new report
  createReport: (formData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Do NOT set Content-Type — browser auto-sets it for FormData with boundary
      },
      body: formData,  // Send FormData directly, don't JSON.stringify
    }).then(parseResponse);
  },

  // Get active reports (with optional ward and status filters)
  getActiveReports: (ward, limit = 10, page = 1, status = null) => {
    const params = new URLSearchParams({ limit, page });
    if (ward) params.append('ward', ward);
    if (status) params.append('status', status);
    return request(`/reports/active?${params}`);
  },

  // Get reports by the current user
  getMyReports: (limit = 10, page = 1) =>
    request(`/reports/my-reports?limit=${limit}&page=${page}`),

  // Get a single report by ID
  getReportById: (id) => request(`/reports/${id}`),

  // Toggle upvote on a report
  toggleUpvote: (id) =>
    request(`/reports/${id}/upvote`, { method: 'PUT' }),

  // Save the client-side AI analysis result for a report (reporter only)
  saveReportAnalysis: (id, analysis) =>
    request(`/reports/${id}/ai-analysis`, {
      method: 'PUT',
      body: JSON.stringify(analysis),
    }),

  // Get all comments of a report (flat list, oldest first)
  getReportComments: (id) => request(`/reports/${id}/comments`),

  // Add a comment to a report
  addReportComment: (id, comment) =>
    request(`/reports/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  // Delete a report comment (owner or admin)
  deleteReportComment: (commentId) =>
    request(`/reports/comments/${commentId}`, { method: 'DELETE' }),

  // Update report status (admin)
  updateReportStatus: (id, status) =>
    request(`/reports/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // ─── Community ─────────────────────────────────────────────────────────

  // Get community pulse (activity feed)
  getCommunityPulse: (ward, limit = 10) => {
    const params = new URLSearchParams({ limit });
    if (ward) params.append('ward', ward);
    return request(`/community/pulse?${params}`);
  },

  // ─── Community Discussions ─────────────────────────────────────────────

  // List discussions with search / filter / sort / pagination
  getDiscussions: ({ search, category, status, pinned, sort, limit = 10, page = 1 } = {}) => {
    const params = new URLSearchParams({ limit, page });
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    if (pinned) params.append('pinned', 'true');
    if (sort) params.append('sort', sort);
    return request(`/discussions?${params}`);
  },

  // Get a single discussion by ID
  getDiscussionById: (id) => request(`/discussions/${id}`),

  // Create a discussion (admin) — FormData because of the cover image
  createDiscussion: (formData) => requestForm('/discussions', 'POST', formData),

  // Edit a discussion (admin) — FormData because of the cover image
  updateDiscussion: (id, formData) => requestForm(`/discussions/${id}`, 'PUT', formData),

  // Delete a discussion (admin)
  deleteDiscussion: (id) => request(`/discussions/${id}`, { method: 'DELETE' }),

  // Pin / unpin a discussion (admin)
  togglePinDiscussion: (id) => request(`/discussions/${id}/pin`, { method: 'PATCH' }),

  // Vote on a discussion's poll (logged-in users; same option again = retract)
  voteOnPoll: (id, optionIndex) =>
    request(`/discussions/${id}/poll/vote`, {
      method: 'PATCH',
      body: JSON.stringify({ optionIndex }),
    }),

  // Open / close a discussion (admin)
  setDiscussionStatus: (id, status) =>
    request(`/discussions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // ─── Comments ──────────────────────────────────────────────────────────

  // Get all comments of a discussion (flat list; frontend builds the tree)
  getComments: (discussionId) => request(`/comments/discussion/${discussionId}`),

  // Create a comment or reply — FormData because of the optional image
  createComment: (formData) => requestForm('/comments', 'POST', formData),

  // Edit my own comment
  updateComment: (id, comment) =>
    request(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ comment }),
    }),

  // Delete a comment (owner or admin)
  deleteComment: (id) => request(`/comments/${id}`, { method: 'DELETE' }),

  // Highlight a comment (admin)
  toggleHighlightComment: (id) => request(`/comments/${id}/highlight`, { method: 'PATCH' }),

  // Mark / unmark best suggestion (admin)
  markBestSuggestion: (id) => request(`/comments/${id}/best`, { method: 'PATCH' }),

  // React to a comment (Like / Support / Helpful / Great Idea)
  reactToComment: (id, type) =>
    request(`/comments/${id}/react`, {
      method: 'PATCH',
      body: JSON.stringify({ type }),
    }),

  // Search users for @mentions
  searchUsers: (q) => request(`/users/search?q=${encodeURIComponent(q)}`),

  // ─── Notifications ─────────────────────────────────────────────────────

  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  deleteNotification: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),

  // ─── Admin ─────────────────────────────────────────────────────────────

  // Get admin dashboard stats
  getAdminStats: () => request('/admin/stats'),

  // Get ALL reports for admin management (with filters + pagination)
  getAdminReports: ({ status, category, search, limit = 10, page = 1 } = {}) => {
    const params = new URLSearchParams({ limit, page });
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return request(`/admin/reports?${params}`);
  },
};

export default api;
