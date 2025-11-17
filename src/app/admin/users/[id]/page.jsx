"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  Mail,
  User,
  ShieldCheck,
  Calendar,
  Award,
} from "lucide-react";
import Link from "next/link";

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUserDetail();
  }, [params.id]);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const user = await apiClient.get(`/users/profile/${params.id}`);
      // apiClient.get returns data directly, not wrapped
      setUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data pengguna",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.delete(`/users/${params.id}`);
      toast({
        title: "Berhasil",
        description: "Pengguna berhasil dihapus",
      });
      router.push("/admin/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menghapus pengguna",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
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
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-neutral-500">Pengguna tidak ditemukan</p>
          <Link href="/admin/users">
            <Button className="mt-4">Kembali ke Daftar Pengguna</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Detail Pengguna</h1>
            <p className="text-sm text-neutral-500">
              Informasi lengkap pengguna
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/users/${params.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus
          </Button>
        </div>
      </div>

      {/* User Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-neutral-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-500">Nama</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-neutral-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-neutral-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-500">Role</p>
                  <div className="mt-1">{getRoleBadge(user.role)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-neutral-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-500">Tanggal Dibuat</p>
                  <p className="font-medium">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-neutral-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-500">Terakhir Diupdate</p>
                  <p className="font-medium">
                    {user.updatedAt
                      ? new Date(user.updatedAt).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Competencies */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <CardTitle className="text-lg">Kompetensi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {user.competencies && user.competencies.length > 0 ? (
                <div className="space-y-2">
                  {user.competencies.map((comp) => (
                    <Badge
                      key={comp._id}
                      variant="outline"
                      className="mr-2 mb-2"
                    >
                      {comp.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">
                  Belum ada kompetensi
                </p>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Terverifikasi</span>
                <Badge
                  variant={user.isVerified ? "default" : "secondary"}
                  className={
                    user.isVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {user.isVerified ? "Ya" : "Belum"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Role Disetujui</span>
                <Badge
                  variant={user.roleApproved ? "default" : "secondary"}
                  className={
                    user.roleApproved
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {user.roleApproved ? "Ya" : "Belum"}
                </Badge>
              </div>
              {user.pendingRole && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-neutral-500">Role yang Diminta</p>
                  <p className="font-medium text-orange-600">
                    {user.pendingRole}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengguna{" "}
              <span className="font-semibold">{user.name}</span>? Tindakan ini
              tidak dapat dibatalkan.
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
