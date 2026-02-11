export type User = {
    id: string;
    email: string;
    password?: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
    
    // Email verification
    emailVerified?: boolean;
    emailVerificationToken?: string | null;
    emailVerificationExpiry?: Date | null;

    // Storage & quotas
    storageUsed?: bigint | number;
    storageLimit?: bigint | number;
    maxReports?: number;

    // YouTube tokens
    youtubeAccessToken?: string | null;
    youtubeRefreshToken?: string | null;
    youtubeTokenExpiry?: Date | null;
};
