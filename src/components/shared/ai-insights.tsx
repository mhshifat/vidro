"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

/* ─── Types ────────────────────────────────────────────────────── */

interface DuplicateCandidate {
    reportId: string;
    title: string;
    similarity: number;
    reasoning: string;
}

export interface AIInsightsData {
    severity?: string | null;
    priority?: string | null;
    tags?: string[] | null;
    reproSteps?: string | null;
    rootCause?: string | null;
    logSummary?: string | null;
    stakeholderSummary?: string | null;
    suggestedFix?: string | null;
}

type InsightType =
    | "severity"
    | "repro-steps"
    | "root-cause"
    | "auto-tag"
    | "log-summary"
    | "stakeholder-summary"
    | "suggested-fix";

/* ─── Icons ────────────────────────────────────────────────────── */

const AIIcons = {
    sparkles: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    ),
    severity: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
    ),
    steps: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    ),
    rootCause: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    tag: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
    ),
    logs: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    stakeholder: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
    ),
    fix: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.58 5.58a1.5 1.5 0 01-2.12-2.12l5.58-5.58m0 0l-2.99-2.99a1.5 1.5 0 010-2.12l.88-.88a1.5 1.5 0 012.12 0l2.99 2.99m-5 0l7.07-7.07a1.5 1.5 0 012.12 0l.88.88a1.5 1.5 0 010 2.12L11.42 15.17z" />
        </svg>
    ),
    duplicate: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
        </svg>
    ),
    spinner: (
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    ),
    runAll: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
    ),
};

/* ─── Helpers ──────────────────────────────────────────────────── */

function severityColor(severity?: string | null): string {
    switch (severity) {
        case "critical": return "bg-red-500/15 text-red-600 border-red-500/20";
        case "high": return "bg-orange-500/15 text-orange-600 border-orange-500/20";
        case "medium": return "bg-amber-500/15 text-amber-600 border-amber-500/20";
        case "low": return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20";
        default: return "bg-muted text-muted-foreground";
    }
}

function priorityColor(priority?: string | null): string {
    switch (priority) {
        case "p0": return "bg-red-500/15 text-red-600 border-red-500/20";
        case "p1": return "bg-orange-500/15 text-orange-600 border-orange-500/20";
        case "p2": return "bg-amber-500/15 text-amber-600 border-amber-500/20";
        case "p3": return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20";
        default: return "bg-muted text-muted-foreground";
    }
}

const TAG_COLORS: Record<string, string> = {
    UI: "bg-blue-500/15 text-blue-600 border-blue-500/20",
    Performance: "bg-purple-500/15 text-purple-600 border-purple-500/20",
    Crash: "bg-red-500/15 text-red-600 border-red-500/20",
    Auth: "bg-amber-500/15 text-amber-600 border-amber-500/20",
    API: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
    Network: "bg-cyan-500/15 text-cyan-600 border-cyan-500/20",
    Database: "bg-indigo-500/15 text-indigo-600 border-indigo-500/20",
    Security: "bg-rose-500/15 text-rose-600 border-rose-500/20",
    UX: "bg-pink-500/15 text-pink-600 border-pink-500/20",
    Accessibility: "bg-violet-500/15 text-violet-600 border-violet-500/20",
    Mobile: "bg-teal-500/15 text-teal-600 border-teal-500/20",
    Desktop: "bg-slate-500/15 text-slate-600 border-slate-500/20",
    Browser: "bg-sky-500/15 text-sky-600 border-sky-500/20",
    Validation: "bg-orange-500/15 text-orange-600 border-orange-500/20",
    "State Management": "bg-fuchsia-500/15 text-fuchsia-600 border-fuchsia-500/20",
    Routing: "bg-lime-500/15 text-lime-600 border-lime-500/20",
    Layout: "bg-blue-500/15 text-blue-600 border-blue-500/20",
    Animation: "bg-pink-500/15 text-pink-600 border-pink-500/20",
    "Data Loss": "bg-red-500/15 text-red-600 border-red-500/20",
    Integration: "bg-indigo-500/15 text-indigo-600 border-indigo-500/20",
};

/** Render markdown-like text with basic formatting */
function RenderMarkdown({ text }: { text: string }) {
    const lines = text.split("\n");
    return (
        <div className="space-y-1.5 text-sm text-foreground/80 leading-relaxed">
            {lines.map((line, i) => {
                // Bold headers
                if (line.match(/^\*\*.*\*\*$/)) {
                    return <p key={i} className="font-semibold text-foreground mt-3 first:mt-0">{line.replace(/\*\*/g, "")}</p>;
                }
                // Bold inline
                const parts = line.split(/(\*\*[^*]+\*\*)/g);
                return (
                    <p key={i}>
                        {parts.map((part, j) =>
                            part.startsWith("**") && part.endsWith("**")
                                ? <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
                                : <span key={j}>{part}</span>
                        )}
                    </p>
                );
            })}
        </div>
    );
}

/* ─── Insight Button ───────────────────────────────────────────── */

function InsightButton({
    label,
    icon,
    loading,
    hasData,
    onClick,
    tooltip,
}: {
    label: string;
    icon: React.ReactNode;
    loading: boolean;
    hasData: boolean;
    onClick: () => void;
    tooltip: string;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size="sm"
                    variant={hasData ? "secondary" : "outline"}
                    onClick={onClick}
                    disabled={loading}
                    className="gap-1.5 text-xs h-8 transition-all"
                >
                    {loading ? AIIcons.spinner : icon}
                    {label}
                    {hasData && (
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
    );
}

/* ─── Collapsible Section ──────────────────────────────────────── */

function InsightSection({
    title,
    icon,
    children,
    className,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`border rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 ${className ?? ""}`}>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b">
                <span className="text-muted-foreground">{icon}</span>
                <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
            </div>
            <div className="px-4 py-3">
                {children}
            </div>
        </div>
    );
}

/* ─── Main Component ───────────────────────────────────────────── */

export function AIInsightsPanel({
    reportId,
    insights,
    onInsightsUpdate,
}: {
    reportId: string;
    insights: AIInsightsData;
    onInsightsUpdate: (updated: Partial<AIInsightsData>) => void;
}) {
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
    const [loadingDuplicates, setLoadingDuplicates] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [runAllLoading, setRunAllLoading] = useState(false);

    const runInsight = useCallback(async (type: InsightType) => {
        setLoadingMap(prev => ({ ...prev, [type]: true }));
        setError(null);
        try {
            const res = await fetch("/api/ai/insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reportId, type }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || err.error || "Analysis failed");
            }
            const data = await res.json();
            // Map response to insight fields
            switch (type) {
                case "severity":
                    onInsightsUpdate({ severity: data.severity, priority: data.priority });
                    break;
                case "repro-steps":
                    onInsightsUpdate({ reproSteps: data.steps });
                    break;
                case "root-cause":
                    onInsightsUpdate({ rootCause: data.analysis });
                    break;
                case "auto-tag":
                    onInsightsUpdate({ tags: data.tags });
                    break;
                case "log-summary":
                    onInsightsUpdate({ logSummary: data.summary });
                    break;
                case "stakeholder-summary":
                    onInsightsUpdate({ stakeholderSummary: data.summary });
                    break;
                case "suggested-fix":
                    onInsightsUpdate({ suggestedFix: data.suggestion });
                    break;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Analysis failed");
        } finally {
            setLoadingMap(prev => ({ ...prev, [type]: false }));
        }
    }, [reportId, onInsightsUpdate]);

    const runDuplicateCheck = useCallback(async () => {
        setLoadingDuplicates(true);
        setError(null);
        try {
            const res = await fetch("/api/ai/duplicates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reportId }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || err.error || "Duplicate detection failed");
            }
            const data = await res.json();
            setDuplicates(data.duplicates || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Duplicate detection failed");
        } finally {
            setLoadingDuplicates(false);
        }
    }, [reportId]);

    const runAll = useCallback(async () => {
        setRunAllLoading(true);
        setError(null);
        const types: InsightType[] = [
            "severity",
            "auto-tag",
            "repro-steps",
            "root-cause",
            "log-summary",
            "stakeholder-summary",
            "suggested-fix",
        ];
        // Run sequentially to avoid rate limiting
        for (const type of types) {
            await runInsight(type);
        }
        await runDuplicateCheck();
        setRunAllLoading(false);
    }, [runInsight, runDuplicateCheck]);

    const hasAnyInsight = !!(
        insights.severity ||
        insights.tags ||
        insights.reproSteps ||
        insights.rootCause ||
        insights.logSummary ||
        insights.stakeholderSummary ||
        insights.suggestedFix ||
        duplicates.length > 0
    );

    return (
        <Card className="lg:col-span-12 py-0 overflow-hidden">
            <CardHeader className="pb-0 pt-4 px-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-primary">{AIIcons.sparkles}</span>
                        <CardTitle className="text-sm font-bold tracking-tight">AI Insights</CardTitle>
                        {hasAnyInsight && (
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">Active</Badge>
                        )}
                    </div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="default"
                                onClick={runAll}
                                disabled={runAllLoading || Object.values(loadingMap).some(Boolean)}
                                className="gap-1.5 text-xs h-8"
                            >
                                {runAllLoading ? AIIcons.spinner : AIIcons.runAll}
                                Run All
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Run all AI analyses sequentially</TooltipContent>
                    </Tooltip>
                </div>
            </CardHeader>

            <CardContent className="px-5 pt-3 pb-5 space-y-4">
                {/* ── Action Buttons ──────────────────────────────── */}
                <div className="flex flex-wrap gap-2">
                    <InsightButton
                        label="Severity"
                        icon={AIIcons.severity}
                        loading={!!loadingMap["severity"]}
                        hasData={!!insights.severity}
                        onClick={() => runInsight("severity")}
                        tooltip="Classify bug severity & priority"
                    />
                    <InsightButton
                        label="Tags"
                        icon={AIIcons.tag}
                        loading={!!loadingMap["auto-tag"]}
                        hasData={!!(insights.tags && insights.tags.length > 0)}
                        onClick={() => runInsight("auto-tag")}
                        tooltip="Auto-tag the bug category"
                    />
                    <InsightButton
                        label="Repro Steps"
                        icon={AIIcons.steps}
                        loading={!!loadingMap["repro-steps"]}
                        hasData={!!insights.reproSteps}
                        onClick={() => runInsight("repro-steps")}
                        tooltip="Generate reproduction steps"
                    />
                    <InsightButton
                        label="Root Cause"
                        icon={AIIcons.rootCause}
                        loading={!!loadingMap["root-cause"]}
                        hasData={!!insights.rootCause}
                        onClick={() => runInsight("root-cause")}
                        tooltip="Analyze probable root cause"
                    />
                    <InsightButton
                        label="Log Summary"
                        icon={AIIcons.logs}
                        loading={!!loadingMap["log-summary"]}
                        hasData={!!insights.logSummary}
                        onClick={() => runInsight("log-summary")}
                        tooltip="Summarize console & network logs"
                    />
                    <InsightButton
                        label="Stakeholder"
                        icon={AIIcons.stakeholder}
                        loading={!!loadingMap["stakeholder-summary"]}
                        hasData={!!insights.stakeholderSummary}
                        onClick={() => runInsight("stakeholder-summary")}
                        tooltip="Non-technical summary for stakeholders"
                    />
                    <InsightButton
                        label="Suggest Fix"
                        icon={AIIcons.fix}
                        loading={!!loadingMap["suggested-fix"]}
                        hasData={!!insights.suggestedFix}
                        onClick={() => runInsight("suggested-fix")}
                        tooltip="AI-suggested fix & debugging steps"
                    />
                    <InsightButton
                        label="Duplicates"
                        icon={AIIcons.duplicate}
                        loading={loadingDuplicates}
                        hasData={duplicates.length > 0}
                        onClick={runDuplicateCheck}
                        tooltip="Detect duplicate reports"
                    />
                </div>

                {/* ── Error ─────────────────────────────────────── */}
                {error && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive animate-in fade-in duration-200">
                        {error}
                    </div>
                )}

                {/* ── Results ──────────────────────────────────── */}
                {hasAnyInsight && (
                    <div className="space-y-3">
                        <Separator />

                        {/* Severity & Priority */}
                        {insights.severity && (
                            <div className="flex items-center gap-3 animate-in fade-in duration-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground font-medium">Severity:</span>
                                    <Badge className={`text-xs font-bold uppercase ${severityColor(insights.severity)}`}>
                                        {insights.severity}
                                    </Badge>
                                </div>
                                {insights.priority && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground font-medium">Priority:</span>
                                        <Badge className={`text-xs font-bold uppercase ${priorityColor(insights.priority)}`}>
                                            {insights.priority}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tags */}
                        {insights.tags && insights.tags.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap animate-in fade-in duration-200">
                                <span className="text-xs text-muted-foreground font-medium">Tags:</span>
                                {insights.tags.map(tag => (
                                    <Badge key={tag} className={`text-xs ${TAG_COLORS[tag] || "bg-muted text-muted-foreground"}`}>
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Repro Steps */}
                        {insights.reproSteps && (
                            <InsightSection title="Reproduction Steps" icon={AIIcons.steps}>
                                <ScrollArea className="max-h-60">
                                    <RenderMarkdown text={insights.reproSteps} />
                                </ScrollArea>
                            </InsightSection>
                        )}

                        {/* Root Cause */}
                        {insights.rootCause && (
                            <InsightSection title="Root Cause Analysis" icon={AIIcons.rootCause}>
                                <ScrollArea className="max-h-60">
                                    <RenderMarkdown text={insights.rootCause} />
                                </ScrollArea>
                            </InsightSection>
                        )}

                        {/* Log Summary */}
                        {insights.logSummary && (
                            <InsightSection title="Log Summary" icon={AIIcons.logs}>
                                <ScrollArea className="max-h-60">
                                    <RenderMarkdown text={insights.logSummary} />
                                </ScrollArea>
                            </InsightSection>
                        )}

                        {/* Stakeholder Summary */}
                        {insights.stakeholderSummary && (
                            <InsightSection title="Stakeholder Summary" icon={AIIcons.stakeholder}>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    {insights.stakeholderSummary}
                                </p>
                            </InsightSection>
                        )}

                        {/* Suggested Fix */}
                        {insights.suggestedFix && (
                            <InsightSection title="Suggested Fix" icon={AIIcons.fix}>
                                <ScrollArea className="max-h-60">
                                    <RenderMarkdown text={insights.suggestedFix} />
                                </ScrollArea>
                            </InsightSection>
                        )}

                        {/* Duplicates */}
                        {duplicates.length > 0 && (
                            <InsightSection title="Potential Duplicates" icon={AIIcons.duplicate}>
                                <div className="space-y-2">
                                    {duplicates.map((dup) => (
                                        <div
                                            key={dup.reportId}
                                            className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer"
                                            onClick={() => window.open(`/report/${dup.reportId}`, "_blank")}
                                        >
                                            <Badge className={`text-xs font-bold shrink-0 ${dup.similarity >= 80 ? "bg-red-500/15 text-red-600" : "bg-amber-500/15 text-amber-600"}`}>
                                                {dup.similarity}%
                                            </Badge>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{dup.title}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{dup.reasoning}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </InsightSection>
                        )}
                    </div>
                )}

                {/* ── Empty State ──────────────────────────────── */}
                {!hasAnyInsight && !error && !Object.values(loadingMap).some(Boolean) && !loadingDuplicates && (
                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-2">
                        <span className="opacity-40">{AIIcons.sparkles}</span>
                        <p className="text-xs">Click any button above or &quot;Run All&quot; to generate AI insights</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
