import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        const payload = await JWTManager.verify(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const reports = await prisma.report.findMany({
            where: { userId: payload.userId as string },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                description: true,
                videoUrl: true,
                consoleLogs: true,
                networkLogs: true,
                createdAt: true,
            },
        });

        return NextResponse.json(reports);
    } catch (error) {
        console.error("Failed to fetch reports:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        const payload = await JWTManager.verify(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        // Verify ownership
        const report = await prisma.report.findUnique({ where: { id } });
        if (!report || report.userId !== payload.userId) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await prisma.report.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete report:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
