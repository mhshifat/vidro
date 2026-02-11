import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { AIInsightsService } from "@/services/ai";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
        const payload = await JWTManager.verify(token);
        if (!payload) return NextResponse.json({ error: "Session expired." }, { status: 401 });

        // Fetch reports from the last 7 days for this user
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const reports = await prisma.report.findMany({
            where: {
                userId: payload.userId as string,
                createdAt: { gte: oneWeekAgo },
            },
            select: {
                title: true,
                severity: true,
                tags: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        const mapped = reports.map(r => ({
            title: r.title ?? "Untitled",
            severity: r.severity ?? undefined,
            tags: Array.isArray(r.tags) ? (r.tags as string[]) : undefined,
            createdAt: r.createdAt.toISOString(),
        }));

        const service = new AIInsightsService();
        const digest = await service.generateWeeklyDigest(mapped);

        return NextResponse.json(digest);
    } catch (error) {
        console.error("[AI Digest] Failed:", error);
        return NextResponse.json(
            { error: "Digest generation failed.", detail: error instanceof Error ? error.message : String(error) },
            { status: 502 },
        );
    }
}
