/**
 * Authentication utility functions
 */

/**
 * Get authorization header with bearer token
 * @returns {Object} Authorization header object
 */
export const getAuthHeader = () => {
  // Prefer `accessToken` (used by apiClient/AuthContext), fallback to legacy `token`
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  if (!token) return {};
  return { 'Authorization': `Bearer ${token}` };
};

/**
 * Get token from localStorage
 * @returns {string|null} Token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('accessToken') || localStorage.getItem('token');
};

/**
 * Set token to localStorage
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
  // Write token to both keys to keep codebase consistent
  localStorage.setItem('accessToken', token);
  localStorage.setItem('token', token);
};

/**
 * Remove token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
};

/**
 * Check if user is authenticated (has valid token)
 * @returns {boolean} True if token exists
 */
export const isAuthenticated = () => {
  return !!(localStorage.getItem('accessToken') || localStorage.getItem('token'));
};
