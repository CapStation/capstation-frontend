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
  const [academicYearFilter, setAcademicYearFilter] = useState("all");
  const [capstoneStatusFilter, setCapstoneStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [allProjectsCount, setAllProjectsCount] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const limitOptions = [10, 15, 25, 50, 100];

  useEffect(() => {
    fetchProjects();
  }, [currentPage, statusFilter, themeFilter, academicYearFilter, capstoneStatusFilter, sortBy, searchQuery, itemsPerPage]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const result = await AdminService.getAllProjects();
      if (result.success) {
        let filteredProjects = result.data || [];
        
        // Store total count before filtering
        setAllProjectsCount(filteredProjects.length);

        // Apply filters
        if (statusFilter !== "all") {
          filteredProjects = filteredProjects.filter(
            (p) => p.status === statusFilter
          );
        }

        if (themeFilter !== "all") {
          filteredProjects = filteredProjects.filter((p) => {
            // Normalize both values to compare (convert to lowercase and replace - with _)
            const normalizedTema = p.tema?.toLowerCase().replace(/-/g, '_') || '';
            const normalizedFilter = themeFilter.toLowerCase().replace(/-/g, '_');
            return normalizedTema === normalizedFilter;
          });
        }

        if (academicYearFilter !== "all") {
          filteredProjects = filteredProjects.filter(
            (p) => p.academicYear === academicYearFilter
          );
        }

        if (capstoneStatusFilter !== "all") {
          filteredProjects = filteredProjects.filter(
            (p) => p.capstoneStatus === capstoneStatusFilter
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

        // Sort
        switch (sortBy) {
          case "newest":
            filteredProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
          case "oldest":
            filteredProjects.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
          case "alphabetical":
            filteredProjects.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
            break;
        }

        // Pagination
        const total = Math.ceil(filteredProjects.length / itemsPerPage);
        setTotalPages(total);
        setTotalProjects(filteredProjects.length);

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
      "pengelolaan-sampah": "Pengelolaan Sampah",
      smart_city: "Smart City",
      "smart-city": "Smart City",
      transportasi_ramah_lingkungan: "Transportasi Ramah Lingkungan",
      "transportasi-ramah-lingkungan": "Transportasi Ramah Lingkungan",
    };
    
    // Jika tidak ada di map, convert dari kebab-case atau snake_case ke Title Case
    if (themeMap[tema]) {
      return themeMap[tema];
    }
    
    // Convert kebab-case atau snake_case ke Title Case
    return tema
      ?.replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase()) || tema;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setThemeFilter("all");
    setAcademicYearFilter("all");
    setCapstoneStatusFilter("all");
    setSortBy("newest");
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
              {allProjectsCount} Proyek
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
          {/* First Row - Search and Actions */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
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
            <div></div>
          </div>

          {/* Second Row - Filters with Labels */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
            </div>

            {/* Theme Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tema</label>
              <Select value={themeFilter} onValueChange={setThemeFilter}>
                <SelectTrigger>
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
            </div>

            {/* Academic Year Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tahun Ajaran</label>
              <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tahun Ajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  <SelectItem value="Gasal-2024">Gasal 2024</SelectItem>
                  <SelectItem value="Genap-2024">Genap 2024</SelectItem>
                  <SelectItem value="Gasal-2023">Gasal 2023</SelectItem>
                  <SelectItem value="Genap-2023">Genap 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Capstone Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Capstone</label>
              <Select value={capstoneStatusFilter} onValueChange={setCapstoneStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status Capstone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="new">Baru</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="accepted">Diterima</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Urutkan</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="oldest">Terlama</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              {(searchQuery || statusFilter !== "all" || themeFilter !== "all" || academicYearFilter !== "all" || capstoneStatusFilter !== "all" || sortBy !== "newest") ? (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Reset Filter
                </Button>
              ) : (
                <div className="h-10"></div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
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
              <div className="overflow-hidden rounded-lg">
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F1F7FA] hover:bg-[#F1F7FA]">
                      <TableHead className="text-neutral-900 font-bold">Judul</TableHead>
                      <TableHead className="text-center text-neutral-900 font-bold">Tema</TableHead>
                      <TableHead className="text-center text-neutral-900 font-bold">Status</TableHead>
                      <TableHead className="text-center text-neutral-900 font-bold">Tahun Ajaran</TableHead>
                      <TableHead className="text-neutral-900 font-bold">Tanggal Dibuat</TableHead>
                      <TableHead className="text-center text-neutral-900 font-bold">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project._id}>
                        <TableCell className="font-medium max-w-xs">
                          <div className="whitespace-normal break-words">
                            {project.title}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">
                            {getThemeLabel(project.tema)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(project.status)}</TableCell>
                        <TableCell className="text-center text-sm text-neutral-600">
                          {project.academicYear
                            ? project.academicYear.replace("-", " ")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm text-neutral-600">
                          {new Date(project.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/projects/${project._id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/projects/${project._id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
                <div className="flex items-center justify-between px-6 py-3 border-t bg-neutral-50">
                <div className="text-sm text-neutral-600">
                  Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalProjects)} dari {totalProjects} proyek
                </div>
                
                <div className="flex items-center gap-3">
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      const newLimit = parseInt(value);
                      setItemsPerPage(newLimit);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {limitOptions.map(limit => (
                        <SelectItem key={limit} value={limit.toString()}>
                          {limit} per halaman
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={currentPage === page ? "bg-[#B6EB75] hover:bg-[#B6EB75]/90 text-neutral-900" : "hover:bg-[#FFE49C] hover:text-neutral-900"}
                            >
                              {page}
                            </Button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return <span key={page} className="px-2">...</span>;
                        }
                        return null;
                      })}
                    </div>

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
                </div>
                </div>
              </div>
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
