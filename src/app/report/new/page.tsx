"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

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
    speed: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
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
    camera: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    inbox: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
    ),
    heart: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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

interface RecordingPayload {
    id: string;
    videoUrl: string;
    consoleLogs: ConsoleLogEntry[];
    networkLogs: NetworkLogEntry[];
    timestamp: number;
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
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <div className="relative size-16 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                        <span className="text-primary-foreground animate-pulse">{Icons.camera}</span>
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-lg font-bold tracking-tight">Receiving Recording</h2>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Waiting for data from the Jam Clone extension&hellip;
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

/* ──────────────────────────────────────────────────────────────── */
/*  Custom Video Player                                            */
/* ──────────────────────────────────────────────────────────────── */
function VideoPlayer({ src }: { src: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

    const showControls = useCallback(() => {
        setControlsVisible(true);
        clearTimeout(hideTimerRef.current);
        if (playing) {
            hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
        }
    }, [playing]);

    const togglePlay = () => {
        const vid = videoRef.current;
        if (!vid) return;
        if (playing) { vid.pause(); } else { vid.play(); }
    };

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        } else {
            await containerRef.current.requestFullscreen();
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const vid = videoRef.current;
            if (!vid) return;
            switch (e.key) {
                case " ": case "k": e.preventDefault(); if (playing) { vid.pause(); } else { vid.play(); } break;
                case "ArrowLeft": e.preventDefault(); vid.currentTime = Math.max(0, vid.currentTime - 5); break;
                case "ArrowRight": e.preventDefault(); vid.currentTime = Math.min(vid.duration, vid.currentTime + 5); break;
                case "ArrowUp": e.preventDefault(); vid.volume = Math.min(1, vid.volume + 0.1); setVolume(vid.volume); break;
                case "ArrowDown": e.preventDefault(); vid.volume = Math.max(0, vid.volume - 0.1); setVolume(vid.volume); break;
                case "m": setMuted(!muted); break;
                case "f": toggleFullscreen(); break;
            }
            showControls();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    });

    const togglePip = async () => {
        const vid = videoRef.current;
        if (!vid) return;
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else {
            await vid.requestPictureInPicture();
        }
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
        const vid = videoRef.current;
        if (vid) vid.playbackRate = next;

    };

    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;
        vid.muted = muted;
    }, [muted]);

    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;
        vid.volume = volume;
    }, [volume]);

    // Fullscreen change detection
    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className="group/player relative w-full bg-black overflow-hidden cursor-pointer select-none mx-auto"
            style={{
                aspectRatio: isFullscreen ? undefined : videoAspectRatio,
                height: isFullscreen ? "100vh" : undefined,
                maxHeight: isFullscreen ? undefined : "80vh",
            }}
            onMouseMove={showControls}
            onMouseLeave={() => playing && setControlsVisible(false)}
            onClick={(e) => {
                // Avoid toggling when clicking controls
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
                    // For MediaRecorder WebMs without duration metadata,
                    // track the highest currentTime as a fallback duration
                    if (!isFinite(vid.duration) || vid.duration === 0) {
                        setDuration((prev) => Math.max(prev, vid.currentTime));
                    }
                    if (vid.buffered.length > 0 && isFinite(vid.duration) && vid.duration > 0) {
                        setBuffered((vid.buffered.end(vid.buffered.length - 1) / vid.duration) * 100);
                    }
                }}
                onLoadedMetadata={() => {
                    const vid = videoRef.current;
                    if (vid && vid.videoWidth && vid.videoHeight) {
                        setVideoAspectRatio(vid.videoWidth / vid.videoHeight);
                    }
                    if (vid && isFinite(vid.duration) && vid.duration > 0) {
                        setDuration(vid.duration);
                    }
                }}
                onDurationChange={() => {
                    const vid = videoRef.current;
                    if (vid && isFinite(vid.duration) && vid.duration > 0) {
                        setDuration(vid.duration);
                    }
                }}
                onEnded={() => {
                    const vid = videoRef.current;
                    // On ended, we know the true duration
                    if (vid && vid.currentTime > 0) {
                        setDuration((prev) => Math.max(prev, vid.currentTime));
                    }
                    setPlaying(false);
                    setControlsVisible(true);
                }}
                playsInline
            />

            {/* ── Big center play button (shown when paused) ── */}
            <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${playing ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
                <div className="size-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl transition-transform duration-200 hover:scale-110 active:scale-95">
                    <svg viewBox="0 0 24 24" fill="white" className="size-8 ml-1">
                        <path d="M8 5.14v14l11-7-11-7z" />
                    </svg>
                </div>
            </div>

            {/* ── Controls overlay ────────────────────────────── */}
            <div
                data-controls
                className={`absolute inset-x-0 bottom-0 transition-all duration-300 ${controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
            >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                <div className="relative px-4 pb-3 pt-10 space-y-2">
                    {/* ── Progress bar ────────────────────────── */}
                    <div
                        className="group/progress relative h-1.5 hover:h-2.5 transition-all duration-200 cursor-pointer rounded-full bg-white/20 overflow-hidden"
                        onClick={(e) => {
                            e.stopPropagation();
                            const vid = videoRef.current;
                            if (!vid) return;
                            const seekDuration = isFinite(vid.duration) && vid.duration > 0 ? vid.duration : duration;
                            if (seekDuration <= 0) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pct = (e.clientX - rect.left) / rect.width;
                            vid.currentTime = pct * seekDuration;
                        }}
                    >
                        {/* Buffered */}
                        <div
                            className="absolute inset-y-0 left-0 bg-white/20 rounded-full transition-[width] duration-300"
                            style={{ width: `${buffered}%` }}
                        />
                        {/* Played */}
                        <div
                            className="absolute inset-y-0 left-0 bg-white rounded-full transition-[width] duration-100"
                            style={{ width: `${progress}%` }}
                        />
                        {/* Thumb */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 size-3.5 rounded-full bg-white shadow-lg shadow-black/40 opacity-0 group-hover/progress:opacity-100 transition-opacity duration-200 -ml-1.5"
                            style={{ left: `${progress}%` }}
                        />
                    </div>

                    {/* ── Bottom controls row ─────────────────── */}
                    <div className="flex items-center justify-between gap-2 text-white">
                        {/* Left controls */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); skip(-10); }}
                                className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10 active:bg-white/20"
                                title="Rewind 10s"
                            >
                                {Icons.skipBack}
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
                            >
                                {playing ? Icons.pause : Icons.play}
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); skip(10); }}
                                className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10 active:bg-white/20"
                                title="Forward 10s"
                            >
                                {Icons.skipForward}
                            </button>

                            {/* Volume */}
                            <div className="group/vol flex items-center gap-1 ml-1">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
                                    className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                                >
                                    {muted || volume === 0 ? Icons.volumeMuted : Icons.volumeHigh}
                                </button>
                                <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300">
                                    <Slider
                                        value={[muted ? 0 : volume * 100]}
                                        max={100}
                                        step={1}
                                        onValueChange={([val]) => {
                                            setVolume(val / 100);
                                            setMuted(val === 0);
                                        }}
                                        className="w-20 **:data-[slot=slider-track]:h-1 **:data-[slot=slider-track]:bg-white/20 **:data-[slot=slider-range]:bg-white **:data-[slot=slider-thumb]:size-3 **:data-[slot=slider-thumb]:bg-white **:data-[slot=slider-thumb]:border-0"
                                    />
                                </div>
                            </div>

                            {/* Timestamp */}
                            <span className="text-xs font-mono tabular-nums text-white/70 ml-2 select-none">
                                {fmtTime(currentTime)}
                                <span className="text-white/30 mx-1">/</span>
                                {fmtTime(duration)}
                            </span>
                        </div>

                        {/* Right controls */}
                        <div className="flex items-center gap-0.5">
                            {/* Speed */}
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); cycleSpeed(); }}
                                    className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-bold tabular-nums transition-colors hover:bg-white/10"
                                    title="Playback speed"
                                >
                                    {speed}x
                                </button>
                            </div>

                            {/* PiP */}
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePip(); }}
                                className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                                title="Picture-in-Picture"
                            >
                                {Icons.pip}
                            </button>

                            {/* Fullscreen */}
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                                className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                            >
                                {isFullscreen ? Icons.minimize : Icons.maximize}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────── */
/*  Main Page                                                      */
/* ──────────────────────────────────────────────────────────────── */
export default function NewReportPage() {
    const router = useRouter();

    // Persist helpers (defined before state so we can use for initialization)
    const saveToLocal = useCallback((list: RecordingPayload[]) => {
        try {
            localStorage.setItem('jam_recordings', JSON.stringify(list));
        } catch { /* quota exceeded — ignore */ }
    }, []);

    const loadFromLocal = useCallback((): RecordingPayload[] => {
        try {
            const raw = localStorage.getItem('jam_recordings');
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    }, []);

    // Initialize from localStorage (survives refresh)
    const [persisted] = useState(() => loadFromLocal());
    const [recordings, setRecordings] = useState<RecordingPayload[]>(persisted);
    const [recording, setRecording] = useState<RecordingPayload | null>(persisted[0] ?? null);
    const [loading, setLoading] = useState(persisted.length === 0);
    const [title, setTitle] = useState("Unlabeled Recording");
    const [description, setDescription] = useState("");
    const [activeLogTab, setActiveLogTab] = useState("console");
    const [saving, setSaving] = useState(false);

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
        };

        window.addEventListener("message", handleMessage);
        window.postMessage({ type: "REPORT_PAGE_READY" }, "*");

        // If after 3s we still have nothing, stop loading spinner
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 3000);

        return () => {
            window.removeEventListener("message", handleMessage);
            clearTimeout(timeout);
        };
    }, [loadFromLocal, saveToLocal]);

    const handleSelectRecording = (rec: RecordingPayload) => {
        setRecording(rec);
        setTitle("Unlabeled Recording");
        setDescription("");
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
                localStorage.removeItem('jam_recordings');
            }
        }
    };

    const handleSaveReport = async () => {
        if (!recording || saving) return;
        setSaving(true);

        try {
            // 1. Convert data URL to a File blob
            const res = await fetch(recording.videoUrl);
            const blob = await res.blob();
            const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });

            // 2. Upload video to server
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const { url: videoUrl } = await uploadRes.json();

            // 3. Create the report
            const reportRes = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title || 'Untitled Bug Report',
                    description,
                    videoUrl,
                    consoleLogs: recording.consoleLogs,
                    networkLogs: recording.networkLogs,
                }),
            });

            if (!reportRes.ok) throw new Error('Failed to save report');
            const report = await reportRes.json();

            // 4. Clean up local recording
            handleDiscardRecording(recording.id);

            // 5. Navigate to saved report
            router.push(`/report/${report.id}`);
        } catch (err) {
            console.error('Save failed:', err);
            setSaving(false);
        }
    };

    if (loading && !recording) return <LoadingScreen />;

    if (!recording) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
                    <span className="opacity-30">{Icons.inbox}</span>
                    <div className="text-center space-y-2">
                        <h2 className="text-lg font-bold tracking-tight">No Recordings</h2>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Start a recording from the Jam Clone extension, then come back here.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/dashboard')}>
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const consoleErrors = recording.consoleLogs?.filter((l) => l.type === "error").length ?? 0;
    const consoleWarnings = recording.consoleLogs?.filter((l) => l.type === "warn").length ?? 0;
    const failedRequests = recording.networkLogs?.filter((l) => l.status >= 400).length ?? 0;

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
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-auto border-none bg-transparent p-0 text-base font-bold shadow-none focus-visible:ring-0 truncate"
                                placeholder="Give this report a name…"
                            />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button variant="ghost" size="sm" onClick={() => handleDiscardRecording(recording.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                Discard
                            </Button>
                            <Button size="sm" onClick={handleSaveReport} disabled={saving} className="shadow-md shadow-primary/20 transition-shadow hover:shadow-lg hover:shadow-primary/30">
                                {saving ? (
                                    <>
                                        <svg className="size-4 mr-1 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Saving…
                                    </>
                                ) : (
                                    <>
                                        {Icons.heart}
                                        Save &amp; Share
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </header>

                {/* ── Recording Selector (only when multiple) ─── */}
                {recordings.length > 1 && (
                    <RecordingSelector
                        recordings={recordings}
                        activeId={recording.id}
                        onSelect={handleSelectRecording}
                        onDiscard={handleDiscardRecording}
                    />
                )}

                {/* ── Content ─────────────────────────────────────── */}
                <main className="mx-auto max-w-screen-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* ── Full-width Video Player ─────────────────── */}
                    <div className="w-full border-b">
                        <VideoPlayer src={recording.videoUrl} />
                    </div>

                    {/* ── Bento Grid below video ──────────────────── */}
                    <div className="grid auto-rows-min gap-4 p-4 sm:p-6 lg:grid-cols-12 lg:gap-6">

                        {/* ── Stats Row (3 cards across) ─────────── */}
                        <StatCard
                            className="lg:col-span-3"
                            label="Console Events"
                            value={recording.consoleLogs?.length ?? 0}
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
                            value={recording.networkLogs?.length ?? 0}
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
                                        {new Date(recording.timestamp).toLocaleString("en-US", {
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
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What happened?"
                                    className="min-h-16 resize-none border-none bg-muted/50 shadow-none focus-visible:ring-0 text-sm"
                                />
                            </CardContent>
                        </Card>

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
                                                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">{recording.consoleLogs?.length ?? 0}</Badge>
                                            </TabsTrigger>
                                            <TabsTrigger value="network" className="text-xs gap-1.5 px-3">
                                                {Icons.network}
                                                Network
                                                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">{recording.networkLogs?.length ?? 0}</Badge>
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>
                                </div>

                                <TabsContent value="console" className="m-0">
                                    <ScrollArea className="h-80">
                                        <div className="divide-y divide-border/50">
                                            {recording.consoleLogs?.length === 0 && <EmptyState message="No console events captured" />}
                                            {recording.consoleLogs?.map((log, i) => (
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
                                                        {log.args?.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ")}
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
                                            {recording.networkLogs?.length === 0 && <EmptyState message="No network requests captured" />}
                                            {recording.networkLogs?.map((req, i) => (
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
                            </Tabs>
                        </Card>
                    </div>
                </main>
            </div>
        </TooltipProvider>
    );
}

/* ─── Recording Selector ───────────────────────────────────────── */
function RecordingSelector({ recordings, activeId, onSelect, onDiscard }: {
    recordings: RecordingPayload[];
    activeId: string;
    onSelect: (rec: RecordingPayload) => void;
    onDiscard: (id: string) => void;
}) {
    return (
        <div className="border-b bg-muted/30">
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 py-3">
                <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recordings</h3>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{recordings.length}</Badge>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 pt-2 px-1 scrollbar-thin">
                    {recordings.map((rec) => {
                        const isActive = rec.id === activeId;
                        const time = new Date(rec.timestamp).toLocaleString("en-US", {
                            month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit", hour12: true,
                        });
                        return (
                            <button
                                key={rec.id}
                                onClick={() => onSelect(rec)}
                                className={`group relative flex items-center gap-3 shrink-0 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                                    isActive
                                        ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10"
                                        : "border-border bg-background hover:border-border/80 hover:bg-muted/50"
                                }`}
                            >
                                {/* Thumbnail dot */}
                                <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                }`}>
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                                        <path d="M8 5.14v14l11-7-11-7z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-xs font-semibold truncate ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                        {time}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/60">
                                        {rec.consoleLogs?.length ?? 0} logs · {rec.networkLogs?.length ?? 0} requests
                                    </p>
                                </div>
                                {/* Discard button */}
                                <span
                                    role="button"
                                    onClick={(e) => { e.stopPropagation(); onDiscard(rec.id); }}
                                    className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110"
                                    title="Discard this recording"
                                >
                                    ✕
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
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
