"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Search } from "lucide-react";

import ProjectService from "@/services/ProjectService";
import RequestService from "@/services/RequestService";
import UserService from "@/services/UserService";
import GroupService from "@/services/GroupService";

if (typeof window !== "undefined") {
  const originalConsoleError = console.error;

  console.error = (...args) => {
    const text = args
      .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
      .join(" ");

    const shouldIgnore =
      text.includes("getUserGroups error") ||
      text.includes("User belum bergabung dalam grup manapun") ||
      text.includes("No response data") ||
      text.includes("Gagal mengambil data grup");

    if (shouldIgnore) {
      return;
    }

    originalConsoleError(...args);
  };
}

const getThemeLabel = (tema) => {
  if (!tema) return "Lainnya";

  const raw = String(tema).toLowerCase();

  const normalizedKey = raw.replace(/[-_]/g, "");

  const themeMap = {
    kesehatan: "Kesehatan",
    pengelolaansampah: "Pengelolaan Sampah",
    smartcity: "Smart City",
    transportasiramahlingkungan: "Transportasi Ramah Lingkungan",
    iot: "IoT",
    ai: "Artificial Intelligence",
    mobile: "Mobile Development",
  };

  if (themeMap[normalizedKey]) {
    return themeMap[normalizedKey];
  }

  return String(tema)
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

function NewRequestPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);

  const [groupName, setGroupName] = useState("");
  const [group, setGroup] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);

  const [submissionYear, setSubmissionYear] = useState(
    new Date().getFullYear()
  );
  const [lecturerName, setLecturerName] = useState("");

  // state dropdown dosen
  const [dosenList, setDosenList] = useState([]);
  const [filteredDosenList, setFilteredDosenList] = useState([]);
  const [loadingDosen, setLoadingDosen] = useState(true);
  const [showDosenDropdown, setShowDosenDropdown] = useState(false);
  const [dosenSearchQuery, setDosenSearchQuery] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // load list dosen
  useEffect(() => {
    const loadDosenList = async () => {
      setLoadingDosen(true);
      try {
        const result = await UserService.getAllUsers();
        if (result.success && result.data) {
          const dosenUsers = result.data.filter(
            (user) => user.role === "dosen"
          );
          setDosenList(dosenUsers);
          setFilteredDosenList(dosenUsers);
        }
      } catch (err) {
        console.error("Gagal load dosen:", err);
      } finally {
        setLoadingDosen(false);
      }
    };

    loadDosenList();
  }, []);

  // load grup saya
  useEffect(() => {
    const loadGroup = async () => {
      setLoadingGroup(true);
      try {
        const res = await GroupService.getUserGroups();

        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          // user sudah punya grup
          const g = res.data[0];
          setGroup(g);
          setGroupName(g.name || g.groupName || "");
        } else {
          // tidak punya grup atau gagal ambil grup
          setGroup(null);
          setGroupName("");
          console.log("User belum punya grup atau gagal ambil grup:", res);
        }
      } catch (err) {
        // jaga jaga kalau sampai throw
        console.error("Gagal load group di halaman request:", err);
        setGroup(null);
        setGroupName("");
      } finally {
        setLoadingGroup(false);
      }
    };

    loadGroup();
  }, []);

  const handleDosenSearch = (query) => {
    setDosenSearchQuery(query);
    if (!query.trim()) {
      setFilteredDosenList(dosenList);
      return;
    }
    const filtered = dosenList.filter(
      (dosen) =>
        dosen.name.toLowerCase().includes(query.toLowerCase()) ||
        dosen.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDosenList(filtered);
  };

  const selectDosen = (dosen) => {
    setLecturerName(dosen.name);
    setShowDosenDropdown(false);
    setDosenSearchQuery("");
    setFilteredDosenList(dosenList);
  };

  // load project yang mau diajukan
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

  const academicYearLabel = project?.academicYear
    ? String(project.academicYear).replace("-", " ")
    : project?.createdAt
    ? new Date(project.createdAt).getFullYear()
    : "-";

  const themeLabel = getThemeLabel(project?.tema);

  return (
    <div className="min-h-screen bg-[#EEF3F7]">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8"></div>
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
                  {/* informasi proyek */}
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

                    <div className="space-y-1 text-sm text-neutral-700 mt-5"></div>
                    <div className="text-sm text-neutral-700">
                      <p className="pt-2">
                        <span className="font-semibold text-neutral-900">
                          Nama Grup
                        </span>
                        <br />
                        {loadingGroup ? (
                          "Memuat nama grup..."
                        ) : group ? (
                          groupName
                        ) : (
                          <span className="text-red-600">
                            Anda belum tergabung dalam grup. Silakan bergabung
                            dalam grup terlebih dahulu sebelum mengajukan.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* form pengajuan */}
                  <form onSubmit={handleSubmit} className="space-y-5">
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
                        onChange={(e) => setSubmissionYear(e.target.value)}
                        required
                        className="bg-white border border-neutral-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>

                    <div className="space-y-1 relative">
                      <Label
                        htmlFor="lecturerName"
                        className="text-sm font-semibold"
                      >
                        Nama Dosen Pembimbing{" "}
                        <span className="text-red-500">*</span>
                      </Label>

                      <div
                        className="mt-1 flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded-md cursor-pointer hover:bg-neutral-50"
                        onClick={() => setShowDosenDropdown(!showDosenDropdown)}
                      >
                        <Search className="h-4 w-4 text-neutral-500" />
                        <span
                          className={
                            lecturerName
                              ? "text-neutral-900"
                              : "text-neutral-500"
                          }
                        >
                          {lecturerName || "Pilih dosen pembimbing..."}
                        </span>
                      </div>

                      {showDosenDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-64 overflow-hidden">
                          <div className="p-2 border-b">
                            <Input
                              type="text"
                              placeholder="Cari dosen..."
                              value={dosenSearchQuery}
                              onChange={(e) =>
                                handleDosenSearch(e.target.value)
                              }
                              className="w-full"
                              autoFocus
                            />
                          </div>

                          <div className="max-h-48 overflow-y-auto">
                            {loadingDosen ? (
                              <div className="p-4 text-center text-neutral-500">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                              </div>
                            ) : filteredDosenList.length === 0 ? (
                              <div className="p-4 text-center text-neutral-500 text-sm">
                                Dosen tidak ditemukan
                              </div>
                            ) : (
                              filteredDosenList.map((dosen) => (
                                <div
                                  key={dosen._id}
                                  className="px-3 py-2 hover:bg-neutral-100 cursor-pointer"
                                  onClick={() => selectDosen(dosen)}
                                >
                                  <div className="font-medium text-neutral-900">
                                    {dosen.name}
                                  </div>
                                  <div className="text-xs text-neutral-500">
                                    {dosen.email}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-amber-600 mt-2 font-medium">
                        ⚠️ Pastikan Nama Dosen sesuai dengan plottingan yang
                        sudah ada.
                      </p>
                    </div>

                    {errorMessage && (
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    )}

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="submit"
                        disabled={submitting || (!loadingGroup && !group)}
                        className="min-w-[160px] rounded-lg bg-[#FFE196] font-semibold text-neutral-900 hover:bg-[#FFD86A]"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Mengajukan...
                          </>
                        ) : (
                          "Ajukan"
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="min-w-[160px] rounded-lg border border-[#FF9F5B] bg-white font-semibold text-[#FF9F5B] hover:bg-[#FFF4EC]"
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

export default function NewRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <NewRequestPageContent />
    </Suspense>
  );
}
