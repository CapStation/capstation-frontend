'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { AlertCircle, Plus, Trash2, Edit } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';

export default function AnnouncementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('semua');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Check if user is admin or dosen
  const canCreateAnnouncement = user?.role === 'admin' || user?.role === 'dosen';

  useEffect(() => {
    fetchAnnouncements();
  }, [search, category, sort, page]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page,
        limit: 10,
        sort,
        ...(category !== 'semua' && { category }),
        ...(search && { search })
      });

      const response = await apiClient.get(`/announcements?${params.toString()}`);
      
      if (response.success) {
        setAnnouncements(response.data || []);
        setPagination(response.pagination || {});
      } else {
        setError('Gagal mengambil data pengumuman');
      }
    } catch (err) {
      console.error('❌ Error fetching announcements:', err);
      setError(err.message || 'Terjadi kesalahan saat mengambil pengumuman');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) return;

    try {
      const response = await apiClient.delete(`/announcements/${id}`);
      
      if (response.success) {
        setAnnouncements(prev => prev.filter(a => a._id !== id));
      } else {
        alert('Gagal menghapus pengumuman');
      }
    } catch (err) {
      console.error('❌ Error deleting announcement:', err);
      alert(err.message || 'Terjadi kesalahan');
    }
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      'akademik': 'bg-blue-100 text-blue-800',
      'pengumuman': 'bg-green-100 text-green-800',
      'peringatan': 'bg-red-100 text-red-800',
      'informasi': 'bg-yellow-100 text-yellow-800',
      'lainnya': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Kategori
                </label>
                <Select value={category} onValueChange={(val) => {
                  setCategory(val);
                  setPage(1);
                }}>
                  <SelectTrigger className="border-neutral-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-neutral-300">
                    <SelectItem value="semua">Semua Kategori</SelectItem>
                    <SelectItem value="akademik">Akademik</SelectItem>
                    <SelectItem value="pengumuman">Pengumuman</SelectItem>
                    <SelectItem value="peringatan">Peringatan</SelectItem>
                    <SelectItem value="informasi">Informasi</SelectItem>
                    <SelectItem value="lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Urutkan
                </label>
                <Select value={sort} onValueChange={(val) => {
                  setSort(val);
                  setPage(1);
                }}>
                  <SelectTrigger className="border-neutral-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-neutral-300">
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="oldest">Terlama</SelectItem>
                    <SelectItem value="important">Terpenting</SelectItem>
                  </SelectContent>
                </Select>
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-neutral-600">Memuat pengumuman...</p>
          </div>
        )}

        {/* Announcements Grid */}
        {!loading && announcements.length > 0 && (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card
                key={announcement._id}
                className="border-neutral-200 bg-white hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/announcements/${announcement._id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {announcement.isImportant && (
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                            ⭐ PENTING
                          </span>
                        )}
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getCategoryBadgeColor(announcement.category)}`}>
                          {announcement.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900 mb-2">
                        {announcement.title}
                      </h3>
                      <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span>👤 {announcement.createdBy?.name || 'Anonymous'}</span>
                        <span>📅 {new Date(announcement.createdAt).toLocaleDateString('id-ID')}</span>
                        <span>👁️ {announcement.viewCount} views</span>
                      </div>
                    </div>

                    {/* Action Buttons (Owner only) */}
                    {canCreateAnnouncement && announcement.createdBy._id === user._id && (
                      <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/announcements/${announcement._id}/edit`)}
                          className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(announcement._id)}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
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
              onClick={() => setPage(p => p - 1)}
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
              onClick={() => setPage(p => p + 1)}
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
