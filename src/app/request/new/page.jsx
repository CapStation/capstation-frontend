"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { ArrowLeft } from "lucide-react";

import ProjectService from "@/services/ProjectService";
import RequestService from "@/services/RequestService";

// kalau mau, pakai helper yang sama seperti di RequestPage
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
  return themeMap[tema] || tema.charAt(0).toUpperCase() + tema.slice(1);
};

export default function NewRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);

  const [groupName, setGroupName] = useState("");
  const [submissionYear, setSubmissionYear] = useState(
    new Date().getFullYear()
  );
  const [lecturerName, setLecturerName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!projectId) {
      setLoadingProject(false);
      return;
    }

    const fetchProject = async () => {
      setLoadingProject(true);
      try {
        const res = await ProjectService.getProjectById(projectId);
        if (res.success && res.data) {
          const p = res.data;

          setProject(p);

          // kalau mau autofill dari project
          if (p.groupName) setGroupName(p.groupName);
          if (p.supervisorName || p.dosenPembimbing) {
            setLecturerName(p.supervisorName || p.dosenPembimbing);
          }
        }
      } catch (err) {
        console.error("Failed to load project for new request:", err);
      } finally {
        setLoadingProject(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!projectId) {
      setErrorMessage("Proyek tidak ditemukan.");
      return;
    }

    if (!groupName.trim() || !submissionYear || !lecturerName.trim()) {
      setErrorMessage("Mohon lengkapi semua field wajib.");
      return;
    }

    const payload = {
      capstoneId: projectId,
      groupName: groupName.trim(),
      tahunPengajuan: submissionYear,
      namaDosenPembimbing: lecturerName.trim(),
    };

    setSubmitting(true);
    try {
      const res = await RequestService.createRequest(payload);
      if (res.success) {
        // setelah sukses, balik ke Request page tab My Request
        router.push("/request?tab=my-request");
      } else {
        setErrorMessage(
          res.error || "Gagal membuat pengajuan. Silakan coba lagi."
        );
      }
    } catch (err) {
      console.error("Submit request error:", err);
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const projectTitle =
    project?.title ||
    "Smart City Dashboard untuk Monitoring Lingkungan Area Malioboro";

  const academicYearLabel =
    project?.academicYear ||
    (project?.createdAt
      ? new Date(project.createdAt).getFullYear()
      : "-");

  const themeLabel = getThemeLabel(project?.tema);

  return (
    <div className="min-h-screen bg-[#EEF3F7]">
      <Navbar />

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
        {/* tombol kembali hijau */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>


        <h1 className="text-3xl font-bold text-neutral-900 mb-1">
          Buat Pengajuan
        </h1>
        <p className="mb-6 text-neutral-600">
          Buat pengajuan untuk melanjutkan proyek capstone.
        </p>

        <Card className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <CardContent className="px-8 py-8">
            {loadingProject ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
              </div>
            ) : !project ? (
              <div className="text-center text-sm text-neutral-600 py-10">
                Proyek tidak ditemukan.
              </div>
            ) : (
              <>
                {/* informasi proyek, mirip layout detail */}
                <div className="mb-8">
                  <h2 className="mb-3 text-2xl font-semibold text-neutral-900">
                    {projectTitle}
                  </h2>

                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {project.status && (
                      <Badge className="rounded-full bg-[#22C55E] text-white text-xs font-medium">
                        {project.statusLabel || "Sedang Berjalan"}
                      </Badge>
                    )}
                    {themeLabel && (
                      <Badge
                        variant="outline"
                        className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-800"
                      >
                        {themeLabel}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-neutral-700">
                    <p className="pt-2">
                      <span className="font-semibold text-neutral-900">
                        Tahun Proyek{" "}
                      </span>
                      <br />
                      {academicYearLabel}
                    </p>
                  </div>
                </div>

                {/* form pengajuan */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <Label
                      htmlFor="groupName"
                      className="text-sm font-semibold"
                    >
                      Nama Grup <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="groupName"
                      placeholder="Masukkan nama grup Anda"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                      className="bg-[#F3F4F6] border border-neutral-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="submissionYear"
                      className="text-sm font-semibold"
                    >
                      Tahun Pengajuan <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="submissionYear"
                      type="number"
                      min="2000"
                      max="2100"
                      value={submissionYear}
                      onChange={(e) =>
                        setSubmissionYear(e.target.value)
                      }
                      required
                      className="bg-[#F3F4F6] border border-neutral-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="lecturerName"
                      className="text-sm font-semibold"
                    >
                      Nama Dosen Pembimbing{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lecturerName"
                      placeholder="Masukkan nama dosen pembimbing"
                      value={lecturerName}
                      onChange={(e) =>
                        setLecturerName(e.target.value)
                      }
                      required
                      className="bg-[#F3F4F6] border border-neutral-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  {errorMessage && (
                    <p className="text-sm text-red-600">
                      {errorMessage}
                    </p>
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
                          Mengajukan...
                        </>
                      ) : (
                        "Ajukan"
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="min-w-[140px] rounded-lg border border-[#FF9F5B] bg-white font-semibold text-[#FF9F5B] hover:bg-[#FFF4EC]"
                      onClick={() => router.push("/request")}
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
