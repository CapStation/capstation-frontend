"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import UserService from "@/services/UserService";
import { useAuth } from "@/contexts/AuthContext";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useRouter, useSearchParams } from "next/navigation";

import ProjectService from "@/services/ProjectService";
import RequestService from "@/services/RequestService";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Download,
  Upload,
  Loader2,
  Calendar,
  User,
  Users,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  Eye,
  Info,
  X,
  ClipboardList,
  Presentation,
  ScrollText,
  Image,
  Palette,
  Video,
  Camera,
  Paperclip,
  History,
} from "lucide-react";

const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

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
    return "bg-[#C4F58C] text-neutral-900";
  }
  if (lower === "rejected") {
    return "bg-[#FECACA] text-red-700";
  }
  if (lower === "cancelled" || lower === "canceled") {
    return "bg-neutral-800 text-white";
  }
  return "bg-neutral-200 text-neutral-800";
};

function RequestPageContent() {
  const { user } = useAuth();
  const [availableProjects, setAvailableProjects] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [hasProjectDapatDilanjutkan, setHasProjectDapatDilanjutkan] = useState(false);

  // state untuk modal batal request
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // capstone yang sudah pernah diajukan oleh user ini
  const requestedCapstoneIds = new Set(
    myRequests
      .filter((req) => {
        const status = String(req.status || "").toLowerCase();
        return status === "pending" || status === "accepted";
      })
      .map((req) =>
        String(
          req.capstoneId ||
            req.capstone?._id ||
            req.capstone?.id ||
            req.projectId ||
            req.project?._id ||
            req.project?.id ||
            ""
        )
      )
  );

  // daftar project yang boleh muncul di tab Submit Request
  const submitProjects = availableProjects.filter((p) => {
    const pid = String(p._id || p.id || p.capstoneId || "");
    if (!pid) return false;
    return !requestedCapstoneIds.has(pid);
  });

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [inboxRequests, setInboxRequests] = useState([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [decidingId, setDecidingId] = useState(null);

  const [decisionHistory, setDecisionHistory] = useState([]);
  const visibleDecisionHistory = decisionHistory.filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return status === "accepted" || status === "rejected";
  });
  const [loadingDecisionHistory, setLoadingDecisionHistory] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    loadProjects();
    loadMyRequests();
  }, [user]);

  // Refresh data when page becomes visible (e.g., after returning from decision page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page is visible, refreshing data...");
        loadProjects();
        loadMyRequests();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Load inbox and decision history when user has project with dapat_dilanjutkan or selesai status
  useEffect(() => {
    if (hasProjectDapatDilanjutkan) {
      loadInbox();
      loadDecisionHistory();
    }
  }, [hasProjectDapatDilanjutkan]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const result = await ProjectService.getAllProjects();

      if (result.success && Array.isArray(result.data)) {
        const projects = result.data;

        const candidates = projects.filter(
          (p) => p.status === "dapat_dilanjutkan"
        );

        // Check if current user owns any project with status dapat_dilanjutkan or selesai
        const userHasProjectDapatDilanjutkan = projects.some((p) => {
          if (p.status !== "dapat_dilanjutkan" && p.status !== "selesai") return false;
          
          const userId = user?._id || user?.id;
          const ownerId = typeof p.owner === "object" ? p.owner?._id || p.owner?.id : p.owner;
          const supervisorId = typeof p.supervisor === "object" ? p.supervisor?._id || p.supervisor?.id : p.supervisor;
          
          const isOwner = ownerId && userId && (ownerId === userId || ownerId.toString() === userId.toString());
          const isSupervisor = supervisorId && userId && (supervisorId === userId || supervisorId.toString() === userId.toString());
          
          return isOwner || isSupervisor;
        });
        
        console.log('🔍 Checking for decision access:', {
          userHasProjectDapatDilanjutkan,
          userId: user?._id || user?.id,
          totalProjects: projects.length,
          dapatDilanjutkanProjects: projects.filter(p => p.status === 'dapat_dilanjutkan').length,
          selesaiProjects: projects.filter(p => p.status === 'selesai').length
        });
        
        setHasProjectDapatDilanjutkan(userHasProjectDapatDilanjutkan);

        const enriched = await Promise.all(
          candidates.map(async (p) => {
            let ownerName = "Pemilik Proyek";

            try {
              if (p.owner) {
                if (
                  typeof p.owner === "object" &&
                  (p.owner.fullName || p.owner.name || p.owner.username)
                ) {
                  ownerName =
                    p.owner.fullName || p.owner.name || p.owner.username;
                } else if (
                  typeof p.owner === "string" &&
                  OBJECT_ID_REGEX.test(p.owner)
                ) {
                  const res = await UserService.getUserById(p.owner);
                  if (res.success && res.data) {
                    ownerName =
                      res.data.fullName ||
                      res.data.name ||
                      res.data.username ||
                      res.data.email;
                  }
                } else if (typeof p.owner === "string") {
                  ownerName = p.owner;
                }
              }
            } catch (e) {
              console.error("Failed to resolve owner name:", e);
            }

            return { ...p, ownerName };
          })
        );

        setAvailableProjects(enriched);
      } else {
        setAvailableProjects([]);
      }
    } catch (error) {
      console.error("Failed to load projects for request page:", error);
      setAvailableProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadMyRequests = async () => {
    setLoadingRequests(true);
    try {
      const [reqResult, projectResult] = await Promise.all([
        RequestService.getMyRequests(),
        ProjectService.getAllProjects(),
      ]);

      if (reqResult.success && Array.isArray(reqResult.data)) {
        let requests = reqResult.data;

        if (projectResult.success && Array.isArray(projectResult.data)) {
          const projectMap = new Map();
          projectResult.data.forEach((p) => {
            const id = String(p._id);
            const title = p.title || p.judul || "Judul capstone";
            projectMap.set(id, title);
          });

          requests = requests.map((r) => {
            const id = String(r.capstoneId || "");
            const capstoneTitle =
              r.capstoneTitle ||
              projectMap.get(id) ||
              r.title ||
              "Judul capstone";

            const formatDate = (dateString) => {
              if (!dateString) return "-";
              const d = new Date(dateString);
              if (Number.isNaN(d.getTime())) return "-";
              return d.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
            };

            const getDecisionStatusLabel = (status) => {
              if (!status) return "-";
              const s = String(status).toLowerCase();
              if (s === "accepted") return "Accepted";
              if (s === "rejected") return "Rejected";
              if (s === "cancelled" || s === "canceled") return "Cancelled";
              if (s === "pending") return "Pending";
              return status;
            };

            const getDecisionStatusClass = (status) => {
              const s = String(status || "").toLowerCase();
              if (s === "accepted") return "bg-[#BBF7D0] text-[#166534]";
              if (s === "rejected") return "bg-[#FECACA] text-[#991B1B]";
              if (s === "cancelled" || s === "canceled")
                return "bg-neutral-900 text-white";
              return "bg-neutral-200 text-neutral-700";
            };

            return { ...r, capstoneTitle };
          });
        }

        setMyRequests(requests);
      } else {
        setMyRequests([]);
      }
    } catch (error) {
      console.error("Failed to load my requests:", error);
      setMyRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadInbox = async () => {
    setLoadingInbox(true);
    try {
      console.log('📥 Loading inbox...');
      const [inboxResult, projectResult] = await Promise.all([
        RequestService.getOwnerInbox(),
        ProjectService.getAllProjects(),
      ]);

      console.log('📥 Inbox result:', inboxResult);
      console.log('📥 Project result:', projectResult);

      let list = [];

      if (inboxResult.success && inboxResult.data) {
        const raw = inboxResult.data;
        list = Array.isArray(raw) ? raw : raw.data || [];
        console.log('📥 Processed inbox list:', list);
      } else {
        console.warn('❌ Inbox result not successful or no data:', inboxResult);
      }

      if (list.length === 0) {
        console.log('⚠️ No inbox items found');
        setInboxRequests([]);
        return;
      }

      if (projectResult.success && Array.isArray(projectResult.data)) {
        const projectMap = new Map();

        // simpan seluruh project, bukan cuma judul
        projectResult.data.forEach((p) => {
          const id = String(p._id || p.id || "");
          projectMap.set(id, p);
        });

        list = list.map((req) => {
          const capId = String(
            req.capstoneId || req.capstone?.id || req.capstone?._id || ""
          );

          const project = req.capstone || projectMap.get(capId) || null;
          const capstoneTitle =
            req.capstoneTitle ||
            project?.title ||
            project?.judul ||
            "Judul capstone";

          return { ...req, capstoneTitle, capstoneProject: project };
        });
      }

      setInboxRequests(list);
    } catch (error) {
      console.error("Failed to load owner inbox:", error);
      setInboxRequests([]);
    } finally {
      setLoadingInbox(false);
    }
  };

  const handleDecision = (requestId, action) => {
    router.push(`/request/decision?requestId=${requestId}&action=${action}`);
  };

  const loadDecisionHistory = async () => {
    setLoadingDecisionHistory(true);
    try {
      const result = await RequestService.getMyDecisionHistory();
      console.log("decision history result", result);

      if (!(result.success && Array.isArray(result.data))) {
        setDecisionHistory([]);
        return;
      }

      const rawItems = result.data;

      const capstoneIds = [
        ...new Set(
          rawItems
            .map(
              (item) =>
                item.capstoneId || item.capstone?.id || item.capstone?._id
            )
            .filter(Boolean)
        ),
      ];

      const capstoneMap = {};

      await Promise.all(
        capstoneIds.map(async (id) => {
          try {
            const res = await ProjectService.getProjectById(id);
            if (res.success && res.data) {
              capstoneMap[id] = res.data;
            }
          } catch (err) {
            console.error(
              "Failed to load project for decision history:",
              id,
              err
            );
          }
        })
      );

      const withTitles = rawItems.map((item) => {
        const cid = item.capstoneId || item.capstone?.id || item.capstone?._id;
        const capstone = cid ? capstoneMap[cid] : item.capstone;

        return {
          ...item,
          capstoneTitle:
            item.capstoneTitle || capstone?.title || "Judul capstone",
        };
      });

      const sorted = withTitles.sort((a, b) => {
        const da = new Date(a.decidedAt || a.createdAt || 0).getTime();
        const db = new Date(b.decidedAt || b.createdAt || 0).getTime();
        return db - da;
      });

      setDecisionHistory(sorted);
    } catch (error) {
      console.error("Failed to load decision history:", error);
      setDecisionHistory([]);
    } finally {
      setLoadingDecisionHistory(false);
    }
  };

  const renderProjectCard = (project) => {
    const title =
      project.title ||
      "Smart City Dashboard untuk Monitoring Lingkungan Area Malioboro";

    const titleLength = title.length;

    let titleSizeClass = "text-base sm:text-lg";
    if (titleLength > 60 && titleLength <= 100) {
      titleSizeClass = "text-sm sm:text-base";
    } else if (titleLength > 100) {
      titleSizeClass = "text-xs sm:text-sm";
    }

    const categoryLabel = getThemeLabel(
      project.tema || project.category?.name || project.category
    );

    const yearLabel = project.academicYear
      ? String(project.academicYear).replace("-", " ")
      : project.startedAt
      ? new Date(project.startedAt).getFullYear()
      : project.createdAt
      ? new Date(project.createdAt).getFullYear()
      : "2024";

    const ownerLabel = project.ownerName || "Pemilik Proyek";

    return (
      <Card
        key={project._id}
        className="
        flex h-full min-h-[200px] sm:min-h-[220px] flex-col
        rounded-2xl border border-neutral-200 bg-white
        shadow-sm
        transition-all duration-200 ease-out
        hover:-translate-y-1 hover:shadow-md
      "
      >
        <CardContent className="flex flex-1 flex-col justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6">
          <div className="space-y-2 sm:space-y-3">
            <div className="min-h-[40px] sm:min-h-[48px]">
              <h3 className={`${titleSizeClass} font-semibold leading-tight`}>
                {title}
              </h3>
            </div>

            <Badge
              variant="outline"
              className="mt-1 rounded-full px-2 sm:px-3 py-1 text-xs font-medium"
            >
              {categoryLabel}
            </Badge>
            <div className="mt-2 sm:mt-3 space-y-1 text-xs sm:text-sm text-neutral-700">
              <p>
                <span className="font-semibold text-neutral-800">
                  Pemilik:{" "}
                </span>
                {ownerLabel}
              </p>
              <p>
                <span className="font-semibold text-neutral-800">Tahun: </span>
                {yearLabel}
              </p>
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            <Button
              asChild
              className="
              w-full rounded-lg font-semibold text-neutral-900
              bg-[#C4F58C] min-h-[44px]
              transition-all duration-200 ease-out
              hover:bg-[#FFD86A]
              active:bg-[#FFD86A]
              active:scale-[0.99]
            "
            >
              <Link href={`/request/new?projectId=${project._id}`}>
                Ajukan Request
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // buka modal batal untuk request tertentu
  const openCancelDialog = (req) => {
    setRequestToCancel(req);
    setCancelError("");
    setCancelDialogOpen(true);
  };

  // konfirmasi batal request (klik tombol merah di modal)
  const handleCancelRequest = async () => {
    if (!requestToCancel) return;

    const id = requestToCancel.id || requestToCancel._id;
    if (!id) {
      setCancelError("ID request tidak ditemukan.");
      return;
    }

    setCancelling(true);
    setCancelError("");

    try {
      const res = await RequestService.cancelRequest(id);

      if (res?.success) {
        await loadMyRequests();
        setCancelDialogOpen(false);
        setRequestToCancel(null);
      } else {
        console.error("Cancel gagal:", res);
        setCancelError(res?.error || "Gagal membatalkan request.");
      }
    } catch (err) {
      console.error("Error cancel request:", err);
      setCancelError("Terjadi kesalahan saat membatalkan request.");
    } finally {
      setCancelling(false);
    }
  };

  const renderMyRequestRow = (req) => {
    const title =
      req.capstoneTitle ||
      req.capstone?.title ||
      req.capstone?.judul ||
      req.title ||
      "Judul capstone";

    const group = req.groupName || "-";

    const year = req.tahunPengajuan || req.capstone?.academicYear || "-";

    const statusLabel = getStatusLabel(req.status);
    const statusClass = getStatusClass(req.status);

    const isPending = String(req.status || "").toLowerCase() === "pending";

    const id = req.id || req._id;
    const capstoneId = req.capstoneId;

    return (
      <div
        key={id}
        className="grid grid-cols-12 items-center gap-3 border-b border-neutral-200 px-4 py-3 text-xs sm:text-sm min-w-[640px]"
      >
        <div className="col-span-5 truncate font-medium text-neutral-900">
          {title}
        </div>
        <div className="col-span-3 text-neutral-700">{group}</div>
        <div className="col-span-1 text-neutral-700">{year}</div>
        <div className="col-span-1">
          <span
            className={`inline-flex items-center justify-center rounded-full px-2 sm:px-3 py-0.5 text-xs font-medium ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="col-span-2 flex justify-end">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              className="
                flex items-center gap-1 rounded-full 
                border border-neutral-300 
                text-xs font-medium text-neutral-800 
                bg-white
                hover:bg-[#C4F58C]
                active:bg-[#FFD86A]
                active:scale-[0.99]
                whitespace-nowrap
              "
              onClick={() =>
                router.push(
                  `/request/history?requestId=${id}` +
                    `&title=${encodeURIComponent(title)}` +
                    `&group=${encodeURIComponent(group)}` +
                    `&year=${encodeURIComponent(String(year))}` +
                    `&status=${encodeURIComponent(statusLabel)}` +
                    (capstoneId ? `&capstoneId=${capstoneId}` : "")
                )
              }
            >
              <History className="h-3 w-3" />
              <span className="hidden sm:inline">Lihat Riwayat</span>
              <span className="sm:hidden">Riwayat</span>
            </Button>

            {isPending && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="
                  flex items-center gap-1 rounded-full 
                  border border-red-200 
                  text-xs font-semibold text-red-600 
                  bg-white
                  hover:bg-red-50
                  hover:border-red-300
                  active:bg-red-100
                "
                onClick={() => openCancelDialog(req)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderInboxCard = (req) => {
    const id = req.id || req._id;

    const projectTitle =
      req.capstoneTitle ||
      req.capstone?.title ||
      req.project?.title ||
      req.title ||
      "Judul capstone";

    const groupName = req.groupName || req.group?.name || "Nama grup";

    const tahun =
      req.tahunPengajuan ||
      (req.createdAt ? new Date(req.createdAt).getFullYear() : "-");
    const categoryLabel = getThemeLabel(
      req.capstoneProject?.tema ||
        req.capstone?.tema ||
        req.tema ||
        req.capstoneProject?.category?.name ||
        req.capstoneProject?.category ||
        req.category?.name ||
        req.category
    );

    // -----------------------------
    // Anggota Tim
    // -----------------------------
    const rawMembers =
      req.anggotaTim ||
      req.groupMembers ||
      req.members ||
      req.group?.members ||
      req.capstone?.groupMembers ||
      req.capstone?.members;

    let membersLabel = "-";
    if (Array.isArray(rawMembers) && rawMembers.length > 0) {
      const names = rawMembers
        .map((m) => {
          if (!m) return null;
          if (typeof m === "string") return m;
          if (typeof m === "object") {
            return (
              m.fullName ||
              m.name ||
              m.username ||
              m.email ||
              String(m.nim || m._id || "")
            );
          }
          return String(m);
        })
        .filter(Boolean);

      membersLabel = names.length > 0 ? names.join(", ") : "-";
    } else if (rawMembers) {
      membersLabel = String(rawMembers);
    }

    const isDeciding = decidingId === id;

    const buildDecisionUrl = (action) =>
      `/request/decision?requestId=${id}` +
      `&action=${action}` +
      `&title=${encodeURIComponent(projectTitle)}` +
      `&groupName=${encodeURIComponent(groupName)}` +
      `&tahun=${encodeURIComponent(String(tahun))}`;

    return (
      <Card
        key={id}
        className="
            rounded-2xl border border-neutral-200 bg-white
            shadow-sm
            transition-all duration-200 ease-out
            hover:-translate-y-1 hover:shadow-md
          "
      >
        <CardContent className="flex flex-col justify-between gap-4 px-4 sm:px-6 py-4 sm:py-5 md:flex-row md:items-center">
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-neutral-900">
              {projectTitle}
            </h3>

            <Badge
              variant="outline"
              className="inline-flex rounded-full px-2 sm:px-3 py-1 text-xs font-medium"
            >
              {categoryLabel}
            </Badge>

            <p className="text-xs sm:text-sm text-neutral-700">
              <span className="font-semibold">Nama Grup: </span>
              {groupName}
            </p>
            <p className="text-xs sm:text-sm text-neutral-700">
              <span className="font-semibold">Tahun: </span>
              {tahun}
            </p>
            <p className="text-xs sm:text-sm text-neutral-700">
              <span className="font-semibold">Anggota Tim: </span>
              {membersLabel}
            </p>
          </div>

          <div className="flex flex-shrink-0 gap-2 sm:gap-3 flex-col sm:flex-row w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              disabled={isDeciding}
              className="
                w-full sm:w-auto rounded-lg font-semibold text-neutral-900
                bg-white min-h-[44px]
                transition-all duration-200 ease-out
                hover:bg-[#F97373]
                active:bg-[#FFD86A]
                active:scale-[0.99]
              "
              onClick={() => router.push(buildDecisionUrl("rejected"))}
            >
              {isDeciding ? "Memproses..." : "Tolak"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isDeciding}
              className="
                w-full sm:w-auto rounded-lg font-semibold text-neutral-900
                bg-white min-h-[44px]
                transition-all duration-200 ease-out
                hover:bg-[#C4F58C]
                active:bg-[#FFD86A]
                active:scale-[0.99]
              "
              onClick={() => router.push(buildDecisionUrl("accepted"))}
            >
              {isDeciding ? "Memproses..." : "Setuju"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getDecisionStatusLabel = (s) => {
    const normalized = String(s || "").toLowerCase();
    if (normalized === "accepted") return "Diterima";
    if (normalized === "rejected") return "Ditolak";
    if (normalized === "cancelled" || normalized === "canceled")
      return "Dibatalkan";
    return "Pending";
  };

  const getDecisionStatusClass = (s) => {
    const normalized = String(s || "").toLowerCase();
    if (normalized === "accepted") {
      return "bg-[#DCFCE7] text-[#166534]";
    }
    if (normalized === "rejected") {
      return "bg-[#FEE2E2] text-[#B91C1C]";
    }
    if (normalized === "cancelled" || normalized === "canceled") {
      return "bg-neutral-200 text-neutral-800";
    }
    return "bg-neutral-200 text-neutral-700";
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <Navbar />

      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#FF8730] to-[#FFB464] px-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10 lg:py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Request</h1>
              <p className="mt-2 text-sm sm:text-base text-neutral-50">
                Kelola pengajuan untuk melanjutkan capstone
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-12 py-8">

        <Tabs defaultValue="submit" className="w-full">
          <TabsList
            className="
            flex w-full items-center gap-1 sm:gap-2
            rounded-xl bg-[#F3F4F6]
            p-1
            border border-neutral-200
            overflow-x-auto overflow-y-hidden"
          >
            <TabsTrigger
              value="submit"
              className="
                flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold
                rounded-lg border-0
                bg-[#F3F4F6]
                text-neutral-700
                transition-all
                whitespace-nowrap
                data-[state=active]:bg-[#FFE196]
                data-[state=active]:text-neutral-900
                data-[state=active]:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
            >
              <span className="hidden sm:inline">Submit Request</span>
              <span className="sm:hidden">Submit</span>
            </TabsTrigger>
            <TabsTrigger
              value="my-request"
              className="
                flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold
                rounded-lg border-0
                bg-[#F3F4F6]
                text-neutral-700
                transition-all
                whitespace-nowrap
                data-[state=active]:bg-[#FFE196]
                data-[state=active]:text-neutral-900
                data-[state=active]:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
            >
              <span className="hidden sm:inline">My Request</span>
              <span className="sm:hidden">My</span>
            </TabsTrigger>
            {/* Only show Decision Inbox and History for users with project dapat_dilanjutkan or selesai */}
            {hasProjectDapatDilanjutkan && (
              <>
                <TabsTrigger
                  value="inbox"
                  className="
                    flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold
                    rounded-lg border-0
                    bg-[#F3F4F6]
                    text-neutral-700
                    transition-all
                    whitespace-nowrap
                    data-[state=active]:bg-[#FFE196]
                    data-[state=active]:text-neutral-900
                    data-[state=active]:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
                >
                  <span className="hidden sm:inline">Decision Inbox</span>
                  <span className="sm:hidden">Inbox</span>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="
                    flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold
                    rounded-lg border-0
                    bg-[#F3F4F6]
                    text-neutral-700
                    transition-all
                    whitespace-nowrap
                    data-[state=active]:bg-[#FFE196]
                    data-[state=active]:text-neutral-900
                    data-[state=active]:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
                >
                  Decision History
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <Card className="mt-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
            <TabsContent value="submit" className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold">Submit Request</h2>
              <p className="text-xs sm:text-sm text-neutral-600 mb-4 sm:mb-6">
                Pilih proyek yang ingin Anda lanjutkan.
              </p>

              {loadingProjects ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : availableProjects.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-xs sm:text-sm text-neutral-500">
                  Belum ada proyek yang dapat dilanjutkan.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {submitProjects.map((project) => renderProjectCard(project))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-request" className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-1">My Request</h2>
              <p className="text-xs sm:text-sm text-neutral-600 mb-4">
                Lihat dan pantau semua permintaan yang telah Anda ajukan.
              </p>

              {loadingRequests ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : myRequests.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-xs sm:text-sm text-neutral-500">
                  Belum ada request yang diajukan.
                </div>
              ) : (
                <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
                  <div
                    className="
                    grid grid-cols-12 gap-3
                    border-b border-neutral-200 bg-neutral-50
                    px-4 py-3
                    text-xs sm:text-sm font-semibold text-neutral-700
                    min-w-[640px]
                  "
                  >
                    <div className="col-span-5">Judul Capstone</div>
                    <div className="col-span-3">Nama Grup</div>
                    <div className="col-span-1">Tahun</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2 text-right">Aksi</div>
                  </div>

                  {myRequests.map((req) => renderMyRequestRow(req))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="inbox" className="p-4 sm:p-6">
              <h2 className="mb-1 text-base sm:text-lg font-semibold">Decision Inbox</h2>
              <p className="mb-4 text-xs sm:text-sm text-neutral-600">
                Tinjau dan beri keputusan permintaan melanjutkan proyek.
              </p>

              {loadingInbox ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
                </div>
              ) : inboxRequests.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-xs sm:text-sm text-neutral-500">
                  Tidak ada pengajuan yang menunggu keputusan.
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {inboxRequests.map((req) => renderInboxCard(req))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-1">Decision History</h2>
              <p className="text-xs sm:text-sm text-neutral-600 mb-4">
                Lihat riwayat keputusan yang Anda buat.
              </p>

              {loadingDecisionHistory ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : decisionHistory.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-xs sm:text-sm text-neutral-500">
                  Riwayat keputusan masih kosong.
                </div>
              ) : (
                <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
                  <div
                    className="
                    grid grid-cols-12 gap-3
                    border-b border-neutral-200 bg-neutral-50
                    px-4 py-3
                    text-xs sm:text-sm font-semibold text-neutral-700
                    min-w-[640px]
                  "
                  >
                    <div className="col-span-4">Judul Capstone</div>
                    <div className="col-span-2">Nama Grup</div>
                    <div className="col-span-1">Tahun</div>
                    <div className="col-span-2">Keputusan</div>
                    <div className="col-span-2">Tanggal Keputusan</div>
                    <div className="col-span-1 text-right">Aksi</div>
                  </div>

                  <div className="divide-y divide-neutral-100 min-w-[640px]">
                    {visibleDecisionHistory.map((item, idx) => {
                      const title =
                        item.capstoneTitle ||
                        item.request?.capstoneTitle ||
                        item.request?.capstone?.title ||
                        "Judul capstone";

                      const groupName =
                        item.groupName || item.request?.groupName || "-";

                      const year =
                        item.tahunPengajuan ||
                        item.request?.tahunPengajuan ||
                        "-";

                      const status =
                        item.status || item.decisionStatus || "pending";

                      const decidedDate = item.decidedAt
                        ? new Date(item.decidedAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "-";

                      return (
                        <div
                          key={item.id || item._id || idx}
                          className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-xs sm:text-sm text-neutral-800 hover:bg-neutral-50"
                        >
                          <div className="col-span-4 truncate pr-4">
                            {title}
                          </div>
                          <div className="col-span-2">{groupName}</div>
                          <div className="col-span-1">{year}</div>
                          <div className="col-span-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2 sm:px-3 py-0.5 text-xs font-medium ${getDecisionStatusClass(
                                status
                              )}`}
                            >
                              {getDecisionStatusLabel(status)}
                            </span>
                          </div>
                          <div className="col-span-2 text-neutral-700">
                            {decidedDate}
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="
                                flex items-center gap-1 rounded-full 
                                border border-neutral-300 
                                text-xs font-medium text-neutral-800 
                                bg-white
                                hover:bg-[#C4F58C]
                                active:bg-[#FFD86A]
                                active:scale-[0.99]
                                whitespace-nowrap
                              "
                              onClick={() => {
                                router.push(
                                  `/request/decision/edit?requestId=${
                                    item.id || item._id
                                  }&title=${encodeURIComponent(
                                    title
                                  )}&groupName=${encodeURIComponent(
                                    item.groupName || ""
                                  )}&year=${item.tahunPengajuan || ""}&status=${
                                    item.status || ""
                                  }&reason=${encodeURIComponent(
                                    item.reason || ""
                                  )}`
                                );
                              }}
                            >
                              <span className="hidden sm:inline">Ubah Keputusan</span>
                              <span className="sm:hidden">Ubah</span>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>
          </Card>
        </Tabs>

        {/* Modal konfirmasi batal request */}
        {cancelDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
              <div className="flex items-center justify-between border-b px-4 sm:px-6 py-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-semibold text-neutral-900">
                    Konfirmasi Membatalkan Request
                  </h3>
                </div>
                <button
                  type="button"
                  className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                  onClick={() => {
                    if (cancelling) return;
                    setCancelDialogOpen(false);
                    setRequestToCancel(null);
                    setCancelError("");
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-neutral-700">
                <p className="mb-2">
                  Apakah Anda yakin ingin membatalkan request ini?
                </p>
                {requestToCancel && (
                  <div className="rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
                    <div className="font-semibold text-neutral-900">
                      {requestToCancel.capstoneTitle ||
                        requestToCancel.capstone?.title ||
                        "Judul capstone"}
                    </div>
                  </div>
                )}

                {cancelError && (
                  <p className="mt-3 text-xs sm:text-sm text-red-600">{cancelError}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 border-t px-4 sm:px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={cancelling}
                  className="w-full sm:w-auto min-h-[44px]"
                  onClick={() => {
                    if (cancelling) return;
                    setCancelDialogOpen(false);
                    setRequestToCancel(null);
                    setCancelError("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto min-h-[44px]"
                  disabled={cancelling}
                  onClick={handleCancelRequest}
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Membatalkan...
                    </>
                  ) : (
                    "Batalkan Request"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function RequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <RequestPageContent />
    </Suspense>
  );
}
