"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import ProjectCard from "@/components/project/ProjectCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProjectService from "@/services/ProjectService";
import { Loader2, Search, Filter, X } from "lucide-react";

export default function BrowseCapstonesPage() {
  const [allProjects, setAllProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Search states
  const [activeTab, setActiveTab] = useState("all"); // "new", "available", "all"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allProjects, activeTab, searchQuery, selectedCategory, selectedStatus, selectedAcademicYear, sortBy]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const result = await ProjectService.getAllProjects();
      
      if (result.success && Array.isArray(result.data)) {
        // Filter hanya project dengan status: active, selesai, dapat_dilanjutkan
        const filteredData = result.data.filter(p => 
          p.status === 'active' || p.status === 'selesai' || p.status === 'dapat_dilanjutkan'
        );
        setAllProjects(filteredData);
      } else {
        // Fallback to mock data
        setAllProjects(generateMockProjects(30));
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      // Fallback to mock data
      setAllProjects(generateMockProjects(30));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...allProjects];

    // Tab filter
    if (activeTab === "new") {
      // Filter projects created within last 2 weeks (14 days)
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      
      result = result.filter(p => {
        const createdDate = new Date(p.createdAt);
        return createdDate >= twoWeeksAgo;
      });
      
      // Sort by newest first
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activeTab === "available") {
      result = result.filter(p => 
        p.status === 'dapat_dilanjutkan'
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => {
        // Search in title
        const titleMatch = p.title?.toLowerCase().includes(query);
        
        // Search in keywords
        const keywordsMatch = p.keywords?.toLowerCase().includes(query);
        
        // Search in supervisor (bisa object atau string)
        let supervisorMatch = false;
        if (p.supervisor) {
          if (typeof p.supervisor === 'object' && p.supervisor !== null) {
            // Supervisor adalah object, cek di field name, fullName, username
            supervisorMatch = 
              p.supervisor.fullName?.toLowerCase().includes(query) ||
              p.supervisor.name?.toLowerCase().includes(query) ||
              p.supervisor.username?.toLowerCase().includes(query) ||
              p.supervisor.email?.toLowerCase().includes(query);
          } else if (typeof p.supervisor === 'string') {
            // Supervisor adalah string
            supervisorMatch = p.supervisor.toLowerCase().includes(query);
          }
        }
        
        // Search in owner (bisa object atau string)
        let ownerMatch = false;
        if (p.owner) {
          if (typeof p.owner === 'object' && p.owner !== null) {
            // Owner adalah object, cek di field name, fullName, username
            ownerMatch = 
              p.owner.fullName?.toLowerCase().includes(query) ||
              p.owner.name?.toLowerCase().includes(query) ||
              p.owner.username?.toLowerCase().includes(query) ||
              p.owner.email?.toLowerCase().includes(query);
          } else if (typeof p.owner === 'string') {
            // Owner adalah string
            ownerMatch = p.owner.toLowerCase().includes(query);
          }
        }
        
        return titleMatch || keywordsMatch || supervisorMatch || ownerMatch;
      });
    }

    // Tema filter
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(p => 
        p.tema?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Status filter
    if (selectedStatus && selectedStatus !== "all") {
      result = result.filter(p => p.status === selectedStatus);
    }

    // Academic Year filter
    if (selectedAcademicYear && selectedAcademicYear !== "all") {
      result = result.filter(p => p.academicYear === selectedAcademicYear);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "alphabetical":
        result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
    }

    setFilteredProjects(result);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedAcademicYear("all");
    setSortBy("newest");
    setActiveTab("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedStatus !== "all" || selectedAcademicYear !== "all" || sortBy !== "newest";

  // Pagination calculations
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateMockProjects = (count) => {
    const titles = [
      "Sistem Monitoring Tekanan Darah Pasien Penyakit Jantung Berbasis IoT",
      "Sarang Tenggiri Untuk Finger Therapy Bagi Lansia Pasca Stroke Berbasis IoT",
      "Alat Pengolah Sampah Otomatis di SGLC Fakultas Teknik Berbasis IoT",
      "Aplikasi Monitoring Kadar Emisi Gas Buang Pada Kendaraan Pribadi",
      "Pengembangan Aplikasi Mobile untuk Edukasi Gizi Seimbang pada Ibu Hamil",
      "Smart City Dashboard untuk Monitoring Lingkungan Area Malioboro",
    ];

    const mockCategories = ["Kesehatan", "Smart City", "IoT", "Pengelolaan Sampah", "AI/ML"];
    const statuses = ["active", "inactive", "selesai", "dapat_dilanjutkan"];
    const capstoneStatuses = ["new", "pending"];

    return Array.from({ length: count }, (_, i) => ({
      _id: `browse-${i}`,
      title: titles[i % titles.length],
      author: { name: "John Doe" },
      supervisor: { name: `Prof. Dr. Eng. Supervisor ${i % 5 + 1}` },
      category: mockCategories[i % mockCategories.length],
      theme: mockCategories[i % mockCategories.length],
      keywords: `IoT, ${mockCategories[i % mockCategories.length]}, Smart Systems`,
      createdAt: new Date(2026 - (i % 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
      status: statuses[i % 2],
      capstoneStatus: capstoneStatuses[i % 3],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header Banner */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Jelajahi Capstone</h1>
          <p className="text-lg text-neutral-600">Temukan proyek capstone yang sesuai dengan minat Anda</p>
        </header>

        {/* Filter & Search Section */}
        <Card className="mb-8 p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Cari berdasarkan judul, kata kunci, atau dosen pembimbing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-6 text-base"
              />
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-1" />
                {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
              </Button>
            </div>

            {/* Filters */}
            <div className={`grid grid-cols-1 lg:grid-cols-5 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
              {/* Tema Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tema
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tema</SelectItem>
                    <SelectItem value="kesehatan">Kesehatan</SelectItem>
                    <SelectItem value="smart_city">Smart City</SelectItem>
                    <SelectItem value="pengelolaan_sampah">Pengelolaan Sampah</SelectItem>
                    <SelectItem value="transportasi_ramah_lingkungan">Transportasi Ramah Lingkungan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Status
                </label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                    <SelectItem value="dapat_dilanjutkan">Dapat Dilanjutkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tahun Ajaran Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tahun Ajaran
                </label>
                <Select
                  value={selectedAcademicYear}
                  onValueChange={setSelectedAcademicYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tahun</SelectItem>
                    <SelectItem value="Gasal-2024">Gasal 2024</SelectItem>
                    <SelectItem value="Genap-2025">Genap 2025</SelectItem>
                    <SelectItem value="Gasal-2025">Gasal 2025</SelectItem>
                    <SelectItem value="Genap-2026">Genap 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Urutkan
                </label>
                <Select
                  value={sortBy}
                  onValueChange={setSortBy}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Terbaru" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="oldest">Terlama</SelectItem>
                    <SelectItem value="alphabetical">Alfabetis A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reset Filter
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs Navigation using shadcn Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">Semua Proyek</TabsTrigger>
            <TabsTrigger value="new">Proyek Terbaru</TabsTrigger>
            <TabsTrigger value="available">Proyek Tersedia</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-neutral-600">
                Menampilkan <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredProjects.length)}</span> dari <span className="font-semibold">{filteredProjects.length}</span> proyek
              </p>
              {totalPages > 1 && (
                <p className="text-sm text-neutral-600">
                  Halaman {currentPage} dari {totalPages}
                </p>
              )}
            </div>

            {/* Projects */}
            {filteredProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <Search className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {activeTab === "new" 
                      ? "Tidak ada proyek terbaru untuk saat ini"
                      : "Tidak ada proyek yang ditemukan"
                    }
                  </h3>
                  <p className="text-neutral-500 mb-4">
                    {activeTab === "new"
                      ? "Belum ada proyek yang dibuat dalam 2 minggu terakhir"
                      : "Coba ubah filter atau kata kunci pencarian Anda"
                    }
                  </p>
                  {hasActiveFilters && activeTab !== "new" && (
                    <Button onClick={clearFilters} variant="outline">
                      Reset Semua Filter
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {currentProjects.map((project) => (
                    <Link key={project._id} href={`/projects/${project._id}`}>
                      <ProjectCard project={project} />
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mb-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {/* First page */}
                      {currentPage > 2 && (
                        <PaginationItem>
                          <PaginationLink onClick={() => goToPage(1)} className="cursor-pointer">
                            1
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {/* Ellipsis before */}
                      {currentPage > 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      {/* Previous page */}
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationLink onClick={() => goToPage(currentPage - 1)} className="cursor-pointer">
                            {currentPage - 1}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {/* Current page */}
                      <PaginationItem>
                        <PaginationLink isActive className="cursor-default">
                          {currentPage}
                        </PaginationLink>
                      </PaginationItem>
                      
                      {/* Next page */}
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationLink onClick={() => goToPage(currentPage + 1)} className="cursor-pointer">
                            {currentPage + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {/* Ellipsis after */}
                      {currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      {/* Last page */}
                      {currentPage < totalPages - 1 && (
                        <PaginationItem>
                          <PaginationLink onClick={() => goToPage(totalPages)} className="cursor-pointer">
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}


