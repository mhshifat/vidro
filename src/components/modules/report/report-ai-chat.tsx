"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

/* ─── Types ───────────────────────────────────────────────────── */

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
}

interface ReportAiChatProps {
    reportId: string;
    reportTitle: string | null;
}

/* ─── Icons ───────────────────────────────────────────────────── */

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
        </svg>
    );
}

function SendIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    );
}

function CloseIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function MinimizeIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="4 14 10 14 10 20" />
            <polyline points="20 10 14 10 14 4" />
            <line x1="14" y1="10" x2="21" y2="3" />
            <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
    );
}

function SpinnerIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`animate-spin ${className ?? ""}`}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

/* ─── Markdown-lite renderer ──────────────────────────────────── */

function renderMarkdown(text: string) {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLang = "";

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith("```")) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeLang = line.slice(3).trim();
                codeBuffer = [];
            } else {
                elements.push(
                    <div key={`code-${i}`} className="my-2 rounded-lg bg-muted/80 border overflow-hidden">
                        {codeLang && (
                            <div className="px-3 py-1 text-[10px] font-medium text-muted-foreground bg-muted border-b uppercase tracking-wider">
                                {codeLang}
                            </div>
                        )}
                        <pre className="px-3 py-2 text-xs font-mono overflow-x-auto leading-relaxed">
                            <code>{codeBuffer.join("\n")}</code>
                        </pre>
                    </div>
                );
                inCodeBlock = false;
                codeBuffer = [];
                codeLang = "";
            }
            continue;
        }

        if (inCodeBlock) {
            codeBuffer.push(line);
            continue;
        }

        if (line.trim() === "") {
            elements.push(<div key={`br-${i}`} className="h-2" />);
            continue;
        }

        let formatted: React.ReactNode = line;

        // Inline code
        const parts = line.split(/(`[^`]+`)/g);
        if (parts.length > 1) {
            formatted = parts.map((part, j) => {
                if (part.startsWith("`") && part.endsWith("`")) {
                    return (
                        <code key={j} className="px-1 py-0.5 rounded bg-muted text-xs font-mono">
                            {part.slice(1, -1)}
                        </code>
                    );
                }
                return part;
            });
        }

        // Bold
        if (typeof formatted === "string" && formatted.includes("**")) {
            const boldParts = formatted.split(/(\*\*[^*]+\*\*)/g);
            formatted = boldParts.map((part, j) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={j}>{part.slice(2, -2)}</strong>;
                }
                return part;
            });
        }

        // Headings
        if (line.startsWith("### ")) {
            elements.push(<p key={i} className="text-xs font-bold mt-2 mb-1">{line.slice(4)}</p>);
        } else if (line.startsWith("## ")) {
            elements.push(<p key={i} className="text-sm font-bold mt-2 mb-1">{line.slice(3)}</p>);
        } else if (line.startsWith("# ")) {
            elements.push(<p key={i} className="text-sm font-bold mt-2 mb-1">{line.slice(2)}</p>);
        } else if (line.startsWith("- ") || line.startsWith("* ")) {
            elements.push(
                <div key={i} className="flex gap-1.5 pl-2">
                    <span className="text-muted-foreground shrink-0 mt-0.5">•</span>
                    <span className="text-xs leading-relaxed">{typeof formatted === "string" ? formatted.slice(2) : formatted}</span>
                </div>
            );
        } else if (/^\d+\.\s/.test(line)) {
            const match = line.match(/^(\d+)\.\s(.*)/);
            if (match) {
                elements.push(
                    <div key={i} className="flex gap-1.5 pl-2">
                        <span className="text-muted-foreground shrink-0 text-xs tabular-nums mt-0.5">{match[1]}.</span>
                        <span className="text-xs leading-relaxed">{match[2]}</span>
                    </div>
                );
            }
        } else {
            elements.push(<p key={i} className="text-xs leading-relaxed">{formatted}</p>);
        }
    }

    // Handle unclosed code blocks
    if (inCodeBlock && codeBuffer.length > 0) {
        elements.push(
            <div key="code-unclosed" className="my-2 rounded-lg bg-muted/80 border overflow-hidden">
                {codeLang && (
                    <div className="px-3 py-1 text-[10px] font-medium text-muted-foreground bg-muted border-b uppercase tracking-wider">
                        {codeLang}
                    </div>
                )}
                <pre className="px-3 py-2 text-xs font-mono overflow-x-auto leading-relaxed">
                    <code>{codeBuffer.join("\n")}</code>
                </pre>
            </div>
        );
    }

    return elements;
}

/* ─── Suggested Questions ─────────────────────────────────────── */

const SUGGESTED_QUESTIONS = [
    "What errors are in the console logs?",
    "Which network requests failed and why?",
    "What's the root cause of this bug?",
    "How can I fix this issue?",
];

/* ─── Component ───────────────────────────────────────────────── */

export function ReportAiChat({ reportId, reportTitle }: ReportAiChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            const el = scrollRef.current;
            if (el) {
                const viewport = el.querySelector("[data-radix-scroll-area-viewport]");
                if (viewport) viewport.scrollTop = viewport.scrollHeight;
            }
        });
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isStreaming) return;

        const userMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            role: "user",
            content: content.trim(),
            createdAt: new Date(),
        };

        const assistantMessage: ChatMessage = {
            id: `msg_${Date.now() + 1}`,
            role: "assistant",
            content: "",
            createdAt: new Date(),
        };

        const updatedMessages = [...messages, userMessage];

        setMessages([...updatedMessages, assistantMessage]);
        setInput("");
        setIsStreaming(true);
        scrollToBottom();

        const abortController = new AbortController();
        abortRef.current = abortController;

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reportId,
                    messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
                }),
                signal: abortController.signal,
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: "Request failed" }));
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        content: `Sorry, I encountered an error: ${err.error ?? "Unknown error"}. Please try again.`,
                    };
                    return updated;
                });
                setIsStreaming(false);
                return;
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No response body");

            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                accumulated += decoder.decode(value, { stream: true });

                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        content: accumulated,
                    };
                    return updated;
                });
                scrollToBottom();
            }
        } catch (err) {
            if ((err as Error).name === "AbortError") return;

            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: "Sorry, something went wrong. Please try again.",
                };
                return updated;
            });
        } finally {
            setIsStreaming(false);
            abortRef.current = null;
        }
    }, [messages, isStreaming, reportId, scrollToBottom]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    }, [input, sendMessage]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    }, [input, sendMessage]);

    const handleStop = useCallback(() => {
        abortRef.current?.abort();
        setIsStreaming(false);
    }, []);

    return (
        <>
            {/* ── Floating Chat Bubble ───────────────────────── */}
            {!isOpen && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => setIsOpen(true)}
                                className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30 active:scale-95"
                                aria-label="Ask AI about this report"
                            >
                                <SparklesIcon className="size-6" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p className="font-medium">Ask AI about this report</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            {/* ── Chat Panel ────────────────────────────────── */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[400px] h-[560px] rounded-2xl border bg-background shadow-2xl shadow-black/10 animate-in slide-in-from-bottom-4 fade-in duration-300 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b bg-muted/30 shrink-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <SparklesIcon className="size-4" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold tracking-tight">AI Debug Assistant</h3>
                                <p className="text-[11px] text-muted-foreground truncate">
                                    Analyzing: {reportTitle ?? "Report"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={() => {
                                    setMessages([]);
                                    setInput("");
                                }}
                                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                title="Clear chat"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                title="Minimize"
                            >
                                <MinimizeIcon className="size-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <ScrollArea ref={scrollRef} className="flex-1 min-h-0">
                        <div className="p-4 space-y-4">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center gap-4 pt-6 pb-2">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <SparklesIcon className="size-6" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-sm font-semibold">Ask me anything about this bug</p>
                                        <p className="text-xs text-muted-foreground max-w-[280px]">
                                            I have access to the console logs, network requests, transcript, and all report data.
                                        </p>
                                    </div>
                                    <div className="w-full space-y-1.5 mt-2">
                                        {SUGGESTED_QUESTIONS.map((q) => (
                                            <button
                                                key={q}
                                                onClick={() => sendMessage(q)}
                                                className="w-full text-left px-3 py-2 rounded-lg border bg-background text-xs text-foreground transition-colors hover:bg-muted/60 hover:border-primary/20"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {msg.role === "assistant" && (
                                        <Avatar size="sm" className="mt-0.5 shrink-0">
                                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                                <SparklesIcon className="size-3" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div
                                        className={`max-w-[85%] rounded-xl px-3 py-2 ${
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted/60 text-foreground"
                                        }`}
                                    >
                                        {msg.role === "user" ? (
                                            <p className="text-xs leading-relaxed">{msg.content}</p>
                                        ) : msg.content ? (
                                            <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                                        ) : (
                                            <div className="flex items-center gap-2 py-1">
                                                <div className="flex gap-1">
                                                    <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                                                    <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                                                    <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                                                </div>
                                                <span className="text-[11px] text-muted-foreground">Thinking...</span>
                                            </div>
                                        )}
                                    </div>
                                    {msg.role === "user" && (
                                        <Avatar size="sm" className="mt-0.5 shrink-0">
                                            <AvatarFallback className="text-[10px]">U</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="border-t bg-background p-3 shrink-0">
                        <form onSubmit={handleSubmit} className="flex items-end gap-2">
                            <div className="flex-1 relative">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about this bug..."
                                    rows={1}
                                    disabled={isStreaming}
                                    className="w-full resize-none rounded-xl border bg-muted/40 px-3 py-2.5 text-xs leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 disabled:opacity-50 max-h-24"
                                    style={{ minHeight: "38px" }}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = "38px";
                                        target.style.height = `${Math.min(target.scrollHeight, 96)}px`;
                                    }}
                                />
                            </div>
                            {isStreaming ? (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="size-9 shrink-0 rounded-xl p-0"
                                    onClick={handleStop}
                                    title="Stop generating"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                                        <rect x="6" y="6" width="12" height="12" rx="1" />
                                    </svg>
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="size-9 shrink-0 rounded-xl p-0"
                                    disabled={!input.trim()}
                                >
                                    <SendIcon className="size-3.5" />
                                </Button>
                            )}
                        </form>
                        <p className="text-[10px] text-muted-foreground text-center mt-2">
                            AI uses report data to answer. Responses may be inaccurate.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
