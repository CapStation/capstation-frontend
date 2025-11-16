import apiClient from '@/lib/api-client';

class AnnouncementService {
  /**
   * Get all announcements with filters
   */
  static async getAnnouncements(page = 1, limit = 10, category = null, sort = 'newest', search = null) {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        sort,
        ...(category && category !== 'semua' && { category }),
        ...(search && { search })
      });

      const response = await apiClient.get(`/announcements?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('❌ AnnouncementService.getAnnouncements error:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Get announcement detail by ID
   */
  static async getAnnouncementById(id) {
    try {
      const response = await apiClient.get(`/announcements/${id}`);
      return response;
    } catch (error) {
      console.error('❌ AnnouncementService.getAnnouncementById error:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Get dashboard announcements (latest 5)
   */
  static async getDashboardAnnouncements() {
    try {
      const response = await apiClient.get('/announcements/dashboard/latest');
      return response;
    } catch (error) {
      console.error('❌ AnnouncementService.getDashboardAnnouncements error:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Create new announcement
   */
  static async createAnnouncement(announcementData) {
    try {
      const response = await apiClient.post('/announcements', announcementData);
      return response;
    } catch (error) {
      console.error('❌ AnnouncementService.createAnnouncement error:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Update announcement
   */
  static async updateAnnouncement(id, announcementData) {
    try {
      const response = await apiClient.put(`/announcements/${id}`, announcementData);
      return response;
    } catch (error) {
      console.error('❌ AnnouncementService.updateAnnouncement error:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Delete announcement
   */
  static async deleteAnnouncement(id) {
    try {
      const response = await apiClient.delete(`/announcements/${id}`);
      return response;
    } catch (error) {
      console.error('❌ AnnouncementService.deleteAnnouncement error:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }
}

export default AnnouncementService;
