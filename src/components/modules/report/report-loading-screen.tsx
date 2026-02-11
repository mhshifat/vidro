'use client';

import { ReportIcons as Icons } from '@/components/icons/report-icons';

export function ReportLoadingScreen() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <div className="relative size-16 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                        <span className="text-primary-foreground animate-pulse">{Icons.camera()}</span>
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-lg font-bold tracking-tight">Receiving Recording</h2>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Waiting for data from the Vidro extension&hellip;
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-2 w-64 mt-4 opacity-30">
                    <div className="col-span-3 h-40 rounded-xl bg-muted animate-pulse" />
                    <div className="h-12 rounded-xl bg-muted animate-pulse delay-100" />
                    <div className="h-12 rounded-xl bg-muted animate-pulse delay-200" />
                    <div className="h-12 rounded-xl bg-muted animate-pulse delay-300" />
                </div>
            </div>
        </div>
    );
}
