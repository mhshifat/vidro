/**
 * Report type enum matching Prisma schema
 */
export type ReportType = "VIDEO" | "SCREENSHOT";

/**
 * Report entity type matching Prisma schema
 */
export type Report = {
    id: string;
    title: string | null;
    description: string | null;
    type: ReportType;
    videoUrl: string | null;
    imageUrl: string | null;
    storageKey: string | null;
    fileSize: bigint | number;
    transcript: string | null;
    consoleLogs: ConsoleLogEntry[] | null;
    networkLogs: NetworkLogEntry[] | null;

    // AI Insights
    severity: string | null;
    priority: string | null;
    tags: string[] | null;
    reproSteps: string | null;
    rootCause: string | null;
    logSummary: string | null;
    stakeholderSummary: string | null;
    suggestedFix: string | null;

    // Round 2 AI Features
    accessibilityAudit: string | null;
    performanceAnalysis: string | null;
    securityScan: string | null;
    testCases: string | null;
    sentiment: string | null;
    translations: Record<string, TranslationEntry> | null;
    highlightStart: number | null;
    highlightEnd: number | null;
    annotations: Annotation[] | null;

    userId: string;
    createdAt: Date;
    updatedAt: Date;
};

/**
 * Console log entry captured during recording
 */
export type ConsoleLogEntry = {
    type: "log" | "warn" | "error" | "info" | "debug";
    args?: unknown[];
    timestamp?: number;
};

/**
 * Network log entry captured during recording
 */
export type NetworkLogEntry = {
    url: string;
    method: string;
    status: number;
    duration?: number;
    timestamp?: number;
};

/**
 * Translation entry for multi-language support
 */
export type TranslationEntry = {
    title?: string;
    description?: string;
};

/**
 * Video/image annotation
 */
export type Annotation = {
    id: string;
    type: "arrow" | "box" | "text" | "highlight";
    x: number;
    y: number;
    width?: number;
    height?: number;
    text?: string;
    color?: string;
    timestamp?: number;
};

/**
 * Serialized report for API responses (BigInt converted to number)
 */
export type SerializedReport = Omit<Report, "fileSize"> & {
    fileSize: number;
};

/**
 * Report summary for list views
 */
export type ReportSummary = {
    id: string;
    title: string | null;
    description: string | null;
    type: ReportType;
    videoUrl: string | null;
    imageUrl: string | null;
    storageKey: string | null;
    fileSize: number;
    consoleLogs: ConsoleLogEntry[] | null;
    networkLogs: NetworkLogEntry[] | null;
    createdAt: Date;
};

/**
 * Input for creating a new report
 */
export type CreateReportInput = {
    title?: string;
    description?: string;
    type?: ReportType;
    videoUrl?: string;
    imageUrl?: string;
    storageKey?: string;
    fileSize?: number;
    transcript?: string;
    consoleLogs?: object[];
    networkLogs?: object[];
    annotations?: object[];
    userId: string;
};

/**
 * Input for updating a report
 */
export type UpdateReportInput = {
    title?: string;
    description?: string;
    transcript?: string;
    severity?: string;
    priority?: string;
    tags?: string[];
    reproSteps?: string;
    rootCause?: string;
    logSummary?: string;
    stakeholderSummary?: string;
    suggestedFix?: string;
    accessibilityAudit?: string;
    performanceAnalysis?: string;
    securityScan?: string;
    testCases?: string;
    sentiment?: string;
    translations?: Record<string, TranslationEntry>;
    highlightStart?: number;
    highlightEnd?: number;
    annotations?: object[];
};

/**
 * Report list query options
 */
export type ReportListOptions = {
    userId: string;
    page?: number;
    limit?: number;
    type?: ReportType;
    search?: string;
    sortBy?: "createdAt" | "title";
    sortOrder?: "asc" | "desc";
};

/**
 * Paginated report list result
 */
export type PaginatedReports = {
    reports: ReportSummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

/**
 * Helper to serialize a report (convert BigInt to number)
 */
export function serializeReport<T extends { fileSize: bigint | number }>(
    report: T
): Omit<T, "fileSize"> & { fileSize: number } {
    return {
        ...report,
        fileSize: typeof report.fileSize === "bigint" 
            ? Number(report.fileSize) 
            : report.fileSize,
    };
}
