"use client";

import { useEffect, useState } from "react";
import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Calendar, User, Users, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import projectService from "@/services/ProjectService";

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [myProject, setMyProject] = useState(null);
  const [requestHistory, setRequestHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadProjectData();
    }
  }, [user]);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      // Get user's main project
      const result = await projectService.getMyProjects();
      if (result.success) {
        const projectsData = Array.isArray(result.data) 
          ? result.data 
          : result.data?.projects || result.data?.data || [];
        
        // User hanya punya 1 proyek utama
        setMyProject(projectsData.length > 0 ? projectsData[0] : null);
      } else {
        setMyProject(generateMockProject());
      }

      // TODO: Get continuation request history from API
      // For now, use mock data
      setRequestHistory(generateMockRequests());
    } catch (error) {
      console.error("Failed to load project data:", error);
      setMyProject(generateMockProject());
      setRequestHistory(generateMockRequests());
    } finally {
      setLoading(false);
    }
  };

  const generateMockProject = () => {
    return {
      _id: "my-project-1",
      title: "Sistem Monitoring Tekanan Darah Pasien Penyakit Jantung Berbasis IoT",
      description: "Proyek ini bertujuan untuk membuat sistem monitoring tekanan darah secara real-time menggunakan IoT untuk membantu pasien penyakit jantung.",
      owner: user?.id || "user123",
      members: [user?.id || "user123"],
      createdAt: "2024-09-15T10:00:00Z",
      updatedAt: "2024-11-01T15:30:00Z",
      status: "active",
      capstoneStatus: "accepted",
      supervisor: "68da7fd4c9999e954110c9e2",
      tema: "kesehatan",
      academicYear: "Gasal-2024",
      documents: ["doc1", "doc2", "doc3"],
      tags: ["iot", "kesehatan", "monitoring"],
    };
  };

  const generateMockRequests = () => {
    return [
      {
        _id: "req1",
        projectTitle: "Alat Pengolah Sampah Otomatis di SGLC",
        requestDate: "2024-08-20T10:00:00Z",
        status: "pending",
        reason: "Saya tertarik melanjutkan proyek ini karena sesuai dengan bidang minat saya di IoT dan sustainability"
      },
      {
        _id: "req2",
        projectTitle: "Aplikasi Smart Parking Berbasis Mobile",
        requestDate: "2024-07-15T14:30:00Z",
        status: "rejected",
        reason: "Tim kami ingin mengembangkan fitur pembayaran digital",
        rejectionReason: "Proyek sudah dilanjutkan oleh tim lain"
      },
      {
        _id: "req3",
        projectTitle: "Sistem Deteksi Kualitas Udara Real-time",
        requestDate: "2024-06-10T09:00:00Z",
        status: "approved",
        reason: "Kami memiliki expertise di sensor dan data analytics"
      },
    ];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock, label: "Menunggu" },
      approved: { color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle2, label: "Disetujui" },
      rejected: { color: "bg-red-100 text-red-700 border-red-300", icon: XCircle, label: "Ditolak" },
      accepted: { color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle2, label: "Dapat Dilanjutkan" },
      active: { color: "bg-blue-100 text-blue-700 border-blue-300", icon: AlertCircle, label: "Sedang Berjalan" },
      completed: { color: "bg-purple-100 text-purple-700 border-purple-300", icon: CheckCircle2, label: "Selesai" },
    };
    return statusMap[status?.toLowerCase()] || statusMap.pending;
  };

  const getThemeLabel = (tema) => {
    const themeMap = {
      'kesehatan': 'Kesehatan',
      'pengelolaan_sampah': 'Pengelolaan Sampah',
      'smart_city': 'Smart City',
      'iot': 'IoT',
      'ai': 'Artificial Intelligence',
    };
    return themeMap[tema?.toLowerCase()] || tema || 'Lainnya';
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

      <div className="container mx-auto px-4 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Proyek Saya</h1>
            <p className="text-neutral-600 mt-2">
              Kelola proyek capstone dan riwayat request Anda
            </p>
          </div>
          {!myProject && (
            <Link href="/projects/new">
              <Button className="bg-[#FF8730] hover:bg-[#FF8730]/90 text-white font-medium shadow-md hover:shadow-lg transition-all">
                <Plus className="h-4 w-4 mr-2" />
                Buat Proyek Baru
              </Button>
            </Link>
          )}
        </div>

        {/* Main Project Card - Large and Detailed */}
        {myProject ? (
          <Card className="mb-8 border-2 border-neutral-200 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-[#B6EB75] to-[#FFE49C] pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={`${getStatusBadge(myProject.capstoneStatus || myProject.status).color} flex items-center gap-1`}>
                      {React.createElement(getStatusBadge(myProject.capstoneStatus || myProject.status).icon, { className: "h-3 w-3" })}
                      {getStatusBadge(myProject.capstoneStatus || myProject.status).label}
                    </Badge>
                    {myProject.tema && (
                      <Badge variant="outline" className="bg-white/80">
                        {getThemeLabel(myProject.tema)}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    {myProject.title}
                  </h2>
                  {myProject.description && (
                    <p className="text-neutral-700 text-sm leading-relaxed">
                      {myProject.description}
                    </p>
                  )}
                </div>
                <Link href={`/projects/${myProject._id}`}>
                  <Button className="bg-neutral-900 hover:bg-neutral-800 text-white">
                    Lihat Detail
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Info Column 1 */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                      <Calendar className="h-4 w-4" />
                      Dibuat
                    </div>
                    <p className="font-medium text-neutral-900">{formatDate(myProject.createdAt)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                      <User className="h-4 w-4" />
                      Tahun Ajaran
                    </div>
                    <p className="font-medium text-neutral-900">{myProject.academicYear || "N/A"}</p>
                  </div>
                </div>

                {/* Info Column 2 */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                      <FileText className="h-4 w-4" />
                      Dokumen
                    </div>
                    <p className="font-medium text-neutral-900">{myProject.documents?.length || 0} file</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                      <Users className="h-4 w-4" />
                      Anggota Tim
                    </div>
                    <p className="font-medium text-neutral-900">{myProject.members?.length || 1} orang</p>
                  </div>
                </div>

                {/* Info Column 3 */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                      <Clock className="h-4 w-4" />
                      Terakhir Update
                    </div>
                    <p className="font-medium text-neutral-900">{formatDate(myProject.updatedAt)}</p>
                  </div>
                  {myProject.tags && myProject.tags.length > 0 && (
                    <div>
                      <div className="text-sm text-neutral-500 mb-2">Tags</div>
                      <div className="flex flex-wrap gap-1">
                        {myProject.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-200">
                <Link href={`/projects/${myProject._id}/edit`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Edit Proyek
                  </Button>
                </Link>
                <Link href={`/projects/${myProject._id}/documents`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Kelola Dokumen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-12 text-center border-2 border-dashed border-neutral-200 mb-8">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FF8730]/10 to-[#FF8730]/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="h-10 w-10 text-[#FF8730]" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Belum Ada Proyek
              </h3>
              <p className="text-neutral-600 mb-6">
                Anda belum memiliki proyek capstone. Mulai dengan membuat proyek baru atau melanjutkan proyek yang tersedia!
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/projects/new">
                  <Button className="bg-[#FF8730] hover:bg-[#FF8730]/90 text-white font-medium shadow-md hover:shadow-lg transition-all">
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Proyek Baru
                  </Button>
                </Link>
                <Link href="/browse/capstones">
                  <Button variant="outline">
                    Browse Proyek
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Request History Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-blue-300 rounded-full" />
            <h2 className="text-2xl font-bold text-neutral-900">Riwayat Request Melanjutkan Proyek</h2>
            <Badge className="bg-blue-100 text-blue-700 border-blue-300">
              {requestHistory.length}
            </Badge>
          </div>

          {requestHistory.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2">
              <p className="text-neutral-500">Anda belum pernah mengajukan request untuk melanjutkan proyek lain.</p>
              <Link href="/browse/capstones">
                <Button variant="outline" className="mt-4">
                  Cari Proyek untuk Dilanjutkan
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {requestHistory.map((request) => {
                const statusInfo = getStatusBadge(request.status);
                return (
                  <Card key={request._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-neutral-900">{request.projectTitle}</h3>
                            <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                              {React.createElement(statusInfo.icon, { className: "h-3 w-3" })}
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-600 mb-3">
                            <span className="font-medium">Alasan:</span> {request.reason}
                          </p>
                          {request.rejectionReason && (
                            <p className="text-sm text-red-600 mb-3">
                              <span className="font-medium">Ditolak:</span> {request.rejectionReason}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <Calendar className="h-3 w-3" />
                            Diajukan: {formatDate(request.requestDate)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
