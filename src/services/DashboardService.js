import apiClient from '@/lib/api-client';
import { endpoints } from '@/lib/api-config';

/**
 * Dashboard Service Class
 * Handles all dashboard-related API operations
 */
class DashboardService {
  /**
   * Get complete dashboard data (all stats, announcements, etc.)
   * This endpoint returns all dashboard data in one call
   * @returns {Promise<Object>} Complete dashboard data
   */
  async getDashboardData() {
    try {
      // Use /dashboard endpoint directly (not /dashboard/stats)
      console.log('📡 Fetching dashboard data from:', '/dashboard');
      const response = await apiClient.get('/dashboard');
      console.log('✅ Dashboard data received:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Dashboard API Error:', {
        message: error.message,
        status: error.status,
        data: error.data,
        endpoint: '/dashboard'
      });
      return { 
        success: false, 
        error: error.message || error.data?.message || 'Gagal mengambil data dashboard' 
      };
    }
  }

  /**
   * Get dashboard statistics only
   * @returns {Promise<Object>} Dashboard stats data
   */
  async getStats() {
    try {
      const response = await apiClient.get('/dashboard');
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Gagal mengambil statistik dashboard' 
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
        `${endpoints.announcements.base}?limit=${limit}`
      );
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Gagal mengambil pengumuman terbaru' 
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
        `${endpoints.dashboard.activities}?limit=${limit}`
      );
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Gagal mengambil aktivitas terbaru' 
      };
    }
  }
}

// Export singleton instance
const dashboardService = new DashboardService();
export default dashboardService;