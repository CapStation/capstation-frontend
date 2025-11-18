"use client";

import { useEffect, useState } from "react";
import AdminService from "@/services/AdminService";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Edit,
  Trash2,
  Loader2,
  X,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AdminCompetenciesPage() {
  const { toast } = useToast();
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("__all__");
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompetencies, setTotalCompetencies] = useState(0);
  const [allCompetenciesCount, setAllCompetenciesCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [competencyToEdit, setCompetencyToEdit] = useState(null);
  const [competencyToDelete, setCompetencyToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
  });

  const categories = [
    "Programming Languages",
    "Web Development",
    "Mobile Development",
    "Data Science",
    "UI/UX Design",
    "DevOps",
    "Database",
    "Cloud Computing",
    "Artificial Intelligence",
    "Cybersecurity",
    "Project Management",
    "Soft Skills",
    "Others",
  ];

  const limitOptions = [10, 15, 25, 50, 100];

  useEffect(() => {
    fetchCompetencies();
  }, [currentPage, categoryFilter, statusFilter, searchQuery, itemsPerPage]);

  const fetchCompetencies = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = {
        page: 1,
        limit: 1000,
      };
      
      if (categoryFilter && categoryFilter !== "__all__") {
        params.category = categoryFilter;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }

      const result = await AdminService.getAllCompetencies(params);
      
      if (!result.success) {
        throw new Error(result.error || "Gagal memuat data kompetensi");
      }

      console.log('Competencies result:', result);
      console.log('result.data:', result.data);
      console.log('result.data.competencies:', result.data?.competencies);
      
      // result.data is the API response: { message, competencies, pagination }
      let allCompetencies = result.data?.competencies || [];
      
      console.log('allCompetencies length:', allCompetencies.length);
      console.log('statusFilter:', statusFilter);
      console.log('First 3 competencies:', allCompetencies.slice(0, 3));

      // Store total count before filtering
      setAllCompetenciesCount(allCompetencies.length);

      // Apply status filter (isActive)
      if (statusFilter !== "__all__") {
        const isActive = statusFilter === "true";
        console.log('Filtering by isActive:', isActive);
        allCompetencies = allCompetencies.filter((c) => c.isActive === isActive);
        console.log('After filter length:', allCompetencies.length);
      }

      // Sort by newest
      allCompetencies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Pagination
      const total = Math.ceil(allCompetencies.length / itemsPerPage);
      setTotalPages(total);
      setTotalCompetencies(allCompetencies.length);

      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedCompetencies = allCompetencies.slice(
        startIndex,
        startIndex + itemsPerPage
      );

      setCompetencies(paginatedCompetencies);
    } catch (error) {
      console.error("Error fetching competencies:", error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat memuat data kompetensi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("__all__");
    setStatusFilter("__all__");
    setCurrentPage(1);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.category) {
      toast({
        title: "Error",
        description: "Nama dan kategori kompetensi harus diisi",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const result = await AdminService.createCompetency(formData);

      if (!result.success) {
        throw new Error(result.error || "Gagal membuat kompetensi");
      }

      toast({
        title: "Berhasil",
        description: "Kompetensi berhasil dibuat",
      });

      setShowCreateDialog(false);
      setFormData({ name: "", category: "", description: "" });
      fetchCompetencies();
    } catch (error) {
      console.error("Error creating competency:", error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat membuat kompetensi",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.category) {
      toast({
        title: "Error",
        description: "Nama dan kategori kompetensi harus diisi",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const result = await AdminService.updateCompetency(competencyToEdit._id, formData);

      if (!result.success) {
        throw new Error(result.error || "Gagal memperbarui kompetensi");
      }

      toast({
        title: "Berhasil",
        description: "Kompetensi berhasil diperbarui",
      });

      setShowEditDialog(false);
      setCompetencyToEdit(null);
      setFormData({ name: "", category: "", description: "" });
      fetchCompetencies();
    } catch (error) {
      console.error("Error updating competency:", error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat memperbarui kompetensi",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await AdminService.deleteCompetency(competencyToDelete._id);

      if (!result.success) {
        throw new Error(result.error || "Gagal menghapus kompetensi");
      }

      toast({
        title: "Berhasil",
        description: "Kompetensi berhasil dinonaktifkan",
      });

      setShowDeleteDialog(false);
      setCompetencyToDelete(null);
      fetchCompetencies();
    } catch (error) {
      console.error("Error deleting competency:", error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menghapus kompetensi",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const openEditDialog = (competency) => {
    setCompetencyToEdit(competency);
    setFormData({
      name: competency.name,
      category: competency.category,
      description: competency.description || "",
    });
    setShowEditDialog(true);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-neutral-900">
            Manajemen Kompetensi
          </h1>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">
              {allCompetenciesCount} Kompetensi
            </Badge>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kompetensi
            </Button>
          </div>
        </div>
        <p className="text-neutral-600">
          Kelola daftar kompetensi yang tersedia untuk pengguna
        </p>
      </div>

      {/* Main Card */}
      <Card>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="space-y-4 mb-6">
            {/* Row 1: Search and Add Button */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Cari nama kompetensi..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div></div>
            </div>

            {/* Row 2: Filter Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => {
                    setCategoryFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Semua Kategori</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Semua Status</SelectItem>
                    <SelectItem value="true">Aktif</SelectItem>
                    <SelectItem value="false">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">&nbsp;</label>
                {searchQuery || categoryFilter !== "__all__" || statusFilter !== "__all__" ? (
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    Reset Filter
                  </Button>
                ) : (
                  <div className="h-10"></div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-5 w-64 bg-neutral-200 rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-neutral-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : competencies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">Tidak ada kompetensi ditemukan</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F1F7FA] hover:bg-[#F1F7FA]">
                        <TableHead className="font-bold text-black">Nama</TableHead>
                        <TableHead className="font-bold text-black">Kategori</TableHead>
                        <TableHead className="font-bold text-black">Deskripsi</TableHead>
                        <TableHead className="text-center font-bold text-black">Status</TableHead>
                        <TableHead className="font-bold text-black">Tanggal Dibuat</TableHead>
                        <TableHead className="text-center font-bold text-black">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {competencies.map((competency) => {
                        console.log('Competency:', competency.name, 'isActive:', competency.isActive, 'type:', typeof competency.isActive);
                        return (
                        <TableRow key={competency._id}>
                          <TableCell className="font-medium">{competency.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {competency.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-neutral-600 max-w-xs truncate">
                            {competency.description || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {competency.isActive ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Aktif
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <XCircle className="h-3 w-3 mr-1" />
                                Nonaktif
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-neutral-600">
                            {new Date(competency.createdAt).toLocaleDateString("id-ID")}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(competency)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCompetencyToDelete(competency);
                                  setShowDeleteDialog(true);
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={!competency.isActive}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-3 border-t bg-neutral-50">
                <div className="text-sm text-neutral-600">
                  Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCompetencies)} dari {totalCompetencies} kompetensi
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(parseInt(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {limitOptions.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                          {option} per halaman
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
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
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kompetensi Baru</DialogTitle>
            <DialogDescription>
              Tambahkan kompetensi baru yang dapat dipilih oleh pengguna
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Kompetensi *</label>
              <Input
                placeholder="Contoh: React.js, Python, UI Design"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori *</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <Textarea
                placeholder="Deskripsi singkat tentang kompetensi (opsional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setFormData({ name: "", category: "", description: "" });
              }}
              disabled={saving}
            >
              Batal
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kompetensi</DialogTitle>
            <DialogDescription>
              Perbarui informasi kompetensi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Kompetensi *</label>
              <Input
                placeholder="Contoh: React.js, Python, UI Design"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori *</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <Textarea
                placeholder="Deskripsi singkat tentang kompetensi (opsional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setCompetencyToEdit(null);
                setFormData({ name: "", category: "", description: "" });
              }}
              disabled={saving}
            >
              Batal
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nonaktifkan Kompetensi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menonaktifkan kompetensi "{competencyToDelete?.name}"?
              Kompetensi yang dinonaktifkan tidak akan muncul dalam pilihan pengguna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setCompetencyToDelete(null);
              }}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menonaktifkan...
                </>
              ) : (
                "Nonaktifkan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
