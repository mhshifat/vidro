import { StorageService } from "@/services/storage/storage-service";
import { prisma } from "@/lib/db";
import { JWTManager } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const token = (await cookies()).get("token")?.value;
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    const payload = await JWTManager.verify(token);
    if (!payload) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    const provider = StorageService.getProvider();
    try {
        const tokens = await provider.handleCallback(code) as any;

        // Save tokens to user
        await prisma.user.update({
            where: { id: payload.userId },
            data: {
                youtubeAccessToken: tokens.access_token,
                youtubeRefreshToken: tokens.refresh_token,
                youtubeTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
            }
        });

        return NextResponse.redirect(new URL("/", req.url));
    } catch (error) {
        console.error("OAuth Callback Error", error);
        return NextResponse.json({ error: "Failed to authenticate with YouTube" }, { status: 500 });
    }
}
