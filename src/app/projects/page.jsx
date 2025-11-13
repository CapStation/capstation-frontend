"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import ProjectCard from "@/components/project/ProjectCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import projectService from "@/services/ProjectService";

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const result = await projectService.getMyProjects();
      if (result.success) {
        // Handle if data is object with projects array or direct array
        const projectsData = Array.isArray(result.data) 
          ? result.data 
          : result.data?.projects || result.data?.data || [];
        setProjects(projectsData);
      } else {
        // Fallback to mock data if API fails
        setProjects(generateMockProjects());
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      setProjects(generateMockProjects());
    } finally {
      setLoading(false);
    }
  };

  const generateMockProjects = () => {
    const titles = [
      "Sistem Monitoring Tekanan Darah Pasien Penyakit Jantung Berbasis IoT",
      "Sarang Tenggiri Untuk Finger Therapy Bagi Lansia Pasca Stroke Berbasis IoT",
      "Alat Pengolah Sampah Otomatis di SGLC Fakultas Teknik Berbasis IoT",
      "Aplikasi Monitoring Kadar Emisi Gas Buang Peda Kendaraan Pribadi",
    ];

    const statuses = ["Sedang Proses", "Disetujui", "Ditolak"];

    return Array.from({ length: 4 }, (_, i) => ({
      _id: `my-project-${i}`,
      title: titles[i % titles.length],
      author: user?.name || "User",
      createdAt: "2026-05-27T10:00:00Z",
      status: statuses[i % statuses.length],
      supervisor: "Dosen Pembimbing: Prof. Dr.Eng. I. F. Danung Wijaya, S.T., M.T., IPM.",
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Proyek Saya</h1>
            <p className="text-neutral-600 mt-2">
              Kelola semua proyek capstone yang Anda miliki
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Buat Proyek Baru
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Belum Ada Proyek
              </h3>
              <p className="text-neutral-600 mb-6">
                Anda belum memiliki proyek capstone. Mulai dengan membuat proyek baru.
              </p>
              <Link href="/projects/new">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Proyek Pertama
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project._id} href={`/projects/${project._id}`}>
                <ProjectCard project={project} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
