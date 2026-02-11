"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

/* ─── Types ────────────────────────────────────────────────────── */
export interface CommentUser {
    id: string;
    name: string | null;
    email: string;
}

export interface Comment {
    id: string;
    body: string;
    timestamp: number | null;
    reportId: string;
    userId: string;
    parentId: string | null;
    user: CommentUser;
    createdAt: string;
    updatedAt: string;
}

export interface CommentNode extends Comment {
    children: CommentNode[];
}

/** Minimal marker data exposed to the video player progress bar */
export interface CommentMarker {
    id: string;
    timestamp: number;
    body: string;
    userName: string;
}

/* ─── Icons ────────────────────────────────────────────────────── */
const Icons = {
    reply: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v6M3 10l6 6M3 10l6-6" />
        </svg>
    ),
    edit: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
    trash: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
    spinner: (
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    ),
    chevronDown: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    ),
    chevronRight: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    ),
    message: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ),
    clock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    close: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
};

/* ─── Helpers ──────────────────────────────────────────────────── */
function buildTree(comments: Comment[]): CommentNode[] {
    const map = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    for (const c of comments) {
        map.set(c.id, { ...c, children: [] });
    }

    for (const c of comments) {
        const node = map.get(c.id)!;
        if (c.parentId && map.has(c.parentId)) {
            map.get(c.parentId)!.children.push(node);
        } else {
            roots.push(node);
        }
    }

    return roots;
}

function getInitials(user: CommentUser): string {
    if (user.name) {
        return user.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }
    return user.email.charAt(0).toUpperCase();
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtTimestamp(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ─── Comment Input ────────────────────────────────────────────── */
function CommentInput({
    onSubmit,
    placeholder = "Write a comment...",
    autoFocus = false,
    onCancel,
    submitLabel = "Comment",
    videoTimestamp,
}: {
    onSubmit: (body: string, timestamp?: number) => Promise<void>;
    placeholder?: string;
    autoFocus?: boolean;
    onCancel?: () => void;
    submitLabel?: string;
    videoTimestamp?: number | null;
}) {
    const [body, setBody] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [attachTimestamp, setAttachTimestamp] = useState(true);

    // Reset attach state when timestamp changes
    useEffect(() => {
        if (videoTimestamp != null && videoTimestamp >= 0) {
            setAttachTimestamp(true);
        }
    }, [videoTimestamp]);

    const handleSubmit = async () => {
        const trimmed = body.trim();
        if (!trimmed || submitting) return;
        setSubmitting(true);
        try {
            const ts = attachTimestamp && videoTimestamp != null && videoTimestamp >= 0
                ? videoTimestamp
                : undefined;
            await onSubmit(trimmed, ts);
            setBody("");
        } finally {
            setSubmitting(false);
        }
    };

    const showTimestampBadge = videoTimestamp != null && videoTimestamp >= 0 && attachTimestamp;

    return (
        <div className="space-y-2">
            <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className="min-h-20 text-sm resize-none"
                onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleSubmit();
                    }
                    if (e.key === "Escape" && onCancel) onCancel();
                }}
            />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {showTimestampBadge && (
                        <Badge
                            variant="secondary"
                            className="text-[10px] h-5 px-1.5 gap-1 font-mono cursor-default"
                        >
                            {Icons.clock}
                            {fmtTimestamp(videoTimestamp!)}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setAttachTimestamp(false);
                                }}
                                className="ml-0.5 hover:text-destructive transition-colors"
                                title="Remove timestamp"
                            >
                                {Icons.close}
                            </button>
                        </Badge>
                    )}
                    {videoTimestamp != null && videoTimestamp >= 0 && !attachTimestamp && (
                        <button
                            onClick={() => setAttachTimestamp(true)}
                            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                            + Add timestamp ({fmtTimestamp(videoTimestamp)})
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {onCancel && (
                        <Button size="sm" variant="ghost" onClick={onCancel} disabled={submitting}>
                            Cancel
                        </Button>
                    )}
                    <Button size="sm" onClick={handleSubmit} disabled={!body.trim() || submitting}>
                        {submitting ? Icons.spinner : null}
                        {submitLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}

/* ─── Single Comment Node ──────────────────────────────────────── */
function CommentTreeNode({
    node,
    currentUserId,
    reportId,
    depth,
    onReply,
    onEdit,
    onDelete,
    onSeekTo,
}: {
    node: CommentNode;
    currentUserId: string | null;
    reportId: string;
    depth: number;
    onReply: (parentId: string, body: string) => Promise<void>;
    onEdit: (id: string, body: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onSeekTo?: (seconds: number) => void;
}) {
    const [replying, setReplying] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editBody, setEditBody] = useState(node.body);
    const [collapsed, setCollapsed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const isOwner = currentUserId === node.userId;
    const hasReplies = node.children.length > 0;

    const handleReply = async (body: string) => {
        await onReply(node.id, body);
        setReplying(false);
    };

    const handleEdit = async () => {
        const trimmed = editBody.trim();
        if (!trimmed || saving) return;
        setSaving(true);
        try {
            await onEdit(node.id, trimmed);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (deleting) return;
        setDeleting(true);
        try {
            await onDelete(node.id);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="group/comment">
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                    <Avatar size="sm">
                        <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                            {getInitials(node.user)}
                        </AvatarFallback>
                    </Avatar>
                    {hasReplies && !collapsed && (
                        <div className="w-px flex-1 bg-border mt-1" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-4">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold truncate">
                            {node.user.name || node.user.email.split("@")[0]}
                        </span>
                        {node.timestamp != null && (
                            <Badge
                                variant="outline"
                                className="text-[10px] h-4 px-1 gap-0.5 font-mono cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={() => onSeekTo?.(node.timestamp!)}
                            >
                                {Icons.clock}
                                {fmtTimestamp(node.timestamp)}
                            </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{timeAgo(node.createdAt)}</span>
                        {node.createdAt !== node.updatedAt && (
                            <span className="text-[10px] text-muted-foreground italic">(edited)</span>
                        )}
                    </div>

                    {/* Body */}
                    {editing ? (
                        <div className="space-y-2">
                            <Textarea
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                autoFocus
                                className="min-h-16 text-sm resize-none"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                        e.preventDefault();
                                        handleEdit();
                                    }
                                    if (e.key === "Escape") setEditing(false);
                                }}
                            />
                            <div className="flex items-center gap-2 justify-end">
                                <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleEdit} disabled={!editBody.trim() || saving}>
                                    {saving ? Icons.spinner : null}
                                    Save
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap overflow-wrap-anywhere">
                            {node.body}
                        </p>
                    )}

                    {/* Actions */}
                    {!editing && (
                        <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                            {currentUserId && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                    onClick={() => setReplying(!replying)}
                                >
                                    {Icons.reply}
                                    Reply
                                </Button>
                            )}
                            {isOwner && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                        onClick={() => {
                                            setEditBody(node.body);
                                            setEditing(true);
                                        }}
                                    >
                                        {Icons.edit}
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-destructive"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                    >
                                        {deleting ? Icons.spinner : Icons.trash}
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Reply input */}
                    {replying && (
                        <div className="mt-3">
                            <CommentInput
                                onSubmit={handleReply}
                                placeholder={`Reply to ${node.user.name || node.user.email.split("@")[0]}...`}
                                autoFocus
                                onCancel={() => setReplying(false)}
                                submitLabel="Reply"
                            />
                        </div>
                    )}

                    {/* Collapse toggle for replies */}
                    {hasReplies && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {collapsed ? Icons.chevronRight : Icons.chevronDown}
                            {collapsed
                                ? `Show ${node.children.length} ${node.children.length === 1 ? "reply" : "replies"}`
                                : "Hide replies"}
                        </button>
                    )}

                    {/* Nested replies */}
                    {hasReplies && !collapsed && (
                        <div className="mt-2 space-y-0 border-l border-border pl-4">
                            {node.children.map((child) => (
                                <CommentTreeNode
                                    key={child.id}
                                    node={child}
                                    currentUserId={currentUserId}
                                    reportId={reportId}
                                    depth={depth + 1}
                                    onReply={onReply}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onSeekTo={onSeekTo}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Main Comments Section ────────────────────────────────────── */
export function CommentsSection({
    reportId,
    videoTimestamp,
    onSeekTo,
    onCommentsLoaded,
}: {
    reportId: string;
    videoTimestamp?: number | null;
    onSeekTo?: (seconds: number) => void;
    onCommentsLoaded?: (comments: Comment[]) => void;
}) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const tree = buildTree(comments);
    const totalCount = comments.length;

    // Fetch current user
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/trpc/auth.me");
                if (!res.ok) return;
                const data = await res.json();
                setCurrentUserId(data?.result?.data?.id ?? null);
            } catch {
                setCurrentUserId(null);
            }
        })();
    }, []);

    // Fetch comments
    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(`/api/comments?reportId=${reportId}`);
            if (!res.ok) return;
            const data = await res.json();
            setComments(data);
            onCommentsLoaded?.(data);
        } catch {
            console.error("Failed to fetch comments");
        } finally {
            setLoading(false);
        }
    }, [reportId, onCommentsLoaded]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Create a new top-level comment
    const handleCreate = async (body: string, timestamp?: number) => {
        const res = await fetch("/api/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reportId, body, timestamp }),
        });
        if (!res.ok) throw new Error("Failed to post comment");
        await fetchComments();
    };

    // Reply to a comment
    const handleReply = async (parentId: string, body: string) => {
        const res = await fetch("/api/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reportId, body, parentId }),
        });
        if (!res.ok) throw new Error("Failed to reply");
        await fetchComments();
    };

    // Edit a comment
    const handleEdit = async (id: string, body: string) => {
        const res = await fetch(`/api/comments?id=${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body }),
        });
        if (!res.ok) throw new Error("Failed to update comment");
        await fetchComments();
    };

    // Delete a comment
    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete comment");
        await fetchComments();
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Comments</h3>
                {totalCount > 0 && (
                    <span className="text-xs text-muted-foreground">({totalCount})</span>
                )}
            </div>

            <Separator />

            {/* New comment input */}
            {currentUserId ? (
                <CommentInput
                    onSubmit={handleCreate}
                    videoTimestamp={videoTimestamp}
                />
            ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                    Log in to leave a comment.
                </p>
            )}

            {/* Comments tree */}
            {loading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                    {Icons.spinner}
                    <span className="text-sm">Loading comments...</span>
                </div>
            ) : tree.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                    <span className="opacity-30">{Icons.message}</span>
                    <p className="text-sm">No comments yet. Be the first to comment!</p>
                </div>
            ) : (
                <div className="space-y-0">
                    {tree.map((node) => (
                        <CommentTreeNode
                            key={node.id}
                            node={node}
                            currentUserId={currentUserId}
                            reportId={reportId}
                            depth={0}
                            onReply={handleReply}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onSeekTo={onSeekTo}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/** Extract comment markers for the video progress bar */
export function getCommentMarkers(comments: Comment[]): CommentMarker[] {
    return comments
        .filter((c): c is Comment & { timestamp: number } => c.timestamp != null)
        .map((c) => ({
            id: c.id,
            timestamp: c.timestamp,
            body: c.body.length > 120 ? c.body.slice(0, 120) + "\u2026" : c.body,
            userName: c.user.name || c.user.email.split("@")[0],
        }));
}
