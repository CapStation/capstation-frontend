'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import GroupService from '@/services/GroupService';
import InviteMemberDialog from '@/components/group/InviteMemberDialog';
import Navbar from '@/components/layout/Navbar';
import { 
  Loader2, 
  Users, 
  Calendar, 
  User, 
  Edit2,
  Trash2,
  UserPlus,
  UserMinus,
  AlertCircle,
  Save,
  Briefcase,
  ExternalLink,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';


const GroupDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingAvailableUsers, setLoadingAvailableUsers] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveConfirmText, setLeaveConfirmText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [project, setProject] = useState(null);
  
  // Form state untuk edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  const getThemeLabel = (tema) => {
    const themeMap = {
      'kesehatan': 'Kesehatan',
      'pengelolaan-sampah': 'Pengelolaan Sampah',
      'smart-city': 'Smart City',
      'transportasi-ramah-lingkungan': 'Transportasi Ramah Lingkungan',
      'iot': 'IoT',
      'ai': 'Artificial Intelligence',
    };
    return themeMap[tema?.toLowerCase()] || tema?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Lainnya';
  };

  useEffect(() => {
    if (params.id) {
      loadGroupDetail();
    }
  }, [params.id]);

  const loadAvailableUsers = async () => {
    try {
      setLoadingAvailableUsers(true);
      const result = await GroupService.getAvailableUsers(params.id);
      
      if (result.success) {
        setAvailableUsers(result.data || []);
      } else {
        console.error('Failed to load available users:', result.error);
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('Error loading available users:', error);
      setAvailableUsers([]);
    } finally {
      setLoadingAvailableUsers(false);
    }
  };

  const handleInviteClick = () => {
    setInviteDialogOpen(true);
    loadAvailableUsers();
  };

  const handleInviteMember = async (userId) => {
    try {
      setActionLoading(true);
      const result = await GroupService.inviteMember(params.id, userId);
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Undangan berhasil dikirim",
        });
        setInviteDialogOpen(false);
        await loadGroupDetail(); // Refresh data
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal mengirim undangan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengirim undangan",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const loadGroupDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await GroupService.getGroupDetail(params.id);
      
      if (result.success && result.data) {
        const groupData = result.data;
        setGroup(groupData);
        
        // Set project data if exists
        if (groupData.projects && groupData.projects.length > 0) {
          setProject(groupData.projects[0]);
        }
        
        // Set form data untuk edit
        setFormData({
          name: groupData.name || '',
          description: groupData.description || '',
          status: groupData.status || 'active'
        });
      }
    } catch (err) {
      console.error('Error loading group:', err);
      setError(err.message || 'Gagal memuat grup');
    } finally {
      setLoading(false);
    }
  };



  const handleRemoveMember = async () => {
    if (!group || !memberToRemove) return;
    
    if (project) {
      toast({
        title: "Tidak Dapat Menghapus",
        description: "Tidak dapat mengeluarkan anggota karena grup masih memiliki project yang terhubung",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setActionLoading(true);
      setError(null);
      await GroupService.removeMember(group._id, memberToRemove);
      toast({
        title: "Berhasil",
        description: "Anggota berhasil dikeluarkan dari grup"
      });
      setRemoveMemberDialogOpen(false);
      setMemberToRemove(null);
      await loadGroupDetail();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || 'Gagal menghapus anggota',
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!group) return;
    
    if (deleteConfirmText !== 'HAPUS') {
      toast({
        title: "Konfirmasi Diperlukan",
        description: 'Ketik "HAPUS" untuk konfirmasi',
        variant: "destructive"
      });
      return;
    }

    if (project) {
      toast({
        title: "Tidak Dapat Menghapus",
        description: 'Tidak dapat menghapus grup karena masih ada project yang terhubung',
        variant: "destructive"
      });
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const result = await GroupService.deleteGroup(group._id);
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Grup berhasil dihapus"
        });
        router.push('/groups');
      } else {
        toast({
          title: "Error",
          description: result.error || 'Gagal menghapus grup',
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || 'Gagal menghapus grup',
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
      setDeleteConfirmText('');
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) return;
    
    if (leaveConfirmText !== 'KELUAR') {
      setError('Ketik "KELUAR" untuk konfirmasi');
      return;
    }

    if (project) {
      setError('Tidak dapat keluar dari grup karena masih ada project yang terhubung');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const result = await GroupService.leaveGroup(group._id);
      
      if (result.success) {
        toast({
          title: 'Berhasil',
          description: 'Anda telah keluar dari grup',
        });
        router.push('/groups');
      } else {
        const errorMsg = result.error || 'Gagal keluar dari grup';
        setError(errorMsg);
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMsg = err.message || 'Gagal keluar dari grup';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
      setLeaveDialogOpen(false);
      setLeaveConfirmText('');
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    if (!group) return;
    
    if (!formData.name.trim()) {
      setError('Nama grup harus diisi');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      await GroupService.updateGroup(group._id, {
        name: formData.name,
        description: formData.description,
        status: formData.status
      });

      await loadGroupDetail();
      setEditDialogOpen(false);
    } catch (err) {
      setError(err.message || 'Gagal memperbarui grup');
    } finally {
      setActionLoading(false);
    }
  };

  const isOwner = React.useMemo(() => {
    if (!group || !user) {
      console.log('🔒 isOwner check: Missing data', { hasGroup: !!group, hasUser: !!user });
      return false;
    }
    
    // User ID bisa berupa user.id atau user._id
    const userId = (user.id || user._id)?.toString();
    
    // Owner bisa berupa string (ObjectId) atau object yang sudah di-populate
    const ownerId = (typeof group.owner === 'string' 
      ? group.owner 
      : (group.owner?._id || group.owner?.id))?.toString();
    
    const result = userId === ownerId;
    
    console.log('🔍 isOwner check:', {
      userId,
      ownerId,
      ownerType: typeof group.owner,
      isOwner: result,
      userObj: user,
      ownerObj: group.owner
    });
    
    return result;
  }, [group, user]);

  const isMember = React.useMemo(() => {
    if (!group || !user) {
      console.log('🔒 isMember check: Missing data', { hasGroup: !!group, hasUser: !!user });
      return false;
    }
    
    const userId = (user.id || user._id)?.toString();
    
    const result = group.members?.some(member => {
      const memberId = (typeof member === 'string' ? member : (member._id || member.id))?.toString();
      return memberId === userId;
    }) || false;
    
    console.log('🔍 isMember check:', {
      userId,
      membersCount: group.members?.length,
      isMember: result,
      members: group.members
    });
    
    return result;
  }, [group, user]);


  if (authLoading || !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100">
        <Navbar />
        <main className="container mx-auto px-12 py-8">
          <div className="h-10 w-32 bg-neutral-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-neutral-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="h-8 bg-neutral-200 rounded animate-pulse w-3/4" />
                      <div className="h-5 bg-neutral-200 rounded animate-pulse w-full" />
                    </div>
                    <div className="h-6 w-20 bg-neutral-200 rounded-full animate-pulse ml-4" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-neutral-200 rounded animate-pulse" />
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="border-neutral-200">
                <CardHeader>
                  <div className="h-6 bg-neutral-200 rounded animate-pulse w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-neutral-200 rounded animate-pulse" />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-neutral-100">
        <Navbar />
        <main className="container mx-auto px-12 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-16">
              <AlertCircle className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Grup Tidak Ditemukan
              </h2>
              <p className="text-neutral-600 mb-6">
                Grup yang Anda cari tidak ditemukan atau telah dihapus.
              </p>
              <Button onClick={() => router.push('/groups')}>
                Kembali ke Daftar Grup
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF8730] to-[#FFB464] px-4">
        <div className="container mx-auto px-12 py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Detail Grup</h1>
              <p className="mt-2 text-neutral-50">Informasi lengkap tentang grup</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => router.push('/groups')}
                variant="outline"
                className="bg-white/20 border-white text-white hover:bg-white/30"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali
              </Button>
              {isOwner && (
                <Button
                  onClick={() => setEditDialogOpen(true)}
                  className="bg-white hover:bg-neutral-100 text-primary font-semibold"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Grup
                </Button>
              )}
              {isMember && !isOwner && (
                <Button
                  onClick={() => setLeaveDialogOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  Keluar dari Grup
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-12 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Group Header Info */}
        <div className="flex items-center justify-between mb-8 p-6 bg-white rounded-lg border">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 bg-primary text-white text-xl">
              <AvatarFallback className="bg-primary text-white font-bold">
                {group.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">{group.name}</h2>
              <p className="text-neutral-600 mt-1">
                {group.description || 'Tidak ada deskripsi'}
              </p>
            </div>
          </div>

          {isOwner && (
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              disabled={actionLoading}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus Grup
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Info Section */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Informasi Grup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Owner</p>
                    <p className="font-semibold text-neutral-900">
                      {group.owner?.name || 'Tidak diketahui'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Dibuat</p>
                    <p className="font-semibold text-neutral-900">
                      {new Date(group.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Anggota</p>
                    <p className="font-semibold text-neutral-900">
                      {group.members.length}/5 mahasiswa
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Status</p>
                    <Badge 
                      className={group.isActive ? 'bg-[#FF8730] hover:bg-[#FF8730]/90 text-white' : 'bg-neutral-400 text-white'}
                    >
                      {group.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Project Terhubung */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-neutral-900">Project Terhubung</h3>
                </div>
                
                {project ? (
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-neutral-900 flex-1">
                        {project.title || 'Tidak ada judul'}
                      </p>
                      {project.tema && (
                        <Badge variant="outline" className="text-xs">
                          {getThemeLabel(project.tema)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 line-clamp-2">
                      {project.description || 'Tidak ada deskripsi'}
                    </p>
                    <Button
                      onClick={() => router.push(`/projects/${project._id}`)}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Lihat Detail Project
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500 italic">
                    Belum ada project terhubung
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Members Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Anggota</CardTitle>
              {isOwner && (
                <Button
                  size="sm"
                  onClick={handleInviteClick}
                  className="bg-primary hover:bg-primary/90"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Owner */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5">
                  <Avatar className="h-10 w-10 bg-primary text-white">
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {group.owner?.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-neutral-900">
                      {group.owner?.name}
                    </p>
                    <p className="text-xs text-neutral-600">Owner</p>
                  </div>
                </div>

                {/* Members */}
                {group.members.filter((member) => {
                  const memberId = typeof member === 'string' ? member : (member._id || member.id);
                  const ownerId = typeof group.owner === 'string' ? group.owner : (group.owner?._id || group.owner?.id);
                  return memberId !== ownerId;
                }).map((member) => {
                  const memberName = typeof member === 'string' ? 'Unknown' : member.name;
                  const memberId = typeof member === 'string' ? member : (member._id || member.id);
                  
                  return (
                    <div key={memberId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50">
                      <Avatar className="h-10 w-10 bg-neutral-200 text-neutral-700">
                        <AvatarFallback className="bg-neutral-200 text-neutral-700 text-sm">
                          {memberName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-neutral-900">
                          {memberName}
                        </p>
                        <p className="text-xs text-neutral-600">Anggota</p>
                      </div>
                      {isOwner && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setMemberToRemove(memberId);
                            setRemoveMemberDialogOpen(true);
                          }}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      )}  
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>


      {/* Dialogs - Only show based on user role */}
      {group && isOwner && (
        <InviteMemberDialog
          isOpen={inviteDialogOpen}
          onClose={() => {
            setInviteDialogOpen(false);
            setError(null); // Clear error when closing dialog
          }}
          onInvite={handleInviteMember}
          isLoading={actionLoading || loadingAvailableUsers}
          availableUsers={availableUsers}
          error={error}
        />
      )}

      {isOwner && (
        <>
          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Informasi Grup</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleUpdateGroup} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">
                    Nama Grup <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama grup"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Deskripsi</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Masukkan deskripsi grup (opsional)"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                    disabled={actionLoading}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Group Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  Hapus Grup
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-neutral-700">
                    Apakah Anda yakin ingin menghapus grup ini? Tindakan ini tidak dapat dibatalkan.
                  </p>
                  {project && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700 font-medium">
                        ⚠️ Tidak dapat menghapus grup karena masih ada project yang terhubung!
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Silakan hapus atau selesaikan project terlebih dahulu.
                      </p>
                    </div>
                  )}
                  {!project && (
                    <p className="text-xs text-neutral-500">
                      Ketik <span className="font-bold text-neutral-900">HAPUS</span> untuk konfirmasi
                    </p>
                  )}
                </div>

                {!project && (
                  <div className="space-y-2">
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                      placeholder="Ketik HAPUS"
                      disabled={actionLoading}
                      className="font-mono"
                    />
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDeleteDialogOpen(false);
                      setDeleteConfirmText('');
                      setError(null);
                    }}
                    disabled={actionLoading}
                  >
                    Batal
                  </Button>
                  {!project && (
                    <Button
                      onClick={handleDeleteGroup}
                      disabled={actionLoading || deleteConfirmText !== 'HAPUS'}
                      variant="destructive"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Menghapus...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus Grup
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Remove Member Dialog */}
      {isOwner && (
        <Dialog open={removeMemberDialogOpen} onOpenChange={setRemoveMemberDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Keluarkan Anggota
              </DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin mengeluarkan anggota ini dari grup?
              </DialogDescription>
            </DialogHeader>
            
            {project && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">
                  ⚠️ Tidak dapat mengeluarkan anggota karena grup masih memiliki project yang terhubung!
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRemoveMemberDialogOpen(false);
                  setMemberToRemove(null);
                }}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button
                onClick={handleRemoveMember}
                disabled={actionLoading || project}
                variant="destructive"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Ya, Keluarkan
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isMember && !isOwner && (
        <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Keluar dari Grup
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-neutral-700">
                  Apakah Anda yakin ingin keluar dari grup ini?
                </p>
                {project && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">
                      ⚠️ Tidak dapat keluar karena masih ada project yang terhubung!
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Silakan hapus atau selesaikan project terlebih dahulu.
                    </p>
                  </div>
                )}
                {!project && (
                  <p className="text-xs text-neutral-500">
                    Ketik <span className="font-bold text-neutral-900">KELUAR</span> untuk konfirmasi
                  </p>
                )}
              </div>

              {!project && (
                <div className="space-y-2">
                  <Input
                    value={leaveConfirmText}
                    onChange={(e) => setLeaveConfirmText(e.target.value.toUpperCase())}
                    placeholder="Ketik KELUAR"
                    disabled={actionLoading}
                    className="font-mono"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setLeaveDialogOpen(false);
                    setLeaveConfirmText('');
                    setError(null);
                  }}
                  disabled={actionLoading}
                >
                  Batal
                </Button>
                {!project && (
                  <Button
                    onClick={handleLeaveGroup}
                    disabled={actionLoading || leaveConfirmText !== 'KELUAR'}
                    variant="destructive"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Keluar dari Grup
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default GroupDetailPage;