import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";

/** Convert BigInt fields to Number so JSON.stringify works */
function serializeReport(report: any) {
    return {
        ...report,
        fileSize: report.fileSize != null ? Number(report.fileSize) : 0,
    };
}

const createReportSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    videoUrl: z.string(),
    storageKey: z.string().optional(),
    fileSize: z.number().optional(),
    consoleLogs: z.any().optional(),
    networkLogs: z.any().optional(),
});

const updateReportSchema = z.object({
    title: z.string().min(1, "Title cannot be empty").max(200).optional(),
    description: z.string().max(5000).optional(),
});

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Missing report id." }, { status: 400 });
        }

        const report = await prisma.report.findUnique({ where: { id } });
        if (!report) {
            return NextResponse.json({ error: "Report not found." }, { status: 404 });
        }

        return NextResponse.json(serializeReport(report));
    } catch (error) {
        console.error("Failed to fetch report:", error);
        return NextResponse.json({ error: "Failed to load report. Please try again." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // Get userId from auth cookie
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Not authenticated. Please log in." }, { status: 401 });
        }
        const payload = await JWTManager.verify(token);
        if (!payload) {
            return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
        }

        let body: any;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
        }

        const parsed = createReportSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid report data.", details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }
        const data = parsed.data;

        const report = await prisma.report.create({
            data: {
                title: data.title || "Untitled Bug Report",
                description: data.description,
                videoUrl: data.videoUrl,
                storageKey: data.storageKey,
                fileSize: data.fileSize ?? 0,
                consoleLogs: data.consoleLogs ?? [],
                networkLogs: data.networkLogs ?? [],
                userId: payload.userId as string,
            },
        });

        return NextResponse.json(serializeReport(report));
    } catch (error) {
        console.error("Failed to create report:", error);
        return NextResponse.json({ error: "Failed to save report. Please try again." }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Missing report id." }, { status: 400 });
        }

        // Auth check
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Not authenticated. Please log in." }, { status: 401 });
        }
        const payload = await JWTManager.verify(token);
        if (!payload) {
            return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
        }

        // Ownership check
        const existing = await prisma.report.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Report not found." }, { status: 404 });
        }
        if (existing.userId !== payload.userId) {
            return NextResponse.json({ error: "You can only edit your own reports." }, { status: 403 });
        }

        // Parse & validate body
        let body: Record<string, unknown>;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
        }

        const parsed = updateReportSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid update data.", details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const updateData: Record<string, string> = {};
        if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
        if (parsed.data.description !== undefined) updateData.description = parsed.data.description;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields to update." }, { status: 400 });
        }

        const updated = await prisma.report.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(serializeReport(updated));
    } catch (error) {
        console.error("Failed to update report:", error);
        return NextResponse.json({ error: "Failed to update report. Please try again." }, { status: 500 });
    }
}