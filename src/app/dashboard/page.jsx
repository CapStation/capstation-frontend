"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ProjectCard from "@/components/project/ProjectCard";
import DashboardService from "@/services/DashboardService";
import ProjectService from "@/services/ProjectService";
import { Folder, FolderPen, Users, Bell } from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalProjects, setTotalProjects] = useState(0);
  const [waitingApproval, setWaitingApproval] = useState(0);
  const [ongoingProjects, setOngoingProjects] = useState(0);
  const [closedProjects, setClosedProjects] = useState(0);
  const [perCategory, setPerCategory] = useState([]);
  const [availableProjects, setAvailableProjects] = useState(0);
  const [groupsPerCategory, setGroupsPerCategory] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatThemeName = (theme) => {
    const themeNames = {
      kesehatan: "Kesehatan",
      pengelolaan_sampah: "Pengelolaan Sampah",
      smart_city: "Smart City",
      transportasi_ramah_lingkungan: "Transportasi Ramah Lingkungan",
    };
    return themeNames[theme] || theme;
  };

  const getThemeColor = (index) => {
    const colors = ["bg-primary", "bg-secondary", "bg-accent", "bg-orange-500"];
    return colors[index % colors.length];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Kalau belum login → lempar ke /login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load data dashboard (stats dari service + projek saya)
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Hit endpoint khusus dashboard backend
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setProjectsLoading(true);
        const response = await fetch(
          "https://capstation-backend.vercel.app/api/dashboard/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        setTotalProjects(data.totalProjects);
        setWaitingApproval(data.waitingApproval);
        setOngoingProjects(data.ongoingProjects);
        setClosedProjects(data.closedProjects);
        setPerCategory(data.perCategory);
        setGroupsPerCategory(data.groupsPerCategory);
        setAnnouncements(data.announcements || []);

        const available =
          data.totalProjects - data.closedProjects - data.ongoingProjects;
        setAvailableProjects(available);
      } catch (err) {
        setError(err.message);
      } finally {
        setProjectsLoading(false);
      }
    };

    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log("📊 Loading dashboard data...");
      console.log(
        "🔑 Auth token:",
        localStorage.getItem("accessToken") ? "Present" : "Missing"
      );
      console.log("🌐 API URL:", process.env.NEXT_PUBLIC_API_URL);

      const [statsResult, announcementsResult, projectsResult] =
        await Promise.all([
          DashboardService.getStats(),
          DashboardService.getRecentAnnouncements(5),
          ProjectService.getMyProjects(),
        ]);

      console.log("📈 Stats result:", statsResult);
      console.log("📢 Announcements result:", announcementsResult);
      console.log("📁 Projects result:", projectsResult);

      if (statsResult.success) {
        setStats(statsResult.data);
      }

      if (announcementsResult.success) {
        setAnnouncements(announcementsResult.data);
      }

      if (projectsResult.success && Array.isArray(projectsResult.data)) {
        console.log(
          "✅ Using API projects:",
          projectsResult.data.length,
          "projects"
        );
        setMyProjects(projectsResult.data);
      } else {
        console.log("⚠️ API failed, using mock data");
        setMyProjects(generateMockProjects(6, "my"));
      }
    } catch (error) {
      console.error("❌ Failed to load dashboard data:", error);
      setMyProjects(generateMockProjects(6, "my"));
    } finally {
      setLoading(false);
    }
  };

  const generateMockProjects = (count, type) => {
    const titles = [
      "Sistem Monitoring Tekanan Darah Pasien Penyakit Jantung Berbasis IoT",
      "Sarang Tenggiri Untuk Finger Therapy Bagi Lansia Pasca Stroke Berbasis IoT",
      "Alat Pengolah Sampah Otomatis di SGLC Fakultas Teknik Berbasis IoT",
      "Aplikasi Monitoring Kadar Emisi Gas Buang Peda Kendaraan Pribadi",
      "Sistem Peniruan Tahsinsan Otomatis Berbasis IoT Pada Ketua Sidoarjo",
      "Artifisial Monitoring Kadar Emisi Beracun Pada Pabrik Tekstil",
      "Pengembangan Aplikasi Mobile untuk Edukasi Gizi Seimbang pada Ibu Hamil",
      "Smart City Dashboard untuk Monitoring Lingkungan Area Malioboro",
    ];

    const statuses = ["Sedang Proses", "Disetujui"];

    return Array.from({ length: count }, (_, i) => ({
      _id: `project-${type}-${i}`,
      title: titles[i % titles.length],
      author:
        type === "my"
          ? user?.name || "User"
          : "Azka rio Rizky Pratama, ST, M.Eng., Ph.D",
      createdAt:
        type === "new"
          ? "2026-06-01T10:00:00Z"
          : type === "my"
          ? "2026-05-27T10:00:00Z"
          : "2025-08-10T10:00:00Z",
      status: statuses[Math.floor(Math.random() * statuses.length)],
      supervisor:
        "Dosen Pembimbing: Prof. Dr.Eng. I. F. Danung Wijaya, S.T., M.T., IPM.",
    }));
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary px-4 py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white pb-5">
            Dashboard Capstone
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10">
        {/* Stats */}
        <div
          className="
          grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]
          md:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]
          gap-4 mb-8 items-stretch
        "
        >
          <Card className="my-auto text-left overflow-hidden h-full">
            <Link href="/projects">
              <CardContent className="flex items-center justify-between p-4 gap-2 cursor-pointer group">
                <div>
                  <CardTitle className="text-sm md:text-lg font-medium text-neutral-600 mb-2">
                    Total Proyek Capstone
                  </CardTitle>
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-1">
                    {loading ? "..." : error ? "—" : totalProjects}
                  </div>
                  <p className="text-xs md:text-sm text-neutral-500">
                    {error ? "Gagal memuat data" : "Proyek keseluruhan"}
                  </p>
                </div>

                <div>
                  <div className="self-stretch pl-5 pr-4 pt-10 pb-2 relative inline-flex flex-col justify-end items-end">
                    <div className="w-80 h-80 left-[-35px] top-[-30px] absolute bg-orange-400 rounded-full transition-all duration-300 group-hover:bg-secondary group-hover:scale-105" />
                    <Folder className="w-16 h-16 text-white relative transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="my-auto text-left overflow-hidden h-full">
            <Link href="/projects">
              <CardContent className="flex items-center justify-between p-4 gap-2 cursor-pointer group ">
                <div>
                  <CardTitle className="text-sm md:text-lg font-medium text-neutral-600 mb-2">
                    Proyek Dapat Dilanjutkan
                  </CardTitle>
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-1">
                    {projectsLoading ? "..." : error ? "—" : availableProjects}
                  </div>
                  <p className="text-xs md:text-sm text-neutral-500">
                    Proyek dapat dilanjut
                  </p>
                </div>

                <div>
                  <div className="self-stretch pl-5 pr-4 pt-10 pb-2 relative inline-flex flex-col justify-end items-end">
                    <div className="w-80 h-80 left-[-35px] top-[-30px] absolute bg-orange-400 rounded-full transition-all duration-300 group-hover:bg-secondary group-hover:scale-105" />
                    <FolderPen className="w-16 h-16 text-white relative transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="my-auto text-left overflow-hidden h-full">
            <Link href="/group">
              <CardContent className="flex items-center justify-between p-4 gap-2 cursor-pointer group">
                <div>
                  <CardTitle className="text-sm md:text-lg font-medium text-neutral-600 mb-2">
                    Jumlah Tim Aktif
                  </CardTitle>
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-1">
                    {projectsLoading ? "..." : error ? "—" : ongoingProjects}
                  </div>
                  <p className="text-xs md:text-sm text-neutral-500">
                    Tim Capstone
                  </p>
                </div>

                <div>
                  <div className="self-stretch pl-5 pr-4 pt-10 pb-2 relative inline-flex flex-col justify-end items-end">
                    <div className="w-80 h-80 left-[-35px] top-[-30px] absolute bg-orange-400 rounded-full transition-all duration-300 group-hover:bg-secondary group-hover:scale-105" />
                    <Users className="w-16 h-16 text-white relative transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-lg font-medium text-neutral-600">
                Jumlah Proyek per Kategori
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {projectsLoading ? (
                <div className="text-center text-sm text-neutral-500">
                  Loading...
                </div>
              ) : error ? (
                <div className="text-center text-sm text-red-500">
                  Failed to load
                </div>
              ) : perCategory.length > 0 ? (
                perCategory.map((category, index) => {
                  const percentage =
                    totalProjects > 0
                      ? ((category.count / totalProjects) * 100).toFixed(0)
                      : 0;

                  return (
                    <div
                      key={category._id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className={`h-2 rounded-full ${getThemeColor(index)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                      <span className="text-neutral-600 whitespace-nowrap">
                        {formatThemeName(category._id)} - {category.count}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-sm text-neutral-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        <Card className="mb-8">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardTitle className="text-primary">
              <Bell className="inline-block w-6 h-6 mr-2 mb-1" />
              Pengumuman Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pt-3 pb-2 space-y-4">
            {projectsLoading ? (
              <div className="text-center text-sm text-neutral-500">
                Loading...
              </div>
            ) : error ? (
              <div className="text-center text-sm text-red-500">
                Failed to load announcements
              </div>
            ) : announcements.length > 0 ? (
              announcements.slice(0, 4).map((announcement, index) => (
                <div
                  key={announcement._id}
                  className={`pb-4 ${
                    index !== announcements.slice(0, 4).length - 1
                      ? "border-b border-neutral-200"
                      : ""
                  }`}
                >
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {announcement.title}
                  </h3>
                  <p className="text-md text-neutral-600 mb-2">
                    {announcement.content.length > 700
                      ? `${announcement.content.substring(0, 700)}...`
                      : announcement.content}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Diupload: {formatDate(announcement.createdAt)}
                    {announcement.createdBy?.name &&
                      ` oleh ${announcement.createdBy.name}`}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-neutral-500">
                Belum ada pengumuman
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-center border-t pt-4 pb-3">
            <Link
              href="/announcements"
              className="text-primary hover:text-primary/80 font-medium text-md transition-colors flex items-center gap-2"
            >
              Lihat pengumuman lainnya
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 bg-gradient-to-r from-primary via-secondary to-accent rounded-lg px-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              About Us
            </h2>
            <p className="text-neutral-700 leading-relaxed">
              <strong>Selamat datang, Warga DTETI!</strong>
              <br />
              CapStation merupakan platform untuk mengelola seluruh project
              Capstone yang diselenggarakan oleh Departemen Teknik Elektro dan
              Teknologi Informasi (DTETI) UGM.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Contact
            </h2>
            <div className="space-y-2 text-neutral-700">
              <div className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 mt-0.5 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6z"></path>
                </svg>
                <p>
                  Kompleks Fakultas Teknik UGM, Jl. Grafika No.2, Yogyakarta...
                </p>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8"></path>
                </svg>
                <p>(0274)552305</p>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                <p>teti@ugm.ac.id</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
