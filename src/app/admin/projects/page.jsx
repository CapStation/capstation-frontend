"use client";

import { useEffect, useState } from "react";
import AdminService from "@/services/AdminService";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Download,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Filter,
  X,
} from "lucide-react";
import Link from "next/link";

export default function AdminProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [themeFilter, setThemeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchProjects();
  }, [currentPage, statusFilter, themeFilter, searchQuery]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const result = await AdminService.getAllProjects();
      if (result.success) {
        let filteredProjects = result.data || [];

        // Apply filters
        if (statusFilter !== "all") {
          filteredProjects = filteredProjects.filter(
            (p) => p.status === statusFilter
          );
        }

        if (themeFilter !== "all") {
          filteredProjects = filteredProjects.filter(
            (p) => p.tema === themeFilter
          );
        }

        if (searchQuery) {
          filteredProjects = filteredProjects.filter(
            (p) =>
              p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.keywords?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Pagination
        const total = Math.ceil(filteredProjects.length / itemsPerPage);
        setTotalPages(total);

        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedProjects = filteredProjects.slice(
          startIndex,
          startIndex + itemsPerPage
        );

        setProjects(paginatedProjects);
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal memuat data proyek",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data proyek",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Proyek berhasil dihapus",
        });
        setShowDeleteDialog(false);
        setProjectToDelete(null);
        fetchProjects();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Gagal menghapus proyek",
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
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');

      if (!token) {
        toast({
          title: "Error",
          description: "Anda belum login. Silakan login terlebih dahulu.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Mengekspor proyek...",
        description: "Mohon tunggu sebentar",
      });

      const response = await fetch(`${API_URL}/projects/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Gagal mengekspor proyek');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proyek_capstation_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Berhasil",
        description: "Data proyek berhasil diekspor",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal mengekspor proyek",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: "Aktif", className: "bg-green-100 text-green-700" },
      inactive: { label: "Tidak Aktif", className: "bg-gray-100 text-gray-700" },
      selesai: { label: "Selesai", className: "bg-blue-100 text-blue-700" },
      dapat_dilanjutkan: {
        label: "Dapat Dilanjutkan",
        className: "bg-emerald-100 text-emerald-700",
      },
    };

    const config = statusMap[status] || {
      label: status,
      className: "bg-gray-100 text-gray-700",
    };

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getThemeLabel = (tema) => {
    const themeMap = {
      kesehatan: "Kesehatan",
      pengelolaan_sampah: "Pengelolaan Sampah",
      smart_city: "Smart City",
      transportasi_ramah_lingkungan: "Transportasi Ramah Lingkungan",
    };
    return themeMap[tema] || tema;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setThemeFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-neutral-900">
            Kelola Proyek
          </h1>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">
              {projects.length} Proyek
            </Badge>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Ekspor
            </Button>
          </div>
        </div>
        <p className="text-neutral-600">
          Kelola semua proyek capstone di sistem
        </p>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Cari proyek..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
                <SelectItem value="dapat_dilanjutkan">
                  Dapat Dilanjutkan
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Theme Filter */}
            <Select value={themeFilter} onValueChange={setThemeFilter}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tema</SelectItem>
                <SelectItem value="kesehatan">Kesehatan</SelectItem>
                <SelectItem value="pengelolaan_sampah">
                  Pengelolaan Sampah
                </SelectItem>
                <SelectItem value="smart_city">Smart City</SelectItem>
                <SelectItem value="transportasi_ramah_lingkungan">
                  Transportasi Ramah Lingkungan
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || statusFilter !== "all" || themeFilter !== "all") && (
              <Button variant="outline" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Create Button */}
            <Link href="/admin/projects/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Proyek
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Proyek ({projects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <p>Tidak ada proyek ditemukan</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul</TableHead>
                      <TableHead>Tema</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tahun Ajaran</TableHead>
                      <TableHead>Tanggal Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project._id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {project.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getThemeLabel(project.tema)}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(project.status)}</TableCell>
                        <TableCell>
                          {project.academicYear
                            ? project.academicYear.replace("-", " ")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {new Date(project.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/projects/${project._id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/projects/${project._id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setProjectToDelete(project);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  <span className="text-sm text-neutral-600">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Proyek</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus proyek "{projectToDelete?.title}
              "? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
