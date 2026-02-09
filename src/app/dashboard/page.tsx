"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

/* ─── SVG Icons ────────────────────────────────────────────────── */
const Icons = {
    video: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    play: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-8">
            <path d="M8 5.14v14l11-7-11-7z" />
        </svg>
    ),
    console: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    network: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    trash: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
    inbox: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
    ),
    logout: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    bug: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0M3 12h3m12 0h3M12 3v3m0 12v3M5.636 5.636l2.121 2.121m8.486 8.486l2.121 2.121M5.636 18.364l2.121-2.121m8.486-8.486l2.121-2.121" />
        </svg>
    ),
};

/* ─── Types ────────────────────────────────────────────────────── */
interface ReportSummary {
    id: string;
    title: string | null;
    description: string | null;
    videoUrl: string;
    consoleLogs: unknown[] | null;
    networkLogs: unknown[] | null;
    createdAt: string;
}

/* ──────────────────────────────────────────────────────────────── */
/*  Dashboard Page                                                 */
/* ──────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
    const router = useRouter();
    const [reports, setReports] = useState<ReportSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchReports = useCallback(async () => {
        try {
            const res = await fetch("/api/reports");
            if (res.status === 401) {
                router.push("/login");
                return;
            }
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setReports(data);
        } catch (err) {
            console.error("Failed to fetch reports:", err);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            const res = await fetch(`/api/reports?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setReports(prev => prev.filter(r => r.id !== id));
            }
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            setDeletingId(null);
        }
    };

    const handleLogout = async () => {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/login");
    };

    const totalReports = reports.length;
    const totalErrors = reports.reduce((acc, r) => {
        const logs = r.consoleLogs as { type?: string }[] | null;
        return acc + (logs?.filter(l => l.type === "error").length ?? 0);
    }, 0);
    const totalNetworkFails = reports.reduce((acc, r) => {
        const logs = r.networkLogs as { status?: number }[] | null;
        return acc + (logs?.filter(l => (l.status ?? 0) >= 400).length ?? 0);
    }, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        <div className="relative size-16 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                            <span className="text-primary-foreground animate-pulse">{Icons.bug}</span>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Loading your reports&hellip;</p>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={200}>
            <div className="min-h-screen bg-background">
                {/* ── Header ─────────────────────────────────────── */}
                <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg supports-backdrop-filter:bg-background/60">
                    <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                {Icons.bug}
                            </div>
                            <h1 className="text-base font-bold tracking-tight">Jam Clone</h1>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground hover:text-foreground">
                            {Icons.logout}
                            Sign Out
                        </Button>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* ── Hero Section ────────────────────────────── */}
                    <div className="mb-8 space-y-2">
                        <h2 className="text-3xl font-black tracking-tight">Your Bug Reports</h2>
                        <p className="text-muted-foreground">
                            All your screen recordings and captured browser data in one place.
                        </p>
                    </div>

                    {/* ── Stats Overview ──────────────────────────── */}
                    {reports.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <Card className="py-4 group transition-shadow hover:shadow-md">
                                <CardContent className="flex items-center gap-3 py-0">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                        {Icons.video}
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
                                        {Icons.console}
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
                                        {Icons.network}
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Failed Requests</p>
                                        <p className="text-2xl font-black tracking-tighter tabular-nums">{totalNetworkFails}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* ── Reports Grid ────────────────────────────── */}
                    {reports.length === 0 ? (
                        <Card className="py-20">
                            <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
                                <span className="text-muted-foreground/30">{Icons.inbox}</span>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold tracking-tight">No reports yet</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        Use the Jam Clone browser extension to record your first bug report.
                                        It captures video, console logs, and network requests automatically.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {reports.map((report, index) => {
                                const consoleLogs = (report.consoleLogs ?? []) as { type?: string }[];
                                const networkLogs = (report.networkLogs ?? []) as { status?: number }[];
                                const errorCount = consoleLogs.filter(l => l.type === "error").length;
                                const failCount = networkLogs.filter(l => (l.status ?? 0) >= 400).length;

                                return (
                                    <Card
                                        key={report.id}
                                        className="group py-0 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2"
                                        style={{ animationDelay: `${Math.min(index * 60, 600)}ms`, animationFillMode: "backwards" }}
                                    >
                                        {/* Video Thumbnail */}
                                        <Link href={`/report/${report.id}`} className="block relative">
                                            <div className="aspect-video bg-muted relative overflow-hidden">
                                                <video
                                                    src={report.videoUrl}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    preload="metadata"
                                                    onLoadedData={(e) => {
                                                        // Seek to 1s for a better thumbnail
                                                        (e.target as HTMLVideoElement).currentTime = 1;
                                                    }}
                                                />
                                                {/* Hover overlay */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                                    <div className="size-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 border border-white/20">
                                                        <svg viewBox="0 0 24 24" fill="white" className="size-6 ml-0.5">
                                                            <path d="M8 5.14v14l11-7-11-7z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Card Content */}
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <Link href={`/report/${report.id}`} className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                                                        {report.title || "Untitled Bug Report"}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground mt-0.5 font-mono tabular-nums">
                                                        {new Date(report.createdAt).toLocaleDateString("en-US", {
                                                            month: "short", day: "numeric", year: "numeric",
                                                            hour: "2-digit", minute: "2-digit", hour12: true,
                                                        })}
                                                    </p>
                                                </Link>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            onClick={() => handleDelete(report.id)}
                                                            disabled={deletingId === report.id}
                                                            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                                                        >
                                                            {deletingId === report.id ? (
                                                                <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                </svg>
                                                            ) : Icons.trash}
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

                                            {/* Tags */}
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 gap-1">
                                                    {Icons.console}
                                                    {consoleLogs.length} logs
                                                </Badge>
                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 gap-1">
                                                    {Icons.network}
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
                            })}
                        </div>
                    )}
                </main>
            </div>
        </TooltipProvider>
    );
}
