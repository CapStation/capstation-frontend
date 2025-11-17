"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    loadDosenList();
  }, []);

  useEffect(() => {
    // Auto-generate academicYear when semester and year are selected
    if (formData.semester && formData.year) {
      const academicYear = `${formData.semester}-${formData.year}`;
      setFormData(prev => ({ ...prev, academicYear }));
    }
  }, [formData.semester, formData.year]);

  const loadDosenList = async () => {
    setLoadingDosen(true);
    try {
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

    setLoading(true);
    try {
      // Prepare data to send
      const submitData = {
        ...formData,
        academicYear: formData.academicYear || undefined, // Only send if filled
      };
      
      const result = await projectService.createProject(submitData);
      
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
