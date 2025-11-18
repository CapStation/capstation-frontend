'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import GroupForm from '@/components/group/GroupFormComponent';
import GroupService from '@/services/GroupService';
import Navbar from '@/components/layout/Navbar';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

// Mock capstones - replace dengan actual API call
const mockCapstones = [
  { _id: '1', title: 'Capstone AI 2024' },
  { _id: '2', title: 'Capstone Web Development 2024' },
  { _id: '3', title: 'Capstone Mobile App 2024' },
];

const CreateGroupPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [checkingExistingGroup, setCheckingExistingGroup] = useState(true);
  const [hasExistingGroup, setHasExistingGroup] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      checkExistingGroup();
    }
  }, [user]);

  const checkExistingGroup = async () => {
    try {
      setCheckingExistingGroup(true);
      const result = await GroupService.getUserGroups();
      if (result.success && result.data && result.data.length > 0) {
        setHasExistingGroup(true);
      }
    } catch (err) {
      console.error('Error checking existing group:', err);
    } finally {
      setCheckingExistingGroup(false);
    }
  };

  const handleCreateGroup = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const result = await GroupService.createGroup({
        name: formData.name,
        description: formData.description,
        capstone: formData.capstone
      });

      if (result.success) {
        setSuccess('Grup berhasil dibuat!');
        setTimeout(() => {
          router.push(`/groups/${result.data._id}`);
        }, 1500);
      } else {
        setError(result.error || 'Gagal membuat grup');
      }
    } catch (err) {
      setError(err.message || 'Gagal membuat grup');
      console.error('Create group error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || checkingExistingGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Jika user sudah punya grup, tampilkan pesan dan redirect
  if (hasExistingGroup) {
    return (
      <div className="min-h-screen bg-neutral-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-yellow-200 bg-yellow-50 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900 mb-2">
                    Anda sudah memiliki grup aktif
                  </p>
                  <p className="text-sm text-yellow-700 mb-4">
                    Satu user hanya bisa memiliki atau bergabung dengan satu grup. 
                    Anda harus meninggalkan grup yang ada terlebih dahulu sebelum membuat grup baru.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push('/groups/my')}
                      className="bg-primary hover:bg-primary-dark text-white"
                    >
                      Lihat Grup Saya
                    </Button>
                    <Button
                      onClick={() => router.push('/groups')}
                      variant="outline"
                    >
                      Kembali
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
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
              <h1 className="text-4xl md:text-5xl font-bold text-white">Buat Grup Baru</h1>
              <p className="mt-2 text-neutral-50">
                Buat grup kolaborasi untuk proyek Anda
              </p>
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
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-12 py-8">
        <div className="max-w-2xl mx-auto">
          <GroupForm
            capstones={mockCapstones}
            onSubmit={handleCreateGroup}
            isLoading={loading}
            error={error}
            success={success}
          />

          {/* Info Card */}
          <Card className="mt-6 border-neutral-200 bg-white p-4">
            <p className="text-sm font-semibold text-neutral-900 mb-2">
              💡 Tips Membuat Grup
            </p>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>✓ Berikan nama grup yang jelas dan deskriptif</li>
              <li>✓ Pilih capstone yang tepat untuk grup Anda</li>
              <li>✓ Anda dapat mengundang anggota melalui email</li>
              <li>✓ Anda akan menjadi owner grup secara otomatis</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;