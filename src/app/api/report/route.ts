import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createReportSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    videoUrl: z.string().url(),
    consoleLogs: z.any().optional(),
    networkLogs: z.any().optional(),
    userId: z.string(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const payload = createReportSchema.parse(body);

        const report = await prisma.report.create({
            data: {
                title: payload.title || "Untitled Bug Report",
                description: payload.description,
                videoUrl: payload.videoUrl,
                consoleLogs: payload.consoleLogs ?? [],
                networkLogs: payload.networkLogs ?? [],
                userId: payload.userId,
            },
        });

        return NextResponse.json(report);
    } catch (error) {
        console.error("Failed to create report:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
