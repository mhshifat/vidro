import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { AIInsightsService } from "@/services/ai";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const schema = z.object({
    query: z.string().min(1).max(500),
});

/** Convert BigInt fields so JSON.stringify works */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeReport(report: any) {
    return {
        ...report,
        fileSize: report.fileSize != null ? Number(report.fileSize) : 0,
    };
}

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
            return NextResponse.json({ error: "Missing query." }, { status: 400 });
        }

        const { query } = parsed.data;
        const service = new AIInsightsService();

        // Parse the natural language query into structured params
        const searchParams = await service.parseSearchQuery(query);

        // Build Prisma where clause
        const where: Prisma.ReportWhereInput = {
            userId: payload.userId as string,
        };

        // Keyword search across title, description, transcript, and AI fields
        if (searchParams.keywords.length > 0) {
            where.OR = searchParams.keywords.flatMap(kw => [
                { title: { contains: kw, mode: "insensitive" as const } },
                { description: { contains: kw, mode: "insensitive" as const } },
                { transcript: { contains: kw, mode: "insensitive" as const } },
                { reproSteps: { contains: kw, mode: "insensitive" as const } },
                { rootCause: { contains: kw, mode: "insensitive" as const } },
                { logSummary: { contains: kw, mode: "insensitive" as const } },
                { suggestedFix: { contains: kw, mode: "insensitive" as const } },
                { stakeholderSummary: { contains: kw, mode: "insensitive" as const } },
                { accessibilityAudit: { contains: kw, mode: "insensitive" as const } },
                { performanceAnalysis: { contains: kw, mode: "insensitive" as const } },
                { securityScan: { contains: kw, mode: "insensitive" as const } },
                { testCases: { contains: kw, mode: "insensitive" as const } },
            ]);
        }

        // Apply structured filters
        if (searchParams.filters.severity) {
            where.severity = searchParams.filters.severity;
        }
        if (searchParams.filters.type) {
            where.type = searchParams.filters.type as "VIDEO" | "SCREENSHOT";
        }
        if (searchParams.filters.priority) {
            where.priority = searchParams.filters.priority;
        }

        const reports = await prisma.report.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: 20,
            select: {
                id: true,
                title: true,
                description: true,
                type: true,
                videoUrl: true,
                imageUrl: true,
                storageKey: true,
                fileSize: true,
                consoleLogs: true,
                networkLogs: true,
                severity: true,
                priority: true,
                tags: true,
                reproSteps: true,
                rootCause: true,
                logSummary: true,
                transcript: true,
                createdAt: true,
            },
        });

        // Compute which fields matched for each result
        const resultsWithMatches = reports.map(r => {
            const matchedFields: string[] = [];
            const lowerKeywords = searchParams.keywords.map((k: string) => k.toLowerCase());
            if (lowerKeywords.length > 0) {
                const fieldChecks: [string, string | null | undefined][] = [
                    ["title", r.title], ["description", r.description], ["transcript", r.transcript],
                    ["reproSteps", r.reproSteps], ["rootCause", r.rootCause], ["logSummary", r.logSummary],
                ];
                for (const [name, val] of fieldChecks) {
                    if (val && lowerKeywords.some(kw => val.toLowerCase().includes(kw))) {
                        matchedFields.push(name);
                    }
                }
                // Check tags (JSON array)
                if (r.tags && Array.isArray(r.tags)) {
                    const tagsLower = (r.tags as string[]).map(t => t.toLowerCase());
                    if (lowerKeywords.some(kw => tagsLower.some(t => t.includes(kw)))) {
                        matchedFields.push("tags");
                    }
                }
            }
            return { ...serializeReport(r), matchedFields };
        });

        return NextResponse.json({
            interpretation: searchParams.interpretation,
            filters: searchParams.filters,
            keywords: searchParams.keywords,
            results: resultsWithMatches,
        });
    } catch (error) {
        console.error("[AI Search] Failed:", error);
        return NextResponse.json(
            { error: "Search failed.", detail: error instanceof Error ? error.message : String(error) },
            { status: 502 },
        );
    }
}
