import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReportCardSkeletonGrid } from "./report-card-skeleton";

/**
 * Full-page skeleton for dashboard loading state
 */
export function DashboardSkeleton() {
    return (
        <TooltipProvider delayDuration={200}>
            <div className="min-h-screen bg-background">
                {/* Header skeleton */}
                <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
                    <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <Skeleton className="size-8 rounded-lg" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                    </div>
                </header>

                <main className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
                    {/* Hero skeleton */}
                    <div className="mb-8 space-y-2">
                        <Skeleton className="h-9 w-64" />
                        <Skeleton className="h-5 w-96" />
                    </div>

                    {/* Stats skeleton */}
                    <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-20 rounded-lg" />
                        <Skeleton className="h-20 rounded-lg" />
                        <Skeleton className="h-20 rounded-lg" />
                    </div>

                    {/* Usage skeleton */}
                    <Skeleton className="h-16 rounded-lg" />

                    {/* Reports grid skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <ReportCardSkeletonGrid count={6} />
                    </div>
                </main>
            </div>
        </TooltipProvider>
    );
}
