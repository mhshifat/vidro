import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { prisma } from "@/lib/db";

/**
 * GET /api/usage
 *
 * Returns the authenticated user's storage usage, limits,
 * and per-recording constraints so the client can display
 * them in the dashboard and extension popup.
 */
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        const payload = await JWTManager.verify(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const userId = payload.userId as string;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                storageUsed: true,
                storageLimit: true,
                maxReports: true,
                _count: { select: { reports: true } },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

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

        return NextResponse.json({
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
        });
    } catch (error) {
        console.error("Failed to fetch usage:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
