"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import ProjectCard from "@/components/project/ProjectCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProjectService from "@/services/ProjectService";
import { Loader2 } from "lucide-react";

export default function BrowseCapstonesPage() {
  const [newProjects, setNewProjects] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      // Get all projects
      const result = await ProjectService.getAllProjects();
      
      if (result.success && Array.isArray(result.data)) {
        const projects = result.data;
        
        // Sort by date to get newest projects
        const sortedByDate = [...projects].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNewProjects(sortedByDate.slice(0, 8));
        
        // Filter available projects (status active or pending)
        const available = projects.filter(p => 
          p.status === 'active' && (p.capstoneStatus === 'pending' || p.capstoneStatus === 'accepted')
        );
        setAvailableProjects(available.slice(0, 12));
      } else {
        // Fallback to mock data
        setNewProjects(generateMockProjects(8, "new"));
        setAvailableProjects(generateMockProjects(12, "available"));
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      // Fallback to mock data
      setNewProjects(generateMockProjects(8, "new"));
      setAvailableProjects(generateMockProjects(12, "available"));
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
      "Pengembangan Aplikasi Mobile untuk Edukasi Gizi Seimbang pada Ibu Hamil",
      "Smart City Dashboard untuk Monitoring Lingkungan Area Malioboro",
    ];

    const statuses = ["Tersedia", "Tidak Tersedia"];

    return Array.from({ length: count }, (_, i) => ({
      _id: `browse-${type}-${i}`,
      title: titles[i % titles.length],
      author: "Dosen Penanggung Jawab",
      createdAt: type === "new" ? "2026-06-01T10:00:00Z" : "2025-08-10T10:00:00Z",
      status: statuses[Math.floor(Math.random() * statuses.length)],
      supervisor: "Dosen Pembimbing: Prof. ...",
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Browse Capstones</h1>
          <p className="text-neutral-600">Temukan proyek terbaru dan yang tersedia untuk dilanjutkan.</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Proyek Terbaru</h2>
                <p className="text-sm text-neutral-500">Diperbarui baru-baru ini</p>
              </div>
              {newProjects.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-neutral-500">Belum ada proyek terbaru</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newProjects.map((p) => (
                    <Link key={p._id} href={`/projects/${p._id}`}>
                      <ProjectCard project={p} />
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Proyek Tersedia</h2>
                <p className="text-sm text-neutral-500">Proyek yang dapat diambil / dilanjutkan</p>
              </div>
              {availableProjects.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-neutral-500">Tidak ada proyek yang tersedia saat ini</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableProjects.map((p) => (
                    <Link key={p._id} href={`/projects/${p._id}`}>
                      <ProjectCard project={p} />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
