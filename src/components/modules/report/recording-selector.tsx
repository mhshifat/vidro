'use client';

import { Badge } from '@/components/ui/badge';
import type { RecordingPayload } from '@/types/report';

interface RecordingSelectorProps {
    recordings: RecordingPayload[];
    activeId: string;
    onSelect: (rec: RecordingPayload) => void;
    onDiscard: (id: string) => void;
}

export function RecordingSelector({ recordings, activeId, onSelect, onDiscard }: RecordingSelectorProps) {
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
                        const time = new Date(rec.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        });
                        return (
                            <button
                                key={rec.id}
                                onClick={() => onSelect(rec)}
                                className={`group relative flex items-center gap-3 shrink-0 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                                    isActive
                                        ? 'border-primary/40 bg-primary/5 shadow-sm shadow-primary/10'
                                        : 'border-border bg-background hover:border-border/80 hover:bg-muted/50'
                                }`}
                            >
                                {/* Thumbnail dot */}
                                <div
                                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                                        <path d="M8 5.14v14l11-7-11-7z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {time}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/60">
                                        {rec.consoleLogs?.length ?? 0} logs · {rec.networkLogs?.length ?? 0} requests
                                    </p>
                                </div>
                                {/* Discard button */}
                                <span
                                    role="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDiscard(rec.id);
                                    }}
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
