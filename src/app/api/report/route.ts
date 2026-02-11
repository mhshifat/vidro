import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { ReportService } from "@/services/report-service";
import { Logger, formatErrorResponse } from "@/lib/logger";
import type { ConsoleLogEntry, NetworkLogEntry } from "@/entities/report";

const createReportSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(["VIDEO", "SCREENSHOT"]).optional().default("VIDEO"),
    videoUrl: z.string().optional(),
    imageUrl: z.string().optional(),
    storageKey: z.string().optional(),
    fileSize: z.number().optional(),
    transcript: z.string().optional(),
    consoleLogs: z.array(z.object({
        type: z.enum(["log", "warn", "error", "info", "debug"]),
        args: z.array(z.unknown()).optional(),
        timestamp: z.number().optional(),
    })).optional(),
    networkLogs: z.array(z.object({
        url: z.string(),
        method: z.string(),
        status: z.number(),
        duration: z.number().optional(),
        timestamp: z.number().optional(),
    })).optional(),
}).refine(
    (data) => data.videoUrl || data.imageUrl,
    { message: "Either videoUrl or imageUrl must be provided" }
);

const updateReportSchema = z.object({
    title: z.string().min(1, "Title cannot be empty").max(200).optional(),
    description: z.string().max(5000).optional(),
    transcript: z.string().optional(),
    severity: z.string().optional(),
    priority: z.string().optional(),
    tags: z.array(z.string()).optional(),
    reproSteps: z.string().optional(),
    rootCause: z.string().optional(),
    logSummary: z.string().optional(),
    stakeholderSummary: z.string().optional(),
    suggestedFix: z.string().optional(),
    accessibilityAudit: z.string().optional(),
    performanceAnalysis: z.string().optional(),
    securityScan: z.string().optional(),
    testCases: z.string().optional(),
    sentiment: z.string().optional(),
    translations: z.record(z.string(), z.object({
        title: z.string().optional(),
        description: z.string().optional(),
    })).optional(),
    highlightStart: z.number().optional(),
    highlightEnd: z.number().optional(),
    annotations: z.array(z.object({
        id: z.string(),
        type: z.enum(["arrow", "box", "text", "highlight"]),
        x: z.number(),
        y: z.number(),
        width: z.number().optional(),
        height: z.number().optional(),
        text: z.string().optional(),
        color: z.string().optional(),
        timestamp: z.number().optional(),
    })).optional(),
});

export async function GET(req: Request) {
    const context = Logger.createContext();

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json(
                formatErrorResponse("Missing report id.", context.correlationId),
                { status: 400 }
            );
        }

        const { report, error } = await ReportService.getById(id, context);

        if (error) {
            return NextResponse.json(
                formatErrorResponse(error, context.correlationId),
                { status: 500 }
            );
        }

        if (!report) {
            return NextResponse.json(
                formatErrorResponse("Report not found.", context.correlationId),
                { status: 404 }
            );
        }

        return NextResponse.json(report);
    } catch (error) {
        const errorResponse = Logger.error(
            "Failed to fetch report",
            error,
            context,
            { userMessage: "Failed to load report. Please try again." }
        );
        return NextResponse.json(
            formatErrorResponse(errorResponse.message, context.correlationId),
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const context = Logger.createContext();

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json(
                formatErrorResponse("Not authenticated. Please log in.", context.correlationId),
                { status: 401 }
            );
        }
        const payload = await JWTManager.verify(token);
        if (!payload) {
            return NextResponse.json(
                formatErrorResponse("Session expired. Please log in again.", context.correlationId),
                { status: 401 }
            );
        }

        context.userId = payload.userId as string;

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                formatErrorResponse("Invalid request body.", context.correlationId),
                { status: 400 }
            );
        }

        const parsed = createReportSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Invalid report data.",
                    correlationId: context.correlationId,
                    details: parsed.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const data = parsed.data;
        const { report, error } = await ReportService.create(
            {
                title: data.title,
                description: data.description,
                type: data.type,
                videoUrl: data.videoUrl,
                imageUrl: data.imageUrl,
                storageKey: data.storageKey,
                fileSize: data.fileSize,
                transcript: data.transcript,
                consoleLogs: data.consoleLogs as ConsoleLogEntry[],
                networkLogs: data.networkLogs as NetworkLogEntry[],
                userId: payload.userId as string,
            },
            context
        );

        if (error || !report) {
            return NextResponse.json(
                formatErrorResponse(error ?? "Failed to save report.", context.correlationId),
                { status: 500 }
            );
        }

        return NextResponse.json(report);
    } catch (error) {
        const errorResponse = Logger.error(
            "Failed to create report",
            error,
            context,
            { userMessage: "Failed to save report. Please try again." }
        );
        return NextResponse.json(
            formatErrorResponse(errorResponse.message, context.correlationId),
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    const context = Logger.createContext();

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json(
                formatErrorResponse("Missing report id.", context.correlationId),
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json(
                formatErrorResponse("Not authenticated. Please log in.", context.correlationId),
                { status: 401 }
            );
        }
        const payload = await JWTManager.verify(token);
        if (!payload) {
            return NextResponse.json(
                formatErrorResponse("Session expired. Please log in again.", context.correlationId),
                { status: 401 }
            );
        }

        context.userId = payload.userId as string;

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                formatErrorResponse("Invalid request body.", context.correlationId),
                { status: 400 }
            );
        }

        const parsed = updateReportSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Invalid update data.",
                    correlationId: context.correlationId,
                    details: parsed.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const data = parsed.data;
        if (Object.keys(data).length === 0) {
            return NextResponse.json(
                formatErrorResponse("No fields to update.", context.correlationId),
                { status: 400 }
            );
        }

        const { report, error, notFound, forbidden } = await ReportService.update(
            id,
            payload.userId as string,
            data,
            context
        );

        if (notFound) {
            return NextResponse.json(
                formatErrorResponse("Report not found.", context.correlationId),
                { status: 404 }
            );
        }

        if (forbidden) {
            return NextResponse.json(
                formatErrorResponse("You can only edit your own reports.", context.correlationId),
                { status: 403 }
            );
        }

        if (error || !report) {
            return NextResponse.json(
                formatErrorResponse(error ?? "Failed to update report.", context.correlationId),
                { status: 500 }
            );
        }

        return NextResponse.json(report);
    } catch (error) {
        const errorResponse = Logger.error(
            "Failed to update report",
            error,
            context,
            { userMessage: "Failed to update report. Please try again." }
        );
        return NextResponse.json(
            formatErrorResponse(errorResponse.message, context.correlationId),
            { status: 500 }
        );
    }
}