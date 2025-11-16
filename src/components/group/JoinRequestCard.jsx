import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

/**
 * JoinRequestCard - Component untuk display join request
 */
export const JoinRequestCard = ({
  request,
  onAccept = () => {},
  onReject = () => {},
  isLoading = false,
}) => {
  if (!request) return null;

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="flex items-center justify-between gap-4 py-4">
        {/* Requester Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold">{request.requester?.name}</div>
          <div className="text-sm text-muted-foreground">
            {request.requester?.email}
          </div>
          {request.requester?.nim && (
            <div className="text-xs text-muted-foreground">
              NIM: {request.requester?.nim}
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            {new Date(request.createdAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Status Badge */}
        <Badge variant="outline" className="shrink-0">
          Menunggu
        </Badge>

        {/* Action Buttons */}
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReject(request._id)}
            disabled={isLoading}
            className="text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => onAccept(request._id)}
            disabled={isLoading}
          >
            <Check className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JoinRequestCard;
