"use client";

import { useEffect, useState } from "react";
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
  Users,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  User,
  Plus,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminGroupsPage() {
  const { toast } = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalGroups, setTotalGroups] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [groupToView, setGroupToView] = useState(null);
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    owner: "",
    members: [],
  });

  const limitOptions = [10, 15, 25, 50, 100];

  useEffect(() => {
    fetchGroups();
  }, [searchQuery, statusFilter, sortBy, currentPage, itemsPerPage]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const result = await AdminService.getAllGroups({
        search: searchQuery,
        isActive: statusFilter === "all" ? undefined : statusFilter === "active",
        sort: sortBy,
        page: currentPage,
        limit: itemsPerPage,
      });

      if (result.success) {
        const groupsData = result.data?.data || result.data || [];
        setGroups(Array.isArray(groupsData) ? groupsData : []);
        
        // Handle pagination
        const pagination = result.data?.pagination;
        if (pagination) {
          setTotalGroups(pagination.total || 0);
          setTotalPages(pagination.pages || 1);
        } else {
          setTotalGroups(groupsData.length);
          setTotalPages(1);
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal memuat data grup",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fetch groups error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const result = await AdminService.getAllUsers({ limit: 1000 });
      if (result.success) {
        const usersData = result.data?.data || result.data || [];
        setAllUsers(Array.isArray(usersData) ? usersData : []);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const openDetailDialog = async (group) => {
    setGroupToView(group);
    setShowDetailDialog(true);
    setLoadingDetail(true);
    
    try {
      const result = await AdminService.getGroupById(group._id);
      if (result.success) {
        setGroupToView(result.data?.data || result.data);
      }
    } catch (error) {
      console.error("Fetch group detail error:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const openEditDialog = async (group) => {
    setGroupToEdit(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      isActive: group.isActive,
      owner: group.owner?._id || "",
      members: group.members?.map(m => m._id) || [],
    });
    
    // Fetch all users for selection
    await fetchAllUsers();
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Nama grup harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!formData.owner) {
      toast({
        title: "Error",
        description: "Owner grup harus dipilih",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        owner: formData.owner,
        members: formData.members,
      };

      const result = await AdminService.updateGroup(groupToEdit._id, updateData);

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Grup berhasil diperbarui",
        });
        setShowEditDialog(false);
        setGroupToEdit(null);
        setFormData({ name: "", description: "", isActive: true, owner: "", members: [] });
        fetchGroups();
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal memperbarui grup",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui grup",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const result = await AdminService.deleteGroup(groupToDelete._id);

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Grup berhasil dihapus",
        });
        setShowDeleteDialog(false);
        setGroupToDelete(null);
        fetchGroups();
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal menghapus grup",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus grup",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const filteredGroups = groups;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-neutral-900">Kelola Grup</h1>
          <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">
            {totalGroups} Grup
          </Badge>
        </div>
        <p className="text-neutral-600">
          Kelola semua grup mahasiswa di sistem
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* First Row - Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Cari grup..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div></div>
          </div>

          {/* Second Row - Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </SelectContent>
              </Select>
            </div>

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

            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              {searchQuery || statusFilter !== "all" || sortBy !== "newest" ? (
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
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-48 bg-neutral-200 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-24 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-8 w-8 bg-neutral-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">Tidak ada grup ditemukan</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F1F7FA] hover:bg-[#F1F7FA]">
                        <TableHead className="font-bold text-black">Nama Grup</TableHead>
                        <TableHead className="font-bold text-black">Owner</TableHead>
                        <TableHead className="font-bold text-black">Deskripsi</TableHead>
                        <TableHead className="text-center font-bold text-black">Anggota</TableHead>
                        <TableHead className="text-center font-bold text-black">Status</TableHead>
                        <TableHead className="font-bold text-black">Tanggal Dibuat</TableHead>
                        <TableHead className="text-center font-bold text-black">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGroups.map((group) => (
                        <TableRow key={group._id}>
                          <TableCell className="font-medium">{group.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{group.owner?.name || "N/A"}</span>
                              <span className="text-xs text-neutral-500">{group.owner?.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-neutral-600">
                            {group.description || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {group.members?.length || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {group.isActive ? (
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
                            {new Date(group.createdAt).toLocaleDateString("id-ID")}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDetailDialog(group)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(group)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setGroupToDelete(group);
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
                  Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalGroups)} dari {totalGroups} grup
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

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Grup</DialogTitle>
            <DialogDescription>Informasi lengkap tentang grup</DialogDescription>
          </DialogHeader>
          {loadingDetail ? (
            <div className="space-y-6 py-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-5 w-32 bg-neutral-200 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-5 w-32 bg-neutral-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
                <div className="h-20 bg-neutral-200 rounded animate-pulse" />
              </div>
            </div>
          ) : groupToView && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-neutral-500">Nama Grup</Label>
                  <p className="text-base font-medium">{groupToView.name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-neutral-500">Status</Label>
                  <div>
                    {groupToView.isActive ? (
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
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-neutral-500">Deskripsi</Label>
                <p className="text-sm text-neutral-600">{groupToView.description || "Tidak ada deskripsi"}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-neutral-500">Owner</Label>
                <Card className="p-3 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{groupToView.owner?.name || "N/A"}</p>
                      <div className="flex items-center gap-1 text-xs text-neutral-600">
                        <Mail className="h-3 w-3" />
                        {groupToView.owner?.email}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-neutral-500">
                  Anggota ({groupToView.members?.length || 0})
                </Label>
                <ScrollArea className="h-[200px] rounded-md border p-3">
                  <div className="space-y-2">
                    {groupToView.members && groupToView.members.length > 0 ? (
                      groupToView.members.map((member) => (
                        <div key={member._id} className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded">
                          <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-neutral-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-neutral-600">{member.email}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-neutral-500 text-center py-4">Belum ada anggota</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-neutral-500">
                  Proyek Terkait ({groupToView.projects?.filter(p => p.status === 'active').length || 0})
                </Label>
                <ScrollArea className="h-[160px] rounded-md border p-3">
                  <div className="space-y-2">
                    {groupToView.projects && groupToView.projects.filter(p => p.status === 'active').length > 0 ? (
                      groupToView.projects
                        .filter(project => project.status === 'active')
                        .map((project) => (
                          <div key={project._id} className="p-3 border rounded hover:bg-neutral-50">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{project.title}</p>
                                <p className="text-xs text-neutral-600 line-clamp-2 mt-1">
                                  {project.description || "Tidak ada deskripsi"}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 flex-shrink-0">
                                Aktif
                              </Badge>
                            </div>
                            {project.tema && (
                              <Badge variant="secondary" className="text-xs mt-2">
                                {project.tema}
                              </Badge>
                            )}
                            <p className="text-xs text-neutral-500 mt-2">
                              Dibuat: {new Date(project.createdAt).toLocaleDateString("id-ID")}
                            </p>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-neutral-500 text-center py-4">
                        Belum ada proyek aktif
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs text-neutral-500">Tanggal Dibuat</Label>
                  <p className="text-sm">{new Date(groupToView.createdAt).toLocaleDateString("id-ID", { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-neutral-500">Terakhir Diupdate</Label>
                  <p className="text-sm">{new Date(groupToView.updatedAt).toLocaleDateString("id-ID", { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailDialog(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Grup</DialogTitle>
            <DialogDescription>Perbarui informasi grup, owner, dan anggota</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Grup *</Label>
              <Input
                placeholder="Nama grup"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                placeholder="Deskripsi grup (opsional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Owner *</Label>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                <Select
                  value={formData.owner}
                  onValueChange={(value) => setFormData({ ...formData, owner: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        <div className="flex items-center gap-2">
                          <span>{user.name}</span>
                          <span className="text-xs text-neutral-500">({user.email})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Anggota</Label>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Selected Members */}
                  {formData.members.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-neutral-500">Anggota Terpilih ({formData.members.length})</Label>
                      <Card className="p-3 bg-green-50 border-green-200">
                        <ScrollArea className="max-h-[120px]">
                          <div className="space-y-2">
                            {formData.members.map((memberId) => {
                              const member = allUsers.find(u => u._id === memberId);
                              if (!member) return null;
                              return (
                                <div key={member._id} className="flex items-center gap-2 p-2 bg-white rounded hover:bg-neutral-50">
                                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <User className="h-3 w-3 text-green-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{member.name}</p>
                                    <p className="text-xs text-neutral-500 truncate">{member.email}</p>
                                  </div>
                                  <Badge variant="outline" className="text-xs flex-shrink-0">
                                    {member.role}
                                  </Badge>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        members: formData.members.filter(id => id !== member._id)
                                      });
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </Card>
                    </div>
                  )}

                  {/* Available Users to Add */}
                  <div className="space-y-2">
                    <Label className="text-xs text-neutral-500">Tambah Anggota (Mahasiswa)</Label>
                    <ScrollArea className="h-[180px] rounded-md border p-3">
                      <div className="space-y-2">
                        {allUsers
                          .filter(user => 
                            user._id !== formData.owner && 
                            !formData.members.includes(user._id) &&
                            user.role === 'mahasiswa'
                          )
                          .map((user) => (
                            <div 
                              key={user._id} 
                              className="flex items-center gap-2 p-2 hover:bg-neutral-50 rounded cursor-pointer"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  members: [...formData.members, user._id]
                                });
                              }}
                            >
                              <div className="h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                                <User className="h-3 w-3 text-neutral-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                              </div>
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                {user.role}
                              </Badge>
                              <Plus className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                            </div>
                          ))}
                        {allUsers.filter(user => 
                          user._id !== formData.owner && 
                          !formData.members.includes(user._id) &&
                          user.role === 'mahasiswa'
                        ).length === 0 && (
                          <p className="text-sm text-neutral-500 text-center py-4">
                            Tidak ada mahasiswa tersedia
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.isActive ? "active" : "inactive"}
                onValueChange={(value) => setFormData({ ...formData, isActive: value === "active" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setGroupToEdit(null);
                setFormData({ name: "", description: "", isActive: true, owner: "", members: [] });
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
            <DialogTitle>Hapus Grup</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus grup "{groupToDelete?.name}"?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setGroupToDelete(null);
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
