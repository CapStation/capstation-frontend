'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GroupCard from '@/components/group/GroupCard';
import GroupService from '@/services/GroupService';
import Navbar from '@/components/layout/Navbar';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

const MyGroupsPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadMyGroups();
    }
  }, [user]);

  const loadMyGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await GroupService.getUserGroups(1, 100);
      setMyGroups(result.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat grup Anda');
      console.error('Load my groups error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (confirm('Apakah Anda yakin ingin meninggalkan grup ini?')) {
      try {
        await GroupService.leaveGroup(groupId);
        loadMyGroups();
      } catch (err) {
        setError(err.message || 'Gagal meninggalkan grup');
      }
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

      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-primary via-secondary to-accent">
        <div className="container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            onClick={() => router.push('/groups')}
            className="mb-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali ke Semua Grup
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Grup Saya</h1>
          <p className="mt-2 text-neutral-50">
            Daftar grup capstone yang Anda ikuti
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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

        {/* Main Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : myGroups.length === 0 ? (
          <Card className="border-neutral-200 bg-white text-center py-12">
            <CardContent>
              <p className="text-neutral-600 mb-4">
                Anda belum bergabung dengan grup apapun
              </p>
              <Button
                onClick={() => router.push('/groups')}
                className="bg-primary hover:bg-primary-dark text-white font-semibold"
              >
                Jelajahi Grup Tersedia
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                {myGroups.length} Grup Aktif
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroups.map((group) => (
                  <GroupCard
                    key={group._id}
                    group={group}
                    isOwner={group.owner?._id === user?._id}
                    onAction={
                      group.owner?._id === user?._id
                        ? null
                        : () => handleLeaveGroup(group._id)
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGroupsPage;