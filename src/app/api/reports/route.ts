import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { StorageService } from "@/services/storage/storage-service";

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
                type: true,
                videoUrl: true,
                imageUrl: true,
                storageKey: true,
                fileSize: true,
                consoleLogs: true,
                networkLogs: true,
                createdAt: true,
            },
        });

        const serialized = reports.map((r) => ({
            ...r,
            fileSize: r.fileSize != null ? Number(r.fileSize) : 0,
        }));

        return NextResponse.json(serialized);
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

        // Verify ownership and get storage info
        const report = await prisma.report.findUnique({
            where: { id },
            select: { userId: true, storageKey: true, fileSize: true },
        });
        if (!report || report.userId !== payload.userId) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Delete from storage provider if we have a key
        if (report.storageKey) {
            try {
                const provider = StorageService.getProvider();
                await provider.delete(report.storageKey);
            } catch (storageErr) {
                console.error("Failed to delete from storage provider:", storageErr);
                // Continue with DB deletion even if storage delete fails
                // The orphaned file can be cleaned up later
            }
        }

        // Delete report and reclaim storage in a transaction
        const fileSize = Number(report.fileSize || 0);
        await prisma.$transaction([
            prisma.report.delete({ where: { id } }),
            ...(fileSize > 0
                ? [
                      prisma.user.update({
                          where: { id: payload.userId as string },
                          data: { storageUsed: { decrement: fileSize } },
                      }),
                  ]
                : []),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete report:", error);
        return NextResponse.json({ error: "Failed to delete report. Please try again." }, { status: 500 });
    }
}
