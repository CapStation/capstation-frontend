"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import UserService from "@/services/UserService";
import { useToast } from "@/hooks/use-toast";

const TEMA_OPTIONS = [
  { value: "kesehatan", label: "Kesehatan" },
  { value: "pengelolaan_sampah", label: "Pengelolaan Sampah" },
  { value: "smart_city", label: "Smart City" },
  { value: "transportasi_ramah_lingkungan", label: "Transportasi Ramah Lingkungan" },
];

export default function AdminEditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);
  const [dosenList, setDosenList] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]); // Members dari grup proyek
  const [filteredDosenList, setFilteredDosenList] = useState([]);
  const [filteredMemberList, setFilteredMemberList] = useState([]);
  const [loadingDosen, setLoadingDosen] = useState(true);
  const [showDosenDropdown, setShowDosenDropdown] = useState(false);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [dosenSearchQuery, setDosenSearchQuery] = useState("");
  const [ownerSearchQuery, setOwnerSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    supervisor: "",
    supervisorName: "",
    owner: "",
    ownerName: "",
    keywords: "",
    semester: "",
    year: "",
    academicYear: "",
    status: "",
    tema: "",
  });

  useEffect(() => {
    loadUserLists();
    loadProject();
  }, [params.id]);

  useEffect(() => {
    // Auto-generate academicYear when semester and year are selected
    if (formData.semester && formData.year) {
      const academicYear = `${formData.semester}-${formData.year}`;
      setFormData((prev) => ({ ...prev, academicYear }));
    }
  }, [formData.semester, formData.year]);

  const loadProject = async () => {
    setLoadingProject(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const project = data.data || data;

        // Parse academicYear
        let semester = "";
        let year = "";
        if (project.academicYear) {
          const parts = project.academicYear.split("-");
          semester = parts[0] || "";
          year = parts[1] || "";
        }

        console.log('Project data loaded:', project);
        console.log('Tema value:', project.tema);
        console.log('Tema type:', typeof project.tema);
        console.log('Project members:', project.members);

        // Normalize tema format (convert dash to underscore if needed)
        let normalizedTema = project.tema || "";
        if (normalizedTema) {
          normalizedTema = normalizedTema
            .replace('pengelolaan-sampah', 'pengelolaan_sampah')
            .replace('smart-city', 'smart_city')
            .replace('transportasi-ramah-lingkungan', 'transportasi_ramah_lingkungan');
        }
        console.log('Normalized tema:', normalizedTema);

        setFormData({
          title: project.title || "",
          description: project.description || "",
          category: project.category || "",
          supervisor: project.supervisor?._id || project.supervisor || "",
          supervisorName:
            project.supervisor?.name ||
            (typeof project.supervisor === "string" ? "" : ""),
          owner: project.owner?._id || project.owner || "",
          ownerName:
            project.owner?.name ||
            (typeof project.owner === "string" ? "" : ""),
          keywords: project.keywords || "",
          semester,
          year,
          academicYear: project.academicYear || "",
          status: project.status || "active",
          tema: normalizedTema,
        });

        // Load group members for owner selection
        // Fallback 1: Try from group
        // Fallback 2: Use project.members
        // Fallback 3: Use project.owner only
        let membersToUse = [];

        if (project.group) {
          const groupId = project.group._id || project.group;
          console.log('Loading group members for:', groupId);
          
          try {
            const groupResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/groups/${groupId}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            console.log('Group response status:', groupResponse.status);

            if (groupResponse.ok) {
              const groupData = await groupResponse.json();
              const group = groupData.data || groupData;
              
              console.log('Group data loaded:', group);
              
              // Combine owner and members for selection list
              const allMembers = [];
              
              // Add owner first
              if (group.owner) {
                const ownerData = typeof group.owner === 'object' ? group.owner : null;
                if (ownerData && ownerData._id) {
                  allMembers.push(ownerData);
                }
              }
              
              // Add all members
              if (group.members && Array.isArray(group.members)) {
                group.members.forEach(member => {
                  const memberData = typeof member === 'object' ? member : null;
                  if (memberData && memberData._id) {
                    // Check if not already added (avoid duplicates with owner)
                    if (!allMembers.find(m => m._id === memberData._id)) {
                      allMembers.push(memberData);
                    }
                  }
                });
              }
              
              console.log('All members for selection:', allMembers);
              
              setGroupMembers(allMembers);
              setFilteredMemberList(allMembers);
              membersToUse = allMembers;
            } else {
              const errorData = await groupResponse.json().catch(() => ({}));
              console.warn('Group endpoint returned error (using fallback):', groupResponse.status, errorData);
            }
          } catch (error) {
            console.warn('Error loading group (using fallback):', error.message);
          }
        }

        // Fallback: If no members from group, use project.members
        if (membersToUse.length === 0 && project.members && Array.isArray(project.members)) {
          console.log('Using project members as fallback');
          const projectMembers = [];
          
          // Add owner first
          if (project.owner && typeof project.owner === 'object') {
            projectMembers.push(project.owner);
          }
          
          // Add members
          project.members.forEach(member => {
            const memberData = typeof member === 'object' ? member : null;
            if (memberData && memberData._id) {
              if (!projectMembers.find(m => m._id === memberData._id)) {
                projectMembers.push(memberData);
              }
            }
          });
          
          setGroupMembers(projectMembers);
          setFilteredMemberList(projectMembers);
          membersToUse = projectMembers;
        }
        
        // Last fallback: Use only owner
        if (membersToUse.length === 0 && project.owner && typeof project.owner === 'object') {
          console.log('Using owner only as fallback');
          setGroupMembers([project.owner]);
          setFilteredMemberList([project.owner]);
        }
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data proyek",
          variant: "destructive",
        });
        router.push("/admin/projects");
      }
    } catch (error) {
      console.error("Failed to load project:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat proyek",
        variant: "destructive",
      });
      router.push("/admin/projects");
    } finally {
      setLoadingProject(false);
    }
  };

  const loadUserLists = async () => {
    setLoadingDosen(true);
    try {
      const result = await UserService.getAllUsers();
      if (result.success && result.data) {
        const dosenUsers = result.data.filter((user) => user.role === "dosen");
        setDosenList(dosenUsers);
        setFilteredDosenList(dosenUsers);
      }
    } catch (error) {
      console.error("Failed to load user lists:", error);
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
    const filtered = dosenList.filter(
      (dosen) =>
        dosen.name.toLowerCase().includes(query.toLowerCase()) ||
        dosen.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDosenList(filtered);
  };

  const handleOwnerSearch = (query) => {
    setOwnerSearchQuery(query);
    if (!query.trim()) {
      setFilteredMemberList(groupMembers);
      return;
    }
    const filtered = groupMembers.filter(
      (user) =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMemberList(filtered);
  };

  const selectDosen = (dosen) => {
    setFormData((prev) => ({
      ...prev,
      supervisor: dosen._id,
      supervisorName: dosen.name,
    }));
    setShowDosenDropdown(false);
    setDosenSearchQuery("");
    setFilteredDosenList(dosenList);
  };

  const selectOwner = (user) => {
    setFormData((prev) => ({
      ...prev,
      owner: user._id,
      ownerName: user.name,
    }));
    setShowOwnerDropdown(false);
    setOwnerSearchQuery("");
    setFilteredMemberList(groupMembers);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
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
      const submitData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        supervisor: formData.supervisor || undefined,
        owner: formData.owner || undefined,
        keywords: formData.keywords,
        academicYear: formData.academicYear || undefined,
        status: formData.status,
        tema: formData.tema,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${params.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(submitData),
        }
      );

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Proyek berhasil diperbarui",
        });
        router.push("/admin/projects");
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Gagal memperbarui proyek",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui proyek",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProject) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/projects">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Kelola Proyek
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900">Edit Proyek</h1>
          <p className="text-neutral-600 mt-2">
            Edit informasi proyek sebagai admin (akses penuh)
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
                  placeholder="Deskripsikan proyek secara detail..."
                  required
                  rows={6}
                  className="mt-2 w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <Label htmlFor="tema">Tema</Label>
                <Select
                  key={`tema-${formData.tema}`}
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

              {/* Owner - Admin can change */}
              <div>
                <Label htmlFor="owner">
                  Pemilik Proyek{" "}
                  <span className="text-orange-600 text-xs">(Admin)</span>
                </Label>
                <div className="relative mt-2">
                  <div
                    className="flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded-md cursor-pointer hover:bg-neutral-50"
                    onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}
                  >
                    <Search className="h-4 w-4 text-neutral-500" />
                    <span
                      className={
                        formData.ownerName
                          ? "text-neutral-900"
                          : "text-neutral-500"
                      }
                    >
                      {formData.ownerName || "Pilih pemilik proyek..."}
                    </span>
                  </div>

                  {showOwnerDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-64 overflow-hidden">
                      <div className="p-2 border-b">
                        <Input
                          type="text"
                          placeholder="Cari user..."
                          value={ownerSearchQuery}
                          onChange={(e) => handleOwnerSearch(e.target.value)}
                          className="w-full"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {loadingProject ? (
                          <div className="p-4 text-center text-neutral-500">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          </div>
                        ) : filteredMemberList.length === 0 ? (
                          <div className="p-4 text-center text-neutral-500 text-sm">
                            {groupMembers.length === 0 
                              ? "Belum ada member dalam grup" 
                              : "Member tidak ditemukan"}
                          </div>
                        ) : (
                          filteredMemberList.map((user) => (
                            <div
                              key={user._id}
                              className={`px-3 py-2 hover:bg-neutral-100 cursor-pointer ${
                                formData.owner === user._id ? "bg-neutral-50" : ""
                              }`}
                              onClick={() => selectOwner(user)}
                            >
                              <div className="font-medium text-neutral-900">
                                {user.name}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {user.email}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Supervisor - Admin can change */}
              <div>
                <Label htmlFor="supervisor">
                  Dosen Pembimbing{" "}
                  <span className="text-orange-600 text-xs">(Admin)</span>
                </Label>
                <div className="relative mt-2">
                  <div
                    className="flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded-md cursor-pointer hover:bg-neutral-50"
                    onClick={() => setShowDosenDropdown(!showDosenDropdown)}
                  >
                    <Search className="h-4 w-4 text-neutral-500" />
                    <span
                      className={
                        formData.supervisorName
                          ? "text-neutral-900"
                          : "text-neutral-500"
                      }
                    >
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
                                formData.supervisor === dosen._id
                                  ? "bg-neutral-50"
                                  : ""
                              }`}
                              onClick={() => selectDosen(dosen)}
                            >
                              <div className="font-medium text-neutral-900">
                                {dosen.name}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {dosen.email}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status - Admin only */}
              <div>
                <Label htmlFor="status">
                  Status <span className="text-orange-600 text-xs">(Admin)</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                    <SelectItem value="dapat_dilanjutkan">
                      Dapat Dilanjutkan
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                    Tahun Ajaran:{" "}
                    <span className="font-semibold text-neutral-700">
                      {formData.academicYear}
                    </span>
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
                    "Simpan Perubahan"
                  )}
                </Button>
                <Link href="/admin/projects" className="flex-1">
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
  );
}
