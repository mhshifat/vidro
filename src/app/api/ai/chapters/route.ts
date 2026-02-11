import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AIInsightsService } from "@/services/ai/ai-insights";

export async function POST(req: NextRequest) {
    try {
        const { reportId, videoDuration } = await req.json();
        if (!reportId || !videoDuration) {
            return NextResponse.json({ error: "reportId and videoDuration required" }, { status: 400 });
        }

        const report = await prisma.report.findUnique({ where: { id: reportId } });
        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        const ai = new AIInsightsService();
        const consoleLogs = Array.isArray(report.consoleLogs) 
            ? (report.consoleLogs as unknown[]).slice(0, 50) 
            : undefined;
        const networkLogs = Array.isArray(report.networkLogs) 
            ? (report.networkLogs as unknown[]).slice(0, 50) 
            : undefined;
        const result = await ai.generateChapters(
            {
                title: report.title ?? "Untitled",
                description: report.description ?? "",
                consoleLogs,
                networkLogs,
            },
            videoDuration
        );

        return NextResponse.json(result);
    } catch (err: unknown) {
        console.error("AI chapters error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to generate chapters" },
            { status: 500 }
        );
    }
}
