import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

// ⚠️ In production, upload to S3/R2. Local filesystem for MVP.
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to public/uploads
        const filename = `${Date.now()}-${file.name}`;
        const uploadDir = join(process.cwd(), "public", "uploads");

        // Ensure dir exists - doing this sync/check for simplicity
        // const { mkdir } = require("fs/promises");
        // await mkdir(uploadDir, { recursive: true });

        // Actually, in Next.js public/ is usually static. 
        // We should write to a temp location or mocking "s3"
        // For this MVP, let's just pretend we uploaded and return a fake URL 
        // OR actually write it if we want to play it back locally.

        // writing to ./public/uploads
        const path = join(uploadDir, filename);
        await writeFile(path, buffer);

        return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (error) {
        console.error("Upload failed:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
