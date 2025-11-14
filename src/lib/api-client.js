import { apiConfig } from "./api-config";

class ApiClient {
  constructor() {
    this.baseURL = apiConfig.baseURL;
    this.timeout = apiConfig.timeout;
  }

  // Get auth token from localStorage
  getAuthToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  }

  // Set auth token
  setAuthToken(token) {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  }

  // Remove auth token
  removeAuthToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
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
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  // Handle response
  async handleResponse(response) {
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const error = {
        status: response.status,
        message: data.message || data.error || "An error occurred",
        data: data,
      };

      // Handle unauthorized
      if (response.status === 401) {
        this.removeAuthToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      throw error;
    }

    return data;
  }

  // GET request
  async get(endpoint, options = {}) {
    const fullUrl = `${this.baseURL}${endpoint}`;

    if (process.env.NODE_ENV === "development") {
      console.log("🔵 GET Request:", {
        endpoint,
        fullUrl,
        hasToken: !!this.getAuthToken(),
      });
    }

    try {
      const response = await fetch(fullUrl, {
        method: "GET",
        headers: this.buildHeaders(options.headers),
        signal: options.signal,
      });

      if (process.env.NODE_ENV === "development") {
        console.log("🟢 GET Response:", {
          endpoint,
          status: response.status,
          ok: response.ok,
        });
      }

      const result = await this.handleResponse(response);

      if (process.env.NODE_ENV === "development") {
        console.log("✅ GET Success:", {
          endpoint,
          dataType: typeof result,
          isArray: Array.isArray(result),
        });
      }

      return result;
    } catch (error) {
      // Check if it's a network/CORS error
      if (
        !error.status ||
        error.message === "Failed to fetch" ||
        error.name === "TypeError"
      ) {
        const networkError = {
          status: 0,
          message: `Tidak dapat terhubung ke server. Periksa koneksi internet Anda.`,
          data: null,
          isNetworkError: true,
        };

        if (process.env.NODE_ENV === "development") {
          console.warn("🔴 Network/CORS Error:", {
            endpoint,
            fullUrl,
            baseURL: this.baseURL,
            suggestion: "Periksa koneksi internet atau status server",
          });
        }

        throw networkError;
      }

      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ GET Error:", {
          endpoint,
          status: error.status,
          message: error.message,
        });
      }

      throw error;
    }
  }

  // POST request
  async post(endpoint, data = {}, options = {}) {
    const fullUrl = `${this.baseURL}${endpoint}`;

    if (process.env.NODE_ENV === "development") {
      console.log("🔵 POST Request:", {
        endpoint,
        fullUrl,
        hasToken: !!this.getAuthToken(),
        dataType: data instanceof FormData ? "FormData" : "JSON",
      });
    }

    try {
      const isFormData = data instanceof FormData;
      const headers = this.buildHeaders(options.headers);

      // Remove Content-Type for FormData (browser will set it with boundary)
      if (isFormData) {
        delete headers["Content-Type"];
      }

      const response = await fetch(fullUrl, {
        method: "POST",
        headers,
        body: isFormData ? data : JSON.stringify(data),
        signal: options.signal,
      });

      if (process.env.NODE_ENV === "development") {
        console.log("🟢 POST Response:", {
          endpoint,
          status: response.status,
          ok: response.ok,
        });
      }

      const result = await this.handleResponse(response);

      if (process.env.NODE_ENV === "development") {
        console.log("✅ POST Success:", {
          endpoint,
          dataReceived: !!result,
        });
      }

      return result;
    } catch (error) {
      // Check if it's a network/CORS error
      if (
        !error.status ||
        error.message === "Failed to fetch" ||
        error.name === "TypeError"
      ) {
        const networkError = {
          status: 0,
          message: `Tidak dapat terhubung ke server. Periksa koneksi internet Anda.`,
          data: null,
          isNetworkError: true,
        };

        if (process.env.NODE_ENV === "development") {
          console.warn("🔴 Network/CORS Error:", {
            endpoint,
            fullUrl,
            baseURL: this.baseURL,
            suggestion:
              "Periksa koneksi internet atau status server di Vercel",
          });
        }

        throw networkError;
      }

      // API error with status code
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ POST Error:", {
          endpoint,
          status: error.status,
          message: error.message,
        });
      }

      throw error;
    }
  }

  // PUT request
  async put(endpoint, data = {}, options = {}) {
    const fullUrl = `${this.baseURL}${endpoint}`;

    try {
      const isFormData = data instanceof FormData;
      const headers = this.buildHeaders(options.headers);

      if (isFormData) {
        delete headers["Content-Type"];
      }

      const response = await fetch(fullUrl, {
        method: "PUT",
        headers,
        body: isFormData ? data : JSON.stringify(data),
        signal: options.signal,
      });

      return await this.handleResponse(response);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ PUT Error:", {
          endpoint,
          status: error.status,
          message: error.message,
        });
      }
      throw error;
    }
  }

  // PATCH request
  async patch(endpoint, data = {}, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PATCH",
        headers: this.buildHeaders(options.headers),
        body: JSON.stringify(data),
        signal: options.signal,
      });

      return await this.handleResponse(response);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ PATCH Error:", {
          endpoint,
          status: error.status,
          message: error.message,
        });
      }
      throw error;
    }
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "DELETE",
        headers: this.buildHeaders(options.headers),
        signal: options.signal,
      });

      return await this.handleResponse(response);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ DELETE Error:", {
          endpoint,
          status: error.status,
          message: error.message,
        });
      }
      throw error;
    }
  }

  // Download file
  async downloadFile(endpoint, filename) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "GET",
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export { apiClient };
export default apiClient;
