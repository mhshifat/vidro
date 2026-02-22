"use client";

import React from 'react';
import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { ReportIcons } from "@/components/icons/report-icons";
import {
    VideoPlayer,
    ReportLoadingScreen,
    StatCard,
    RecordingSelector,
    LogsPanel,
} from "@/components/modules/report";
import type { RecordingPayload, ScreenshotPayload } from "@/types/report";

/* ─── SVG Icons ────────────────────────────────────────────────── */
const Icons = ReportIcons;

/* ──────────────────────────────────────────────────────────────── */
/*  Main Page                                                      */
/* ──────────────────────────────────────────────────────────────── */
export default function NewReportPage() {
    return (
        <Suspense fallback={<ReportLoadingScreen />}>
            <NewReportPageInner />
        </Suspense>
    );
}

const reportSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

function NewReportPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isScreenshot = searchParams.get('type') === 'screenshot';

    // Persist helpers (defined before state so we can use for initialization)
    const saveToLocal = useCallback((list: RecordingPayload[]) => {
        try {
            localStorage.setItem('vidro_recordings', JSON.stringify(list));
        } catch { /* quota exceeded — ignore */ }
    }, []);

    const loadFromLocal = useCallback((): RecordingPayload[] => {
        try {
            const raw = localStorage.getItem('vidro_recordings');
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    }, []);

    // Screenshot persist helpers
    const saveScreenshotToLocal = useCallback((data: ScreenshotPayload | null) => {
        try {
            if (data) {
                localStorage.setItem('vidro_screenshot', JSON.stringify(data));
            } else {
                localStorage.removeItem('vidro_screenshot');
            }
        } catch { /* quota exceeded — ignore */ }
    }, []);

    const loadScreenshotFromLocal = useCallback((): ScreenshotPayload | null => {
        try {
            const raw = localStorage.getItem('vidro_screenshot');
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }, []);

    // Initialize from localStorage (survives refresh)
    const [persisted] = useState(() => loadFromLocal());
    const [persistedScreenshot] = useState(() => isScreenshot ? loadScreenshotFromLocal() : null);
    const [recordings, setRecordings] = useState<RecordingPayload[]>(persisted);
    const [recording, setRecording] = useState<RecordingPayload | null>(persisted[0] ?? null);
    const hasPersistedData = persisted.length > 0 || persistedScreenshot !== null;
    const [loading, setLoading] = useState(!hasPersistedData);
    const [screenshotData, setScreenshotData] = useState<ScreenshotPayload | null>(persistedScreenshot);
    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            title: persistedScreenshot ? (persistedScreenshot.title || "Unlabeled Screenshot")
                : isScreenshot ? "Unlabeled Screenshot"
                : "Unlabeled Recording",
            description: "",
        },
    });
    const [activeLogTab, setActiveLogTab] = useState("console");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [copiedImage, setCopiedImage] = useState(false);
    const retryTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Prevent accidental navigation while uploading
    useEffect(() => {
        if (!saving) return;
        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [saving]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // New single recording from extension
            if (event.data?.type === "TRANSFER_RECORDING") {
                const incoming = event.data.payload as RecordingPayload;
                if (!incoming.id) incoming.id = `rec_${Date.now()}`;
                setRecordings(prev => {
                    const exists = prev.some(r => r.id === incoming.id || r.timestamp === incoming.timestamp);
                    const updated = exists ? prev : [incoming, ...prev];
                    saveToLocal(updated);
                    return updated;
                });
                setRecording(incoming);
                setScreenshotData(null);
                saveScreenshotToLocal(null);
                setLoading(false);
            }

            // Screenshot from extension
            if (event.data?.type === "TRANSFER_SCREENSHOT") {
                const incoming = event.data.payload as ScreenshotPayload;
                setScreenshotData(incoming);
                saveScreenshotToLocal(incoming);
                form.setValue("title", incoming.title || "Unlabeled Screenshot");
                setLoading(false);
            }

            // Full list of recordings from extension (on refresh when lastRecording is gone)
            if (event.data?.type === "TRANSFER_RECORDINGS_LIST") {
                const list = (event.data.payload as RecordingPayload[]) || [];
                if (list.length > 0) {
                    setRecordings(list);
                    saveToLocal(list);
                    // Only set active recording if we don't have one
                    setRecording(prev => prev || list[0]);
                    setLoading(false);
                }
            }

            // Annotated image returned from extension's annotation editor
            if (event.data?.type === "SCREENSHOT_ANNOTATED_RESULT" && event.data?.imageUrl) {
                setScreenshotData(prev => prev ? { ...prev, imageUrl: event.data.imageUrl } : prev);
            }
        };

        window.addEventListener("message", handleMessage);

        let dataReceived = false;
        const markReceived = (event: MessageEvent) => {
            if (
                event.data?.type === "TRANSFER_RECORDING" ||
                event.data?.type === "TRANSFER_SCREENSHOT" ||
                event.data?.type === "TRANSFER_RECORDINGS_LIST"
            ) {
                dataReceived = true;
            }
        };
        window.addEventListener("message", markReceived);

        // Retry REPORT_PAGE_READY until the content script responds.
        // The content script may not have its listener registered yet
        // when the page first mounts (race condition on Mac Chrome).
        let retryCount = 0;
        const maxRetries = 10;
        const sendReady = () => {
            if (dataReceived || retryCount >= maxRetries) return;
            window.postMessage({ type: "REPORT_PAGE_READY", pageType: isScreenshot ? "screenshot" : "recording" }, "*");
            retryCount++;
            retryTimerRef.current = setTimeout(sendReady, 300);
        };
        sendReady();

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 4000);

        return () => {
            window.removeEventListener("message", handleMessage);
            window.removeEventListener("message", markReceived);
            clearTimeout(timeout);
            clearTimeout(retryTimerRef.current);
        };
    }, [loadFromLocal, saveToLocal, isScreenshot]);

    const handleSelectRecording = (rec: RecordingPayload) => {
        setRecording(rec);
        form.setValue("title", "Unlabeled Recording");
        form.setValue("description", "");
    };

    const handleDiscardRecording = (id: string) => {
        // Notify extension to remove from storage
        window.postMessage({ type: "DISCARD_RECORDING", id }, "*");

        const updated = recordings.filter(r => r.id !== id);
        setRecordings(updated);
        saveToLocal(updated);

        if (recording?.id === id) {
            if (updated.length > 0) {
                setRecording(updated[0]);
            } else {
                setRecording(null);
                localStorage.removeItem('vidro_recordings');
            }
        }
    };

    const handleSaveReport = async (values: ReportFormValues) => {
        const source = screenshotData || recording;
        if (!source || saving) return;
        setSaving(true);
        setSaveError(null);

        try {
            // 1. Convert data URL to a File blob
            const isImage = !!screenshotData;
            const dataUrl = isImage ? screenshotData!.imageUrl : (recording as RecordingPayload).videoUrl;
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = isImage
                ? new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' })
                : new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });

            // 2. Upload file to server
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) {
                const uploadErr = await uploadRes.json().catch(() => ({}));
                const detail = uploadErr.detail || uploadErr.error || 'Upload failed';
                switch (uploadRes.status) {
                    case 401:
                        setSaveError('You are not logged in. Please log in and try again.');
                        setSaving(false);
                        return;
                    case 413:
                        setSaveError(`File too large. ${detail}`);
                        setSaving(false);
                        return;
                    case 429:
                        setSaveError(detail);
                        setSaving(false);
                        return;
                    default:
                        setSaveError(detail);
                        setSaving(false);
                        return;
                }
            }

            const { url: uploadedUrl, key: storageKey, fileSize } = await uploadRes.json();

            // 3. Run AI analysis for videos (non-blocking — falls back gracefully)
            let aiTitle = values.title;
            let aiDescription = values.description;
            let aiTranscript: string | undefined;

            if (!isImage) {
                try {
                    console.log('[Vidro] Starting AI analysis for video:', uploadedUrl);
                    const aiRes = await fetch('/api/ai/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ videoUrl: uploadedUrl, mimeType: 'video/webm' }),
                    });
                    if (aiRes.ok) {
                        const ai = await aiRes.json();
                        console.log('[Vidro] AI analysis result:', ai);
                        // Only use AI values if the user hasn't customized them
                        if (!values.title || values.title === 'Unlabeled Recording') aiTitle = ai.title;
                        if (!values.description) aiDescription = ai.description;
                        aiTranscript = ai.transcript;
                    } else {
                        const errBody = await aiRes.json().catch(() => ({}));
                        console.warn('[Vidro] AI analysis returned non-OK status:', aiRes.status, errBody);
                    }
                } catch (aiErr) {
                    console.warn('[Vidro] AI analysis failed, saving without AI content:', aiErr);
                }
            }

            // 4. Create the report
            const reportRes = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: aiTitle || (isImage ? 'Screenshot' : 'Untitled Bug Report'),
                    description: aiDescription,
                    type: isImage ? 'SCREENSHOT' : 'VIDEO',
                    ...(isImage ? { imageUrl: uploadedUrl } : { videoUrl: uploadedUrl }),
                    storageKey,
                    fileSize,
                    transcript: aiTranscript,
                    consoleLogs: source.consoleLogs,
                    networkLogs: source.networkLogs,
                }),
            });

            if (!reportRes.ok) {
                const reportErr = await reportRes.json().catch(() => ({}));
                setSaveError(reportErr.error || 'Failed to save report. Please try again.');
                setSaving(false);
                return;
            }
            const report = await reportRes.json();

            // 5. Clean up
            if (screenshotData) {
                setScreenshotData(null);
                saveScreenshotToLocal(null);
            } else {
                handleDiscardRecording(recording!.id);
            }

            // 6. Navigate to saved report
            router.push(`/report/${report.id}`);
        } catch (err) {
            console.error('Save failed:', err);
            setSaveError('An unexpected error occurred. Please check your connection and try again.');
            setSaving(false);
        }
    };

    if (loading && !recording && !screenshotData) return <ReportLoadingScreen />;

    // Determine the active source (screenshot or recording)
    const activeSource = screenshotData || recording;

    if (!activeSource) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
                    <span className="opacity-30">{Icons.inbox()}</span>
                    <div className="text-center space-y-2">
                        <h2 className="text-lg font-bold tracking-tight">{isScreenshot ? 'No Screenshot' : 'No Recordings'}</h2>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            {isScreenshot
                                ? 'Take a screenshot from the Vidro extension, then come back here.'
                                : 'Start a recording from the Vidro extension, then come back here.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const consoleErrors = activeSource.consoleLogs?.filter((l) => l.type === "error").length ?? 0;
    const consoleWarnings = activeSource.consoleLogs?.filter((l) => l.type === "warn").length ?? 0;
    const failedRequests = activeSource.networkLogs?.filter((l) => l.status >= 400).length ?? 0;

    return (
        <TooltipProvider delayDuration={200}>
            <div className="min-h-screen bg-background">
                {/* ── Sticky Header ──────────────────────────────── */}
                <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg supports-backdrop-filter:bg-background/60">
                    <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3 min-w-0">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href="/dashboard"
                                        className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                    >
                                        {Icons.chevronLeft()}
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>Back to Dashboard</TooltipContent>
                            </Tooltip>
                            <Separator orientation="vertical" className="h-5" />
                            {!isScreenshot && (
                                <div className="flex items-center gap-2 min-w-0">
                                    <Input
                                        {...form.register("title")}
                                        className="h-auto border-none bg-transparent p-0 text-base font-bold shadow-none focus-visible:ring-0 truncate"
                                        placeholder="Give this report a name…"
                                    />
                                    <Button
                                        size="sm"
                                        disabled={saving}
                                        className="shadow-md shadow-primary/20 transition-shadow hover:shadow-lg hover:shadow-primary/30"
                                        onClick={() => {
                                            form.handleSubmit(handleSaveReport)();
                                        }}
                                    >
                                        {saving ? (
                                            <>
                                                <svg className="size-4 mr-1 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Saving…
                                            </>
                                        ) : (
                                            <>
                                                {Icons.heart()}
                                                Save &amp; Share
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {screenshotData && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1.5"
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(screenshotData.imageUrl);
                                                    const blob = await res.blob();
                                                    await navigator.clipboard.write([
                                                        new ClipboardItem({ [blob.type]: blob })
                                                    ]);
                                                    setCopiedImage(true);
                                                    setTimeout(() => setCopiedImage(false), 2000);
                                                } catch (err) {
                                                    console.error('Copy failed:', err);
                                                }
                                            }}
                                        >
                                            {copiedImage ? Icons.check() : Icons.copy()}
                                            {copiedImage ? 'Copied!' : 'Copy'}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copy image to clipboard</TooltipContent>
                                </Tooltip>
                            )}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5"
                                        onClick={() => {
                                            const a = document.createElement('a');
                                            a.href = screenshotData ? screenshotData.imageUrl : recording!.videoUrl;
                                            a.download = screenshotData
                                                ? `${form.getValues("title").trim() || 'screenshot'}.png`
                                                : `${form.getValues("title").trim() || 'recording'}.webm`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                        }}
                                    >
                                        {Icons.download()}
                                        Download
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Download {screenshotData ? 'screenshot' : 'video'}</TooltipContent>
                            </Tooltip>
                            <Button variant="ghost" size="sm" onClick={() => {
                                if (screenshotData) {
                                    setScreenshotData(null);
                                    saveScreenshotToLocal(null);
                                } else {
                                    handleDiscardRecording(recording!.id);
                                }
                            }} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                Discard
                            </Button>
                        </div>
                    </div>
                </header>

                {/* ── Upload In-Progress Banner ────────────────── */}
                {saving && (
                    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 pt-3">
                        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                            <svg className="size-4 shrink-0 text-primary animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="flex-1 text-primary font-medium">Uploading your {screenshotData ? 'screenshot' : 'recording'} — please do not close or leave this page.</span>
                        </div>
                    </div>
                )}

                {/* ── Save Error Banner ─────────────────────────── */}
                {saveError && (
                    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 pt-3">
                        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5 shrink-0 text-destructive mt-0.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="flex-1 text-destructive">{saveError}</span>
                            <button onClick={() => setSaveError(null)} className="text-destructive/60 hover:text-destructive transition-colors">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Recording Selector (only when multiple videos) ─── */}
                {!screenshotData && recordings.length > 1 && (
                    <RecordingSelector
                        recordings={recordings}
                        activeId={recording!.id}
                        onSelect={handleSelectRecording}
                        onDiscard={handleDiscardRecording}
                    />
                )}

                {/* ── Content ─────────────────────────────────────── */}
                <main className="mx-auto max-w-screen-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* ── Full-width Media Preview ─────────────────── */}
                    <div className="w-full border-b">
                        {screenshotData ? (
                            <div className="w-full bg-black/5 dark:bg-white/5 flex flex-col items-center justify-center gap-3 p-4">
                                <img
                                    src={screenshotData.imageUrl}
                                    alt="Screenshot preview"
                                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => {
                                        window.postMessage({ type: "OPEN_ANNOTATION_EDITOR", imageUrl: screenshotData.imageUrl }, "*");
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                    Edit &amp; Annotate
                                </Button>
                            </div>
                        ) : (
                            <VideoPlayer src={recording!.videoUrl} />
                        )}
                    </div>

                    {/* ── Bento Grid below video ──────────────────── */}
                    <div className="grid auto-rows-min gap-4 p-4 sm:p-6 lg:grid-cols-12 lg:gap-6">

                        {/* ── Stats Row (3 cards across) ─────────── */}
                        <StatCard
                            className="lg:col-span-3"
                            label="Console Events"
                            value={activeSource.consoleLogs?.length ?? 0}
                            icon={Icons.console()}
                            detail={
                                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                    {consoleErrors > 0 && <Badge variant="destructive" className="text-[10px] h-5 px-1.5">{consoleErrors} errors</Badge>}
                                    {consoleWarnings > 0 && <Badge className="text-[10px] h-5 px-1.5 bg-amber-500/15 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">{consoleWarnings} warnings</Badge>}
                                    {consoleErrors === 0 && consoleWarnings === 0 && <Badge variant="secondary" className="text-[10px] h-5 px-1.5">All clean</Badge>}
                                </div>
                            }
                        />
                        <StatCard
                            className="lg:col-span-3"
                            label="Network Requests"
                            value={activeSource.networkLogs?.length ?? 0}
                            icon={Icons.network()}
                            detail={
                                <div className="flex gap-1.5 mt-1.5">
                                    {failedRequests > 0
                                        ? <Badge variant="destructive" className="text-[10px] h-5 px-1.5">{failedRequests} failed</Badge>
                                        : <Badge variant="secondary" className="text-[10px] h-5 px-1.5">All OK</Badge>
                                    }
                                </div>
                            }
                        />
                        <Card className="lg:col-span-3 py-4 group transition-shadow hover:shadow-md">
                            <CardContent className="flex items-center gap-3 py-0">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                    {Icons.clock()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{screenshotData ? 'Captured' : 'Recorded'}</p>
                                    <p className="text-sm font-bold tabular-nums tracking-tight truncate">
                                        {new Date(activeSource.timestamp).toLocaleString("en-US", {
                                            month: "short", day: "numeric",
                                            hour: "2-digit", minute: "2-digit", hour12: true,
                                        })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description card */}
                        <Card className="lg:col-span-3 py-0 overflow-hidden">
                            <CardHeader className="pb-0 pt-4">
                                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Description</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 pb-4">
                                <Textarea
                                    {...form.register("description")}
                                    placeholder="What happened?"
                                    className="min-h-16 resize-none border-none bg-muted/50 shadow-none focus-visible:ring-0 text-sm"
                                />
                            </CardContent>
                        </Card>

                        {/* ── Logs Panel (full width) ────────────── */}
                        <LogsPanel
                            consoleLogs={activeSource.consoleLogs ?? []}
                            networkLogs={activeSource.networkLogs ?? []}
                            activeTab={activeLogTab}
                            onTabChange={setActiveLogTab}
                        />
                    </div>
                </main>
            </div>

        </TooltipProvider>
    );
}
