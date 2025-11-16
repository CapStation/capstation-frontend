import apiClient from '@/lib/api-client';

class UserService {
  /**
   * Search user by email
   */
  static async searchByEmail(email) {
    try {
      const response = await apiClient.get('/users/search', {
        params: { email }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser() {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  static handleError(error) {
    const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan';
    const errorData = error.response?.data?.errors || null;

    return {
      message: errorMessage,
      errors: errorData,
      status: error.response?.status
    };
  }
}

export default UserService;
