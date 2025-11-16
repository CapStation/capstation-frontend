'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AnnouncementFormComponent from '@/components/announcement/AnnouncementFormComponent';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/layout/Navbar';

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/announcements', formData);

      if (response.success) {
        router.push(`/announcements/${response.data._id}`);
      } else {
        setError(response.errors || 'Gagal membuat pengumuman');
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
            onClick={() => router.back()}
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