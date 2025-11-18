import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const ProjectCardSkeleton = () => {
  return (
    <Card className="border-2 border-neutral-200 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Title skeleton */}
            <div className="h-6 bg-neutral-200 rounded animate-pulse w-3/4" />
            {/* Description skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-5/6" />
            </div>
          </div>
          {/* Badge skeleton */}
          <div className="h-6 w-20 bg-neutral-200 rounded-full animate-pulse ml-4" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info grid skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-16 bg-neutral-200 rounded animate-pulse" />
            <div className="h-5 w-24 bg-neutral-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 bg-neutral-200 rounded animate-pulse" />
            <div className="h-5 w-20 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Tags skeleton */}
        <div className="flex gap-2 flex-wrap">
          <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
          <div className="h-6 w-20 bg-neutral-200 rounded animate-pulse" />
          <div className="h-6 w-24 bg-neutral-200 rounded animate-pulse" />
        </div>

        {/* Buttons skeleton */}
        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-10 bg-neutral-200 rounded-md animate-pulse" />
          <div className="flex-1 h-10 bg-neutral-200 rounded-md animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCardSkeleton;
