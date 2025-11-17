// src/app/announcements/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import AnnouncementService from '@/services/AnnouncementService';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';

export default function AnnouncementsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canCreateAnnouncement = user?.role === 'admin' || user?.role === 'dosen';

  useEffect(() => {
    if (!authLoading) {
      fetchAnnouncements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, authLoading]);

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

        // 🔍 Filter tambahan di frontend
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

  const handleDelete = async (id) => {
    setDeleteConfirmId(id);

    if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      setDeleteConfirmId(null);
      return;
    }

    try {
      setIsDeleting(true);
      const result = await AnnouncementService.deleteAnnouncement(id);

      if (result.success) {
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      } else {
        setError(result.error || 'Gagal menghapus pengumuman');
      }
    } catch (err) {
      console.error('❌ Error deleting announcement:', err);
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const canManageAnnouncement = () => {
    return canCreateAnnouncement; // admin & dosen bisa kelola semua
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Pengumuman</h1>
              <p className="text-neutral-600">Lihat dan kelola pengumuman terbaru</p>
            </div>
            {canCreateAnnouncement && (
              <Button
                onClick={() => router.push('/announcements/create')}
                className="bg-primary hover:bg-primary-dark text-white font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Buat Pengumuman
              </Button>
            )}
          </div>

          {/* Filters */}
          <Card className="border-neutral-200 bg-white mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Cari Pengumuman
                  </label>
                  <Input
                    placeholder="Cari berdasarkan judul atau konten..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="border-neutral-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="mt-4 text-neutral-600">Memuat pengumuman...</p>
            </div>
          )}

          {/* Announcements Grid */}
          {!loading && announcements.length > 0 && (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card
                  key={announcement._id}
                  className="border-neutral-200 bg-white hover:shadow-lg transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => router.push(`/announcements/${announcement._id}`)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {announcement.isImportant && (
                            <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                              ⭐ PENTING
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-2">
                          {announcement.title}
                        </h3>
                        <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                          {announcement.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                          <span>👤 {announcement.createdBy?.name || 'Anonymous'}</span>
                          <span>
                            📅 {new Date(announcement.createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons (Admin/Dosen only) */}
                      {canManageAnnouncement() && (
                        <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/announcements/${announcement._id}/edit`)
                            }
                            className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(announcement._id)}
                            disabled={isDeleting && deleteConfirmId === announcement._id}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            {isDeleting && deleteConfirmId === announcement._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && announcements.length === 0 && (
            <Card className="border-neutral-200 bg-white">
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-neutral-600 mb-4">Tidak ada pengumuman yang ditemukan</p>
                {canCreateAnnouncement && (
                  <Button
                    onClick={() => router.push('/announcements/create')}
                    className="bg-primary hover:bg-primary-dark text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Pengumuman Pertama
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && !loading && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="border-neutral-300"
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-neutral-600">
                Halaman {page} dari {pagination.pages}
              </span>
              <Button
                variant="outline"
                disabled={page === pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="border-neutral-300"
              >
                Berikutnya
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
