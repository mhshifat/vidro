import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { AIInsightsService } from "@/services/ai";
import { z } from "zod";

const schema = z.object({
    reportId: z.string(),
    commentId: z.string(),
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
            return NextResponse.json({ error: "Missing reportId or commentId." }, { status: 400 });
        }

        const { reportId, commentId } = parsed.data;

        // Fetch report and comment
        const [report, comment] = await Promise.all([
            prisma.report.findUnique({ where: { id: reportId } }),
            prisma.comment.findUnique({
                where: { id: commentId },
                include: {
                    parent: true,
                },
            }),
        ]);

        if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });
        if (!comment) return NextResponse.json({ error: "Comment not found." }, { status: 404 });

        // Build thread context (parent chain)
        const thread: string[] = [];
        if (comment.parent) {
            thread.push(comment.parent.body);
        }
        thread.push(comment.body);

        const ctx = {
            title: report.title ?? undefined,
            description: report.description ?? undefined,
            transcript: report.transcript ?? undefined,
            consoleLogs: (report.consoleLogs as unknown[]) ?? [],
            networkLogs: (report.networkLogs as unknown[]) ?? [],
        };

        const service = new AIInsightsService();
        const result = await service.suggestReplies(ctx, comment.body, thread);

        return NextResponse.json(result);
    } catch (error) {
        console.error("[AI Suggest Reply] Failed:", error);
        return NextResponse.json(
            { error: "Failed to generate reply suggestions.", detail: error instanceof Error ? error.message : String(error) },
            { status: 502 },
        );
    }
}
