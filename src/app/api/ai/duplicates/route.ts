import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { AIInsightsService } from "@/services/ai";
import { z } from "zod";

const schema = z.object({
    reportId: z.string(),
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

        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Missing reportId." }, { status: 400 });
        }

        const { reportId } = parsed.data;

        // Fetch the target report
        const report = await prisma.report.findUnique({ where: { id: reportId } });
        if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

        // Fetch other recent reports from the same user (last 100)
        const candidates = await prisma.report.findMany({
            where: {
                userId: payload.userId as string,
                id: { not: reportId },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
            select: { id: true, title: true, description: true },
        });

        if (candidates.length === 0) {
            return NextResponse.json({ duplicates: [] });
        }

        const ctx = {
            title: report.title ?? undefined,
            description: report.description ?? undefined,
            transcript: report.transcript ?? undefined,
            consoleLogs: (report.consoleLogs as unknown[]) ?? [],
            networkLogs: (report.networkLogs as unknown[]) ?? [],
        };

        const service = new AIInsightsService();
        const result = await service.detectDuplicates(
            ctx,
            candidates.map(c => ({
                id: c.id,
                title: c.title ?? "Untitled",
                description: c.description ?? undefined,
            }))
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error("[AI Duplicates] Failed:", error);
        return NextResponse.json(
            { error: "Duplicate detection failed.", detail: error instanceof Error ? error.message : String(error) },
            { status: 502 },
        );
    }
}
