"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import RequestService from "@/services/RequestService";

// label status
const getStatusLabel = (status) => {
  if (!status) return "-";
  switch (status) {
    case "accepted":
      return "Diterima";
    case "rejected":
      return "Ditolak";
    case "pending":
      return "Menunggu";
    case "cancelled":
      return "Dibatalkan";
    default:
      return status;
  }
};

// kelas badge status
const getStatusClass = (status) => {
  switch (status) {
    case "accepted":
      return "bg-[#22C55E] text-white";
    case "rejected":
      return "bg-[#F97373] text-white";
    case "cancelled":
      return "bg-neutral-900 text-white";
    case "pending":
    default:
      return "bg-neutral-300 text-neutral-900";
  }
};

export default function EditDecisionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestId = searchParams.get("requestId");
  const titleParam = searchParams.get("title") || "";
  const groupNameParam = searchParams.get("groupName") || "";
  const yearParam = searchParams.get("year") || "";
  const prevStatusParam = searchParams.get("status") || "pending";
  const prevReasonParam = searchParams.get("reason") || "";

  const [projectTitle] = useState(titleParam || "Judul capstone");
  const [groupName] = useState(groupNameParam || "-");
  const [tahunPengajuan] = useState(yearParam || "-");
  const [previousStatus] = useState(prevStatusParam);
  const [previousReason] = useState(prevReasonParam);

  const [newStatus, setNewStatus] = useState(
    prevStatusParam === "accepted" ? "rejected" : "accepted"
  );
  const [changeReason, setChangeReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!requestId) {
      setErrorMessage("Request tidak ditemukan.");
    }
  }, [requestId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestId) {
      setErrorMessage("Request tidak ditemukan.");
      return;
    }
    if (!changeReason.trim()) {
      setErrorMessage("Alasan perubahan wajib diisi.");
      return;
    }

    setErrorMessage("");
    setSubmitting(true);

    try {
      // backend butuh field decision, bukan status
      const decisionValue = newStatus === "rejected" ? "reject" : "accept";

      const payload = {
        decision: decisionValue,
        reason: changeReason.trim(),
        override: "true",
      };

      const result = await RequestService.decideRequest(requestId, payload);

      if (result.success) {
        router.push("/request?tab=history");
      } else {
        setErrorMessage(
          result.error || "Gagal mengubah keputusan. Silakan coba lagi."
        );
      }
    } catch (err) {
      console.error("Edit decision submit error:", err);
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/request?tab=history");
  };

  return (
    <div className="min-h-screen bg-[#EEF3F7]">
      <Navbar />

      <main className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-5xl">
          {/* tombol kembali */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>

          <h1 className="mb-1 text-3xl font-bold text-neutral-900">
            Ubah Keputusan
          </h1>
          <p className="mb-6 text-neutral-600">
            Ubah keputusan melanjutkan proyek capstone.
          </p>

          <Card className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <CardContent className="px-8 py-8">
              {!requestId ? (
                <div className="py-10 text-center text-sm text-red-600">
                  Request tidak ditemukan.
                </div>
              ) : (
                <>
                  {/* info capstone */}
                  <div className="mb-8">
                    <h2 className="mb-3 text-2xl font-semibold text-neutral-900">
                      {projectTitle}
                    </h2>

                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <Badge
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                          previousStatus
                        )}`}
                      >
                        {getStatusLabel(previousStatus)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-neutral-800">
                      <p>
                        <span className="font-semibold">Nama Grup:</span>{" "}
                        {groupName || "-"}
                      </p>
                      <p>
                        <span className="font-semibold">
                          Tahun Pengajuan:
                        </span>{" "}
                        {tahunPengajuan || "-"}
                      </p>
                    </div>
                  </div>

                  {/* form ubah keputusan */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* keputusan sebelumnya */}
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-neutral-900">
                        Keputusan Sebelumnya
                      </p>
                      <div className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-900">
                        {getStatusLabel(previousStatus)}
                      </div>
                      {previousReason && (
                        <p className="mt-2 text-neutral-700">
                          <span className="font-semibold">
                            Alasan Sebelumnya:
                          </span>{" "}
                          {previousReason}
                        </p>
                      )}
                    </div>

                    {/* keputusan baru */}
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-neutral-900">
                          Keputusan Baru
                        </p>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setNewStatus("accepted")}
                            className={`rounded-full px-4 py-1 text-xs font-semibold ${
                              newStatus === "accepted"
                                ? "bg-[#22C55E] text-white"
                                : "bg-neutral-100 text-neutral-800"
                            }`}
                          >
                            Diterima
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewStatus("rejected")}
                            className={`rounded-full px-4 py-1 text-xs font-semibold ${
                              newStatus === "rejected"
                                ? "bg-[#F97373] text-white"
                                : "bg-neutral-100 text-neutral-800"
                            }`}
                          >
                            Ditolak
                          </button>
                        </div>
                      </div>

                    {/* alasan perubahan */}
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-neutral-900">
                        Alasan Perubahan <span className="text-red-500">*</span>
                      </p>
                      <textarea
                        rows={3}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="Tuliskan alasan perubahan keputusan"
                        value={changeReason}
                        onChange={(e) => setChangeReason(e.target.value)}
                      />
                    </div>

                    {errorMessage && (
                      <p className="text-sm text-red-600">
                        {errorMessage}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-4">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="min-w-[160px] rounded-lg bg-[#FFE196] font-semibold text-neutral-900 hover:bg-[#FFD86A]"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          "Konfirmasi"
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="min-w-[160px] rounded-lg border border-[#FF9F5B] bg-white font-semibold text-[#FF9F5B] hover:bg-[#FFF4EC]"
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
