import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Eye, LogOut, Settings } from 'lucide-react';

/**
 * GroupCard - Reusable component untuk display group dalam list
 * Menampilkan info singkat group dengan action buttons
 */
export const GroupCard = ({
  group,
  isLeader = false,
  onViewDetails = () => {},
  onLeaveGroup = () => {},
  onSettings = () => {},
  isLoading = false,
}) => {
  if (!group) return null;

  const memberCount = group.members?.length || 0;
  const maxMembers = group.maxMembers || 4;
  const isFull = memberCount >= maxMembers;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2">{group.name}</CardTitle>
            <CardDescription className="mt-2 line-clamp-2">
              {group.capstone?.title || 'Capstone'}
            </CardDescription>
          </div>
          <Badge variant={group.visibility === 'public' ? 'default' : 'secondary'} className="shrink-0">
            {group.visibility === 'public' ? 'Publik' : 'Privat'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between gap-4">
        {/* Group Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <div className="text-sm">
              <div className="font-semibold">{memberCount}/{maxMembers}</div>
              <div className="text-xs text-muted-foreground">Anggota</div>
            </div>
          </div>
          
          {group.leader && (
            <div className="text-sm">
              <div className="font-semibold truncate">{group.leader.name}</div>
              <div className="text-xs text-muted-foreground">Leader</div>
            </div>
          )}
        </div>

        {/* Status badges */}
        {isFull && (
          <Badge variant="outline" className="text-destructive border-destructive">
            Grup Penuh
          </Badge>
        )}

        {/* Description */}
        {group.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {group.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            disabled={isLoading}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Detail
          </Button>

          {isLeader && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettings}
              disabled={isLoading}
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onLeaveGroup}
            disabled={isLoading}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;
