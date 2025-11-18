'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

const GroupCard = ({ group, isOwner = false, isMember = false, onAction = null, actionLabel = null }) => {
  const getInitials = (text) => {
  if (!text) return 'GR';
  return text
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

  const getStatusColor = (isActive) => {
    if (isActive) {
      return 'bg-green-100 text-green-700 border-green-300';
    } else {
      return 'bg-neutral-200 text-neutral-700 border-neutral-300';
    }
  };

  const getStatusLabel = (isActive) => {
    return isActive ? 'Aktif' : 'Tidak Aktif';
  };

  return (
    <Card className="h-full border-2 border-neutral-200 hover:shadow-2xl transition-all duration-300 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-10 w-10 bg-primary text-white">
              <AvatarFallback className="bg-primary text-white font-semibold">
                {getInitials(group.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-2 text-neutral-900">
                {group.name}
              </CardTitle>
            </div>
          </div>
          <Badge className={`shrink-0 ${getStatusColor(group.isActive)}`}>
            {getStatusLabel(group.isActive)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description - Fixed height untuk konsistensi */}
        <div className="h-10 flex items-start">
          {group.description ? (
            <p className="text-sm text-neutral-600 line-clamp-2">
              {group.description}
            </p>
          ) : (
            <p className="text-sm text-neutral-400 italic">
              Tidak ada deskripsi
            </p>
          )}
        </div>

        {/* Members Info */}
        <div className="flex items-center justify-between py-2 px-2 bg-neutral-50 rounded-lg">
          <div>
            <p className="text-xs font-semibold text-neutral-600 uppercase">Anggota</p>
            <p className="text-lg font-bold text-primary">
              {group.members?.length || 0} / {group.maxMembers || 5}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-neutral-600 uppercase">Dibuat</p>
            <p className="text-sm font-medium text-neutral-700">
              {group.createdAt
                ? new Date(group.createdAt).toLocaleDateString('id-ID', {
                    month: 'short',
                    day: 'numeric'
                  })
                : '-'}
            </p>
          </div>
        </div>

        {/* Members Avatar */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {group.members?.slice(0, 3).map((member) => (
              <Avatar
                key={member._id}
                className="h-8 w-8 border-2 border-white bg-secondary text-neutral-900"
              >
                <AvatarFallback className="text-xs font-semibold bg-secondary">
                  {getInitials(member.name || member.email)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          {group.members?.length > 3 && (
            <span className="text-xs font-semibold text-neutral-600">
              +{group.members.length - 3}
            </span>
          )}
        </div>


        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 bg-[#FFE49C] border-[#FFE49C] text-neutral-900 hover:bg-[#B6EB75] hover:border-[#B6EB75] font-semibold transition-colors"
          >
            <Link href={`/groups/${group._id}`}>Lihat Detail</Link>
          </Button>
          {(isOwner || isMember) && onAction && (
            <Button
              size="sm"
              className={`flex-1 ${
                isOwner 
                  ? 'bg-primary hover:bg-primary-dark text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              onClick={() => onAction(group._id)}
            >
              {actionLabel || (isOwner ? 'Kelola' : 'Tinggalkan')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;