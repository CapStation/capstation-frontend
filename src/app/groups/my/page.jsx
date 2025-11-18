'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import GroupService from '@/services/GroupService';
import Navbar from '@/components/layout/Navbar';
import { 
  Loader2, 
  Users, 
  Plus, 
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const MyGroupsPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadMyGroup();
    }
  }, [user]);

  const loadMyGroup = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await GroupService.getUserGroups();
      
      if (result.success && result.data && result.data.length > 0) {
        setGroup(result.data[0]);
      } else {
        setGroup(null);
      }
    } catch (err) {
      console.error('Error loading group:', err);
      setError(err.message || 'Gagal memuat grup');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF8730] to-[#FFB464] px-4">
        <div className="container mx-auto px-12 py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Grup Saya</h1>
              <p className="mt-2 text-neutral-50">
                {group ? 'Kelola grup capstone Anda' : 'Anda belum memiliki grup'}
              </p>
            </div>

            <div className="flex gap-2">
              {!group && (
                <Button
                  onClick={() => router.push('/groups/create')}
                  className="bg-white hover:bg-neutral-100 text-primary font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Buat Grup Baru
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-12 py-8">

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Content */}
        {group ? (
          <Card className="max-w-2xl border-2 border-neutral-200 hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 bg-primary text-white text-xl">
                  <AvatarFallback className="bg-primary text-white font-bold">
                    {group.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{group.name}</CardTitle>
                  <p className="text-neutral-600 text-sm">
                    {group.description || 'Tidak ada deskripsi'}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Anggota</p>
                    <p className="font-semibold text-neutral-900">
                      {group.members.length}/5 mahasiswa
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Status</p>
                    <Badge 
                      className={group.isActive ? 'bg-[#FF8730] hover:bg-[#FF8730]/90 text-white' : 'bg-neutral-400 text-white'}
                    >
                      {group.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                onClick={() => router.push(`/groups/${group._id}`)}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Lihat Detail
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="max-w-2xl">
            <CardContent className="text-center py-16">
              <Users className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Belum Ada Grup
              </h2>
              <p className="text-neutral-600 mb-6">
                Anda belum bergabung atau membuat grup. Buat grup baru untuk memulai capstone project Anda.
              </p>
              <Button
                onClick={() => router.push('/groups/create')}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Buat Grup Baru
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default MyGroupsPage;
