import { apiConfig } from './api-config';

class ApiClient {
  constructor() {
    this.baseURL = apiConfig.baseURL;
    this.timeout = apiConfig.timeout;
  }

  // Get auth token from localStorage
  getAuthToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  // Set auth token
  setAuthToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  // Remove auth token
  removeAuthToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }

  // Build headers
  buildHeaders(customHeaders = {}) {
    const headers = {
      ...apiConfig.headers,
      ...customHeaders,
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Handle response
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const error = {
        status: response.status,
        message: data.message || data.error || 'An error occurred',
        data: data,
      };

      // Handle unauthorized - hanya remove token, tidak auto redirect
      if (response.status === 401) {
        this.removeAuthToken();
      }

      throw error;
    }

    return data;
  }

  // GET request
  async get(endpoint, options = {}) {
    const fullUrl = `${this.baseURL}${endpoint}`;
    
    console.log('🔵 GET Request:', {
      endpoint,
      fullUrl,
      hasToken: !!this.getAuthToken(),
    });

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: this.buildHeaders(options.headers),
        signal: options.signal,
      });

      console.log('🟢 GET Response:', {
        endpoint,
        status: response.status,
        ok: response.ok,
      });

      const result = await this.handleResponse(response);
      console.log('✅ GET Success:', {
        endpoint,
        dataType: typeof result,
        isArray: Array.isArray(result),
        hasData: !!result?.data,
      });
      
      return result;
    } catch (error) {
      // Check if it's a fetch error (network error, CORS, etc)
      if (!error || error.message === 'Failed to fetch' || error.name === 'TypeError') {
        console.error('🔴 Network/CORS Error:', {
          endpoint,
          fullUrl,
          errorName: error?.name,
          errorMessage: error?.message,
          backendRunning: 'Check if backend is running on localhost:5000',
        });
        throw {
          status: 0,
          message: 'Tidak dapat terhubung ke server. Pastikan backend berjalan di localhost:5000',
          data: null,
          originalError: error
        };
      }
      
      console.error('🔴 GET Error:', {
        endpoint,
        fullUrl,
        status: error.status,
        message: error.message,
        errorType: typeof error,
        errorKeys: Object.keys(error || {}),
        fullError: error
      });
      
      throw error;
    }
  }

  // POST request
  async post(endpoint, data = {}, options = {}) {
    try {
      const isFormData = data instanceof FormData;
      const headers = this.buildHeaders(options.headers);

      // Remove Content-Type for FormData (browser will set it with boundary)
      if (isFormData) {
        delete headers['Content-Type'];
      }

      console.log('Making POST request to:', `${this.baseURL}${endpoint}`);
      console.log('Request data:', data);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: isFormData ? data : JSON.stringify(data),
        signal: options.signal,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      return await this.handleResponse(response);
    } catch (error) {
      // Check if it's a fetch error (network error, CORS, etc)
      if (error.message === 'Failed to fetch' || !error.status) {
        console.error('Network error or CORS issue:', {
          message: error.message,
          endpoint: endpoint,
          fullUrl: `${this.baseURL}${endpoint}`,
        });
        throw {
          status: 0,
          message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda atau coba lagi nanti.',
          data: null,
          originalError: error
        };
      }
      
      console.error('POST request error:', {
        message: error.message,
        status: error.status,
        endpoint: endpoint,
        fullUrl: `${this.baseURL}${endpoint}`,
        error: error
      });
      throw error;
    }
  }

  // PUT request
  async put(endpoint, data = {}, options = {}) {
    try {
      const isFormData = data instanceof FormData;
      const headers = this.buildHeaders(options.headers);

      if (isFormData) {
        delete headers['Content-Type'];
      }

      const fullUrl = `${this.baseURL}${endpoint}`;
      
      console.log('🟡 PUT Request:', {
        endpoint,
        fullUrl,
        hasToken: !!this.getAuthToken(),
        headers: { ...headers, Authorization: headers.Authorization ? '***REDACTED***' : 'MISSING' },
        dataKeys: Object.keys(data),
      });
      console.log('🟡 PUT Request body:', data);

      let bodyToSend;
      try {
        bodyToSend = isFormData ? data : JSON.stringify(data);
      } catch (stringifyError) {
        console.error('❌ JSON.stringify error:', stringifyError);
        throw new Error(`Cannot serialize request body: ${stringifyError.message}`);
      }

      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers,
        body: bodyToSend,
        signal: options.signal,
      });

      console.log('🟢 PUT Response:', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      const result = await this.handleResponse(response);
      console.log('✅ PUT Success:', result);
      return result;
    } catch (error) {
      // Check if it's a fetch error (network error, CORS, etc)
      if (error.message === 'Failed to fetch' || !error.status) {
        console.error('🔴 PUT Network/CORS Error:', {
          message: error.message,
          name: error.name,
          endpoint: endpoint,
          fullUrl: `${this.baseURL}${endpoint}`,
          stack: error.stack,
        });
        throw {
          status: 0,
          message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda atau coba lagi nanti.',
          data: null,
          originalError: error
        };
      }
      
      // Log error with all properties
      console.error('🔴 PUT request error:', {
        message: error.message || 'Unknown error',
        status: error.status || 'No status',
        endpoint: endpoint,
        fullUrl: `${this.baseURL}${endpoint}`,
        data: error.data,
        stack: error.stack,
      });
      console.error('🔴 Full error object:', error);
      throw error;
    }
  }

  // PATCH request
  async patch(endpoint, data = {}, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: this.buildHeaders(options.headers),
        body: JSON.stringify(data),
        signal: options.signal,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('PATCH request error:', error);
      throw error;
    }
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.buildHeaders(options.headers),
        signal: options.signal,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('DELETE request error:', error);
      throw error;
    }
  }

  // Download file
  async downloadFile(endpoint, filename) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export { apiClient };
export default apiClient;
