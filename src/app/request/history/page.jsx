"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";  

import RequestService from "@/services/RequestService";
import ProjectService from "@/services/ProjectService";

const getThemeLabel = (tema) => {
  const themeMap = {
    kesehatan: "Kesehatan",
    pengelolaan_sampah: "Pengelolaan Sampah",
    smart_city: "Smart City",
    "smart-city": "Smart City",
    transportasi_ramah_lingkungan: "Transportasi Ramah Lingkungan",
    iot: "IoT",
    ai: "Artificial Intelligence",
    mobile: "Mobile Development",
  };

  if (!tema) return "Lainnya";
  const key = String(tema).toLowerCase();
  return themeMap[key] || tema.charAt(0).toUpperCase() + tema.slice(1);
};

const inferStatusFromReason = (reason) => {
  if (!reason) return null;
  const text = reason.toLowerCase();

  // Cancel
  if (text.includes("cancel")) {
    return "cancelled";
  }

  // Rejected
  if (
    text.includes("belum memenuhi") ||
    text.includes("belum lengkap") ||
    text.includes("tidak lengkap") ||
    text.includes("tidak fokus") ||
    text.includes("ditolak") ||
    text.includes("tolak")
  ) {
    return "rejected";
  }

  // Accepted
  if (
    text.includes("sudah lengkap") ||
    text.includes("memenuhi syarat") ||
    text.includes("disetujui") ||
    text.includes("disetujui") ||
    text.includes("approved")
  ) {
    return "accepted";
  }

  return null;
};

const getStatusLabel = (status) => {
  if (!status) return "Menunggu";
  const lower = status.toLowerCase();

  if (lower === "accepted") return "Diterima";
  if (lower === "rejected") return "Ditolak";
  if (lower === "cancelled" || lower === "canceled") return "Dibatalkan";

  return "Menunggu";
};

const getStatusClass = (status) => {
  const lower = (status || "").toLowerCase();

  if (lower === "accepted") {
    return "bg-[#C4F58C] text-neutral-900"; // hijau
  }
  if (lower === "rejected") {
    return "bg-[#FECACA] text-red-700"; // merah muda
  }
  if (lower === "cancelled" || lower === "canceled") {
    return "bg-neutral-800 text-white"; // hitam
  }
  return "bg-neutral-200 text-neutral-800"; // abu pending
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function RequestHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestId = searchParams.get("requestId");
  const capstoneId = searchParams.get("capstoneId");

  const initialInfo = {
    capstoneTitle: searchParams.get("title") || "Judul capstone",
    groupName: searchParams.get("group") || "-",
    tahunPengajuan: searchParams.get("year") || "-",
    latestStatus: searchParams.get("status") || "Pending",
    tema: null,
  };

  const [loading, setLoading] = useState(true);
  const [requestInfo, setRequestInfo] = useState(initialInfo);
  const [history, setHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");


    useEffect(() => {
    if (!requestId) {
      setLoading(false);
      setErrorMessage("ID pengajuan tidak ditemukan.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        // ambil histori keputusan
        const historyRes = await RequestService.getRequestHistory(requestId);

        let historyList = [];
        if (historyRes.success && Array.isArray(historyRes.data)) {
          historyList = [...historyRes.data];
        }

        // urutkan terbaru dulu
        historyList.sort((a, b) => {
          const da = new Date(a.decidedAt || a.createdAt || 0).getTime();
          const db = new Date(b.decidedAt || b.createdAt || 0).getTime();
          return db - da;
        });

        setHistory(historyList);

        // mulai dari info awal yang dikirim via URL
        let updatedInfo = { ...initialInfo };

        // update status terakhir dari histori jika ada
        if (historyList.length > 0) {
          const latest = historyList[0];
          updatedInfo.latestStatus =
            latest.status ||
            latest.decisionStatus ||
            updatedInfo.latestStatus;
        }

        // kalau ada capstoneId, ambil tema + academicYear dari project
        if (capstoneId) {
          try {
            const projRes = await ProjectService.getProjectById(capstoneId);
            if (projRes.success && projRes.data) {
              const p = projRes.data;

              if (
                !updatedInfo.capstoneTitle ||
                updatedInfo.capstoneTitle === "Judul capstone"
              ) {
                updatedInfo.capstoneTitle =
                  p.title || p.judul || updatedInfo.capstoneTitle;
              }

              updatedInfo.tema = p.tema || updatedInfo.tema;

              if (
                !updatedInfo.tahunPengajuan ||
                updatedInfo.tahunPengajuan === "-"
              ) {
                updatedInfo.tahunPengajuan =
                  p.academicYear || updatedInfo.tahunPengajuan;
              }
            }
          } catch (err) {
            console.error("Failed to fetch project in history page:", err);
          }
        }

        setRequestInfo(updatedInfo);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load request history:", err);
        setErrorMessage("Terjadi kesalahan saat memuat riwayat.");
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, capstoneId]);


  const themeLabel = getThemeLabel(requestInfo?.tema);
  const latestStatusLabel = getStatusLabel(requestInfo?.latestStatus);
  const latestStatusClass = getStatusClass(requestInfo?.latestStatus);

  return (
    <div className="min-h-screen bg-[#EEF3F7]">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8"></div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mb-4"
            >
              <Link href="/request?tab=my-request">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Link>
            </Button>

          <h1 className="mb-1 text-3xl font-bold text-neutral-900">
            Riwayat Pengajuan
          </h1>
          <p className="mb-6 text-neutral-600">
            Lihat riwayat pengajuan melanjutkan proyek capstone.
          </p>

          <Card className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <CardContent className="px-8 py-8">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
                </div>
              ) : errorMessage ? (
                <div className="py-10 text-center text-sm text-red-600">
                  {errorMessage}
                </div>
              ) : !requestInfo ? (
                <div className="py-10 text-center text-sm text-neutral-600">
                  Data pengajuan tidak ditemukan.
                </div>
              ) : (
                <>
                  {/* header info capstone */}
                  <div className="mb-8">
                    <h2 className="mb-3 text-2xl font-semibold text-neutral-900">
                      {requestInfo.capstoneTitle}
                    </h2>

                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      {themeLabel && (
                        <Badge
                          variant="outline"
                          className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-800"
                        >
                          {themeLabel}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-5 text-sm text-neutral-700">
                      <p>
                        <span className="font-semibold text-neutral-900">
                          Nama Grup{" "}
                        </span>
                        <br />
                        {requestInfo.groupName}
                      </p>
                      <p>
                        <span className="font-semibold text-neutral-900">
                          Tahun Pengajuan{" "}
                        </span>
                        <br />
                        {requestInfo.tahunPengajuan}
                      </p>
                      <p>
                        <span className="font-semibold text-neutral-900">
                          Status Terakhir{" "}
                        </span>
                        <br />
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ${latestStatusClass}`}
                        >
                          {latestStatusLabel}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* tabel histori */}
                <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-neutral-800">
                    Riwayat Pengajuan{" "}
                    <span className="font-normal text-neutral-600">
                    (Urut berdasarkan yang terbaru)
                    </span>
                </p>

                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    {/* header */}
                    <div className="grid grid-cols-12 gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold text-neutral-600">
                      <div className="col-span-8">Alasan</div>
                      <div className="col-span-4">Status</div>
                    </div>


                    {history.length === 0 ? (
                    <div className="px-5 py-6 text-center text-sm text-neutral-500">
                        Belum ada riwayat keputusan untuk pengajuan ini.
                    </div>
                    ) : (
                    <div className="divide-y divide-neutral-100">
                        {history.map((item, idx) => {
                          const reasonStatus = inferStatusFromReason(item.reason);

                          const rowStatus =
                            item.status ||
                            item.decisionStatus ||
                            reasonStatus ||
                            requestInfo?.latestStatus;

                          return (
                            <div
                              key={item.id || item._id || idx}
                              className="grid grid-cols-12 items-center gap-3 border-b border-neutral-100 px-4 py-3 text-sm"
                            >
                              {/* ALASAN */}
                              <div className="col-span-8 text-neutral-700">
                                {item.reason || "-"}
                              </div>

                              {/* STATUS */}
                              <div className="col-span-4">
                                <span
                                  className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ${getStatusClass(
                                    rowStatus
                                  )}`}
                                >
                                  {getStatusLabel(rowStatus)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    )}
                </div>
                </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
