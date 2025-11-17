"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

export default function AdminUserEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    isVerified: false,
    roleApproved: false,
  });

  useEffect(() => {
    fetchUserDetail();
  }, [params.id]);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const user = await apiClient.get(`/users/profile/${params.id}`);
      console.log("User data received:", user);
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        role: user?.role || "",
        password: "",
        isVerified: user?.isVerified || false,
        roleApproved: user?.roleApproved || false,
      });
      console.log("Form data set:", {
        name: user?.name || "",
        email: user?.email || "",
        role: user?.role || "",
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare update data
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isVerified: formData.isVerified,
        roleApproved: formData.roleApproved,
      };

      // Only include password if it's provided
      if (formData.password && formData.password.trim() !== "") {
        updateData.password = formData.password;
      }

      await apiClient.put(`/users/${params.id}`, updateData);

      toast({
        title: "Berhasil",
        description: "Data pengguna berhasil diperbarui",
      });

      router.push(`/admin/users/${params.id}`);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal memperbarui pengguna",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tombol Kembali */}
      <div className="mb-4">
        <Link href={`/admin/users/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
      </div>

      {/* Judul dan Deskripsi */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Pengguna</h1>
        <p className="text-sm text-neutral-500">Perbarui informasi pengguna</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pengguna</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nama <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    key={`name-${formData.name}`}
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    key={`email-${formData.email}`}
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    key={`role-${formData.role}`}
                    value={formData.role}
                    onValueChange={(value) => handleChange("role", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                      <SelectItem value="dosen">Dosen</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Password (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password Baru (Opsional)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Kosongkan jika tidak ingin mengubah"
                  />
                  <p className="text-xs text-neutral-500">
                    Minimal 6 karakter. Kosongkan jika tidak ingin mengubah
                    password.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Status & Verifikasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Verified Status */}
                <div className="space-y-2">
                  <Label htmlFor="isVerified">Status Verifikasi</Label>
                  <Select
                    value={formData.isVerified.toString()}
                    onValueChange={(value) =>
                      handleChange("isVerified", value === "true")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Terverifikasi</SelectItem>
                      <SelectItem value="false">Belum Terverifikasi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Role Approved */}
                <div className="space-y-2">
                  <Label htmlFor="roleApproved">Role Disetujui</Label>
                  <Select
                    value={formData.roleApproved.toString()}
                    onValueChange={(value) =>
                      handleChange("roleApproved", value === "true")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Disetujui</SelectItem>
                      <SelectItem value="false">Belum Disetujui</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                  <Link href={`/admin/users/${params.id}`} className="block">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={saving}
                    >
                      Batal
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
