'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { UsageInfo } from '@/types/dashboard';

interface DashboardUsageProps {
    usage: UsageInfo;
}

function getProgressBarColor(percentUsed: number): string {
    if (percentUsed > 90) return 'bg-red-500';
    if (percentUsed > 70) return 'bg-amber-500';
    return 'bg-primary';
}

export function DashboardUsage({ usage }: DashboardUsageProps) {
    return (
        <Card className="mb-8 py-5 transition-shadow hover:shadow-md">
            <CardContent className="py-0 space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Storage Usage</p>
                    <p className="text-xs tabular-nums text-muted-foreground">
                        {usage.storage.usedMB.toFixed(1)} / {usage.storage.limitMB.toFixed(0)} MB
                    </p>
                </div>
                <div
                    className="w-full h-2 rounded-full bg-muted overflow-hidden"
                    role="progressbar"
                    aria-valuenow={Math.round(usage.storage.percentUsed)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Storage usage"
                >
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(usage.storage.percentUsed)}`}
                        style={{ width: `${Math.min(100, usage.storage.percentUsed)}%` }}
                    />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
                    <div>
                        <span className="block text-[10px] uppercase tracking-wider font-medium mb-0.5">Reports</span>
                        <span className="tabular-nums text-foreground font-semibold">{usage.reports.used}</span> / {usage.reports.limit}
                    </div>
                    <div>
                        <span className="block text-[10px] uppercase tracking-wider font-medium mb-0.5">Max File</span>
                        {usage.perRecording.maxFileSizeMB} MB
                    </div>
                    <div>
                        <span className="block text-[10px] uppercase tracking-wider font-medium mb-0.5">Max Duration</span>
                        {usage.perRecording.maxDurationSeconds
                            ? `${Math.floor(usage.perRecording.maxDurationSeconds / 60)} min`
                            : 'Unlimited'}
                    </div>
                    <div>
                        <span className="block text-[10px] uppercase tracking-wider font-medium mb-0.5">Codec</span>
                        {usage.perRecording.codec}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
