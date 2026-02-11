'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DashboardIcons as Icons } from '@/components/icons/dashboard-icons';
import type { ReportSummary } from '@/types/dashboard';

interface ReportCardProps {
    report: ReportSummary;
    index: number;
    deletingId: string | null;
    onDelete: (id: string) => void;
}

const MATCHED_FIELD_LABELS: Record<string, string> = {
    title: 'Title',
    description: 'Description',
    transcript: 'Transcript',
    reproSteps: 'Repro Steps',
    rootCause: 'Root Cause',
    logSummary: 'Log Summary',
    tags: 'Tags',
    suggestedFix: 'Suggested Fix',
};

function getSeverityClasses(severity: string): string {
    switch (severity) {
        case 'critical':
            return 'bg-red-500/15 text-red-600 border-red-500/20';
        case 'high':
            return 'bg-orange-500/15 text-orange-600 border-orange-500/20';
        case 'medium':
            return 'bg-amber-500/15 text-amber-600 border-amber-500/20';
        default:
            return 'bg-green-500/15 text-green-600 border-green-500/20';
    }
}

export function ReportCard({ report, index, deletingId, onDelete }: ReportCardProps) {
    const consoleLogs = (report.consoleLogs ?? []) as { type?: string }[];
    const networkLogs = (report.networkLogs ?? []) as { status?: number }[];
    const errorCount = consoleLogs.filter(l => l.type === 'error').length;
    const failCount = networkLogs.filter(l => (l.status ?? 0) >= 400).length;

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        const mediaUrl = report.type === 'SCREENSHOT' ? report.imageUrl : report.videoUrl;
        if (!mediaUrl) return;
        try {
            const res = await fetch(mediaUrl);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeName = (report.title || (report.type === 'SCREENSHOT' ? 'screenshot' : 'recording')).replace(/[^a-zA-Z0-9_\- ]/g, '');
            a.download = report.type === 'SCREENSHOT' ? `${safeName}.png` : `${safeName}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    return (
        <Card
            className="group py-0 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${Math.min(index * 60, 600)}ms`, animationFillMode: 'backwards' }}
        >
            {/* Thumbnail */}
            <Link href={`/report/${report.id}`} className="block relative">
                <div className="aspect-video bg-muted relative overflow-hidden">
                    {report.type === 'SCREENSHOT' && report.imageUrl ? (
                        <img
                            src={report.imageUrl}
                            alt={report.title || 'Screenshot'}
                            className="w-full h-full object-cover"
                        />
                    ) : report.videoUrl ? (
                        <video
                            src={report.videoUrl}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                            onLoadedData={(e) => {
                                (e.target as HTMLVideoElement).currentTime = 1;
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                            {Icons.inbox()}
                        </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <div className="size-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 border border-white/20">
                            {report.type === 'SCREENSHOT' ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="white" className="size-6 ml-0.5">
                                    <path d="M8 5.14v14l11-7-11-7z" />
                                </svg>
                            )}
                        </div>
                    </div>
                    {/* Type badge */}
                    {report.type === 'SCREENSHOT' && (
                        <div className="absolute top-2 left-2">
                            <Badge className="text-[10px] h-5 px-1.5 bg-black/50 text-white border-white/20 backdrop-blur-sm">
                                Screenshot
                            </Badge>
                        </div>
                    )}
                </div>
            </Link>

            {/* Card Content */}
            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <Link href={`/report/${report.id}`} className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                            {report.title || 'Untitled Bug Report'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono tabular-nums">
                            {new Date(report.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', hour12: true,
                            })}
                        </p>
                    </Link>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={handleDownload}
                                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all hover:bg-muted hover:text-foreground"
                                aria-label={`Download ${report.type === 'SCREENSHOT' ? 'screenshot' : 'video'}`}
                            >
                                {Icons.download()}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Download {report.type === 'SCREENSHOT' ? 'screenshot' : 'video'}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => onDelete(report.id)}
                                disabled={deletingId === report.id}
                                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                                aria-label="Delete report"
                            >
                                {deletingId === report.id ? (
                                    <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                ) : Icons.trash()}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Delete report</TooltipContent>
                    </Tooltip>
                </div>

                {report.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {report.description}
                    </p>
                )}

                {/* Severity / Priority / Tags */}
                {(report.severity || report.priority || (report.tags && report.tags.length > 0)) && (
                    <div className="flex items-center gap-1 flex-wrap">
                        {report.severity && (
                            <Badge className={`text-[10px] h-5 px-1.5 ${getSeverityClasses(report.severity)}`}>
                                {report.severity}
                            </Badge>
                        )}
                        {report.priority && (
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono">
                                {report.priority.toUpperCase()}
                            </Badge>
                        )}
                        {report.tags?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] h-5 px-1.5">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Matched fields indicator (search mode) */}
                {report.matchedFields && report.matchedFields.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-primary">
                        {Icons.sparkles()}
                        <span>Found in: {report.matchedFields.map(f => MATCHED_FIELD_LABELS[f] || f).join(', ')}</span>
                    </div>
                )}

                {/* Log badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 gap-1">
                        {Icons.console()}
                        {consoleLogs.length} logs
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 gap-1">
                        {Icons.network()}
                        {networkLogs.length} requests
                    </Badge>
                    {errorCount > 0 && (
                        <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                            {errorCount} errors
                        </Badge>
                    )}
                    {failCount > 0 && (
                        <Badge className="text-[10px] h-5 px-1.5 bg-amber-500/15 text-amber-600 border-amber-500/20">
                            {failCount} failed
                        </Badge>
                    )}
                </div>
            </div>
        </Card>
    );
}
