'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import GroupService from '@/services/GroupService';
import MemberList from '@/components/group/MemberList';
import InviteMemberDialog from '@/components/group/InviteMemberDialog';
import Navbar from '@/components/layout/Navbar';
import { AlertCircle, Loader2, ArrowLeft, Edit2, Trash2, LogOut } from 'lucide-react';

const GroupDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const groupId = params.id;

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingAvailableUsers, setLoadingAvailableUsers] = useState(false);

  useEffect(() => {
    loadGroupDetail();
    // Reload every 5 seconds for real-time updates
    const interval = setInterval(loadGroupDetail, 5000);
    return () => clearInterval(interval);
  }, [groupId]);

  const loadAvailableUsers = async () => {
    try {
      setLoadingAvailableUsers(true);
      const result = await GroupService.getAvailableUsers(groupId);
      setAvailableUsers(result.data || []);
    } catch (err) {
      console.error('Error loading available users:', err);
      setAvailableUsers([]);
    } finally {
      setLoadingAvailableUsers(false);
    }
  };

  const loadGroupDetail = async () => {
    try {
      setError(null);
      const result = await GroupService.getGroupDetail(groupId);
      if (result.success) {
        setGroup(result.data);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat detail grup');
      console.error('Load group detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (userId) => {
    try {
      setActionLoading(true);
      await GroupService.inviteMember(groupId, userId);
      await loadGroupDetail();
      setInviteDialogOpen(false);
    } catch (err) {
      setError(err.message || 'Gagal mengirim undangan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
      try {
        setActionLoading(true);
        await GroupService.removeMember(groupId, userId);
        await loadGroupDetail();
      } catch (err) {
        setError(err.message || 'Gagal menghapus anggota');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (confirm('Apakah Anda yakin ingin meninggalkan grup ini?')) {
      try {
        setActionLoading(true);
        await GroupService.leaveGroup(groupId);
        router.push('/groups');
      } catch (err) {
        setError(err.message || 'Gagal meninggalkan grup');
        setActionLoading(false);
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus grup ini? Tindakan ini tidak bisa dibatalkan.')) {
      try {
        setActionLoading(true);
        await GroupService.deleteGroup(groupId);
        router.push('/groups');
      } catch (err) {
        setError(err.message || 'Gagal menghapus grup');
        setActionLoading(false);
      }
    }
  };

  const isOwner = group && user && group.owner._id === user._id;
  const isMember = group && user && group.members.some(m => m._id === user._id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </Button>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">Grup tidak ditemukan</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <Navbar />

      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-primary via-secondary to-accent">
        <div className="container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </Button>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 bg-white text-primary text-xl shadow-lg">
                <AvatarFallback className="bg-white text-primary font-bold">
                  {group.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">{group.name}</h1>
                <p className="mt-2 text-neutral-50">
                  {group.capstone?.title || 'Capstone tidak ada'}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge className={`
                    ${group.status === 'active' ? 'bg-accent text-neutral-900' : ''}
                    ${group.status === 'inactive' ? 'bg-neutral-200 text-neutral-700' : ''}
                    ${group.status === 'archived' ? 'bg-neutral-600 text-white' : ''}
                  `}>
                    {group.status}
                  </Badge>
                  <span className="text-sm text-neutral-50">
                    Dibuat {new Date(group.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              {isOwner && (
                <>
                  <Button
                    onClick={() => router.push(`/groups/${groupId}/edit`)}
                    className="bg-white hover:bg-neutral-100 text-primary font-semibold shadow-lg"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={handleDeleteGroup}
                    disabled={actionLoading}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus
                  </Button>
                </>
              )}

              {!isOwner && isMember && (
                <Button
                  onClick={handleLeaveGroup}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Tinggalkan
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-white border border-neutral-200 rounded-lg p-1 mb-6">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Ikhtisar
            </TabsTrigger>
            <TabsTrigger 
              value="members"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Anggota ({group.members.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Group Info */}
              <Card className="md:col-span-2 border-neutral-200 bg-white shadow-sm">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <CardTitle className="text-primary">Informasi Grup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {group.description && (
                    <div>
                      <p className="text-sm font-semibold text-neutral-600 mb-1">
                        Deskripsi
                      </p>
                      <p className="text-neutral-700">{group.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-neutral-600 mb-1">
                        Anggota
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {group.members.length} / {group.maxMembers}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-600 mb-1">
                        Owner
                      </p>
                      <p className="text-neutral-700">{group.owner.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              {isOwner && (
                <Card className="border-neutral-200 bg-white shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                    <CardTitle className="text-primary">Manajemen</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Button
                      onClick={() => {
                        setInviteDialogOpen(true);
                        loadAvailableUsers();
                      }}
                      disabled={group.members.length >= group.maxMembers}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-semibold"
                    >
                      Undang Anggota
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="mt-0">
            <MemberList
              members={group.members}
              owner={group.owner}
              isOwner={isOwner}
              onRemoveMember={isOwner ? handleRemoveMember : null}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite Dialog */}
      <InviteMemberDialog
        isOpen={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        onInvite={handleInviteMember}
        isLoading={actionLoading || loadingAvailableUsers}
        availableUsers={availableUsers}
      />
    </div>
  );
};

export default GroupDetailPage;