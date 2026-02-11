import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { AIInsightsService } from "@/services/ai";
import { z } from "zod";

const assignSchema = z.object({
    reportId: z.string(),
    teamMembers: z.array(z.object({
        name: z.string(),
        expertise: z.array(z.string()),
    })).min(1),
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

        const parsed = assignSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid request.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const { reportId, teamMembers } = parsed.data;

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
        const assignment = await service.suggestAssignment(ctx, teamMembers);

        return NextResponse.json(assignment);
    } catch (error) {
        console.error("[AI Assign] Failed:", error);
        return NextResponse.json(
            { error: "Assignment suggestion failed.", detail: error instanceof Error ? error.message : String(error) },
            { status: 502 },
        );
    }
}
