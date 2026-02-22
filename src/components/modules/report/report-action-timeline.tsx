"use client";

import { useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { trpc } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ReportActionType } from "@/entities/report-action";

const PAGE_SIZE = 15;

interface ReportActionTimelineProps {
    reportId: string;
}

function getInitials(name: string | null, email: string): string {
    if (name) {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }
    return email[0].toUpperCase();
}

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
}

function formatFullDate(date: Date): string {
    return date.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const ACTION_CONFIG: Record<
    ReportActionType,
    { icon: React.ReactNode; color: string; bgColor: string }
> = {
    REPORT_CREATED: {
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
            </svg>
        ),
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
    },
    REPORT_UPDATED: {
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
        ),
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    REPORT_DELETED: {
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
        ),
        color: "text-red-500",
        bgColor: "bg-red-500/10",
    },
    COMMENT_ADDED: {
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        color: "text-violet-500",
        bgColor: "bg-violet-500/10",
    },
    COMMENT_DELETED: {
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <line x1="9" y1="9" x2="15" y2="15" />
                <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
        ),
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
    },
    AI_INSIGHTS_GENERATED: {
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 0-4 4c0 2 1 3 2 4l-1 1h6l-1-1c1-1 2-2 2-4a4 4 0 0 0-4-4z" />
                <line x1="10" y1="14" x2="10" y2="17" />
                <line x1="14" y1="14" x2="14" y2="17" />
                <line x1="9" y1="19" x2="15" y2="19" />
                <line x1="10" y1="21" x2="14" y2="21" />
            </svg>
        ),
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
    },
    SEVERITY_CHANGED: {
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
        color: "text-red-400",
        bgColor: "bg-red-500/10",
    },
    PRIORITY_CHANGED: {
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
        ),
        color: "text-sky-500",
        bgColor: "bg-sky-500/10",
    },
    ANNOTATIONS_UPDATED: {
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
            </svg>
        ),
        color: "text-teal-500",
        bgColor: "bg-teal-500/10",
    },
    STATUS_CHANGED: {
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
    },
    ASSIGNED: {
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
        ),
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
    },
};

function TimelineSkeleton() {
    return (
        <div className="space-y-4 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                    <Skeleton className="size-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function TimelineEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
            <p className="text-sm">No activity recorded yet</p>
        </div>
    );
}

export function ReportActionTimeline({ reportId }: ReportActionTimelineProps) {
    const [page, setPage] = useState(1);
    const [filterType, setFilterType] = useState<ReportActionType | undefined>(undefined);

    const { data, isLoading, isError } = trpc.reportAction.list.useQuery(
        {
            reportId,
            page,
            limit: PAGE_SIZE,
            actionType: filterType,
        },
        {
            placeholderData: keepPreviousData,
        }
    );

    const filterOptions: { label: string; value: ReportActionType | undefined }[] = [
        { label: "All", value: undefined },
        { label: "Updates", value: "REPORT_UPDATED" },
        { label: "Comments", value: "COMMENT_ADDED" },
        { label: "AI Insights", value: "AI_INSIGHTS_GENERATED" },
        { label: "Severity", value: "SEVERITY_CHANGED" },
        { label: "Priority", value: "PRIORITY_CHANGED" },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Filter Bar */}
            <div className="flex items-center gap-1.5 px-5 py-3 border-b overflow-x-auto">
                {filterOptions.map((opt) => (
                    <button
                        key={opt.label}
                        onClick={() => {
                            setFilterType(opt.value);
                            setPage(1);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-full transition-colors whitespace-nowrap ${
                            filterType === opt.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Timeline Content */}
            {isLoading ? (
                <TimelineSkeleton />
            ) : isError ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <p className="text-sm">Failed to load action history</p>
                </div>
            ) : !data || data.actions.length === 0 ? (
                <TimelineEmptyState />
            ) : (
                <ScrollArea className="h-80">
                    <div className="px-5 py-4">
                        <div className="relative">
                            {/* Vertical timeline line */}
                            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

                            <div className="space-y-0">
                                {data.actions.map((action, index) => {
                                    const config = ACTION_CONFIG[action.actionType];
                                    const createdAt = new Date(action.createdAt);
                                    const isLast = index === data.actions.length - 1;

                                    return (
                                        <div
                                            key={action.id}
                                            className={`relative flex items-start gap-3 group ${isLast ? "" : "pb-5"}`}
                                        >
                                            {/* Timeline dot */}
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div
                                                            className={`relative z-10 flex size-[30px] shrink-0 items-center justify-center rounded-full border ${config.bgColor} ${config.color} transition-transform group-hover:scale-110`}
                                                        >
                                                            {config.icon}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right" className="text-xs">
                                                        {action.actionType.replace(/_/g, " ")}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm leading-snug text-foreground">
                                                            {action.description}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {action.user && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Avatar size="sm">
                                                                        <AvatarFallback className="text-[10px]">
                                                                            {getInitials(action.user.name, action.user.email)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                                                                        {action.user.name ?? action.user.email}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {!action.user && (
                                                                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                                                    System
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <time
                                                                    dateTime={createdAt.toISOString()}
                                                                    className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0 tabular-nums"
                                                                >
                                                                    {formatRelativeTime(createdAt)}
                                                                </time>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="left" className="text-xs">
                                                                {formatFullDate(createdAt)}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>

                                                {/* Metadata badges */}
                                                {action.metadata && typeof action.metadata === "object" && (
                                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                                        {Array.isArray((action.metadata as Record<string, unknown>).changedFields) &&
                                                            ((action.metadata as Record<string, unknown>).changedFields as string[]).map((field) => (
                                                                <Badge
                                                                    key={field}
                                                                    variant="outline"
                                                                    className="text-[10px] h-4 px-1.5 font-normal"
                                                                >
                                                                    {field}
                                                                </Badge>
                                                            ))}
                                                        {(action.metadata as Record<string, unknown>).oldValue !== undefined && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px] h-4 px-1.5 font-normal"
                                                            >
                                                                {String((action.metadata as Record<string, unknown>).oldValue ?? "none")}
                                                                {" → "}
                                                                {String((action.metadata as Record<string, unknown>).newValue ?? "none")}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Pagination */}
                    {data.totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/20">
                            <span className="text-xs text-muted-foreground">
                                Page {data.page} of {data.totalPages} ({data.total} events)
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs px-2"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs px-2"
                                    disabled={page >= data.totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </ScrollArea>
            )}
        </div>
    );
}
