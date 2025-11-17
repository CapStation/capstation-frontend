import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

/**
 * InvitationCard - Component untuk display pending invitation
 */
export const InvitationCard = ({
  invitation,
  onAccept = () => {},
  onReject = () => {},
  isLoading = false,
}) => {
  if (!invitation) return null;

  const status = {
    pending: 'Menunggu',
    accepted: 'Diterima',
    rejected: 'Ditolak',
  }[invitation.status] || 'Unknown';

  const statusVariant = {
    pending: 'default',
    accepted: 'success',
    rejected: 'destructive',
  }[invitation.status] || 'outline';

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="flex items-center justify-between gap-4 py-4">
        {/* Invitation Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold">{invitation.groupName}</div>
          <div className="text-sm text-muted-foreground">
            {invitation.invitedBy?.name || 'Unknown'} mengundang Anda
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {new Date(invitation.createdAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Status Badge */}
        <Badge variant={statusVariant} className="shrink-0">
          {status}
        </Badge>

        {/* Action Buttons - only for pending */}
        {invitation.status === 'pending' && (
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(invitation._id)}
              disabled={isLoading}
              className="text-destructive hover:bg-destructive/10"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => onAccept(invitation._id)}
              disabled={isLoading}
            >
              <Check className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvitationCard;