import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-config";

class ProjectService {
  async getMyProjects() {
    try {
      console.log('🔍 ProjectService: Fetching my projects from', API_ENDPOINTS.projects.my);
      // Add populate parameter to get full owner and supervisor data
      const url = `${API_ENDPOINTS.projects.my}?populate=owner,supervisor`;
      const response = await apiClient.get(url);
      console.log('📦 ProjectService: Raw response:', response);
      
      // API returns { success: true, data: [...] }
      // So we need to return response.data
      const result = { 
        success: true, 
        data: response.data || response // Handle both formats
      };
      
      console.log('✅ ProjectService: Processed result:', result);
      return result;
    } catch (error) {
      console.error("❌ ProjectService.getMyProjects error:", {
        message: error.message,
        status: error.status,
        fullError: error
      });
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  async getAllProjects(filters = {}) {
    try {
      // Add populate parameter to get full owner and supervisor data
      const params = {
        ...filters,
        populate: 'owner,supervisor'
      };
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams 
        ? `${API_ENDPOINTS.projects.list}?${queryParams}` 
        : API_ENDPOINTS.projects.list;
      
      console.log('🔍 ProjectService: Fetching all projects with populate from', url);
      const response = await apiClient.get(url);
      console.log('📦 ProjectService: getAllProjects response:', response);
      
      // API returns { success: true, data: [...] }
      return { 
        success: true, 
        data: response.data || response // Handle both formats
      };
    } catch (error) {
      console.error("❌ ProjectService.getAllProjects error:", error);
      return { success: false, error: error.message };
    }
  }

  async getProjectById(id) {
    try {
      // Add populate parameter to get full owner, supervisor, group, and members data
      const url = `${API_ENDPOINTS.projects.detail(id)}?populate=owner,supervisor,group,members`;
      console.log('🔍 ProjectService: Fetching project detail from', url);
      const response = await apiClient.get(url);
      console.log('📦 ProjectService: getProjectById response:', response);
      
      // API returns { success: true, data: {...} }
      return { 
        success: true, 
        data: response.data || response // Handle both formats
      };
    } catch (error) {
      console.error("❌ ProjectService.getProjectById error:", error);
      return { success: false, error: error.message };
    }
  }

  async getAvailableProjects() {
    try {
      console.log('📊 ProjectService: Fetching available projects');
      const response = await apiClient.get(`${API_ENDPOINTS.projects.list}?status=dapat_dilanjutkan`);
      console.log('✅ ProjectService: Available projects response:', response);
      
      // Return the count of available projects
      const projects = response.data || response;
      return { 
        success: true, 
        count: Array.isArray(projects) ? projects.length : 0,
        data: projects
      };
    } catch (error) {
      console.error("❌ ProjectService.getAvailableProjects error:", error);
      return { success: false, error: error.message, count: 0 };
    }
  }

  async createProject(projectData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.projects.create, projectData);
      return { success: true, data: response };
    } catch (error) {
      console.error("ProjectService.createProject error:", error);
      return { success: false, error: error.message };
    }
  }

  async updateProject(id, projectData) {
    try {
      console.log('🔵 ProjectService.updateProject called with:', {
        id,
        projectData,
        endpoint: API_ENDPOINTS.projects.update(id),
      });
      
      const response = await apiClient.put(API_ENDPOINTS.projects.update(id), projectData);
      
      console.log('✅ ProjectService.updateProject success:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('🔴 ProjectService.updateProject error:', {
        message: error.message || 'Unknown error',
        status: error.status,
        data: error.data,
        stack: error.stack,
      });
      console.error('🔴 Full error:', error);
      return { 
        success: false, 
        error: error.message || error.data?.message || 'Gagal mengupdate project'
      };
    }
  }

  async deleteProject(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.projects.delete(id));
      return { success: true, data: response };
    } catch (error) {
      console.error("ProjectService.deleteProject error:", error);
      return { success: false, error: error.message };
    }
  }

  async getProjectDocuments(projectId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.documents.list(projectId));
      return { success: true, data: response };
    } catch (error) {
      console.error("ProjectService.getProjectDocuments error:", error);
      return { success: false, error: error.message };
    }
  }

  async uploadDocument(projectId, formData) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.documents.upload, 
        formData
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("ProjectService.uploadDocument error:", error);
      return { success: false, error: error.message };
    }
  }

  async deleteDocument(projectId, documentId) {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.documents.delete(documentId)
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("ProjectService.deleteDocument error:", error);
      return { success: false, error: error.message };
    }
  }

  async downloadDocument(documentId) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('❌ No auth token found');
      return { 
        success: false, 
        error: 'No authentication token found. Please login again.'
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const url = `${baseUrl}${API_ENDPOINTS.documents.download(documentId)}`;
    
    console.log('📥 Starting download:', { documentId, url });
    
    let response;
    let blob;
    let downloadSuccess = false;
    
    try {
      // Fetch document
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      console.log('📦 Response received:', { 
        status: response.status, 
        ok: response.ok,
        contentType: response.headers.get('Content-Type')
      });

      // Check response status
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        console.error('❌ Download failed:', errorMessage);
        return { 
          success: false, 
          error: errorMessage 
        };
      }

      // Get filename
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `document-${documentId}`;
      
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, '').trim();
        }
      }

      console.log('📄 Filename:', filename);

      // Get blob
      blob = await response.blob();
      console.log('💾 Blob:', { 
        size: blob.size, 
        type: blob.type,
        sizeKB: (blob.size / 1024).toFixed(2) + ' KB'
      });

      if (blob.size === 0) {
        console.error('❌ Empty file received');
        return { 
          success: false, 
          error: 'Received empty file from server' 
        };
      }

      // Trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = blobUrl;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      
      // Mark as successful immediately after click
      downloadSuccess = true;
      
      // Cleanup (wrapped to prevent errors)
      setTimeout(() => {
        try {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        } catch (cleanupError) {
          // Ignore cleanup errors (IDM might interfere)
        }
      }, 100);

      console.log('✅ Download completed:', filename);
      
      // Return success immediately, don't wait for anything else
      // IDM might cause connection issues after this point but download works
      return { success: true, filename };
      
    } catch (error) {
      // If download was successful before this error, ignore it
      if (downloadSuccess) {
        console.log('✅ Download completed successfully');
        console.log('ℹ️ Note: Post-download error ignored (likely caused by download manager like IDM)');
        return { success: true };
      }
      
      console.error("❌ Download error:", error.message || error);
      return { 
        success: false, 
        error: error.message || 'Network error: Cannot connect to server'
      };
    }
  }
}

const projectService = new ProjectService();
export default projectService;
