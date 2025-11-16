'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import groupService from '@/services/GroupService';
import MemberCard from '@/components/group/MemberCard';
import InvitationCard from '@/components/group/InvitationCard';
import JoinRequestCard from '@/components/group/JoinRequestCard';
import InviteMemberDialog from '@/components/group/InviteMemberDialog';
import ConfirmDialog from '@/components/group/ConfirmDialog';
import { ArrowLeft, Loader2, Crown, Plus, LogOut } from 'lucide-react';

/**
 * Group Detail Page
 * Display informasi group, members, invitations, join requests
 */
export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const groupId = params?.id;

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [leaveConfirm, setLeaveConfirm] = useState(false);

  const isLeader = user && group && group.owner?._id === user._id;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (groupId) {
      loadGroupDetail();
    }
  }, [isAuthenticated, groupId]);

  const loadGroupDetail = async () => {
    try {
      setLoading(true);
      const data = await groupService.getGroupDetail(groupId);
      setGroup(data);
    } catch (error) {
      console.error('Error loading group detail:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat detail grup',
        variant: 'destructive',
      });
      router.push('/groups');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMembers = async (emails) => {
    try {
      setLoading(true);
      await groupService.inviteMembers(groupId, emails);
      toast({
        title: 'Sukses',
        description: `${emails.length} anggota berhasil diundang`,
      });
      setShowInviteDialog(false);
      await loadGroupDetail();
    } catch (error) {
      console.error('Error inviting members:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal mengundang anggota',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      setLoading(true);
      await groupService.removeMember(groupId, memberId);
      toast({
        title: 'Sukses',
        description: 'Anggota berhasil dihapus dari grup',
      });
      await loadGroupDetail();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal menghapus anggota',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      setLoading(true);
      await groupService.acceptInvitation(invitationId);
      toast({
        title: 'Sukses',
        description: 'Anda telah bergabung dengan grup',
      });
      await loadGroupDetail();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal menerima undangan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      setLoading(true);
      await groupService.rejectInvitation(invitationId);
      toast({
        title: 'Sukses',
        description: 'Anda telah menolak undangan',
      });
      await loadGroupDetail();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal menolak undangan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJoinRequest = async (requestId) => {
    try {
      setLoading(true);
      await groupService.handleJoinRequest(groupId, requestId, 'accept');
      toast({
        title: 'Sukses',
        description: 'Anggota baru diterima',
      });
      await loadGroupDetail();
    } catch (error) {
      console.error('Error accepting join request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal menerima permintaan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectJoinRequest = async (requestId) => {
    try {
      setLoading(true);
      await groupService.handleJoinRequest(groupId, requestId, 'reject');
      toast({
        title: 'Sukses',
        description: 'Permintaan ditolak',
      });
      await loadGroupDetail();
    } catch (error) {
      console.error('Error rejecting join request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal menolak permintaan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      setLoading(true);
      await groupService.leaveGroup(groupId);
      toast({
        title: 'Sukses',
        description: 'Anda telah meninggalkan grup',
      });
      router.push('/groups');
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal meninggalkan grup',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setLeaveConfirm(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (loading && !group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Grup tidak ditemukan</p>
        <Button onClick={() => router.push('/groups')}>Kembali ke Grup</Button>
      </div>
    );
  }

  const memberCount = group.members?.length || 0;
  const maxMembers = group.maxMembers || 4;
  const isFull = memberCount >= maxMembers;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{group.name}</h1>
              <p className="text-muted-foreground mt-2">{group.capstone?.title}</p>
            </div>
            <div className="flex gap-2">
              {isLeader && (
                <Button
                  onClick={() => router.push(`/groups/${groupId}/settings`)}
                >
                  Pengaturan
                </Button>
              )}
              {!isLeader && (
                <Button
                  variant="outline"
                  onClick={() => setLeaveConfirm(true)}
                  className="text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Tinggalkan
                </Button>
              )}
            </div>
          </div>

          {/* Group Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{memberCount}</div>
                <div className="text-sm text-muted-foreground">Anggota Aktif</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{maxMembers}</div>
                <div className="text-sm text-muted-foreground">Kapasitas Maksimal</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Badge variant={group.visibility === 'public' ? 'default' : 'secondary'}>
                  {group.visibility === 'public' ? 'Publik' : 'Privat'}
                </Badge>
              </CardContent>
            </Card>
            {isFull && (
              <Card>
                <CardContent className="pt-6">
                  <Badge variant="destructive">Grup Penuh</Badge>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Description */}
          {group.description && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">{group.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members">
              Anggota ({memberCount})
            </TabsTrigger>
            <TabsTrigger value="invitations">
              Undangan ({group.invitations?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Permintaan ({group.joinRequests?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="project">Project</TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Anggota Grup</h2>
              {isLeader && !isFull && (
                <Button
                  onClick={() => setShowInviteDialog(true)}
                  disabled={loading}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Undang Anggota
                </Button>
              )}
            </div>

            {memberCount === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Belum ada anggota
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {group.members?.map((member) => (
                  <MemberCard
                    key={member._id}
                    member={member}
                    isLeader={member._id === group.owner?._id}
                    isCurrentUserLeader={isLeader}
                    onRemove={handleRemoveMember}
                    isLoading={loading}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations" className="space-y-4">
            <h2 className="text-xl font-semibold">Undangan yang Tertunda</h2>

            {!group.invitations || group.invitations.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Tidak ada undangan yang tertunda
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {group.invitations.map((invitation) => (
                  <InvitationCard
                    key={invitation._id}
                    invitation={invitation}
                    onAccept={handleAcceptInvitation}
                    onReject={handleRejectInvitation}
                    isLoading={loading}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Join Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <h2 className="text-xl font-semibold">Permintaan Bergabung</h2>

            {isLeader ? (
              !group.joinRequests || group.joinRequests.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    Tidak ada permintaan bergabung
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {group.joinRequests.map((request) => (
                    <JoinRequestCard
                      key={request._id}
                      request={request}
                      onAccept={handleAcceptJoinRequest}
                      onReject={handleRejectJoinRequest}
                      isLoading={loading}
                    />
                  ))}
                </div>
              )
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Hanya leader yang bisa melihat permintaan bergabung
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Project Tab */}
          <TabsContent value="project" className="space-y-4">
            <h2 className="text-xl font-semibold">Detail Project</h2>
            <Card>
              <CardHeader>
                <CardTitle>{group.capstone?.title}</CardTitle>
                <CardDescription>{group.capstone?.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Deskripsi</h3>
                    <p className="text-sm text-muted-foreground">
                      {group.capstone?.description || 'Tidak ada deskripsi'}
                    </p>
                  </div>
                  {group.capstone?.status && (
                    <div>
                      <h3 className="font-semibold mb-2">Status</h3>
                      <Badge>{group.capstone.status}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite Members Dialog */}
      <InviteMemberDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onSubmit={handleInviteMembers}
        groupName={group.name}
        isLoading={loading}
      />

      {/* Leave Confirmation */}
      <ConfirmDialog
        open={leaveConfirm}
        onOpenChange={setLeaveConfirm}
        title="Tinggalkan Grup"
        description={`Apakah Anda yakin ingin meninggalkan grup "${group.name}"?`}
        actionLabel="Tinggalkan"
        isDangerous={true}
        isLoading={loading}
        onConfirm={handleLeaveGroup}
      />
    </div>
  );
}
