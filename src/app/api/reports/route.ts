import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { ReportService } from "@/services/report-service";
import { Logger, formatErrorResponse } from "@/lib/logger";

export async function GET(req: Request) {
    const context = Logger.createContext();
    
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json(
                formatErrorResponse("Not authenticated", context.correlationId),
                { status: 401 }
            );
        }
        const payload = await JWTManager.verify(token);
        if (!payload) {
            return NextResponse.json(
                formatErrorResponse("Invalid token", context.correlationId),
                { status: 401 }
            );
        }

        context.userId = payload.userId as string;

        // Parse pagination params
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") ?? "1", 10);
        const limit = parseInt(searchParams.get("limit") ?? "20", 10);
        const type = searchParams.get("type") as "VIDEO" | "SCREENSHOT" | null;
        const search = searchParams.get("search") ?? undefined;

        const { data, error } = await ReportService.getReportsForUser(
            {
                userId: payload.userId as string,
                page,
                limit,
                type: type ?? undefined,
                search,
            },
            context
        );

        if (error || !data) {
            return NextResponse.json(
                formatErrorResponse(error ?? "Failed to fetch reports", context.correlationId),
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        const errorResponse = Logger.error(
            "Failed to fetch reports",
            error,
            context,
            { userMessage: "Failed to load reports. Please try again." }
        );
        return NextResponse.json(
            formatErrorResponse(errorResponse.message, context.correlationId),
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    const context = Logger.createContext();
    
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json(
                formatErrorResponse("Not authenticated", context.correlationId),
                { status: 401 }
            );
        }
        const payload = await JWTManager.verify(token);
        if (!payload) {
            return NextResponse.json(
                formatErrorResponse("Invalid token", context.correlationId),
                { status: 401 }
            );
        }

        context.userId = payload.userId as string;

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json(
                formatErrorResponse("Missing id", context.correlationId),
                { status: 400 }
            );
        }

        const { success, error, notFound } = await ReportService.delete(
            id,
            payload.userId as string,
            context
        );

        if (notFound) {
            return NextResponse.json(
                formatErrorResponse("Not found", context.correlationId),
                { status: 404 }
            );
        }

        if (!success) {
            return NextResponse.json(
                formatErrorResponse(error ?? "Failed to delete report", context.correlationId),
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        const errorResponse = Logger.error(
            "Failed to delete report",
            error,
            context,
            { userMessage: "Failed to delete report. Please try again." }
        );
        return NextResponse.json(
            formatErrorResponse(errorResponse.message, context.correlationId),
            { status: 500 }
        );
    }
}
