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
  X,
  CheckCircle,
  XCircle,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingRoles, setPendingRoles] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
    fetchPendingRoles();
  }, [currentPage, roleFilter, searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await AdminService.getAllUsers();
      if (result.success) {
        let filteredUsers = result.data || [];

        // Apply filters
        if (roleFilter !== "all") {
          filteredUsers = filteredUsers.filter((u) => u.role === roleFilter);
        }

        if (searchQuery) {
          filteredUsers = filteredUsers.filter(
            (u) =>
              u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.email?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Pagination
        const total = Math.ceil(filteredUsers.length / itemsPerPage);
        setTotalPages(total);

        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedUsers = filteredUsers.slice(
          startIndex,
          startIndex + itemsPerPage
        );

        setUsers(paginatedUsers);
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal memuat data pengguna",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data pengguna",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRoles = async () => {
    setLoadingPending(true);
    try {
      const result = await AdminService.getPendingRoles();
      if (result.success) {
        setPendingRoles(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching pending roles:", error);
    } finally {
      setLoadingPending(false);
    }
  };

  const handleApproveRole = async (requestId) => {
    try {
      const result = await AdminService.approveRole(requestId);
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Permintaan role berhasil disetujui",
        });
        fetchPendingRoles();
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal menyetujui permintaan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error approving role:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyetujui permintaan",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userToDelete._id}`,
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
          description: "Pengguna berhasil dihapus",
        });
        setShowDeleteDialog(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Gagal menghapus pengguna",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus pengguna",
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
        title: "Mengekspor pengguna...",
        description: "Mohon tunggu sebentar",
      });

      const response = await fetch(`${API_URL}/users/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Gagal mengekspor pengguna');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pengguna_capstation_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Berhasil",
        description: "Data pengguna berhasil diekspor",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal mengekspor pengguna",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      admin: { label: "Admin", className: "bg-red-100 text-red-700" },
      dosen: { label: "Dosen", className: "bg-blue-100 text-blue-700" },
      mahasiswa: { label: "Mahasiswa", className: "bg-green-100 text-green-700" },
      user: { label: "Mahasiswa", className: "bg-green-100 text-green-700" },
    };

    const config = roleMap[role] || {
      label: role,
      className: "bg-gray-100 text-gray-700",
    };

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="p-8">
      {/* Pending Role Requests */}
      {pendingRoles.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <UserCheck className="h-5 w-5" />
              Permintaan Role Tertunda ({pendingRoles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRoles.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">
                      {request.user?.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {request.user?.email} → Mengajukan role:{" "}
                      <span className="font-semibold">{request.requestedRole}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveRole(request._id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Tolak
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-neutral-900">
            Kelola Pengguna
          </h1>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">
              {users.length} Pengguna
            </Badge>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Ekspor
            </Button>
          </div>
        </div>
        <p className="text-neutral-600">
          Kelola akun pengguna dan hak akses
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
                  placeholder="Cari pengguna..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                <SelectItem value="dosen">Dosen</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || roleFilter !== "all") && (
              <Button variant="outline" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Create Button */}
            <Link href="/admin/users/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pengguna
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <p>Tidak ada pengguna ditemukan</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Tanggal Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID") : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/users/${user._id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/users/${user._id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUserToDelete(user);
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
            <DialogTitle>Hapus Pengguna</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengguna "{userToDelete?.name}"?
              Tindakan ini tidak dapat dibatalkan.
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
