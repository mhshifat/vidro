import { google } from "googleapis";
import { BaseStorageProvider } from "./storage-provider";
import { prisma } from "@/lib/db";

export class YoutubeStorage extends BaseStorageProvider {
    private oauth2Client;

    constructor() {
        super();
        this.oauth2Client = new google.auth.OAuth2(
            process.env.YOUTUBE_CLIENT_ID,
            process.env.YOUTUBE_CLIENT_SECRET,
            process.env.YOUTUBE_REDIRECT_URI
        );
    }

    getAuthUrl(): string {
        return this.oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: [
                "https://www.googleapis.com/auth/youtube.upload",
                "https://www.googleapis.com/auth/youtube.readonly",
            ],
            prompt: "consent", // Force refresh token
        });
    }

    async handleCallback(code: string): Promise<unknown> {
        const { tokens } = await this.oauth2Client.getToken(code);
        return tokens;
    }

    async isAuthenticated(userId: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { youtubeAccessToken: true },
        });
        return !!user?.youtubeAccessToken;
    }

    async getUploadUrl(_fileName: string, _contentType: string): Promise<string> {
        // For YouTube, we don't get a presigned URL for direct PUT like S3.
        // Instead, the client (Extension) will use the Access Token to upload directly to Google API.
        // This method might return the Access Token or an empty string if we handle it differently.
        // In our architecture, the client asks for credentials, not just a URL.
        throw new Error("Use getCredentials for YouTube");
    }

    async getCredentials(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.youtubeAccessToken) {
            throw new Error("User not authenticated with YouTube");
        }

        // Check expiry and refresh if needed
        if (user.youtubeTokenExpiry && user.youtubeTokenExpiry < new Date()) {
            if (!user.youtubeRefreshToken) {
                throw new Error("Token expired and no refresh token available");
            }
            this.oauth2Client.setCredentials({
                refresh_token: user.youtubeRefreshToken
            });
            const { credentials } = await this.oauth2Client.refreshAccessToken();

            // Update DB
            await prisma.user.update({
                where: { id: userId },
                data: {
                    youtubeAccessToken: credentials.access_token,
                    youtubeTokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined
                }
            });

            return credentials.access_token;
        }

        return user.youtubeAccessToken;
    }
}
