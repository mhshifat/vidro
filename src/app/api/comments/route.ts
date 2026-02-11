import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";

/* ─── helpers ──────────────────────────────────────────────────── */
async function getAuthUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const payload = await JWTManager.verify(token);
    return payload ? (payload.userId as string) : null;
}

function serializeComment(c: Record<string, unknown> & { user?: { id: string; name: string | null; email: string }; replies?: unknown[] }) {
    return {
        ...c,
        user: c.user
            ? { id: c.user.id, name: c.user.name, email: c.user.email }
            : undefined,
        replies: c.replies?.map(serializeComment) ?? [],
    };
}

/* ─── schemas ──────────────────────────────────────────────────── */
const createSchema = z.object({
    reportId: z.string().min(1),
    body: z.string().min(1).max(5000),
    parentId: z.string().optional(),
});

const updateSchema = z.object({
    body: z.string().min(1).max(5000),
});

/* ─── GET  /api/comments?reportId=xxx ──────────────────────────── */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const reportId = searchParams.get("reportId");
        if (!reportId) {
            return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
        }

        // Fetch all comments for this report (flat list) — we'll build the tree on the client
        const comments = await prisma.comment.findMany({
            where: { reportId },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json(comments.map(serializeComment));
    } catch (err) {
        console.error("GET /api/comments error:", err);
        return NextResponse.json({ error: "Failed to load comments." }, { status: 500 });
    }
}

/* ─── POST /api/comments ───────────────────────────────────────── */
export async function POST(req: Request) {
    try {
        const userId = await getAuthUser();
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
        }

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
        }

        const parsed = createSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid data.", details: parsed.error.flatten().fieldErrors },
                { status: 400 },
            );
        }
        const { reportId, body: text, parentId } = parsed.data;

        // Validate report exists
        const report = await prisma.report.findUnique({ where: { id: reportId } });
        if (!report) {
            return NextResponse.json({ error: "Report not found." }, { status: 404 });
        }

        // If replying, validate parent exists and belongs to same report
        if (parentId) {
            const parent = await prisma.comment.findUnique({ where: { id: parentId } });
            if (!parent || parent.reportId !== reportId) {
                return NextResponse.json({ error: "Parent comment not found." }, { status: 404 });
            }
        }

        const comment = await prisma.comment.create({
            data: {
                body: text,
                reportId,
                userId,
                parentId: parentId ?? null,
            },
            include: { user: { select: { id: true, name: true, email: true } } },
        });

        return NextResponse.json(serializeComment(comment), { status: 201 });
    } catch (err) {
        console.error("POST /api/comments error:", err);
        return NextResponse.json({ error: "Failed to create comment." }, { status: 500 });
    }
}

/* ─── PATCH /api/comments?id=xxx ───────────────────────────────── */
export async function PATCH(req: Request) {
    try {
        const userId = await getAuthUser();
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Missing comment id." }, { status: 400 });
        }

        const existing = await prisma.comment.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Comment not found." }, { status: 404 });
        }
        if (existing.userId !== userId) {
            return NextResponse.json({ error: "You can only edit your own comments." }, { status: 403 });
        }

        const body = await req.json().catch(() => null);
        const parsed = updateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid data." }, { status: 400 });
        }

        const updated = await prisma.comment.update({
            where: { id },
            data: { body: parsed.data.body },
            include: { user: { select: { id: true, name: true, email: true } } },
        });

        return NextResponse.json(serializeComment(updated));
    } catch (err) {
        console.error("PATCH /api/comments error:", err);
        return NextResponse.json({ error: "Failed to update comment." }, { status: 500 });
    }
}

/* ─── DELETE /api/comments?id=xxx ──────────────────────────────── */
export async function DELETE(req: Request) {
    try {
        const userId = await getAuthUser();
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Missing comment id." }, { status: 400 });
        }

        const existing = await prisma.comment.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Comment not found." }, { status: 404 });
        }
        if (existing.userId !== userId) {
            return NextResponse.json({ error: "You can only delete your own comments." }, { status: 403 });
        }

        // Cascade delete handled by Prisma relation onDelete: Cascade
        await prisma.comment.delete({ where: { id } });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("DELETE /api/comments error:", err);
        return NextResponse.json({ error: "Failed to delete comment." }, { status: 500 });
    }
}
