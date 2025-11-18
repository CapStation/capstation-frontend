"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingRoles, setPendingRoles] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [roleToApprove, setRoleToApprove] = useState(null);
  const [approving, setApproving] = useState(false);
  const [showValidateDialog, setShowValidateDialog] = useState(false);
  const [userToValidate, setUserToValidate] = useState(null);
  const [validating, setValidating] = useState(false);
  const [allUsersCount, setAllUsersCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const limitOptions = [10, 15, 25, 50, 100];

  useEffect(() => {
    fetchUsers();
    fetchPendingRoles();
  }, [
    currentPage,
    roleFilter,
    verificationFilter,
    approvalFilter,
    sortBy,
    searchQuery,
    itemsPerPage,
  ]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await AdminService.getAllUsers();
      if (result.success) {
        let filteredUsers = result.data || [];

        // Store total count before filtering
        setAllUsersCount(filteredUsers.length);

        // Apply filters
        if (roleFilter !== "all") {
          filteredUsers = filteredUsers.filter((u) => u.role === roleFilter);
        }

        if (verificationFilter !== "all") {
          const isVerified = verificationFilter === "verified";
          filteredUsers = filteredUsers.filter(
            (u) => u.isVerified === isVerified
          );
        }

        if (approvalFilter !== "all") {
          const isApproved = approvalFilter === "approved";
          filteredUsers = filteredUsers.filter(
            (u) => u.roleApproved === isApproved
          );
        }

        if (searchQuery) {
          filteredUsers = filteredUsers.filter(
            (u) =>
              u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.email?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Sort
        switch (sortBy) {
          case "newest":
            filteredUsers.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            break;
          case "oldest":
            filteredUsers.sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
            break;
          case "alphabetical":
            filteredUsers.sort((a, b) =>
              (a.name || "").localeCompare(b.name || "")
            );
            break;
        }

        // Pagination
        const total = Math.ceil(filteredUsers.length / itemsPerPage);
        setTotalPages(total);
        setTotalUsers(filteredUsers.length);

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

  const confirmApproveRole = async () => {
    if (!roleToApprove) return;

    setApproving(true);
    try {
      await handleApproveRole(roleToApprove._id);
      setShowApproveDialog(false);
      setRoleToApprove(null);
    } catch (error) {
      console.error("Error approving role:", error);
    } finally {
      setApproving(false);
    }
  };

  // Helper function to check if user has pending role
  const getUserPendingRole = (userId) => {
    return pendingRoles.find((pr) => pr.user?._id === userId);
  };

  const handleValidateRole = async () => {
    if (!userToValidate) return;

    setValidating(true);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_URL}/users/${userToValidate._id}/validate-role`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ roleApproved: true }),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: `Role ${userToValidate.role} untuk ${userToValidate.name} berhasil divalidasi`,
        });
        setShowValidateDialog(false);
        setUserToValidate(null);
        fetchUsers();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Gagal memvalidasi role",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error validating role:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memvalidasi role",
        variant: "destructive",
      });
    } finally {
      setValidating(false);
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
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
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
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("accessToken");

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
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Gagal mengekspor pengguna");
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pengguna_capstation_${
        new Date().toISOString().split("T")[0]
      }.csv`;
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
      console.error("Export error:", error);
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
      mahasiswa: {
        label: "Mahasiswa",
        className: "bg-green-100 text-green-700",
      },
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
    setVerificationFilter("all");
    setApprovalFilter("all");
    setSortBy("newest");
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
                      <span className="font-semibold">
                        {request.requestedRole}
                      </span>
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
            <Badge
              variant="secondary"
              className="text-sm px-3 py-1 font-medium"
            >
              {allUsersCount} Pengguna
            </Badge>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Ekspor
            </Button>
          </div>
        </div>
        <p className="text-neutral-600">Kelola akun pengguna dan hak akses</p>
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
                  placeholder="Cari pengguna..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Create Button */}
            <Link href="/admin/users/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pengguna
              </Button>
            </Link>
          </div>

          {/* Second Row - Filters with Labels */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Role Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                  <SelectItem value="dosen">Dosen</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Verification Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Verifikasi</label>
              <Select
                value={verificationFilter}
                onValueChange={setVerificationFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status Verifikasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="verified">Terverifikasi</SelectItem>
                  <SelectItem value="unverified">Belum Verifikasi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Approval Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Approval Role</label>
              <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Approval Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="unapproved">Belum Disetujui</SelectItem>
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
              {searchQuery ||
              roleFilter !== "all" ||
              verificationFilter !== "all" ||
              approvalFilter !== "all" ||
              sortBy !== "newest" ? (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
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
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <p>Tidak ada pengguna ditemukan</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-lg">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F1F7FA] hover:bg-[#F1F7FA]">
                        <TableHead className="text-neutral-900 font-bold">
                          Nama
                        </TableHead>
                        <TableHead className="text-neutral-900 font-bold">
                          Email
                        </TableHead>
                        <TableHead className="text-center text-neutral-900 font-bold">
                          Role
                        </TableHead>
                        <TableHead className="text-center text-neutral-900 font-bold">
                          Status Verifikasi
                        </TableHead>
                        <TableHead className="text-center text-neutral-900 font-bold">
                          Approval Role
                        </TableHead>
                        <TableHead className="text-center text-neutral-900 font-bold">
                          Validasi Role
                        </TableHead>
                        <TableHead className="text-neutral-900 font-bold">
                          Tanggal Dibuat
                        </TableHead>
                        <TableHead className="text-center text-neutral-900 font-bold">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">
                            {user.name}
                          </TableCell>
                          <TableCell className="text-sm text-neutral-600">
                            {user.email}
                          </TableCell>
                          <TableCell className="text-center">
                            {getRoleBadge(user.role)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                user.isVerified ? "default" : "secondary"
                              }
                              className={`text-xs ${
                                user.isVerified
                                  ? "bg-green-300 hover:bg-green-400"
                                  : ""
                              }`}
                            >
                              {user.isVerified ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />{" "}
                                  Terverifikasi
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" /> Belum
                                  Verifikasi
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                user.roleApproved ? "default" : "secondary"
                              }
                              className={`text-xs ${
                                user.roleApproved
                                  ? "bg-green-300 hover:bg-green-400"
                                  : ""
                              }`}
                            >
                              {user.roleApproved ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />{" "}
                                  Disetujui
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" /> Belum
                                  Disetujui
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {!user.roleApproved ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setUserToValidate(user);
                                  setShowValidateDialog(true);
                                }}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Validasi role"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            ) : (
                              <span className="text-xs text-neutral-400">
                                -
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-neutral-600">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(
                                  "id-ID"
                                )
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              {getUserPendingRole(user._id) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setRoleToApprove(
                                      getUserPendingRole(user._id)
                                    );
                                    setShowApproveDialog(true);
                                  }}
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Setujui role"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              )}
                              <Link href={`/admin/users/${user._id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/admin/users/${user._id}/edit`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
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
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, totalUsers)} dari{" "}
                    {totalUsers} pengguna
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
                        {limitOptions.map((limit) => (
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
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
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
                              (page >= currentPage - 1 &&
                                page <= currentPage + 1)
                            ) {
                              return (
                                <Button
                                  key={page}
                                  variant={
                                    currentPage === page ? "default" : "outline"
                                  }
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className={
                                    currentPage === page
                                      ? "bg-[#B6EB75] hover:bg-[#B6EB75]/90 text-neutral-900"
                                      : "hover:bg-[#FFE49C] hover:text-neutral-900"
                                  }
                                >
                                  {page}
                                </Button>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return (
                                <span key={page} className="px-2">
                                  ...
                                </span>
                              );
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

      {/* Approve Role Confirmation Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Konfirmasi Persetujuan Role
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menyetujui permintaan role untuk pengguna
              berikut?
            </DialogDescription>
          </DialogHeader>

          {roleToApprove && (
            <div className="p-4 bg-neutral-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-600">
                  Nama:
                </span>
                <span className="text-sm font-semibold text-neutral-900">
                  {roleToApprove.user?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-600">
                  Email:
                </span>
                <span className="text-sm text-neutral-900">
                  {roleToApprove.user?.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-600">
                  Role Saat Ini:
                </span>
                <Badge variant="outline" className="text-xs">
                  {roleToApprove.user?.role || "user"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-600">
                  Role Diminta:
                </span>
                <Badge className="text-xs bg-green-600">
                  {roleToApprove.requestedRole}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setRoleToApprove(null);
              }}
              disabled={approving}
            >
              Batal
            </Button>
            <Button
              onClick={confirmApproveRole}
              disabled={approving}
              className="bg-green-600 hover:bg-green-700"
            >
              {approving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Setujui
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validate Role Confirmation Dialog */}
      <Dialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Konfirmasi Validasi Role
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin memvalidasi role untuk pengguna berikut?
            </DialogDescription>
          </DialogHeader>

          {userToValidate && (
            <div className="p-4 bg-neutral-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-600">
                  Nama:
                </span>
                <span className="text-sm font-semibold text-neutral-900">
                  {userToValidate.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-600">
                  Email:
                </span>
                <span className="text-sm text-neutral-900">
                  {userToValidate.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-600">
                  Role:
                </span>
                {getRoleBadge(userToValidate.role)}
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-600">
                  Status Approval:
                </span>
                <Badge variant="secondary" className="text-xs">
                  <XCircle className="h-3 w-3 mr-1" />
                  Belum Disetujui
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowValidateDialog(false);
                setUserToValidate(null);
              }}
              disabled={validating}
            >
              Batal
            </Button>
            <Button
              onClick={handleValidateRole}
              disabled={validating}
              className="bg-green-300 hover:bg-green-400"
            >
              {validating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memvalidasi...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validasi
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
