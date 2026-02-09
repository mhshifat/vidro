"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

/* ─── Types ────────────────────────────────────────────────────── */
interface ConsoleLogEntry {
    type: string;
    args: unknown[];
    timestamp: number;
}

interface NetworkLogEntry {
    type: string;
    method: string;
    url: string;
    status: number;
    timestamp: number;
}

interface RecordingPayload {
    videoUrl: string;
    consoleLogs: ConsoleLogEntry[];
    networkLogs: NetworkLogEntry[];
    timestamp: number;
}

/* ─── Helpers ──────────────────────────────────────────────────── */
function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}

function statusColor(status: number) {
    if (status >= 200 && status < 300) return "text-emerald-400";
    if (status >= 300 && status < 400) return "text-amber-400";
    return "text-red-400";
}

function consoleTypeColor(type: string) {
    switch (type) {
        case "error": return "text-red-400 bg-red-500/10";
        case "warn": return "text-amber-400 bg-amber-500/10";
        case "info": return "text-sky-400 bg-sky-500/10";
        default: return "text-emerald-400 bg-emerald-500/10";
    }
}

function consoleTypeIcon(type: string) {
    switch (type) {
        case "error": return "✕";
        case "warn": return "▲";
        case "info": return "ℹ";
        default: return "›";
    }
}

/* ─── Loading State ────────────────────────────────────────────── */
function LoadingScreen() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
                {/* Pulse ring */}
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <div className="relative size-16 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                        <svg className="size-7 text-primary-foreground animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
                        </svg>
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-lg font-bold tracking-tight">Receiving Recording</h2>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Waiting for data from the Jam Clone extension&hellip;
                    </p>
                </div>
                {/* Skeleton bento hint */}
                <div className="grid grid-cols-3 gap-2 w-64 mt-4 opacity-30">
                    <div className="col-span-2 h-20 rounded-xl bg-muted animate-pulse" />
                    <div className="h-20 rounded-xl bg-muted animate-pulse delay-100" />
                    <div className="h-12 rounded-xl bg-muted animate-pulse delay-200" />
                    <div className="col-span-2 h-12 rounded-xl bg-muted animate-pulse delay-300" />
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ────────────────────────────────────────────────── */
export default function NewReportPage() {
    const [recording, setRecording] = useState<RecordingPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("Unlabeled Recording");
    const [description, setDescription] = useState("");
    const [activeLogTab, setActiveLogTab] = useState("console");
    const videoRef = useRef<HTMLVideoElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "TRANSFER_RECORDING") {
                setRecording(event.data.payload);
                setLoading(false);
            }
        };
        window.addEventListener("message", handleMessage);
        window.postMessage({ type: "REPORT_PAGE_READY" }, "*");
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    if (loading || !recording) return <LoadingScreen />;

    const consoleErrors = recording.consoleLogs?.filter((l) => l.type === "error").length ?? 0;
    const consoleWarnings = recording.consoleLogs?.filter((l) => l.type === "warn").length ?? 0;
    const failedRequests = recording.networkLogs?.filter((l) => l.status >= 400).length ?? 0;

    return (
        <TooltipProvider delayDuration={200}>
            <div className="min-h-screen bg-background">
                {/* ── Sticky Header ──────────────────────────────── */}
                <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg supports-backdrop-filter:bg-background/60">
                    <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-8">
                        <div className="flex items-center gap-3 min-w-0">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href="/dashboard"
                                        className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                    >
                                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>Back to Dashboard</TooltipContent>
                            </Tooltip>

                            <Separator orientation="vertical" className="h-6" />

                            <div className="min-w-0 flex-1">
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-auto border-none bg-transparent p-0 text-lg font-bold shadow-none focus-visible:ring-0 truncate"
                                    placeholder="Give this report a name…"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/dashboard')}
                                className="text-muted-foreground"
                            >
                                Discard
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => alert('Saving coming soon!')}
                                className="shadow-md shadow-primary/20 transition-shadow hover:shadow-lg hover:shadow-primary/30"
                            >
                                <svg className="size-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z" />
                                </svg>
                                Save &amp; Share
                            </Button>
                        </div>
                    </div>
                </header>

                {/* ── Bento Grid ─────────────────────────────────── */}
                <main className="mx-auto max-w-screen-2xl p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid auto-rows-min gap-4 lg:grid-cols-12 lg:gap-6">
                        
                        {/* ── Video Player (spans 8 cols) ────────── */}
                        <Card className="lg:col-span-8 overflow-hidden py-0 group">
                            <div className="relative aspect-video bg-black rounded-t-xl overflow-hidden">
                                <video
                                    ref={videoRef}
                                    controls
                                    src={recording.videoUrl}
                                    className="size-full object-contain transition-transform duration-300"
                                />
                                {/* Gradient overlay on top for polish */}
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-black/30 to-transparent" />
                            </div>
                        </Card>

                        {/* ── Stats Column (spans 4 cols) ────────── */}
                        <div className="lg:col-span-4 grid auto-rows-min gap-4 lg:gap-6">
                            {/* Stat Cards Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard
                                    label="Console"
                                    value={recording.consoleLogs?.length ?? 0}
                                    suffix="events"
                                    icon={
                                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                                        </svg>
                                    }
                                    detail={
                                        <div className="flex gap-1.5 mt-1">
                                            {consoleErrors > 0 && (
                                                <Badge variant="destructive" className="text-[10px] h-5 px-1.5">{consoleErrors} err</Badge>
                                            )}
                                            {consoleWarnings > 0 && (
                                                <Badge className="text-[10px] h-5 px-1.5 bg-amber-500/15 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">{consoleWarnings} warn</Badge>
                                            )}
                                            {consoleErrors === 0 && consoleWarnings === 0 && (
                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Clean</Badge>
                                            )}
                                        </div>
                                    }
                                />
                                <StatCard
                                    label="Network"
                                    value={recording.networkLogs?.length ?? 0}
                                    suffix="requests"
                                    icon={
                                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    }
                                    detail={
                                        <div className="flex gap-1.5 mt-1">
                                            {failedRequests > 0 ? (
                                                <Badge variant="destructive" className="text-[10px] h-5 px-1.5">{failedRequests} failed</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">All OK</Badge>
                                            )}
                                        </div>
                                    }
                                />
                            </div>

                            {/* Timestamp Card */}
                            <Card className="py-4">
                                <CardContent className="flex items-center gap-3 py-0">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                        <svg className="size-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground font-medium">Recorded at</p>
                                        <p className="text-sm font-bold tabular-nums tracking-tight truncate">
                                            {new Date(recording.timestamp).toLocaleString("en-US", {
                                                month: "short", day: "numeric", year: "numeric",
                                                hour: "2-digit", minute: "2-digit", hour12: true,
                                            })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Description */}
                            <Card className="py-0 overflow-hidden">
                                <CardHeader className="pb-0 pt-5">
                                    <CardTitle className="text-sm">Description</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-3 pb-5">
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe the bug — what you expected vs. what happened…"
                                        className="min-h-25 resize-none border-none bg-muted/50 shadow-none focus-visible:ring-0 text-sm"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* ── Logs Panel (full width) ────────────── */}
                        <Card className="lg:col-span-12 py-0 overflow-hidden">
                            <Tabs value={activeLogTab} onValueChange={setActiveLogTab} className="h-full">
                                <div className="flex items-center justify-between border-b px-6 py-3 bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-sm font-bold tracking-tight">Captured Data</h3>
                                        <Separator orientation="vertical" className="h-4" />
                                        <TabsList variant="line" className="h-8">
                                            <TabsTrigger value="console" className="text-xs gap-1.5 px-3">
                                                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                                                </svg>
                                                Console
                                                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">{recording.consoleLogs?.length ?? 0}</Badge>
                                            </TabsTrigger>
                                            <TabsTrigger value="network" className="text-xs gap-1.5 px-3">
                                                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Network
                                                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">{recording.networkLogs?.length ?? 0}</Badge>
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>
                                </div>

                                {/* Console Tab */}
                                <TabsContent value="console" className="m-0">
                                    <ScrollArea className="h-90">
                                        <div className="divide-y divide-border/50">
                                            {recording.consoleLogs?.length === 0 && (
                                                <EmptyState message="No console events captured" />
                                            )}
                                            {recording.consoleLogs?.map((log, i) => (
                                                <div
                                                    key={i}
                                                    className="group flex items-start gap-3 px-6 py-2.5 text-xs font-mono transition-colors hover:bg-muted/40 animate-in fade-in slide-in-from-left-1 duration-200"
                                                    style={{ animationDelay: `${Math.min(i * 20, 400)}ms` }}
                                                >
                                                    <span className="text-[10px] text-muted-foreground tabular-nums pt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {formatTime(log.timestamp)}
                                                    </span>
                                                    <span className={`inline-flex items-center justify-center size-5 rounded text-[10px] font-bold shrink-0 ${consoleTypeColor(log.type)}`}>
                                                        {consoleTypeIcon(log.type)}
                                                    </span>
                                                    <span className="text-foreground/80 break-all leading-relaxed">
                                                        {log.args?.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ")}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                {/* Network Tab */}
                                <TabsContent value="network" className="m-0">
                                    <ScrollArea className="h-90">
                                        {/* Table Header */}
                                        <div className="sticky top-0 z-10 grid grid-cols-[80px_60px_1fr] gap-4 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/60 border-b backdrop-blur-sm">
                                            <span>Status</span>
                                            <span>Method</span>
                                            <span>URL</span>
                                        </div>
                                        <div className="divide-y divide-border/50">
                                            {recording.networkLogs?.length === 0 && (
                                                <EmptyState message="No network requests captured" />
                                            )}
                                            {recording.networkLogs?.map((req, i) => (
                                                <div
                                                    key={i}
                                                    className="group grid grid-cols-[80px_60px_1fr] gap-4 px-6 py-2.5 text-xs font-mono transition-colors hover:bg-muted/40 animate-in fade-in slide-in-from-left-1 duration-200"
                                                    style={{ animationDelay: `${Math.min(i * 15, 300)}ms` }}
                                                >
                                                    <span className={`font-bold tabular-nums ${statusColor(req.status)}`}>
                                                        {req.status}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 text-[10px] font-bold justify-center"
                                                    >
                                                        {req.method}
                                                    </Badge>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="text-foreground/70 truncate cursor-default">
                                                                {req.url}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="max-w-md break-all text-xs font-mono">
                                                            {req.url}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            </Tabs>
                        </Card>
                    </div>
                </main>
            </div>
        </TooltipProvider>
    );
}

/* ─── Sub-components ───────────────────────────────────────────── */
function StatCard({
    label,
    value,
    suffix,
    icon,
    detail,
}: {
    label: string;
    value: number;
    suffix: string;
    icon: React.ReactNode;
    detail: React.ReactNode;
}) {
    return (
        <Card className="py-4 group transition-shadow hover:shadow-md">
            <CardContent className="py-0 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                    <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        {icon}
                    </div>
                </div>
                <div>
                    <span className="text-2xl font-black tracking-tighter tabular-nums">{value}</span>
                    <span className="ml-1 text-xs text-muted-foreground">{suffix}</span>
                </div>
                {detail}
            </CardContent>
        </Card>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <svg className="size-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4" />
            </svg>
            <p className="text-sm">{message}</p>
        </div>
    );
}
