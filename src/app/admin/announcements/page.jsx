"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminService from "@/services/AdminService";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Edit,
  Trash2,
  Loader2,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [announcementToView, setAnnouncementToView] = useState(null);
  const [announcementToEdit, setAnnouncementToEdit] = useState(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const limitOptions = [10, 15, 25, 50, 100];

  useEffect(() => {
    fetchAnnouncements();
  }, [searchQuery, sortBy, currentPage, itemsPerPage]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const result = await AdminService.getAllAnnouncements({
        search: searchQuery,
        sort: sortBy,
        page: currentPage,
        limit: itemsPerPage,
      });

      if (result.success) {
        const announcementsData = result.data?.data || result.data || [];
        setAnnouncements(Array.isArray(announcementsData) ? announcementsData : []);
        
        // Handle pagination
        const pagination = result.data?.pagination;
        if (pagination) {
          setTotalAnnouncements(pagination.total || 0);
          setTotalPages(pagination.pages || 1);
        } else {
          setTotalAnnouncements(announcementsData.length);
          setTotalPages(1);
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal memuat data pengumuman",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fetch announcements error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Judul dan konten harus diisi",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const result = await AdminService.createAnnouncement(formData);

      if (result.success) {
        setShowCreateDialog(false);
        setFormData({ title: "", content: "", isImportant: false });
        setShowSuccessDialog(true);
        fetchAnnouncements();
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal membuat pengumuman",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat pengumuman",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openEditDialog = (announcement) => {
    setAnnouncementToEdit(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      isImportant: announcement.isImportant || false,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Judul dan konten harus diisi",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const result = await AdminService.updateAnnouncement(announcementToEdit._id, formData);

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Pengumuman berhasil diperbarui",
        });
        setShowEditDialog(false);
        setAnnouncementToEdit(null);
        setFormData({ title: "", content: "" });
        fetchAnnouncements();
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal memperbarui pengumuman",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui pengumuman",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const result = await AdminService.deleteAnnouncement(announcementToDelete._id);

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Pengumuman berhasil dihapus",
        });
        setShowDeleteDialog(false);
        setAnnouncementToDelete(null);
        fetchAnnouncements();
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal menghapus pengumuman",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus pengumuman",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-neutral-900">Kelola Pengumuman</h1>
          <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">
            {totalAnnouncements} Pengumuman
          </Badge>
        </div>
        <p className="text-neutral-600">
          Kelola pengumuman dan informasi penting untuk mahasiswa
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* First Row - Search and Create */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Cari pengumuman..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pengumuman
            </Button>
          </div>

          {/* Second Row - Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Urutkan</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="oldest">Terlama</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              {searchQuery || sortBy !== "newest" ? (
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
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-6 w-64 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-4 w-96 bg-neutral-200 rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-5 w-32 bg-neutral-200 rounded-full animate-pulse" />
                    <div className="h-5 w-28 bg-neutral-200 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">Tidak ada pengumuman ditemukan</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F1F7FA] hover:bg-[#F1F7FA]">
                        <TableHead className="font-bold text-black">Judul</TableHead>
                        <TableHead className="font-bold text-black">Konten</TableHead>
                        <TableHead className="text-center font-bold text-black">Dibuat Oleh</TableHead>
                        <TableHead className="font-bold text-black">Waktu Dibuat</TableHead>
                        <TableHead className="text-center font-bold text-black">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {announcements.map((announcement) => (
                        <TableRow key={announcement._id}>
                          <TableCell className="font-medium max-w-xs">
                            <div className="flex items-center gap-2">
                              <Megaphone className="h-4 w-4 text-orange-500 flex-shrink-0" />
                              <div className="flex flex-col gap-1">
                                <span className="truncate">{announcement.title}</span>
                                {announcement.isImportant && (
                                  <Badge className="w-fit text-xs bg-red-100 text-red-800 hover:bg-red-100">
                                    ⭐ PENTING
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <p className="truncate text-sm text-neutral-600">
                              {announcement.content}
                            </p>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-medium text-sm">{announcement.createdBy?.name || "N/A"}</span>
                              <Badge variant="outline" className="text-xs w-fit mt-1">
                                {announcement.createdBy?.role || "N/A"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-neutral-600">
                            {formatDateTime(announcement.createdAt)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setAnnouncementToView(announcement);
                                  setShowDetailDialog(true);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(announcement)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setAnnouncementToDelete(announcement);
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
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-3 border-t bg-neutral-50">
                <div className="text-sm text-neutral-600">
                  Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalAnnouncements)} dari {totalAnnouncements} pengumuman
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

      {/* Success Dialog - Redirect to Main Page */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="w-[90vw] max-w-sm sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-green-600" />
              Pengumuman Berhasil Dibuat!
            </DialogTitle>
            <DialogDescription>
              Pengumuman telah berhasil dipublikasikan. Apakah Anda ingin melihat pengumuman di halaman utama?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSuccessDialog(false)}
            >
              Tetap di Sini
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                router.push('/announcements');
              }}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Lihat di Halaman Utama
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="w-[90vw] max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-orange-500" />
              Detail Pengumuman
            </DialogTitle>
          </DialogHeader>
          {announcementToView && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-neutral-500">Judul</Label>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{announcementToView.title}</p>
                  {announcementToView.isImportant && (
                    <Badge className="text-xs bg-red-100 text-red-800 hover:bg-red-100">
                      ⭐ PENTING
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-neutral-500">Konten</Label>
                <Card className="p-4 bg-neutral-50">
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                    {announcementToView.content}
                  </p>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-neutral-500">Dibuat Oleh</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{announcementToView.createdBy?.name || "N/A"}</p>
                    <Badge variant="outline" className="text-xs">
                      {announcementToView.createdBy?.role || "N/A"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-neutral-500">Waktu Dibuat</Label>
                  <p className="text-sm">{formatDateTime(announcementToView.createdAt)}</p>
                </div>
              </div>

              {announcementToView.updatedAt !== announcementToView.createdAt && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-neutral-500">Terakhir Diupdate</Label>
                  <p className="text-sm">{formatDateTime(announcementToView.updatedAt)}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailDialog(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="w-[90vw] max-w-sm sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Pengumuman Baru</DialogTitle>
            <DialogDescription>
              Buat pengumuman baru untuk mahasiswa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul *</Label>
              <Input
                placeholder="Judul pengumuman"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Konten *</Label>
              <Textarea
                placeholder="Isi pengumuman"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
              />
            </div>

            {/* Important Checkbox */}
            <div className="flex items-center space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <Checkbox
                id="isImportant-create"
                checked={formData.isImportant}
                onCheckedChange={(checked) => setFormData({ ...formData, isImportant: checked })}
              />
              <label htmlFor="isImportant-create" className="text-sm font-medium text-amber-900 cursor-pointer">
                ⭐ Tandai sebagai pengumuman penting (akan ditampilkan di atas)
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setFormData({ title: "", content: "", isImportant: false });
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
        <DialogContent className="w-[90vw] max-w-sm sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Pengumuman</DialogTitle>
            <DialogDescription>Perbarui informasi pengumuman</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul *</Label>
              <Input
                placeholder="Judul pengumuman"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Konten *</Label>
              <Textarea
                placeholder="Isi pengumuman"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
              />
            </div>

            {/* Important Checkbox */}
            <div className="flex items-center space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <Checkbox
                id="isImportant-edit"
                checked={formData.isImportant}
                onCheckedChange={(checked) => setFormData({ ...formData, isImportant: checked })}
              />
              <label htmlFor="isImportant-edit" className="text-sm font-medium text-amber-900 cursor-pointer">
                ⭐ Tandai sebagai pengumuman penting (akan ditampilkan di atas)
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setAnnouncementToEdit(null);
                setFormData({ title: "", content: "", isImportant: false });
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
        <DialogContent className="w-[90vw] max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Pengumuman</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengumuman "{announcementToDelete?.title}"?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setAnnouncementToDelete(null);
              }}
              disabled={saving}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? (
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
