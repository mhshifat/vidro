import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { AIInsightsService } from "@/services/ai";
import { z } from "zod";

const messageSchema = z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1),
});

const chatSchema = z.object({
    reportId: z.string(),
    messages: z.array(messageSchema).min(1),
});

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return new Response(JSON.stringify({ error: "Not authenticated." }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        const payload = await JWTManager.verify(token);
        if (!payload) {
            return new Response(JSON.stringify({ error: "Session expired." }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return new Response(JSON.stringify({ error: "Invalid request body." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const parsed = chatSchema.safeParse(body);
        if (!parsed.success) {
            return new Response(
                JSON.stringify({ error: "Invalid request.", details: parsed.error.flatten().fieldErrors }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { reportId, messages } = parsed.data;

        const report = await prisma.report.findUnique({ where: { id: reportId } });
        if (!report) {
            return new Response(JSON.stringify({ error: "Report not found." }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        const ctx = {
            title: report.title ?? undefined,
            description: report.description ?? undefined,
            transcript: report.transcript ?? undefined,
            consoleLogs: (report.consoleLogs as unknown[]) ?? [],
            networkLogs: (report.networkLogs as unknown[]) ?? [],
        };

        const extraContext = {
            severity: report.severity ?? undefined,
            priority: report.priority ?? undefined,
            reproSteps: report.reproSteps ?? undefined,
            rootCause: report.rootCause ?? undefined,
            suggestedFix: report.suggestedFix ?? undefined,
        };

        const service = new AIInsightsService();
        const generator = service.chatStream(ctx, messages, extraContext);

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async pull(controller) {
                try {
                    const { value, done } = await generator.next();
                    if (done) {
                        controller.close();
                        return;
                    }
                    controller.enqueue(encoder.encode(value));
                } catch (err) {
                    console.error("[AI Chat] Stream error:", err);
                    controller.error(err);
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        console.error("[AI Chat] Failed:", error);
        return new Response(
            JSON.stringify({
                error: "Failed to process chat message.",
                detail: error instanceof Error ? error.message : String(error),
            }),
            { status: 502, headers: { "Content-Type": "application/json" } }
        );
    }
}
