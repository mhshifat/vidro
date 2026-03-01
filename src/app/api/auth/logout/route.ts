import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/** GET with ?redirect=/login — clears session and redirects (breaks redirect loop when user no longer in DB). */
export async function GET(request: Request) {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    const { searchParams } = new URL(request.url);
    const redirectTo = searchParams.get("redirect") ?? "/login";
    const base = process.env.NEXT_PUBLIC_APP_URL ?? request.url.split("/api")[0] ?? "http://localhost:3000";
    return NextResponse.redirect(new URL(redirectTo, base));
}

export async function POST() {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    return NextResponse.json({ success: true });
}
