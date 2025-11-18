"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Search, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CompetencyService from "@/services/CompetencyService";
import Link from "next/link";
import projectService from "@/services/ProjectService";
import UserService from "@/services/UserService";
import GroupService from "@/services/GroupService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userGroup, setUserGroup] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
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
    keywords: "",
    semester: "",
    year: "",
    academicYear: "",
  });
  const [projectCompetencies, setProjectCompetencies] = useState([]);
  const [showAddCompetencyDialog, setShowAddCompetencyDialog] = useState(false);
  const [allCompetencies, setAllCompetencies] = useState([]);
  const [filteredCompetencies, setFilteredCompetencies] = useState([]);
  const [competencyCategories, setCompetencyCategories] = useState([]);
  const [selectedCompetencyCategory, setSelectedCompetencyCategory] = useState('all');
  const [competencySearchQuery, setCompetencySearchQuery] = useState('');
  const [loadingCompetencyDialog, setLoadingCompetencyDialog] = useState(false);
  const [addingCompetency, setAddingCompetency] = useState(false);
  
  // Remove competency dialog
  const [showRemoveCompDialog, setShowRemoveCompDialog] = useState(false);
  const [compIndexToRemove, setCompIndexToRemove] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadUserGroup();
      loadDosenList();
    }
  }, [user]);

  useEffect(() => {
    // Auto-generate academicYear when semester and year are selected
    if (formData.semester && formData.year) {
      const academicYear = `${formData.semester}-${formData.year}`;
      setFormData(prev => ({ ...prev, academicYear }));
    }
  }, [formData.semester, formData.year]);

  const loadUserGroup = async () => {
    setLoadingGroup(true);
    try {
      const result = await GroupService.getUserGroups();
      if (result.success && result.data && result.data.length > 0) {
        setUserGroup(result.data[0]); // Take the first group
        console.log('👥 User group loaded:', result.data[0]);
      } else {
        toast({
          title: "Tidak Ada Grup",
          description: "Anda harus bergabung dengan grup terlebih dahulu untuk membuat proyek",
          variant: "destructive",
        });
        router.push('/groups');
      }
    } catch (error) {
      console.error('Error loading user group:', error);
      toast({
        title: "Error",
        description: "Gagal memuat informasi grup. Pastikan Anda sudah bergabung dengan grup.",
        variant: "destructive",
      });
      router.push('/groups');
    } finally {
      setLoadingGroup(false);
    }
  };

  const loadDosenList = async () => {
    setLoadingDosen(true);
    try {
      const result = await UserService.getAllUsers();
      if (result.success && result.data) {
        // Filter hanya dosen yang terverifikasi dan role approved
        const dosenUsers = result.data.filter(user => 
          user.role === 'dosen' && 
          user.isVerified === true && 
          user.roleApproved === true
        );
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
      console.error('Failed to load competencies:', error);
      toast({ title: 'Error', description: 'Gagal memuat daftar kompetensi', variant: 'destructive' });
    } finally {
      setLoadingCompetencyDialog(false);
    }
  };

  const handleOpenAddCompetencyDialog = () => {
    if (projectCompetencies.length >= 20) {
      toast({ title: 'Limit Tercapai', description: 'Maksimal 20 kompetensi', variant: 'destructive' });
      return;
    }
    setShowAddCompetencyDialog(true);
    loadAvailableCompetencies();
  };

  const handleAddProjectCompetency = async (competencyId) => {
    setAddingCompetency(true);
    try {
      // find competency object
      const comp = allCompetencies.find(c => (c._id || c.id) === competencyId || c._id === competencyId);
      if (comp) {
        // prevent duplicates
        const exists = projectCompetencies.some(c => (c._id || c.id || c) === (comp._id || comp.id || comp));
        if (!exists) {
          setProjectCompetencies(prev => [...prev, comp]);
        }
      } else {
        // fallback: push id
        setProjectCompetencies(prev => [...prev, competencyId]);
      }
      setShowAddCompetencyDialog(false);
      toast({ title: 'Berhasil', description: 'Kompetensi ditambahkan' });
    } catch (error) {
      console.error('Add competency error:', error);
      toast({ title: 'Error', description: 'Gagal menambahkan kompetensi', variant: 'destructive' });
    } finally {
      setAddingCompetency(false);
    }
  };

  const handleRemoveProjectCompetency = () => {
    if (compIndexToRemove === null) return;
    setProjectCompetencies(prev => prev.filter((_, i) => i !== compIndexToRemove));
    setShowRemoveCompDialog(false);
    setCompIndexToRemove(null);
    toast({
      title: "Berhasil",
      description: "Kompetensi berhasil dihapus dari proyek",
    });
  };

  // Filter competencies list when searching or category changes
  useEffect(() => {
    if (!allCompetencies.length) return;
    let filtered = [...allCompetencies];
    if (selectedCompetencyCategory && selectedCompetencyCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCompetencyCategory);
    }
    if (competencySearchQuery.trim()) {
      const q = competencySearchQuery.toLowerCase();
      filtered = filtered.filter(c => (c.name || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q));
    }
    const existingIds = projectCompetencies.map(c => c._id?.toString() || c.toString());
    filtered = filtered.filter(c => !existingIds.includes(c._id?.toString() || c.toString()));
    setFilteredCompetencies(filtered);
  }, [selectedCompetencyCategory, competencySearchQuery, allCompetencies, projectCompetencies]);

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      years.push(i.toString());
    }
    return years;
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

    console.log('🔍 Debug - userGroup:', userGroup);
    console.log('🔍 Debug - userGroup._id:', userGroup?._id);

    // Check if user has group
    if (!userGroup) {
      toast({
        title: "Tidak Ada Grup",
        description: "Anda harus bergabung dengan grup terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare data to send
      const submitData = {
        ...formData,
        group: userGroup._id, // Add group ID (backend expects 'group' not 'groupId')
        academicYear: formData.academicYear || undefined, // Only send if filled
        competencies: projectCompetencies ? projectCompetencies.map(c => c._id || c.id || c) : [],
      };
      
      console.log('📤 Creating project with data:', JSON.stringify(submitData, null, 2));
      console.log('🔍 submitData.group specifically:', submitData.group);
      
      const result = await projectService.createProject(submitData);
      
      console.log('📥 Create project result:', JSON.stringify(result, null, 2));
      
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

  if (authLoading || loadingGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="h-10 w-32 bg-neutral-200 rounded animate-pulse mb-6" />
            <div className="h-8 w-64 bg-neutral-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-96 bg-neutral-200 rounded animate-pulse mb-8" />
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 w-48 bg-neutral-200 rounded animate-pulse mb-4" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                    <div className="h-10 w-full bg-neutral-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
                  <Label htmlFor="tema">Tema</Label>
                  <Select
                    value={formData.tema}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, tema: value }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Pilih Tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kesehatan">Kesehatan</SelectItem>
                      <SelectItem value="pengelolaan_sampah">
                        Pengelolaan Sampah
                      </SelectItem>
                      <SelectItem value="smart_city">Smart City</SelectItem>
                      <SelectItem value="transportasi_ramah_lingkungan">
                        Transportasi Ramah Lingkungan
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="supervisor">Dosen Pembimbing</Label>
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
                  <p className="text-xs text-amber-600 mt-2 font-medium">
                    ⚠️ Pastikan Nama Dosen sesuai dengan plottingan yang sudah ada. Nama dosen tidak dapat diubah setelah proyek dibuat.
                  </p>
                </div>

                <div>
                  <Label>Tahun Ajaran</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Select
                        value={formData.semester}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, semester: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gasal">Gasal</SelectItem>
                          <SelectItem value="Genap">Genap</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select
                        value={formData.year}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, year: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateYearOptions().map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {formData.academicYear && (
                    <p className="text-xs text-neutral-500 mt-2">
                      Tahun Ajaran: <span className="font-semibold text-neutral-700">{formData.academicYear}</span>
                    </p>
                  )}
                </div>

                <div>
                  <Label>Kompetensi</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {projectCompetencies.length > 0 ? (
                      projectCompetencies.map((c, idx) => (
                        <Badge key={c._id || c.id || c} className="flex items-center gap-2">
                          <span>{c.name || c}</span>
                          <button 
                            type="button" 
                            onClick={() => {
                              setCompIndexToRemove(idx);
                              setShowRemoveCompDialog(true);
                            }} 
                            className="ml-2"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-neutral-500">Belum ada kompetensi ditambahkan</p>
                    )}
                  </div>
                  <div className="mt-2">
                    <Button type="button" onClick={handleOpenAddCompetencyDialog} variant="outline" className="inline-flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Tambah Kompetensi
                    </Button>
                  </div>

                  <Dialog open={showAddCompetencyDialog} onOpenChange={setShowAddCompetencyDialog}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambahkan Kompetensi</DialogTitle>
                        <DialogDescription>Pilih kompetensi yang ingin ditambahkan ke proyek</DialogDescription>
                      </DialogHeader>
                      <div className="mt-4">
                        <div className="flex gap-2 mb-2">
                          <select value={selectedCompetencyCategory} onChange={e => setSelectedCompetencyCategory(e.target.value)} className="border rounded p-2">
                            <option value="all">Semua Kategori</option>
                            {competencyCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <Input placeholder="Cari kompetensi..." value={competencySearchQuery} onChange={e => setCompetencySearchQuery(e.target.value)} />
                        </div>
                        <div className="max-h-60 overflow-y-auto grid grid-cols-1 gap-2">
                          {loadingCompetencyDialog ? (
                            <div className="p-4 text-center"><Loader2 className="animate-spin h-4 w-4 mx-auto" /></div>
                          ) : filteredCompetencies.length === 0 ? (
                            <div className="p-4 text-center text-neutral-500">Tidak ada kompetensi</div>
                          ) : (
                            filteredCompetencies.map(comp => (
                              <div key={comp._id || comp.id || comp} className="flex items-center justify-between p-2 border rounded-md">
                                <div>
                                  <div className="font-medium">{comp.name}</div>
                                  <div className="text-xs text-neutral-500">{comp.category}</div>
                                </div>
                                <div>
                                  <Button type="button" size="sm" onClick={() => handleAddProjectCompetency(comp._id || comp.id || comp)} disabled={addingCompetency}>
                                    Tambah
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowAddCompetencyDialog(false)}>Tutup</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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

      {/* Remove Competency Confirmation Dialog */}
      <Dialog open={showRemoveCompDialog} onOpenChange={setShowRemoveCompDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Kompetensi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kompetensi ini dari proyek?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRemoveCompDialog(false);
                setCompIndexToRemove(null);
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveProjectCompetency}
            >
              <X className="w-4 h-4 mr-2" />
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}