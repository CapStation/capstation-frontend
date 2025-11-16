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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleCreateGroup = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const result = await GroupService.createGroup({
        name: formData.name,
        description: formData.description,
        capstone: formData.capstone,
        maxMembers: formData.maxMembers
      });

      if (result.success) {
        setSuccess('Grup berhasil dibuat!');
        setTimeout(() => {
          router.push(`/groups/${result.data._id}`);
        }, 1500);
      }
    } catch (err) {
      setError(err);
      console.error('Create group error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <Navbar />

      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary via-secondary to-accent">
        <div className="container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            onClick={() => router.push('/groups')}
            className="mb-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Buat Grup Baru</h1>
          <p className="mt-2 text-neutral-50">
            Buat grup kolaborasi untuk capstone Anda
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
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
              <li>✓ Atur jumlah anggota maksimal sesuai kebutuhan</li>
              <li>✓ Anda akan menjadi owner grup secara otomatis</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;