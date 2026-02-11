"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CommentsSection, type Comment, type CommentMarker, getCommentMarkers, fmtTimestamp as fmtCommentTs } from "@/components/shared/comments";
import { AIInsightsPanel, type AIInsightsData } from "@/components/shared/ai-insights";
import { VideoAnnotationOverlay, AnnotationToolbar, type VideoAnnotation } from "@/components/shared/video-annotations";

/* ─── SVG Icons ────────────────────────────────────────────────── */
const Icons = {
    play: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 ml-0.5">
            <path d="M8 5.14v14l11-7-11-7z" />
        </svg>
    ),
    pause: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
    ),
    volumeHigh: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
        </svg>
    ),
    volumeMuted: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
        </svg>
    ),
    maximize: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
        </svg>
    ),
    minimize: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
        </svg>
    ),
    pip: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 5a2 2 0 012-2h16a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
            <rect x="12" y="11" width="8" height="6" rx="1" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth={1.5} />
        </svg>
    ),
    skipBack: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
        </svg>
    ),
    skipForward: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
        </svg>
    ),
    chevronLeft: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
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
    clock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    link: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
    ),
    inbox: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
    ),
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    ),
    edit: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
    close: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    spinner: (
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    ),
    transcript: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    sparkles: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    ),
    download: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
    ),
    copy: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
    ),
};

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

interface VideoChapter {
    title: string;
    start: number;
    end: number;
}

interface Report {
    id: string;
    title: string | null;
    description: string | null;
    type: 'VIDEO' | 'SCREENSHOT';
    videoUrl: string | null;
    imageUrl: string | null;
    transcript: string | null;
    consoleLogs: ConsoleLogEntry[] | null;
    networkLogs: NetworkLogEntry[] | null;
    // AI Insights fields
    severity: string | null;
    priority: string | null;
    tags: string[] | null;
    reproSteps: string | null;
    rootCause: string | null;
    logSummary: string | null;
    stakeholderSummary: string | null;
    suggestedFix: string | null;
    // Round 2 AI features
    accessibilityAudit: string | null;
    performanceAnalysis: string | null;
    securityScan: string | null;
    testCases: string | null;
    sentiment: string | null;
    translations: Record<string, { title: string; description: string }> | null;
    highlightStart: number | null;
    highlightEnd: number | null;
    annotations: VideoAnnotation[] | null;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

/* ─── Helpers ──────────────────────────────────────────────────── */
function fmtTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function fmtTimestamp(ts: number) {
    return new Date(ts).toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    });
}

function statusColor(status: number) {
    if (status >= 200 && status < 300) return "text-emerald-400";
    if (status >= 300 && status < 400) return "text-amber-400";
    return "text-red-400";
}

function consoleTypeStyle(type: string) {
    switch (type) {
        case "error": return "text-red-400 bg-red-500/10";
        case "warn": return "text-amber-400 bg-amber-500/10";
        case "info": return "text-sky-400 bg-sky-500/10";
        default: return "text-emerald-400 bg-emerald-500/10";
    }
}

function consoleTypeIcon(type: string) {
    switch (type) {
        case "error": return "\u2715";
        case "warn": return "\u25B2";
        case "info": return "\u2139";
        default: return "\u203A";
    }
}

/* ──────────────────────────────────────────────────────────────── */
/*  Video Player                                                   */
/* ──────────────────────────────────────────────────────────────── */
/** Marker for an annotation on the progress bar */
interface AnnotationProgressMarker {
    id: string;
    timestamp: number;
    type: string;
    color: string;
}

function VideoPlayer({
    src,
    commentMarkers = [],
    annotationMarkers = [],
    errorTimestamps = [],
    highlightRegion,
    chapters = [],
    onTimeUpdate: onTimeUpdateCb,
    onSeekTo,
    initialTime,
    onDurationReady,
}: {
    src: string;
    commentMarkers?: CommentMarker[];
    annotationMarkers?: AnnotationProgressMarker[];
    errorTimestamps?: number[];
    highlightRegion?: { start: number; end: number } | null;
    chapters?: VideoChapter[];
    onTimeUpdate?: (time: number) => void;
    onSeekTo?: React.MutableRefObject<((t: number) => void) | null>;
    initialTime?: number;
    onDurationReady?: (dur: number) => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [buffered, setBuffered] = useState(0);
    const [videoAspectRatio, setVideoAspectRatio] = useState(16 / 9);
    const [hoveredMarker, setHoveredMarker] = useState<CommentMarker | null>(null);
    const [hoveredAnnotationMarker, setHoveredAnnotationMarker] = useState<AnnotationProgressMarker | null>(null);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverX, setHoverX] = useState(0);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const thumbnailCanvasRef = useRef<HTMLCanvasElement>(null);
    const thumbnailVideoRef = useRef<HTMLVideoElement>(null);
    const initialSeeked = useRef(false);
    const wasSlowMo = useRef(false);

    // Expose seekTo to parent via ref
    useEffect(() => {
        if (onSeekTo) {
            onSeekTo.current = (t: number) => {
                const vid = videoRef.current;
                if (vid) {
                    vid.currentTime = t;
                    showControls();
                }
            };
        }
    });

    // Seek to initial time (from ?t= query param)
    useEffect(() => {
        if (initialTime != null && initialTime > 0 && ready && !initialSeeked.current) {
            const vid = videoRef.current;
            if (vid) {
                vid.currentTime = initialTime;
                initialSeeked.current = true;
            }
        }
    }, [initialTime, ready]);

    // Auto slow-mo in highlight region
    useEffect(() => {
        if (!highlightRegion || !ready) return;
        const vid = videoRef.current;
        if (!vid) return;
        const inRegion = currentTime >= highlightRegion.start && currentTime <= highlightRegion.end;
        if (inRegion && !wasSlowMo.current) {
            wasSlowMo.current = true;
            vid.playbackRate = 0.5;
            setSpeed(0.5);
        } else if (!inRegion && wasSlowMo.current) {
            wasSlowMo.current = false;
            vid.playbackRate = 1;
            setSpeed(1);
        }
    }, [currentTime, highlightRegion, ready]);

    // Generate thumbnail on hover using hidden video element
    useEffect(() => {
        if (hoverTime == null || !src) { setThumbnailUrl(null); return; }
        const thumbVid = thumbnailVideoRef.current;
        const canvas = thumbnailCanvasRef.current;
        if (!thumbVid || !canvas) return;
        thumbVid.currentTime = hoverTime;
        const handler = () => {
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            canvas.width = 160;
            canvas.height = 90;
            ctx.drawImage(thumbVid, 0, 0, 160, 90);
            setThumbnailUrl(canvas.toDataURL("image/jpeg", 0.6));
        };
        thumbVid.addEventListener("seeked", handler, { once: true });
        return () => thumbVid.removeEventListener("seeked", handler);
    }, [hoverTime, src]);

    const showControls = useCallback(() => {
        setControlsVisible(true);
        clearTimeout(hideTimerRef.current);
        if (playing) {
            hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
        }
    }, [playing]);

    const togglePlay = useCallback(() => {
        const vid = videoRef.current;
        if (!vid || !ready) return;
        if (playing) vid.pause(); else vid.play();
    }, [playing, ready]);

    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;
        if (document.fullscreenElement) await document.exitFullscreen();
        else await containerRef.current.requestFullscreen();
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const vid = videoRef.current;
            if (!vid) return;
            // Don't capture keys when user is typing in an input/textarea
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
            switch (e.key) {
                case " ": case "k": e.preventDefault(); togglePlay(); break;
                case "ArrowLeft": e.preventDefault(); vid.currentTime = Math.max(0, vid.currentTime - 5); break;
                case "ArrowRight": e.preventDefault(); { const maxT = isFinite(vid.duration) && vid.duration > 0 ? vid.duration : duration; vid.currentTime = Math.min(maxT, vid.currentTime + 5); } break;
                case "ArrowUp": e.preventDefault(); vid.volume = Math.min(1, vid.volume + 0.1); setVolume(vid.volume); break;
                case "ArrowDown": e.preventDefault(); vid.volume = Math.max(0, vid.volume - 0.1); setVolume(vid.volume); break;
                case "m": setMuted(m => !m); break;
                case "f": toggleFullscreen(); break;
            }
            showControls();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [togglePlay, toggleFullscreen, showControls]);

    const togglePip = async () => {
        const vid = videoRef.current;
        if (!vid) return;
        if (document.pictureInPictureElement) await document.exitPictureInPicture();
        else await vid.requestPictureInPicture();
    };

    const skip = (delta: number) => {
        const vid = videoRef.current;
        if (!vid) return;
        vid.currentTime = Math.max(0, Math.min(vid.duration, vid.currentTime + delta));
    };

    const cycleSpeed = () => {
        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
        setSpeed(next);
        if (videoRef.current) videoRef.current.playbackRate = next;
    };

    useEffect(() => { if (videoRef.current) videoRef.current.muted = muted; }, [muted]);
    useEffect(() => { if (videoRef.current) videoRef.current.volume = volume; }, [volume]);
    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    // Notify parent when duration is known
    const durationReportedRef = useRef(false);
    useEffect(() => {
        if (ready && duration > 0 && !durationReportedRef.current) {
            durationReportedRef.current = true;
            onDurationReady?.(duration);
        }
    }, [ready, duration, onDurationReady]);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className="group/player relative w-full bg-black overflow-hidden cursor-pointer select-none mx-auto"
            style={{
                aspectRatio: isFullscreen ? undefined : videoAspectRatio,
                height: isFullscreen ? "100vh" : undefined,
                maxHeight: isFullscreen ? undefined : "70vh",
            }}
            onMouseMove={showControls}
            onMouseLeave={() => playing && setControlsVisible(false)}
            onClick={(e) => {
                if ((e.target as HTMLElement).closest("[data-controls]")) return;
                togglePlay();
                showControls();
            }}
        >
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain bg-black"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={() => {
                    const vid = videoRef.current;
                    if (!vid) return;
                    setCurrentTime(vid.currentTime);
                    onTimeUpdateCb?.(vid.currentTime);
                    if (!isFinite(vid.duration) || vid.duration === 0) {
                        setDuration(prev => Math.max(prev, vid.currentTime));
                    }
                    if (vid.buffered.length > 0 && isFinite(vid.duration) && vid.duration > 0) {
                        setBuffered((vid.buffered.end(vid.buffered.length - 1) / vid.duration) * 100);
                    }
                }}
                onLoadedMetadata={() => {
                    const vid = videoRef.current;
                    if (vid?.videoWidth && vid.videoHeight) setVideoAspectRatio(vid.videoWidth / vid.videoHeight);
                    if (vid && isFinite(vid.duration) && vid.duration > 0) {
                        setDuration(vid.duration);
                        setReady(true);
                    } else if (vid) {
                        // WebM without duration metadata: seek to end to discover real duration
                        const onSeeked = () => {
                            vid.removeEventListener('seeked', onSeeked);
                            if (vid.currentTime > 0) {
                                setDuration(vid.currentTime);
                            }
                            vid.currentTime = 0;
                            const onSeekedBack = () => {
                                vid.removeEventListener('seeked', onSeekedBack);
                                setReady(true);
                            };
                            vid.addEventListener('seeked', onSeekedBack);
                        };
                        vid.addEventListener('seeked', onSeeked);
                        vid.currentTime = 1e10;
                    }
                }}
                onDurationChange={() => {
                    const vid = videoRef.current;
                    if (vid && isFinite(vid.duration) && vid.duration > 0) setDuration(vid.duration);
                }}
                onEnded={() => {
                    const vid = videoRef.current;
                    if (vid && vid.currentTime > 0) setDuration(prev => Math.max(prev, vid.currentTime));
                    setPlaying(false);
                    setControlsVisible(true);
                }}
                playsInline
            />

            {/* Big center play button */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${playing ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                {ready ? (
                    <div className="size-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl transition-transform duration-200 hover:scale-110 active:scale-95">
                        <svg viewBox="0 0 24 24" fill="black" className="size-8 ml-1"><path d="M8 5.14v14l11-7-11-7z" /></svg>
                    </div>
                ) : (
                    <div className="size-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                        <svg className="size-7 animate-spin text-white/70" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Controls overlay */}
            <div data-controls className={`absolute inset-x-0 bottom-0 transition-all duration-300 ${controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
                <div className="relative px-4 pb-3 pt-10 space-y-2">
                    {/* Progress bar */}
                    <div
                        className="group/progress relative h-1.5 hover:h-2.5 transition-all duration-200 cursor-pointer rounded-full bg-white/20"
                        onClick={(e) => {
                            e.stopPropagation();
                            const vid = videoRef.current;
                            if (!vid) return;
                            const seekDuration = isFinite(vid.duration) && vid.duration > 0 ? vid.duration : duration;
                            if (seekDuration <= 0) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            vid.currentTime = ((e.clientX - rect.left) / rect.width) * seekDuration;
                        }}
                        onMouseMove={(e) => {
                            e.stopPropagation();
                            if (duration <= 0) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                            setHoverTime(pct * duration);
                            setHoverX(e.clientX - rect.left);
                        }}
                        onMouseLeave={() => { setHoverTime(null); setThumbnailUrl(null); }}
                    >
                        {/* Error heatmap zones */}
                        {duration > 0 && errorTimestamps.map((ts, i) => {
                            const pct = (ts / duration) * 100;
                            if (pct < 0 || pct > 100) return null;
                            return (
                                <div key={`err-${i}`} className="absolute inset-y-0 opacity-40 rounded-full bg-red-500" style={{ left: `${Math.max(0, pct - 0.5)}%`, width: "1%" }} />
                            );
                        })}

                        {/* Highlight region (AI-detected bug moment) */}
                        {highlightRegion && duration > 0 && (
                            <div className="absolute inset-y-0 bg-amber-400/25 border-x border-amber-400/50 rounded-full" style={{
                                left: `${(highlightRegion.start / duration) * 100}%`,
                                width: `${((highlightRegion.end - highlightRegion.start) / duration) * 100}%`,
                            }} />
                        )}

                        {/* Chapter markers */}
                        {duration > 0 && chapters.map((ch, i) => {
                            const pct = (ch.start / duration) * 100;
                            if (pct <= 0 || pct >= 100) return null;
                            return (
                                <div key={`ch-${i}`} className="absolute top-0 bottom-0 w-0.5 bg-white/40" style={{ left: `${pct}%` }} />
                            );
                        })}
                        <div className="absolute inset-y-0 left-0 bg-white/20 rounded-full transition-[width] duration-300 overflow-hidden" style={{ width: `${buffered}%` }} />
                        <div className="absolute inset-y-0 left-0 bg-white rounded-full transition-[width] duration-100 overflow-hidden" style={{ width: `${progress}%` }} />
                        <div className="absolute top-1/2 -translate-y-1/2 size-3.5 rounded-full bg-white shadow-lg shadow-black/40 opacity-0 group-hover/progress:opacity-100 transition-opacity duration-200 -ml-1.5" style={{ left: `${progress}%` }} />

                        {/* Combined comment + annotation markers */}
                        {duration > 0 && (() => {
                            // Group markers by timestamp (within 0.3s tolerance)
                            const TOLERANCE = 0.3;
                            type Slot = { pct: number; ts: number; comments: CommentMarker[]; annotations: AnnotationProgressMarker[] };
                            const slots: Slot[] = [];

                            for (const cm of commentMarkers) {
                                const pct = (cm.timestamp / duration) * 100;
                                if (pct < 0 || pct > 100) continue;
                                const existing = slots.find(s => Math.abs(s.ts - cm.timestamp) < TOLERANCE);
                                if (existing) { existing.comments.push(cm); }
                                else { slots.push({ pct, ts: cm.timestamp, comments: [cm], annotations: [] }); }
                            }

                            for (const am of annotationMarkers) {
                                const pct = (am.timestamp / duration) * 100;
                                if (pct < 0 || pct > 100) continue;
                                const existing = slots.find(s => Math.abs(s.ts - am.timestamp) < TOLERANCE);
                                if (existing) { existing.annotations.push(am); }
                                else { slots.push({ pct, ts: am.timestamp, comments: [], annotations: [am] }); }
                            }

                            return slots.map((slot) => {
                                const hasComments = slot.comments.length > 0;
                                const hasAnnotations = slot.annotations.length > 0;
                                const hasBoth = hasComments && hasAnnotations;
                                const firstComment = slot.comments[0];
                                const firstAnnotation = slot.annotations[0];
                                const isCommentHovered = firstComment && hoveredMarker?.id === firstComment.id;
                                const isAnnotationHovered = firstAnnotation && hoveredAnnotationMarker?.id === firstAnnotation.id;
                                const isHovered = isCommentHovered || isAnnotationHovered;

                                return (
                                    <div
                                        key={`slot-${slot.ts}`}
                                        className="absolute z-10"
                                        style={{ left: `${slot.pct}%`, top: "50%", transform: "translate(-50%, -50%)" }}
                                        onMouseEnter={(e) => {
                                            e.stopPropagation();
                                            if (firstComment) setHoveredMarker(firstComment);
                                            if (firstAnnotation) setHoveredAnnotationMarker(firstAnnotation);
                                        }}
                                        onMouseLeave={(e) => {
                                            e.stopPropagation();
                                            setHoveredMarker(null);
                                            setHoveredAnnotationMarker(null);
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const vid = videoRef.current;
                                            if (vid) vid.currentTime = slot.ts;
                                        }}
                                    >
                                        {/* Marker dots — stacked when both types present */}
                                        <div className={`flex ${hasBoth ? 'flex-col gap-0.5 -translate-y-0.5' : ''}`}>
                                            {hasAnnotations && (
                                                <div
                                                    className="size-3 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform"
                                                    style={{ backgroundColor: firstAnnotation.color || '#3b82f6' }}
                                                />
                                            )}
                                            {hasComments && (
                                                <div className="size-3 rounded-full bg-amber-400 border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform" />
                                            )}
                                        </div>

                                        {/* Hover tooltip */}
                                        {isHovered && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none animate-in fade-in zoom-in-95 duration-150 z-30">
                                                <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-xl border border-white/10 min-w-48 max-w-72 space-y-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-mono text-white/80 font-bold">{fmtCommentTs(slot.ts)}</span>
                                                    </div>
                                                    {/* Annotation entries */}
                                                    {slot.annotations.length > 0 && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: firstAnnotation?.color || '#3b82f6' }} />
                                                            <span className="text-[10px] text-white/70">
                                                                {slot.annotations.length} annotation{slot.annotations.length > 1 ? 's' : ''}
                                                                <span className="text-white/40 ml-1">({slot.annotations.map(a => a.type).filter((v, i, arr) => arr.indexOf(v) === i).join(', ')})</span>
                                                            </span>
                                                        </div>
                                                    )}
                                                    {/* Comment entries */}
                                                    {slot.comments.map(cm => (
                                                        <div key={cm.id}>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="size-2 rounded-full bg-amber-400 shrink-0" />
                                                                <span className="text-[10px] text-white/70 truncate">{cm.userName}</span>
                                                            </div>
                                                            <p className="text-xs text-white/90 leading-relaxed line-clamp-2 pl-3.5">{cm.body}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Arrow */}
                                                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900/95 border-r border-b border-white/10 rotate-45" />
                                            </div>
                                        )}
                                    </div>
                                );
                            });
                        })()}

                        {/* Thumbnail preview on hover (hidden when a marker is hovered) */}
                        {hoverTime != null && !hoveredMarker && !hoveredAnnotationMarker && (
                            <div className="absolute z-20 pointer-events-none" style={{ left: `${hoverX}px`, bottom: "100%", transform: "translateX(-50%)" }}>
                                <div className="mb-2 flex flex-col items-center">
                                    {thumbnailUrl && (
                                        <img src={thumbnailUrl} alt="" className="w-40 h-[90px] rounded border border-white/20 shadow-lg object-cover mb-1" />
                                    )}
                                    <span className="text-[10px] font-mono text-white bg-black/80 px-1.5 py-0.5 rounded">{fmtTime(hoverTime)}</span>
                                    {/* Show chapter name if hovering over one */}
                                    {chapters.length > 0 && (() => {
                                        const ch = chapters.find(c => hoverTime >= c.start && hoverTime < c.end);
                                        return ch ? <span className="text-[10px] text-white/70 mt-0.5">{ch.title}</span> : null;
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chapter bar */}
                    {chapters.length > 0 && duration > 0 && (
                        <div className="flex h-4 mt-0.5 gap-px">
                            {chapters.map((ch, i) => {
                                const left = (ch.start / duration) * 100;
                                const width = ((ch.end - ch.start) / duration) * 100;
                                const isActive = currentTime >= ch.start && currentTime < ch.end;
                                return (
                                    <div
                                        key={i}
                                        className={`relative group/ch cursor-pointer rounded-sm text-[9px] font-medium text-white/60 truncate px-1 leading-4 transition-colors ${isActive ? "bg-white/20 text-white" : "hover:bg-white/10"}`}
                                        style={{ width: `${width}%` }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const vid = videoRef.current;
                                            if (vid) vid.currentTime = ch.start;
                                        }}
                                    >
                                        {ch.title}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Bottom controls */}
                    <div className="flex items-center justify-between gap-2 text-white">
                        <div className="flex items-center gap-1">
                            <button onClick={(e) => { e.stopPropagation(); skip(-10); }} className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10 active:bg-white/20" title="Rewind 10s">{Icons.skipBack}</button>
                            <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105 active:scale-95">{playing ? Icons.pause : Icons.play}</button>
                            <button onClick={(e) => { e.stopPropagation(); skip(10); }} className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10 active:bg-white/20" title="Forward 10s">{Icons.skipForward}</button>

                            <div className="group/vol flex items-center gap-1 ml-1">
                                <button onClick={(e) => { e.stopPropagation(); setMuted(!muted); }} className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10">{muted || volume === 0 ? Icons.volumeMuted : Icons.volumeHigh}</button>
                                <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300">
                                    <Slider
                                        value={[muted ? 0 : volume * 100]}
                                        max={100}
                                        step={1}
                                        onValueChange={([val]) => { setVolume(val / 100); setMuted(val === 0); }}
                                        className="w-20 **:data-[slot=slider-track]:h-1 **:data-[slot=slider-track]:bg-white/20 **:data-[slot=slider-range]:bg-white **:data-[slot=slider-thumb]:size-3 **:data-[slot=slider-thumb]:bg-white **:data-[slot=slider-thumb]:border-0"
                                    />
                                </div>
                            </div>

                            <span className="text-xs font-mono tabular-nums text-white/70 ml-2 select-none">
                                {fmtTime(currentTime)}<span className="text-white/30 mx-1">/</span>{fmtTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-0.5">
                            <button onClick={(e) => { e.stopPropagation(); cycleSpeed(); }} className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-bold tabular-nums transition-colors hover:bg-white/10" title="Playback speed">{speed}x</button>
                            <button onClick={(e) => { e.stopPropagation(); togglePip(); }} className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10" title="Picture-in-Picture">{Icons.pip}</button>
                            <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10" title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>{isFullscreen ? Icons.minimize : Icons.maximize}</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden elements for thumbnail generation */}
            <video ref={thumbnailVideoRef} src={src} className="hidden" preload="auto" muted />
            <canvas ref={thumbnailCanvasRef} className="hidden" />
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────── */
/*  Main Report View Page                                          */
/* ──────────────────────────────────────────────────────────────── */
export default function ReportPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const initialTime = searchParams.get("t") ? parseFloat(searchParams.get("t")!) : undefined;

    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [activeLogTab, setActiveLogTab] = useState("console");
    const [copied, setCopied] = useState(false);
    const [copiedImage, setCopiedImage] = useState(false);

    // Edit state
    const [isOwner, setIsOwner] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [generateError, setGenerateError] = useState<string | null>(null);

    // Video ↔ Comments state
    const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
    const [commentMarkers, setCommentMarkers] = useState<CommentMarker[]>([]);
    const [chapters, setChapters] = useState<VideoChapter[]>([]);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [showClipExport, setShowClipExport] = useState(false);
    const [clipRange, setClipRange] = useState<[number, number]>([0, 0]);
    const [clipExporting, setClipExporting] = useState(false);
    const [clipMessage, setClipMessage] = useState<string | null>(null);
    const [showTrimmer, setShowTrimmer] = useState(false);
    const [trimRange, setTrimRange] = useState<[number, number]>([0, 0]);
    const [trimming, setTrimming] = useState(false);
    const [showOCR, setShowOCR] = useState(false);
    const [ocrText, setOcrText] = useState<string>("");
    const [ocrLoading, setOcrLoading] = useState(false);
    const [videoAnnotations, setVideoAnnotations] = useState<VideoAnnotation[]>([]);
    const [annotationHistory, setAnnotationHistory] = useState<VideoAnnotation[][]>([[]]);
    const [annotationHistoryIndex, setAnnotationHistoryIndex] = useState(0);
    const [annotationEditing, setAnnotationEditing] = useState(false);
    const [annotationTool, setAnnotationTool] = useState<VideoAnnotation["type"] | null>(null);
    const [annotationColor, setAnnotationColor] = useState("#ef4444");

    const pushAnnotationState = useCallback((next: VideoAnnotation[]) => {
        setVideoAnnotations(next);
        setAnnotationHistory(prev => {
            const trimmed = prev.slice(0, annotationHistoryIndex + 1);
            return [...trimmed, next];
        });
        setAnnotationHistoryIndex(prev => prev + 1);
    }, [annotationHistoryIndex]);

    // Auto-save annotations to DB (debounced)
    const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const initialLoadRef = useRef(true);
    useEffect(() => {
        // Skip saving on initial load
        if (initialLoadRef.current) {
            initialLoadRef.current = false;
            return;
        }
        if (!report?.id) return;
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(async () => {
            try {
                await fetch(`/api/report?id=${report.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ annotations: videoAnnotations }),
                });
            } catch (err) {
                console.error("Failed to save annotations:", err);
            }
        }, 800);
        return () => clearTimeout(saveTimerRef.current);
    }, [videoAnnotations, report?.id]);

    const annotationUndo = useCallback(() => {
        if (annotationHistoryIndex <= 0) return;
        const newIndex = annotationHistoryIndex - 1;
        setAnnotationHistoryIndex(newIndex);
        setVideoAnnotations(annotationHistory[newIndex]);
    }, [annotationHistoryIndex, annotationHistory]);

    const annotationRedo = useCallback(() => {
        if (annotationHistoryIndex >= annotationHistory.length - 1) return;
        const newIndex = annotationHistoryIndex + 1;
        setAnnotationHistoryIndex(newIndex);
        setVideoAnnotations(annotationHistory[newIndex]);
    }, [annotationHistoryIndex, annotationHistory]);

    useEffect(() => {
        if (!annotationEditing) return;
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                annotationUndo();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                annotationRedo();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [annotationEditing, annotationUndo, annotationRedo]);
    const seekToRef = useRef<((t: number) => void) | null>(null);

    const handleCommentsLoaded = useCallback((loadedComments: Comment[]) => {
        setCommentMarkers(getCommentMarkers(loadedComments));
    }, []);

    const handleInsightsUpdate = useCallback((updated: Partial<AIInsightsData>) => {
        setReport(prev => prev ? { ...prev, ...updated } : prev);
    }, []);

    const handleSeekTo = useCallback((seconds: number) => {
        seekToRef.current?.(seconds);
    }, []);

    // Compute error timestamps for heatmap (seconds since first log entry)
    const errorTimestamps = useMemo(() => {
        if (!report?.consoleLogs) return [];
        const logs = report.consoleLogs as ConsoleLogEntry[];
        const errors = logs.filter(l => l.type === "error");
        if (errors.length === 0 || logs.length === 0) return [];
        const firstTs = logs[0].timestamp;
        return errors.map(e => (e.timestamp - firstTs) / 1000);
    }, [report?.consoleLogs]);

    // Highlight region from AI
    const highlightRegion = useMemo(() => {
        if (!report?.highlightStart || !report?.highlightEnd) return null;
        return { start: report.highlightStart, end: report.highlightEnd };
    }, [report?.highlightStart, report?.highlightEnd]);

    // Video duration ref for chapter generation
    const videoDurationRef = useRef(0);

    // Generate AI chapters when video is loaded
    const generateChapters = useCallback(async () => {
        if (!report || loadingChapters || chapters.length > 0) return;
        const dur = videoDurationRef.current;
        if (dur <= 0) return;
        setLoadingChapters(true);
        try {
            const res = await fetch("/api/ai/chapters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reportId: report.id, videoDuration: dur }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.chapters?.length) setChapters(data.chapters);
            }
        } catch (err) {
            console.error("Failed to generate chapters:", err);
        } finally {
            setLoadingChapters(false);
        }
    }, [report, loadingChapters, chapters.length]);

    // Export clip as GIF/WebM
    const handleClipExport = useCallback(async (format: "gif" | "webm") => {
        if (!report?.videoUrl || clipExporting) return;
        setClipExporting(true);
        try {
            const video = document.createElement("video");
            video.crossOrigin = "anonymous";
            video.src = report.videoUrl;
            video.muted = true;
            await new Promise<void>((resolve) => {
                video.onloadeddata = () => resolve();
                video.load();
            });

            const [start, end] = clipRange;
            const clipDuration = end - start;
            if (clipDuration <= 0) { setClipExporting(false); return; }

            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 360;
            const ctx2d = canvas.getContext("2d")!;

            if (format === "webm") {
                // Record canvas as WebM
                const stream = canvas.captureStream(30);
                const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
                const chunks: BlobPart[] = [];
                recorder.ondataavailable = (e) => chunks.push(e.data);

                const done = new Promise<Blob>((resolve) => {
                    recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
                });

                video.currentTime = start;
                await new Promise<void>((r) => { video.onseeked = () => r(); });

                recorder.start();
                video.play();

                await new Promise<void>((resolve) => {
                    const drawFrame = () => {
                        if (video.currentTime >= end) {
                            video.pause();
                            recorder.stop();
                            resolve();
                            return;
                        }
                        ctx2d.drawImage(video, 0, 0, canvas.width, canvas.height);
                        requestAnimationFrame(drawFrame);
                    };
                    drawFrame();
                });

                const blob = await done;
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `clip-${report.id}.webm`;
                a.click();
                URL.revokeObjectURL(url);
            } else {
                // GIF: capture frames and create animated GIF using canvas
                const frames: string[] = [];
                const fps = 10;
                const frameInterval = 1 / fps;
                let t = start;

                while (t < end) {
                    video.currentTime = t;
                    await new Promise<void>((r) => { video.onseeked = () => r(); });
                    ctx2d.drawImage(video, 0, 0, canvas.width, canvas.height);
                    frames.push(canvas.toDataURL("image/png"));
                    t += frameInterval;
                }

                // True GIF encoding requires a library — export as WebM instead
                // with frame-by-frame rendering for the selected range
                const gifCanvas = document.createElement("canvas");
                gifCanvas.width = canvas.width;
                gifCanvas.height = canvas.height;
                const gifCtx = gifCanvas.getContext("2d")!;
                const gifStream = gifCanvas.captureStream(fps);
                const gifRecorder = new MediaRecorder(gifStream, { mimeType: "video/webm" });
                const gifChunks: BlobPart[] = [];
                gifRecorder.ondataavailable = (e) => gifChunks.push(e.data);

                const gifDone = new Promise<Blob>((resolve) => {
                    gifRecorder.onstop = () => resolve(new Blob(gifChunks, { type: "video/webm" }));
                });

                gifRecorder.start();
                for (const frame of frames) {
                    const img = new Image();
                    img.src = frame;
                    await new Promise<void>((r) => { img.onload = () => r(); });
                    gifCtx.drawImage(img, 0, 0);
                    await new Promise<void>((r) => setTimeout(r, 1000 / fps));
                }
                gifRecorder.stop();

                const gifBlob = await gifDone;
                const gifUrl = URL.createObjectURL(gifBlob);
                const gifLink = document.createElement("a");
                gifLink.href = gifUrl;
                gifLink.download = `clip-${report.id}.webm`;
                gifLink.click();
                URL.revokeObjectURL(gifUrl);

                setClipMessage(`Exported ${frames.length} frames as WebM clip. Native GIF encoding is not supported — the clip was saved as a WebM file instead.`);
            }

            setShowClipExport(false);
        } catch (err) {
            console.error("Clip export failed:", err);
        } finally {
            setClipExporting(false);
        }
    }, [report, clipRange, clipExporting]);

    // Handle OCR extraction from current frame (context-based, no canvas needed)
    const handleOCR = useCallback(async () => {
        if (!report || ocrLoading) return;
        setOcrLoading(true);
        setShowOCR(true);
        try {
            const res = await fetch("/api/ai/ocr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reportId: report.id,
                    timestamp: videoCurrentTime,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setOcrText(data.text || "No text detected");
            } else {
                setOcrText("OCR extraction failed");
            }
        } catch (err) {
            console.error("OCR failed:", err);
            setOcrText("OCR extraction failed");
        } finally {
            setOcrLoading(false);
        }
    }, [report, ocrLoading, videoCurrentTime]);

    useEffect(() => {
        async function fetchReport() {
            try {
                const res = await fetch(`/api/report?id=${id}`);
                if (!res.ok) { setNotFound(true); setLoading(false); return; }
                const data = await res.json();
                setReport(data);
                // Load persisted annotations
                if (Array.isArray(data.annotations) && data.annotations.length > 0) {
                    setVideoAnnotations(data.annotations);
                    setAnnotationHistory([[], data.annotations]);
                    setAnnotationHistoryIndex(1);
                }
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }
        fetchReport();
    }, [id]);

    // Check ownership
    useEffect(() => {
        async function checkOwnership() {
            if (!report) return;
            try {
                const res = await fetch("/api/trpc/auth.me");
                if (!res.ok) return;
                const data = await res.json();
                const userId = data?.result?.data?.id;
                setIsOwner(userId === report.userId);
            } catch {
                setIsOwner(false);
            }
        }
        checkOwnership();
    }, [report]);

    const handleStartEditing = () => {
        if (!report) return;
        setEditTitle(report.title || "");
        setEditDescription(report.description || "");
        setSaveError(null);
        setEditing(true);
    };

    const handleCancelEditing = () => {
        setEditing(false);
        setSaveError(null);
    };

    const handleSave = async () => {
        if (!report || saving) return;
        setSaving(true);
        setSaveError(null);
        try {
            const res = await fetch(`/api/report?id=${report.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editTitle.trim() || "Untitled Bug Report",
                    description: editDescription.trim(),
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to update report.");
            }
            const updated = await res.json();
            setReport(updated);
            setEditing(false);
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Failed to update report.");
        } finally {
            setSaving(false);
        }
    };

    const handleGenerate = async () => {
        if (!report || generating) return;
        const mediaUrl = report.videoUrl || report.imageUrl;
        if (!mediaUrl) return;

        setGenerating(true);
        setGenerateError(null);

        try {
            // 1. Call AI analysis
            const aiRes = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoUrl: mediaUrl,
                    mimeType: report.type === 'SCREENSHOT' ? 'image/png' : 'video/webm',
                }),
            });

            if (!aiRes.ok) {
                const err = await aiRes.json().catch(() => ({}));
                throw new Error(err.detail || err.error || 'AI analysis failed.');
            }

            const ai = await aiRes.json();

            // 2. Save AI results to the report
            const patchRes = await fetch(`/api/report?id=${report.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: ai.title || report.title,
                    description: ai.description || report.description,
                    transcript: ai.transcript,
                }),
            });

            if (!patchRes.ok) {
                const err = await patchRes.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to save AI-generated content.');
            }

            const updated = await patchRes.json();
            setReport(updated);
        } catch (err) {
            console.error('AI generation failed:', err);
            setGenerateError(err instanceof Error ? err.message : 'AI generation failed.');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopyLink = async () => {
        const base = window.location.origin + window.location.pathname;
        const t = Math.floor(videoCurrentTime);
        const url = t > 0 ? `${base}?t=${t}` : base;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = async () => {
        if (!report) return;
        const isImage = report.type === 'SCREENSHOT';
        const mediaUrl = isImage ? report.imageUrl : report.videoUrl;
        if (!mediaUrl) return;
        try {
            const res = await fetch(mediaUrl);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeName = (report.title || (isImage ? 'screenshot' : 'recording')).replace(/[^a-zA-Z0-9_\- ]/g, '');
            a.download = isImage ? `${safeName}.png` : `${safeName}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        <div className="relative size-16 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-7 text-primary-foreground animate-pulse">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-lg font-bold tracking-tight">Loading Report</h2>
                        <p className="text-sm text-muted-foreground">Fetching bug report data&hellip;</p>
                    </div>
                </div>
            </div>
        );
    }

    if (notFound || !report) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
                    <span className="opacity-30">{Icons.inbox}</span>
                    <div className="text-center space-y-2">
                        <h2 className="text-lg font-bold tracking-tight">Report Not Found</h2>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            This report may have been deleted or the link is invalid.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => router.push("/dashboard")}>
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const consoleLogs = (report.consoleLogs ?? []) as ConsoleLogEntry[];
    const networkLogs = (report.networkLogs ?? []) as NetworkLogEntry[];
    const consoleErrors = consoleLogs.filter(l => l.type === "error").length;
    const consoleWarnings = consoleLogs.filter(l => l.type === "warn").length;
    const failedRequests = networkLogs.filter(l => l.status >= 400).length;

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
                                        {Icons.chevronLeft}
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>Back to Dashboard</TooltipContent>
                            </Tooltip>
                            <Separator orientation="vertical" className="h-5" />
                            {editing ? (
                                <Input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="Report title"
                                    className="text-base font-bold h-8 max-w-md"
                                    autoFocus
                                    onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancelEditing(); }}
                                />
                            ) : (
                                <h1 className="text-base font-bold truncate">{report.title || "Untitled Bug Report"}</h1>
                            )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="secondary" className="text-[11px] font-mono tabular-nums gap-1.5 hidden sm:inline-flex">
                                {Icons.clock}
                                {new Date(report.createdAt).toLocaleDateString("en-US", {
                                    month: "short", day: "numeric", year: "numeric",
                                })}
                            </Badge>
                            {isOwner && !editing && (
                                <>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleGenerate}
                                                disabled={generating}
                                                className="gap-1.5 transition-all"
                                            >
                                                {generating ? Icons.spinner : Icons.sparkles}
                                                {generating ? 'Generating...' : 'Generate'}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Use AI to generate title, description & transcript</TooltipContent>
                                    </Tooltip>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleStartEditing}
                                        className="gap-1.5 transition-all"
                                    >
                                        {Icons.edit}
                                        Edit
                                    </Button>
                                </>
                            )}
                            {editing && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleCancelEditing}
                                        disabled={saving}
                                        className="gap-1.5"
                                    >
                                        {Icons.close}
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="gap-1.5"
                                    >
                                        {saving ? Icons.spinner : Icons.check}
                                        {saving ? "Saving..." : "Save"}
                                    </Button>
                                </>
                            )}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleDownload}
                                        className="gap-1.5"
                                    >
                                        {Icons.download}
                                        <span className="hidden sm:inline">Download</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Download {report.type === 'SCREENSHOT' ? 'screenshot' : 'video'}</TooltipContent>
                            </Tooltip>
                            {report.type === 'SCREENSHOT' && report.imageUrl && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1.5 transition-all"
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(report.imageUrl!);
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
                                            {copiedImage ? Icons.check : Icons.copy}
                                            {copiedImage ? 'Copied!' : 'Copy Image'}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copy image to clipboard</TooltipContent>
                                </Tooltip>
                            )}
                            {report.type !== 'SCREENSHOT' && report.videoUrl && (
                                <>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    const dur = videoDurationRef.current || 30;
                                                    setClipRange([Math.max(0, videoCurrentTime - 2), Math.min(dur, videoCurrentTime + 5)]);
                                                    setShowClipExport(true);
                                                }}
                                                className="gap-1.5"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                <span className="hidden sm:inline">Clip</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Export video clip</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    const dur = videoDurationRef.current || 30;
                                                    setTrimRange([0, dur]);
                                                    setShowTrimmer(true);
                                                }}
                                                className="gap-1.5"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>
                                                <span className="hidden sm:inline">Trim</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Trim video</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleOCR}
                                                disabled={ocrLoading}
                                                className="gap-1.5"
                                            >
                                                {ocrLoading ? Icons.spinner : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                                                <span className="hidden sm:inline">OCR</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Extract text from current frame</TooltipContent>
                                    </Tooltip>
                                </>
                            )}
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCopyLink}
                                className="gap-1.5 transition-all"
                            >
                                {copied ? Icons.check : Icons.link}
                                {copied ? "Copied!" : "Copy Link"}
                            </Button>
                        </div>
                    </div>
                </header>

                {/* ── Content ─────────────────────────────────────── */}
                <main className="mx-auto max-w-screen-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* ── Full-width Media ─────────────────────── */}
                    <div className="w-full border-b">
                        {report.type === 'SCREENSHOT' && report.imageUrl ? (
                            <div className="w-full bg-black/5 dark:bg-white/5 flex items-center justify-center p-4">
                                <img
                                    src={report.imageUrl}
                                    alt={report.title || 'Screenshot'}
                                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
                                />
                            </div>
                        ) : report.videoUrl ? (
                            <div className="relative">
                                <div className="relative">
                                    <VideoPlayer
                                        src={report.videoUrl}
                                        commentMarkers={commentMarkers}
                                        annotationMarkers={videoAnnotations.map(a => ({ id: a.id, timestamp: a.timestamp, type: a.type, color: a.color }))}
                                        errorTimestamps={errorTimestamps}
                                        highlightRegion={highlightRegion}
                                        chapters={chapters}
                                        initialTime={initialTime}
                                        onTimeUpdate={setVideoCurrentTime}
                                        onSeekTo={seekToRef}
                                        onDurationReady={(dur) => {
                                            videoDurationRef.current = dur;
                                            generateChapters();
                                        }}
                                    />
                                    <VideoAnnotationOverlay
                                        annotations={videoAnnotations}
                                        currentTime={videoCurrentTime}
                                        videoDuration={videoDurationRef.current}
                                        onAddAnnotation={(a) => pushAnnotationState([...videoAnnotations, a])}
                                        onDeleteAnnotation={(id) => pushAnnotationState(videoAnnotations.filter(a => a.id !== id))}
                                        onUpdateAnnotation={(updated) => pushAnnotationState(videoAnnotations.map(a => a.id === updated.id ? updated : a))}
                                        isEditing={annotationEditing}
                                        activeTool={annotationTool}
                                        activeColor={annotationColor}
                                    />
                                </div>
                                <div className="px-4 py-2 border-t bg-muted/30">
                                    <AnnotationToolbar
                                        isEditing={annotationEditing}
                                        onToggleEditing={() => { setAnnotationEditing(!annotationEditing); if (annotationEditing) setAnnotationTool(null); }}
                                        activeTool={annotationTool}
                                        onSetTool={setAnnotationTool}
                                        activeColor={annotationColor}
                                        onSetColor={setAnnotationColor}
                                        annotationCount={videoAnnotations.length}
                                        onUndo={annotationUndo}
                                        onRedo={annotationRedo}
                                        canUndo={annotationHistoryIndex > 0}
                                        canRedo={annotationHistoryIndex < annotationHistory.length - 1}
                                        onClearAll={() => pushAnnotationState([])}
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* ── Bento Grid below video ──────────────────── */}
                    <div className="grid auto-rows-min gap-4 p-4 sm:p-6 lg:grid-cols-12 lg:gap-6">
                        {/* ── Stats Row ──────────────────────────── */}
                        <StatCard
                            className="lg:col-span-3"
                            label="Console Events"
                            value={consoleLogs.length}
                            icon={Icons.console}
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
                            value={networkLogs.length}
                            icon={Icons.network}
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
                                    {Icons.clock}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Recorded</p>
                                    <p className="text-sm font-bold tabular-nums tracking-tight truncate">
                                        {new Date(report.createdAt).toLocaleString("en-US", {
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
                                {editing ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            placeholder="Add a description..."
                                            rows={3}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none leading-relaxed"
                                            onKeyDown={(e) => { if (e.key === "Escape") handleCancelEditing(); }}
                                        />
                                        {saveError && (
                                            <p className="text-xs text-destructive">{saveError}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-foreground/80 leading-relaxed min-h-16">
                                        {report.description || "No description provided."}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* ── AI Insights Panel ──────────────────── */}
                        <AIInsightsPanel
                            reportId={report.id}
                            insights={{
                                severity: report.severity,
                                priority: report.priority,
                                tags: report.tags,
                                reproSteps: report.reproSteps,
                                rootCause: report.rootCause,
                                logSummary: report.logSummary,
                                stakeholderSummary: report.stakeholderSummary,
                                suggestedFix: report.suggestedFix,
                                accessibilityAudit: report.accessibilityAudit,
                                performanceAnalysis: report.performanceAnalysis,
                                securityScan: report.securityScan,
                                testCases: report.testCases,
                                sentiment: report.sentiment,
                            }}
                            onInsightsUpdate={handleInsightsUpdate}
                        />

                        {/* ── Logs Panel (full width) ────────────── */}
                        <Card className="lg:col-span-12 py-0 overflow-hidden">
                            <Tabs value={activeLogTab} onValueChange={setActiveLogTab} className="h-full">
                                <div className="flex items-center justify-between border-b px-5 py-2.5 bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-sm font-bold tracking-tight">Captured Data</h3>
                                        <Separator orientation="vertical" className="h-4" />
                                        <TabsList variant="line" className="h-8">
                                            <TabsTrigger value="console" className="text-xs gap-1.5 px-3">
                                                {Icons.console}
                                                Console
                                                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">{consoleLogs.length}</Badge>
                                            </TabsTrigger>
                                            <TabsTrigger value="network" className="text-xs gap-1.5 px-3">
                                                {Icons.network}
                                                Network
                                                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">{networkLogs.length}</Badge>
                                            </TabsTrigger>
                                            {report.transcript && (
                                                <TabsTrigger value="transcript" className="text-xs gap-1.5 px-3">
                                                    {Icons.transcript}
                                                    Transcript
                                                </TabsTrigger>
                                            )}
                                        </TabsList>
                                    </div>
                                </div>

                                <TabsContent value="console" className="m-0">
                                    <ScrollArea className="h-80">
                                        <div className="divide-y divide-border/50">
                                            {consoleLogs.length === 0 && <EmptyState message="No console events captured" />}
                                            {consoleLogs.map((log, i) => (
                                                <div
                                                    key={i}
                                                    className="group flex items-start gap-3 px-5 py-2 text-xs font-mono transition-colors hover:bg-muted/40 animate-in fade-in slide-in-from-left-1 duration-200"
                                                    style={{ animationDelay: `${Math.min(i * 20, 400)}ms` }}
                                                >
                                                    <span className="text-[10px] text-muted-foreground tabular-nums pt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {fmtTimestamp(log.timestamp)}
                                                    </span>
                                                    <span className={`inline-flex items-center justify-center size-5 rounded text-[10px] font-bold shrink-0 ${consoleTypeStyle(log.type)}`}>
                                                        {consoleTypeIcon(log.type)}
                                                    </span>
                                                    <span className="text-foreground/80 break-all leading-relaxed">
                                                        {log.args?.map(a => (typeof a === "string" ? a : JSON.stringify(a))).join(" ")}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="network" className="m-0">
                                    <ScrollArea className="h-80">
                                        <div className="sticky top-0 z-10 grid grid-cols-[70px_56px_1fr] gap-4 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/60 border-b backdrop-blur-sm">
                                            <span>Status</span>
                                            <span>Method</span>
                                            <span>URL</span>
                                        </div>
                                        <div className="divide-y divide-border/50">
                                            {networkLogs.length === 0 && <EmptyState message="No network requests captured" />}
                                            {networkLogs.map((req, i) => (
                                                <div
                                                    key={i}
                                                    className="group grid grid-cols-[70px_56px_1fr] gap-4 px-5 py-2 text-xs font-mono transition-colors hover:bg-muted/40 animate-in fade-in slide-in-from-left-1 duration-200"
                                                    style={{ animationDelay: `${Math.min(i * 15, 300)}ms` }}
                                                >
                                                    <span className={`font-bold tabular-nums ${statusColor(req.status)}`}>{req.status}</span>
                                                    <Badge variant="outline" className="h-5 text-[10px] font-bold justify-center">{req.method}</Badge>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="text-foreground/70 truncate cursor-default">{req.url}</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="max-w-md break-all text-xs font-mono">{req.url}</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                {report.transcript && (
                                    <TabsContent value="transcript" className="m-0">
                                        <ScrollArea className="h-80">
                                            <div className="px-5 py-4 space-y-1">
                                                {report.transcript.split('\n').map((line, i) => (
                                                    <p
                                                        key={i}
                                                        className="text-sm text-foreground/80 leading-relaxed font-mono animate-in fade-in slide-in-from-left-1 duration-200"
                                                        style={{ animationDelay: `${Math.min(i * 30, 500)}ms` }}
                                                    >
                                                        {line || '\u00A0'}
                                                    </p>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>
                                )}
                            </Tabs>
                        </Card>

                        {/* ── Comments Section ──────────────────── */}
                        <Card className="lg:col-span-12 py-0 overflow-hidden">
                            <CardContent className="p-5">
                                <CommentsSection
                                    reportId={report.id}
                                    videoTimestamp={report.type === 'VIDEO' ? videoCurrentTime : undefined}
                                    onSeekTo={report.type === 'VIDEO' ? handleSeekTo : undefined}
                                    onCommentsLoaded={handleCommentsLoaded}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* ── Error Alert Dialog ──────────────────────────── */}
            <AlertDialog open={!!generateError} onOpenChange={(open) => { if (!open) setGenerateError(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>AI Generation Failed</AlertDialogTitle>
                        <AlertDialogDescription>{generateError}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setGenerateError(null)}>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Clip Info Dialog ────────────────────────────── */}
            <AlertDialog open={!!clipMessage} onOpenChange={(open) => { if (!open) setClipMessage(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clip Exported</AlertDialogTitle>
                        <AlertDialogDescription>{clipMessage}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setClipMessage(null)}>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Clip Export Modal ─────────────────────────── */}
            {showClipExport && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowClipExport(false)}>
                    <div className="bg-background rounded-xl border shadow-2xl p-6 w-full max-w-md mx-4 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Export Clip</h3>
                            <button onClick={() => setShowClipExport(false)} className="text-muted-foreground hover:text-foreground">
                                {Icons.close}
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium">Start Time (seconds)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min={0}
                                    max={clipRange[1]}
                                    value={clipRange[0].toFixed(1)}
                                    onChange={e => setClipRange([parseFloat(e.target.value) || 0, clipRange[1]])}
                                    className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">End Time (seconds)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min={clipRange[0]}
                                    max={videoDurationRef.current}
                                    value={clipRange[1].toFixed(1)}
                                    onChange={e => setClipRange([clipRange[0], parseFloat(e.target.value) || 0])}
                                    className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Duration: {(clipRange[1] - clipRange[0]).toFixed(1)}s
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                className="flex-1"
                                disabled={clipExporting}
                                onClick={() => handleClipExport("webm")}
                            >
                                {clipExporting ? Icons.spinner : null}
                                Export WebM
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                disabled={clipExporting}
                                onClick={() => handleClipExport("gif")}
                            >
                                {clipExporting ? Icons.spinner : null}
                                Export GIF
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Trim Modal ───────────────────────────────── */}
            {showTrimmer && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowTrimmer(false)}>
                    <div className="bg-background rounded-xl border shadow-2xl p-6 w-full max-w-md mx-4 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Trim Video</h3>
                            <button onClick={() => setShowTrimmer(false)} className="text-muted-foreground hover:text-foreground">
                                {Icons.close}
                            </button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Select the portion of the video you want to keep. The trimmed video will be downloaded.
                        </p>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium">Keep From (seconds)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min={0}
                                    max={trimRange[1]}
                                    value={trimRange[0].toFixed(1)}
                                    onChange={e => setTrimRange([parseFloat(e.target.value) || 0, trimRange[1]])}
                                    className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Keep Until (seconds)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min={trimRange[0]}
                                    max={videoDurationRef.current}
                                    value={trimRange[1].toFixed(1)}
                                    onChange={e => setTrimRange([trimRange[0], parseFloat(e.target.value) || 0])}
                                    className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Trimmed duration: {(trimRange[1] - trimRange[0]).toFixed(1)}s (original: {videoDurationRef.current.toFixed(1)}s)
                            </div>
                        </div>
                        <Button
                            className="w-full"
                            disabled={trimming}
                            onClick={async () => {
                                if (!report?.videoUrl) return;
                                setTrimming(true);
                                try {
                                    const video = document.createElement("video");
                                    video.crossOrigin = "anonymous";
                                    video.src = report.videoUrl;
                                    video.muted = true;
                                    await new Promise<void>((r) => { video.onloadeddata = () => r(); video.load(); });

                                    const canvas = document.createElement("canvas");
                                    canvas.width = video.videoWidth || 640;
                                    canvas.height = video.videoHeight || 360;
                                    const ctx2d = canvas.getContext("2d")!;
                                    const stream = canvas.captureStream(30);
                                    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
                                    const chunks: BlobPart[] = [];
                                    recorder.ondataavailable = (e) => chunks.push(e.data);

                                    const done = new Promise<Blob>((resolve) => {
                                        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
                                    });

                                    video.currentTime = trimRange[0];
                                    await new Promise<void>((r) => { video.onseeked = () => r(); });
                                    recorder.start();
                                    video.play();

                                    await new Promise<void>((resolve) => {
                                        const drawFrame = () => {
                                            if (video.currentTime >= trimRange[1]) {
                                                video.pause();
                                                recorder.stop();
                                                resolve();
                                                return;
                                            }
                                            ctx2d.drawImage(video, 0, 0, canvas.width, canvas.height);
                                            requestAnimationFrame(drawFrame);
                                        };
                                        drawFrame();
                                    });

                                    const blob = await done;
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `trimmed-${report.id}.webm`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                    setShowTrimmer(false);
                                } catch (err) {
                                    console.error("Trim failed:", err);
                                } finally {
                                    setTrimming(false);
                                }
                            }}
                        >
                            {trimming ? Icons.spinner : null}
                            {trimming ? "Trimming..." : "Trim & Download"}
                        </Button>
                    </div>
                </div>
            )}

            {/* ── OCR Results Modal ────────────────────────── */}
            {showOCR && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowOCR(false)}>
                    <div className="bg-background rounded-xl border shadow-2xl p-6 w-full max-w-lg mx-4 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Screen Text (OCR)</h3>
                            <button onClick={() => setShowOCR(false)} className="text-muted-foreground hover:text-foreground">
                                {Icons.close}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Text extracted at {videoCurrentTime.toFixed(1)}s
                        </p>
                        {ocrLoading ? (
                            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                                {Icons.spinner}
                                <span>Extracting text...</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <pre className="text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-4 border">
                                    {ocrText}
                                </pre>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    onClick={async () => {
                                        await navigator.clipboard.writeText(ocrText);
                                    }}
                                >
                                    Copy Text
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </TooltipProvider>
    );
}

/* ─── Sub-components ───────────────────────────────────────────── */
function StatCard({ label, value, icon, detail, className }: {
    label: string;
    value: number;
    icon: React.ReactNode;
    detail: React.ReactNode;
    className?: string;
}) {
    return (
        <Card className={`py-4 group transition-shadow hover:shadow-md ${className ?? ""}`}>
            <CardContent className="py-0 space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
                    <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        {icon}
                    </div>
                </div>
                <div>
                    <span className="text-3xl font-black tracking-tighter tabular-nums">{value}</span>
                </div>
                {detail}
            </CardContent>
        </Card>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <span className="opacity-30">{Icons.inbox}</span>
            <p className="text-sm">{message}</p>
        </div>
    );
}
