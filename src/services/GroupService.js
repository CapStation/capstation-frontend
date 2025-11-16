import apiClient from '@/lib/api-client';

class GroupService {
  /**
   * Get all groups with pagination
   */
  static async getAllGroups(page = 1, limit = 10, status = 'active') {
    try {
      const response = await apiClient.get('/groups', {
        params: { page, limit, status }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's groups
   */
  static async getUserGroups(page = 1, limit = 10) {
    try {
      const response = await apiClient.get('/groups/my', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get group detail by ID
   */
  static async getGroupDetail(groupId) {
    try {
      const response = await apiClient.get(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new group
   */
  static async createGroup(groupData) {
    try {
      const response = await apiClient.post('/groups', groupData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update group
   */
  static async updateGroup(groupId, groupData) {
    try {
      const response = await apiClient.put(`/groups/${groupId}`, groupData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete group
   */
  static async deleteGroup(groupId) {
    try {
      const response = await apiClient.delete(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Invite member to group
   */
  static async inviteMember(groupId, userId) {
    try {
      const response = await apiClient.post(`/groups/${groupId}/invite`, {
        userId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Respond to invitation
   */
  static async respondInvitation(groupId, response) {
    try {
      const result = await apiClient.post(`/groups/${groupId}/respond-invitation`, {
        response
      });
      return result.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Request to join group
   */
  static async requestJoin(groupId) {
    try {
      const response = await apiClient.post(`/groups/${groupId}/request-join`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Respond to join request (Owner only)
   */
  static async respondJoinRequest(groupId, userId, response) {
    try {
      const result = await apiClient.post(
        `/groups/${groupId}/respond-join-request`,
        { userId, response }
      );
      return result.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove member from group
   */
  static async removeMember(groupId, userId) {
    try {
      const response = await apiClient.post(`/groups/${groupId}/remove-member`, {
        userId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Leave group
   */
  static async leaveGroup(groupId) {
    try {
      const response = await apiClient.post(`/groups/${groupId}/leave`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  static handleError(error) {
    const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan';
    const errorData = error.response?.data?.errors || null;

    return {
      message: errorMessage,
      errors: errorData,
      status: error.response?.status
    };
  }
}

export default GroupService;
