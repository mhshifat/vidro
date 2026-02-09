import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { JWTManager } from "@/lib/jwt";

/** Routes that require the user to be logged OUT (guest-only). */
const AUTH_ROUTES = ["/login", "/register"];

/** Routes that require the user to be logged IN. */
const PROTECTED_ROUTES = ["/dashboard", "/report/new"];

function isAuthRoute(pathname: string): boolean {
    return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    // Verify token once
    const payload = token ? await JWTManager.verify(token) : null;
    const isAuthenticated = payload !== null;

    // Logged-in users should not see auth pages → redirect to dashboard
    if (isAuthenticated && isAuthRoute(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Guests should not see protected pages → redirect to login
    if (!isAuthenticated && isProtectedRoute(pathname)) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
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
         * - favicon.ico, icon, public assets
         */
        "/((?!api|_next/static|_next/image|favicon.ico|icon).*)",
    ],
};
