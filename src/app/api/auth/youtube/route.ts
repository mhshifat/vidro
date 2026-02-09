import { YoutubeStorage } from "@/services/storage/youtube-storage";
import { NextResponse } from "next/server";

export async function GET() {
    const youtube = new YoutubeStorage();
    const url = youtube.getAuthUrl();
    return NextResponse.redirect(url);
}
