import { Pool } from "pg";
import Cursor from "pg-cursor";
    /**
     * Stream large report datasets for a user (pg-cursor)
     */
    async findManyStream(options: ReportListOptions, onRow: (row: ReportSummary) => void, onEnd?: () => void): Promise<void> {
        // Only use for very large datasets
        const {
            userId,
            type,
            search,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = options;

        // Build SQL and params
        let sql = `SELECT id, title, description, type, video_url AS "videoUrl", image_url AS "imageUrl", storage_key AS "storageKey", file_size AS "fileSize", console_logs AS "consoleLogs", network_logs AS "networkLogs", created_at AS "createdAt" FROM report WHERE user_id = $1`;
        const params: any[] = [userId];
        let idx = 2;
        if (type) {
            sql += ` AND type = $${idx}`;
            params.push(type);
            idx++;
        }
        if (search) {
            sql += ` AND (title ILIKE $${idx} OR description ILIKE $${idx})`;
            params.push(`%${search}%`);
            idx++;
        }
        sql += ` ORDER BY ${sortBy} ${sortOrder}`;

        // Use pg Pool for streaming
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const client = await pool.connect();
        try {
            const cursor = client.query(new Cursor(sql, params));
            const read = () => {
                cursor.read(100, (err, rows) => {
                    if (err) {
                        cursor.close(() => client.release());
                        throw err;
                    }
                    if (!rows.length) {
                        cursor.close(() => client.release());
                        if (onEnd) onEnd();
                        return;
                    }
                    for (const row of rows) {
                        row.fileSize = Number(row.fileSize);
                        row.consoleLogs = row.consoleLogs as ReportSummary["consoleLogs"];
                        row.networkLogs = row.networkLogs as ReportSummary["networkLogs"];
                        onRow(row);
                    }
                    read();
                });
            };
            read();
        } catch (err) {
            client.release();
            throw err;
        }
    }
import { prisma } from "@/lib/db";
import type {
    Report,
    ReportSummary,
    CreateReportInput,
    UpdateReportInput,
    ReportListOptions,
    PaginatedReports,
    ReportType,
} from "@/entities/report";

const DEFAULT_PAGE_SIZE = 20;

export class ReportRepository {
    /**
     * Find a report by ID
     */
    async findById(id: string): Promise<Report | null> {
        const report = await prisma.report.findUnique({ where: { id } });
        return report as Report | null;
    }

    /**
     * Find a report by ID with ownership check
     */
    async findByIdAndUser(id: string, userId: string): Promise<Report | null> {
        const report = await prisma.report.findFirst({
            where: { id, userId },
        });
        return report as Report | null;
    }

    /**
     * Get paginated list of reports for a user
     */
    async findMany(options: ReportListOptions): Promise<PaginatedReports> {
        const {
            userId,
            page = 1,
            limit = DEFAULT_PAGE_SIZE,
            type,
            search,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = options;

        const skip = (page - 1) * limit;

        // Build where clause
        const where: {
            userId: string;
            type?: ReportType;
            OR?: { title?: { contains: string; mode: "insensitive" }; description?: { contains: string; mode: "insensitive" } }[];
        } = { userId };

        if (type) {
            where.type = type;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        // Execute count and find in parallel
        const [total, reports] = await Promise.all([
            prisma.report.count({ where }),
            prisma.report.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    type: true,
                    videoUrl: true,
                    imageUrl: true,
                    storageKey: true,
                    fileSize: true,
                    consoleLogs: true,
                    networkLogs: true,
                    createdAt: true,
                },
            }),
        ]);

        const serializedReports: ReportSummary[] = reports.map((r) => ({
            ...r,
            fileSize: Number(r.fileSize),
            consoleLogs: r.consoleLogs as ReportSummary["consoleLogs"],
            networkLogs: r.networkLogs as ReportSummary["networkLogs"],
        }));

        return {
            reports: serializedReports,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Create a new report
     */
    async create(data: CreateReportInput): Promise<Report> {
        const report = await prisma.report.create({
            data: {
                title: data.title || (data.type === "SCREENSHOT" ? "Screenshot" : "Untitled Bug Report"),
                description: data.description,
                type: data.type ?? "VIDEO",
                videoUrl: data.videoUrl ?? null,
                imageUrl: data.imageUrl ?? null,
                storageKey: data.storageKey,
                fileSize: data.fileSize ?? 0,
                transcript: data.transcript ?? null,
                // Prisma.InputJsonValue requires casting for arrays
                consoleLogs: data.consoleLogs as object[] ?? [],
                networkLogs: data.networkLogs as object[] ?? [],
                userId: data.userId,
            },
        });
        return report as Report;
    }

    /**
     * Update a report
     */
    async update(id: string, data: UpdateReportInput): Promise<Report> {
        const report = await prisma.report.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                transcript: data.transcript,
                severity: data.severity,
                priority: data.priority,
                tags: data.tags,
                reproSteps: data.reproSteps,
                rootCause: data.rootCause,
                logSummary: data.logSummary,
                stakeholderSummary: data.stakeholderSummary,
                suggestedFix: data.suggestedFix,
                accessibilityAudit: data.accessibilityAudit,
                performanceAnalysis: data.performanceAnalysis,
                securityScan: data.securityScan,
                testCases: data.testCases,
                sentiment: data.sentiment,
                translations: data.translations,
                highlightStart: data.highlightStart,
                highlightEnd: data.highlightEnd,
                annotations: data.annotations,
            },
        });
        return report as Report;
    }

    /**
     * Delete a report
     */
    async delete(id: string): Promise<void> {
        await prisma.report.delete({ where: { id } });
    }

    /**
     * Delete a report and reclaim storage in a transaction
     */
    async deleteWithStorageReclaim(
        id: string,
        userId: string,
        fileSize: number
    ): Promise<void> {
        await prisma.$transaction([
            prisma.report.delete({ where: { id } }),
            ...(fileSize > 0
                ? [
                      prisma.user.update({
                          where: { id: userId },
                          data: { storageUsed: { decrement: fileSize } },
                      }),
                  ]
                : []),
        ]);
    }

    /**
     * Get report count and limit for a user
     */
    async countByUser(userId: string): Promise<{ count: number; maxReports: number }> {
        const [count, user] = await Promise.all([
            prisma.report.count({ where: { userId } }),
            prisma.user.findUnique({
                where: { id: userId },
                select: { maxReports: true },
            }),
        ]);
        return { count, maxReports: user?.maxReports ?? 25 };
    }

    /**
     * Check if user owns the report
     */
    async isOwner(reportId: string, userId: string): Promise<boolean> {
        const report = await prisma.report.findFirst({
            where: { id: reportId, userId },
            select: { id: true },
        });
        return report !== null;
    }

    /**
     * Get storage info for a report
     */
    async getStorageInfo(id: string): Promise<{ storageKey: string | null; fileSize: number } | null> {
        const report = await prisma.report.findUnique({
            where: { id },
            select: { storageKey: true, fileSize: true },
        });
        if (!report) return null;
        return {
            storageKey: report.storageKey,
            fileSize: Number(report.fileSize),
        };
    }
}
