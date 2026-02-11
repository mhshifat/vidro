'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardIcons as Icons } from '@/components/icons/dashboard-icons';

interface DashboardStatsProps {
    totalReports: number;
    totalErrors: number;
    totalNetworkFails: number;
}

export function DashboardStats({ totalReports, totalErrors, totalNetworkFails }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="py-4 group transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 py-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        {Icons.video()}
                    </div>
                    <div>
                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Total Reports</p>
                        <p className="text-2xl font-black tracking-tighter tabular-nums">{totalReports}</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="py-4 group transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 py-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500 transition-colors group-hover:bg-red-500 group-hover:text-white">
                        {Icons.console()}
                    </div>
                    <div>
                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Console Errors</p>
                        <p className="text-2xl font-black tracking-tighter tabular-nums">{totalErrors}</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="py-4 group transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 py-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                        {Icons.network()}
                    </div>
                    <div>
                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Failed Requests</p>
                        <p className="text-2xl font-black tracking-tighter tabular-nums">{totalNetworkFails}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
