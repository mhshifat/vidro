import { Suspense } from "react";
import { getSeoMeta } from "@/lib/seo";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { JWTManager } from "@/lib/jwt";
import { ReportService } from "@/services/report-service";
import { Logger } from "@/lib/logger";
import { prisma } from "@/lib/db";
import { DashboardContent, DashboardSkeleton } from "@/components/modules/dashboard";
import type { UsageInfo, ReportSummary } from "@/types/dashboard";

const REPORTS_PER_PAGE = 12;

/**
 * Get current user from JWT token
 */
async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const payload = await JWTManager.verify(token);
    if (!payload?.userId) return null;

    return payload.userId;
}

/**
 * Fetch usage info for user
 */
async function getUsageInfo(userId: string): Promise<UsageInfo | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                storageUsed: true,
                storageLimit: true,
                maxReports: true,
                _count: { select: { reports: true } },
            },
        });
        if (!user) return null;

        // Recalculate actual storage from report file sizes to correct any drift
        const aggregate = await prisma.report.aggregate({
            where: { userId },
            _sum: { fileSize: true },
        });
        const actualStorageUsed = Number(aggregate._sum.fileSize ?? 0);
        const cachedStorageUsed = Number(user.storageUsed);

        if (actualStorageUsed !== cachedStorageUsed) {
            await prisma.user.update({
                where: { id: userId },
                data: { storageUsed: actualStorageUsed },
            });
        }

        const storageUsed = actualStorageUsed;
        const storageLimit = Number(user.storageLimit);
        const reportsUsed = user._count.reports;
        const reportsLimit = user.maxReports;

        return {
            storage: {
                usedBytes: storageUsed,
                limitBytes: storageLimit,
                usedMB: parseFloat((storageUsed / (1024 * 1024)).toFixed(1)),
                limitMB: parseFloat((storageLimit / (1024 * 1024)).toFixed(1)),
                remainingBytes: Math.max(0, storageLimit - storageUsed),
                percentUsed: storageLimit > 0 ? parseFloat(((storageUsed / storageLimit) * 100).toFixed(1)) : 0,
            },
            reports: {
                used: reportsUsed,
                limit: reportsLimit,
                remaining: Math.max(0, reportsLimit - reportsUsed),
            },
            perRecording: {
                maxFileSizeMB: 100,
                maxDurationSeconds: null,
                maxResolution: '1080p',
                maxFps: 60,
                codec: 'VP9 WebM',
            },
        };
    } catch {
        return null;
    }
}

/**
 * Server-side data fetching for dashboard
 */
async function DashboardData() {
    const userId = await getCurrentUser();

    if (!userId) {
        redirect("/login");
    }

    const context = Logger.createContext(userId);

    // Fetch reports and usage in parallel
    const [reportsResult, usage] = await Promise.all([
        ReportService.getReportsForUser(
            { userId, page: 1, limit: REPORTS_PER_PAGE },
            context
        ),
        getUsageInfo(userId),
    ]);

    // Serialize reports for client component (Date → string)
    const rawReports = reportsResult.data?.reports ?? [];
    const reports: ReportSummary[] = rawReports.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        type: r.type,
        videoUrl: r.videoUrl,
        imageUrl: r.imageUrl,
        storageKey: r.storageKey,
        fileSize: r.fileSize,
        consoleLogs: r.consoleLogs as unknown[] | null,
        networkLogs: r.networkLogs as unknown[] | null,
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    }));
    const page = reportsResult.data?.page ?? 1;
    const totalPages = reportsResult.data?.totalPages ?? 1;
    const total = reportsResult.data?.total ?? 0;

    return (
        <DashboardContent
            initialReports={reports}
            initialPage={page}
            initialTotalPages={totalPages}
            initialTotalReports={total}
            initialUsage={usage}
        />
    );
}


// Dashboard page component
export default function DashboardPage() {
    const meta = getSeoMeta("dashboard");
    return (
        <>
            <head>
                <title>{meta.title}</title>
                <meta name="description" content={meta.description} />
                {meta.keywords && (
                    <meta name="keywords" content={meta.keywords.join(", ")} />
                )}
                {meta.image && (
                    <meta property="og:image" content={meta.image} />
                )}
                {meta.url && (
                    <meta property="og:url" content={meta.url} />
                )}
            </head>
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardData />
            </Suspense>
        </>
    );
}
