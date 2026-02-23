import { NextResponse } from "next/server";

/**
 * DEPRECATED: This route previously handled file uploads by proxying
 * them through the Vercel serverless function. This fails on Vercel
 * because serverless functions have a ~4.5 MB body limit.
 *
 * The new flow uses:
 *   1. POST /api/upload/sign — returns signed Cloudinary params
 *   2. Client uploads directly to Cloudinary (no size limit)
 *
 * This stub returns a helpful error if anything still hits this route.
 */
export async function POST() {
    return NextResponse.json(
        {
            error: "This upload endpoint is deprecated. Use /api/upload/sign for direct uploads.",
            code: "DEPRECATED",
        },
        { status: 410 }
    );
}
