"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Download,
  Eye,
  Trash2,
  Filter,
  FileText,
  Calendar,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  RotateCcw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

export default function DocumentsAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // State management
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    documentType: 'all',
    capstoneCategory: 'all',
    sortOrder: 'newest'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0
  });
  
  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  
  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Document type options
  const documentTypeOptions = [
    { value: 'all', label: 'Semua Tipe' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'ppt_sidang', label: 'PPT Sidang' },
    { value: 'laporan', label: 'Laporan' },
    { value: 'gambar_alat', label: 'Gambar Alat' },
    { value: 'desain_poster', label: 'Desain Poster' },
    { value: 'video_demo', label: 'Video Demo' },
    { value: 'dokumentasi', label: 'Dokumentasi' },
    { value: 'lainnya', label: 'Lainnya' }
  ];

  // Capstone category options
  const capstoneCategoryOptions = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'capstone1', label: 'Capstone 1' },
    { value: 'capstone2', label: 'Capstone 2' },
    { value: 'general', label: 'General' }
  ];

  // Items per page options
  const limitOptions = [10, 25, 50, 100];
  
  // Check if any filter is active
  const hasActiveFilters = filters.search || filters.documentType !== 'all' || filters.capstoneCategory !== 'all' || filters.sortOrder !== 'newest';
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: '',
      documentType: 'all',
      capstoneCategory: 'all',
      sortOrder: 'newest'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      
      console.log('🔍 Fetching documents with:', {
        API_URL,
        hasToken: !!token,
        filters,
        pagination: { page: pagination.page, limit: pagination.limit }
      });
      
      if (!token) {
        toast({
          title: "Error",
          description: "Anda belum login. Silakan login terlebih dahulu.",
          variant: "destructive",
        });
        router.push('/login');
        return;
      }
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.documentType && filters.documentType !== 'all') params.append('documentType', filters.documentType);
      if (filters.capstoneCategory && filters.capstoneCategory !== 'all') params.append('capstoneCategory', filters.capstoneCategory);
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      // Sort by createdAt with user-selected order
      params.append('sortBy', 'createdAt');
      
      // Convert sortOrder format
      let backendSortOrder = 'desc';
      if (filters.sortOrder === 'newest') backendSortOrder = 'desc';
      else if (filters.sortOrder === 'oldest') backendSortOrder = 'asc';
      else if (filters.sortOrder === 'alphabetical') backendSortOrder = 'asc';
      
      params.append('sortOrder', backendSortOrder);
      
      const response = await fetch(`${API_URL}/documents?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('📡 Documents fetch response:', {
        status: response.status,
        statusText: response.statusText,
        url: `${API_URL}/documents?${params.toString()}`
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to fetch documents: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('📊 Documents data:', data);
      
      // Handle nested data structure from backend
      const documentsData = data.data?.documents || data.data || [];
      const paginationData = data.data?.pagination || {};
      
      console.log('📋 Processed documents:', {
        count: documentsData.length,
        pagination: paginationData
      });
      
      setDocuments(documentsData);
      setPagination(prev => ({
        ...prev,
        total: paginationData.total || 0,
        totalPages: paginationData.pages || 0
      }));
    } catch (error) {
      console.error('❌ Fetch documents error:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal memuat dokumen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, toast]);

  // Initial load
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination(prev => ({ ...prev, page: 1 }));
      } else {
        fetchDocuments();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // Handle preview
  const handlePreview = async (doc) => {
    setPreviewDocument(doc);
    setShowPreview(true);
    setLoadingPreview(true);
    setPreviewProgress(0);
    
    const progressInterval = setInterval(() => {
      setPreviewProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_URL}/documents/${doc._id}/preview`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to load preview');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreviewProgress(100);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Preview error:', error);
      clearInterval(progressInterval);
      toast({
        title: "Error",
        description: "Gagal memuat preview dokumen",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setLoadingPreview(false);
        setPreviewProgress(0);
      }, 300);
    }
  };

  // Cleanup preview URL
  useEffect(() => {
    if (!showPreview && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [showPreview]);

  // Handle download
  const handleDownload = async (docId) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_URL}/documents/${docId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'document';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Gagal mengunduh dokumen",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDeleteClick = (doc) => {
    setDocumentToDelete(doc);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    
    setDeleting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/documents/${documentToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {}
        console.error('Delete failed:', response.status, response.statusText, errorText);
        toast({
          title: "Error",
          description: errorText || `Gagal menghapus dokumen (${response.status})`,
          variant: "destructive",
        });
        throw new Error(errorText || 'Delete failed');
      }

      toast({
        title: "Berhasil",
        description: "Dokumen berhasil dihapus",
      });

      setShowDeleteDialog(false);
      setDocumentToDelete(null);
      fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      // toast sudah ditampilkan di atas
    } finally {
      setDeleting(false);
    }
  };

  // Handle export documents
  const handleExport = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');

      if (!token) {
        toast({
          title: "Error",
          description: "Anda belum login. Silakan login terlebih dahulu.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Mengekspor dokumen...",
        description: "Mohon tunggu sebentar",
      });

      const response = await fetch(`${API_URL}/documents/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Gagal mengekspor dokumen');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dokumen_capstation_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Berhasil",
        description: "Dokumen berhasil diekspor",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal mengekspor dokumen",
        variant: "destructive",
      });
    }
  };

  // Get file type for icon
  const getFileExtension = (filename) => {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
  };

  const getFileType = (filename) => {
    const ext = getFileExtension(filename);
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return 'image';
    if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) return 'video';
    return 'file';
  };

  // Get document type label
  const getDocumentTypeLabel = (type) => {
    const option = documentTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  // Get capstone category label
  const getCapstoneCategoryLabel = (category) => {
    const option = capstoneCategoryOptions.find(opt => opt.value === category);
    return option ? option.label : category;
  };

  // Get capstone category color
  const getCapstoneCategoryColor = (category) => {
    if (category === 'capstone1') return 'bg-blue-500';
    if (category === 'capstone2') return 'bg-green-500';
    return 'bg-neutral-500';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-neutral-900">
            Manajemen Dokumen Capstone
          </h1>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">
              {pagination.total} Dokumen
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Ekspor
            </Button>
          </div>
        </div>
        <p className="text-neutral-600">
          Review dan kelola dokumen mahasiswa
        </p>
      </div>

      {/* Filter Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter & Pencarian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Cari berdasarkan nama file, proyek, atau mahasiswa..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Document Type Filter */}
                <div className="space-y-2">
                  <Label>Tipe Dokumen</Label>
                  <Select
                    value={filters.documentType}
                    onValueChange={(value) => handleFilterChange('documentType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Capstone Category Filter */}
                <div className="space-y-2">
                  <Label>Kategori Capstone</Label>
                  <Select
                    value={filters.capstoneCategory}
                    onValueChange={(value) => handleFilterChange('capstoneCategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {capstoneCategoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <Label>Urutkan</Label>
                  <Select
                    value={filters.sortOrder}
                    onValueChange={(value) => handleFilterChange('sortOrder', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Urutkan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Terbaru</SelectItem>
                      <SelectItem value="oldest">Terlama</SelectItem>
                      <SelectItem value="alphabetical">A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reset Filters Button */}
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  {hasActiveFilters ? (
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="w-full"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Filter
                    </Button>
                  ) : (
                    <div className="h-10" />
                  )}
                </div>
              </div>


            </CardContent>
          </Card>

          {/* Documents Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#FF8730]" />
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-16 w-16 text-neutral-300 mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    Tidak ada dokumen
                  </h3>
                  <p className="text-neutral-600">
                    {filters.search || (filters.documentType && filters.documentType !== 'all') || (filters.capstoneCategory && filters.capstoneCategory !== 'all')
                      ? 'Tidak ada dokumen yang sesuai dengan filter'
                      : 'Belum ada dokumen yang diupload'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-hidden rounded-lg">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#F1F7FA] hover:bg-[#F1F7FA]">
                        <TableHead className="w-[150px] font-bold text-black">Nama Dokumen</TableHead>
                        <TableHead className="w-[300px] font-bold text-black">Proyek</TableHead>
                        <TableHead className="text-center w-[140px] font-bold text-black">Tipe</TableHead>
                        <TableHead className="text-center w-[140px] font-bold text-black">Kategori</TableHead>
                        <TableHead className="font-bold text-black">Tanggal Upload</TableHead>
                        <TableHead className="font-bold text-black">Ukuran</TableHead>
                        <TableHead className="text-center font-bold text-black">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc._id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="truncate">{doc.title || doc.originalName || 'Untitled'}</div>
                                {doc.originalName && doc.title !== doc.originalName && (
                                  <div className="text-xs text-neutral-500 truncate">
                                    {doc.originalName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              {doc.project?.title || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs">
                              {getDocumentTypeLabel(doc.documentType)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${getCapstoneCategoryColor(doc.capstoneCategory)} text-white text-xs`}>
                              {getCapstoneCategoryLabel(doc.capstoneCategory)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-neutral-600">
                            {formatDate(doc.createdAt || doc.uploadedAt)}
                          </TableCell>
                          <TableCell className="text-sm text-neutral-600">
                            {formatFileSize(doc.fileSize)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePreview(doc)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(doc._id)}
                                className="h-8 w-8 p-0"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(doc)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-3 border-t bg-neutral-50">
                    <div className="text-sm text-neutral-600">
                      Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} dokumen
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Select
                        value={pagination.limit.toString()}
                        onValueChange={(value) => handleLimitChange(parseInt(value))}
                      >
                        <SelectTrigger className="w-[160px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {limitOptions.map(limit => (
                            <SelectItem key={limit} value={limit.toString()}>
                              {limit} per halaman
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {pagination.totalPages > 1 && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Sebelumnya
                          </Button>
                          
                          <div className="flex items-center gap-1">
                            {[...Array(pagination.totalPages)].map((_, index) => {
                              const page = index + 1;
                              // Show first page, last page, current page, and pages around current
                              if (
                                page === 1 ||
                                page === pagination.totalPages ||
                                (page >= pagination.page - 1 && page <= pagination.page + 1)
                              ) {
                                return (
                                  <Button
                                    key={page}
                                    variant={pagination.page === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(page)}
                                    className={pagination.page === page ? "bg-[#B6EB75] hover:bg-[#B6EB75]/90 text-neutral-900" : "hover:bg-[#FFE49C] hover:text-neutral-900"}
                                  >
                                    {page}
                                  </Button>
                                );
                              } else if (
                                page === pagination.page - 2 ||
                                page === pagination.page + 2
                              ) {
                                return <span key={page} className="px-2">...</span>;
                              }
                              return null;
                            })}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                          >
                            Selanjutnya
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden bg-white">
          <DialogHeader className="border-b border-[#D9D9D9] pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold text-[#090B08]">
                  {previewDocument?.title || previewDocument?.originalName || 'Preview Dokumen'}
                </DialogTitle>
                <DialogDescription className="text-sm text-[#535351] mt-1">
                  {previewDocument && (
                    <>{formatFileSize(previewDocument.fileSize)} • {formatDate(previewDocument.createdAt || previewDocument.uploadedAt)}</>
                  )}
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInfo(!showInfo)}
                className="text-[#535351] hover:text-[#090B08] hover:bg-[#F1F7FA] border-[#D9D9D9] mr-0 mt-5"
              >
                <Info className="h-4 w-4 mr-1" />
                Info
              </Button>
            </div>
          </DialogHeader>

          <div className="flex gap-4 h-[calc(90vh-200px)]">
            {/* Preview Area */}
            <div className={`${showInfo ? 'w-3/4' : 'w-full'} transition-all duration-300`}>
              {previewDocument && (
                <div className="h-full bg-[#F1F7FA] rounded-lg overflow-auto flex items-center justify-center">
                  {loadingPreview ? (
                    <div className="flex flex-col items-center gap-4 w-full max-w-md px-8">
                      <FileText className="h-16 w-16 text-[#FF8730]" />
                      <div className="w-full space-y-2">
                        <p className="text-sm text-[#535351] text-center">Memuat preview dokumen...</p>
                        <Progress value={previewProgress} className="h-2" />
                        <p className="text-xs text-[#535351] text-center">{previewProgress}%</p>
                      </div>
                    </div>
                  ) : previewUrl ? (
                    <iframe
                      src={previewUrl}
                      className="w-full h-full border-none"
                      title="Document Preview"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="h-16 w-16 text-[#D9D9D9]" />
                      <p className="text-sm text-[#535351]">Gagal memuat preview</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info Panel */}
            {showInfo && previewDocument && (
              <div className="w-1/4 bg-[#F1F7FA] rounded-lg p-4 overflow-auto">
                <h3 className="font-semibold text-[#090B08] mb-4">Informasi Dokumen</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#535351] mb-1">Nama File</p>
                    <p className="text-sm font-medium text-[#090B08]">
                      {previewDocument.originalName || previewDocument.title || 'Untitled'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#535351] mb-1">Proyek</p>
                    <p className="text-sm font-medium text-[#090B08]">
                      {previewDocument.project?.title || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#535351] mb-1">Ukuran File</p>
                    <p className="text-sm font-medium text-[#090B08]">
                      {formatFileSize(previewDocument.fileSize || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#535351] mb-1">Tipe Dokumen</p>
                    <p className="text-sm font-medium text-[#090B08]">
                      {getDocumentTypeLabel(previewDocument.documentType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#535351] mb-1">Kategori</p>
                    <p className="text-sm font-medium text-[#090B08]">
                      {getCapstoneCategoryLabel(previewDocument.capstoneCategory)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#535351] mb-1">Tanggal Upload</p>
                    <p className="text-sm font-medium text-[#090B08]">
                      {new Date(previewDocument.createdAt || previewDocument.uploadedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-[#D9D9D9] pt-4">
            <div className="flex gap-2 w-full justify-end">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                className="border-[#D9D9D9] text-[#535351] hover:bg-[#F1F7FA]"
              >
                Tutup
              </Button>
              {previewDocument && (
                <Button
                  onClick={() => handleDownload(previewDocument._id)}
                  className="bg-[#FF8730] hover:bg-[#FF8730]/90 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus dokumen "{documentToDelete?.title || documentToDelete?.originalName}"?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
