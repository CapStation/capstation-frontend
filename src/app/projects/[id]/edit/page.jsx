"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import projectService from "@/services/ProjectService";
import { useToast } from "@/hooks/use-toast";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    supervisor: "",
    keywords: "",
  });

  useEffect(() => {
    if (params.id) {
      loadProject();
    }
  }, [params.id]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const result = await projectService.getProjectById(params.id);
      if (result.success) {
        const project = result.data;
        setFormData({
          title: project.title || "",
          description: project.description || "",
          category: project.category || "",
          supervisor: project.supervisor || "",
          keywords: project.keywords || "",
        });
      } else {
        // Mock data if API fails
        setFormData({
          title: "Sistem Monitoring Tekanan Darah Pasien Penyakit Jantung Berbasis IoT",
          description: "Proyek ini bertujuan untuk mengembangkan sistem monitoring tekanan darah secara real-time menggunakan teknologi IoT untuk membantu pasien penyakit jantung memantau kondisi kesehatan mereka.",
          category: "IoT, Kesehatan",
          supervisor: "Prof. Dr.Eng. I. F. Danung Wijaya, S.T., M.T., IPM.",
          keywords: "IoT, Kesehatan, Monitoring, Tekanan Darah",
        });
      }
    } catch (error) {
      console.error("Failed to load project:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data proyek",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast({
        title: "Error",
        description: "Judul dan deskripsi wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const result = await projectService.updateProject(params.id, formData);

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Proyek berhasil diupdate",
        });
        router.push(`/projects/${params.id}`);
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal mengupdate proyek",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengupdate proyek",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-3xl font-bold text-neutral-900">Edit Proyek</h1>
            <p className="text-neutral-600 mt-2">
              Perbarui informasi proyek capstone Anda
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Proyek</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">
                    Judul Proyek <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Masukkan judul proyek capstone"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description">
                    Deskripsi Proyek <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Deskripsikan proyek Anda secara detail..."
                    required
                    rows={6}
                    className="mt-2 w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Contoh: IoT, Kesehatan, Transportasi"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="supervisor">Dosen Pembimbing</Label>
                  <Input
                    id="supervisor"
                    name="supervisor"
                    value={formData.supervisor}
                    onChange={handleChange}
                    placeholder="Nama dosen pembimbing (opsional)"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="keywords">Kata Kunci</Label>
                  <Input
                    id="keywords"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    placeholder="Pisahkan dengan koma: IoT, sensor, monitoring"
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90 flex-1"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </Button>
                  <Link href={`/projects/${params.id}`} className="flex-1">
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
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
