"use client";

import { useEffect, useState } from "react";
import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserService from "@/services/UserService";
import projectService from "@/services/ProjectService";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText, 
  Download, 
  Upload,
  Loader2,
  Calendar,
  User,
  Users,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  Eye,
  Info,
  X,
  ClipboardList,
  Presentation,
  ScrollText,
  Image,
  Palette,
  Video,
  Camera,
  Paperclip
} from "lucide-react";

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ownerName, setOwnerName] = useState(null);
  const [supervisorName, setSupervisorName] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  
  // Upload dialog states
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    documentType: "",
    files: []
  });
  const [isDragging, setIsDragging] = useState(false);
  
  // Complete project dialog states
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [canContinue, setCanContinue] = useState(false);
  const [completingProject, setCompletingProject] = useState(false);
  
  // Set to dapat dilanjutkan dialog
  const [showSetContinuableDialog, setShowSetContinuableDialog] = useState(false);
  
  // Delete project dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  
  // Delete document dialog
  const [showDeleteDocDialog, setShowDeleteDocDialog] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [deletingDocument, setDeletingDocument] = useState(false);
  
  // State for checking user's active projects
  const [userHasActiveProject, setUserHasActiveProject] = useState(false);
  const [checkingActiveProject, setCheckingActiveProject] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadProjectData();
    }
  }, [params.id]);
  
  useEffect(() => {
    if (user && project && project.status === 'dapat_dilanjutkan') {
      checkUserActiveProjects();
    }
  }, [user, project]);

  useEffect(() => {
    if (project) {
      fetchUserData();
    }
  }, [project]);

  const fetchUserData = async () => {
    if (!project) return;
    setLoadingUserData(true);

    // Fetch owner
    if (project.owner) {
      if (typeof project.owner === 'object' && project.owner.name) {
        setOwnerName(project.owner.fullName || project.owner.name || project.owner.username);
      } else if (typeof project.owner === 'string' && /^[a-f0-9]{24}$/i.test(project.owner)) {
        const result = await UserService.getUserById(project.owner);
        if (result.success && result.data) {
          setOwnerName(result.data.fullName || result.data.name || result.data.username);
        }
      }
    }

    // Fetch supervisor
    if (project.supervisor) {
      if (typeof project.supervisor === 'object' && project.supervisor.name) {
        setSupervisorName(project.supervisor.fullName || project.supervisor.name || project.supervisor.username);
      } else if (typeof project.supervisor === 'string' && /^[a-f0-9]{24}$/i.test(project.supervisor)) {
        const result = await UserService.getUserById(project.supervisor);
        if (result.success && result.data) {
          setSupervisorName(result.data.fullName || result.data.name || result.data.username);
        }
      }
    }

    setLoadingUserData(false);
  };

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const projectResult = await projectService.getProjectById(params.id);

      if (projectResult.success) {
        // Handle if data is nested
        const projectData = projectResult.data?.project || projectResult.data;
        setProject(projectData);
      } else {
        // Mock project if API fails
        setProject({
          _id: params.id,
          title: "Sistem Monitoring Tekanan Darah Pasien Penyakit Jantung Berbasis IoT",
          description: "Proyek ini bertujuan untuk mengembangkan sistem monitoring tekanan darah secara real-time menggunakan teknologi IoT untuk membantu pasien penyakit jantung memantau kondisi kesehatan mereka.",
          category: "IoT, Kesehatan",
          supervisor: "Prof. Dr.Eng. I. F. Danung Wijaya, S.T., M.T., IPM.",
          status: "Sedang Proses",
          createdAt: "2026-05-27",
          keywords: "IoT, Kesehatan, Monitoring, Tekanan Darah",
        });
      }

      // Load documents only if user is logged in
      if (user) {
        await loadDocuments();
      }
    } catch (error) {
      console.error("Error loading project:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    // Skip if user not logged in
    if (!user) {
      return;
    }
    
    try {
      const docsResult = await projectService.getProjectDocuments(params.id);

      if (docsResult.success) {
        // Handle if documents is nested or direct array
        const documentsData = Array.isArray(docsResult.data)
          ? docsResult.data
          : docsResult.data?.documents || docsResult.data?.data || [];
        setDocuments(documentsData);
      } else {
        // Mock documents
        setDocuments([
          { _id: "1", name: "Proposal_Proyek.pdf", size: "2.4 MB", uploadedAt: "2026-05-27" },
          { _id: "2", name: "Desain_Sistem.pdf", size: "1.8 MB", uploadedAt: "2026-06-10" },
        ]);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const handleDelete = async () => {
    setDeletingProject(true);
    try {
      const result = await projectService.deleteProject(params.id);
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Proyek berhasil dihapus",
        });
        setShowDeleteDialog(false);
        router.push("/projects");
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal menghapus proyek",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus proyek",
        variant: "destructive",
      });
    } finally {
      setDeletingProject(false);
    }
  };

  // Helper function to check if user can edit/delete project
  const canEditProject = () => {
    if (!user || !project) {
      console.log('🔒 canEditProject: No user or project');
      return false;
    }
    
    // Admin can edit any project
    if (user.role === 'admin') {
      console.log('✅ canEditProject: User is admin');
      return true;
    }
    
    // Get user ID (handle both user.id and user._id)
    const userId = user.id || user._id;
    console.log('🔍 canEditProject: Checking permissions', {
      userId,
      userIdType: user.id ? 'user.id' : 'user._id',
      projectOwnerId: typeof project.owner === 'string' ? project.owner : project.owner?._id || project.owner?.id,
      hasGroup: !!project.group,
      hasMembers: !!project.members?.length
    });
    
    // Check if user is the owner
    const isOwner = typeof project.owner === 'string' 
      ? project.owner === userId 
      : (project.owner?._id === userId || project.owner?.id === userId);
    
    if (isOwner) {
      console.log('✅ canEditProject: User is project owner');
      return true;
    }
    
    // Check if user is a member of the project
    if (project.members && Array.isArray(project.members)) {
      const isMember = project.members.some(member => {
        if (typeof member === 'string') {
          return member === userId;
        }
        return member?._id === userId || member?.id === userId;
      });
      
      if (isMember) {
        console.log('✅ canEditProject: User is project member');
        return true;
      }
    }
    
    // Check if user is part of the group
    if (project.group) {
      console.log('🔍 canEditProject: Checking group permissions', {
        groupOwnerId: typeof project.group.owner === 'string' ? project.group.owner : project.group.owner?._id || project.group.owner?.id,
        groupMembersCount: project.group.members?.length
      });
      
      // Check if user is the group owner
      const isGroupOwner = typeof project.group.owner === 'string'
        ? project.group.owner === userId
        : (project.group.owner?._id === userId || project.group.owner?.id === userId);
      
      if (isGroupOwner) {
        console.log('✅ canEditProject: User is group owner');
        return true;
      }
      
      // Check if user is a member of the group
      if (project.group.members && Array.isArray(project.group.members)) {
        const isGroupMember = project.group.members.some(member => {
          if (typeof member === 'string') {
            return member === userId;
          }
          return member?._id === userId || member?.id === userId;
        });
        
        if (isGroupMember) {
          console.log('✅ canEditProject: User is group member');
          return true;
        }
      }
    }
    
    console.log('❌ canEditProject: User has no permissions');
    return false;
  };

  const handleCompleteProject = async () => {
    if (confirmationText !== "SELESAI") {
      toast({
        title: "Konfirmasi Tidak Sesuai",
        description: "Ketik 'SELESAI' untuk mengonfirmasi",
        variant: "destructive",
      });
      return;
    }

    setCompletingProject(true);
    try {
      const updateData = {
        status: canContinue ? 'dapat_dilanjutkan' : 'selesai'
      };

      const result = await projectService.updateProject(params.id, updateData);
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: canContinue 
            ? "Proyek telah selesai dan dapat dilanjutkan oleh mahasiswa lain" 
            : "Proyek berhasil diselesaikan",
        });
        setShowCompleteDialog(false);
        setConfirmationText("");
        setCanContinue(false);
        loadProjectData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal menyelesaikan proyek",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error completing project:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyelesaikan proyek",
        variant: "destructive",
      });
    } finally {
      setCompletingProject(false);
    }
  };

  // Check if user has active projects
  const checkUserActiveProjects = async () => {
    if (!user) return;
    
    setCheckingActiveProject(true);
    try {
      const result = await projectService.getMyProjects();
      if (result.success) {
        const projects = result.data || [];
        // Check if user has any active, selesai, or dapat_dilanjutkan project
        const hasActiveOrCompleted = projects.some(p => 
          p.status === 'active' || p.status === 'selesai' || p.status === 'dapat_dilanjutkan'
        );
        setUserHasActiveProject(hasActiveOrCompleted);
      }
    } catch (error) {
      console.error('Error checking active projects:', error);
    } finally {
      setCheckingActiveProject(false);
    }
  };
  
  // Check if user can request to continue this project
  const canRequestContinue = () => {
    if (!user || !project) return false;
    if (project.status !== 'dapat_dilanjutkan') return false;
    if (userHasActiveProject) return false;
    
    // User shouldn't be the current owner or member
    const isOwner = typeof project.owner === 'string' 
      ? project.owner === user.id 
      : project.owner?._id === user.id;
    
    if (isOwner) return false;
    
    if (project.members && Array.isArray(project.members)) {
      const isMember = project.members.some(member => {
        if (typeof member === 'string') {
          return member === user.id;
        }
        return member?._id === user.id;
      });
      
      if (isMember) return false;
    }
    
    return true;
  };
  
  // Handle request to continue project
  const handleRequestContinue = () => {
    router.push(`/request/new?projectId=${params.id}`);
  };

  const handleSetContinuable = async () => {
    try {
      const result = await projectService.updateProject(params.id, {
        status: 'dapat_dilanjutkan'
      });
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Proyek sekarang dapat dilanjutkan oleh mahasiswa lain",
        });
        setShowSetContinuableDialog(false);
        loadProjectData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal mengubah status proyek",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengubah status proyek",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("document", file);

    try {
      const result = await projectService.uploadDocument(params.id, formData);
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Dokumen berhasil diupload",
        });
        loadDocuments();
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal mengupload dokumen",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengupload dokumen",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!docToDelete) return;
    
    setDeletingDocument(true);
    try {
      const result = await projectService.deleteDocument(params.id, docToDelete);
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Dokumen berhasil dihapus",
        });
        setShowDeleteDocDialog(false);
        setDocToDelete(null);
        loadDocuments();
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal menghapus dokumen",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus dokumen",
        variant: "destructive",
      });
    } finally {
      setDeletingDocument(false);
    }
  };

  const handleDownloadDocument = async (docId) => {
    console.log('🔽 Initiating download for document:', docId);
    
    const result = await projectService.downloadDocument(docId);
    
    console.log('📊 Download result:', result);
    
    if (!result.success) {
      // Only show error toast if download failed
      toast({
        title: "Error",
        description: result.error || "Gagal mengunduh dokumen",
        variant: "destructive",
      });
    }
    // If success, file is already downloaded, no need for toast
  };

  const handlePreviewDocument = async (doc) => {
    setPreviewDocument(doc);
    setShowPreview(true);
    setShowInfo(false);
    setLoadingPreview(true);
    setPreviewProgress(0);
    
    // Animate progress bar
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
      // Fetch the document as blob
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      
      console.log('👁️ Preview request:', {
        url: `${API_URL}/documents/${doc._id}/preview`,
        docId: doc._id,
        hasToken: !!token
      });
      
      const response = await fetch(`${API_URL}/documents/${doc._id}/preview`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('📡 Preview response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Preview failed:', errorText);
        throw new Error(`Failed to load preview: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      console.log('✅ Preview blob created:', { size: blob.size, type: blob.type, url });
      setPreviewProgress(100);
      setPreviewUrl(url);
    } catch (error) {
      console.error('❌ Preview error:', error);
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

  // Cleanup preview URL when dialog closes
  useEffect(() => {
    if (!showPreview && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [showPreview]);

  const getFilePreviewUrl = (doc) => {
    // Jika ada URL dari backend, gunakan itu
    if (doc.url) return doc.url;
    if (doc.fileUrl) return doc.fileUrl;
    
    // Jika tidak, generate URL berdasarkan ID
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return `${API_URL}/documents/${doc._id}/preview`;
  };

  const getFileExtension = (filename) => {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
  };

  const getFileType = (filename) => {
    const ext = getFileExtension(filename);
    
    // Document types
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    if (ext === 'txt') return 'text';
    
    // Image types
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    
    // Video types
    if (['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(ext)) return 'video';
    
    // Archive types
    if (['zip', 'rar'].includes(ext)) return 'archive';
    
    return 'unknown';
  };

  const isPreviewable = (doc) => {
    const type = getFileType(doc.originalName || doc.name || doc.title || '');
    // Semua file kecuali archive bisa di-preview (dengan fallback ke download)
    return type !== 'archive' && type !== 'unknown';
  };

  const getDocumentTypeLabel = (documentType) => {
    const labels = {
      'proposal': 'Proposal',
      'ppt_sidang': 'PPT Sidang',
      'laporan': 'Laporan',
      'gambar_alat': 'Gambar Alat',
      'desain_poster': 'Desain Poster',
      'video_demo': 'Video Demo',
      'dokumentasi': 'Dokumentasi',
      'lainnya': 'Lainnya'
    };
    return labels[documentType] || documentType;
  };

  const getDocumentTypeIcon = (documentType) => {
    const iconProps = { className: "h-5 w-5" };
    const icons = {
      'proposal': <ClipboardList {...iconProps} />,
      'ppt_sidang': <Presentation {...iconProps} />,
      'laporan': <ScrollText {...iconProps} />,
      'gambar_alat': <Image {...iconProps} />,
      'desain_poster': <Palette {...iconProps} />,
      'video_demo': <Video {...iconProps} />,
      'dokumentasi': <Camera {...iconProps} />,
      'lainnya': <Paperclip {...iconProps} />
    };
    return icons[documentType] || <FileText {...iconProps} />;
  };

  const groupDocumentsByType = (docs) => {
    const grouped = {};
    const typeOrder = ['proposal', 'ppt_sidang', 'laporan', 'gambar_alat', 'desain_poster', 'video_demo', 'dokumentasi', 'lainnya'];
    
    // Group documents by type
    docs.forEach(doc => {
      const type = doc.documentType || 'lainnya';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(doc);
    });
    
    // Sort by defined order
    const sorted = {};
    typeOrder.forEach(type => {
      if (grouped[type]) {
        sorted[type] = grouped[type];
      }
    });
    
    // Add any remaining types not in order
    Object.keys(grouped).forEach(type => {
      if (!sorted[type]) {
        sorted[type] = grouped[type];
      }
    });
    
    return sorted;
  };

  // Document type options with capstone category mapping
  const documentTypeOptions = [
    { value: 'proposal', label: 'Proposal', capstoneCategory: 'capstone1', acceptedFiles: '.pdf,.doc,.docx', description: 'PDF, Word' },
    { value: 'ppt_sidang', label: 'PPT Sidang', capstoneCategory: 'capstone1', acceptedFiles: '.ppt,.pptx,.pdf', description: 'PowerPoint, PDF' },
    { value: 'laporan', label: 'Laporan', capstoneCategory: 'general', acceptedFiles: '.pdf,.doc,.docx', description: 'PDF, Word' },
    { value: 'gambar_alat', label: 'Gambar Alat', capstoneCategory: 'capstone2', acceptedFiles: '.jpg,.jpeg,.png,.gif,.pdf', description: 'Gambar (JPG, PNG, GIF), PDF' },
    { value: 'desain_poster', label: 'Desain Poster', capstoneCategory: 'capstone2', acceptedFiles: '.jpg,.jpeg,.png,.gif,.pdf', description: 'Gambar (JPG, PNG, GIF), PDF' },
    { value: 'video_demo', label: 'Video Demo', capstoneCategory: 'capstone2', acceptedFiles: '.mp4,.avi,.mov,.mkv', description: 'Video (MP4, AVI, MOV, MKV)' },
    { value: 'dokumentasi', label: 'Dokumentasi', capstoneCategory: 'general', acceptedFiles: '.jpg,.jpeg,.png,.gif,.pdf,.zip,.rar', description: 'Gambar, PDF, ZIP, RAR' },
    { value: 'lainnya', label: 'Lainnya', capstoneCategory: 'general', acceptedFiles: '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.zip,.rar', description: 'Semua tipe file' }
  ];

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.title || !uploadForm.documentType || uploadForm.files.length === 0) {
      toast({
        title: "Error",
        description: "Title, document type, and at least one file are required",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 5;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('project', params.id);
      formData.append('documentType', uploadForm.documentType);
      
      // Get capstone category based on document type
      const docTypeOption = documentTypeOptions.find(opt => opt.value === uploadForm.documentType);
      formData.append('capstoneCategory', docTypeOption?.capstoneCategory || 'general');

      // Append all files
      Array.from(uploadForm.files).forEach(file => {
        formData.append('file', file);
      });

      const result = await projectService.uploadDocument(params.id, formData);

      if (result.success) {
        setUploadProgress(100);
        toast({
          title: "Success",
          description: result.message || `${uploadForm.files.length} document(s) uploaded successfully`,
        });
        
        // Reset form and close dialog
        setUploadForm({
          title: "",
          description: "",
          documentType: "",
          files: []
        });
        setShowUploadDialog(false);
        
        // Reload documents
        await loadDocuments();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to upload documents",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "An error occurred while uploading documents",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 300);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      // Get existing files
      const existingFiles = Array.from(uploadForm.files || []);
      const newFiles = Array.from(selectedFiles);
      
      // Validate file types based on document type
      if (uploadForm.documentType) {
        const selectedDocType = documentTypeOptions.find(opt => opt.value === uploadForm.documentType);
        const acceptedExtensions = selectedDocType?.acceptedFiles.split(',') || [];
        
        const invalidFiles = newFiles.filter(file => {
          const fileExt = '.' + file.name.split('.').pop().toLowerCase();
          return !acceptedExtensions.includes(fileExt);
        });
        
        if (invalidFiles.length > 0) {
          toast({
            title: "Tipe File Tidak Sesuai",
            description: `File "${invalidFiles[0].name}" tidak diperbolehkan untuk ${selectedDocType?.label}. Tipe file yang diperbolehkan: ${selectedDocType?.description}`,
            variant: "destructive",
          });
          e.target.value = '';
          return;
        }
      }
      
      // Combine existing and new files
      const combinedFiles = [...existingFiles, ...newFiles];
      
      // Check total file count
      if (combinedFiles.length > 10) {
        toast({
          title: "Melebihi Batas",
          description: `Maksimal 10 file. Anda sudah memilih ${existingFiles.length} file, tidak bisa menambah ${newFiles.length} file lagi.`,
          variant: "destructive",
        });
        // Reset input
        e.target.value = '';
        return;
      }
      
      // Create new FileList
      const dataTransfer = new DataTransfer();
      combinedFiles.forEach(file => dataTransfer.items.add(file));
      
      setUploadForm(prev => ({
        ...prev,
        files: dataTransfer.files
      }));
      
      // Reset input value so same file can be selected again
      e.target.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadForm.documentType) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!uploadForm.documentType) {
      toast({
        title: "Pilih Tipe Dokumen",
        description: "Silakan pilih tipe dokumen terlebih dahulu sebelum upload file",
        variant: "destructive",
      });
      return;
    }

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      // Get existing files
      const existingFiles = Array.from(uploadForm.files || []);
      const newFiles = Array.from(droppedFiles);
      
      // Validate file types
      const selectedDocType = documentTypeOptions.find(opt => opt.value === uploadForm.documentType);
      const acceptedExtensions = selectedDocType?.acceptedFiles.split(',') || [];
      
      const invalidFiles = newFiles.filter(file => {
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        return !acceptedExtensions.includes(fileExt);
      });
      
      if (invalidFiles.length > 0) {
        toast({
          title: "Tipe File Tidak Sesuai",
          description: `File "${invalidFiles[0].name}" tidak diperbolehkan untuk ${selectedDocType?.label}. Tipe file yang diperbolehkan: ${selectedDocType?.description}`,
          variant: "destructive",
        });
        return;
      }
      
      // Combine files
      const combinedFiles = [...existingFiles, ...newFiles];
      
      // Check total file count
      if (combinedFiles.length > 10) {
        toast({
          title: "Melebihi Batas",
          description: `Maksimal 10 file. Anda sudah memilih ${existingFiles.length} file, tidak bisa menambah ${newFiles.length} file lagi.`,
          variant: "destructive",
        });
        return;
      }
      
      // Create new FileList
      const dataTransfer = new DataTransfer();
      combinedFiles.forEach(file => dataTransfer.items.add(file));
      
      setUploadForm(prev => ({
        ...prev,
        files: dataTransfer.files
      }));

      toast({
        title: "File Ditambahkan",
        description: `${newFiles.length} file berhasil ditambahkan`,
      });
    }
  };

  const removeFile = (index) => {
    const newFiles = Array.from(uploadForm.files).filter((_, i) => i !== index);
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    setUploadForm(prev => ({
      ...prev,
      files: dataTransfer.files
    }));
  };

  const getStatusColor = (status) => {
    // New status values
    if (status === "active") return "bg-green-500 text-white";
    if (status === "selesai") return "bg-blue-500 text-white";
    if (status === "inactive") return "bg-gray-500 text-white";
    if (status === "dapat_dilanjutkan") return "bg-emerald-500 text-white";
    
    // CapstoneStatus values
    if (status === "new") return "bg-blue-400 text-white";
    if (status === "pending") return "bg-yellow-500 text-neutral-900";
    if (status === "accepted") return "bg-green-500 text-white";
    if (status === "rejected") return "bg-red-500 text-white";
    
    return "bg-neutral-200 text-neutral-700";
  };

  const getStatusLabel = (status) => {
    if (status === "active") return "Sedang Berjalan";
    if (status === "selesai") return "Selesai";
    if (status === "inactive") return "Tidak Aktif";
    if (status === "dapat_dilanjutkan") return "Dapat Dilanjutkan";
    if (status === "new") return "Baru";
    if (status === "pending") return "Menunggu Persetujuan";
    if (status === "accepted") return "Diterima";
    if (status === "rejected") return "Ditolak";
    return status;
  };

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
    return colors[category] || 'bg-neutral-100 text-neutral-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-10 w-32 bg-neutral-200 rounded animate-pulse" />
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div className="h-8 w-3/4 bg-neutral-200 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-neutral-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div className="h-6 w-32 bg-neutral-200 rounded animate-pulse" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-neutral-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-neutral-900">Proyek tidak ditemukan</h2>
          <Link href="/projects">
            <Button className="mt-4">Kembali ke Proyek</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <Navbar />

      <div className="max-w-screen-lg mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/projects">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>

          {/* Project Header */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-4 leading-tight">{project.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {/* Hanya tampilkan status (active, selesai, inactive, dapat_dilanjutkan) */}
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                    {project.tema && (
                      <Badge variant="outline" className="capitalize">
                        {project.tema.replace(/-/g, ' ')}
                      </Badge>
                    )}
                    {project.competencies && project.competencies.length > 0 ? (
                      project.competencies.map((comp, index) => {
                        const name = typeof comp === 'string' ? comp : comp.name || comp.title || comp._id;
                        const category = typeof comp === 'object' ? comp.category : undefined;
                        return (
                          <Badge key={index} className={`${getCategoryColor(category)} text-sm`}>
                            {name}
                          </Badge>
                        );
                      })
                    ) : (project.tags && project.tags.length > 0 && (
                      project.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {tag}
                        </Badge>
                      ))
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-wrap mt-3 md:mt-0">
                  {/* Tombol Ajukan Melanjutkan untuk proyek dapat_dilanjutkan jika user belum punya project aktif */}
                  {!checkingActiveProject && canRequestContinue() && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleRequestContinue}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Ajukan Melanjutkan
                    </Button>
                  )}
                  
                  {/* Tombol Edit dan Hapus hanya untuk owner, member team, dan admin */}
                  {canEditProject() && (
                    <>
                      <Link href={`/projects/${params.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Deskripsi</h3>
                <p className="text-neutral-700 leading-relaxed">{project.description}</p>
              </div>

              {project.supervisor && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Dosen Pembimbing</h3>
                  <p className="text-neutral-700">
                    {typeof project.supervisor === 'object' && project.supervisor.name
                      ? project.supervisor.name
                      : typeof project.supervisor === 'string'
                      ? project.supervisor
                      : '-'}
                  </p>
                </div>
              )}

              {project.group && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Nama Tim</h3>
                  <p className="text-neutral-700 font-medium">
                    {typeof project.group === 'object' && project.group.name
                      ? project.group.name
                      : '-'}
                  </p>
                </div>
              )}

              {project.members && project.members.length > 0 && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Anggota Tim ({project.members.length}):</h3>
                  <TooltipProvider>
                    <div className="flex flex-wrap gap-3">
                      {project.members.map((member, index) => {
                        const memberName = typeof member === 'object' && member.name
                          ? member.name
                          : typeof member === 'object' && member.email
                          ? member.email
                          : typeof member === 'string'
                          ? member
                          : `Member ${index + 1}`;
                        
                        const memberEmail = typeof member === 'object' && member.email
                          ? member.email
                          : null;
                        
                        // Get initials (first 2 letters of name, uppercase)
                        const initials = memberName.split(' ')
                          .map(word => word[0])
                          .join('')
                          .toUpperCase()
                          .substring(0, 2);
                        
                        return (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col items-center gap-1 cursor-pointer">
                                <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center hover:bg-neutral-300 transition-colors">
                                  <span className="text-base font-bold text-neutral-700">{initials}</span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-center">
                                <p className="font-semibold">{memberName}</p>
                                {memberEmail && (
                                  <p className="text-xs text-neutral-400">{memberEmail}</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </TooltipProvider>
                </div>
              )}

              {project.keywords && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Kata Kunci</h3>
                  <p className="text-neutral-700">{project.keywords}</p>
                </div>
              )}

              {project.academicYear && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Tahun Ajaran</h3>
                  <p className="text-neutral-700">
                    {project.academicYear.replace('-', ' ')}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Tanggal Dibuat</h3>
                <p className="text-neutral-700">
                  {new Date(project.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Tombol Aksi Proyek akan dipindah ke bawah dokumen */}
            </CardContent>
          </Card>

          {/* Documents Section */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle>Dokumen Proyek</CardTitle>
                {canEditProject() && (
                  <Button 
                    size="sm" 
                    onClick={() => setShowUploadDialog(true)}
                    disabled={uploading}
                    className="w-full sm:w-auto bg-[#FFE49C] text-neutral-900 border border-neutral-100 hover:bg-[#B6EB75]"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-1" />
                        Upload Dokumen
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!user ? (
                // Guest user - locked documents
                <div className="text-center py-12 px-4">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-0">
                      <FileText className="h-10 w-10 text-neutral-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                      Dokumen Terkunci
                    </h3>
                    <p className="text-neutral-600 mb-6">
                      Anda harus login terlebih dahulu untuk melihat dokumen proyek ini
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Link href="/login">
                        <Button className="bg-primary hover:bg-primary/90">
                          Login Sekarang
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button variant="outline">
                          Daftar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                  <p>Belum ada dokumen</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupDocumentsByType(documents)).map(([documentType, docs]) => (
                    <div key={documentType} className="space-y-3">
                      {/* Document Type Header */}
                      <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                        <span className="text-primary">{getDocumentTypeIcon(documentType)}</span>
                        <h3 className="font-semibold text-neutral-900">
                          {getDocumentTypeLabel(documentType)}
                        </h3>
                        <span className="text-xs text-neutral-500 ml-auto">
                          {docs.length} dokumen
                        </span>
                      </div>
                      
                      {/* Documents in this type */}
                      <div className="space-y-2">
                        {docs.map((doc) => (
                          <div
                            key={doc._id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-neutral-900 truncate">
                                  {doc.title || doc.originalName || doc.name || 'Untitled'}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  {formatFileSize(doc.fileSize)} 
                                  {' • '}
                                  {new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString("id-ID")}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0 mt-3 sm:mt-0">
                              {isPreviewable(doc) && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handlePreviewDocument(doc)}
                                  title="Preview"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDownloadDocument(doc._id)}
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {canEditProject() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setDocToDelete(doc._id);
                                    setShowDeleteDocDialog(true);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Tombol Aksi Proyek - hanya untuk owner, dipindah ke bawah dokumen */}
              {user && project.owner && 
               (typeof project.owner === 'string' ? project.owner === user.id : project.owner._id === user.id) && (
                <div className="pt-6 border-t border-neutral-200 mt-8 space-y-2">
                  {/* Tombol Selesaikan Proyek - untuk project active */}
                  {project.status === 'active' && (
                    <Button
                      variant="default"
                      size="lg"
                      onClick={() => setShowCompleteDialog(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                      <CheckCircle2 className="h-5 w-5 mr-1" />
                      Konfirmasi Proyek telah Selesai
                    </Button>
                  )}
                  {/* Tombol Dapat Dilanjutkan - untuk project selesai */}
                  {project.status === 'selesai' && (
                    <Button
                      variant="default"
                      size="lg"
                      onClick={() => setShowSetContinuableDialog(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      <AlertCircle className="h-5 w-5 mr-1" />
                      Tandai Dapat Dilanjutkan
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden bg-white">
            <DialogHeader className="border-b border-[#D9D9D9] pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-xl font-bold text-[#090B08]">
                    {previewDocument?.title || previewDocument?.originalName || previewDocument?.name || 'Preview Dokumen'}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-[#535351] mt-1">
                    {formatFileSize(previewDocument?.fileSize || 0)} • {new Date(previewDocument?.createdAt || previewDocument?.uploadedAt).toLocaleDateString("id-ID")}
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

            <div className="flex flex-col md:flex-row gap-4 h-[calc(90vh-200px)]">
              {/* Preview Area */}
              <div className={`${showInfo ? 'md:w-3/4 w-full' : 'w-full'} transition-all duration-300`}>
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
                      <>
                        {(() => {
                          const fileType = getFileType(previewDocument.originalName || previewDocument.name || '');
                          
                          // PDF Preview
                          if (fileType === 'pdf') {
                            return (
                              <object
                                data={previewUrl}
                                type="application/pdf"
                                className="w-full h-full"
                              >
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                  <FileText className="h-16 w-16 text-[#D9D9D9] mb-4" />
                                  <p className="text-[#535351] mb-4">Browser Anda tidak dapat menampilkan PDF</p>
                                  <Button
                                    onClick={() => handleDownloadDocument(previewDocument._id)}
                                    className="bg-[#FF8730] hover:bg-[#FF8730]/90 text-white"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download untuk melihat
                                  </Button>
                                </div>
                              </object>
                            );
                          }
                          
                          // Image Preview
                          if (fileType === 'image') {
                            return (
                              <div className="flex items-center justify-center h-full p-4">
                                <img
                                  src={previewUrl}
                                  alt={previewDocument.title || 'Preview'}
                                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                  onError={(e) => {
                                    console.error('Image load error');
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            );
                          }
                          
                          // Video Preview
                          if (fileType === 'video') {
                            return (
                              <div className="flex items-center justify-center h-full p-4">
                                <video
                                  controls
                                  className="max-w-full max-h-full rounded-lg shadow-lg"
                                  onError={(e) => console.error('Video load error')}
                                >
                                  <source src={previewUrl} />
                                  <p className="text-[#535351]">Browser Anda tidak mendukung video playback</p>
                                </video>
                              </div>
                            );
                          }
                          
                          // Text Preview
                          if (fileType === 'text') {
                            return (
                              <div className="h-full p-6 overflow-auto">
                                <iframe
                                  src={previewUrl}
                                  className="w-full h-full border-none bg-white rounded-lg"
                                  title="Text Preview"
                                />
                              </div>
                            );
                          }
                          
                          // Office Files (Word, Excel, PowerPoint) - Download fallback
                          if (['word', 'excel', 'powerpoint'].includes(fileType)) {
                            const fileIcons = {
                              word: '📄',
                              excel: '📊',
                              powerpoint: '📊'
                            };
                            const fileNames = {
                              word: 'Word',
                              excel: 'Excel',
                              powerpoint: 'PowerPoint'
                            };
                            return (
                              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <div className="text-6xl mb-4">{fileIcons[fileType]}</div>
                                <FileText className="h-16 w-16 text-[#FF8730] mb-4" />
                                <h3 className="text-lg font-semibold text-[#090B08] mb-2">
                                  Dokumen {fileNames[fileType]}
                                </h3>
                                <p className="text-[#535351] mb-6 max-w-md">
                                  File {fileNames[fileType]} tidak dapat di-preview langsung di browser.
                                  Silakan download untuk membukanya di aplikasi {fileNames[fileType]}.
                                </p>
                                <Button
                                  onClick={() => handleDownloadDocument(previewDocument._id)}
                                  className="bg-[#FF8730] hover:bg-[#FF8730]/90 text-white"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Dokumen
                                </Button>
                              </div>
                            );
                          }
                          
                          // Default fallback
                          return (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                              <FileText className="h-16 w-16 text-[#D9D9D9] mb-4" />
                              <p className="text-[#535351] mb-4">Tipe file tidak dapat di-preview</p>
                              <Button
                                onClick={() => handleDownloadDocument(previewDocument._id)}
                                className="bg-[#FF8730] hover:bg-[#FF8730]/90 text-white"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download untuk melihat
                              </Button>
                            </div>
                          );
                        })()}
                      </>
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
                <div className="md:w-1/4 w-full bg-[#F1F7FA] rounded-lg p-4 overflow-auto">
                  <h3 className="font-semibold text-[#090B08] mb-4">Informasi Dokumen</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-[#535351] mb-1">Nama File</p>
                      <p className="text-sm font-medium text-[#090B08]">
                        {previewDocument.originalName || previewDocument.name || previewDocument.title || 'Untitled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#535351] mb-1">Ukuran File</p>
                      <p className="text-sm font-medium text-[#090B08]">
                        {formatFileSize(previewDocument.fileSize || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#535351] mb-1">Tipe File</p>
                      <p className="text-sm font-medium text-[#090B08] uppercase">
                        {getFileExtension(previewDocument.originalName || previewDocument.name || '')}
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
                    {previewDocument.description && (
                      <div>
                        <p className="text-xs text-[#535351] mb-1">Deskripsi</p>
                        <p className="text-sm text-[#090B08]">
                          {previewDocument.description}
                        </p>
                      </div>
                    )}
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
                <Button
                  onClick={() => {
                    if (previewDocument) {
                      handleDownloadDocument(previewDocument._id);
                    }
                  }}
                  className="bg-[#FF8730] hover:bg-[#FF8730]/90 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload Document Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Upload Dokumen</DialogTitle>
              <DialogDescription>
                Upload satu atau lebih file dokumen untuk proyek ini. Maksimal 10 file per upload.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Dokumen *</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Masukkan judul dokumen"
                  required
                />
                <p className="text-xs text-neutral-500">
                  Jika upload lebih dari 1 file, akan otomatis ditambah nomor: Judul (1), Judul (2), dst
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Masukkan deskripsi dokumen (opsional)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentType">Tipe Dokumen *</Label>
                <Select
                  value={uploadForm.documentType}
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, documentType: value }))}
                  required
                >
                  <SelectTrigger id="documentType">
                    <SelectValue placeholder="Pilih tipe dokumen" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {getDocumentTypeIcon(option.value)}
                          <span>{option.label}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {option.capstoneCategory}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {uploadForm.documentType && (
                  <p className="text-xs text-neutral-500">
                    Kategori: {documentTypeOptions.find(opt => opt.value === uploadForm.documentType)?.capstoneCategory}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="files">Tambah File Dokumen * (Maks. 10 files total)</Label>
                
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 transition-all ${
                    isDragging
                      ? 'border-[#FF8730] bg-orange-50'
                      : !uploadForm.documentType
                      ? 'border-neutral-200 bg-neutral-50 cursor-not-allowed'
                      : 'border-neutral-300 bg-white hover:border-[#FF8730] hover:bg-orange-50/30'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload className={`h-10 w-10 mb-3 ${
                      isDragging ? 'text-[#FF8730]' : !uploadForm.documentType ? 'text-neutral-300' : 'text-neutral-400'
                    }`} />
                    
                    {!uploadForm.documentType ? (
                      <div>
                        <p className="text-sm text-neutral-400 mb-1">Pilih tipe dokumen terlebih dahulu</p>
                        <p className="text-xs text-neutral-400">untuk mengaktifkan upload file</p>
                      </div>
                    ) : isDragging ? (
                      <div>
                        <p className="text-sm font-medium text-[#FF8730] mb-1">Lepaskan file di sini</p>
                        <p className="text-xs text-neutral-500">untuk menambahkan ke daftar</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-neutral-600 mb-1">
                          <span className="font-medium text-[#FF8730]">Klik untuk memilih file</span> atau drag & drop di sini
                        </p>
                        <p className="text-xs text-neutral-500 mb-3">
                          {uploadForm.files.length > 0 
                            ? `${uploadForm.files.length} file terpilih - Tambah lebih banyak` 
                            : 'Pilih satu atau lebih file'}
                        </p>
                      </div>
                    )}
                    
                    {/* Hidden File Input */}
                    <input
                      id="files"
                      type="file"
                      onChange={handleFileSelect}
                      multiple
                      accept={uploadForm.documentType ? documentTypeOptions.find(opt => opt.value === uploadForm.documentType)?.acceptedFiles : '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.zip,.rar'}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      disabled={!uploadForm.documentType}
                    />
                  </div>
                </div>
                
                {uploadForm.documentType && (
                  <p className="text-xs text-neutral-500">
                    📎 Tipe file yang diperbolehkan: <span className="font-medium">{documentTypeOptions.find(opt => opt.value === uploadForm.documentType)?.description}</span>
                  </p>
                )}
                {!uploadForm.documentType && (
                  <p className="text-xs text-amber-600">
                    ⚠️ Pilih tipe dokumen terlebih dahulu untuk mengaktifkan upload file
                  </p>
                )}
                {uploadForm.files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium">File terpilih ({uploadForm.files.length}/10):</p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {Array.from(uploadForm.files).map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-neutral-50 rounded text-sm"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="h-4 w-4 flex-shrink-0 text-neutral-500" />
                            <span className="truncate">{file.name}</span>
                            <span className="text-xs text-neutral-500 flex-shrink-0">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="flex-shrink-0 h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUploadDialog(false);
                    setUploadForm({
                      title: "",
                      description: "",
                      documentType: "",
                      files: []
                    });
                  }}
                  disabled={uploading}
                >
                  Batal
                </Button>
                <Button 
                  type="submit"
                  disabled={uploading || !uploadForm.title || !uploadForm.documentType || uploadForm.files.length === 0}
                  className="bg-[#FF8730] hover:bg-[#FF8730]/90 w-full sm:w-auto sm:min-w-[200px]"
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        <span>Uploading... {uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-1 w-full bg-orange-200" />
                    </div>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload ({uploadForm.files.length} file{uploadForm.files.length !== 1 ? 's' : ''})
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Complete Project Dialog */}
        <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Selesaikan Proyek</DialogTitle>
              <DialogDescription>
                Pastikan semua pekerjaan telah selesai sebelum menandai proyek sebagai selesai.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={canContinue}
                    onChange={(e) => setCanContinue(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span>Proyek ini dapat dilanjutkan oleh mahasiswa lain</span>
                </Label>
                <p className="text-sm text-neutral-500 ml-6">
                  {canContinue 
                    ? "Proyek akan ditandai sebagai 'Dapat Dilanjutkan' dan dapat di-request oleh mahasiswa baru"
                    : "Proyek akan ditandai sebagai 'Selesai' (Anda dapat mengubahnya nanti)"
                  }
                </p>
              </div>

              <div>
                <Label htmlFor="confirmation">
                  Ketik <span className="font-bold text-red-600">SELESAI</span> untuk mengonfirmasi
                </Label>
                <Input
                  id="confirmation"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
                  placeholder="Ketik SELESAI"
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCompleteDialog(false);
                  setConfirmationText("");
                  setCanContinue(false);
                }}
                disabled={completingProject}
              >
                Batal
              </Button>
              <Button
                onClick={handleCompleteProject}
                disabled={confirmationText !== "SELESAI" || completingProject}
                className="bg-green-400 hover:bg-green-500"
              >
                {completingProject ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Ya, Selesaikan
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Set Continuable Dialog */}
        <Dialog open={showSetContinuableDialog} onOpenChange={setShowSetContinuableDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ubah Status Proyek</DialogTitle>
              <DialogDescription>
                Proyek akan diubah menjadi "Dapat Dilanjutkan" sehingga mahasiswa baru dapat mengajukan request untuk melanjutkan proyek ini.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSetContinuableDialog(false)}
              >
                Batal
              </Button>
              <Button
                onClick={handleSetContinuable}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Ya, Dapat Dilanjutkan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Project Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Hapus Proyek</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus proyek ini? Tindakan ini tidak dapat dibatalkan dan semua data proyek akan hilang permanen.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deletingProject}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deletingProject}
              >
                {deletingProject ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Ya, Hapus
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Document Dialog */}
        <Dialog open={showDeleteDocDialog} onOpenChange={setShowDeleteDocDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Hapus Dokumen</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDocDialog(false);
                  setDocToDelete(null);
                }}
                disabled={deletingDocument}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteDocument}
                disabled={deletingDocument}
              >
                {deletingDocument ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Ya, Hapus
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
