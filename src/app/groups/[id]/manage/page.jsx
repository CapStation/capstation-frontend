'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import GroupService from '@/services/GroupService';
import Navbar from '@/components/layout/Navbar';
import { AlertCircle, Loader2, ArrowLeft, Trash2, Edit2 } from 'lucide-react';

const ManageGroupPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const groupId = params.id;

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [deletingMemberId, setDeletingMemberId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && groupId) {
      loadGroupDetail();
    }
  }, [user, groupId]);

  const loadGroupDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await GroupService.getGroupDetail(groupId);

      if (result.success) {
        const groupData = result.data;
        
        // Check apakah user adalah owner
        if (groupData.owner?._id !== user?._id) {
          setError('Anda tidak memiliki akses untuk mengelola grup ini');
          return;
        }

        setGroup(groupData);
        setFormData({
          name: groupData.name || '',
          description: groupData.description || '',
        });
      } else {
        setError(result.error || 'Gagal memuat detail grup');
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat detail grup');
      console.error('Load group detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateGroup = async () => {
    if (!formData.name.trim()) {
      setError('Nama grup tidak boleh kosong');
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const result = await GroupService.updateGroup(groupId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      if (result.success) {
        setGroup((prev) => ({
          ...prev,
          ...formData,
        }));
        setIsEditing(false);
        setSuccessMessage('Grup berhasil diperbarui');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || 'Gagal memperbarui grup');
      }
    } catch (err) {
      setError(err.message || 'Gagal memperbarui grup');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus anggota ini dari grup?')) {
      return;
    }

    setDeletingMemberId(memberId);
    setError(null);

    try {
      const result = await GroupService.removeMember(groupId, memberId);

      if (result.success) {
        // Update group members list
        setGroup((prev) => ({
          ...prev,
          members: prev.members.filter((m) => m._id !== memberId),
        }));
        setSuccessMessage('Anggota berhasil dihapus dari grup');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || 'Gagal menghapus anggota');
      }
    } catch (err) {
      setError(err.message || 'Gagal menghapus anggota');
    } finally {
      setDeletingMemberId(null);
    }
  };

  const handleDeleteGroup = async () => {
    if (
      !confirm(
        'Apakah Anda yakin ingin menghapus grup ini? Tindakan ini tidak dapat dibatalkan.'
      )
    ) {
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const result = await GroupService.deleteGroup(groupId);

      if (result.success) {
        router.push('/groups/my');
      } else {
        setError(result.error || 'Gagal menghapus grup');
      }
    } catch (err) {
      setError(err.message || 'Gagal menghapus grup');
    } finally {
      setIsUpdating(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'MB';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error && !group) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 p-4">
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4 text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali
            </Button>

            <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!group) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-neutral-600">Grup tidak ditemukan</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push('/groups/my')}
            className="mb-6 text-primary hover:bg-primary/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali ke Grup Saya
          </Button>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <div className="w-5 h-5 text-green-600 mt-0.5">✓</div>
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Group Info Card */}
          <Card className="border-neutral-200 bg-white mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-3xl text-neutral-900">
                  {group.name}
                </CardTitle>
                <p className="text-sm text-neutral-600 mt-2">
                  Dibuat pada {new Date(group.createdAt).toLocaleDateString('id-ID')}
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                Owner
              </Badge>
            </CardHeader>

            <CardContent className="space-y-6">
              {!isEditing ? (
                <>
                  {/* Display Mode */}
                  <div>
                    <p className="text-sm text-neutral-600 mb-2">Deskripsi</p>
                    <p className="text-neutral-900">
                      {group.description || '-'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-600">Anggota</p>
                      <p className="text-2xl font-bold text-primary">
                        {group.members?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Kapasitas Maksimal</p>
                      <p className="text-2xl font-bold text-primary">
                        {group.maxMembers || 5}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-primary hover:bg-primary-dark text-white"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Informasi Grup
                    </Button>
                    <Button
                      onClick={handleDeleteGroup}
                      disabled={isUpdating}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus Grup
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Edit Mode */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-neutral-700 font-semibold">
                        Nama Grup
                      </Label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-neutral-700 font-semibold">
                        Deskripsi
                      </Label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="mt-2"
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleUpdateGroup}
                        disabled={isUpdating}
                        className="flex-1 bg-primary hover:bg-primary-dark text-white"
                      >
                        {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Members Card */}
          <Card className="border-neutral-200 bg-white">
            <CardHeader>
              <CardTitle className="text-neutral-900">
                Daftar Anggota ({group.members?.length || 0}/{group.maxMembers || 5})
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {group.members && group.members.length > 0 ? (
                  group.members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-neutral-900">
                            {member.name}
                          </p>
                          <p className="text-xs text-neutral-600 truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      {member._id === group.owner?._id ? (
                        <Badge className="bg-primary text-white ml-2 flex-shrink-0">
                          Owner
                        </Badge>
                      ) : (
                        <Button
                          onClick={() => handleRemoveMember(member._id)}
                          disabled={deletingMemberId === member._id}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 ml-2 flex-shrink-0"
                        >
                          {deletingMemberId === member._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-600 text-center py-8">
                    Tidak ada anggota dalam grup ini
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ManageGroupPage;
