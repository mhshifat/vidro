"use client";
import { useState, useRef, useCallback, useEffect } from "react";

export interface VideoAnnotation {
    id: string;
    timestamp: number; // seconds in video
    type: "arrow" | "circle" | "text" | "rectangle";
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    width?: number;
    height?: number;
    text?: string;
    color: string;
    endX?: number;
    endY?: number;
}

interface VideoAnnotationOverlayProps {
    annotations: VideoAnnotation[];
    currentTime: number;
    onAddAnnotation: (annotation: VideoAnnotation) => void;
    onDeleteAnnotation: (id: string) => void;
    isEditing: boolean;
    activeTool: "arrow" | "circle" | "text" | "rectangle" | null;
    activeColor: string;
}

function generateId() {
    return Math.random().toString(36).slice(2, 10);
}

export function VideoAnnotationOverlay({
    annotations,
    currentTime,
    onAddAnnotation,
    onDeleteAnnotation,
    isEditing,
    activeTool,
    activeColor,
}: VideoAnnotationOverlayProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [drawing, setDrawing] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
    const [textInput, setTextInput] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
    const [textValue, setTextValue] = useState("");

    // Show annotations within ±0.5s of current time
    const visibleAnnotations = annotations.filter(
        a => Math.abs(a.timestamp - currentTime) < 0.5
    );

    const getRelativePos = useCallback((e: React.MouseEvent) => {
        const rect = overlayRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        };
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!isEditing || !activeTool) return;
        e.preventDefault();
        e.stopPropagation();

        const pos = getRelativePos(e);

        if (activeTool === "text") {
            setTextInput({ x: pos.x, y: pos.y, visible: true });
            setTextValue("");
            return;
        }

        setStartPos(pos);
        setCurrentPos(pos);
        setDrawing(true);
    }, [isEditing, activeTool, getRelativePos]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!drawing) return;
        setCurrentPos(getRelativePos(e));
    }, [drawing, getRelativePos]);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        if (!drawing || !startPos || !activeTool) return;
        e.preventDefault();
        e.stopPropagation();

        const endPos = getRelativePos(e);

        if (activeTool === "arrow") {
            onAddAnnotation({
                id: generateId(),
                timestamp: currentTime,
                type: "arrow",
                x: startPos.x,
                y: startPos.y,
                endX: endPos.x,
                endY: endPos.y,
                color: activeColor,
            });
        } else if (activeTool === "circle") {
            const cx = (startPos.x + endPos.x) / 2;
            const cy = (startPos.y + endPos.y) / 2;
            const rx = Math.abs(endPos.x - startPos.x);
            const ry = Math.abs(endPos.y - startPos.y);
            onAddAnnotation({
                id: generateId(),
                timestamp: currentTime,
                type: "circle",
                x: cx,
                y: cy,
                width: rx,
                height: ry,
                color: activeColor,
            });
        } else if (activeTool === "rectangle") {
            onAddAnnotation({
                id: generateId(),
                timestamp: currentTime,
                type: "rectangle",
                x: Math.min(startPos.x, endPos.x),
                y: Math.min(startPos.y, endPos.y),
                width: Math.abs(endPos.x - startPos.x),
                height: Math.abs(endPos.y - startPos.y),
                color: activeColor,
            });
        }

        setDrawing(false);
        setStartPos(null);
        setCurrentPos(null);
    }, [drawing, startPos, activeTool, getRelativePos, currentTime, activeColor, onAddAnnotation]);

    const handleTextSubmit = useCallback(() => {
        if (!textValue.trim()) {
            setTextInput({ x: 0, y: 0, visible: false });
            return;
        }
        onAddAnnotation({
            id: generateId(),
            timestamp: currentTime,
            type: "text",
            x: textInput.x,
            y: textInput.y,
            text: textValue.trim(),
            color: activeColor,
        });
        setTextInput({ x: 0, y: 0, visible: false });
        setTextValue("");
    }, [textValue, textInput, currentTime, activeColor, onAddAnnotation]);

    return (
        <div
            ref={overlayRef}
            className={`absolute inset-0 ${isEditing ? "cursor-crosshair z-20" : "pointer-events-none z-10"}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: isEditing ? 'none' : 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                {visibleAnnotations.map(a => {
                    switch (a.type) {
                        case "arrow":
                            return (
                                <g key={a.id}>
                                    <defs>
                                        <marker id={`arrowhead-${a.id}`} markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                                            <polygon points="0 0, 10 3.5, 0 7" fill={a.color} />
                                        </marker>
                                    </defs>
                                    {/* Invisible thick hit area for clicking */}
                                    {isEditing && (
                                        <line
                                            x1={a.x} y1={a.y} x2={a.endX} y2={a.endY}
                                            stroke="transparent" strokeWidth="2"
                                            style={{ pointerEvents: activeTool === 'text' ? 'none' : 'stroke', cursor: 'default' }}
                                            onClick={(e) => e.stopPropagation()}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onMouseUp={(e) => e.stopPropagation()}
                                        />
                                    )}
                                    <line
                                        x1={a.x} y1={a.y} x2={a.endX} y2={a.endY}
                                        stroke={a.color} strokeWidth="0.4"
                                        markerEnd={`url(#arrowhead-${a.id})`}
                                        style={{ pointerEvents: 'none' }}
                                    />
                                </g>
                            );
                        case "circle":
                            return (
                                <g key={a.id}>
                                    {isEditing && (
                                        <ellipse
                                            cx={a.x} cy={a.y}
                                            rx={(a.width || 5) / 2} ry={(a.height || 5) / 2}
                                            stroke="transparent" strokeWidth="2" fill="transparent"
                                            style={{ pointerEvents: activeTool === 'text' ? 'none' : 'all', cursor: 'default' }}
                                            onClick={(e) => e.stopPropagation()}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onMouseUp={(e) => e.stopPropagation()}
                                        />
                                    )}
                                    <ellipse
                                        cx={a.x} cy={a.y}
                                        rx={(a.width || 5) / 2} ry={(a.height || 5) / 2}
                                        stroke={a.color} strokeWidth="0.3" fill="none"
                                        style={{ pointerEvents: 'none' }}
                                    />
                                </g>
                            );
                        case "rectangle":
                            return (
                                <g key={a.id}>
                                    {isEditing && (
                                        <rect
                                            x={a.x} y={a.y}
                                            width={a.width || 10} height={a.height || 10}
                                            stroke="transparent" strokeWidth="2" fill="transparent"
                                            style={{ pointerEvents: activeTool === 'text' ? 'none' : 'all', cursor: 'default' }}
                                            onClick={(e) => e.stopPropagation()}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onMouseUp={(e) => e.stopPropagation()}
                                        />
                                    )}
                                    <rect
                                        x={a.x} y={a.y}
                                        width={a.width || 10} height={a.height || 10}
                                        stroke={a.color} strokeWidth="0.3" fill="none"
                                        style={{ pointerEvents: 'none' }}
                                    />
                                </g>
                            );
                        default:
                            return null;
                    }
                })}                {/* Live preview while drawing */}
                {drawing && startPos && currentPos && activeTool === "arrow" && (
                    <g>
                        <defs>
                            <marker id="arrowhead-preview" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill={activeColor} opacity="0.6" />
                            </marker>
                        </defs>
                        <line
                            x1={startPos.x} y1={startPos.y} x2={currentPos.x} y2={currentPos.y}
                            stroke={activeColor} strokeWidth="0.4" opacity="0.6"
                            strokeDasharray="0.8 0.4"
                            markerEnd="url(#arrowhead-preview)"
                        />
                    </g>
                )}
                {drawing && startPos && currentPos && activeTool === "circle" && (
                    <ellipse
                        cx={(startPos.x + currentPos.x) / 2}
                        cy={(startPos.y + currentPos.y) / 2}
                        rx={Math.abs(currentPos.x - startPos.x) / 2}
                        ry={Math.abs(currentPos.y - startPos.y) / 2}
                        stroke={activeColor} strokeWidth="0.3" fill="none" opacity="0.6"
                        strokeDasharray="0.8 0.4"
                    />
                )}
                {drawing && startPos && currentPos && activeTool === "rectangle" && (
                    <rect
                        x={Math.min(startPos.x, currentPos.x)}
                        y={Math.min(startPos.y, currentPos.y)}
                        width={Math.abs(currentPos.x - startPos.x)}
                        height={Math.abs(currentPos.y - startPos.y)}
                        stroke={activeColor} strokeWidth="0.3" fill="none" opacity="0.6"
                        strokeDasharray="0.8 0.4"
                    />
                )}            </svg>

            {/* Text annotations */}
            {visibleAnnotations.filter(a => a.type === "text").map(a => (
                <div
                    key={a.id}
                    className="absolute text-xs font-bold px-1.5 py-0.5 rounded shadow-sm pointer-events-auto"
                    style={{
                        left: `${a.x}%`,
                        top: `${a.y}%`,
                        color: "white",
                        backgroundColor: a.color,
                        transform: "translate(-50%, -50%)",
                        whiteSpace: "nowrap",
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                >
                    {a.text}
                </div>
            ))}

            {/* Delete buttons when editing */}
            {isEditing && visibleAnnotations.map(a => (
                <button
                    key={`del-${a.id}`}
                    className="absolute w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center pointer-events-auto hover:bg-red-600 hover:scale-110 transition-transform z-30 shadow-md"
                    style={{
                        left: `${a.x}%`,
                        top: `${Math.max(0, a.y - 4)}%`,
                        transform: "translate(-50%, -50%)",
                    }}
                    onClick={(e) => { e.stopPropagation(); onDeleteAnnotation(a.id); }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    title="Delete annotation"
                >
                    ×
                </button>
            ))}

            {/* Inline text input */}
            {textInput.visible && (
                <div
                    className="absolute z-30"
                    style={{ left: `${textInput.x}%`, top: `${textInput.y}%`, transform: "translate(-50%, -50%)" }}
                    onClick={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
                >
                    <input
                        autoFocus
                        type="text"
                        value={textValue}
                        onChange={e => setTextValue(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleTextSubmit(); if (e.key === "Escape") setTextInput({ x: 0, y: 0, visible: false }); }}
                        onBlur={handleTextSubmit}
                        className="bg-background border rounded px-2 py-1 text-xs shadow-lg min-w-[100px]"
                        placeholder="Type annotation..."
                    />
                </div>
            )}
        </div>
    );
}

/* ─── Annotation Toolbar ─────────────────────────────── */
const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];
const TOOLS: { tool: VideoAnnotation["type"]; icon: string; label: string }[] = [
    { tool: "arrow", icon: "↗", label: "Arrow" },
    { tool: "circle", icon: "○", label: "Circle" },
    { tool: "rectangle", icon: "□", label: "Rectangle" },
    { tool: "text", icon: "T", label: "Text" },
];

export function AnnotationToolbar({
    isEditing,
    onToggleEditing,
    activeTool,
    onSetTool,
    activeColor,
    onSetColor,
    annotationCount,
    onUndo,
    onRedo,
    onClearAll,
    canUndo = false,
    canRedo = false,
}: {
    isEditing: boolean;
    onToggleEditing: () => void;
    activeTool: VideoAnnotation["type"] | null;
    onSetTool: (tool: VideoAnnotation["type"] | null) => void;
    activeColor: string;
    onSetColor: (color: string) => void;
    annotationCount: number;
    onUndo?: () => void;
    onRedo?: () => void;
    onClearAll?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
}) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <button
                onClick={onToggleEditing}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    isEditing
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:bg-accent"
                }`}
            >
                {isEditing ? "✓ Done Annotating" : `✏ Annotate ${annotationCount > 0 ? `(${annotationCount})` : ""}`}
            </button>

            {isEditing && (
                <>
                    <div className="flex gap-0.5 border rounded-lg p-0.5">
                        {TOOLS.map(t => (
                            <button
                                key={t.tool}
                                onClick={() => onSetTool(activeTool === t.tool ? null : t.tool)}
                                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                    activeTool === t.tool
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-accent text-muted-foreground"
                                }`}
                                title={t.label}
                            >
                                {t.icon}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-1">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                onClick={() => onSetColor(c)}
                                className={`w-5 h-5 rounded-full border-2 transition-transform ${
                                    activeColor === c ? "border-foreground scale-125" : "border-transparent"
                                }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex gap-0.5 border rounded-lg p-0.5">
                        <button
                            onClick={onUndo}
                            disabled={!canUndo}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                canUndo ? "hover:bg-accent text-muted-foreground" : "text-muted-foreground/30 cursor-not-allowed"
                            }`}
                            title="Undo (Ctrl+Z)"
                        >
                            ↩
                        </button>
                        <button
                            onClick={onRedo}
                            disabled={!canRedo}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                canRedo ? "hover:bg-accent text-muted-foreground" : "text-muted-foreground/30 cursor-not-allowed"
                            }`}
                            title="Redo (Ctrl+Y)"
                        >
                            ↪
                        </button>
                    </div>
                    {annotationCount > 0 && (
                        <>
                            <div className="h-4 w-px bg-border" />
                            <button
                                onClick={onClearAll}
                                className="px-2 py-1 text-xs rounded-md transition-colors text-red-500 hover:bg-red-500/10 border border-red-500/20"
                                title="Clear all annotations"
                            >
                                🗑 Clear All
                            </button>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
