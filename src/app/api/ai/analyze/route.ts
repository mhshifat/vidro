import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { Logger } from "@/lib/logger";
import { AIService } from "@/services/ai";
import { z } from "zod";

export const maxDuration = 60;

const analyzeSchema = z.object({
    /** Public URL of the uploaded video (e.g. Cloudinary URL) */
    videoUrl: z.string().url(),
    /** MIME type – defaults to video/webm */
    mimeType: z.string().optional().default("video/webm"),
});

export async function POST(req: Request) {
    try {
        // ── 1. Authenticate ──────────────────────────────────
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Not authenticated. Please log in." },
                { status: 401 }
            );
        }
        const payload = await JWTManager.verify(token);
        if (!payload) {
            return NextResponse.json(
                { error: "Session expired. Please log in again." },
                { status: 401 }
            );
        }

        // ── 2. Parse & validate body ─────────────────────────
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body." },
                { status: 400 }
            );
        }

        const parsed = analyzeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Invalid request data.",
                    details: parsed.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const { videoUrl, mimeType } = parsed.data;

        // ── 3. Run AI analysis ───────────────────────────────
        console.log("[AI Analyze] Starting analysis for:", videoUrl, "mimeType:", mimeType);
        const provider = AIService.getProvider();
        const result = await provider.analyzeVideo(videoUrl, mimeType);
        console.log("[AI Analyze] Success:", { title: result.title, descLength: result.description.length, transcriptLength: result.transcript.length });

        return NextResponse.json(result);
    } catch (error) {
        const context = Logger.createContext();
        const result = Logger.error(
            "[AI Analyze] Failed",
            error,
            context,
            { userMessage: "AI analysis failed. Your report will be saved without AI-generated content." }
        );
        return NextResponse.json(
            { error: result.message, correlationId: result.correlationId },
            { status: 502 }
        );
    }
}
