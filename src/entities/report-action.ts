/**
 * Report action type enum matching Prisma schema
 */
export type ReportActionType =
    | "REPORT_CREATED"
    | "REPORT_UPDATED"
    | "REPORT_DELETED"
    | "COMMENT_ADDED"
    | "COMMENT_DELETED"
    | "AI_INSIGHTS_GENERATED"
    | "SEVERITY_CHANGED"
    | "PRIORITY_CHANGED"
    | "ANNOTATIONS_UPDATED"
    | "STATUS_CHANGED"
    | "ASSIGNED";

/**
 * Report action entity matching Prisma schema
 */
export type ReportAction = {
    id: string;
    actionType: ReportActionType;
    description: string;
    metadata: Record<string, unknown> | null;
    reportId: string;
    userId: string | null;
    createdAt: Date;
};

/**
 * Report action with user details for timeline display
 */
export type ReportActionWithUser = ReportAction & {
    user: {
        id: string;
        name: string | null;
        email: string;
    } | null;
};

/**
 * Input for creating a new report action
 */
export type CreateReportActionInput = {
    actionType: ReportActionType;
    description: string;
    metadata?: Record<string, unknown>;
    reportId: string;
    userId?: string;
};

/**
 * Paginated report actions result
 */
export type PaginatedReportActions = {
    actions: ReportActionWithUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

/**
 * Query options for listing report actions
 */
export type ReportActionListOptions = {
    reportId: string;
    page?: number;
    limit?: number;
    actionType?: ReportActionType;
};

/**
 * Maps action types to human-readable labels
 */
export const actionTypeLabels: Record<ReportActionType, string> = {
    REPORT_CREATED: "Report Created",
    REPORT_UPDATED: "Report Updated",
    REPORT_DELETED: "Report Deleted",
    COMMENT_ADDED: "Comment Added",
    COMMENT_DELETED: "Comment Deleted",
    AI_INSIGHTS_GENERATED: "AI Insights Generated",
    SEVERITY_CHANGED: "Severity Changed",
    PRIORITY_CHANGED: "Priority Changed",
    ANNOTATIONS_UPDATED: "Annotations Updated",
    STATUS_CHANGED: "Status Changed",
    ASSIGNED: "Report Assigned",
};

/**
 * Maps action types to icon identifiers for UI rendering
 */
export const actionTypeIcons: Record<ReportActionType, string> = {
    REPORT_CREATED: "created",
    REPORT_UPDATED: "updated",
    REPORT_DELETED: "deleted",
    COMMENT_ADDED: "comment",
    COMMENT_DELETED: "comment-deleted",
    AI_INSIGHTS_GENERATED: "ai",
    SEVERITY_CHANGED: "severity",
    PRIORITY_CHANGED: "priority",
    ANNOTATIONS_UPDATED: "annotations",
    STATUS_CHANGED: "status",
    ASSIGNED: "assigned",
};
