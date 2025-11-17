'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import GroupForm from '@/components/group/GroupFormComponent';
import GroupService from '@/services/GroupService';
import ProjectService from '@/services/ProjectService';
import Navbar from '@/components/layout/Navbar';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

const CreateGroupPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [existingProjects, setExistingProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        // Fetch existing projects that can be continued
        const result = await ProjectService.getAllProjects(1, 50);
        if (result.success && result.data) {
          setExistingProjects(result.data);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoadingProjects(false);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user]);

  const handleCreateGroup = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('📤 Submitting group creation with data:', formData);

      const result = await GroupService.createGroup({
        name: formData.name,
        description: formData.description,
        maxMembers: formData.maxMembers,
        projectType: formData.projectType,
        projectId: formData.projectId || null,
        inviteEmails: formData.inviteEmails || []
      });

      console.log('✅ Group creation result:', result);

      if (result.success) {
        setSuccess('Grup berhasil dibuat!');
        setTimeout(() => {
          router.push(`/groups/${result.data._id || result.data.id}`);
        }, 1500);
      } else {
        setError(result.error || 'Gagal membuat grup');
      }
    } catch (err) {
      console.error('❌ Create group error:', err);
      setError(err.message || 'Terjadi kesalahan saat membuat grup');
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
            Buat grup kolaborasi untuk proyek Anda
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {loadingProjects ? (
            <Card className="border-neutral-200 bg-white p-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-neutral-600">Memuat data proyek...</span>
            </Card>
          ) : (
            <GroupForm
              existingProjects={existingProjects}
              onSubmit={handleCreateGroup}
              isLoading={loading}
              error={error}
              success={success}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;
