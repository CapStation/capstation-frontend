import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const GroupCardSkeleton = () => {
  return (
    <Card className="h-full border-2 border-neutral-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Avatar Skeleton */}
            <div className="h-10 w-10 bg-neutral-200 rounded-full animate-pulse" />
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title Skeleton */}
              <div className="h-5 bg-neutral-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
          {/* Badge Skeleton */}
          <div className="h-6 w-16 bg-neutral-200 rounded-full animate-pulse" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description Skeleton */}
        <div className="h-10 flex items-start space-y-2">
          <div className="w-full space-y-2">
            <div className="h-4 bg-neutral-200 rounded animate-pulse w-full" />
            <div className="h-4 bg-neutral-200 rounded animate-pulse w-4/5" />
          </div>
        </div>

        {/* Members Info Skeleton */}
        <div className="flex items-center justify-between py-2 px-2 bg-neutral-50 rounded-lg">
          <div className="space-y-2">
            <div className="h-3 w-16 bg-neutral-200 rounded animate-pulse" />
            <div className="h-6 w-12 bg-neutral-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2 items-end flex flex-col">
            <div className="h-3 w-16 bg-neutral-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Members Avatar Skeleton */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="h-8 w-8 bg-neutral-200 rounded-full animate-pulse border-2 border-white" />
            <div className="h-8 w-8 bg-neutral-200 rounded-full animate-pulse border-2 border-white" />
            <div className="h-8 w-8 bg-neutral-200 rounded-full animate-pulse border-2 border-white" />
          </div>
        </div>

        {/* Actions Skeleton */}
        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-9 bg-neutral-200 rounded-md animate-pulse" />
          <div className="flex-1 h-9 bg-neutral-200 rounded-md animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCardSkeleton;
