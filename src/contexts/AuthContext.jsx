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

  // Load user from localStorage on mount (for instant UI)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedUser = localStorage.getItem("user");
      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to parse cached user:", error);
          localStorage.removeItem("user");
        }
      }
    }
  }, []);

  // Check if user is logged in on mount (verify with backend)
  useEffect(() => {
    checkAuth();
  }, []);

  // Periodic auth check every 5 minutes to catch token expiration
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      console.log("Periodic auth check...");
      checkAuth();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const token = apiClient.getAuthToken();
      if (!token) {
        // No token - clear auth state immediately
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Token exists - verify with backend
      const userData = await apiClient.get(endpoints.users.profile);
      const userObj = userData.user || userData;

      // Cache user data in localStorage for instant load on refresh
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(userObj));
      }

      setUser(userObj);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      // Only log error if token exists (real auth failure)
      if (apiClient.getAuthToken()) {
        // Safely extract error information
        const errorInfo = {
          message: error?.message || "Unknown error",
          status: error?.status,
          data: error?.data,
          isNetworkError: error?.isNetworkError || false,
        };

        console.error("Auth check failed:", errorInfo);

        // Only remove token if it's truly invalid (401 Unauthorized)
        // Don't remove on network errors or other temporary issues
        if (error?.status === 401) {
          console.log("Token invalid (401) - removing token and user cache");
          apiClient.removeAuthToken();
          if (typeof window !== "undefined") {
            localStorage.removeItem("user");
          }
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // Network error or server error - keep token, retry later
          console.log(
            "Temporary error - keeping token and user cache for retry"
          );
          // Keep cached user data visible during network issues
        }
      } else {
        // No token exists - clear cache
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
        }
        setUser(null);
        setIsAuthenticated(false);
      }
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

        // Cache user data for instant load
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(response.user));
        }

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
      // Handle 403 Forbidden - Email not verified or Role not approved
      else if (error.status === 403) {
        // Check for specific error codes
        if (error.data?.code === "EMAIL_NOT_VERIFIED") {
          errorMessage =
            "Email Anda belum diverifikasi. Silakan cek email Anda untuk melakukan verifikasi.";
        } else if (error.data?.code === "ROLE_NOT_APPROVED") {
          errorMessage =
            "Akun Anda belum divalidasi oleh admin. Mohon tunggu hingga admin memvalidasi akun Anda.";
        } else {
          errorMessage =
            error.message || error.data?.message || "Akses ditolak.";
        }
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

      // Clear user cache
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }

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

          // Cache user data
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(result.user));
          }

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
