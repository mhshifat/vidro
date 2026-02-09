import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { StorageService } from "@/services/storage/storage-service";
import { prisma } from "@/lib/db";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB per file

export async function POST(req: Request) {
    let userId: string | undefined;

    try {
        // ── 1. Authenticate ──────────────────────────────────
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Not authenticated. Please log in." }, { status: 401 });
        }
        const payload = await JWTManager.verify(token);
        if (!payload) {
            return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
        }
        userId = payload.userId as string;

        // ── 2. Parse file ────────────────────────────────────
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch {
            return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
        }

        const file = formData.get("file") as File;
        if (!file) {
            return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
        }
        if (!file.type.startsWith("video/")) {
            return NextResponse.json({ error: "Only video files are accepted." }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // ── 3. Validate per-file size ────────────────────────
        if (buffer.byteLength > MAX_FILE_SIZE) {
            return NextResponse.json(
                {
                    error: "File too large",
                    detail: `${(buffer.byteLength / (1024 * 1024)).toFixed(1)} MB exceeds the 100 MB per-recording limit.`,
                    code: "FILE_TOO_LARGE",
                },
                { status: 413 }
            );
        }

        // ── 4. Check per-user quota ──────────────────────────
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                storageUsed: true,
                storageLimit: true,
                maxReports: true,
                _count: { select: { reports: true } },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        const storageUsed = Number(user.storageUsed);
        const storageLimit = Number(user.storageLimit);

        if (user._count.reports >= user.maxReports) {
            return NextResponse.json(
                {
                    error: "Report limit reached",
                    detail: `You've used ${user._count.reports} of ${user.maxReports} reports. Delete old reports to free up space.`,
                    code: "REPORT_LIMIT",
                    usage: {
                        reportsUsed: user._count.reports,
                        reportsLimit: user.maxReports,
                    },
                },
                { status: 429 }
            );
        }

        if (storageUsed + buffer.byteLength > storageLimit) {
            return NextResponse.json(
                {
                    error: "Storage quota exceeded",
                    detail: `You've used ${(storageUsed / (1024 * 1024)).toFixed(1)} MB of ${(storageLimit / (1024 * 1024)).toFixed(0)} MB. This ${(buffer.byteLength / (1024 * 1024)).toFixed(1)} MB recording would exceed your limit. Delete old reports to free up space.`,
                    code: "STORAGE_QUOTA",
                    usage: {
                        usedMB: parseFloat((storageUsed / (1024 * 1024)).toFixed(1)),
                        limitMB: parseFloat((storageLimit / (1024 * 1024)).toFixed(0)),
                        fileSizeMB: parseFloat((buffer.byteLength / (1024 * 1024)).toFixed(1)),
                    },
                },
                { status: 429 }
            );
        }

        // ── 5. Upload to storage provider ────────────────────
        const key = `recordings/${userId}/${Date.now()}-${file.name}`;
        const provider = StorageService.getProvider();

        let result: { url: string; key: string };
        try {
            result = await provider.upload(buffer, key, file.type || "video/webm");
        } catch (uploadErr: any) {
            console.error("Storage provider upload failed:", uploadErr);

            // Map Cloudinary specific errors to user-friendly messages
            const msg = uploadErr?.message || "";
            if (msg.includes("File size too large")) {
                return NextResponse.json(
                    { error: "File rejected by storage provider — too large.", code: "PROVIDER_SIZE_LIMIT" },
                    { status: 413 }
                );
            }
            if (msg.includes("Invalid") || msg.includes("Unsupported")) {
                return NextResponse.json(
                    { error: "File format not supported. Please upload a WebM video.", code: "INVALID_FORMAT" },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { error: "Upload to storage failed. Please try again.", code: "UPLOAD_FAILED" },
                { status: 502 }
            );
        }

        // ── 6. Update user's storage usage ───────────────────
        await prisma.user.update({
            where: { id: userId },
            data: {
                storageUsed: { increment: buffer.byteLength },
            },
        });

        return NextResponse.json({
            url: result.url,
            key: result.key,
            fileSize: buffer.byteLength,
        });
    } catch (error: any) {
        console.error("Upload failed:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred. Please try again." },
            { status: 500 }
        );
    }
}
