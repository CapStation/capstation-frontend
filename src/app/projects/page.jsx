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
import { useToast } from "@/hooks/use-toast";
import ProjectCardSkeleton from "@/components/project/ProjectCardSkeleton";
import { Loader2, Plus, Calendar, User, Users, FileText, Clock, CheckCircle2, XCircle, AlertCircle, CheckCircle } from "lucide-react";
import projectService from "@/services/ProjectService";

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [myProject, setMyProject] = useState(null);
  const [requestHistory, setRequestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingRequest, setAcceptingRequest] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadProjectData();
    }
  }, [user]);

  const handleAcceptContinuation = async () => {
    if (!myProject?._id) return;
    
    try {
      setAcceptingRequest(true);
      const result = await projectService.updateProject(myProject._id, {
        capstoneStatus: 'dapat_dilanjutkan'
      });
      
      if (result.success) {
        toast({
          title: 'Berhasil',
          description: 'Project sekarang dapat dilanjutkan oleh tim lain',
        });
        // Reload data
        loadProjectData();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Gagal mengubah status project',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error accepting continuation:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat mengubah status project',
        variant: 'destructive',
      });
    } finally {
      setAcceptingRequest(false);
    }
  };

  const loadProjectData = async () => {
    setLoading(true);
    try {
      // Get all user's projects
      const result = await projectService.getMyProjects();
      if (result.success) {
        const projectsData = Array.isArray(result.data) 
          ? result.data 
          : result.data?.projects || result.data?.data || [];
        
        // Pisahkan project aktif dan request history
        // Project aktif: status = 'active', 'selesai', atau 'dapat_dilanjutkan', capstoneStatus = 'new' atau 'accepted'
        const activeProjects = projectsData.filter(p => 
          (p.status === 'active' || p.status === 'selesai' || p.status === 'dapat_dilanjutkan') && 
          (p.capstoneStatus === 'new' || p.capstoneStatus === 'accepted')
        );
        
        // Request history: capstoneStatus = 'pending' atau 'rejected'
        const requestProjects = projectsData.filter(p => 
          p.capstoneStatus === 'pending' || p.capstoneStatus === 'rejected'
        );
        
        // Set main project (ambil yang pertama dari active projects)
        setMyProject(activeProjects.length > 0 ? activeProjects[0] : null);
        
        // Set request history (convert format)
        const requests = requestProjects.map(p => ({
          _id: p._id,
          projectTitle: p.title,
          requestDate: p.createdAt,
          status: p.capstoneStatus, // 'pending' atau 'rejected'
          reason: p.description || "Request untuk melanjutkan project",
          rejectionReason: p.capstoneStatus === 'rejected' ? "Request ditolak oleh tim pemilik project" : null
        }));
        
        setRequestHistory(requests);
      } else {
        setMyProject(generateMockProject());
        setRequestHistory(generateMockRequests());
      }
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
      capstoneStatus: "new",
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
      // capstoneStatus
      new: { color: "bg-blue-100 text-blue-700 border-blue-300", icon: AlertCircle, label: "Baru" },
      pending: { color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock, label: "Menunggu Persetujuan" },
      accepted: { color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle2, label: "Diterima" },
      rejected: { color: "bg-red-100 text-red-700 border-red-300", icon: XCircle, label: "Ditolak" },
      
      // status
      inactive: { color: "bg-gray-100 text-gray-700 border-gray-300", icon: XCircle, label: "Tidak Aktif" },
      active: { color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle2, label: "Sedang Berjalan" },
      selesai: { color: "bg-purple-100 text-purple-700 border-purple-300", icon: CheckCircle2, label: "Selesai" },
      dapat_dilanjutkan: { color: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: AlertCircle, label: "Dapat Dilanjutkan" },
      
      // Legacy for request history
      approved: { color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle2, label: "Disetujui" },
    };
    return statusMap[status?.toLowerCase()] || statusMap.new;
  };

  const getThemeLabel = (tema) => {
    const themeMap = {
      'kesehatan': 'Kesehatan',
      'pengelolaan-sampah': 'Pengelolaan Sampah',
      'smart-city': 'Smart City',
      'transportasi-ramah-lingkungan': 'Transportasi Ramah Lingkungan',
      'iot': 'IoT',
      'ai': 'Artificial Intelligence',
    };
    return themeMap[tema?.toLowerCase()] || tema?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Lainnya';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Software Development': 'bg-blue-100 text-blue-800',
      'Web & Mobile Application': 'bg-green-100 text-green-800',
      'Embedded Systems': 'bg-purple-100 text-purple-800',
      'IoT (Internet of Things)': 'bg-emerald-100 text-emerald-800',
      'Robotics & Automation': 'bg-rose-100 text-rose-800',
      'Signal Processing': 'bg-indigo-100 text-indigo-800',
      'Computer Vision': 'bg-yellow-100 text-yellow-800',
      'Machine Learning / AI': 'bg-red-100 text-red-800',
      'Biomedical Devices': 'bg-pink-100 text-pink-800',
      'Health Informatics': 'bg-cyan-100 text-cyan-800',
      'Networking & Security': 'bg-gray-100 text-gray-800',
      'Cloud & DevOps': 'bg-sky-100 text-sky-800',
      'Data Engineering & Analytics': 'bg-orange-100 text-orange-800',
      'Human-Computer Interaction': 'bg-lime-100 text-lime-800',
      'Control Systems': 'bg-violet-100 text-violet-800',
      'Energy & Power Systems': 'bg-amber-100 text-amber-800',
      'Research & Simulation': 'bg-teal-100 text-teal-800',
      'Others': 'bg-neutral-100 text-neutral-800',
    };
    return colors[category] || 'bg-neutral-100 text-neutral-800';
  };

  if (authLoading || !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100">
        <Navbar />
        <div className="bg-gradient-to-r from-[#FF8730] to-[#FFB464] px-4">
          <div className="container mx-auto px-12 py-12">
            <div className="h-12 w-64 bg-white/30 rounded animate-pulse mb-3" />
            <div className="h-5 w-96 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
        <div className="container mx-auto px-12 py-8">
          <div className="mb-8">
            <div className="h-7 w-48 bg-neutral-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-64 bg-neutral-200 rounded animate-pulse" />
          </div>
          <ProjectCardSkeleton />
          <div className="mt-8">
            <div className="h-7 w-48 bg-neutral-200 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-neutral-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Navbar />

      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#FF8730] to-[#FFB464] px-4">
        <div className="container mx-auto px-12 py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Proyek Saya</h1>
              <p className="mt-2 text-neutral-50">
                Kelola proyek capstone dan riwayat request Anda
              </p>
            </div>

            <div className="flex gap-2">
              {!myProject && (
                <Link href="/projects/new">
                  <Button className="bg-white hover:bg-neutral-100 text-primary font-semibold">
                    <Plus className="w-5 h-5" />
                    Buat Proyek Baru
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-12 py-8">

        {/* Main Project Card - Large and Detailed */}
        {myProject ? (
          <Card className="mb-8 border-2 border-neutral-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-br from-secondary to-[#faa255] pb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {/* Hanya tampilkan status (active atau selesai) */}
                    <Badge className={`${getStatusBadge(myProject.status).color} flex items-center gap-1 px-2`}>
                      {React.createElement(getStatusBadge(myProject.status).icon, { className: "h-3 w-3" })}
                      {getStatusBadge(myProject.status).label}
                    </Badge>
                    {myProject.tema && (
                      <Badge variant="outline" className="bg-white/80 px-2">
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
                <div className="mt-3 md:mt-0">
                  <Link href={`/projects/${myProject._id}`}>
                    <Button className="bg-[#fff1c9] hover:bg-secondary text-black shadow-sm transition-all">
                      Lihat Detail
                    </Button>
                  </Link>
                </div>
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
                  {myProject.competencies && myProject.competencies.length > 0 ? (
                    <div>
                      <div className="text-sm text-neutral-500 mb-2">Kompetensi</div>
                      <div className="flex flex-wrap gap-1">
                        {myProject.competencies.map((comp, idx) => {
                          const name = typeof comp === 'string' ? comp : comp.name || comp.title || comp._id;
                          const category = typeof comp === 'object' ? comp.category : undefined;
                          return (
                            <Badge key={idx} className={`${getCategoryColor(category)} text-xs`}>
                              {name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  ) : myProject.tags && myProject.tags.length > 0 && (
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
              <div className="flex flex-col md:flex-row gap-3 mt-6 pt-6 border-t border-neutral-200">
                {myProject.status === 'active' ? (
                  // Tombol untuk project yang masih aktif
                  <>
                    <Link href={`/projects/${myProject._id}/edit`} className="w-full md:flex-1">
                      <Button variant="outline" className="w-full">
                        Edit Proyek
                      </Button>
                    </Link>
                    <Link href={`/groups/${typeof myProject.group === 'string' ? myProject.group : myProject.group?._id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Detail Grup
                      </Button>
                    </Link>
                  </>
                ) : myProject.status === 'dapat_dilanjutkan' ? (
                  // Tombol untuk project yang dapat dilanjutkan
                  <>
                    <Link href={`/groups/${typeof myProject.group === 'string' ? myProject.group : myProject.group?._id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Lihat Grup
                      </Button>
                    </Link>
                    <Link href={`/request`} className="w-full md:flex-1">
                      <Button className="w-full bg-[#FF8730] hover:bg-[#FF8730]/90 text-white">
                        Lihat Request
                      </Button>
                    </Link>
                  </>
                ) : (
                  // Tombol untuk project yang sudah selesai
                  <>
                    <Link href={`/groups/${typeof myProject.group === 'string' ? myProject.group : myProject.group?._id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Lihat Grup
                      </Button>
                    </Link>
                    <Button 
                      onClick={handleAcceptContinuation}
                      disabled={acceptingRequest}
                      className="flex-1 bg-green-300 hover:bg-green-400 text-black"
                    >
                      {acceptingRequest ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Terima Request Kelanjutan
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-8 sm:p-12 text-center border-2 border-dashed border-neutral-200 mb-8">
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
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/projects/new" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-[#FF8730] hover:bg-[#FF8730]/90 text-white font-medium shadow-md hover:shadow-lg transition-all">
                    <Plus className="h-4 w-4 mr-1" />
                    Buat Proyek Baru
                  </Button>
                </Link>
                <Link href="/browse/capstones" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Browse Proyek
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Request History Section */}
        <div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-blue-300 rounded-full" />
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900">Riwayat Request Melanjutkan Proyek</h2>
            </div>
            <div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                {requestHistory.length}
              </Badge>
            </div>
          </div>

          {requestHistory.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2">
              <p className="text-neutral-500">Anda belum pernah mengajukan request untuk melanjutkan proyek lain.</p>
              {!myProject && (
                <Link href="/browse/capstones">
                  <Button variant="outline" className="mt-4">
                    Cari Proyek untuk Dilanjutkan
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {requestHistory.map((request) => {
                const statusInfo = getStatusBadge(request.status);
                return (
                  <Card key={request._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
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


