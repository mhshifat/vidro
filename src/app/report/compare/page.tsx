"use client";
import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CompareReport {
    id: string;
    title: string;
    videoUrl: string;
}

export default function ComparePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
            <ComparePageInner />
        </Suspense>
    );
}

function ComparePageInner() {
    const searchParams = useSearchParams();
    const reportIds = searchParams.get("ids")?.split(",") || [];

    const [reports, setReports] = useState<CompareReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [synced, setSynced] = useState(true);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    useEffect(() => {
        async function fetchReports() {
            try {
                const results = await Promise.all(
                    reportIds.map(async (id) => {
                        const res = await fetch(`/api/report?id=${id}`);
                        if (!res.ok) return null;
                        const data = await res.json();
                        return { id: data.id, title: data.title, videoUrl: data.videoUrl } as CompareReport;
                    })
                );
                setReports(results.filter((r): r is CompareReport => r !== null && !!r.videoUrl));
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        }
        if (reportIds.length > 0) fetchReports();
        else setLoading(false);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const togglePlay = useCallback(() => {
        const videos = videoRefs.current.filter(Boolean) as HTMLVideoElement[];
        if (playing) {
            videos.forEach(v => v.pause());
        } else {
            videos.forEach(v => v.play());
        }
        setPlaying(!playing);
    }, [playing]);

    const seekAll = useCallback((time: number) => {
        const videos = videoRefs.current.filter(Boolean) as HTMLVideoElement[];
        videos.forEach(v => { v.currentTime = time; });
        setCurrentTime(time);
    }, []);

    const handleTimeUpdate = useCallback((index: number) => {
        const video = videoRefs.current[index];
        if (!video) return;
        setCurrentTime(video.currentTime);

        if (synced) {
            // Sync other videos to this one
            videoRefs.current.forEach((v, i) => {
                if (i !== index && v && Math.abs(v.currentTime - video.currentTime) > 0.3) {
                    v.currentTime = video.currentTime;
                }
            });
        }
    }, [synced]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (reports.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-muted-foreground">
                <p>Need at least 2 video reports to compare.</p>
                <p className="text-sm">Usage: /report/compare?ids=reportId1,reportId2</p>
                <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
                <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="text-lg font-semibold">Side-by-Side Replay</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSynced(!synced)}
                            className={synced ? "bg-primary/10 text-primary border-primary/30" : ""}
                        >
                            {synced ? "🔗 Synced" : "🔓 Independent"}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-screen-2xl p-4">
                {/* Videos grid */}
                <div className={`grid gap-4 ${reports.length === 2 ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
                    {reports.map((report, i) => (
                        <div key={report.id} className="rounded-xl border overflow-hidden bg-black">
                            <div className="p-2 bg-muted/50 border-b">
                                <Link href={`/report/${report.id}`} className="text-sm font-medium hover:underline truncate block">
                                    {report.title || "Untitled"}
                                </Link>
                            </div>
                            <video
                                ref={el => { videoRefs.current[i] = el; }}
                                src={report.videoUrl}
                                className="w-full aspect-video object-contain bg-black"
                                onTimeUpdate={() => handleTimeUpdate(i)}
                                onPlay={() => setPlaying(true)}
                                onPause={() => setPlaying(false)}
                                playsInline
                                crossOrigin="anonymous"
                            />
                        </div>
                    ))}
                </div>

                {/* Shared controls */}
                <div className="mt-4 p-4 border rounded-xl bg-muted/30 flex items-center gap-4">
                    <Button onClick={togglePlay} size="sm" variant="outline">
                        {playing ? (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </Button>
                    <span className="text-sm font-mono tabular-nums text-muted-foreground">
                        {formatTime(currentTime)}
                    </span>
                    <input
                        type="range"
                        min={0}
                        max={Math.max(...videoRefs.current.filter(Boolean).map(v => v!.duration || 0), 1)}
                        step={0.1}
                        value={currentTime}
                        onChange={e => seekAll(parseFloat(e.target.value))}
                        className="flex-1 h-2 accent-primary"
                    />
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => seekAll(0)}
                        className="text-xs"
                    >
                        Reset
                    </Button>
                </div>
            </main>
        </div>
    );
}
