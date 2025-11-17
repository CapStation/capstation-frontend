import apiClient from '@/lib/api-client';

class AdminService {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Statistics data
   */
  async getDashboardStats() {
    try {
      // Fetch data from multiple endpoints to build statistics
      const [projectsRes, usersRes, groupsRes, documentsRes] = await Promise.allSettled([
        apiClient.get('/projects'),
        apiClient.get('/users'),
        apiClient.get('/groups'),
        apiClient.get('/documents?limit=1000'), // Get all documents with high limit
      ]);

      const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.data : [];
      const users = usersRes.status === 'fulfilled' ? usersRes.value.data : [];
      const groups = groupsRes.status === 'fulfilled' ? groupsRes.value.data : [];
      
      // Debug: Log documents response structure
      console.log('📄 Documents Response:', documentsRes);
      if (documentsRes.status === 'fulfilled') {
        console.log('📄 Documents Data:', documentsRes.value.data);
      }
      
      // Documents response has nested structure: { data: { documents: [...], pagination: {...} } }
      let totalDocuments = 0;
      if (documentsRes.status === 'fulfilled') {
        const responseData = documentsRes.value.data;
        
        // Check if response has nested data.data structure
        if (responseData?.data?.documents) {
          totalDocuments = responseData.data.pagination?.total || responseData.data.documents.length;
          console.log('📄 Total Documents (nested):', totalDocuments);
        } 
        // Or direct data.documents structure
        else if (responseData?.documents) {
          totalDocuments = responseData.pagination?.total || responseData.documents.length;
          console.log('📄 Total Documents (direct):', totalDocuments);
        }
        // Or array directly
        else if (Array.isArray(responseData)) {
          totalDocuments = responseData.length;
          console.log('📄 Total Documents (array):', totalDocuments);
        }
      }

      return {
        success: true,
        data: {
          totalProjects: Array.isArray(projects) ? projects.length : 0,
          totalUsers: Array.isArray(users) ? users.length : 0,
          totalGroups: Array.isArray(groups) ? groups.length : 0,
          totalDocuments: totalDocuments,
          activeProjects: Array.isArray(projects) ? projects.filter(p => p.status === 'active').length : 0,
          pendingRequests: Array.isArray(projects) ? projects.filter(p => p.capstoneStatus === 'pending').length : 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengambil statistik dashboard',
      };
    }
  }

  /**
   * Get all users (admin only)
   * @param {Object} params - Query parameters (page, limit, search, etc)
   * @returns {Promise<Object>} Users data
   */
  async getAllUsers(params = {}) {
    try {
      const response = await apiClient.get('/users', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengambil data pengguna',
      };
    }
  }

  /**
   * Create new user (admin only)
   * @param {Object} userData - User data (name, email, password, role, isVerified, roleApproved)
   * @returns {Promise<Object>} Created user data
   */
  async createUser(userData) {
    try {
      const response = await apiClient.post('/users', userData);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal membuat pengguna',
      };
    }
  }

  /**
   * Get all projects (admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Projects data
   */
  async getAllProjects(params = {}) {
    try {
      const response = await apiClient.get('/projects', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengambil data proyek',
      };
    }
  }

  /**
   * Get all groups (admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Groups data
   */
  async getAllGroups(params = {}) {
    try {
      const response = await apiClient.get('/groups', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengambil data grup',
      };
    }
  }

  /**
   * Get all documents (admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Documents data
   */
  async getAllDocuments(params = {}) {
    try {
      const response = await apiClient.get('/documents', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengambil data dokumen',
      };
    }
  }

  /**
   * Export data to CSV
   * @param {string} type - Type of data (users, projects, groups, documents)
   * @returns {Promise<Object>} Export result
   */
  async exportData(type) {
    try {
      const response = await apiClient.get(`/${type}`, {
        responseType: 'blob',
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengekspor data',
      };
    }
  }

  /**
   * Get pending role requests
   * @returns {Promise<Object>} Pending users data
   */
  async getPendingRoles() {
    try {
      const response = await apiClient.get('/admin/pending-roles');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengambil data permintaan role',
      };
    }
  }

  /**
   * Approve pending role request
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Approval result
   */
  async approveRole(userId) {
    try {
      const response = await apiClient.put(`/admin/pending-roles/${userId}/approve`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal menyetujui permintaan role',
      };
    }
  }

  /**
   * Get all competencies
   * @param {Object} params - Query parameters (page, limit, search, category)
   * @returns {Promise<Object>} Competencies data
   */
  async getAllCompetencies(params = {}) {
    try {
      const response = await apiClient.get('/competencies', { params });
      return {
        success: true,
        data: response, // apiClient.get already returns the data directly
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengambil data kompetensi',
      };
    }
  }

  /**
   * Create new competency (admin only)
   * @param {Object} data - Competency data
   * @returns {Promise<Object>} Created competency
   */
  async createCompetency(data) {
    try {
      const response = await apiClient.post('/competencies', data);
      return {
        success: true,
        data: response, // apiClient.post already returns the data directly
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal membuat kompetensi',
      };
    }
  }

  /**
   * Update competency (admin only)
   * @param {string} id - Competency ID
   * @param {Object} data - Updated competency data
   * @returns {Promise<Object>} Updated competency
   */
  async updateCompetency(id, data) {
    try {
      const response = await apiClient.put(`/competencies/${id}`, data);
      return {
        success: true,
        data: response, // apiClient.put already returns the data directly
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal memperbarui kompetensi',
      };
    }
  }

  /**
   * Delete/deactivate competency (admin only)
   * @param {string} id - Competency ID
   * @returns {Promise<Object>} Result
   */
  async deleteCompetency(id) {
    try {
      const response = await apiClient.delete(`/competencies/${id}`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal menghapus kompetensi',
      };
    }
  }

  // ==================== GROUPS MANAGEMENT ====================

  /**
   * Get all groups (admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Groups data
   */
  async getAllGroups(params = {}) {
    try {
      const response = await apiClient.get('/groups', { params });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengambil data grup',
      };
    }
  }

  /**
   * Get group by ID (admin only)
   * @param {string} id - Group ID
   * @returns {Promise<Object>} Group data
   */
  async getGroupById(id) {
    try {
      const response = await apiClient.get(`/groups/${id}`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengambil detail grup',
      };
    }
  }

  /**
   * Update group (admin only)
   * @param {string} id - Group ID
   * @param {Object} data - Updated group data
   * @returns {Promise<Object>} Updated group
   */
  async updateGroup(id, data) {
    try {
      const response = await apiClient.put(`/groups/${id}`, data);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal memperbarui grup',
      };
    }
  }

  /**
   * Delete group (admin only)
   * @param {string} id - Group ID
   * @returns {Promise<Object>} Result
   */
  async deleteGroup(id) {
    try {
      const response = await apiClient.delete(`/groups/${id}`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal menghapus grup',
      };
    }
  }

  // ==================== ANNOUNCEMENTS MANAGEMENT ====================

  /**
   * Get all announcements (admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Announcements data
   */
  async getAllAnnouncements(params = {}) {
    try {
      const response = await apiClient.get('/announcements', { params });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengambil data pengumuman',
      };
    }
  }

  /**
   * Create announcement (admin only)
   * @param {Object} data - Announcement data
   * @returns {Promise<Object>} Created announcement
   */
  async createAnnouncement(data) {
    try {
      const response = await apiClient.post('/announcements', data);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal membuat pengumuman',
      };
    }
  }

  /**
   * Update announcement (admin only)
   * @param {string} id - Announcement ID
   * @param {Object} data - Updated announcement data
   * @returns {Promise<Object>} Updated announcement
   */
  async updateAnnouncement(id, data) {
    try {
      const response = await apiClient.put(`/announcements/${id}`, data);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal memperbarui pengumuman',
      };
    }
  }

  /**
   * Delete announcement (admin only)
   * @param {string} id - Announcement ID
   * @returns {Promise<Object>} Result
   */
  async deleteAnnouncement(id) {
    try {
      const response = await apiClient.delete(`/announcements/${id}`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal menghapus pengumuman',
      };
    }
  }
}

const adminService = new AdminService();
export default adminService;
