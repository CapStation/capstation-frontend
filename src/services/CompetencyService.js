import apiClient from "@/lib/api-client";
import { endpoints } from "@/lib/api-config";

class CompetencyService {

  async getAllCompetencies(filters = {}) {
    try {
      const { category, search, page = 1, limit = 50 } = filters;
      const params = new URLSearchParams();
      
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      params.append('page', page);
      params.append('limit', limit);
      
      const url = `${endpoints.competencies.base}?${params.toString()}`;
      console.log('📚 CompetencyService: Fetching competencies from', url);
      
      const response = await apiClient.get(url);
      console.log('✅ CompetencyService: Competencies fetched:', response);
      
      return { 
        success: true, 
        data: response.competencies || response.data || response,
        pagination: response.pagination 
      };
    } catch (error) {
      console.error('❌ CompetencyService.getAllCompetencies error:', error);
      return { success: false, error: error.message || 'Gagal mengambil daftar kompetensi' };
    }
  }


  async getCompetenciesByCategory() {
    try {
      console.log('📚 CompetencyService: Fetching competencies by category');
      const response = await apiClient.get(`${endpoints.competencies.base}/by-category`);
      console.log('✅ CompetencyService: Categories fetched:', response);
      
      return { 
        success: true, 
        data: response.categories || response.data || response 
      };
    } catch (error) {
      console.error('❌ CompetencyService.getCompetenciesByCategory error:', error);
      return { success: false, error: error.message || 'Gagal mengambil kategori kompetensi' };
    }
  }


  async getCompetencyCategories() {
    try {
      console.log('📚 CompetencyService: Fetching categories');
      const response = await apiClient.get(`${endpoints.competencies.base}/categories`);
      console.log('✅ CompetencyService: Categories list:', response);
      
      return { 
        success: true, 
        data: response.categories || response.data || response 
      };
    } catch (error) {
      console.error('❌ CompetencyService.getCompetencyCategories error:', error);
      return { success: false, error: error.message || 'Gagal mengambil kategori' };
    }
  }


  async getMyCompetencies() {
    try {
      console.log('📚 CompetencyService: Fetching my competencies');
      
      const response = await apiClient.get(`${endpoints.users.base}/competencies`);
      console.log('✅ CompetencyService: My competencies:', response);
      
      return { 
        success: true, 
        data: response.competencies || response.data || response 
      };
    } catch (error) {
      console.error('❌ CompetencyService.getMyCompetencies error:', error);
      return { success: false, error: error.message || 'Gagal mengambil kompetensi Anda' };
    }
  }

 
  async addCompetency(competencyId) {
    try {
      console.log('➕ CompetencyService: Adding competency:', competencyId);
      const response = await apiClient.post(`${endpoints.users.base}/competencies`, { 
        competencyId 
      });
      console.log('✅ CompetencyService: Competency added:', response);
      
      return { 
        success: true, 
        data: response.competencies || response.data || response,
        message: response.message || 'Kompetensi berhasil ditambahkan'
      };
    } catch (error) {
      console.error('❌ CompetencyService.addCompetency error:', error);
      return { 
        success: false, 
        error: error.data?.message || error.message || 'Gagal menambahkan kompetensi' 
      };
    }
  }


  async removeCompetency(index) {
    try {
      console.log('➖ CompetencyService: Removing competency at index:', index);
      const response = await apiClient.delete(`${endpoints.users.base}/competencies/${index}`);
      console.log('✅ CompetencyService: Competency removed:', response);
      
      return { 
        success: true, 
        data: response.competencies || response.data || response,
        message: response.message || 'Kompetensi berhasil dihapus'
      };
    } catch (error) {
      console.error('❌ CompetencyService.removeCompetency error:', error);
      return { 
        success: false, 
        error: error.data?.message || error.message || 'Gagal menghapus kompetensi' 
      };
    }
  }


  async updateCompetency(index, competencyId) {
    try {
      console.log('✏️ CompetencyService: Updating competency at index:', index);
      const response = await apiClient.put(`${endpoints.users.base}/competencies/${index}`, { 
        competencyId 
      });
      console.log('✅ CompetencyService: Competency updated:', response);
      
      return { 
        success: true, 
        data: response.competencies || response.data || response,
        message: response.message || 'Kompetensi berhasil diperbarui'
      };
    } catch (error) {
      console.error('❌ CompetencyService.updateCompetency error:', error);
      return { 
        success: false, 
        error: error.data?.message || error.message || 'Gagal memperbarui kompetensi' 
      };
    }
  }

  async setCompetencies(competencyIds) {
    try {
      console.log('🔄 CompetencyService: Setting all competencies:', competencyIds);
      const response = await apiClient.put(`${endpoints.users.base}/competencies`, { 
        competencyIds 
      });
      console.log('✅ CompetencyService: Competencies set:', response);
      
      return { 
        success: true, 
        data: response.competencies || response.data || response,
        message: response.message || 'Kompetensi berhasil diperbarui'
      };
    } catch (error) {
      console.error('❌ CompetencyService.setCompetencies error:', error);
      return { 
        success: false, 
        error: error.data?.message || error.message || 'Gagal memperbarui kompetensi' 
      };
    }
  }


  async searchUsersByCompetency(competencyId) {
    try {
      console.log('🔍 CompetencyService: Searching users by competency:', competencyId);
      const response = await apiClient.get(`${endpoints.users.search}?competencyId=${competencyId}`);
      console.log('✅ CompetencyService: Users found:', response);
      
      return { 
        success: true, 
        data: response.users || response.data || response 
      };
    } catch (error) {
      console.error('❌ CompetencyService.searchUsersByCompetency error:', error);
      return { success: false, error: error.message || 'Gagal mencari pengguna' };
    }
  }
}

const competencyService = new CompetencyService();
export default competencyService;