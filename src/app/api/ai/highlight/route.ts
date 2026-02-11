import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { AIInsightsService } from "@/services/ai";
import { z } from "zod";

const highlightSchema = z.object({
    reportId: z.string(),
    videoDuration: z.number().positive(),
});

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
        const payload = await JWTManager.verify(token);
        if (!payload) return NextResponse.json({ error: "Session expired." }, { status: 401 });

        let body: unknown;
        try { body = await req.json(); } catch {
            return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
        }

        const parsed = highlightSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid request.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const { reportId, videoDuration } = parsed.data;

        const report = await prisma.report.findUnique({ where: { id: reportId } });
        if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

        const ctx = {
            title: report.title ?? undefined,
            description: report.description ?? undefined,
            transcript: report.transcript ?? undefined,
            consoleLogs: (report.consoleLogs as unknown[]) ?? [],
            networkLogs: (report.networkLogs as unknown[]) ?? [],
        };

        const service = new AIInsightsService();
        const highlight = await service.identifyBugMoment(ctx, videoDuration);

        // Clamp to valid range
        highlight.startTime = Math.max(0, Math.min(highlight.startTime, videoDuration));
        highlight.endTime = Math.max(highlight.startTime, Math.min(highlight.endTime, videoDuration));

        // Persist
        await prisma.report.update({
            where: { id: reportId },
            data: {
                highlightStart: highlight.startTime,
                highlightEnd: highlight.endTime,
            },
        });

        return NextResponse.json(highlight);
    } catch (error) {
        console.error("[AI Highlight] Failed:", error);
        return NextResponse.json(
            { error: "Highlight detection failed.", detail: error instanceof Error ? error.message : String(error) },
            { status: 502 },
        );
    }
}
