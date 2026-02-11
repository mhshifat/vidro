'use client';

import { useState, useCallback } from "react";
import { ErrorTooltip } from "@/components/shared/error-tooltip";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardIcons } from "@/components/icons/dashboard-icons";
import {
    ReportCard,
    DashboardStats,
    DashboardUsage,
    DashboardSearch,
    DashboardEmptyState,
    DeleteReportDialog,
} from "@/components/modules/dashboard";
import type { ReportSummary, UsageInfo, PaginatedReports } from "@/types/dashboard";

const REPORTS_PER_PAGE = 12;
const Icons = DashboardIcons;

interface DashboardContentProps {
    initialReports: ReportSummary[];
    initialPage: number;
    initialTotalPages: number;
    initialTotalReports: number;
    initialUsage: UsageInfo | null;
}

export function DashboardContent({
    initialReports,
    initialPage,
    initialTotalPages,
    initialTotalReports,
    initialUsage,
}: DashboardContentProps) {
    const router = useRouter();
    const [reports, setReports] = useState<ReportSummary[]>(initialReports);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [usage, setUsage] = useState<UsageInfo | null>(initialUsage);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [totalReportsCount, setTotalReportsCount] = useState(initialTotalReports);

    // AI Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<ReportSummary[] | null>(null);
    const [searchInterpretation, setSearchInterpretation] = useState<string | null>(null);

    const [aiError, setAiError] = useState<{ message: string; correlationId?: string } | null>(null);
    const handleAISearch = useCallback(async () => {
        if (!searchQuery.trim()) {
            setSearchResults(null);
            setSearchInterpretation(null);
            return;
        }
        setSearching(true);
        try {
            const res = await fetch("/api/ai/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: searchQuery }),
            });
            if (!res.ok) {
                const correlationId = res.headers.get("x-correlation-id") || undefined;
                setAiError({ message: "AI Search failed. Please try again.", correlationId });
                throw new Error("Search failed");
            }
            const data = await res.json();
            setSearchResults(data.results);
            setSearchInterpretation(data.interpretation);
            setAiError(null);
        } catch (err) {
            // Already handled above
        } finally {
            setSearching(false);
        }
    }, [searchQuery]);

    const clearSearch = useCallback(() => {
        setSearchQuery("");
        setSearchResults(null);
        setSearchInterpretation(null);
    }, []);

    const [usageError, setUsageError] = useState<{ message: string; correlationId?: string } | null>(null);
    const fetchUsage = useCallback(async () => {
        try {
            const res = await fetch("/api/usage");
            if (res.ok) {
                setUsage(await res.json());
                setUsageError(null);
            } else {
                const correlationId = res.headers.get("x-correlation-id") || undefined;
                setUsageError({ message: "Failed to fetch usage.", correlationId });
            }
        } catch (err) {
            setUsageError({ message: "Failed to fetch usage.", correlationId: undefined });
        }
    }, []);

    const [reportsError, setReportsError] = useState<{ message: string; correlationId?: string } | null>(null);
    const fetchReports = useCallback(async (page = 1) => {
        try {
            const res = await fetch(`/api/reports?page=${page}&limit=${REPORTS_PER_PAGE}`);
            if (res.status === 401) {
                router.push("/login");
                return;
            }
            if (!res.ok) {
                const correlationId = res.headers.get("x-correlation-id") || undefined;
                setReportsError({ message: "Failed to fetch reports.", correlationId });
                throw new Error("Failed to fetch");
            }
            const data: PaginatedReports = await res.json();
            setReports(data.reports);
            setCurrentPage(data.page);
            setTotalPages(data.totalPages);
            setTotalReportsCount(data.total);
            setReportsError(null);
        } catch (err) {
            // Already handled above
        }
    }, [router]);

    const [deleteError, setDeleteError] = useState<{ message: string; correlationId?: string } | null>(null);
    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            const res = await fetch(`/api/reports?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchReports(currentPage);
                fetchUsage();
                setDeleteError(null);
            } else {
                const correlationId = res.headers.get("x-correlation-id") || undefined;
                setDeleteError({ message: "Failed to delete report.", correlationId });
            }
        } catch (err) {
            setDeleteError({ message: "Failed to delete report.", correlationId: undefined });
        } finally {
            setDeletingId(null);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch {
            // Ignore logout errors
        }
        router.push("/login");
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            fetchReports(page);
        }
    };

    const totalReports = totalReportsCount;
    const totalErrors = reports.reduce((acc, r) => {
        const logs = r.consoleLogs as { type?: string }[] | null;
        return acc + (logs?.filter(l => l.type === "error").length ?? 0);
    }, 0);
    const totalNetworkFails = reports.reduce((acc, r) => {
        const logs = r.networkLogs as { status?: number }[] | null;
        return acc + (logs?.filter(l => (l.status ?? 0) >= 400).length ?? 0);
    }, 0);

    return (
        <TooltipProvider delayDuration={200}>
            <div className="min-h-screen bg-background">
                {/* Error UI with correlation ID copy */}
                {aiError && <ErrorTooltip message={aiError.message} correlationId={aiError.correlationId} className="mb-4" />}
                {usageError && <ErrorTooltip message={usageError.message} correlationId={usageError.correlationId} className="mb-4" />}
                {reportsError && <ErrorTooltip message={reportsError.message} correlationId={reportsError.correlationId} className="mb-4" />}
                {deleteError && <ErrorTooltip message={deleteError.message} correlationId={deleteError.correlationId} className="mb-4" />}
                {/* ── Header ─────────────────────────────────────── */}
                <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg supports-backdrop-filter:bg-background/60">
                    <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                        <Link href="/" className="flex items-center gap-3 group" aria-label="Go to homepage">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                                {Icons.bug()}
                            </div>
                            <h1 className="text-base font-bold tracking-tight">Vidro</h1>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground hover:text-foreground">
                            {Icons.logout()}
                            Sign Out
                        </Button>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* ── Hero Section ────────────────────────────── */}
                    <div className="mb-8 space-y-2">
                        <h2 className="text-3xl font-black tracking-tight">Your Bug Reports</h2>
                        <p className="text-muted-foreground">
                            All your screen recordings and captured browser data in one place.
                        </p>
                    </div>

                    {/* ── AI Search ───────────────────────────────── */}
                    {reports.length > 0 && (
                        <DashboardSearch
                            searchQuery={searchQuery}
                            onSearchQueryChange={setSearchQuery}
                            searching={searching}
                            searchInterpretation={searchInterpretation}
                            onSearch={handleAISearch}
                            onClearSearch={clearSearch}
                        />
                    )}

                    {/* ── Stats Overview ──────────────────────────── */}
                    {reports.length > 0 && (
                        <DashboardStats
                            totalReports={totalReports}
                            totalErrors={totalErrors}
                            totalNetworkFails={totalNetworkFails}
                        />
                    )}

                    {/* ── Usage & Limits ──────────────────────────── */}
                    {usage && <DashboardUsage usage={usage} />}

                    {/* ── Reports Grid ────────────────────────────── */}
                    {(() => {
                        const displayReports = searchResults ?? reports;
                        if (displayReports.length === 0) {
                            return (
                                <DashboardEmptyState
                                    isSearchMode={searchResults !== null}
                                    onClearSearch={clearSearch}
                                />
                            );
                        }
                        return (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {displayReports.map((report, index) => (
                                        <ReportCard
                                            key={report.id}
                                            report={report}
                                            index={index}
                                            deletingId={deletingId}
                                            onDelete={(id) => setConfirmDeleteId(id)}
                                        />
                                    ))}
                                </div>

                                {/* ── Pagination ──────────────────────────── */}
                                {!searchResults && totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-8">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            {Icons.arrowLeft()}
                                            Previous
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(page => {
                                                    return page === 1 ||
                                                           page === totalPages ||
                                                           Math.abs(page - currentPage) <= 1;
                                                })
                                                .map((page, idx, arr) => {
                                                    const showEllipsisBefore = idx > 0 && arr[idx - 1] !== page - 1;
                                                    return (
                                                        <span key={page} className="flex items-center gap-1">
                                                            {showEllipsisBefore && (
                                                                <span className="px-2 text-muted-foreground">...</span>
                                                            )}
                                                            <Button
                                                                variant={page === currentPage ? "default" : "ghost"}
                                                                size="sm"
                                                                className="w-9 h-9"
                                                                onClick={() => handlePageChange(page)}
                                                            >
                                                                {page}
                                                            </Button>
                                                        </span>
                                                    );
                                                })}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                            {Icons.arrowRight()}
                                        </Button>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </main>
            </div>

            {/* ── Delete Confirmation Dialog ──────────────── */}
            <DeleteReportDialog
                open={!!confirmDeleteId}
                onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
                onConfirm={async () => {
                    if (!confirmDeleteId) return;
                    await handleDelete(confirmDeleteId);
                    setConfirmDeleteId(null);
                }}
                deleting={!!deletingId}
            />
        </TooltipProvider>
    );
}
