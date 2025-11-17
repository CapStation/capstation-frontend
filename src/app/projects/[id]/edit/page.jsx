"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Search, Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import projectService from "@/services/ProjectService";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-config";
import UserService from "@/services/UserService";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import CompetencyService from "@/services/CompetencyService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TEMA_OPTIONS = [
  { value: "kesehatan", label: "Kesehatan" },
  { value: "pengelolaan_sampah", label: "Pengelolaan Sampah" },
  { value: "smart_city", label: "Smart City" },
  { value: "transportasi_ramah_lingkungan", label: "Transportasi Ramah Lingkungan" },
];

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
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
  const [projectCompetencies, setProjectCompetencies] = useState([]);
  const [loadingCompetencies, setLoadingCompetencies] = useState(true);
  const [showAddCompetencyDialog, setShowAddCompetencyDialog] = useState(false);
  const [allCompetencies, setAllCompetencies] = useState([]);
  const [filteredCompetencies, setFilteredCompetencies] = useState([]);
  const [competencyCategories, setCompetencyCategories] = useState([]);
  const [selectedCompetencyCategory, setSelectedCompetencyCategory] = useState("all");
  const [competencySearchQuery, setCompetencySearchQuery] = useState("");
  const [loadingCompetencyDialog, setLoadingCompetencyDialog] = useState(false);
  const [addingCompetency, setAddingCompetency] = useState(false);
  const [project, setProject] = useState(null);

  // Helper to check if current user can edit this project
  const canEditProject = () => {
    if (!user || !project) return false;

    if (user.role === 'admin') return true;

    const isOwner = typeof project.owner === 'string'
      ? project.owner === user.id
      : project.owner?._id === user.id;

    if (isOwner) return true;

    if (project.members && Array.isArray(project.members)) {
      const isMember = project.members.some(member => {
        if (typeof member === 'string') return member === user.id;
        return member?._id === user.id;
      });
      if (isMember) return true;
    }

    return false;
  };

  


  useEffect(() => {
    if (params.id) {
      loadProject();
      loadDosenList();
    }
  }, [params.id]);

  const loadProjectCompetencies = async () => {
    setLoadingCompetencies(true);
    try {
      let result;

      if (projectService && typeof projectService.getProjectCompetencies === 'function') {
        result = await projectService.getProjectCompetencies(params.id);
      } else {
        // Fallback: call API directly if service method is unavailable
        console.warn('projectService.getProjectCompetencies not available, using apiClient fallback');
        const fallbackEndpoint = `/projects/${params.id}/competencies`;
        const res = await apiClient.get(fallbackEndpoint);
        result = { success: true, data: res.data || res };
      }

      if (result.success) {
        setProjectCompetencies(result.data || []);
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to load project competencies:", error);
    } finally {
      setLoadingCompetencies(false);
    }
  };

  // Load available competencies for adding
  const loadAvailableCompetencies = async () => {
    setLoadingCompetencyDialog(true);
    try {
      const [competenciesResult, categoriesResult] = await Promise.all([
        CompetencyService.getAllCompetencies({ limit: 200 }),
        CompetencyService.getCompetencyCategories(),
      ]);

      if (competenciesResult.success) {
        setAllCompetencies(competenciesResult.data || []);
        setFilteredCompetencies(competenciesResult.data || []);
      }

      if (categoriesResult.success) {
        setCompetencyCategories(categoriesResult.data || []);
      }
    } catch (error) {
      console.error("Failed to load available competencies:", error);
      toast({
        title: "Error",
        description: "Gagal memuat daftar kompetensi",
        variant: "destructive",
      });
    } finally {
      setLoadingCompetencyDialog(false);
    }
  };

  // Handle opening add competency dialog
  const handleOpenAddCompetencyDialog = () => {
    if (projectCompetencies.length >= 20) {
      toast({
        title: "Limit Tercapai",
        description: "Proyek sudah mencapai maksimal 20 kompetensi",
        variant: "destructive",
      });
      return;
    }
    setShowAddCompetencyDialog(true);
    loadAvailableCompetencies();
  };

  // Handle adding competency to project
  const handleAddProjectCompetency = async (competencyId) => {
    setAddingCompetency(true);
    try {
      console.log('➕ Adding competency to project', { projectId: params.id, competencyId });
      let result;

      if (projectService && typeof projectService.addProjectCompetency === 'function') {
        result = await projectService.addProjectCompetency(params.id, competencyId);
      } else {
        console.warn('projectService.addProjectCompetency not available, using apiClient fallback');
        const res = await apiClient.post(`/projects/${params.id}/competencies`, { competencyId });
        result = { success: true, data: res.data || res, message: res.message || res };
      }
      console.log('📥 addProjectCompetency result:', result);

      // Normalize different response shapes
      const data = result?.data || result?.competencies || result || null;

      if (result && (result.success || Array.isArray(data))) {
        // If API returned the updated list, use it. Otherwise refetch.
        if (Array.isArray(data) && data.length >= 0) {
          setProjectCompetencies(data);
        } else {
          await loadProjectCompetencies();
        }

        setShowAddCompetencyDialog(false);
        toast({
          title: "Berhasil",
          description: result.message || "Kompetensi berhasil ditambahkan",
        });
      } else {
        console.warn('Add competency failed:', result);
        toast({
          title: "Error",
          description: result?.error || result?.message || "Gagal menambahkan kompetensi",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to add project competency:', error);
      toast({
        title: "Error",
        description: error?.message || "Gagal menambahkan kompetensi",
        variant: "destructive",
      });
    } finally {
      setAddingCompetency(false);
    }
  };

  // Handle removing competency from project
  const handleRemoveProjectCompetency = async (index) => {
    try {
      console.log('➖ Removing competency from project', { projectId: params.id, index });
      let result;

      if (projectService && typeof projectService.removeProjectCompetency === 'function') {
        result = await projectService.removeProjectCompetency(params.id, index);
      } else {
        console.warn('projectService.removeProjectCompetency not available, using apiClient fallback');
        const res = await apiClient.delete(`/projects/${params.id}/competencies/${index}`);
        result = { success: true, data: res.data || res, message: res.message || res };
      }
      console.log('📥 removeProjectCompetency result:', result);

      const data = result?.data || result?.competencies || result || null;
      if (result && (result.success || Array.isArray(data))) {
        if (Array.isArray(data) && data.length >= 0) {
          setProjectCompetencies(data);
        } else {
          await loadProjectCompetencies();
        }

        toast({
          title: "Berhasil",
          description: result.message || "Kompetensi berhasil dihapus",
        });
      } else {
        console.warn('Remove competency failed:', result);
        toast({
          title: "Error",
          description: result?.error || result?.message || "Gagal menghapus kompetensi",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to remove project competency:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus kompetensi",
        variant: "destructive",
      });
    }
  };

  // Filter competencies based on search and category
  useEffect(() => {
    if (!allCompetencies.length) return;

    let filtered = [...allCompetencies];

    if (selectedCompetencyCategory && selectedCompetencyCategory !== "all") {
      filtered = filtered.filter(c => c.category === selectedCompetencyCategory);
    }

    if (competencySearchQuery.trim()) {
      const query = competencySearchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      );
    }

    // Filter out already added competencies
    const projectCompIds = projectCompetencies.map(c => c._id?.toString() || c.toString());
    filtered = filtered.filter(c => !projectCompIds.includes(c._id?.toString() || c.toString()));

    setFilteredCompetencies(filtered);
  }, [selectedCompetencyCategory, competencySearchQuery, allCompetencies, projectCompetencies]);

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

  const getCategoryColor = (category) => {
  const colors = {
    'Programming Languages': 'bg-blue-100 text-blue-800',
    'Web Development': 'bg-green-100 text-green-800',
    'Mobile Development': 'bg-purple-100 text-purple-800',
    'Data Science': 'bg-orange-100 text-orange-800',
    'UI/UX Design': 'bg-pink-100 text-pink-800',
    'DevOps': 'bg-indigo-100 text-indigo-800',
    'Database': 'bg-yellow-100 text-yellow-800',
    'Cloud Computing': 'bg-cyan-100 text-cyan-800',
    'Artificial Intelligence': 'bg-red-100 text-red-800',
    'Cybersecurity': 'bg-gray-100 text-gray-800',
    'Project Management': 'bg-teal-100 text-teal-800',
    'Soft Skills': 'bg-lime-100 text-lime-800',
    'Others': 'bg-neutral-100 text-neutral-800',
  };
  return colors[category] || 'bg-neutral-100 text-neutral-800';
};

  useEffect(() => {
    if (project && user) {
      loadProjectCompetencies();
    }
  }, [project, user]);


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
        // store full project object so dependent effects can run
        setProject(project);
        
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
        const mockProject = {
          _id: params.id,
          title: "Sistem Monitoring Tekanan Darah Pasien Penyakit Jantung Berbasis IoT",
          description: "Proyek ini bertujuan untuk mengembangkan sistem monitoring tekanan darah secara real-time menggunakan teknologi IoT untuk membantu pasien penyakit jantung memantau kondisi kesehatan mereka.",
          category: "IoT, Kesehatan",
          supervisor: "Prof. Dr.Eng. I. F. Danung Wijaya, S.T., M.T., IPM.",
          keywords: "IoT, Kesehatan, Monitoring, Tekanan Darah",
        };
        setProject(mockProject);
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

                {/* Project Competencies Card */}
                {user && (
                  <Card className="mb-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Kompetensi Proyek</CardTitle>
                          <CardDescription>
                            Kelola kompetensi yang dibutuhkan untuk proyek ini (Maksimal 20)
                          </CardDescription>
                        </div>
                        {canEditProject() && (
                          <Button
                            type="button"
                            onClick={handleOpenAddCompetencyDialog}
                            size="sm"
                            disabled={projectCompetencies.length >= 20}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loadingCompetencies ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : projectCompetencies.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">
                            Belum ada kompetensi yang ditambahkan ke proyek ini
                          </p>
                          {canEditProject() && (
                            <Button type="button" onClick={handleOpenAddCompetencyDialog} variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Tambah Kompetensi Pertama
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {projectCompetencies.map((comp, index) => (
                              <Badge
                                key={index}
                                className={`${getCategoryColor(comp.category)} px-3 py-2 flex items-center gap-2`}
                              >
                                <span className="font-medium">{comp.name}</span>
                                {canEditProject() && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveProjectCompetency(index)}
                                    className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {projectCompetencies.length} / 20 kompetensi
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Add Competency Dialog */}
                <Dialog open={showAddCompetencyDialog} onOpenChange={setShowAddCompetencyDialog}>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tambah Kompetensi</DialogTitle>
                      <DialogDescription>
                        Pilih kompetensi yang ingin Anda tambahkan ke proyek ini
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      {/* Search and Filter */}
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Cari kompetensi..."
                            value={competencySearchQuery}
                            onChange={(e) => setCompetencySearchQuery(e.target.value)}
                            className="pl-9"
                          />
                        </div>

                        <Select value={selectedCompetencyCategory} onValueChange={setSelectedCompetencyCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {competencyCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Competencies List */}
                      {loadingCompetencyDialog ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : filteredCompetencies.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            {competencySearchQuery || selectedCompetencyCategory !== "all"
                              ? "Tidak ada kompetensi yang sesuai dengan filter"
                              : "Semua kompetensi telah ditambahkan"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {filteredCompetencies.map((comp) => (
                            <div
                              key={comp._id}
                              className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium">{comp.name}</p>
                                  <Badge variant="secondary" className="text-xs">
                                    {comp.category}
                                  </Badge>
                                </div>
                                {comp.description && (
                                  <p className="text-xs text-muted-foreground">{comp.description}</p>
                                )}
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleAddProjectCompetency(comp._id)}
                                disabled={addingCompetency}
                              >
                                {addingCompetency ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowAddCompetencyDialog(false)}>
                        Tutup
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div>
                  <Label htmlFor="supervisor">
                    Dosen Pembimbing <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <div 
                      className="flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded-md bg-neutral-50 cursor-not-allowed"
                    >
                      <Search className="h-4 w-4 text-neutral-400" />
                      <span className="text-neutral-600">
                        {formData.supervisorName || "Belum ada dosen pembimbing"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    ℹ️ Nama dosen tidak dapat diubah. Jika ada kesalahan pengisian dosen, silahkan hubungi akademik.
                  </p>
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
