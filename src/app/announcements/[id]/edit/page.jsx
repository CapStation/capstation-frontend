'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AnnouncementFormComponent from '@/components/announcement/AnnouncementFormComponent';
import AnnouncementService from '@/services/AnnouncementService';
import Navbar from '@/components/layout/Navbar';

export default function EditAnnouncementPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [announcement, setAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  const id = params.id;

  useEffect(() => {
    if (id && !authLoading) {
      fetchAnnouncement();
    }
  }, [id, authLoading]);

  const fetchAnnouncements = async () => {
  try {
    setLoading(true);
    setError(null);

    const result = await AnnouncementService.getAnnouncements(
      page,
      10,
      null,
      'newest',
      search || null
    );

    if (result.success) {
      let data = result.data || [];

      // 🔍 Filter tambahan di frontend (jaga-jaga kalau backend nggak ngefilter)
      const keyword = (search || '').trim().toLowerCase();
      if (keyword) {
        data = data.filter((item) => {
          const title = (item.title || '').toLowerCase();
          const content = (item.content || '').toLowerCase();
          return title.includes(keyword) || content.includes(keyword);
        });
      }

      setAnnouncements(data);
      setPagination(result.pagination || {});
    } else {
      setError(result.error || 'Gagal mengambil data pengumuman');
    }
  } catch (err) {
    console.error('❌ Error fetching announcements:', err);
    setError(err.message || 'Terjadi kesalahan saat mengambil pengumuman');
  } finally {
    setLoading(false);
  }
};


  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AnnouncementService.updateAnnouncement(id, formData);

      if (result.success) {
        router.push(`/announcements`);
      } else {
        setError(result.error || 'Gagal memperbarui pengumuman');
      }
    } catch (err) {
      console.error('❌ Error updating announcement:', err);
      setError(err.message || 'Terjadi kesalahan saat memperbarui pengumuman');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching || authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
          <div className="max-w-4xl mx-auto text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
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