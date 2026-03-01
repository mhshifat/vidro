import { getSeoMeta } from "@/lib/seo";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { JWTManager } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { SettingsContent } from "./settings-content";

async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const payload = await JWTManager.verify(token);
    if (!payload?.userId) return null;
    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true },
    });
    return user?.id ?? null;
}

export default async function SettingsPage() {
    const userId = await getCurrentUser();
    if (!userId) redirect("/api/auth/logout?redirect=/login");

    const meta = getSeoMeta("dashboard");
    return (
        <>
            <head>
                <title>Settings — {meta.title}</title>
                <meta name="description" content={meta.description} />
            </head>
            <SettingsContent />
        </>
    );
}
