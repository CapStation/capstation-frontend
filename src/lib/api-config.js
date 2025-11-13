// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// API Endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify',
    me: '/auth/me',
    google: '/oauth/google',
  },
  
  // Dashboard
  dashboard: {
    stats: '/dashboard/stats',
    announcements: '/dashboard/announcements',
    activities: '/dashboard/activities',
  },
  
  // Users
  users: {
    base: '/users',
    profile: (id) => `/users/${id}`,
    updateProfile: '/users/profile',
    changePassword: '/users/change-password',
    search: '/users/search',
    competencies: (id) => `/users/${id}/competencies`,
  },
  
  // Projects
  projects: {
    base: '/projects',
    list: '/projects',
    detail: (id) => `/projects/${id}`,
    my: '/projects/my-projects',
    create: '/projects',
    update: (id) => `/projects/${id}`,
    delete: (id) => `/projects/${id}`,
    members: (id) => `/projects/${id}/members`,
  },
  
  // Documents
  documents: {
    base: '/documents',
    list: (projectId) => `/projects/${projectId}/documents`,
    detail: (id) => `/documents/${id}`,
    upload: (projectId) => `/projects/${projectId}/documents`,
    update: (id) => `/documents/${id}`,
    delete: (projectId, documentId) => `/projects/${projectId}/documents/${documentId}`,
    download: (id) => `/documents/${id}/download`,
  },
  
  // Capstone Browse
  capstone: {
    browse: '/capstone/browse',
    detail: (id) => `/capstone/${id}`,
    categories: '/capstone/categories',
  },
  
  // Groups
  groups: {
    base: '/groups',
    detail: (id) => `/groups/${id}`,
    my: '/groups/my',
    create: '/groups',
    update: (id) => `/groups/${id}`,
    delete: (id) => `/groups/${id}`,
    join: (id) => `/groups/${id}/join`,
    leave: (id) => `/groups/${id}/leave`,
    members: (id) => `/groups/${id}/members`,
  },
  
  // Announcements
  announcements: {
    base: '/announcements',
    detail: (id) => `/announcements/${id}`,
    create: '/announcements',
    update: (id) => `/announcements/${id}`,
    delete: (id) => `/announcements/${id}`,
  },
  
  // Competencies
  competencies: {
    base: '/competencies',
    detail: (id) => `/competencies/${id}`,
    create: '/competencies',
    update: (id) => `/competencies/${id}`,
    delete: (id) => `/competencies/${id}`,
    search: '/competencies/search',
  },
  
  // Request Decisions
  requests: {
    base: '/requests',
    detail: (id) => `/requests/${id}`,
    my: '/requests/my',
    create: '/requests',
    cancel: (id) => `/requests/${id}/cancel`,
  },
  
  decisions: {
    inbox: '/decisions/inbox',
    history: '/decisions/history',
    approve: (id) => `/decisions/${id}/approve`,
    reject: (id) => `/decisions/${id}/reject`,
  },
  
  // Admin
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    pendingRoles: '/admin/pending-roles',
    approveRole: (id) => `/admin/users/${id}/approve-role`,
    rejectRole: (id) => `/admin/users/${id}/reject-role`,
  },
};

// Named export for easier access
export const API_ENDPOINTS = endpoints;

export default endpoints;
