/**
 * OAuth Service
 * Handles Google OAuth authentication flow
 */

import apiClient from "@/lib/api-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class OAuthService {
  /**
   * Initiate Google OAuth login
   * Redirects user to backend Google OAuth endpoint
   */
  static initiateGoogleLogin() {
    // Redirect ke backend Google OAuth endpoint
    const googleAuthUrl = `${API_BASE_URL}/auth/google`;
    window.location.href = googleAuthUrl;
  }

  /**
   * Complete OAuth profile setup (role selection)
   * @param {string} setupToken - Token dari Google OAuth callback
   * @param {string} role - Selected role (mahasiswa/dosen)
   * @returns {Promise<Object>} - { success, accessToken, user, message }
   */
  static async completeProfile(setupToken, role) {
    try {
      const response = await apiClient.post("/oauth/complete", {
        token: setupToken,
        role: role,
      });

      // Backend returns { accessToken, user } on success
      // or { message } jika pending approval
      return {
        success: true,
        accessToken: response.accessToken,
        user: response.user,
        message: response.message,
        isPending: !response.accessToken, // true jika pending approval
      };
    } catch (error) {
      console.error("Complete profile error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Gagal menyelesaikan setup profil.",
      };
    }
  }

  /**
   * Parse setup token from URL query params
   * @param {URLSearchParams} searchParams - URL search params
   * @returns {string|null} - Setup token or null
   */
  static getSetupTokenFromURL(searchParams) {
    return searchParams.get("token");
  }

  /**
   * Check if URL contains OAuth setup token
   * @param {URLSearchParams} searchParams - URL search params
   * @returns {boolean}
   */
  static hasSetupToken(searchParams) {
    return !!this.getSetupTokenFromURL(searchParams);
  }

  /**
   * Verify setup token validity
   * @param {string} token - Setup token
   * @returns {boolean}
   */
  static isValidSetupToken(token) {
    if (!token || typeof token !== "string") return false;
    // Basic validation: JWT format (3 parts separated by dots)
    const parts = token.split(".");
    return parts.length === 3;
  }
}

export default OAuthService;
