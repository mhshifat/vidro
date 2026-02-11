'use client';

import { ReportIcons as Icons } from '@/components/icons/report-icons';

interface ReportEmptyStateProps {
    message: string;
}

export function ReportEmptyState({ message }: ReportEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <span className="opacity-30">{Icons.inbox()}</span>
            <p className="text-sm">{message}</p>
        </div>
    );
}
