import { ReportActionRepository } from "@/repositories/report-action-repository";
import { Logger, type LogContext } from "@/lib/logger";
import type {
    ReportActionWithUser,
    CreateReportActionInput,
    ReportActionListOptions,
    PaginatedReportActions,
    ReportActionType,
} from "@/entities/report-action";

const reportActionRepository = new ReportActionRepository();

export class ReportActionService {
    /**
     * Record a single action on a report.
     * Fire-and-forget safe — errors are logged but never thrown.
     */
    static async record(
        input: CreateReportActionInput,
        context: LogContext
    ): Promise<ReportActionWithUser | null> {
        try {
            const action = await reportActionRepository.create(input);
            Logger.debug("Report action recorded", context, {
                actionType: input.actionType,
                reportId: input.reportId,
            });
            return action;
        } catch (error) {
            Logger.error(
                "Failed to record report action",
                error,
                context,
                {
                    userMessage: "Failed to record action history.",
                    actionType: input.actionType,
                    reportId: input.reportId,
                }
            );
            return null;
        }
    }

    /**
     * Convenience: record a REPORT_CREATED action
     */
    static async recordCreated(
        reportId: string,
        userId: string,
        reportTitle: string,
        context: LogContext
    ): Promise<void> {
        await this.record(
            {
                actionType: "REPORT_CREATED",
                description: `Report "${reportTitle}" was created`,
                reportId,
                userId,
            },
            context
        );
    }

    /**
     * Convenience: record a REPORT_UPDATED action with diff metadata
     */
    static async recordUpdated(
        reportId: string,
        userId: string,
        changedFields: string[],
        context: LogContext
    ): Promise<void> {
        const fieldList = changedFields.join(", ");
        await this.record(
            {
                actionType: "REPORT_UPDATED",
                description: `Updated: ${fieldList}`,
                metadata: { changedFields },
                reportId,
                userId,
            },
            context
        );
    }

    /**
     * Convenience: record severity or priority change with old/new values
     */
    static async recordFieldChange(
        reportId: string,
        userId: string,
        actionType: Extract<ReportActionType, "SEVERITY_CHANGED" | "PRIORITY_CHANGED">,
        fieldName: string,
        oldValue: string | null,
        newValue: string | null,
        context: LogContext
    ): Promise<void> {
        const from = oldValue ?? "none";
        const to = newValue ?? "none";
        await this.record(
            {
                actionType,
                description: `${fieldName} changed from ${from} to ${to}`,
                metadata: { field: fieldName, oldValue, newValue },
                reportId,
                userId,
            },
            context
        );
    }

    /**
     * Convenience: record a COMMENT_ADDED action
     */
    static async recordCommentAdded(
        reportId: string,
        userId: string,
        commentPreview: string,
        context: LogContext
    ): Promise<void> {
        const preview = commentPreview.length > 80
            ? `${commentPreview.slice(0, 80)}...`
            : commentPreview;
        await this.record(
            {
                actionType: "COMMENT_ADDED",
                description: `Comment added: "${preview}"`,
                metadata: { commentPreview: preview },
                reportId,
                userId,
            },
            context
        );
    }

    /**
     * Convenience: record a COMMENT_DELETED action
     */
    static async recordCommentDeleted(
        reportId: string,
        userId: string,
        context: LogContext
    ): Promise<void> {
        await this.record(
            {
                actionType: "COMMENT_DELETED",
                description: "A comment was deleted",
                reportId,
                userId,
            },
            context
        );
    }

    /**
     * Convenience: record AI_INSIGHTS_GENERATED action
     */
    static async recordAiInsightsGenerated(
        reportId: string,
        userId: string,
        insightType: string,
        context: LogContext
    ): Promise<void> {
        await this.record(
            {
                actionType: "AI_INSIGHTS_GENERATED",
                description: `AI ${insightType} insights were generated`,
                metadata: { insightType },
                reportId,
                userId,
            },
            context
        );
    }

    /**
     * Convenience: record ANNOTATIONS_UPDATED action
     */
    static async recordAnnotationsUpdated(
        reportId: string,
        userId: string,
        annotationCount: number,
        context: LogContext
    ): Promise<void> {
        await this.record(
            {
                actionType: "ANNOTATIONS_UPDATED",
                description: `Annotations updated (${annotationCount} total)`,
                metadata: { annotationCount },
                reportId,
                userId,
            },
            context
        );
    }

    /**
     * Get paginated actions for a report
     */
    static async getByReport(
        options: ReportActionListOptions,
        context: LogContext
    ): Promise<{ data: PaginatedReportActions | null; error?: string }> {
        try {
            const data = await reportActionRepository.findByReport(options);
            return { data };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to fetch report actions",
                error,
                context,
                {
                    userMessage: "Failed to load action history. Please try again.",
                    reportId: options.reportId,
                }
            );
            return { data: null, error: errorResponse.message };
        }
    }
}
