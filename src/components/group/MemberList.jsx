'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trash2, Shield } from 'lucide-react';

const MemberList = ({ members = [], owner, isOwner = false, onRemoveMember = null }) => {
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'US';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'dosen':
        return 'bg-blue-100 text-blue-800';
      case 'mahasiswa':
        return 'bg-primary text-white';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'dosen':
        return 'Dosen';
      case 'mahasiswa':
        return 'Mahasiswa';
      default:
        return role;
    }
  };

  return (
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-neutral-900">Anggota Grup</CardTitle>
            <CardDescription className="text-neutral-600">
              {members.length} anggota terdaftar
            </CardDescription>
          </div>
          <Badge className="bg-accent text-neutral-900 text-sm">
            {members.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-600">Belum ada anggota dalam grup</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 bg-secondary text-neutral-900 shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-secondary">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-neutral-900 truncate">
                        {member.name}
                      </p>
                      {owner && member._id === owner._id && (
                        <Badge className="bg-primary text-white text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Owner
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 truncate">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Badge className={`${getRoleColor(member.role)} text-xs whitespace-nowrap`}>
                    {getRoleLabel(member.role)}
                  </Badge>

                  {isOwner && owner && member._id !== owner._id && onRemoveMember && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onRemoveMember(member._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberList;
