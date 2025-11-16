'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import AnnouncementFormComponent from '@/components/announcement/AnnouncementFormComponent';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/layout/Navbar';

export default function EditAnnouncementPage() {
  const router = useRouter();
  const params = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  const id = params.id;

  useEffect(() => {
    if (id) {
      fetchAnnouncement();
    }
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      setIsFetching(true);
      setError(null);

      const response = await apiClient.get(`/announcements/${id}`);

      if (response.success) {
        setAnnouncement(response.data);
      } else {
        setError('Gagal mengambil data pengumuman');
      }
    } catch (err) {
      console.error('❌ Error fetching announcement:', err);
      setError(err.message || 'Terjadi kesalahan saat mengambil pengumuman');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.put(`/announcements/${id}`, formData);

      if (response.success) {
        router.push(`/announcements/${id}`);
      } else {
        setError(response.errors || 'Gagal memperbarui pengumuman');
      }
    } catch (err) {
      console.error('❌ Error updating announcement:', err);
      setError(err.message || 'Terjadi kesalahan saat memperbarui pengumuman');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-neutral-600">Memuat pengumuman...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !announcement) {
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

            <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error || 'Pengumuman tidak ditemukan'}</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

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
            initialData={announcement}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </>
  );
}
