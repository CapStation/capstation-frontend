"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import endpoints from '@/lib/api-config';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
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
        const userData = await apiClient.get(endpoints.auth.me);
        setUser(userData.user || userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiClient.removeAuthToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      console.log('API endpoint:', endpoints.auth.login);
      console.log('Full URL:', `${apiClient.baseURL}${endpoints.auth.login}`);
      
      const response = await apiClient.post(endpoints.auth.login, {
        email,
        password,
      });

      console.log('Login response:', response);

      // Backend returns { accessToken, user }
      if (response.accessToken) {
        apiClient.setAuthToken(response.accessToken);
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      }

      throw new Error('Login failed - no access token received');
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        status: error.status,
        data: error.data,
        error: error
      });
      
      let errorMessage = 'Login gagal. Silakan coba lagi.';
      
      // Handle network/CORS errors
      if (error.status === 0) {
        errorMessage = error.message || 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      }
      // Handle 401 Unauthorized
      else if (error.status === 401) {
        errorMessage = 'Email atau password salah.';
      }
      // Handle 404 Not Found
      else if (error.status === 404) {
        errorMessage = 'Endpoint login tidak ditemukan. Periksa konfigurasi API.';
      }
      // Handle 500 Server Error
      else if (error.status >= 500) {
        errorMessage = 'Server sedang bermasalah. Silakan coba lagi nanti.';
      }
      // Use custom error message if available
      else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage,
        details: error 
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
        message: response.message || 'Registrasi berhasil. Silakan cek email untuk verifikasi.',
        requiresVerification: true
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.message || 'Registrasi gagal. Silakan coba lagi.',
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post(endpoints.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.removeAuthToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
