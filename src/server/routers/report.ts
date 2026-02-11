import { router, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ReportService } from "@/services/report-service";
import { Logger } from "@/lib/logger";

// Zod schemas for report operations
const reportTypeSchema = z.enum(["VIDEO", "SCREENSHOT"]);

const createReportSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    type: reportTypeSchema.default("VIDEO"),
    videoUrl: z.string().optional(),
    imageUrl: z.string().optional(),
    storageKey: z.string().optional(),
    fileSize: z.number().optional(),
    transcript: z.string().optional(),
    consoleLogs: z.array(z.object({
        type: z.string(),
        args: z.array(z.unknown()),
        timestamp: z.number(),
    })).optional(),
    networkLogs: z.array(z.object({
        method: z.string(),
        url: z.string(),
        status: z.number(),
        statusText: z.string().optional(),
        duration: z.number().optional(),
        size: z.number().optional(),
        type: z.string().optional(),
        timestamp: z.number(),
    })).optional(),
    annotations: z.array(z.object({
        id: z.string(),
        type: z.enum(["arrow", "rectangle", "circle", "text", "highlight", "blur"]),
        x: z.number(),
        y: z.number(),
        width: z.number().optional(),
        height: z.number().optional(),
        color: z.string().optional(),
        strokeWidth: z.number().optional(),
        text: z.string().optional(),
        timestamp: z.number().optional(),
        endTimestamp: z.number().optional(),
    })).optional(),
});

const updateReportSchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    severity: z.string().optional(),
    priority: z.string().optional(),
    tags: z.array(z.string()).optional(),
    reproSteps: z.string().optional(),
    rootCause: z.string().optional(),
    logSummary: z.string().optional(),
    stakeholderSummary: z.string().optional(),
    suggestedFix: z.string().optional(),
    accessibilityAudit: z.string().optional(),
    performanceAnalysis: z.string().optional(),
    securityScan: z.string().optional(),
    testCases: z.string().optional(),
    sentiment: z.string().optional(),
    translations: z.record(z.string(), z.object({
        title: z.string(),
        description: z.string(),
    })).optional(),
    highlightStart: z.number().optional(),
    highlightEnd: z.number().optional(),
    annotations: z.array(z.object({
        id: z.string(),
        type: z.enum(["arrow", "rectangle", "circle", "text", "highlight", "blur"]),
        x: z.number(),
        y: z.number(),
        width: z.number().optional(),
        height: z.number().optional(),
        color: z.string().optional(),
        strokeWidth: z.number().optional(),
        text: z.string().optional(),
        timestamp: z.number().optional(),
        endTimestamp: z.number().optional(),
    })).optional(),
});

const listReportsSchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(12),
    type: reportTypeSchema.optional(),
    search: z.string().optional(),
});

export const reportRouter = router({
    /**
     * Get a single report by ID
     * Public but only returns basic info for non-owners
     */
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId ?? undefined);
            
            // If user owns the report, return full details
            if (ctx.userId) {
                const result = await ReportService.getByIdForUser(input.id, ctx.userId, context);
                if (result.error) {
                    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
                }
                if (result.report) {
                    return result.report;
                }
            }
            
            // Fallback to public view (for shared reports)
            const result = await ReportService.getById(input.id, context);
            if (result.error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            }
            if (!result.report) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
            }
            return result.report;
        }),

    /**
     * List reports for the authenticated user
     */
    list: protectedProcedure
        .input(listReportsSchema)
        .query(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId);
            const result = await ReportService.getReportsForUser(
                {
                    userId: ctx.userId,
                    page: input.page,
                    limit: input.limit,
                    type: input.type as "VIDEO" | "SCREENSHOT" | undefined,
                    search: input.search,
                },
                context
            );
            
            if (result.error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            }
            if (!result.data) {
                return { reports: [], total: 0, page: 1, totalPages: 0 };
            }
            return result.data;
        }),

    /**
     * Create a new report
     */
    create: protectedProcedure
        .input(createReportSchema)
        .mutation(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId);
            
            // Check if user can create more reports
            const canCreate = await ReportService.canCreateReport(ctx.userId, context);
            if (!canCreate.allowed) {
                throw new TRPCError({ 
                    code: "FORBIDDEN", 
                    message: canCreate.reason || "You have reached your report limit" 
                });
            }
            
            const result = await ReportService.create(
                {
                    ...input,
                    userId: ctx.userId,
                    consoleLogs: input.consoleLogs as object[] | undefined,
                    networkLogs: input.networkLogs as object[] | undefined,
                    annotations: input.annotations as object[] | undefined,
                },
                context
            );
            
            if (result.error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            }
            if (!result.report) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create report" });
            }
            return result.report;
        }),

    /**
     * Update an existing report
     */
    update: protectedProcedure
        .input(updateReportSchema)
        .mutation(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId);
            const { id, ...data } = input;
            
            const result = await ReportService.update(
                id,
                ctx.userId,
                {
                    ...data,
                    tags: data.tags as string[] | undefined,
                    translations: data.translations as Record<string, { title: string; description: string }> | undefined,
                    annotations: data.annotations as object[] | undefined,
                },
                context
            );
            
            if (result.notFound) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
            }
            if (result.forbidden) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You don't have permission to update this report" });
            }
            if (result.error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            }
            return result.report;
        }),

    /**
     * Delete a report
     */
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId);
            const result = await ReportService.delete(input.id, ctx.userId, context);
            
            if (result.notFound) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
            }
            if (result.forbidden) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You don't have permission to delete this report" });
            }
            if (result.error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            }
            return { success: true };
        }),
});
