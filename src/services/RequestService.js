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

    const data = error.response?.data;
    // log supaya kelihatan di console browser juga
    console.log("createRequest backend error data:", data);

    let message = "Gagal membuat request capstone";

    if (data?.error) {
      message = data.error;
    } else if (data?.message) {
      message = data.message;
    } else if (typeof data === "string") {
      message = data;
    } else if (data) {
      // kalau backend kirim object lain (misalnya { errors: [...] })
      try {
        message = JSON.stringify(data);
      } catch {
        // biarkan default
      }
    }

    return {
      success: false,
      error: message,
    };
  }
}


// batalkan request
async cancelRequest(id) {
  try {
    const res = await apiClient.delete(API_ENDPOINTS.requests.cancel(id));
    // kalau berhasil, kirim data balik
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("RequestService.cancelRequest error:", error);

    // LOG semua isi respon supaya kelihatan di console browser
    console.log("cancelRequest response:", error?.response?.data);

    const msg =
      error?.response?.data?.error ||   // backend-mu sering pakai key "error"
      error?.response?.data?.message ||
      error.message ||
      "Gagal membatalkan request capstone";

    return {
      success: false,
      error: msg,
    };
  }
}

  // detail satu request (dipakai di halaman decision / history detail)
  async getRequestDetail(id) {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.requests.detail(id)
      );
      const raw = response.data || response;
      const data = raw.data || raw.request || raw;

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("RequestService.getRequestDetail error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Gagal mengambil detail pengajuan capstone",
      };
    }
  }

  // riwayat satu request
  async getRequestHistory(id) {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.requests.history(id)
      );
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

  // detail satu request (versi umum, sama saja, disatukan dengan getRequestDetail)
  async getRequestById(id) {
    return this.getRequestDetail(id);
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

  // riwayat keputusan user (dipakai di Decision History)
  async getMyDecisionHistory() {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.decisions.myHistory
      );
      const payload = response.data || response;

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

      // backend: { count, data: [...] } atau langsung array
      const raw = response.data || response;
      const data = Array.isArray(raw) ? raw : raw.data || [];

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
async decideRequest(requestId, payload) {
  try {
    const res = await apiClient.patch(
      API_ENDPOINTS.requests.decide(requestId),
      payload
    );

    return {
      success: true,
      data: res.data?.data || res.data,
    };
  } catch (error) {
    const data = error.response?.data;
    console.error("RequestService.decideRequest api error:", data || error.message);

    return {
      success: false,
      error:
        data?.error ||
        data?.message ||
        "Gagal mengubah keputusan request capstone",
    };
  }
}
}

const requestService = new RequestService();
export default requestService;
