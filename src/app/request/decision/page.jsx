"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";

import RequestService from "@/services/RequestService";

const getThemeLabel = (tema) => {
    const themeMap = {
    kesehatan: "Kesehatan",
    pengelolaansampah: "Pengelolaan Sampah",
    smartcity: "Smart City",
    transportasiramahlingkungan: "Transportasi Ramah Lingkungan",
    iot: "IoT",
    ai: "Artificial Intelligence",
    mobile: "Mobile Development",
  };

  if (!tema) return "Smart City";
  return themeMap[tema] || tema.charAt(0).toUpperCase() + tema.slice(1);
};

const getStatusBadgeClass = (status) => {
  if (status === "accepted") {
    return "bg-[#4ADE80] text-white";
  }
  if (status === "rejected") {
    return "bg-[#FCA5A5] text-white";
  }
  return "bg-neutral-300 text-neutral-800";
};

export default function RequestDecisionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestId = searchParams.get("requestId");
  const action = searchParams.get("action") || "accepted"; // "accepted" | "rejected"

  // data fallback dari query string
  const titleFromQuery = searchParams.get("title");
  const groupFromQuery = searchParams.get("groupName");
  const tahunFromQuery = searchParams.get("tahun");
  const temaFromQuery = searchParams.get("tema");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // pisah error load dan error submit
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [requestDetail, setRequestDetail] = useState(null);
  const [reason, setReason] = useState("");

  const targetStatus = action === "rejected" ? "rejected" : "accepted";

  const pageTitle =
    targetStatus === "rejected" ? "Tolak Pengajuan" : "Setujui Pengajuan";
  const pageDescription =
    targetStatus === "rejected"
      ? "Tolak pengajuan untuk melanjutkan proyek capstone."
      : "Setujui pengajuan untuk melanjutkan proyek capstone.";

  useEffect(() => {
    if (!requestId) {
      setLoading(false);
      setLoadError("Permintaan tidak ditemukan.");
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const res = await RequestService.getRequestDetail(requestId);
        if (res.success && res.data) {
          setRequestDetail(res.data);
        } else {
          setLoadError("Gagal mengambil detail pengajuan.");
        }
      } catch (err) {
        console.error("getRequestDetail error:", err);
        setLoadError("Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [requestId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestId) return;

    if (!reason.trim()) {
      setSubmitError("Alasan keputusan wajib diisi.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const decisionValue = action === "rejected" ? "reject" : "accept";

const payload = {
  decision: decisionValue,      // "accept" atau "reject" persis seperti Postman
  reason: reason.trim(),
};


      const res = await RequestService.decideRequest(requestId, payload);

      if (res.success) {
        router.push("/request?tab=inbox");
      } else {
        setSubmitError(res.error || "Gagal menyimpan keputusan.");
      }
    } catch (err) {
      console.error("decideRequest error:", err);
      setSubmitError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/request?tab=inbox");
  };

  // gabungan data dari API dan query string
  const title =
    requestDetail?.capstone?.title ||
    requestDetail?.project?.title ||
    requestDetail?.capstoneTitle ||
    requestDetail?.title ||
    titleFromQuery ||
    "Judul Capstone";

  const themeLabel = getThemeLabel(
    requestDetail?.capstone?.tema ||
      requestDetail?.project?.tema ||
      temaFromQuery
  );

  const groupName =
    requestDetail?.groupName ||
    requestDetail?.group?.name ||
    groupFromQuery ||
    "-";

  const tahunProyek =
    requestDetail?.tahunPengajuan ||
    (requestDetail?.createdAt
      ? new Date(requestDetail.createdAt).getFullYear()
      : tahunFromQuery || "-");

  const lastStatus = requestDetail?.status; // pending / accepted / rejected
  const lastReason = requestDetail?.reason || "-";

  const hasAnyData =
    !!requestDetail ||
    !!titleFromQuery ||
    !!groupFromQuery ||
    !!tahunFromQuery ||
    !!temaFromQuery;

  return (
    <div className="min-h-screen bg-[#EEF3F7]">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>

          <h1 className="mb-1 text-3xl font-bold text-neutral-900">
            {pageTitle}
          </h1>
          <p className="mb-6 text-sm text-neutral-600">
            {pageDescription}
          </p>

          <Card className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <CardContent className="px-8 py-8">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
                </div>
              ) : !hasAnyData ? (
                <div className="py-8 text-center text-sm text-red-600">
                  {loadError || "Data pengajuan tidak ditemukan."}
                </div>
              ) : (
                <>
                  {/* kalau mau, loadError bisa ditampilkan kecil abu abu, tapi tidak wajib */}
                  {/* Info proyek */}
                  <div className="mb-8">
                    <h2 className="mb-3 text-2xl font-semibold text-neutral-900">
                      {title}
                    </h2>

                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-800"
                      >
                        {themeLabel}
                      </Badge>
                    </div>

                    <div className="grid gap-3 text-sm text-neutral-800 md:grid-cols-2">
                      <div>
                        <p className="font-semibold">Nama Grup</p>
                        <p>{groupName}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Tahun Pengajuan</p>
                        <p>{tahunProyek}</p>
                      </div>
                      
                      {lastStatus && (
                        <div>
                          <p className="font-semibold">Status Sebelumnya</p>
                          <span
                            className={`inline-flex rounded-full px-3 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                              lastStatus
                            )}`}
                          >
                          {lastStatus === "accepted"
                            ? "Diterima"
                            : lastStatus === "rejected"
                            ? "Ditolak"
                            : "Menunggu"}
                          </span>
                        </div>
                      )}
                      {lastStatus && (
                        <div>
                          <p className="font-semibold">
                            Alasan Keputusan Sebelumnya
                          </p>
                          <p className="text-neutral-700">{lastReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form keputusan baru */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <p className="mb-1 text-sm font-semibold">
                        Status Pengajuan
                      </p>
                      <span
                        className={`inline-flex rounded-full px-3 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                          targetStatus
                        )}`}
                      >
                      {targetStatus === "accepted"
                        ? "Diterima"
                        : "Ditolak"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="reason"
                        className="text-sm font-semibold"
                      >
                        {targetStatus === "rejected"
                          ? "Alasan Ditolak" 
                          : "Alasan Diterima"}
                      </Label>
                      <Textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={
                          targetStatus === "rejected"
                            ? "Tuliskan alasan pengajuan ditolak secara singkat dan jelas."
                            : "Tuliskan alasan pengajuan diterima secara singkat dan jelas."
                        }
                        className="min-h-[96px] bg-white border border-neutral-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>

                    {submitError && (
                      <p className="text-sm text-red-600">{submitError}</p>
                    )}

                    <div className="mt-6 flex flex-wrap gap-4">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="min-w-[140px] rounded-lg bg-[#FFE196] font-semibold text-neutral-900 hover:bg-[#FFD86A]"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Mengirim...
                          </>
                        ) : (
                          "Konfirmasi"
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="min-w-[140px] rounded-lg border border-[#FF9F5B] bg-white font-semibold text-[#FF9F5B] hover:bg-[#FFF4EC]"
                        onClick={handleBack}
                      >
                        Batal
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
