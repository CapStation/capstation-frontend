import apiClient from "@/lib/api-client";

class UserService {
  // Cache untuk menyimpan user data agar tidak fetch berulang kali
  static userCache = new Map();

  /**
   * Normalisasi error dari API
   */
  static handleError(error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Terjadi kesalahan";
    const errorData = error?.response?.data?.errors || null;

    return {
      message: errorMessage,
      errors: errorData,
      status: error?.response?.status,
    };
  }

  /**
   * Search user by email
   */
  async searchByEmail(email) {
    try {
      const response = await apiClient.get("/users/search", {
        params: { email },
      });
      return response.data;
    } catch (error) {
      throw UserService.handleError(error);
    }
  }

  /**
   * Get current user (profil user yang sedang login)
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get("/users/me");
      return response.data;
    } catch (error) {
      throw UserService.handleError(error);
    }
  }

  /**
   * Get user by ID (dengan cache)
   */
  async getUserById(userId) {
    try {
      // Check cache first
      if (UserService.userCache.has(userId)) {
        console.log("📦 UserService: Using cached user data for", userId);
        return { success: true, data: UserService.userCache.get(userId) };
      }

      console.log("🔍 UserService: Fetching user by ID:", userId);
      const response = await apiClient.get(`/users/profile/${userId}`);

      // Backend returns { message: '...', user: {...} }
      const userData =
        response.data?.user || response.user || response.data || response;

      // Save to cache
      UserService.userCache.set(userId, userData);

      console.log("✅ UserService: User data fetched:", userData);
      return { success: true, data: userData };
    } catch (error) {
      console.error("❌ UserService.getUserById error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get beberapa user sekaligus berdasarkan array ID
   */
  async getUsersByIds(userIds) {
    try {
      console.log("🔍 UserService: Fetching multiple users:", userIds);

      // Fetch users yang belum ada di cache
      const uncachedIds = userIds.filter(
        (id) => !UserService.userCache.has(id)
      );

      if (uncachedIds.length > 0) {
        // Fetch multiple users at once
        const response = await apiClient.post("/users/batch", {
          userIds: uncachedIds,
        });
        const users = response.data || response;

        // Save to cache
        users.forEach((user) => {
          if (user._id) {
            UserService.userCache.set(user._id, user);
          }
        });
      }

      // Return all users from cache
      const allUsers = userIds
        .map((id) => UserService.userCache.get(id))
        .filter(Boolean);
      console.log("✅ UserService: Users data fetched:", allUsers);

      return { success: true, data: allUsers };
    } catch (error) {
      console.error("❌ UserService.getUsersByIds error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get semua user
   */
  async getAllUsers() {
    try {
      console.log("🔍 UserService: Fetching all users");
      const response = await apiClient.get("/users");

      // Backend returns array of users or { users: [...] }
      const users =
        response.data?.users || response.users || response.data || response;

      // Save to cache
      if (Array.isArray(users)) {
        users.forEach((user) => {
          if (user._id) {
            UserService.userCache.set(user._id, user);
          }
        });
      }

      console.log(
        "✅ UserService: All users fetched:",
        Array.isArray(users) ? users.length : 0,
        "users"
      );
      return { success: true, data: users };
    } catch (error) {
      console.error("❌ UserService.getAllUsers error:", error);
      return { success: false, error: error.message };
    }
  }

  static clearCache() {
    UserService.userCache.clear();
  }
}

const userService = new UserService();
export default userService;
