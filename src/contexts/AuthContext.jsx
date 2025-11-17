"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "@/lib/api-client";
import endpoints from "@/lib/api-config";
import OAuthService from "@/services/OAuthService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = apiClient.getAuthToken();
      if (token) {
        const userData = await apiClient.get(endpoints.users.profile);
        setUser(userData.user || userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Only log error if it's not a simple "no token" case
      if (apiClient.getAuthToken()) {
        // Safely extract error information
        const errorInfo = {
          // Direct error properties
          message: error?.message || "Unknown error",
          status: error?.status,
          data: error?.data,

          // Network error flag
          isNetworkError: error?.isNetworkError || false,

          // For standard Error objects
          name: error?.name,
          stack: error?.stack,

          // Check if it's an object
          type: typeof error,

          // Serialize the full error for debugging
          raw: (() => {
            try {
              return JSON.stringify(error);
            } catch {
              return error?.toString() || String(error);
            }
          })(),
        };

        console.error("Auth check failed:", errorInfo);
      }
      apiClient.removeAuthToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log("Attempting login with:", { email });
      console.log("API endpoint:", endpoints.auth.login);
      console.log("Full URL:", `${apiClient.baseURL}${endpoints.auth.login}`);

      const response = await apiClient.post(endpoints.auth.login, {
        email,
        password,
      });

      console.log("Login response:", response);

      // Backend returns { accessToken, user }
      if (response.accessToken) {
        apiClient.setAuthToken(response.accessToken);
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      }

      throw new Error("Login failed - no access token received");
    } catch (error) {
      // Safe error logging with proper serialization
      const errorInfo = {
        message: error?.message || "Unknown error",
        status: error?.status,
        data: error?.data,
        isNetworkError: error?.isNetworkError || false,
        type: typeof error,
        // Safely stringify the full error
        raw: (() => {
          try {
            return JSON.stringify(error);
          } catch {
            return error?.toString() || String(error);
          }
        })(),
      };

      console.error("Login error:", errorInfo);

      let errorMessage = "Login gagal. Silakan coba lagi.";

      // Handle network/CORS errors
      if (error.status === 0) {
        errorMessage =
          error.message ||
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      }
      // Handle 401 Unauthorized
      else if (error.status === 401) {
        errorMessage = "Email atau password salah.";
      }
      // Handle 404 Not Found
      else if (error.status === 404) {
        errorMessage =
          "Endpoint login tidak ditemukan. Periksa konfigurasi API.";
      }
      // Handle 500 Server Error
      else if (error.status >= 500) {
        errorMessage = "Server sedang bermasalah. Silakan coba lagi nanti.";
      }
      // Use custom error message if available
      else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
        details: error,
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.post(endpoints.auth.register, userData);

      // Backend returns success message, not auto-login
      // User needs to verify email first
      return {
        success: true,
        message:
          response.message ||
          "Registrasi berhasil. Silakan cek email untuk verifikasi.",
        requiresVerification: true,
      };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error: error.message || "Registrasi gagal. Silakan coba lagi.",
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post(endpoints.auth.logout);
    } catch (error) {
      // Logout errors are usually non-critical (expired token, no connection, etc.)
      // Only log if it's an unexpected error (not 401/404/network)
      const status = error?.status;
      const isExpectedError =
        status === 401 || // Unauthorized (token expired) - normal
        status === 404 || // Endpoint not found - backend issue but not critical
        error?.isNetworkError; // Network error - normal when offline

      if (!isExpectedError) {
        // Only log truly unexpected errors
        console.warn("Unexpected logout error:");
        console.warn("- Message:", error?.message || "No message");
        console.warn("- Status:", status || "No status");
        console.warn("- Data:", error?.data);
      }
      // For expected errors, silently continue - logout still succeeds locally
    } finally {
      // Always clear local auth state regardless of backend response
      apiClient.removeAuthToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  /**
   * Login with OAuth (Google)
   * Called after role selection in /oauth-setup page
   * @param {string} setupToken - Token from OAuth callback
   * @param {string} role - Selected role (mahasiswa/dosen)
   */
  const loginWithOAuth = async (setupToken, role) => {
    try {
      const result = await OAuthService.completeProfile(setupToken, role);

      if (result.success) {
        if (result.isPending) {
          // Role pending approval - don't login
          return {
            success: true,
            isPending: true,
            message: result.message,
          };
        }

        // Login successful - set token and user
        if (result.accessToken) {
          apiClient.setAuthToken(result.accessToken);
          setUser(result.user);
          setIsAuthenticated(true);
          return {
            success: true,
            isPending: false,
            user: result.user,
          };
        }
      }

      return result;
    } catch (error) {
      console.error("OAuth login error:", error);
      return {
        success: false,
        error: error.message || "Gagal login dengan Google.",
      };
    }
  };

  /**
   * Initiate Google OAuth login
   * Redirects to backend Google OAuth endpoint
   */
  const loginWithGoogle = () => {
    OAuthService.initiateGoogleLogin();
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    loginWithOAuth,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
