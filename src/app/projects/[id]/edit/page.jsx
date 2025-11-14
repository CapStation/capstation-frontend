"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import Link from "next/link";
import projectService from "@/services/ProjectService";
import UserService from "@/services/UserService";
import { useToast } from "@/hooks/use-toast";

const TEMA_OPTIONS = [
  { value: "kesehatan", label: "Kesehatan" },
  { value: "pengelolaan-sampah", label: "Pengelolaan Sampah" },
  { value: "smart-city", label: "Smart City" },
  { value: "transportasi-ramah-lingkungan", label: "Transportasi Ramah Lingkungan" },
];

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const [dosenList, setDosenList] = useState([]);
  const [filteredDosenList, setFilteredDosenList] = useState([]);
  const [loadingDosen, setLoadingDosen] = useState(true);
  const [showDosenDropdown, setShowDosenDropdown] = useState(false);
  const [dosenSearchQuery, setDosenSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tema: "",
    supervisor: "",
    supervisorName: "",
    tags: "",
    group: "",
  });

  useEffect(() => {
    if (params.id) {
      loadProject();
      loadDosenList();
    }
  }, [params.id]);

  const loadDosenList = async () => {
    setLoadingDosen(true);
    try {
      // Fetch all users with role dosen
      const result = await UserService.getAllUsers();
      if (result.success && result.data) {
        const dosenUsers = result.data.filter(user => user.role === 'dosen');
        setDosenList(dosenUsers);
        setFilteredDosenList(dosenUsers);
      }
    } catch (error) {
      console.error("Failed to load dosen list:", error);
    } finally {
      setLoadingDosen(false);
    }
  };

  const handleDosenSearch = (query) => {
    setDosenSearchQuery(query);
    if (!query.trim()) {
      setFilteredDosenList(dosenList);
      return;
    }
    const filtered = dosenList.filter(dosen =>
      dosen.name.toLowerCase().includes(query.toLowerCase()) ||
      dosen.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDosenList(filtered);
  };

  const selectDosen = (dosen) => {
    setFormData(prev => ({
      ...prev,
      supervisor: dosen._id,
      supervisorName: dosen.name,
    }));
    setShowDosenDropdown(false);
    setDosenSearchQuery("");
    setFilteredDosenList(dosenList);
  };

  const loadProject = async () => {
    setLoading(true);
    try {
      const result = await projectService.getProjectById(params.id);
      if (result.success) {
        const project = result.data;
        
        // Store group info for display
        if (project.group) {
          setGroupInfo({
            id: project.group._id || project.group,
            name: project.group.name || "Loading...",
          });
        }
        
        setFormData({
          title: project.title || "",
          description: project.description || "",
          tema: project.tema || "",
          supervisor: project.supervisor?._id || project.supervisor || "",
          supervisorName: project.supervisor?.name || "",
          tags: Array.isArray(project.tags) ? project.tags.join(", ") : "",
          group: project.group?._id || project.group || "",
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
      // Prepare update data - only send fields that should be updated
      // Exclude group field as it cannot be changed via edit
      const updateData = {
        title: formData.title,
        description: formData.description,
      };

      // Only include optional fields if they have values
      if (formData.tema) updateData.tema = formData.tema;
      if (formData.tags) {
        // Convert comma-separated tags to array
        updateData.tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
      
      // Only include supervisor if it's a valid ObjectId (24 hex characters)
      if (formData.supervisor && /^[0-9a-fA-F]{24}$/.test(formData.supervisor)) {
        updateData.supervisor = formData.supervisor;
      }

      console.log('📤 Attempting to update project:', {
        projectId: params.id,
        updateData: updateData,
      });
      
      const result = await projectService.updateProject(params.id, updateData);

      console.log('📥 Update result:', result);

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Proyek berhasil diupdate",
        });
        router.replace(`/projects/${params.id}`);
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
                  <Label htmlFor="tema">
                    Tema Proyek <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.tema}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, tema: value }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Pilih tema proyek" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMA_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="supervisor">
                    Dosen Pembimbing <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <div 
                      className="flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded-md cursor-pointer hover:bg-neutral-50"
                      onClick={() => setShowDosenDropdown(!showDosenDropdown)}
                    >
                      <Search className="h-4 w-4 text-neutral-500" />
                      <span className={formData.supervisorName ? "text-neutral-900" : "text-neutral-500"}>
                        {formData.supervisorName || "Pilih dosen pembimbing..."}
                      </span>
                    </div>
                    
                    {showDosenDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-64 overflow-hidden">
                        <div className="p-2 border-b">
                          <Input
                            type="text"
                            placeholder="Cari dosen..."
                            value={dosenSearchQuery}
                            onChange={(e) => handleDosenSearch(e.target.value)}
                            className="w-full"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {loadingDosen ? (
                            <div className="p-4 text-center text-neutral-500">
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            </div>
                          ) : filteredDosenList.length === 0 ? (
                            <div className="p-4 text-center text-neutral-500 text-sm">
                              Dosen tidak ditemukan
                            </div>
                          ) : (
                            filteredDosenList.map((dosen) => (
                              <div
                                key={dosen._id}
                                className={`px-3 py-2 hover:bg-neutral-100 cursor-pointer ${
                                  formData.supervisor === dosen._id ? 'bg-neutral-50' : ''
                                }`}
                                onClick={() => selectDosen(dosen)}
                              >
                                <div className="font-medium text-neutral-900">{dosen.name}</div>
                                <div className="text-xs text-neutral-500">{dosen.email}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Pisahkan dengan koma: iot, sensor, monitoring"
                    className="mt-2"
                  />
                </div>

                {groupInfo && (
                  <div>
                    <Label>Grup</Label>
                    <div className="mt-2 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-neutral-700">
                      {groupInfo.name}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Grup otomatis terisi berdasarkan grup Anda saat ini
                    </p>
                  </div>
                )}

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
