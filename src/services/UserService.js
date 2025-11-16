import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-config";

class UserService {
  // Cache untuk menyimpan user data agar tidak fetch berulang kali
  static userCache = new Map();

  async getUserById(userId) {
    try {
      // Validate userId
      if (!userId) {
        return { success: false, error: 'User ID is required' };
      }

      // Check cache first
      if (UserService.userCache.has(userId)) {
        console.log('📦 UserService: Using cached user data for', userId);
        return { success: true, data: UserService.userCache.get(userId) };
      }

      // Check if user is logged in (has token)
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ UserService: No token found, skipping user fetch');
        return { success: false, error: 'Not authenticated' };
      }

      console.log('🔍 UserService: Fetching user by ID:', userId);
      const response = await apiClient.get(`/users/profile/${userId}`);
      
      // Backend returns { message: '...', user: {...} }
      const userData = response.data?.user || response.user || response.data || response;
      // Save to cache
      UserService.userCache.set(userId, userData);
      
      console.log('✅ UserService: User data fetched:', userData);
      return { success: true, data: userData };
    } catch (error) {
      console.error('❌ UserService.getUserById error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUsersByIds(userIds) {
    try {
      console.log('🔍 UserService: Fetching multiple users:', userIds);
      
      // Validate userIds
      if (!userIds || userIds.length === 0) {
        return { success: true, data: [] };
      }

      // Check if user is logged in (has token)
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ UserService: No token found, skipping users fetch');
        return { success: false, error: 'Not authenticated' };
      }
      
      // Fetch users yang belum ada di cache
      const uncachedIds = userIds.filter(id => !UserService.userCache.has(id));
      
      if (uncachedIds.length > 0) {
        // Fetch multiple users at once
        const response = await apiClient.post('/users/batch', { userIds: uncachedIds });
        const users = response.data || response;
        
        // Save to cache
        users.forEach(user => {
          UserService.userCache.set(user._id, user);
        });
      }
      
      // Return all users from cache
      const allUsers = userIds.map(id => UserService.userCache.get(id)).filter(Boolean);
      console.log('✅ UserService: Users data fetched:', allUsers);
      
      return { success: true, data: allUsers };
    } catch (error) {
      console.error('❌ UserService.getUsersByIds error:', error);
      return { success: false, error: error.message };
    }
  }

  async getAllUsers() {
    try {
      console.log('🔍 UserService: Fetching all users');
      const response = await apiClient.get('/users');
      
      // Backend returns array of users or { users: [...] }
      const users = response.data?.users || response.users || response.data || response;
      
      // Save to cache
      if (Array.isArray(users)) {
        users.forEach(user => {
          if (user._id) {
            UserService.userCache.set(user._id, user);
          }
        });
      }
      
      console.log('✅ UserService: All users fetched:', users.length, 'users');
      return { success: true, data: users };
    } catch (error) {
      console.error('❌ UserService.getAllUsers error:', error);
      return { success: false, error: error.message };
    }
  }

  static clearCache() {
    UserService.userCache.clear();
  }
}

const userService = new UserService();
export default userService;

