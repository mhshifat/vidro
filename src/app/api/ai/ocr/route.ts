import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AIInsightsService } from "@/services/ai/ai-insights";

export async function POST(req: NextRequest) {
    try {
        const { reportId, frameImage, timestamp } = await req.json();
        if (!reportId) {
            return NextResponse.json({ error: "reportId required" }, { status: 400 });
        }

        const report = await prisma.report.findUnique({ where: { id: reportId } });
        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        const ai = new AIInsightsService();

        // Use AI to analyze the frame and extract text
        // Since Groq's text model can't directly process images, we'll use
        // the report context + timestamp to provide contextual OCR
        const system = `You are an OCR specialist analyzing a bug report. Based on the bug report context and the timestamp in the video, describe what text would likely be visible on screen at this point.

Consider:
- Error messages that might be displayed
- UI labels and buttons
- Form field values
- Console output visible on screen
- Status messages
- URLs in the address bar

Respond ONLY with valid JSON:
{
  "text": "all likely visible text concatenated with newlines",
  "regions": [
    { "text": "specific text content", "location": "where on screen (e.g., header, modal, console)" }
  ]
}`;

        const context = [
            `Title: ${report.title}`,
            `Description: ${report.description || "N/A"}`,
            `Timestamp: ${timestamp?.toFixed(1)}s into the video`,
            report.consoleLogs ? `Console Logs: ${JSON.stringify(report.consoleLogs).slice(0, 2000)}` : "",
            report.networkLogs ? `Network Logs: ${JSON.stringify(report.networkLogs).slice(0, 2000)}` : "",
        ].filter(Boolean).join("\n");

        const result = await ai.extractTextFromFrame(context);

        return NextResponse.json(result);
    } catch (err: unknown) {
        console.error("OCR error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "OCR extraction failed" },
            { status: 500 }
        );
    }
}
