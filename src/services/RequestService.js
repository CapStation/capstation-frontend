import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-config";

class RequestService {
  // daftar request milik user
  async getMyRequests() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.requests.my, {
        params: { embed: "capstone" },
      });

      const raw = response.data || response;
      const list = Array.isArray(raw) ? raw : raw.data || [];

      return {
        success: true,
        data: list,
      };
    } catch (error) {
      console.error("RequestService.getMyRequests error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Gagal mengambil data request pengguna",
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
      await apiClient.delete(API_ENDPOINTS.requests.cancel(id));
      return { success: true };
    } catch (error) {
      console.error("RequestService.cancelRequest error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Gagal membatalkan request capstone",
      };
    }
  }

  // inbox pemilik project
  async getOwnerInbox() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.decisions.ownerInbox, {
        params: { embed: "request,capstone" }, // kalau backendmu support
      });

      const raw = response.data || response;
      const list = Array.isArray(raw) ? raw : raw.data || [];

      return {
        success: true,
        data: list,
      };
    } catch (error) {
      console.error("RequestService.getOwnerInbox error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Gagal mengambil inbox keputusan pemilik project",
      };
    }
  }

  // daftar keputusan user ini
  async getMyDecisions() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.decisions.my);
      const raw = response.data || response;
      const list = Array.isArray(raw) ? raw : raw.data || [];

      return {
        success: true,
        data: list,
      };
    } catch (error) {
      console.error("RequestService.getMyDecisions error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Gagal mengambil data keputusan pengguna",
      };
    }
  }

  // riwayat keputusan user
  async getMyDecisionHistory() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.decisions.myHistory);
      const raw = response.data || response;
      const list = Array.isArray(raw) ? raw : raw.data || [];

      return {
        success: true,
        data: list,
      };
    } catch (error) {
      console.error("RequestService.getMyDecisionHistory error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Gagal mengambil riwayat keputusan pengguna",
      };
    }
  }

  // owner approve atau reject request
  async decideRequest(id, decision, reason) {
    try {
      const payload = { decision }; // "accept" atau "reject"
      if (reason) payload.reason = reason;

      const response = await apiClient.patch(
        API_ENDPOINTS.requests.decide(id),
        payload
      );

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      console.error("RequestService.decideRequest error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Gagal memproses keputusan request capstone",
      };
    }
  }
}

const requestService = new RequestService();
export default requestService;
