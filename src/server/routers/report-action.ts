import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ReportActionService } from "@/services/report-action-service";
import { Logger } from "@/lib/logger";

const reportActionTypeSchema = z.enum([
    "REPORT_CREATED",
    "REPORT_UPDATED",
    "REPORT_DELETED",
    "COMMENT_ADDED",
    "COMMENT_DELETED",
    "AI_INSIGHTS_GENERATED",
    "SEVERITY_CHANGED",
    "PRIORITY_CHANGED",
    "ANNOTATIONS_UPDATED",
    "STATUS_CHANGED",
    "ASSIGNED",
]);

const listReportActionsSchema = z.object({
    reportId: z.string(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    actionType: reportActionTypeSchema.optional(),
});

export const reportActionRouter = router({
    /**
     * Get paginated action history for a report.
     * Public so shared report viewers can see the timeline.
     */
    list: publicProcedure
        .input(listReportActionsSchema)
        .query(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId ?? undefined);

            const result = await ReportActionService.getByReport(
                {
                    reportId: input.reportId,
                    page: input.page,
                    limit: input.limit,
                    actionType: input.actionType as typeof input.actionType,
                },
                context
            );

            if (result.error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: result.error,
                });
            }
            if (!result.data) {
                return { actions: [], total: 0, page: 1, limit: 20, totalPages: 0 };
            }
            return result.data;
        }),
});
