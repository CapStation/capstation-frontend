'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import GroupCard from '@/components/group/GroupCard';
import GroupCardSkeleton from '@/components/group/GroupCardSkeleton';
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
  const [userHasGroup, setUserHasGroup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadGroups();
      checkUserGroup();
    }
  }, [user]);

  const checkUserGroup = async () => {
    try {
      const result = await GroupService.getUserGroups();
      if (result.success && result.data && result.data.length > 0) {
        setUserHasGroup(true);
      } else {
        setUserHasGroup(false);
      }
    } catch (err) {
      // 404 berarti user belum punya grup, bukan error
      if (err.message?.includes('belum bergabung') || err.status === 404) {
        setUserHasGroup(false);
      } else {
        console.error('Error checking user group:', err);
      }
    }
  };

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

  // Pagination logic
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGroups = filteredGroups.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (authLoading || !user) {
    return null;
  }

  if (loading && allGroups.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-100">
        <Navbar />
        <div className="bg-gradient-to-r from-[#FF8730] to-[#FFB464] px-4">
          <div className="container mx-auto px-12 py-12">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="h-12 w-64 bg-white/30 rounded animate-pulse mb-3" />
                <div className="h-5 w-80 bg-white/20 rounded animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-32 bg-white/30 rounded animate-pulse" />
                <div className="h-10 w-40 bg-white/30 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-12 py-8">
          <div className="mb-6">
            <div className="h-10 w-full max-w-md bg-neutral-200 rounded animate-pulse" />
          </div>
          <div className="h-7 w-48 bg-neutral-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <GroupCardSkeleton key={index} />
            ))}
          </div>
        </div>
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
              {!userHasGroup && (
                <Button
                  onClick={() => router.push('/groups/create')}
                  className="bg-white hover:bg-neutral-100 text-primary font-semibold "
                >
                  <Plus className="w-5 h-5" />
                  Buat Grup Baru
                </Button>
              )}
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
          <div>
            <div className="h-7 w-48 bg-neutral-200 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <GroupCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <Card className="border-neutral-200 bg-white text-center py-12">
            <CardContent>
              <p className="text-neutral-600 mb-4">
                {searchTerm ? 'Tidak ada grup yang cocok dengan pencarian' : 'Belum ada grup tersedia'}
              </p>
              {!userHasGroup && (
                <Button
                  onClick={() => router.push('/groups/create')}
                  className="bg-primary hover:bg-primary-dark text-white font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Buat Grup Pertama
                </Button>
              )}
              {userHasGroup && (
                <p className="text-sm text-neutral-500">
                  Anda sudah memiliki grup. Satu pengguna hanya dapat memiliki satu grup.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900">
                {filteredGroups.length} Grup Tersedia
              </h2>
              <p className="text-sm text-neutral-600">
                Halaman {currentPage} dari {totalPages}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentGroups.map((group) => {
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

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mb-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {/* First page */}
                  {currentPage > 2 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => goToPage(1)} className="cursor-pointer">
                        1
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Ellipsis before */}
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  {/* Previous page */}
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => goToPage(currentPage - 1)} className="cursor-pointer">
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Current page */}
                  <PaginationItem>
                    <PaginationLink isActive className="cursor-default">
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>
                  
                  {/* Next page */}
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationLink onClick={() => goToPage(currentPage + 1)} className="cursor-pointer">
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Ellipsis after */}
                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  {/* Last page */}
                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => goToPage(totalPages)} className="cursor-pointer">
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupListPage;