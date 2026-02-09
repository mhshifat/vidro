import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";

const createReportSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    videoUrl: z.string(),
    consoleLogs: z.any().optional(),
    networkLogs: z.any().optional(),
});

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const report = await prisma.report.findUnique({ where: { id } });
        if (!report) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(report);
    } catch (error) {
        console.error("Failed to fetch report:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // Get userId from auth cookie
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        const payload = await JWTManager.verify(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const body = await req.json();
        const data = createReportSchema.parse(body);

        const report = await prisma.report.create({
            data: {
                title: data.title || "Untitled Bug Report",
                description: data.description,
                videoUrl: data.videoUrl,
                consoleLogs: data.consoleLogs ?? [],
                networkLogs: data.networkLogs ?? [],
                userId: payload.userId as string,
            },
        });

        return NextResponse.json(report);
    } catch (error) {
        console.error("Failed to create report:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
