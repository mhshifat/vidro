import { StorageService } from "@/services/storage/storage-service";
import { NextResponse } from "next/server";

export async function GET() {
    const provider = StorageService.getProvider();
    const url = provider.getAuthUrl();
    return NextResponse.redirect(url);
}
