'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react';
import AnnouncementService from '@/services/AnnouncementService';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';

export default function AnnouncementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const id = params.id;

  useEffect(() => {
    if (id && !authLoading) {
      fetchAnnouncement();
    }
  }, [id, authLoading]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await AnnouncementService.getAnnouncementById(id);

      if (result.success) {
        setAnnouncement(result.data);
      } else {
        setError(result.error || 'Gagal mengambil detail pengumuman');
      }
    } catch (err) {
      console.error('❌ Error fetching announcement:', err);
      setError(err.message || 'Terjadi kesalahan saat mengambil pengumuman');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) return;

    try {
      setIsDeleting(true);
      const result = await AnnouncementService.deleteAnnouncement(id);

      if (result.success) {
        router.push('/announcements');
      } else {
        setError(result.error || 'Gagal menghapus pengumuman');
      }
    } catch (err) {
      console.error('❌ Error deleting announcement:', err);
      setError(err.message || 'Terjadi kesalahan saat menghapus pengumuman');
    } finally {
      setIsDeleting(false);
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'dosen';
  const isCreator = String(announcement?.createdBy?._id) === String(user?._id);
  const canManage = canEdit && isCreator;

  // Debug logging
  console.log('📋 Announcement Detail Debug:', {
    userRole: user?.role,
    userId: user?._id,
    createdById: announcement?.createdBy?._id,
    canEdit,
    isCreator,
    canManage,
    announcementData: announcement
  });

  if (loading) {
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

        {/* Main Card */}
        <Card className="border-neutral-200 bg-white mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {announcement.isImportant && (
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded">
                      ⭐ PENTING
                    </span>
                  )}
                </div>
                <CardTitle className="text-3xl text-neutral-900 mb-2">
                  {announcement.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                  <span>👤 {announcement.createdBy?.name || 'Anonymous'}</span>
                  <span>📅 {new Date(announcement.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {canManage && (
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/announcements/${announcement._id}/edit`)}
                    className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="prose prose-neutral max-w-none">
              <div className="text-neutral-700 whitespace-pre-wrap leading-relaxed text-base">
                {announcement.content}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
    </>
  );
}
