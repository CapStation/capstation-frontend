"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, getUserName } from "@/lib/utils/formatters";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText, 
  Download, 
  Upload,
  Loader2 
} from "lucide-react";
import projectService from "@/services/ProjectService";
import { useToast } from "@/hooks/use-toast";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadProjectData();
    }
  }, [params.id]);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const [projectResult, docsResult] = await Promise.all([
        projectService.getProjectById(params.id),
        projectService.getProjectDocuments(params.id),
      ]);

      if (projectResult.success) {
        // Handle if data is nested
        const projectData = projectResult.data?.project || projectResult.data;
        setProject(projectData);
      } else {
        // Mock project if API fails
        setProject({
          _id: params.id,
          title: "Sistem Monitoring Tekanan Darah Pasien Penyakit Jantung Berbasis IoT",
          description: "Proyek ini bertujuan untuk mengembangkan sistem monitoring tekanan darah secara real-time menggunakan teknologi IoT untuk membantu pasien penyakit jantung memantau kondisi kesehatan mereka.",
          category: "IoT, Kesehatan",
          supervisor: "Prof. Dr.Eng. I. F. Danung Wijaya, S.T., M.T., IPM.",
          status: "Sedang Proses",
          createdAt: "2026-05-27",
          keywords: "IoT, Kesehatan, Monitoring, Tekanan Darah",
        });
      }

      if (docsResult.success) {
        // Handle if documents is nested or direct array
        const documentsData = Array.isArray(docsResult.data)
          ? docsResult.data
          : docsResult.data?.documents || docsResult.data?.data || [];
        setDocuments(documentsData);
      } else {
        // Mock documents
        setDocuments([
          { _id: "1", name: "Proposal_Proyek.pdf", size: "2.4 MB", uploadedAt: "2026-05-27" },
          { _id: "2", name: "Desain_Sistem.pdf", size: "1.8 MB", uploadedAt: "2026-06-10" },
        ]);
      }
    } catch (error) {
      console.error("Failed to load project data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data proyek",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus proyek ini?")) {
      return;
    }

    try {
      const result = await projectService.deleteProject(params.id);
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Proyek berhasil dihapus",
        });
        router.push("/projects");
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal menghapus proyek",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus proyek",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("document", file);

    try {
      const result = await projectService.uploadDocument(params.id, formData);
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Dokumen berhasil diupload",
        });
        loadProjectData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal mengupload dokumen",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengupload dokumen",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) {
      return;
    }

    try {
      const result = await projectService.deleteDocument(params.id, docId);
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Dokumen berhasil dihapus",
        });
        loadProjectData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal menghapus dokumen",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus dokumen",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDocument = async (docId) => {
    console.log('🔽 Initiating download for document:', docId);
    
    const result = await projectService.downloadDocument(docId);
    
    console.log('📊 Download result:', result);
    
    if (!result.success) {
      // Only show error toast if download failed
      toast({
        title: "Error",
        description: result.error || "Gagal mengunduh dokumen",
        variant: "destructive",
      });
    }
    // If success, file is already downloaded, no need for toast
  };

  const getStatusColor = (status) => {
    if (status === "Disetujui") return "bg-accent text-neutral-900";
    if (status === "Sedang Proses") return "bg-warning text-neutral-900";
    if (status === "Ditolak") return "bg-red-500 text-white";
    return "bg-neutral-200 text-neutral-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-neutral-900">Proyek tidak ditemukan</h2>
          <Link href="/projects">
            <Button className="mt-4">Kembali ke Proyek</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>

          {/* Project Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-3">{project.title}</CardTitle>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Link href={`/projects/${params.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Deskripsi</h3>
                <p className="text-neutral-700 leading-relaxed">{project.description}</p>
              </div>
              
              {project.category && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Kategori</h3>
                  <p className="text-neutral-700">{project.category}</p>
                </div>
              )}

              {project.supervisor && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Dosen Pembimbing</h3>
                  <p className="text-neutral-700">
                    {typeof project.supervisor === 'object' && project.supervisor.name
                      ? project.supervisor.name
                      : typeof project.supervisor === 'string'
                      ? project.supervisor
                      : '-'}
                  </p>
                </div>
              )}

              {project.keywords && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Kata Kunci</h3>
                  <p className="text-neutral-700">{project.keywords}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Tanggal Dibuat</h3>
                <p className="text-neutral-700">
                  {new Date(project.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Documents Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dokumen Proyek</CardTitle>
                <label>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Button size="sm" disabled={uploading} asChild>
                    <span className="cursor-pointer">
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Dokumen
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                  <p>Belum ada dokumen</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-neutral-900">
                            {doc.title || doc.originalName || doc.name || 'Untitled'}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {formatFileSize(doc.fileSize)} 
                            {' • '}
                            {new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadDocument(doc._id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
