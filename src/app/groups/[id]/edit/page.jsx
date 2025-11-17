'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

const EditGroupPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const groupId = params.id;

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadGroupDetail();
    }
  }, [groupId, user]);

  const loadGroupDetail = async () => {
    try {
      setError(null);
      const result = await GroupService.getGroupDetail(groupId);
      if (result.success) {
        setGroup(result.data);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat detail grup');
      console.error('Load group error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroup = async (formData) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const result = await GroupService.updateGroup(groupId, {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        maxMembers: formData.maxMembers
      });

      if (result.success) {
        setSuccess('Grup berhasil diperbarui!');
        setTimeout(() => {
          router.push(`/groups/${groupId}`);
        }, 1500);
      }
    } catch (err) {
      setError(err);
      console.error('Update group error:', err);
    } finally {
      setUpdating(false);
    }
  };

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
            <p className="text-red-700 p-6">Grup tidak ditemukan</p>
          </Card>
        </div>
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
            onClick={() => router.back()}
            className="mb-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Edit Informasi Grup</h1>
          <p className="mt-2 text-neutral-50">
            Ubah nama, deskripsi, dan pengaturan grup {group.name}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <GroupForm
            initialData={group}
            capstones={mockCapstones}
            onSubmit={handleUpdateGroup}
            isLoading={updating}
            error={error}
            success={success}
          />
        </div>
      </div>
    </div>
  );
};

export default EditGroupPage;
