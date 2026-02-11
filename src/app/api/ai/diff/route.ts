import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { AIInsightsService } from "@/services/ai";
import { z } from "zod";

const diffSchema = z.object({
    reportId1: z.string(),
    reportId2: z.string(),
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

        const parsed = diffSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid request.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const { reportId1, reportId2 } = parsed.data;

        const [report1, report2] = await Promise.all([
            prisma.report.findUnique({ where: { id: reportId1 } }),
            prisma.report.findUnique({ where: { id: reportId2 } }),
        ]);

        if (!report1 || !report2) {
            return NextResponse.json({ error: "One or both reports not found." }, { status: 404 });
        }

        const ctx1 = {
            title: report1.title ?? undefined,
            description: report1.description ?? undefined,
            transcript: report1.transcript ?? undefined,
            consoleLogs: (report1.consoleLogs as unknown[]) ?? [],
            networkLogs: (report1.networkLogs as unknown[]) ?? [],
        };

        const ctx2 = {
            title: report2.title ?? undefined,
            description: report2.description ?? undefined,
            transcript: report2.transcript ?? undefined,
            consoleLogs: (report2.consoleLogs as unknown[]) ?? [],
            networkLogs: (report2.networkLogs as unknown[]) ?? [],
        };

        const service = new AIInsightsService();
        const diff = await service.compareReports(ctx1, ctx2);

        return NextResponse.json(diff);
    } catch (error) {
        console.error("[AI Diff] Failed:", error);
        return NextResponse.json(
            { error: "Comparison failed.", detail: error instanceof Error ? error.message : String(error) },
            { status: 502 },
        );
    }
}
