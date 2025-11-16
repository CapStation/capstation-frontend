"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import ProjectService from "@/services/ProjectService";
import RequestService from "@/services/RequestService";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CreateRequestPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const projectId = searchParams.get("projectId");

  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!projectId) {
      setLoadingProject(false);
      return;
    }

    const loadProject = async () => {
      setLoadingProject(true);
      try {
        const result = await ProjectService.getProjectById(projectId);
        if (result.success) {
          setProject(result.data);
          // kalau backend punya field tahun, pakai sebagai default tahun pengajuan
          const projYear =
            result.data.year ||
            (result.data.startedAt
              ? new Date(result.data.startedAt).getFullYear()
              : null);
          if (projYear) setYear(projYear);
        } else {
          console.error(result.message);
        }
      } catch (err) {
        console.error("Failed to load project:", err);
      } finally {
        setLoadingProject(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) return;

    setSubmitting(true);
    try {
      // sesuaikan payload dengan kontrak backend kamu
      const payload = {
        capstoneId: projectId,
        groupName,
        tahunPengajuan: year, 
      };

      const result = await RequestService.createRequest(payload);

      if (result.success) {
        toast({
          title: "Pengajuan berhasil",
          description: "Request capstone kamu sudah dikirim.",
        });
        router.push("/request?tab=my-request");
      } else {
        toast({
          variant: "destructive",
          title: "Gagal mengirim pengajuan",
          description: result.message || "Terjadi kesalahan.",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Gagal mengirim pengajuan",
        description: "Periksa koneksi atau coba beberapa saat lagi.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/request");
  };

  const getProjectYear = () => {
    if (!project) return "-";
    return (
      project.year ||
      (project.startedAt
        ? new Date(project.startedAt).getFullYear()
        : "2025")
    );
  };

  return (
    <div className="min-h-screen bg-[#EEF3F7]">
      <Navbar />

      <main className="mx-auto max-w-[1956px] px-4 lg:px-[178px] py-10">
        {/* tombol kembali */}
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="mb-6 rounded-full bg-[#CDEAAC] border-none text-sm font-semibold text-neutral-900 hover:bg-[#bfe193] px-8"
        >
          Kembali
        </Button>

        <h1 className="text-3xl font-bold text-neutral-900">Buat Pengajuan</h1>
        <p className="text-neutral-600 mb-8">
          Buat pengajuan untuk melanjutkan proyek capstone.
        </p>

        <Card className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <CardContent className="px-10 py-10">
            {loadingProject ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !project ? (
              <p className="text-sm text-neutral-500">
                Proyek tidak ditemukan.
              </p>
            ) : (
              <>
                {/* judul dan info singkat proyek */}
                <div className="mb-8 space-y-3">
                  <h2 className="text-2xl font-semibold">
                    {project.title}
                  </h2>

                  <Badge
                    variant="outline"
                    className="rounded-full px-4 py-1 text-xs font-medium"
                  >
                    {project.category?.name || project.category || "Smart City"}
                  </Badge>

                  <div className="mt-4 text-sm text-neutral-800 space-y-1">
                    <p className="font-semibold">Tahun</p>
                    <p>{getProjectYear()}</p>
                  </div>
                </div>

                {/* form pengajuan */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <Label htmlFor="groupName" className="text-sm font-semibold">
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
                    <Label htmlFor="year" className="text-sm font-semibold">
                      Tahun Pengajuan <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      min="2020"
                      max="2100"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      required
                      className="bg-[#F3F4F6] border border-neutral-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="min-w-[200px] rounded-lg bg-[#FFD568] hover:bg-[#ffca3f] text-neutral-900 font-semibold border-none"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        "Ajukan"
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="min-w-[200px] rounded-lg border-[#FF914D] text-[#FF914D] hover:bg-[#FFF3EA]"
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
