"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import projectService from "@/services/ProjectService";
import { useToast } from "@/hooks/use-toast";

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    supervisor: "",
    keywords: "",
  });

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

    setLoading(true);
    try {
      const result = await projectService.createProject(formData);
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Proyek berhasil dibuat",
        });
        router.push("/projects");
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal membuat proyek",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat proyek",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
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
            <h1 className="text-3xl font-bold text-neutral-900">Buat Proyek Baru</h1>
            <p className="text-neutral-600 mt-2">
              Isi form di bawah untuk membuat proyek capstone baru
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
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Buat Proyek"
                    )}
                  </Button>
                  <Link href="/projects" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={loading}
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
