'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportCardSkeletonProps {
    index?: number;
}

export function ReportCardSkeleton({ index = 0 }: ReportCardSkeletonProps) {
    return (
        <Card
            className="group py-0 overflow-hidden animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${Math.min(index * 60, 600)}ms`, animationFillMode: 'backwards' }}
        >
            {/* Thumbnail skeleton */}
            <div className="aspect-video bg-muted relative overflow-hidden">
                <Skeleton className="w-full h-full rounded-none" />
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Title and badge row */}
                <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>

                {/* Date */}
                <Skeleton className="h-4 w-32" />

                {/* Tags */}
                <div className="flex gap-1.5 flex-wrap">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-18 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>

            {/* Footer skeleton */}
            <div className="px-4 py-3 border-t border-border/50 bg-muted/30">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded" />
                </div>
            </div>
        </Card>
    );
}

export function ReportCardSkeletonGrid({ count = 6 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <ReportCardSkeleton key={i} index={i} />
            ))}
        </>
    );
}
