"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import UserService from "@/services/UserService";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
  History
} from "lucide-react";

const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

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

const getStatusLabel = (status) => {
  if (!status) return "Pending";
  const lower = status.toLowerCase();

  if (lower === "accepted") return "Accepted";
  if (lower === "rejected") return "Rejected";
  if (lower === "cancelled" || lower === "canceled") return "Cancelled";
  return "Pending";
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


export default function RequestPage() {
  const [availableProjects, setAvailableProjects] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  // capstone yang sudah pernah diajukan oleh user ini
const requestedCapstoneIds = new Set(
  myRequests
    .filter((req) => {
      const status = String(req.status || "").toLowerCase();
      // yang dianggap "sudah diajukan" misalnya pending atau accepted
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
  const searchParams = useSearchParams();
const [loadingInbox, setLoadingInbox] = useState(true);
const [decidingId, setDecidingId] = useState(null);

  const [decisionHistory, setDecisionHistory] = useState([]);
  // hanya tampilkan keputusan yang benar benar diputuskan
// tidak termasuk cancelled
const visibleDecisionHistory = decisionHistory.filter((item) => {
  const status = String(item.status || "").toLowerCase();
  return status === "accepted" || status === "rejected";
});

  const [loadingDecisionHistory, setLoadingDecisionHistory] = useState(true);
  const router = useRouter();


  useEffect(() => {
    loadProjects();
    loadMyRequests();
    loadInbox();
    loadDecisionHistory();
  }, []);

  const loadProjects = async () => {
  setLoadingProjects(true);
  try {
    const result = await ProjectService.getAllProjects();

    if (result.success && Array.isArray(result.data)) {
      const projects = result.data;

      const candidates = projects.filter(
        (p) => p.status === "dapat_dilanjutkan"
      );

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
    // ambil request + semua project
    const [reqResult, projectResult] = await Promise.all([
      RequestService.getMyRequests(),
      ProjectService.getAllProjects(),
    ]);

    if (reqResult.success && Array.isArray(reqResult.data)) {
      let requests = reqResult.data;

      if (projectResult.success && Array.isArray(projectResult.data)) {
        // buat map capstoneId -> title
        const projectMap = new Map();
        projectResult.data.forEach((p) => {
          const id = String(p._id);
          const title = p.title || p.judul || "Judul capstone";
          projectMap.set(id, title);
        });

        // selipkan capstoneTitle ke tiap request
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
  if (s === "accepted")
    return "bg-[#BBF7D0] text-[#166534]"; // hijau muda
  if (s === "rejected")
    return "bg-[#FECACA] text-[#991B1B]"; // merah muda
  if (s === "cancelled" || s === "canceled")
    return "bg-neutral-900 text-white"; // hitam
  // pending / default
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
    // ambil inbox + semua project sekaligus
    const [inboxResult, projectResult] = await Promise.all([
      RequestService.getOwnerInbox(),
      ProjectService.getAllProjects(),
    ]);

    let list = [];

    if (inboxResult.success && inboxResult.data) {
      const raw = inboxResult.data;
      list = Array.isArray(raw) ? raw : raw.data || [];
    }

    if (list.length === 0) {
      setInboxRequests([]);
      return;
    }

    // kalau berhasil ambil project, buat map capstoneId -> title
    if (projectResult.success && Array.isArray(projectResult.data)) {
      const projectMap = new Map();

      projectResult.data.forEach((p) => {
        const id = String(p._id || p.id || "");
        const title = p.title || p.judul || "Judul capstone";
        projectMap.set(id, title);
      });

      list = list.map((req) => {
        const capId = String(
          req.capstoneId ||
            req.capstone?.id ||
            req.capstone?._id ||
            ""
        );

        const capstoneTitle =
          req.capstoneTitle || projectMap.get(capId) || "Judul capstone";

        return { ...req, capstoneTitle };
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

// klik tombol Accept atau Reject di inbox
const handleDecision = (requestId, action) => {
  // buat debug dulu
  console.log("klik decision", requestId, action);

  router.push(
    `/request/decision?requestId=${requestId}&action=${action}`
  );
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

    // ambil id capstone unik
    const capstoneIds = [
      ...new Set(
        rawItems
          .map((item) => item.capstoneId || item.capstone?.id || item.capstone?._id)
          .filter(Boolean)
      ),
    ];

    const capstoneMap = {};

    // fetch detail project untuk setiap capstoneId
    await Promise.all(
      capstoneIds.map(async (id) => {
        try {
          const res = await ProjectService.getProjectById(id);
          if (res.success && res.data) {
            capstoneMap[id] = res.data;
          }
        } catch (err) {
          console.error("Failed to load project for decision history:", id, err);
        }
      })
    );

    // gabungkan judul ke item history
    const withTitles = rawItems.map((item) => {
      const cid = item.capstoneId || item.capstone?.id || item.capstone?._id;
      const capstone = cid ? capstoneMap[cid] : item.capstone;

      return {
        ...item,
        capstoneTitle:
          item.capstoneTitle ||
          capstone?.title ||
          "Judul capstone",
      };
    });

    // urutkan dari terbaru
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


  // kartu proyek di tab Submit Request
const renderProjectCard = (project) => {
  const title =
    project.title ||
    "Smart City Dashboard untuk Monitoring Lingkungan Area Malioboro";

  const titleLength = title.length;

  let titleSizeClass = "text-lg";
  if (titleLength > 60 && titleLength <= 100) {
    titleSizeClass = "text-base";
  } else if (titleLength > 100) {
    titleSizeClass = "text-sm";
  }

  const categoryLabel = getThemeLabel(
    project.tema || project.category?.name || project.category
  );

  const yearLabel =
    project.academicYear ||
    (project.startedAt
      ? new Date(project.startedAt).getFullYear()
      : project.createdAt
      ? new Date(project.createdAt).getFullYear()
      : "2024");

  const ownerLabel = project.ownerName || "Pemilik Proyek";

  return (
    <Card
      key={project._id}
      className="
        flex h-full min-h-[220px] flex-col
        rounded-2xl border border-neutral-200 bg-white
        shadow-sm
        transition-all duration-200 ease-out
        hover:-translate-y-1 hover:shadow-md
      "
    >
      <CardContent className="flex flex-1 flex-col justify-between px-6 pt-6 pb-6">
        <div className="space-y-3">
          <div className="min-h-[48px]">
            <h3
              className={`${titleSizeClass} font-semibold leading-tight`}
            >
              {title}
            </h3>
          </div>

          <Badge
            variant="outline"
            className="mt-1 rounded-full px-3 py-1 text-xs font-medium"
          >
            {categoryLabel}
          </Badge>
          <div className="mt-3 space-y-1 text-sm text-neutral-700">
            <p>
              <span className="font-semibold text-neutral-800">Pemilik: </span>
              {ownerLabel}
            </p>
            <p>
              <span className="font-semibold text-neutral-800">Tahun: </span>
              {yearLabel}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Button
            asChild
            className="
              w-full rounded-lg font-semibold text-neutral-900
              bg-[#C4F58C]
              transition-all duration-200 ease-out
              hover:bg-[#FFD86A]
              active:bg-[#FFD86A]
              active:scale-[0.99]
            "
          >
            <Link href={`/request/new?projectId=${project._id}`}>
              Detail
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const handleCancelRequest = async (req) => {
  const id = req.id || req._id;
  const title =
    req.capstoneTitle ||
    req.capstone?.title ||
    req.capstone?.judul ||
    req.title ||
    "Judul capstone";

  const ok = window.confirm(
    `Yakin ingin membatalkan request untuk "${title}"?`
  );
  if (!ok) return;

  try {
    const res = await RequestService.cancel(id);

    if (res?.success) {
      // reload daftar My Request supaya status berubah jadi Cancelled
      await loadMyRequests();
    } else {
      console.error("Cancel gagal:", res);
      alert("Gagal membatalkan request.");
    }
  } catch (err) {
    console.error("Error cancel request:", err);
    alert("Terjadi kesalahan saat membatalkan request.");
  }
};

  // baris di My Request
const renderMyRequestRow = (req) => {
  const title =
    req.capstoneTitle ||
    req.capstone?.title ||
    req.capstone?.judul ||
    req.title ||
    "Judul capstone";

  const group = req.groupName || "-";

  const year =
    req.tahunPengajuan ||
    req.capstone?.academicYear ||
    "-";

  const statusLabel = getStatusLabel(req.status);
  const statusClass = getStatusClass(req.status);

  // hanya pending yang bisa dibatalkan
  const isPending = String(req.status || "").toLowerCase() === "pending";

  const id = req.id || req._id;
  const capstoneId = req.capstoneId;

  return (
    <div
      key={id}
      className="grid grid-cols-12 items-center gap-3 border-b border-neutral-200 px-4 py-3 text-sm"
    >
      <div className="col-span-5 truncate font-medium text-neutral-900">
        {title}
      </div>
      <div className="col-span-3 text-neutral-700">{group}</div>
      <div className="col-span-1 text-neutral-700">{year}</div>
      <div className="col-span-1">
        <span
          className={`inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-medium ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="col-span-2 flex justify-end">
        <div className="flex items-center gap-3">
          {/* tombol Lihat Riwayat */}
          <Button
            variant="outline"
            size="sm"
            className="
  flex items-center gap-1 rounded-full 
  border border-neutral-300 
  text-xs font-medium text-neutral-800 
  bg-white
  hover:bg-neutral-100
  hover:border-neutral-300
  hover:text-neutral-900
  active:bg-neutral-200
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
            <span>Lihat Riwayat</span>
          </Button>

          {/* tombol X Batalkan. hanya muncul kalau pending
{isPending && (
  <button
    type="button"
    onClick={() => handleCancelRequest(req)}
    className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
  >
    X
  </button>
)} */}

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
    (req.createdAt
      ? new Date(req.createdAt).getFullYear()
      : "-");

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
      className="rounded-2xl border border-neutral-200 shadow-sm"
    >
      <CardContent className="flex flex-col justify-between gap-4 px-6 py-5 md:flex-row md:items-center">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-neutral-900">
            {projectTitle}
          </h3>
          <p className="text-sm text-neutral-700">
            <span className="font-semibold">Nama Grup: </span>
            {groupName}
          </p>
          <p className="text-sm text-neutral-700">
            <span className="font-semibold">Tahun: </span>
            {tahun}
          </p>
        </div>

        <div className="flex flex-shrink-0 gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isDeciding}
            className="min-w-[96px] rounded-lg border border-[#F97373] bg-white text-sm font-semibold text-[#F97373] hover:bg-[#FFF5F5]"
            onClick={() => router.push(buildDecisionUrl("rejected"))}
          >
            {isDeciding ? "Memproses..." : "Reject"}
          </Button>

          <Button
            type="button"
            disabled={isDeciding}
            className="min-w-[96px] rounded-lg bg-[#BBF7D0] text-sm font-semibold text-neutral-900 hover:bg-[#86EFAC]"
            onClick={() => router.push(buildDecisionUrl("accepted"))}
          >
            {isDeciding ? "Memproses..." : "Accept"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

  return (
    <div className="min-h-screen bg-[#EEF3F7]">
      <Navbar />

      <main className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-neutral-900">Request</h1>
        <p className="text-neutral-600 mb-6">
          Kelola pengajuan untuk melanjutkan capstone.
        </p>

        {/* bar tab atas (kuning seperti di Figma) */}
        <Tabs defaultValue="submit" className="w-full">
          <TabsList className="
            flex w-full items-center gap-2
            rounded-xl bg-[#F3F4F6]
            p-1
            border border-neutral-200">
            <TabsTrigger
              value="submit"
              className="
                flex-1 px-4 py-2 text-sm font-semibold
                rounded-lg border-0
                bg-[#F3F4F6]
                text-neutral-700
                transition-all
                data-[state=active]:bg-[#FFE196]
                data-[state=active]:text-neutral-900
                data-[state=active]:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
            >
              Submit Request
            </TabsTrigger>
            <TabsTrigger
              value="my-request"
              className="
                flex-1 px-4 py-2 text-sm font-semibold
                rounded-lg border-0
                bg-[#F3F4F6]
                text-neutral-700
                transition-all
                data-[state=active]:bg-[#FFE196]
                data-[state=active]:text-neutral-900
                data-[state=active]:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
            >
              My Request
            </TabsTrigger>
            <TabsTrigger
              value="inbox"
              className="
                flex-1 px-4 py-2 text-sm font-semibold
                rounded-lg border-0
                bg-[#F3F4F6]
                text-neutral-700
                transition-all
                data-[state=active]:bg-[#FFE196]
                data-[state=active]:text-neutral-900
                data-[state=active]:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
            >
              Decision Inbox
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="
                flex-1 px-4 py-2 text-sm font-semibold
                rounded-lg border-0
                bg-[#F3F4F6]
                text-neutral-700
                transition-all
                data-[state=active]:bg-[#FFE196]
                data-[state=active]:text-neutral-900
                data-[state=active]:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
            >
              Decision History
            </TabsTrigger>
          </TabsList>

          {/* card besar di bawah tab */}
          <Card className="mt-4 rounded-xl border border-neutral-200 bg-white shadow-sm">

            {/* TAB Submit Request */}
            <TabsContent value="submit" className="p-6">
              <h2 className="text-lg font-semibold">Submit Request</h2>
              <p className="text-sm text-neutral-600 mb-6">
                Pilih proyek yang ingin Anda lanjutkan.
              </p>

              {loadingProjects ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : availableProjects.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-sm text-neutral-500">
                  Belum ada proyek yang dapat dilanjutkan.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {submitProjects.map((project) =>
                    renderProjectCard(project)
                  )}
                </div>
              )}
            </TabsContent>

            {/* TAB My Request */}
            <TabsContent value="my-request" className="p-6">
              <h2 className="text-lg font-semibold mb-1">My Request</h2>
              <p className="text-sm text-neutral-600 mb-4">
                Lihat dan pantau semua permintaan yang telah Anda ajukan.
              </p>

              {loadingRequests ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : myRequests.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-sm text-neutral-500">
                  Belum ada request yang diajukan.
                </div>
              ) : (
                <div className="rounded-xl border border-neutral-200 bg-white">
                  <div className="
                    grid grid-cols-12 gap-3
                    border-b border-neutral-200 bg-neutral-50
                    px-4 py-3
                    text-sm font-semibold text-neutral-700
                  ">
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

{/* TAB Decision Inbox */}
<TabsContent value="inbox" className="p-6">
  <h2 className="mb-1 text-lg font-semibold">Decision Inbox</h2>
  <p className="mb-4 text-sm text-neutral-600">
    Tinjau dan beri keputusan permintaan melanjutkan proyek.
  </p>

  {loadingInbox ? (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
    </div>
  ) : inboxRequests.length === 0 ? (
    <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-sm text-neutral-500">
      Tidak ada pengajuan yang menunggu keputusan.
    </div>
  ) : (
    <div className="space-y-4">
      {inboxRequests.map((req) => renderInboxCard(req))}
    </div>
  )}
</TabsContent>

          {/* TAB Decision History */}
<TabsContent value="history" className="p-6">
  <h2 className="text-lg font-semibold mb-1">Decision History</h2>
  <p className="text-sm text-neutral-600 mb-4">
    Lihat riwayat keputusan yang Anda buat.
  </p>

  {loadingDecisionHistory ? (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  ) : decisionHistory.length === 0 ? (
    <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-sm text-neutral-500">
      Riwayat keputusan masih kosong.
    </div>
  ) : (
<div className="rounded-xl border border-neutral-200 bg-white">
                  <div className="
                    grid grid-cols-12 gap-3
                    border-b border-neutral-200 bg-neutral-50
                    px-4 py-3
                    text-sm font-semibold text-neutral-700
                  ">
        <div className="col-span-4">Judul Capstone</div>
        <div className="col-span-2">Nama Grup</div>
        <div className="col-span-1">Tahun</div>
        <div className="col-span-2">Keputusan</div>
        <div className="col-span-2">Tanggal Keputusan</div>
        <div className="col-span-1 text-right">Aksi</div>
      </div>

      <div className="divide-y divide-neutral-100">
        {visibleDecisionHistory.map((item, idx) => {
          const title =
            item.capstoneTitle ||
            item.request?.capstoneTitle ||
            item.request?.capstone?.title ||
            "Judul capstone";

          const groupName =
            item.groupName ||
            item.request?.groupName ||
            "-";

          const year =
            item.tahunPengajuan ||
            item.request?.tahunPengajuan ||
            "-";

          const status = item.status || item.decisionStatus || "pending";

          const decidedDate = item.decidedAt
            ? new Date(item.decidedAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "-";

          const getDecisionStatusLabel = (s) => {
            const normalized = String(s || "").toLowerCase();
            if (normalized === "accepted") return "Accepted";
            if (normalized === "rejected") return "Rejected";
            if (normalized === "cancelled" || normalized === "canceled")
              return "Cancelled";
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
            <div
              key={item.id || item._id || idx}
              className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm text-neutral-800 hover:bg-neutral-50"
            >
              <div className="col-span-4 truncate pr-4">{title}</div>
              <div className="col-span-2">{groupName}</div>
              <div className="col-span-1">{year}</div>
              <div className="col-span-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ${getDecisionStatusClass(
                    status
                  )}`}
                >
                  {getDecisionStatusLabel(status)}
                </span>
              </div>
              <div className="col-span-2 text-neutral-700">{decidedDate}</div>
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
                    hover:bg-neutral-100
                    hover:border-neutral-300
                    hover:text-neutral-900
                    active:bg-neutral-200
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
              }&reason=${encodeURIComponent(item.reason || "")}`
            );
                  }}
                >
                  Ubah Keputusan
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
      </main>
    </div>
  );
}
