import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { AIInsightsService } from "@/services/ai";
import { z } from "zod";

const translateSchema = z.object({
    reportId: z.string(),
    language: z.string().min(2).max(50),
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

        const parsed = translateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid request.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const { reportId, language } = parsed.data;

        const report = await prisma.report.findUnique({ where: { id: reportId } });
        if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

        const ctx = {
            title: report.title ?? undefined,
            description: report.description ?? undefined,
        };

        const service = new AIInsightsService();
        const translation = await service.translateReport(ctx, language);

        // Store in translations JSON field
        const existing = (report.translations as Record<string, unknown>) ?? {};
        const updated: Record<string, { title: string; description: string }> = {
            ...existing as Record<string, { title: string; description: string }>,
            [language]: { title: translation.title, description: translation.description },
        };
        await prisma.report.update({
            where: { id: reportId },
            data: { translations: updated as unknown as import("@prisma/client").Prisma.InputJsonValue },
        });

        return NextResponse.json(translation);
    } catch (error) {
        console.error("[AI Translate] Failed:", error);
        return NextResponse.json(
            { error: "Translation failed.", detail: error instanceof Error ? error.message : String(error) },
            { status: 502 },
        );
    }
}
