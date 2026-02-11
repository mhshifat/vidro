/**
 * Dashboard type definitions
 */

export interface ReportSummary {
    id: string;
    title: string | null;
    description: string | null;
    type: 'VIDEO' | 'SCREENSHOT';
    videoUrl: string | null;
    imageUrl: string | null;
    storageKey: string | null;
    fileSize: number | null;
    consoleLogs: unknown[] | null;
    networkLogs: unknown[] | null;
    severity?: string | null;
    priority?: string | null;
    tags?: string[] | null;
    matchedFields?: string[];
    createdAt: string;
}

export interface PaginatedReports {
    reports: ReportSummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UsageInfo {
    storage: {
        usedBytes: number;
        limitBytes: number;
        usedMB: number;
        limitMB: number;
        remainingBytes: number;
        percentUsed: number;
    };
    reports: {
        used: number;
        limit: number;
        remaining: number;
    };
    perRecording: {
        maxFileSizeMB: number;
        maxDurationSeconds: number | null;
        maxResolution: string;
        maxFps: number;
        codec: string;
    };
}
