import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-config";

class ProjectService {
  async getMyProjects() {
    try {
      console.log('🔍 ProjectService: Fetching my projects from', API_ENDPOINTS.projects.my);
      const response = await apiClient.get(API_ENDPOINTS.projects.my);
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

  async getAllProjects(page = 1, limit = 50) {
    try {
      const queryParams = new URLSearchParams({ page, limit }).toString();
      const url = queryParams 
        ? `${API_ENDPOINTS.projects.list}?${queryParams}` 
        : API_ENDPOINTS.projects.list;
      const response = await apiClient.get(url);
      // API returns { success: true, data: [...] }
      return { 
        success: true, 
        data: response.data || response // Handle both formats
      };
    } catch (error) {
      console.error("ProjectService.getAllProjects error:", error);
      return { success: false, error: error.message };
    }
  }

  async getProjectById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.projects.detail(id));
      // API returns { success: true, data: {...} }
      return { 
        success: true, 
        data: response.data || response // Handle both formats
      };
    } catch (error) {
      console.error("ProjectService.getProjectById error:", error);
      return { success: false, error: error.message };
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
      const response = await apiClient.put(API_ENDPOINTS.projects.update(id), projectData);
      return { success: true, data: response };
    } catch (error) {
      console.error("ProjectService.updateProject error:", error);
      return { success: false, error: error.message };
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
        API_ENDPOINTS.documents.upload(projectId), 
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
        API_ENDPOINTS.documents.delete(projectId, documentId)
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
