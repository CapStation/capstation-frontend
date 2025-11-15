"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ProjectCard from "@/components/project/ProjectCard";
import DashboardService from "@/services/DashboardService";
import ProjectService from "@/services/ProjectService";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const loadedRef = useRef(false);
  
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !loadedRef.current) {
      loadedRef.current = true;
      loadDashboardData();
    }
  }, [authLoading]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log('📊 Loading dashboard data...');
      console.log('🔑 Auth token:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
      console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('👤 User:', user ? 'Logged in' : 'Guest');
      
      // Hanya load data yang tidak memerlukan autentikasi
      const [statsResult, announcementsResult] = await Promise.all([
        DashboardService.getStats(),
        DashboardService.getRecentAnnouncements(5),
      ]);

      console.log('📈 Stats result:', statsResult);
      console.log('📢 Announcements result:', announcementsResult);

      if (statsResult.success) {
        setStats(statsResult.data);
      }

      if (announcementsResult.success) {
        setAnnouncements(announcementsResult.data);
      }
      
      // Hanya load my projects jika user sudah login
      if (user) {
        const projectsResult = await ProjectService.getMyProjects();
        console.log('📁 Projects result:', projectsResult);
        
        if (projectsResult.success && Array.isArray(projectsResult.data)) {
          console.log('✅ Using API projects:', projectsResult.data.length, 'projects');
          setMyProjects(projectsResult.data);
        } else {
          console.log('⚠️ API failed, using mock data');
          setMyProjects(generateMockProjects(6, "my"));
        }
      } else {
        // Guest user - tampilkan mock projects atau kosong
        console.log('👤 Guest user - showing empty projects');
        setMyProjects([]);
      }
    } catch (error) {
      console.error("❌ Failed to load dashboard data:", error);
      // Fallback to empty projects on error for guest
      if (!user) {
        setMyProjects([]);
      } else {
        setMyProjects(generateMockProjects(6, "my"));
      }
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
      author: type === "my" ? (user?.name || "User") : "Azka rio Rizky Pratama, ST, M.Eng., Ph.D",
      createdAt: type === "new" ? "2026-06-01T10:00:00Z" : type === "my" ? "2026-05-27T10:00:00Z" : "2025-08-10T10:00:00Z",
      status: statuses[Math.floor(Math.random() * statuses.length)],
      supervisor: "Dosen Pembimbing: Prof. Dr.Eng. I. F. Danung Wijaya, S.T., M.T., IPM.",
    }));
  };

  if (authLoading) {
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
      <div className="bg-gradient-to-r from-primary via-secondary to-accent">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Dashboard Capstone</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Total Proyek Capstone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-1">28</div>
              <p className="text-xs text-neutral-500">Proyek keseluruhan</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Proyek Tersedia Untuk Dilanjutkan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-1">10</div>
              <p className="text-xs text-neutral-500">Proyek dapat dilanjut</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Jumlah Tim Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-1">14</div>
              <p className="text-xs text-neutral-500">Tim Capstone</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Pengumuman Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-1">4</div>
              <p className="text-xs text-neutral-500">Belum dibaca</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Jumlah Proyek per Kategori</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className={`h-2 rounded-full bg-primary`} style={{ width: `54%` }}></div>
                <span className="text-neutral-600 whitespace-nowrap">Kesehatan - 18</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className={`h-2 rounded-full bg-secondary`} style={{ width: `48%` }}></div>
                <span className="text-neutral-600 whitespace-nowrap">IoT - 16</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className={`h-2 rounded-full bg-accent`} style={{ width: `45%` }}></div>
                <span className="text-neutral-600 whitespace-nowrap">Pengolahan Sampah - 15</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proyek Saya */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Proyek Saya</h2>
            <p className="text-neutral-600">Daftar proyek capstone yang Anda miliki / ikuti.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.map((project) => (
              <Link key={project._id} href={`/projects/${project._id}`}>
                <ProjectCard project={project} />
              </Link>
            ))}
          </div>
        </section>

        {/* Announcements */}
        <Card className="mb-8">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardTitle className="text-primary">Pengumuman Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="border-b border-neutral-200 pb-4">
              <h3 className="font-semibold text-neutral-900 mb-2">Jadwal Bimbingan Capstone 2026</h3>
              <p className="text-sm text-neutral-600 mb-2">Yth. Mahasiswa DTETI UGM Angkatan 2023. Diberitahukan bahwa bimbingan Capstone sudah bisa dilaksanakan mulai tanggal 15 Maret - 15 September 2026. Masing-masing...</p>
              <p className="text-xs text-neutral-500">Diupload: 10 Januari 2026</p>
            </div>
            <div className="border-b border-neutral-200 pb-4">
              <h3 className="font-semibold text-neutral-900 mb-2">Jadwal Bimbingan Capstone 2026</h3>
              <p className="text-sm text-neutral-600 mb-2">Yth. Mahasiswa DTETI UGM Angkatan 2023. Diberitahukan bahwa bimbingan Capstone sudah bisa dilaksanakan mulai tanggal 15 Maret - 15 September 2026. Masing-masing...</p>
              <p className="text-xs text-neutral-500">Diupload: 10 Januari 2026</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 bg-gradient-to-r from-primary via-secondary to-accent rounded-lg px-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">About Us</h2>
            <p className="text-neutral-700 leading-relaxed"><strong>Selamat datang, Warga DTETI!</strong><br />CapStation merupakan platform untuk mengelola seluruh project Capstone yang diselenggarakan oleh Departemen Teknik Elektro dan Teknologi Informasi (DTETI) UGM.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Contact</h2>
            <div className="space-y-2 text-neutral-700">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6z"></path></svg>
                <p>Kompleks Fakultas Teknik UGM, Jl. Grafika No.2, Yogyakarta...</p>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8"></path></svg>
                <p>(0274)552305</p>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                <p>teti@ugm.ac.id</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
