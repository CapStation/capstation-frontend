'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

const GroupCard = ({ group, isOwner = false, onAction = null }) => {
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'GR';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-accent text-neutral-900';
      case 'inactive':
        return 'bg-neutral-200 text-neutral-700';
      case 'archived':
        return 'bg-neutral-600 text-white';
      default:
        return 'bg-neutral-200 text-neutral-700';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-neutral-200 bg-white">
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
              <CardDescription className="text-sm text-neutral-600">
                {group.capstone?.title || 'Capstone tidak ada'}
              </CardDescription>
            </div>
          </div>
          <Badge className={`shrink-0 ${getStatusColor(group.status)}`}>
            {group.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {group.description && (
          <p className="text-sm text-neutral-600 line-clamp-2">
            {group.description}
          </p>
        )}

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
                  {getInitials(member.name)}
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
            className="flex-1 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          >
            <Link href={`/groups/${group._id}`}>Lihat Detail</Link>
          </Button>
          {onAction && (
            <Button
              size="sm"
              variant={isOwner ? 'default' : 'outline'}
              className={
                isOwner
                  ? 'flex-1 bg-primary hover:bg-primary-dark text-white'
                  : 'flex-1 border-primary text-primary hover:bg-primary hover:text-white'
              }
              onClick={() => onAction(group._id)}
            >
              {isOwner ? 'Kelola' : 'Bergabung'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;
