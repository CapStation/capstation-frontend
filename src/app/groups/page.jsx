'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import groupService from '@/services/GroupService';
import GroupCard from '@/components/group/GroupCard';
import ConfirmDialog from '@/components/group/ConfirmDialog';
import { Plus, Loader2 } from 'lucide-react';

/**
 * Groups Page - My Groups
 * Display semua group milik user dengan actions
 */
export default function GroupsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveConfirm, setLeaveConfirm] = useState({ open: false, groupId: null, groupName: '' });

  // Fetch groups
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadGroups();
  }, [isAuthenticated]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await groupService.getMyGroups();
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat grup',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (groupId) => {
    router.push(`/groups/${groupId}`);
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      setLoading(true);
      await groupService.leaveGroup(groupId);
      toast({
        title: 'Sukses',
        description: 'Anda telah meninggalkan grup',
      });
      await loadGroups();
      setLeaveConfirm({ open: false, groupId: null, groupName: '' });
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal meninggalkan grup',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettings = (groupId) => {
    router.push(`/groups/${groupId}/settings`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Grup Capstone Saya</h1>
            <p className="text-muted-foreground mt-2">
              Kelola grup capstone dan anggota Anda
            </p>
          </div>
          <Button
            onClick={() => router.push('/groups/new')}
            className="gap-2"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            Buat Grup Baru
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : groups.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-lg mb-4">
              Anda belum memiliki grup capstone
            </p>
            <Button onClick={() => router.push('/groups/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Buat Grup Pertama Anda
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const isLeader = user && group.owner && group.owner._id === user._id;
              return (
                <GroupCard
                  key={group._id}
                  group={group}
                  isLeader={isLeader}
                  onViewDetails={() => handleViewDetails(group._id)}
                  onLeaveGroup={() =>
                    setLeaveConfirm({ open: true, groupId: group._id, groupName: group.name })
                  }
                  onSettings={() => handleSettings(group._id)}
                  isLoading={loading}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Leave Confirmation Dialog */}
      <ConfirmDialog
        open={leaveConfirm.open}
        onOpenChange={(open) => setLeaveConfirm({ ...leaveConfirm, open })}
        title="Tinggalkan Grup"
        description={`Apakah Anda yakin ingin meninggalkan grup "${leaveConfirm.groupName}"?`}
        actionLabel="Tinggalkan"
        isDangerous={true}
        isLoading={loading}
        onConfirm={() => handleLeaveGroup(leaveConfirm.groupId)}
      />
    </div>
  );
}
