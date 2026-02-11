import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { AIInsightsService } from "@/services/ai";
import { z } from "zod";

const insightSchema = z.object({
    reportId: z.string(),
    type: z.enum([
        "severity",
        "repro-steps",
        "root-cause",
        "auto-tag",
        "log-summary",
        "stakeholder-summary",
        "suggested-fix",
        "accessibility-audit",
        "performance-analysis",
        "security-scan",
        "test-cases",
        "sentiment",
    ]),
});

export async function POST(req: Request) {
    try {
        // ── Auth ──
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
        const payload = await JWTManager.verify(token);
        if (!payload) return NextResponse.json({ error: "Session expired." }, { status: 401 });

        // ── Parse body ──
        let body: unknown;
        try { body = await req.json(); } catch {
            return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
        }

        const parsed = insightSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid request.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const { reportId, type } = parsed.data;

        // ── Fetch report ──
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

        /** Ensure a value is a plain string (AI sometimes returns objects instead of markdown strings) */
        function str(v: unknown): string {
            if (typeof v === "string") return v;
            if (v === null || v === undefined) return "";
            if (typeof v === "object") {
                // Render object as readable markdown-ish text
                return JSON.stringify(v, null, 2);
            }
            return String(v);
        }

        // Helper to run analysis, persist, and return
        async function runAndPersist(
            fn: () => Promise<object>,
            toDb: (r: object) => Record<string, unknown>,
        ) {
            const r = await fn();
            const dbData = toDb(r);
            if (Object.keys(dbData).length > 0) {
                await prisma.report.update({ where: { id: reportId }, data: dbData });
            }
            return NextResponse.json({ type, ...r });
        }

        // ── Run analysis ──
        switch (type) {
            case "severity":
                return runAndPersist(
                    () => service.classifySeverity(ctx),
                    (r) => { const d = r as { severity: string; priority: string }; return { severity: d.severity, priority: d.priority }; },
                );
            case "repro-steps":
                return runAndPersist(
                    () => service.generateReproSteps(ctx),
                    (r) => ({ reproSteps: str((r as { steps: unknown }).steps) }),
                );
            case "root-cause":
                return runAndPersist(
                    () => service.analyzeRootCause(ctx),
                    (r) => ({ rootCause: str((r as { analysis: unknown }).analysis) }),
                );
            case "auto-tag":
                return runAndPersist(
                    () => service.autoTag(ctx),
                    (r) => ({ tags: (r as { tags: string[] }).tags }),
                );
            case "log-summary":
                return runAndPersist(
                    () => service.summarizeLogs(ctx),
                    (r) => ({ logSummary: str((r as { summary: unknown }).summary) }),
                );
            case "stakeholder-summary":
                return runAndPersist(
                    () => service.generateStakeholderSummary(ctx),
                    (r) => ({ stakeholderSummary: str((r as { summary: unknown }).summary) }),
                );
            case "suggested-fix":
                return runAndPersist(
                    () => service.suggestFix(ctx),
                    (r) => ({ suggestedFix: str((r as { suggestion: unknown }).suggestion) }),
                );
            case "accessibility-audit":
                return runAndPersist(
                    () => service.auditAccessibility(ctx),
                    (r) => ({ accessibilityAudit: JSON.stringify(r) }),
                );
            case "performance-analysis":
                return runAndPersist(
                    () => service.detectPerformanceBottlenecks(ctx),
                    (r) => ({ performanceAnalysis: JSON.stringify(r) }),
                );
            case "security-scan":
                return runAndPersist(
                    () => service.scanSecurity(ctx),
                    (r) => ({ securityScan: JSON.stringify(r) }),
                );
            case "test-cases":
                return runAndPersist(
                    () => service.generateTestCases(ctx),
                    (r) => ({ testCases: (r as { testCases: string }).testCases }),
                );
            case "sentiment": {
                // Fetch comments for sentiment analysis
                const comments = await prisma.comment.findMany({
                    where: { reportId },
                    select: { body: true },
                    orderBy: { createdAt: "asc" },
                    take: 50,
                });
                return runAndPersist(
                    () => service.detectSentiment(ctx, comments.map(c => c.body)),
                    (r) => ({ sentiment: JSON.stringify(r) }),
                );
            }
            default:
                return NextResponse.json({ error: "Unknown insight type." }, { status: 400 });
        }
    } catch (error) {
        console.error("[AI Insights] Failed:", error);
        return NextResponse.json(
            { error: "AI analysis failed.", detail: error instanceof Error ? error.message : String(error) },
            { status: 502 },
        );
    }
}
