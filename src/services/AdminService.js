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
        apiClient.get('/documents'),
      ]);

      const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.data : [];
      const users = usersRes.status === 'fulfilled' ? usersRes.value.data : [];
      const groups = groupsRes.status === 'fulfilled' ? groupsRes.value.data : [];
      const documents = documentsRes.status === 'fulfilled' ? documentsRes.value.data : [];

      return {
        success: true,
        data: {
          totalProjects: Array.isArray(projects) ? projects.length : 0,
          totalUsers: Array.isArray(users) ? users.length : 0,
          totalGroups: Array.isArray(groups) ? groups.length : 0,
          totalDocuments: Array.isArray(documents) ? documents.length : 0,
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
        data: response, // apiClient.delete already returns the data directly
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal menghapus kompetensi',
      };
    }
  }
}

const adminService = new AdminService();
export default adminService;
