import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { Logger, formatErrorResponse } from "@/lib/logger";
import { v2 as cloudinary } from "cloudinary";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

/**
 * POST /api/upload/sign
 *
 * Returns a signed Cloudinary upload payload so the client can upload
 * directly to Cloudinary, bypassing the Vercel serverless function
 * body-size limit (~4.5 MB).
 *
 * Request body: { fileSize: number, isImage: boolean }
 * Response:     { signature, timestamp, apiKey, cloudName, folder, publicId, resourceType }
 */
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Not authenticated. Please log in." }, { status: 401 });
        }
        const payload = await JWTManager.verify(token);
        if (!payload) {
            return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
        }
        const userId = payload.userId as string;

        const body = await req.json().catch(() => null);
        if (!body || typeof body.fileSize !== "number" || typeof body.isImage !== "boolean") {
            return NextResponse.json({ error: "Invalid request. Expected { fileSize, isImage }." }, { status: 400 });
        }

        const { fileSize, isImage } = body as { fileSize: number; isImage: boolean };

        if (fileSize > MAX_FILE_SIZE) {
            return NextResponse.json(
                {
                    error: "File too large",
                    detail: `${(fileSize / (1024 * 1024)).toFixed(1)} MB exceeds the 100 MB per-recording limit.`,
                    code: "FILE_TOO_LARGE",
                },
                { status: 413 }
            );
        }

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
                },
                { status: 429 }
            );
        }

        if (storageUsed + fileSize > storageLimit) {
            return NextResponse.json(
                {
                    error: "Storage quota exceeded",
                    detail: `You've used ${(storageUsed / (1024 * 1024)).toFixed(1)} MB of ${(storageLimit / (1024 * 1024)).toFixed(0)} MB. This ${(fileSize / (1024 * 1024)).toFixed(1)} MB file would exceed your limit.`,
                    code: "STORAGE_QUOTA",
                },
                { status: 429 }
            );
        }

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json({ error: "Storage not configured." }, { status: 500 });
        }

        cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

        const folder = isImage ? "vidro/screenshots" : "vidro/recordings";
        const publicId = `${isImage ? "screenshots" : "recordings"}/${userId}/${Date.now()}`;
        const timestamp = Math.round(Date.now() / 1000);
        const resourceType = "video"; // Cloudinary uses "video" for both video and large images via upload_stream

        const paramsToSign: Record<string, string | number> = {
            timestamp,
            folder,
            public_id: publicId,
            overwrite: 1,
        };

        const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

        return NextResponse.json({
            signature,
            timestamp,
            apiKey,
            cloudName,
            folder,
            publicId,
            resourceType,
        });
    } catch (error) {
        const context = Logger.createContext();
        const result = Logger.error(
            "Upload sign failed",
            error,
            context,
            { userMessage: "Failed to prepare upload. Please try again." }
        );
        return NextResponse.json(
            formatErrorResponse(result.message, result.correlationId),
            { status: 500 }
        );
    }
}
