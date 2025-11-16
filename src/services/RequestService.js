import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-config";

class RequestService {
  // daftar request milik user
  async getMyRequests() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.requests.my);
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      console.error("RequestService.getMyRequests error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Gagal mengambil data request pengguna",
      };
    }
  }

  // membuat request baru (ketika klik Lanjutkan)
  async createRequest(payload) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.requests.create,
        payload
      );
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      console.error("RequestService.createRequest error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Gagal membuat request capstone",
      };
    }
  }

  // batalkan request
  async cancelRequest(id) {
    try {
      await apiClient.post(API_ENDPOINTS.requests.cancel(id));
      return { success: true };
    } catch (error) {
      console.error("RequestService.cancelRequest error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Gagal membatalkan request capstone",
      };
    }
  }
}

const requestService = new RequestService();
export default requestService;
