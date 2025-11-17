import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-config";

const GroupService = {
  async getMyGroup() {
    try {
      const url =
        API_ENDPOINTS?.groups?.my || "/groups/my";

      const res = await apiClient.get(url);

      const data = res.data?.data || res.data;

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("GroupService.getMyGroup error:", error);
      return {
        success: false,
        error,
      };
    }
  },
};

export default GroupService;