import { ReportRepository } from "@/repositories/report-repository";
import { prisma } from "@/lib/db";
import { StorageService } from "@/services/storage/storage-service";
import { Logger, type LogContext } from "@/lib/logger";
import { ReportActionService } from "@/services/report-action-service";
import type {
    Report,
    CreateReportInput,
    UpdateReportInput,
    ReportListOptions,
    PaginatedReports,
    SerializedReport,
} from "@/entities/report";

const reportRepository = new ReportRepository();

export class ReportService {
    /**
     * Get a report by ID
     */
    static async getById(
        id: string,
        context: LogContext
    ): Promise<{ report: SerializedReport | null; error?: string }> {
        try {
            const report = await reportRepository.findById(id);
            if (!report) {
                return { report: null };
            }
            return {
                report: {
                    ...report,
                    fileSize: Number(report.fileSize),
                } as SerializedReport,
            };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to fetch report",
                error,
                context,
                { userMessage: "Failed to load report. Please try again.", reportId: id }
            );
            return { report: null, error: errorResponse.message };
        }
    }

    /**
     * Get a report by ID with ownership verification
     */
    static async getByIdForUser(
        id: string,
        userId: string,
        context: LogContext
    ): Promise<{ report: SerializedReport | null; error?: string }> {
        try {
            const report = await reportRepository.findByIdAndUser(id, userId);
            if (!report) {
                return { report: null };
            }
            return {
                report: {
                    ...report,
                    fileSize: Number(report.fileSize),
                } as SerializedReport,
            };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to fetch report for user",
                error,
                context,
                { userMessage: "Failed to load report. Please try again.", reportId: id, userId }
            );
            return { report: null, error: errorResponse.message };
        }
    }

    /**
     * Get paginated list of reports for a user
     */
    static async getReportsForUser(
        options: ReportListOptions,
        context: LogContext
    ): Promise<{ data: PaginatedReports | null; error?: string }> {
        try {
            const data = await reportRepository.findMany(options);
            return { data };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to fetch reports",
                error,
                context,
                { userMessage: "Failed to load reports. Please try again.", userId: options.userId }
            );
            return { data: null, error: errorResponse.message };
        }
    }

    /**
     * Create a new report
     */
    static async create(
        data: CreateReportInput,
        context: LogContext
    ): Promise<{ report: SerializedReport | null; error?: string }> {
        try {
            // Transaction: create report and update user storage
            const report = await prisma.$transaction(async (tx) => {
                const created = await tx.report.create({
                    data: {
                        title: data.title || (data.type === "SCREENSHOT" ? "Screenshot" : "Untitled Bug Report"),
                        description: data.description,
                        type: data.type ?? "VIDEO",
                        videoUrl: data.videoUrl ?? null,
                        imageUrl: data.imageUrl ?? null,
                        storageKey: data.storageKey,
                        fileSize: data.fileSize ?? 0,
                        transcript: data.transcript ?? null,
                        userId: data.userId,
                        consoleLogs: data.consoleLogs ?? undefined,
                        networkLogs: data.networkLogs ?? undefined,
                    },
                });
                await tx.user.update({
                    where: { id: data.userId },
                    data: { storageUsed: { increment: data.fileSize ?? 0 } },
                });
                return created;
            });
            Logger.info("Report created", context, { reportId: report.id, userId: data.userId });

            ReportActionService.recordCreated(
                report.id,
                data.userId,
                report.title ?? "Untitled Report",
                context
            );

            return {
                report: {
                    ...report,
                    fileSize: Number(report.fileSize),
                } as SerializedReport,
            };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to create report",
                error,
                context,
                { userMessage: "Failed to save report. Please try again.", userId: data.userId }
            );
            return { report: null, error: errorResponse.message };
        }
    }

    /**
     * Update a report (with ownership check)
     */
    static async update(
        id: string,
        userId: string,
        data: UpdateReportInput,
        context: LogContext
    ): Promise<{ report: SerializedReport | null; error?: string; notFound?: boolean; forbidden?: boolean }> {
        try {
            // Check ownership
            const existing = await reportRepository.findById(id);
            if (!existing) {
                return { report: null, notFound: true };
            }
            if (existing.userId !== userId) {
                return { report: null, forbidden: true };
            }

            const report = await reportRepository.update(id, data);
            Logger.info("Report updated", context, { reportId: id, userId });

            const actuallyChangedFields = Object.keys(data).filter((key) => {
                const newVal = data[key as keyof UpdateReportInput];
                if (newVal === undefined) return false;
                const oldVal = existing[key as keyof typeof existing];
                if (typeof newVal === "object" || typeof oldVal === "object") {
                    return JSON.stringify(newVal) !== JSON.stringify(oldVal);
                }
                return newVal !== oldVal;
            });

            if (actuallyChangedFields.length === 0) {
                return {
                    report: {
                        ...report,
                        fileSize: Number(report.fileSize),
                    } as SerializedReport,
                };
            }

            if (actuallyChangedFields.includes("severity")) {
                ReportActionService.recordFieldChange(
                    id, userId, "SEVERITY_CHANGED", "Severity",
                    existing.severity, data.severity ?? null, context
                );
            }
            if (actuallyChangedFields.includes("priority")) {
                ReportActionService.recordFieldChange(
                    id, userId, "PRIORITY_CHANGED", "Priority",
                    existing.priority, data.priority ?? null, context
                );
            }

            const nonTrackedFields = actuallyChangedFields.filter(
                (f) => f !== "severity" && f !== "priority"
            );
            if (nonTrackedFields.length > 0) {
                if (nonTrackedFields.length === 1 && nonTrackedFields[0] === "annotations") {
                    const annotationCount = Array.isArray(data.annotations) ? data.annotations.length : 0;
                    ReportActionService.recordAnnotationsUpdated(id, userId, annotationCount, context);
                } else {
                    ReportActionService.recordUpdated(id, userId, nonTrackedFields, context);
                }
            }

            return {
                report: {
                    ...report,
                    fileSize: Number(report.fileSize),
                } as SerializedReport,
            };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to update report",
                error,
                context,
                { userMessage: "Failed to update report. Please try again.", reportId: id, userId }
            );
            return { report: null, error: errorResponse.message };
        }
    }

    /**
     * Delete a report (with ownership check and storage cleanup)
     */
    static async delete(
        id: string,
        userId: string,
        context: LogContext
    ): Promise<{ success: boolean; error?: string; notFound?: boolean; forbidden?: boolean }> {
        try {
            // Check if report exists first
            const reportExists = await reportRepository.findById(id);
            if (!reportExists) {
                return { success: false, notFound: true };
            }

            // Verify ownership
            const existing = await reportRepository.findByIdAndUser(id, userId);
            if (!existing) {
                return { success: false, forbidden: true };
            }

            const storageInfo = await reportRepository.getStorageInfo(id);

            // Delete from storage provider if we have a key
            if (storageInfo?.storageKey) {
                try {
                    const provider = StorageService.getProvider();
                    await provider.delete(storageInfo.storageKey);
                } catch (storageErr) {
                    Logger.warn(
                        "Failed to delete from storage provider",
                        context,
                        { error: storageErr, storageKey: storageInfo.storageKey }
                    );
                    // Continue with DB deletion even if storage delete fails
                }
            }

            // Transaction: delete report and reclaim storage
            const fileSize = storageInfo?.fileSize ?? 0;
            await prisma.$transaction(async (tx) => {
                await tx.report.delete({ where: { id } });
                await tx.user.update({
                    where: { id: userId },
                    data: { storageUsed: { decrement: fileSize } },
                });
            });

            Logger.info("Report deleted", context, { reportId: id, userId, fileSize });
            return { success: true };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to delete report",
                error,
                context,
                { userMessage: "Failed to delete report. Please try again.", reportId: id, userId }
            );
            return { success: false, error: errorResponse.message };
        }
    }

    /**
     * Check if user can create more reports
     */
    static async canCreateReport(
        userId: string,
        context: LogContext
    ): Promise<{ allowed: boolean; count: number; limit: number; reason?: string }> {
        try {
            const { count, maxReports } = await reportRepository.countByUser(userId);
            if (count >= maxReports) {
                return { 
                    allowed: false, 
                    count, 
                    limit: maxReports,
                    reason: `You have reached your limit of ${maxReports} reports. Please delete some reports to create new ones.`
                };
            }
            return { allowed: true, count, limit: maxReports };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to check report limit",
                error,
                context,
                { userMessage: "Failed to verify report limit.", userId }
            );
            return { allowed: false, count: 0, limit: 0, reason: errorResponse.message };
        }
    }
}
