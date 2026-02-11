'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { ReportIcons as Icons } from '@/components/icons/report-icons';
import { formatTime } from '@/types/report';

interface VideoPlayerProps {
    src: string;
}

export function VideoPlayer({ src }: VideoPlayerProps) {
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

    const showControls = useCallback(() => {
        setControlsVisible(true);
        clearTimeout(hideTimerRef.current);
        if (playing) {
            hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
        }
    }, [playing]);

    const togglePlay = () => {
        const vid = videoRef.current;
        if (!vid || !ready) return;
        if (playing) {
            vid.pause();
        } else {
            vid.play();
        }
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
            // Don't capture keys when user is typing in an input/textarea
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    if (playing) {
                        vid.pause();
                    } else {
                        vid.play();
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    vid.currentTime = Math.max(0, vid.currentTime - 5);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    vid.currentTime = Math.min(vid.duration, vid.currentTime + 5);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    vid.volume = Math.min(1, vid.volume + 0.1);
                    setVolume(vid.volume);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    vid.volume = Math.max(0, vid.volume - 0.1);
                    setVolume(vid.volume);
                    break;
                case 'm':
                    setMuted(!muted);
                    break;
                case 'f':
                    toggleFullscreen();
                    break;
            }
            showControls();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
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
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className="group/player relative w-full bg-black overflow-hidden cursor-pointer select-none mx-auto"
            style={{
                aspectRatio: isFullscreen ? undefined : videoAspectRatio,
                height: isFullscreen ? '100vh' : undefined,
                maxHeight: isFullscreen ? undefined : '80vh',
            }}
            onMouseMove={showControls}
            onMouseLeave={() => playing && setControlsVisible(false)}
            onClick={(e) => {
                // Avoid toggling when clicking controls
                if ((e.target as HTMLElement).closest('[data-controls]')) return;
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
                        setReady(true);
                    } else if (vid) {
                        // WebM without duration metadata: seek to end to discover real duration
                        const onSeeked = () => {
                            vid.removeEventListener('seeked', onSeeked);
                            if (vid.currentTime > 0) {
                                setDuration(vid.currentTime);
                            }
                            vid.currentTime = 0;
                            // Wait for seek back to 0 before marking ready
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

            {/* Big center play button (shown when paused) */}
            <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${playing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                {ready ? (
                    <div className="size-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl transition-transform duration-200 hover:scale-110 active:scale-95">
                        <svg viewBox="0 0 24 24" fill="black" className="size-8 ml-1">
                            <path d="M8 5.14v14l11-7-11-7z" />
                        </svg>
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
            <div
                data-controls
                className={`absolute inset-x-0 bottom-0 transition-all duration-300 ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
            >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                <div className="relative px-4 pb-3 pt-10 space-y-2">
                    {/* Progress bar */}
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

                    {/* Bottom controls row */}
                    <div className="flex items-center justify-between gap-2 text-white">
                        {/* Left controls */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    skip(-10);
                                }}
                                className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10 active:bg-white/20"
                                title="Rewind 10s"
                            >
                                {Icons.skipBack()}
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePlay();
                                }}
                                className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
                            >
                                {playing ? Icons.pause() : Icons.play()}
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    skip(10);
                                }}
                                className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10 active:bg-white/20"
                                title="Forward 10s"
                            >
                                {Icons.skipForward()}
                            </button>

                            {/* Volume */}
                            <div className="group/vol flex items-center gap-1 ml-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMuted(!muted);
                                    }}
                                    className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                                >
                                    {muted || volume === 0 ? Icons.volumeMuted() : Icons.volumeHigh()}
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
                                {formatTime(currentTime)}
                                <span className="text-white/30 mx-1">/</span>
                                {formatTime(duration)}
                            </span>
                        </div>

                        {/* Right controls */}
                        <div className="flex items-center gap-0.5">
                            {/* Speed */}
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        cycleSpeed();
                                    }}
                                    className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-bold tabular-nums transition-colors hover:bg-white/10"
                                    title="Playback speed"
                                >
                                    {speed}x
                                </button>
                            </div>

                            {/* PiP */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePip();
                                }}
                                className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                                title="Picture-in-Picture"
                            >
                                {Icons.pip()}
                            </button>

                            {/* Fullscreen */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFullscreen();
                                }}
                                className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                            >
                                {isFullscreen ? Icons.minimize() : Icons.maximize()}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
