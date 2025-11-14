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
  const [selectedAvailability, setSelectedAvailability] = useState("all");
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
  }, [allProjects, activeTab, searchQuery, selectedCategory, selectedAvailability, sortBy]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const result = await ProjectService.getAllProjects();
      
      if (result.success && Array.isArray(result.data)) {
        setAllProjects(result.data);
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
      const sortedByDate = [...result].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      result = sortedByDate.slice(0, 12);
    } else if (activeTab === "available") {
      result = result.filter(p => 
        p.status === 'active' && (p.capstoneStatus === 'pending' || p.capstoneStatus === 'accepted')
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(query) ||
        p.keywords?.toLowerCase().includes(query) ||
        p.supervisor?.name?.toLowerCase().includes(query) ||
        p.supervisor?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(p => 
        p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        p.theme?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Availability filter
    if (selectedAvailability && selectedAvailability !== "all") {
      if (selectedAvailability === "tersedia") {
        result = result.filter(p => 
          p.status === 'active' && (p.capstoneStatus === 'pending' || p.capstoneStatus === 'accepted')
        );
      } else if (selectedAvailability === "tidak-tersedia") {
        result = result.filter(p => 
          p.status !== 'active' || p.capstoneStatus === 'completed'
        );
      }
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
    setSelectedAvailability("all");
    setSortBy("newest");
    setActiveTab("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedAvailability !== "all" || sortBy !== "newest";

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
    const statuses = ["active", "inactive"];
    const capstoneStatuses = ["pending", "accepted", "completed"];

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

      <div className="container mx-auto px-4 py-12">
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
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
              </Button>
            </div>

            {/* Filters */}
            <div className={`grid grid-cols-1 lg:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Kategori
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    <SelectItem value="Kesehatan">Kesehatan</SelectItem>
                    <SelectItem value="Smart City">Smart City</SelectItem>
                    <SelectItem value="IoT">IoT</SelectItem>
                    <SelectItem value="Pengelolaan Sampah">Pengelolaan Sampah</SelectItem>
                    <SelectItem value="AI/ML">AI/ML</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Ketersediaan
                </label>
                <Select
                  value={selectedAvailability}
                  onValueChange={setSelectedAvailability}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="tersedia">Tersedia</SelectItem>
                    <SelectItem value="tidak-tersedia">Tidak Tersedia</SelectItem>
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
                    <X className="h-4 w-4 mr-2" />
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
            <TabsTrigger value="new">Proyek Terbaru</TabsTrigger>
            <TabsTrigger value="available">Proyek Tersedia</TabsTrigger>
            <TabsTrigger value="all">Semua Proyek</TabsTrigger>
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
                    Tidak ada proyek yang ditemukan
                  </h3>
                  <p className="text-neutral-500 mb-4">
                    Coba ubah filter atau kata kunci pencarian Anda
                  </p>
                  {hasActiveFilters && (
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
