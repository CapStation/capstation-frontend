import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-config';

/**
 * Dashboard Service Class
 * Handles all dashboard-related API operations
 */
class DashboardService {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard stats data
   */
  async getStats() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.STATS);
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Gagal mengambil statistik dashboard' 
      };
    }
  }

  /**
   * Get recent announcements for dashboard
   * @param {number} limit - Number of announcements to fetch
   * @returns {Promise<Object>} Recent announcements data
   */
  async getRecentAnnouncements(limit = 5) {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.DASHBOARD.ANNOUNCEMENTS}?limit=${limit}`
      );
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Gagal mengambil pengumuman terbaru' 
      };
    }
  }

  /**
   * Get user's recent activities
   * @param {number} limit - Number of activities to fetch
   * @returns {Promise<Object>} Recent activities data
   */
  async getRecentActivities(limit = 10) {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.DASHBOARD.ACTIVITIES}?limit=${limit}`
      );
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Gagal mengambil aktivitas terbaru' 
      };
    }
  }
}

// Export singleton instance
const dashboardService = new DashboardService();
export default dashboardService;
