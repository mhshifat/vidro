import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { JWTManager } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    // Public paths
    if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/api/trpc")) {
        return NextResponse.next();
    }

    // Verify token
    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await JWTManager.verify(token);
    if (!payload) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
