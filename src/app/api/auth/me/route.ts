import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const payload = await JWTManager.verify(token);
        if (!payload?.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true },
        });
        if (!user) {
            return NextResponse.json({ error: "Session invalid" }, { status: 401 });
        }

        return NextResponse.json({ userId: user.id });
    } catch {
        return NextResponse.json({ error: "Auth check failed" }, { status: 500 });
    }
}
