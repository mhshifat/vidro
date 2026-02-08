export type User = {
    id: string;
    email: string;
    password?: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
    youtubeAccessToken?: string | null;
    youtubeRefreshToken?: string | null;
    youtubeTokenExpiry?: Date | null;
};
