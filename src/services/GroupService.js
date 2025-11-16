/**
 * GroupService - Service layer untuk Group/Capstone Group Management
 * Handles semua API calls terkait group, invitation, dan join requests
 */

import apiClient from '@/lib/api-client';
import endpoints from '@/lib/api-config';

class GroupService {
  /**
   * Get semua group milik user yang logged in
   * @returns {Promise<Array>} Array of groups dengan details
   */
  async getMyGroups() {
    try {
      const response = await apiClient.get(endpoints.groups.my);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching my groups:', error);
      throw error;
    }
  }

  /**
   * Get semua group yang available untuk dijoin
   * @returns {Promise<Array>} Array of available groups
   */
  async getAvailableGroups() {
    try {
      const response = await apiClient.get(`${endpoints.groups.base}/available`);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching available groups:', error);
      throw error;
    }
  }

  /**
   * Get semua groups (admin/dosen purposes)
   * @returns {Promise<Array>} Array of all groups
   */
  async getAllGroups() {
    try {
      const response = await apiClient.get(endpoints.groups.base);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching all groups:', error);
      throw error;
    }
  }

  /**
   * Get detail dari satu group
   * @param {string} groupId - ID group
   * @returns {Promise<Object>} Group details dengan members, invitations, join requests
   */
  async getGroupDetail(groupId) {
    try {
      const response = await apiClient.get(endpoints.groups.detail(groupId));
      return response.data || response;
    } catch (error) {
      console.error('Error fetching group detail:', error);
      throw error;
    }
  }

  /**
   * Create group baru
   * @param {Object} groupData - Data untuk group baru
   * @param {string} groupData.name - Nama group (required, unique)
   * @param {string} groupData.capstoneId - ID capstone/project (required)
   * @param {string} groupData.description - Deskripsi group
   * @param {number} groupData.maxMembers - Jumlah member max (default 4)
   * @param {string} groupData.visibility - 'public' atau 'private' (default 'public')
   * @param {boolean} groupData.autoApproveJoin - Auto approve join requests (default false)
   * @param {Array} groupData.initialMembers - Array of email untuk invite (optional)
   * @returns {Promise<Object>} Created group
   */
  async createGroup(groupData) {
    try {
      // Validation
      if (!groupData.name || !groupData.name.trim()) {
        throw new Error('Nama group harus diisi');
      }
      if (!groupData.capstoneId) {
        throw new Error('Capstone/Project harus dipilih');
      }
      if (groupData.maxMembers && (groupData.maxMembers < 2 || groupData.maxMembers > 4)) {
        throw new Error('Jumlah member harus antara 2-4');
      }

      const response = await apiClient.post(endpoints.groups.create, {
        name: groupData.name.trim(),
        capstoneId: groupData.capstoneId,
        description: groupData.description || '',
        maxMembers: groupData.maxMembers || 4,
        visibility: groupData.visibility || 'public',
        autoApproveJoin: groupData.autoApproveJoin || false,
        initialMembers: groupData.initialMembers || [],
      });

      return response.data || response;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  /**
   * Update group info (leader only)
   * @param {string} groupId - ID group
   * @param {Object} updateData - Data untuk di-update
   * @returns {Promise<Object>} Updated group
   */
  async updateGroup(groupId, updateData) {
    try {
      const response = await apiClient.put(
        endpoints.groups.update(groupId),
        updateData
      );
      return response.data || response;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  /**
   * Disband/delete group (leader only)
   * @param {string} groupId - ID group
   * @returns {Promise<Object>} Success message
   */
  async disbandGroup(groupId) {
    try {
      const response = await apiClient.delete(endpoints.groups.delete(groupId));
      return response.data || response;
    } catch (error) {
      console.error('Error disbanding group:', error);
      throw error;
    }
  }

  /**
   * Invite member ke group berdasarkan email
   * @param {string} groupId - ID group
   * @param {string} email - Email user yang di-invite
   * @returns {Promise<Object>} Invitation data
   */
  async inviteMember(groupId, email) {
    try {
      if (!email || !email.trim()) {
        throw new Error('Email harus diisi');
      }

      const response = await apiClient.post(
        `${endpoints.groups.detail(groupId)}/invite`,
        { email: email.trim().toLowerCase() }
      );
      return response.data || response;
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  }

  /**
   * Invite multiple members ke group
   * @param {string} groupId - ID group
   * @param {Array<string>} emails - Array of emails
   * @returns {Promise<Object>} Invitation results
   */
  async inviteMembers(groupId, emails) {
    try {
      const validEmails = emails.filter(e => e && e.trim()).map(e => e.trim().toLowerCase());
      if (validEmails.length === 0) {
        throw new Error('Minimal 1 email harus diisi');
      }

      const response = await apiClient.post(
        `${endpoints.groups.detail(groupId)}/invite-multiple`,
        { emails: validEmails }
      );
      return response.data || response;
    } catch (error) {
      console.error('Error inviting members:', error);
      throw error;
    }
  }

  /**
   * Cancel invitation yang sudah dikirim
   * @param {string} invitationId - ID invitation
   * @returns {Promise<Object>} Success message
   */
  async cancelInvitation(invitationId) {
    try {
      const response = await apiClient.delete(
        `${endpoints.groups.base}/invitations/${invitationId}`
      );
      return response.data || response;
    } catch (error) {
      console.error('Error canceling invitation:', error);
      throw error;
    }
  }

  /**
   * Accept group invitation
   * @param {string} invitationId - ID invitation
   * @returns {Promise<Object>} Updated group dengan user sebagai member
   */
  async acceptInvitation(invitationId) {
    try {
      const response = await apiClient.post(
        `${endpoints.groups.base}/invitations/${invitationId}/accept`
      );
      return response.data || response;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  /**
   * Reject group invitation
   * @param {string} invitationId - ID invitation
   * @returns {Promise<Object>} Success message
   */
  async rejectInvitation(invitationId) {
    try {
      const response = await apiClient.post(
        `${endpoints.groups.base}/invitations/${invitationId}/reject`
      );
      return response.data || response;
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      throw error;
    }
  }

  /**
   * Request to join group (untuk public groups)
   * @param {string} groupId - ID group
   * @returns {Promise<Object>} Join request
   */
  async requestJoin(groupId) {
    try {
      const response = await apiClient.post(
        `${endpoints.groups.detail(groupId)}/join-request`
      );
      return response.data || response;
    } catch (error) {
      console.error('Error requesting to join:', error);
      throw error;
    }
  }

  /**
   * Handle join request (leader only)
   * @param {string} groupId - ID group
   * @param {string} requestId - ID join request
   * @param {string} action - 'accept' atau 'reject'
   * @returns {Promise<Object>} Updated request
   */
  async handleJoinRequest(groupId, requestId, action) {
    try {
      if (!['accept', 'reject'].includes(action)) {
        throw new Error('Action harus "accept" atau "reject"');
      }

      const response = await apiClient.post(
        `${endpoints.groups.detail(groupId)}/join-requests/${requestId}/handle`,
        { action }
      );
      return response.data || response;
    } catch (error) {
      console.error('Error handling join request:', error);
      throw error;
    }
  }

  /**
   * Leave group
   * @param {string} groupId - ID group
   * @returns {Promise<Object>} Success message
   */
  async leaveGroup(groupId) {
    try {
      const response = await apiClient.post(
        `${endpoints.groups.detail(groupId)}/leave`
      );
      return response.data || response;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }

  /**
   * Remove member dari group (leader only)
   * @param {string} groupId - ID group
   * @param {string} memberId - ID member yang akan di-remove
   * @returns {Promise<Object>} Updated group
   */
  async removeMember(groupId, memberId) {
    try {
      const response = await apiClient.delete(
        `${endpoints.groups.detail(groupId)}/members/${memberId}`
      );
      return response.data || response;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  /**
   * Transfer leadership ke member lain (leader only)
   * @param {string} groupId - ID group
   * @param {string} newLeaderId - ID member yang akan jadi leader
   * @returns {Promise<Object>} Updated group dengan leader baru
   */
  async transferLeadership(groupId, newLeaderId) {
    try {
      const response = await apiClient.post(
        `${endpoints.groups.detail(groupId)}/transfer-leadership`,
        { newLeaderId }
      );
      return response.data || response;
    } catch (error) {
      console.error('Error transferring leadership:', error);
      throw error;
    }
  }

  /**
   * Get members dari group
   * @param {string} groupId - ID group
   * @returns {Promise<Array>} Array of members
   */
  async getGroupMembers(groupId) {
    try {
      const response = await apiClient.get(endpoints.groups.members(groupId));
      return response.data || response;
    } catch (error) {
      console.error('Error fetching group members:', error);
      throw error;
    }
  }

  /**
   * Search users untuk invite ke group
   * @param {string} query - Search query (name, email, nim)
   * @returns {Promise<Array>} Array of matching users
   */
  async searchUsers(query) {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const response = await apiClient.get(
        `${endpoints.users.base}/search?q=${encodeURIComponent(query)}`
      );
      return response.data || response;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Get pending invitations untuk user yang logged in
   * @returns {Promise<Array>} Array of pending invitations
   */
  async getPendingInvitations() {
    try {
      const response = await apiClient.get(
        `${endpoints.groups.base}/invitations/pending`
      );
      return response.data || response;
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const groupService = new GroupService();

export default groupService;
