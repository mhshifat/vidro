/**
 * Comment entity type matching Prisma schema
 */
export type Comment = {
    id: string;
    body: string;
    timestamp: number | null;
    reportId: string;
    userId: string;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
};

/**
 * Comment with user info for API responses
 */
export type CommentWithUser = Comment & {
    user: {
        id: string;
        name: string | null;
        email: string;
    };
};

/**
 * Comment with nested replies
 */
export type CommentWithReplies = CommentWithUser & {
    replies: CommentWithReplies[];
};

/**
 * Serialized comment for API responses
 */
export type SerializedComment = {
    id: string;
    body: string;
    timestamp: number | null;
    reportId: string;
    userId: string;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
    user?: {
        id: string;
        name: string | null;
        email: string;
    };
    replies: SerializedComment[];
};

/**
 * Input for creating a new comment
 */
export type CreateCommentInput = {
    body: string;
    reportId: string;
    userId: string;
    parentId?: string;
    timestamp?: number;
};

/**
 * Input for updating a comment
 */
export type UpdateCommentInput = {
    body: string;
};

/**
 * Helper to serialize a comment with nested replies
 */
export function serializeComment(
    comment: CommentWithUser & { replies?: CommentWithUser[] }
): SerializedComment {
    return {
        id: comment.id,
        body: comment.body,
        timestamp: comment.timestamp,
        reportId: comment.reportId,
        userId: comment.userId,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        user: comment.user
            ? {
                  id: comment.user.id,
                  name: comment.user.name,
                  email: comment.user.email,
              }
            : undefined,
        replies: comment.replies?.map(serializeComment) ?? [],
    };
}
