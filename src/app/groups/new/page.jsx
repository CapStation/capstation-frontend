'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import groupService from '@/services/GroupService';
import InviteMemberDialog from '@/components/group/InviteMemberDialog';
import { ArrowLeft, Loader2 } from 'lucide-react';

/**
 * Create Group Page
 * Form untuk membuat group baru dengan validation
 */
export default function CreateGroupPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    capstoneId: '',
    description: '',
    maxMembers: 4,
    visibility: 'public',
    autoApproveJoin: false,
  });

  const [capstones, setCapstones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [capstoneLoading, setCapstoneLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [invitedEmails, setInvitedEmails] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadCapstones();
  }, [isAuthenticated]);

  const loadCapstones = async () => {
    try {
      setCapstoneLoading(true);
      // TODO: Get available capstones from API
      // Untuk sekarang, mock data
      const mockCapstones = [
        { _id: '1', title: 'Sistem IoT Healthcare' },
        { _id: '2', title: 'Smart City Water Management' },
        { _id: '3', title: 'Renewable Energy Monitoring' },
      ];
      setCapstones(mockCapstones);
    } catch (error) {
      console.error('Error loading capstones:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat daftar capstone',
        variant: 'destructive',
      });
    } finally {
      setCapstoneLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInviteMembers = async (emails) => {
    setInvitedEmails(emails);
    setShowInviteDialog(false);
    toast({
      title: 'Sukses',
      description: `${emails.length} anggota akan diinvite setelah grup dibuat`,
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Nama grup harus diisi',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.capstoneId) {
      toast({
        title: 'Error',
        description: 'Capstone/Project harus dipilih',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.maxMembers < 2 || formData.maxMembers > 4) {
      toast({
        title: 'Error',
        description: 'Jumlah member harus antara 2-4',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const groupData = {
        ...formData,
        initialMembers: invitedEmails,
      };

      const newGroup = await groupService.createGroup(groupData);

      toast({
        title: 'Sukses',
        description: 'Grup berhasil dibuat',
      });

      router.push(`/groups/${newGroup._id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal membuat grup',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || capstoneLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Buat Grup Capstone Baru</CardTitle>
            <CardDescription>
              Isi form berikut untuk membuat grup dan mulai berkolaborasi
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informasi Grup</h3>

                {/* Group Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Grup *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Contoh: Tim C-02"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Nama grup harus unik dan deskriptif
                  </p>
                </div>

                {/* Capstone Selection */}
                <div className="space-y-2">
                  <Label htmlFor="capstone">Capstone/Project *</Label>
                  <Select
                    value={formData.capstoneId}
                    onValueChange={(value) => handleSelectChange('capstoneId', value)}
                    disabled={loading}
                  >
                    <SelectTrigger id="capstone">
                      <SelectValue placeholder="Pilih capstone/project" />
                    </SelectTrigger>
                    <SelectContent>
                      {capstones.map((capstone) => (
                        <SelectItem key={capstone._id} value={capstone._id}>
                          {capstone.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Satu capstone hanya bisa dimiliki satu grup
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi Grup</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Jelaskan tujuan dan fokus grup Anda..."
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={loading}
                    rows={4}
                  />
                </div>
              </div>

              {/* Group Settings Section */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold">Pengaturan Grup</h3>

                {/* Max Members */}
                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Jumlah Member Maksimal *</Label>
                  <Select
                    value={String(formData.maxMembers)}
                    onValueChange={(value) => handleSelectChange('maxMembers', parseInt(value))}
                    disabled={loading}
                  >
                    <SelectTrigger id="maxMembers">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Anggota</SelectItem>
                      <SelectItem value="3">3 Anggota</SelectItem>
                      <SelectItem value="4">4 Anggota (Rekomendasi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Visibility */}
                <div className="space-y-2">
                  <Label htmlFor="visibility">Tipe Grup *</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) => handleSelectChange('visibility', value)}
                    disabled={loading}
                  >
                    <SelectTrigger id="visibility">
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

                {/* Auto Approve Join */}
                {formData.visibility === 'public' && (
                  <div className="space-y-2">
                    <Label htmlFor="autoApprove">Persetujuan Anggota Baru</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="autoApprove"
                        name="autoApproveJoin"
                        type="checkbox"
                        checked={formData.autoApproveJoin}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="rounded border-input"
                      />
                      <Label htmlFor="autoApprove" className="font-normal cursor-pointer">
                        Otomatis approve join request
                      </Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Initial Members Section */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Undang Anggota (Opsional)</h3>
                    <p className="text-sm text-muted-foreground">
                      Anda bisa undang anggota setelah membuat grup
                    </p>
                  </div>
                  {invitedEmails.length > 0 && (
                    <div className="text-sm font-semibold text-primary">
                      {invitedEmails.length} email
                    </div>
                  )}
                </div>

                {invitedEmails.length > 0 && (
                  <div className="bg-accent rounded-md p-3">
                    <div className="text-sm font-medium mb-2">Email yang akan diinvite:</div>
                    <ul className="text-sm space-y-1">
                      {invitedEmails.map((email, idx) => (
                        <li key={idx} className="text-muted-foreground">• {email}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteDialog(true)}
                  disabled={loading}
                >
                  Tambah Anggota untuk Diundang
                </Button>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Membuat Grup...
                    </>
                  ) : (
                    'Buat Grup'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Invite Members Dialog */}
      <InviteMemberDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onSubmit={handleInviteMembers}
        groupName={formData.name || 'Grup Baru'}
        isLoading={loading}
      />
    </div>
  );
}
