import apiClient from '@/lib/api-client';
import { endpoints } from '@/lib/api-config';

class AnnouncementService {
  /**
   * Get all announcements with filters
   */
  static async getAnnouncements(page = 1, limit = 10, category = null, sort = 'newest', search = null) {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        sort: sort || 'newest',
        ...(search && { search })
      });

      const response = await apiClient.get(`/announcements?${params.toString()}`);
      
      return {
        success: response.success !== false,
        data: response.data || [],
        message: response.message,
        pagination: response.pagination
      };
    } catch (error) {
      console.error('❌ AnnouncementService.getAnnouncements error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengambil pengumuman',
        data: []
      };
    }
  }

  /**
   * Get announcement detail by ID
   */
  static async getAnnouncementById(id) {
    try {
      if (!id) throw new Error('Announcement ID tidak valid');

      const response = await apiClient.get(`/announcements/${id}`);
      
      return {
        success: response.success !== false,
        data: response.data || response
      };
    } catch (error) {
      console.error('❌ AnnouncementService.getAnnouncementById error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengambil detail pengumuman'
      };
    }
  }

  /**
   * Get dashboard announcements (latest 5)
   */
  static async getDashboardAnnouncements() {
    try {
      const response = await apiClient.get('/announcements?limit=5&sort=newest');
      
      return {
        success: response.success !== false,
        data: response.data || [],
        message: response.message
      };
    } catch (error) {
      console.error('❌ AnnouncementService.getDashboardAnnouncements error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengambil pengumuman dashboard',
        data: []
      };
    }
  }

  /**
   * Create new announcement (Admin/Dosen only)
   */
  static async createAnnouncement(announcementData) {
    try {
      const { title, content, isImportant } = announcementData;

      // Validation
      if (!title || title.trim().length === 0) {
        throw new Error('Judul pengumuman harus diisi');
      }

      if (title.trim().length < 3) {
        throw new Error('Judul minimal 3 karakter');
      }

      if (title.trim().length > 200) {
        throw new Error('Judul maksimal 200 karakter');
      }

      if (!content || content.trim().length === 0) {
        throw new Error('Konten pengumuman harus diisi');
      }

      if (content.trim().length < 10) {
        throw new Error('Konten minimal 10 karakter');
      }

      const payload = {
        title: title.trim(),
        content: content.trim(),
        isImportant: isImportant || false
      };

      console.log('📤 Creating announcement with payload:', payload);

      const response = await apiClient.post('/announcements', payload);

      console.log('✅ Announcement created successfully:', response);

      return {
        success: response.success !== false,
        data: response.data || response,
        message: response.message || 'Pengumuman berhasil dibuat'
      };
    } catch (error) {
      console.error('❌ AnnouncementService.createAnnouncement error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal membuat pengumuman'
      };
    }
  }

  /**
   * Update announcement (Admin/Dosen only, creator only)
   */
  static async updateAnnouncement(id, announcementData) {
    try {
      if (!id) throw new Error('Announcement ID tidak valid');

      const { title, content, isImportant } = announcementData;

      // Validation
      if (!title || title.trim().length === 0) {
        throw new Error('Judul pengumuman harus diisi');
      }

      if (title.trim().length < 3) {
        throw new Error('Judul minimal 3 karakter');
      }

      if (title.trim().length > 200) {
        throw new Error('Judul maksimal 200 karakter');
      }

      if (!content || content.trim().length === 0) {
        throw new Error('Konten pengumuman harus diisi');
      }

      if (content.trim().length < 10) {
        throw new Error('Konten minimal 10 karakter');
      }

      const payload = {
        title: title.trim(),
        content: content.trim(),
        isImportant: isImportant || false
      };

      console.log('📤 Updating announcement with payload:', payload);

      const response = await apiClient.put(`/announcements/${id}`, payload);

      console.log('✅ Announcement updated successfully:', response);

      return {
        success: response.success !== false,
        data: response.data || response,
        message: response.message || 'Pengumuman berhasil diperbarui'
      };
    } catch (error) {
      console.error('❌ AnnouncementService.updateAnnouncement error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal memperbarui pengumuman'
      };
    }
  }

  /**
   * Delete announcement (Admin/Dosen only, creator only)
   */
  static async deleteAnnouncement(id) {
    try {
      if (!id) throw new Error('Announcement ID tidak valid');

      console.log('🗑️ Deleting announcement:', id);

      const response = await apiClient.delete(`/announcements/${id}`);

      console.log('✅ Announcement deleted successfully:', response);

      return {
        success: response.success !== false,
        message: response.message || 'Pengumuman berhasil dihapus'
      };
    } catch (error) {
      console.error('❌ AnnouncementService.deleteAnnouncement error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal menghapus pengumuman'
      };
    }
  }

  /**
   * Search announcements
   */
  static async searchAnnouncements(searchQuery, options = {}) {
    try {
      if (!searchQuery || searchQuery.trim().length === 0) {
        throw new Error('Search query tidak boleh kosong');
      }

      return this.getAnnouncements(1, 10, options.category || null, options.sort || 'newest', searchQuery);
    } catch (error) {
      console.error('❌ AnnouncementService.searchAnnouncements error:', error);
      return {
        success: false,
        error: error.message || 'Gagal mencari pengumuman',
        data: []
      };
    }
  }

  /**
   * Get announcements by category
   */
  static async getAnnouncementsByCategory(category) {
    try {
      if (!category) {
        throw new Error('Category tidak boleh kosong');
      }

      return this.getAnnouncements(1, 10, category, 'newest', null);
    } catch (error) {
      console.error('❌ AnnouncementService.getAnnouncementsByCategory error:', error);
      return {
        success: false,
        error: error.message || 'Gagal mengambil pengumuman berdasarkan kategori',
        data: []
      };
    }
  }

  /**
   * Get important announcements only
   */
  static async getImportantAnnouncements() {
    try {
      const response = await apiClient.get('/announcements?isImportant=true&sort=newest&limit=10');
      
      return {
        success: response.success !== false,
        data: response.data || [],
        message: response.message
      };
    } catch (error) {
      console.error('❌ AnnouncementService.getImportantAnnouncements error:', error);
      return {
        success: false,
        error: error.message || 'Gagal mengambil pengumuman penting',
        data: []
      };
    }
  }
}

export default AnnouncementService;