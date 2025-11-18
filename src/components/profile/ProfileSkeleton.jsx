import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const ProfileSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <Card className="border-neutral-200">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            {/* Avatar skeleton */}
            <div className="h-20 w-20 bg-neutral-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-7 bg-neutral-200 rounded animate-pulse w-48" />
              <div className="h-5 bg-neutral-200 rounded animate-pulse w-64" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Info cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-neutral-200">
          <CardHeader>
            <div className="h-6 bg-neutral-200 rounded animate-pulse w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-24" />
                <div className="h-10 bg-neutral-200 rounded animate-pulse w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-neutral-200">
          <CardHeader>
            <div className="h-6 bg-neutral-200 rounded animate-pulse w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-24" />
                <div className="h-10 bg-neutral-200 rounded animate-pulse w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
