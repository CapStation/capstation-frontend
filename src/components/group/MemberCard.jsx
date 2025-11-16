import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Trash2, UserX } from 'lucide-react';

/**
 * MemberCard - Component untuk display member dalam group
 */
export const MemberCard = ({
  member,
  isLeader = false,
  isCurrentUserLeader = false,
  onRemove = () => {},
  isLoading = false,
}) => {
  if (!member) return null;

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="flex items-center justify-between gap-4 py-4">
        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold flex items-center gap-2">
            <span className="truncate">{member.name}</span>
            {isLeader && <Crown className="w-4 h-4 text-primary shrink-0" />}
          </div>
          <div className="text-sm text-muted-foreground">
            {member.email}
          </div>
          {member.nim && (
            <div className="text-xs text-muted-foreground">
              NIM: {member.nim}
            </div>
          )}
        </div>

        {/* Member Role Badge */}
        {isLeader && (
          <Badge variant="default" className="shrink-0">
            Leader
          </Badge>
        )}

        {/* Remove Button - only for leader on non-leader members */}
        {isCurrentUserLeader && !isLeader && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(member._id)}
            disabled={isLoading}
            className="text-destructive hover:bg-destructive/10"
          >
            <UserX className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberCard;
