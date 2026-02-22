import { CommentRepository } from "@/repositories/comment-repository";
import { ReportRepository } from "@/repositories/report-repository";
import { Logger, type LogContext } from "@/lib/logger";
import { ReportActionService } from "@/services/report-action-service";
import type {
    CommentWithUser,
    CreateCommentInput,
    UpdateCommentInput,
    SerializedComment,
} from "@/entities/comment";

const commentRepository = new CommentRepository();
const reportRepository = new ReportRepository();

export class CommentService {
    /**
     * Get all comments for a report
     */
    static async getCommentsForReport(
        reportId: string,
        context: LogContext
    ): Promise<{ comments: SerializedComment[]; error?: string }> {
        try {
            const comments = await commentRepository.findByReportId(reportId);
            const serialized = comments.map((c) => ({
                id: c.id,
                body: c.body,
                timestamp: c.timestamp,
                reportId: c.reportId,
                userId: c.userId,
                parentId: c.parentId,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
                user: c.user
                    ? { id: c.user.id, name: c.user.name, email: c.user.email }
                    : undefined,
                replies: [],
            }));
            return { comments: serialized };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to fetch comments",
                error,
                context,
                { userMessage: "Failed to load comments. Please try again.", reportId }
            );
            return { comments: [], error: errorResponse.message };
        }
    }

    /**
     * Create a new comment
     */
    static async create(
        data: Omit<CreateCommentInput, "userId">,
        userId: string,
        context: LogContext
    ): Promise<{ comment: SerializedComment | null; error?: string; notFound?: boolean }> {
        try {
            // Validate report exists
            const report = await reportRepository.findById(data.reportId);
            if (!report) {
                return { comment: null, notFound: true };
            }

            // Validate parent if replying
            if (data.parentId) {
                const parentCheck = await commentRepository.validateParent(
                    data.parentId,
                    data.reportId
                );
                if (!parentCheck.exists) {
                    return { comment: null, notFound: true, error: "Parent comment not found." };
                }
                if (!parentCheck.valid) {
                    return { comment: null, error: "Parent comment belongs to a different report." };
                }
            }

            const comment = await commentRepository.create({
                body: data.body,
                reportId: data.reportId,
                userId,
                parentId: data.parentId,
                timestamp: data.timestamp,
            });

            Logger.info("Comment created", context, {
                commentId: comment.id,
                reportId: data.reportId,
                userId,
            });

            ReportActionService.recordCommentAdded(
                data.reportId,
                userId,
                data.body,
                context
            );

            return {
                comment: {
                    id: comment.id,
                    body: comment.body,
                    timestamp: comment.timestamp,
                    reportId: comment.reportId,
                    userId: comment.userId,
                    parentId: comment.parentId,
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                    user: comment.user
                        ? { id: comment.user.id, name: comment.user.name, email: comment.user.email }
                        : undefined,
                    replies: [],
                },
            };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to create comment",
                error,
                context,
                { userMessage: "Failed to add comment. Please try again.", reportId: data.reportId, userId }
            );
            return { comment: null, error: errorResponse.message };
        }
    }

    /**
     * Update a comment (with ownership check)
     */
    static async update(
        id: string,
        userId: string,
        data: UpdateCommentInput,
        context: LogContext
    ): Promise<{ comment: SerializedComment | null; error?: string; notFound?: boolean; forbidden?: boolean }> {
        try {
            // Check existence
            const existing = await commentRepository.findById(id);
            if (!existing) {
                return { comment: null, notFound: true };
            }

            // Check ownership
            if (existing.userId !== userId) {
                return { comment: null, forbidden: true };
            }

            const comment = await commentRepository.update(id, data);

            Logger.info("Comment updated", context, { commentId: id, userId });

            return {
                comment: {
                    id: comment.id,
                    body: comment.body,
                    timestamp: comment.timestamp,
                    reportId: comment.reportId,
                    userId: comment.userId,
                    parentId: comment.parentId,
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                    user: comment.user
                        ? { id: comment.user.id, name: comment.user.name, email: comment.user.email }
                        : undefined,
                    replies: [],
                },
            };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to update comment",
                error,
                context,
                { userMessage: "Failed to update comment. Please try again.", commentId: id, userId }
            );
            return { comment: null, error: errorResponse.message };
        }
    }

    /**
     * Delete a comment (with ownership check)
     */
    static async delete(
        id: string,
        userId: string,
        context: LogContext
    ): Promise<{ success: boolean; error?: string; notFound?: boolean; forbidden?: boolean }> {
        try {
            // Check existence
            const existing = await commentRepository.findById(id);
            if (!existing) {
                return { success: false, notFound: true };
            }

            // Check ownership
            if (existing.userId !== userId) {
                return { success: false, forbidden: true };
            }

            await commentRepository.delete(id);

            Logger.info("Comment deleted", context, { commentId: id, userId });

            ReportActionService.recordCommentDeleted(
                existing.reportId,
                userId,
                context
            );

            return { success: true };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to delete comment",
                error,
                context,
                { userMessage: "Failed to delete comment. Please try again.", commentId: id, userId }
            );
            return { success: false, error: errorResponse.message };
        }
    }
}
