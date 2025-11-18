'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import groupService from '@/services/GroupService';
import MemberCard from '@/components/group/MemberCard';
import ConfirmDialog from '@/components/group/ConfirmDialog';
import { ArrowLeft, Loader2, ArrowRight } from 'lucide-react';

/**
 * Group Settings Page
 * Edit group info, manage members, transfer leadership, disband group
 * Only accessible by group leader
 */
export default function GroupSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const groupId = params?.id;

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    visibility: '',
    isActive: true,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [transferLeaderDialog, setTransferLeaderDialog] = useState({ open: false, memberId: null, memberName: '' });
  const [disbandDialog, setDisbandDialog] = useState(false);

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
      setEditData({
        name: data.name || '',
        description: data.description || '',
        visibility: data.visibility || 'public',
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
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

  // Check if user is group leader
  const isLeader = user && group && group.owner?._id === user._id;

  useEffect(() => {
    if (!isLeader && group) {
      toast({
        title: 'Error',
        description: 'Anda tidak memiliki akses ke halaman ini',
        variant: 'destructive',
      });
      router.push(`/groups/${groupId}`);
    }
  }, [isLeader, group]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);
  };

  const handleSelectChange = (name, value) => {
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const updateData = {
        name: editData.name.trim(),
        description: editData.description.trim(),
        visibility: editData.visibility,
        isActive: editData.isActive,
      };

      await groupService.updateGroup(groupId, updateData);
      toast({
        title: 'Sukses',
        description: 'Pengaturan grup berhasil diperbarui',
      });
      setHasChanges(false);
      await loadGroupDetail();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyimpan perubahan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferLeadership = async (newLeaderId) => {
    try {
      setLoading(true);
      await groupService.transferLeadership(groupId, newLeaderId);
      toast({
        title: 'Sukses',
        description: 'Kepemimpinan berhasil dipindahkan',
      });
      setTransferLeaderDialog({ open: false, memberId: null, memberName: '' });
      router.push(`/groups/${groupId}`);
    } catch (error) {
      console.error('Error transferring leadership:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal memindahkan kepemimpinan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisbandGroup = async () => {
    try {
      setLoading(true);
      await groupService.disbandGroup(groupId);
      toast({
        title: 'Sukses',
        description: 'Grup berhasil dibubarkan',
      });
      router.push('/groups');
    } catch (error) {
      console.error('Error disbanding group:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal membubarkan grup',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setDisbandDialog(false);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group || !isLeader) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Akses ditolak</p>
        <Button onClick={() => router.back()}>Kembali</Button>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Pengaturan Grup</h1>
          <p className="text-muted-foreground mt-2">{group.name}</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
            <TabsTrigger value="members">Anggota</TabsTrigger>
            <TabsTrigger value="danger">Bahaya</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Dasar Grup</CardTitle>
                <CardDescription>
                  Edit nama, deskripsi, dan pengaturan visibility grup Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Group Name */}
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nama Grup</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                    disabled={loading}
                    placeholder="Nama grup"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Deskripsi</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    value={editData.description}
                    onChange={handleInputChange}
                    disabled={loading}
                    placeholder="Deskripsi grup..."
                    rows={4}
                  />
                </div>

                {/* Visibility */}
                <div className="space-y-2">
                  <Label htmlFor="edit-visibility">Tipe Grup</Label>
                  <Select
                    value={editData.visibility}
                    onValueChange={(value) => handleSelectChange('visibility', value)}
                    disabled={loading}
                  >
                    <SelectTrigger id="edit-visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        Publik - Siapa pun bisa request join
                      </SelectItem>
                      <SelectItem value="private">
                        Privat - Hanya yang diundang
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Aktif */}
                <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="edit-isActive">Status Grup</Label>
                    <div className="text-sm text-muted-foreground">
                      {editData.isActive ? 'Grup aktif dan dapat diakses' : 'Grup tidak aktif dan tidak dapat diakses'}
                    </div>
                  </div>
                  <Switch
                    id="edit-isActive"
                    checked={editData.isActive}
                    onCheckedChange={(checked) => handleSelectChange('isActive', checked)}
                    disabled={loading}
                  />
                </div>

                {/* Save Button */}
                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditData({
                        name: group.name || '',
                        description: group.description || '',
                        visibility: group.visibility || 'public',
                        isActive: group.isActive !== undefined ? group.isActive : true,
                      });
                      setHasChanges(false);
                    }}
                    disabled={loading || !hasChanges}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={loading || !hasChanges}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manajemen Anggota</CardTitle>
                <CardDescription>
                  Kelola anggota dan transfer kepemimpinan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {group.members && group.members.length > 0 ? (
                  <div className="space-y-3">
                    {group.members.map((member) => {
                      const isMemberLeader = member._id === group.owner?._id;
                      return (
                        <div key={member._id} className="flex items-center justify-between gap-4 p-4 border rounded-md hover:bg-accent/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.email}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 shrink-0">
                            {!isMemberLeader && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setTransferLeaderDialog({
                                      open: true,
                                      memberId: member._id,
                                      memberName: member.name,
                                    })
                                  }
                                  disabled={loading}
                                >
                                  <ArrowRight className="w-4 h-4 mr-1" />
                                  Jadikan Leader
                                </Button>
                              </>
                            )}
                            {isMemberLeader && (
                              <span className="text-sm font-semibold text-primary">
                                Leader
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Belum ada anggota</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Zona Berbahaya</CardTitle>
                <CardDescription>
                  Aksi di sini tidak dapat dibatalkan. Lakukan dengan hati-hati.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Disband Group */}
                <div className="p-4 border border-destructive rounded-md bg-destructive/5">
                  <h3 className="font-semibold text-destructive mb-2">Bubarkan Grup</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Menghapus grup akan menghapus semua data terkait. Ini tidak dapat dibatalkan.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setDisbandDialog(true)}
                    disabled={loading}
                  >
                    Bubarkan Grup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Transfer Leadership Dialog */}
      <ConfirmDialog
        open={transferLeaderDialog.open}
        onOpenChange={(open) =>
          setTransferLeaderDialog({ ...transferLeaderDialog, open })
        }
        title="Pindahkan Kepemimpinan"
        description={`Apakah Anda yakin ingin membuat "${transferLeaderDialog.memberName}" sebagai leader baru grup ini?`}
        actionLabel="Pindahkan"
        isLoading={loading}
        onConfirm={() => handleTransferLeadership(transferLeaderDialog.memberId)}
      />

      {/* Disband Confirmation Dialog */}
      <ConfirmDialog
        open={disbandDialog}
        onOpenChange={setDisbandDialog}
        title="Bubarkan Grup"
        description={`Apakah Anda yakin ingin membubarkan grup "${group.name}"? Tindakan ini tidak dapat dibatalkan.`}
        actionLabel="Bubarkan"
        isDangerous={true}
        isLoading={loading}
        onConfirm={handleDisbandGroup}
      />
    </div>
  );
}
