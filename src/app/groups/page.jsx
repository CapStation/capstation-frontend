'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import GroupCard from '@/components/group/GroupCard';
import GroupService from '@/services/GroupService';
import Navbar from '@/components/layout/Navbar';
import { Plus, Search, AlertCircle, Loader2 } from 'lucide-react';

const GroupListPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await GroupService.getAllGroups(1, 100);
      setAllGroups(result.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat grup');
      console.error('Load groups error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestJoin = async (groupId) => {
    try {
      await GroupService.requestJoin(groupId);
      loadGroups();
    } catch (err) {
      setError(err.message || 'Gagal mengirim permintaan');
    }
  };

  const filteredGroups = allGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Navbar />

      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#FF8730] to-[#FFB464] px-4">
        <div className="container mx-auto px-12 py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Semua Grup</h1>
              <p className="mt-2 text-neutral-50">
                Jelajahi dan bergabung dengan grup capstone
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => router.push('/groups/my')}
                variant="outline"
                className="bg-white/20 border-white text-white hover:bg-white/30"
              >
                Grup Saya
              </Button>
              <Button
                onClick={() => router.push('/groups/create')}
                className="bg-white hover:bg-neutral-100 text-primary font-semibold "
              >
                <Plus className="w-5 h-5" />
                Buat Grup Baru
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-12 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              placeholder="Cari grup berdasarkan nama atau deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-neutral-300 text-neutral-900 placeholder:text-neutral-500 bg-white"
            />
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <Card className="border-neutral-200 bg-white text-center py-12">
            <CardContent>
              <p className="text-neutral-600 mb-4">
                {searchTerm ? 'Tidak ada grup yang cocok dengan pencarian' : 'Belum ada grup tersedia'}
              </p>
              <Button
                onClick={() => router.push('/groups/create')}
                className="bg-primary hover:bg-primary-dark text-white font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Buat Grup Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              {filteredGroups.length} Grup Tersedia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => {
                // User ID bisa berupa user.id atau user._id
                const userId = (user?.id || user?._id)?.toString();
                
                // Owner ID dari group
                const ownerId = (typeof group.owner === 'string' 
                  ? group.owner 
                  : (group.owner?._id || group.owner?.id))?.toString();
                
                const isOwner = userId === ownerId;
                
                // Check if user is member
                const isMember = group.members?.some(member => {
                  const memberId = (typeof member === 'string' ? member : (member._id || member.id))?.toString();
                  return memberId === userId;
                }) || false;
                
                console.log('🔍 GroupCard check:', {
                  groupName: group.name,
                  userId,
                  ownerId,
                  isOwner,
                  isMember
                });
                
                return (
                  <GroupCard
                    key={group._id}
                    group={group}
                    isOwner={isOwner}
                    isMember={isMember}
                    onAction={
                      !isOwner && !isMember
                        ? () => handleRequestJoin(group._id)
                        : null
                    }
                    actionLabel={
                      isOwner ? 'Kelola' : (isMember ? null : 'Gabung')
                    }
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupListPage;