import apiClient from "@/lib/api-client";
import { endpoints } from "@/lib/api-config";

class GroupService {
  /**
   * Get all groups with pagination and search
   */
  static async getAllGroups(page = 1, limit = 10, options = {}) {
    try {
      const params = {
        page,
        limit,
        ...options,
      };

      const response = await apiClient.get(endpoints.groups.base, { params });

      return {
        success: true,
        data: response.data || [],
        pagination: response.pagination,
        message: response.message,
      };
    } catch (error) {
      console.error("❌ getAllGroups error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Gagal mengambil data grup",
        data: [],
      };
    }
  }

  /**
   * Get user's groups
   * Backend returns a single group object, we convert it to array for consistency
   */
  static async getUserGroups(page = 1, limit = 10) {
    try {
      const response = await apiClient.get(endpoints.groups.my, {
        params: { page, limit },
      });

      // Backend returns single group object, convert to array for consistency
      const groupData = response.data;
      const groups = groupData ? [groupData] : [];

      return {
        success: true,
        data: groups,
      };
    } catch (error) {
      // 404 is expected when user has no group - not an error
      if (error.response?.status === 404) {
        console.log("ℹ️ getUserGroups: User belum memiliki grup (404 - expected)");
        return {
          success: true,
          data: [],
          message: "Anda belum memiliki grup",
        };
      }
      
      // Other errors are actual errors
      console.error("❌ getUserGroups error:");
      console.error("- Message:", error?.message || "No message");
      console.error("- Response:", error?.response?.data || "No response data");
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Gagal mengambil data grup",
        data: [],
      };
    }
  }

  /**
   * Get group detail by ID
   */
  static async getGroupDetail(groupId) {
    try {
      if (!groupId) throw new Error("Group ID tidak valid");

      const response = await apiClient.get(endpoints.groups.detail(groupId));
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      console.error("❌ getGroupDetail error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Gagal mengambil detail grup",
      };
    }
  }

  /**
   * Create a new group with optional email-based invitations
   */
  static async createGroup(groupData) {
    try {
      const {
        name,
        description,
        inviteEmails = [],
        ...rest
      } = groupData;

      // Validation
      if (!name || name.trim().length === 0) {
        throw new Error("Nama grup harus diisi");
      }

      if (name.trim().length < 3) {
        throw new Error("Nama grup minimal 3 karakter");
      }

      if (name.trim().length > 100) {
        throw new Error("Nama grup tidak boleh lebih dari 100 karakter");
      }

      if (description && description.length > 500) {
        throw new Error("Deskripsi tidak boleh lebih dari 500 karakter");
      }

      const payload = {
        name: name.trim(),
        description: description?.trim() || "",
        inviteEmails: Array.isArray(inviteEmails) ? inviteEmails : [],
        ...rest,
      };

      console.log("📤 Creating group with payload:", payload);

      const response = await apiClient.post(endpoints.groups.base, payload);

      console.log("✅ Group created successfully:", response);

      return {
        success: true,
        data: response.data || response,
        message: response.message || "Grup berhasil dibuat",
      };
    } catch (error) {
      // Properly log error with explicit properties
      console.error("❌ createGroup error:");
      console.error("- Message:", error?.message || "No message");
      console.error("- Status:", error?.status || "No status");
      console.error("- Data:", error?.data || "No data");
      console.error("- Network Error:", !error?.status ? "Yes" : "No");

      return {
        success: false,
        error: error.message || error.data?.message || "Gagal membuat grup",
      };
    }
  }

  /**
   * Update group
   */
  static async updateGroup(groupId, groupData) {
    try {
      if (!groupId) throw new Error("Group ID tidak valid");

      const payload = {
        ...groupData,
      };

      const response = await apiClient.put(
        endpoints.groups.update(groupId),
        payload
      );
      return {
        success: true,
        data: response.data || response,
        message: response.message || "Grup berhasil diupdate",
      };
    } catch (error) {
      console.error("❌ updateGroup error:");
      console.error("- Message:", error?.message || "No message");
      console.error("- Response:", error?.response?.data || "No response data");
      if (error.response?.status === 403) {
        return {
          success: false,
          error: "Hanya owner yang bisa mengupdate grup",
        };
      }
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Gagal mengupdate grup",
      };
    }
  }

  /**
   * Delete group
   */
  static async deleteGroup(groupId) {
    try {
      if (!groupId) throw new Error("Group ID tidak valid");

      const response = await apiClient.delete(endpoints.groups.delete(groupId));
      return {
        success: true,
        message: response.message || "Grup berhasil dihapus",
      };
    } catch (error) {
      console.error("❌ deleteGroup error:");
      console.error("- Message:", error?.message || "No message");
      console.error("- Response:", error?.response?.data || "No response data");
      if (error.response?.status === 403) {
        return {
          success: false,
          error: "Hanya owner yang bisa menghapus grup",
        };
      }
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Gagal menghapus grup",
      };
    }
  }

  /**
   * Get available users for invitation (exclude group members)
   */
  static async getAvailableUsers(groupId) {
    try {
      if (!groupId) throw new Error("Group ID tidak valid");

      const response = await apiClient.get(
        `${endpoints.groups.detail(groupId)}/available-users`
      );
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error("❌ getAvailableUsers error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Gagal mengambil data pengguna",
        data: [],
      };
    }
  }

  /**
   * Invite member to group
   */
  static async inviteMember(groupId, userId) {
    try {
      if (!groupId || !userId)
        throw new Error("Group ID dan User ID harus valid");

      const response = await apiClient.post(
        `${endpoints.groups.detail(groupId)}/invite`,
        {
          userId,
        }
      );
      return {
        success: true,
        data: response.data || response,
        message: response.message || "Undangan berhasil dikirim",
      };
    } catch (error) {
      console.error("❌ inviteMember error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Gagal mengirim undangan",
      };
    }
  }

  /**
   * Remove member from group
   */
  static async removeMember(groupId, userId) {
    try {
      if (!groupId || !userId)
        throw new Error("Group ID dan User ID harus valid");

      const response = await apiClient.post(
        `${endpoints.groups.detail(groupId)}/remove-member`,
        {
          userId,
        }
      );
      return {
        success: true,
        message: response.message || "Anggota berhasil dihapus",
      };
    } catch (error) {
      console.error("❌ removeMember error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Gagal menghapus anggota",
      };
    }
  }

  /**
   * Respond to invitation
   */
  static async respondInvitation(groupId, response) {
    try {
      if (!groupId) throw new Error("Group ID tidak valid");

      const result = await apiClient.post(
        `${endpoints.groups.detail(groupId)}/respond-invitation`,
        {
          response,
        }
      );
      return {
        success: true,
        message: result.message || `Undangan ${response}`,
      };
    } catch (error) {
      console.error("❌ respondInvitation error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Gagal merespons undangan",
      };
    }
  }

  /**
   * Request to join group
   */
  static async requestJoin(groupId) {
    try {
      if (!groupId) throw new Error("Group ID tidak valid");

      const response = await apiClient.post(
        `${endpoints.groups.detail(groupId)}/request-join`
      );
      return {
        success: true,
        message: response.message || "Permintaan bergabung berhasil dikirim",
      };
    } catch (error) {
      console.error("❌ requestJoin error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Gagal mengirim permintaan bergabung",
      };
    }
  }

  /**
   * Respond to join request (Owner only)
   */
  static async respondJoinRequest(groupId, userId, response) {
    try {
      if (!groupId || !userId)
        throw new Error("Group ID dan User ID harus valid");

      const result = await apiClient.post(
        `${endpoints.groups.detail(groupId)}/respond-join-request`,
        { userId, response }
      );
      return {
        success: true,
        message: result.message || `Permintaan bergabung ${response}`,
      };
    } catch (error) {
      console.error("❌ respondJoinRequest error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Gagal merespons permintaan bergabung",
      };
    }
  }

  /**
   * Leave group
   */
  static async leaveGroup(groupId) {
    try {
      if (!groupId) throw new Error("Group ID tidak valid");

      const response = await apiClient.post(
        `${endpoints.groups.detail(groupId)}/leave`
      );
      return {
        success: true,
        message: response.message || "Berhasil keluar dari grup",
      };
    } catch (error) {
      console.error("❌ leaveGroup error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Gagal keluar dari grup",
      };
    }
  }

  /**
   * Format group data for display (helper method)
   */
  static formatGroupForDisplay(group) {
    if (!group) return null;

    return {
      _id: group._id,
      id: group._id,
      name: group.name || "",
      description: group.description || "",
      owner: group.owner,
      members: Array.isArray(group.members) ? group.members : [],
      memberCount: Array.isArray(group.members) ? group.members.length : 0,
      projects: Array.isArray(group.projects) ? group.projects : [],
      projectCount: Array.isArray(group.projects) ? group.projects.length : 0,
      maxMembers: group.maxMembers || 5,
      status: group.status || "active",
      isActive: group.isActive !== false,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      capstone: group.capstone,
    };
  }

  /**
   * Check if user is group owner
   */
  static isGroupOwner(group, userId) {
    if (!group || !userId) return false;
    return (group.owner?._id || group.owner) === userId;
  }

  /**
   * Check if user is group member
   */
  static isGroupMember(group, userId) {
    if (!group || !userId || !group.members) return false;
    return group.members.some((member) => (member._id || member) === userId);
  }

  /**
   * Handle API errors (legacy compatibility)
   */
  static handleError(error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Terjadi kesalahan";
    const errorData = error.response?.data?.errors || null;

    return {
      message: errorMessage,
      errors: errorData,
      status: error.response?.status,
    };
  }
}

export default GroupService;
