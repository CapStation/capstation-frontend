"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  UserCircle,
  ArrowLeft,
  Loader2,
  Plus,
  X,
  Search,
} from "lucide-react";
import CompetencyService from "@/services/CompetencyService";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [myCompetencies, setMyCompetencies] = useState([]);
  const [loadingCompetencies, setLoadingCompetencies] = useState(true);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [allCompetencies, setAllCompetencies] = useState([]);
  const [filteredCompetencies, setFilteredCompetencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [addingCompetency, setAddingCompetency] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        setIsLoadingProfile(false);
        loadMyCompetencies();
      }
    }
  }, [loading, isAuthenticated, router]);

  const loadMyCompetencies = async () => {
    setLoadingCompetencies(true);
    try {
      const result = await CompetencyService.getMyCompetencies();
      if (result.success) {
        setMyCompetencies(result.data || []);
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to load competencies:", error);
    } finally {
      setLoadingCompetencies(false);
    }
  };

  const loadAvailableCompetencies = async () => {
    setLoadingDialog(true);
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
        setCategories(categoriesResult.data || []);
      }
    } catch (error) {
      console.error("Failed to load available competencies:", error);
      toast({
        title: "Error",
        description: "Gagal memuat daftar kompetensi",
        variant: "destructive",
      });
    } finally {
      setLoadingDialog(false);
    }
  };

  const handleOpenAddDialog = () => {
    if (myCompetencies.length >= 20) {
      toast({
        title: "Limit Tercapai",
        description: "Anda sudah mencapai maksimal 20 kompetensi",
        variant: "destructive",
      });
      return;
    }
    setShowAddDialog(true);
    loadAvailableCompetencies();
  };

  const handleAddCompetency = async (competencyId) => {
    setAddingCompetency(true);
    try {
      const result = await CompetencyService.addCompetency(competencyId);
      if (result.success) {
        setMyCompetencies(result.data || []);
        setShowAddDialog(false);
        toast({
          title: "Berhasil",
          description: result.message || "Kompetensi berhasil ditambahkan",
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan kompetensi",
        variant: "destructive",
      });
    } finally {
      setAddingCompetency(false);
    }
  };

  const handleRemoveCompetency = async (index) => {
    try {
      const result = await CompetencyService.removeCompetency(index);
      if (result.success) {
        setMyCompetencies(result.data || []);
        toast({
          title: "Berhasil",
          description: result.message || "Kompetensi berhasil dihapus",
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus kompetensi",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!allCompetencies.length) return;

    let filtered = [...allCompetencies];

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }

    const myCompIds = myCompetencies.map(
      (c) => c._id?.toString() || c.toString()
    );
    filtered = filtered.filter(
      (c) => !myCompIds.includes(c._id?.toString() || c.toString())
    );

    setFilteredCompetencies(filtered);
  }, [selectedCategory, searchQuery, allCompetencies, myCompetencies]);

  const getCategoryColor = (category) => {
    const colors = {
      'Software Development': 'bg-blue-100 text-blue-800',
      'Web & Mobile Application': 'bg-green-100 text-green-800',
      'Embedded Systems': 'bg-purple-100 text-purple-800',
      'IoT (Internet of Things)': 'bg-emerald-100 text-emerald-800',
      'Robotics & Automation': 'bg-rose-100 text-rose-800',
      'Signal Processing': 'bg-indigo-100 text-indigo-800',
      'Computer Vision': 'bg-yellow-100 text-yellow-800',
      'Machine Learning / AI': 'bg-red-100 text-red-800',
      'Biomedical Devices': 'bg-pink-100 text-pink-800',
      'Health Informatics': 'bg-cyan-100 text-cyan-800',
      'Networking & Security': 'bg-gray-100 text-gray-800',
      'Cloud & DevOps': 'bg-sky-100 text-sky-800',
      'Data Engineering & Analytics': 'bg-orange-100 text-orange-800',
      'Human-Computer Interaction': 'bg-lime-100 text-lime-800',
      'Control Systems': 'bg-violet-100 text-violet-800',
      'Energy & Power Systems': 'bg-amber-100 text-amber-800',
      'Research & Simulation': 'bg-teal-100 text-teal-800',
      'Others': 'bg-neutral-100 text-neutral-800',
    };
    return colors[category] || "bg-neutral-100 text-neutral-800";
  };

  if (loading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
              User Profile
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Informasi profil pengguna Anda
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">
                Informasi Pengguna
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Detail informasi akun Anda di CapStation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
              {/* Nama Lengkap */}
              <div className="flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                    Nama Lengkap
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-neutral-900">
                    {user?.name || (
                      <span className="text-muted-foreground italic">
                        Loading...
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-neutral-900 break-all">
                    {user?.email || (
                      <span className="text-muted-foreground italic">
                        Loading...
                      </span>
                    )}
                  </p>
                  {user?.isVerified !== undefined && (
                    <span
                      className={`inline-flex items-center gap-1 mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                        user.isVerified
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {user.isVerified
                        ? "✓ Terverifikasi"
                        : "⏳ Belum Terverifikasi"}
                    </span>
                  )}
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                  <UserCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                    Role
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-neutral-900 capitalize">
                    {user?.role || (
                      <span className="text-muted-foreground italic">
                        Loading...
                      </span>
                    )}
                  </p>
                  {user?.role && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.role === "mahasiswa"
                        ? "Akses penuh untuk mengelola proyek capstone"
                        : user.role === "dosen"
                        ? "Akses pembimbing dan pengelolaan dokumen"
                        : "Akses administrator penuh"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competencies Card */}
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div>
                  <CardTitle className="text-lg sm:text-xl">
                    Kompetensi
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Kelola kompetensi dan keahlian Anda (Maksimal 20)
                  </CardDescription>
                </div>
                <Button
                  onClick={handleOpenAddDialog}
                  size="sm"
                  className="text-sm w-full sm:w-auto"
                  disabled={myCompetencies.length >= 20}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
              {loadingCompetencies ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : myCompetencies.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Belum ada kompetensi yang ditambahkan
                  </p>
                  <Button
                    onClick={handleOpenAddDialog}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Kompetensi Pertama
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {myCompetencies.map((comp, index) => (
                      <Badge
                        key={index}
                        className={`${getCategoryColor(
                          comp.category
                        )} px-3 py-2 flex items-center gap-2`}
                      >
                        <span className="font-medium">{comp.name}</span>
                        <button
                          onClick={() => handleRemoveCompetency(index)}
                          className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {myCompetencies.length} / 20 kompetensi
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Info Card */}
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">
                Informasi Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">
                  Status Akun
                </span>
                <span className="text-sm font-medium text-green-600">
                  {user?.isVerified !== undefined ? (
                    user.isVerified ? (
                      "Aktif & Terverifikasi"
                    ) : (
                      "Belum Terverifikasi"
                    )
                  ) : (
                    <span className="text-muted-foreground italic">
                      Loading...
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t">
                <span className="text-sm text-muted-foreground">
                  Member Since
                </span>
                <span className="text-sm font-medium">
                  {user?.createdAt ? (
                    new Date(user.createdAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  ) : (
                    <span className="text-muted-foreground italic">
                      Loading...
                    </span>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add Competency Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Kompetensi</DialogTitle>
            <DialogDescription>
              Pilih kompetensi yang ingin Anda tambahkan ke profil
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kompetensi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Competencies List */}
            {loadingDialog ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredCompetencies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery || selectedCategory !== "all"
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
                        <p className="text-xs text-muted-foreground">
                          {comp.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddCompetency(comp._id)}
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
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
