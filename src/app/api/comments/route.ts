import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { CommentService } from "@/services/comment-service";
import { Logger, formatErrorResponse } from "@/lib/logger";

/* ─── helpers ──────────────────────────────────────────────────── */
async function getAuthUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const payload = await JWTManager.verify(token);
    return payload ? (payload.userId as string) : null;
}

/* ─── schemas ──────────────────────────────────────────────────── */
const createSchema = z.object({
    reportId: z.string().min(1),
    body: z.string().min(1).max(5000),
    parentId: z.string().optional(),
    timestamp: z.number().min(0).optional(),
});

const updateSchema = z.object({
    body: z.string().min(1).max(5000),
});

/* ─── GET  /api/comments?reportId=xxx ──────────────────────────── */
export async function GET(req: Request) {
    const context = Logger.createContext();

    try {
        const { searchParams } = new URL(req.url);
        const reportId = searchParams.get("reportId");
        if (!reportId) {
            return NextResponse.json(
                formatErrorResponse("Missing reportId", context.correlationId),
                { status: 400 }
            );
        }

        const { comments, error } = await CommentService.getCommentsForReport(
            reportId,
            context
        );

        if (error) {
            return NextResponse.json(
                formatErrorResponse(error, context.correlationId),
                { status: 500 }
            );
        }

        return NextResponse.json(comments);
    } catch (err) {
        const errorResponse = Logger.error(
            "GET /api/comments error",
            err,
            context,
            { userMessage: "Failed to load comments." }
        );
        return NextResponse.json(
            formatErrorResponse(errorResponse.message, context.correlationId),
            { status: 500 }
        );
    }
}

/* ─── POST /api/comments ───────────────────────────────────────── */
export async function POST(req: Request) {
    const context = Logger.createContext();

    try {
        const userId = await getAuthUser();
        if (!userId) {
            return NextResponse.json(
                formatErrorResponse("Not authenticated.", context.correlationId),
                { status: 401 }
            );
        }

        context.userId = userId;

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json(
                formatErrorResponse("Invalid request body.", context.correlationId),
                { status: 400 }
            );
        }

        const parsed = createSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Invalid data.",
                    correlationId: context.correlationId,
                    details: parsed.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const { reportId, body: text, parentId, timestamp } = parsed.data;

        const { comment, error, notFound } = await CommentService.create(
            { body: text, reportId, parentId, timestamp },
            userId,
            context
        );

        if (notFound) {
            return NextResponse.json(
                formatErrorResponse(error ?? "Report or parent comment not found.", context.correlationId),
                { status: 404 }
            );
        }

        if (error || !comment) {
            return NextResponse.json(
                formatErrorResponse(error ?? "Failed to create comment.", context.correlationId),
                { status: 500 }
            );
        }

        return NextResponse.json(comment, { status: 201 });
    } catch (err) {
        const errorResponse = Logger.error(
            "POST /api/comments error",
            err,
            context,
            { userMessage: "Failed to create comment." }
        );
        return NextResponse.json(
            formatErrorResponse(errorResponse.message, context.correlationId),
            { status: 500 }
        );
    }
}

/* ─── PATCH /api/comments?id=xxx ───────────────────────────────── */
export async function PATCH(req: Request) {
    const context = Logger.createContext();

    try {
        const userId = await getAuthUser();
        if (!userId) {
            return NextResponse.json(
                formatErrorResponse("Not authenticated.", context.correlationId),
                { status: 401 }
            );
        }

        context.userId = userId;

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json(
                formatErrorResponse("Missing comment id.", context.correlationId),
                { status: 400 }
            );
        }

        const body = await req.json().catch(() => null);
        const parsed = updateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                formatErrorResponse("Invalid data.", context.correlationId),
                { status: 400 }
            );
        }

        const { comment, error, notFound, forbidden } = await CommentService.update(
            id,
            userId,
            { body: parsed.data.body },
            context
        );

        if (notFound) {
            return NextResponse.json(
                formatErrorResponse("Comment not found.", context.correlationId),
                { status: 404 }
            );
        }

        if (forbidden) {
            return NextResponse.json(
                formatErrorResponse("You can only edit your own comments.", context.correlationId),
                { status: 403 }
            );
        }

        if (error || !comment) {
            return NextResponse.json(
                formatErrorResponse(error ?? "Failed to update comment.", context.correlationId),
                { status: 500 }
            );
        }

        return NextResponse.json(comment);
    } catch (err) {
        const errorResponse = Logger.error(
            "PATCH /api/comments error",
            err,
            context,
            { userMessage: "Failed to update comment." }
        );
        return NextResponse.json(
            formatErrorResponse(errorResponse.message, context.correlationId),
            { status: 500 }
        );
    }
}

/* ─── DELETE /api/comments?id=xxx ──────────────────────────────── */
export async function DELETE(req: Request) {
    const context = Logger.createContext();

    try {
        const userId = await getAuthUser();
        if (!userId) {
            return NextResponse.json(
                formatErrorResponse("Not authenticated.", context.correlationId),
                { status: 401 }
            );
        }

        context.userId = userId;

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json(
                formatErrorResponse("Missing comment id.", context.correlationId),
                { status: 400 }
            );
        }

        const { success, error, notFound, forbidden } = await CommentService.delete(
            id,
            userId,
            context
        );

        if (notFound) {
            return NextResponse.json(
                formatErrorResponse("Comment not found.", context.correlationId),
                { status: 404 }
            );
        }

        if (forbidden) {
            return NextResponse.json(
                formatErrorResponse("You can only delete your own comments.", context.correlationId),
                { status: 403 }
            );
        }

        if (!success) {
            return NextResponse.json(
                formatErrorResponse(error ?? "Failed to delete comment.", context.correlationId),
                { status: 500 }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        const errorResponse = Logger.error(
            "DELETE /api/comments error",
            err,
            context,
            { userMessage: "Failed to delete comment." }
        );
        return NextResponse.json(
            formatErrorResponse(errorResponse.message, context.correlationId),
            { status: 500 }
        );
    }
}
