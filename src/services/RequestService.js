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

async getRequestDetail(id) {
    try {
      const res = await api.get(apiConfig.requests.detail(id));
      // sesuaikan dengan shape respons backend-mu
      const data = res.data?.data || res.data?.request || res.data;
      return { success: true, data };
    } catch (error) {
      console.error("RequestService.getRequestDetail error:", error);
      return { success: false, error };
    }
  }

  async decideRequest(id, payload) {
    try {
      const res = await api.post(
        apiConfig.requests.decide(id),
        payload
      );
      const data = res.data?.data || res.data;
      return { success: true, data };
    } catch (error) {
      console.error("RequestService.decideRequest error:", error);
      return { success: false, error };
    }
  }

// riwayat satu request
async getRequestHistory(id) {
  try {
    const response = await apiClient.get(API_ENDPOINTS.requests.history(id));
    const raw = response.data || response;

    const history =
      raw.history ||
      raw.data?.history ||
      raw.events ||
      raw.data ||
      [];

    return {
      success: true,
      data: Array.isArray(history) ? history : [],
    };
  } catch (error) {
    console.error("RequestService.getRequestHistory error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Gagal mengambil riwayat pengajuan capstone",
    };
  }
}

// detail satu request
async getRequestById(id) {
  try {
    const response = await apiClient.get(API_ENDPOINTS.requests.detail(id));
    const raw = response.data || response;

    const data = raw.data || raw;

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("RequestService.getRequestById error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Gagal mengambil detail pengajuan capstone",
    };
  }
}

// riwayat keputusan yang pernah user buat
async getMyDecisionHistory() {
  try {
    const response = await apiClient.get(API_ENDPOINTS.decisions.myHistory);
    const payload = response.data || response;

    // backend kemungkinan besar kirim { count, data: [...] }
    let items = [];

    if (Array.isArray(payload)) {
      items = payload;
    } else if (Array.isArray(payload.data)) {
      items = payload.data;
    } else if (Array.isArray(payload.history)) {
      items = payload.history;
    } else if (Array.isArray(payload.items)) {
      items = payload.items;
    }

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("RequestService.getMyDecisionHistory error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Gagal mengambil riwayat keputusan",
    };
  }
}

// ambil daftar request yang harus diputuskan oleh user (owner / dosen)
async getOwnerInbox() {
  try {
    const response = await apiClient.get(
      API_ENDPOINTS.decisions.ownerInbox
    );

    // backend baliknya { count, data: [...] }
    const data = response.data?.data || response.data || response;

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("RequestService.getOwnerInbox error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Gagal mengambil daftar pengajuan untuk diputuskan",
    };
  }
}
  // ubah keputusan (owner / dosen)
  async decideRequest(id, payload) {
    try {
      const response = await apiClient.post(
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
          "Gagal mengubah keputusan request capstone",
      };
    }
  }

}

const requestService = new RequestService();
export default requestService;
