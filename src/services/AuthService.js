import apiClient from '@/lib/api-client';
import endpoints from '@/lib/api-config';

/**
 * AuthService Class
 * OOP wrapper untuk authentication-related API calls
 */
class AuthService {
  /**
   * Register new user
   * @param {Object} userData - { name, email, password, role }
   * @returns {Promise<Object>} Response with message
   */
  async register(userData) {
    try {
      const response = await apiClient.post(endpoints.auth.register, userData);
      return {
        success: true,
        message: response.message || 'Registrasi berhasil',
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Registrasi gagal',
      };
    }
  }

  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} Response with accessToken and user
   */
  async login(email, password) {
    try {
      const response = await apiClient.post(endpoints.auth.login, {
        email,
        password,
      });

      if (response.accessToken) {
        return {
          success: true,
          accessToken: response.accessToken,
          user: response.user,
        };
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login gagal',
      };
    }
  }

  /**
   * Logout user
   * @returns {Promise<Object>}
   */
  async logout() {
    try {
      await apiClient.post(endpoints.auth.logout);
      apiClient.removeAuthToken();
      return { success: true };
    } catch (error) {
      // Even if API call fails, remove token locally
      apiClient.removeAuthToken();
      return { success: true };
    }
  }

  /**
   * Get current user info
   * @returns {Promise<Object>} User data
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get(endpoints.auth.me);
      return {
        success: true,
        user: response.user || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get user info',
      };
    }
  }

  /**
   * Request password reset
   * @param {string} email
   * @returns {Promise<Object>}
   */
  async forgotPassword(email) {
    try {
      const response = await apiClient.post(endpoints.auth.forgotPassword, {
        email,
      });
      return {
        success: true,
        message: response.message || 'Reset link sent to email',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to send reset link',
      };
    }
  }

  /**
   * Reset password with token
   * @param {string} token
   * @param {string} email
   * @param {string} newPassword
   * @returns {Promise<Object>}
   */
  async resetPassword(token, email, newPassword) {
    try {
      const response = await apiClient.post(endpoints.auth.resetPassword, {
        token,
        email,
        newPassword,
      });
      return {
        success: true,
        message: response.message || 'Password reset successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Password reset failed',
      };
    }
  }

  /**
   * Verify email with token
   * @param {string} token
   * @param {string} email
   * @returns {Promise<Object>}
   */
  async verifyEmail(token, email) {
    try {
      const response = await apiClient.get(
        `${endpoints.auth.verifyEmail}?token=${token}&email=${encodeURIComponent(email)}`
      );
      return {
        success: true,
        message: response.message || 'Email verified successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Email verification failed',
      };
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!apiClient.getAuthToken();
  }

  /**
   * Get stored auth token
   * @returns {string|null}
   */
  getToken() {
    return apiClient.getAuthToken();
  }

  /**
   * Set auth token
   * @param {string} token
   */
  setToken(token) {
    apiClient.setAuthToken(token);
  }

  /**
   * Remove auth token
   */
  removeToken() {
    apiClient.removeAuthToken();
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
