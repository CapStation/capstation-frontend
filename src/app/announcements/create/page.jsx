'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AnnouncementFormComponent from '@/components/announcement/AnnouncementFormComponent';
import AnnouncementService from '@/services/AnnouncementService';
import Navbar from '@/components/layout/Navbar';

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check authorization
  if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'dosen'))) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-6 text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>

            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-semibold text-red-900">Akses Ditolak</p>
              <p className="text-sm text-red-700">Hanya admin atau dosen yang dapat membuat pengumuman.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AnnouncementService.createAnnouncement(formData);

      if (result.success) {
        router.push('/announcements');
      } else {
        setError(result.error || 'Gagal membuat pengumuman');
      }
    } catch (err) {
      console.error('❌ Error creating announcement:', err);
      setError(err.message || 'Terjadi kesalahan saat membuat pengumuman');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push('/announcements')}
            className="mb-6 text-primary hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>

          {/* Form */}
          <AnnouncementFormComponent
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </>
  );
}