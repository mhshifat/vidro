import { prisma } from "@/lib/db";
import type {
    Comment,
    CommentWithUser,
    CreateCommentInput,
    UpdateCommentInput,
} from "@/entities/comment";

export class CommentRepository {
    /**
     * Find a comment by ID
     */
    async findById(id: string): Promise<Comment | null> {
        const comment = await prisma.comment.findUnique({ where: { id } });
        return comment as Comment | null;
    }

    /**
     * Find a comment by ID with user info
     */
    async findByIdWithUser(id: string): Promise<CommentWithUser | null> {
        const comment = await prisma.comment.findUnique({
            where: { id },
            include: { user: { select: { id: true, name: true, email: true } } },
        });
        return comment as CommentWithUser | null;
    }

    /**
     * Find all comments for a report (flat list)
     */
    async findByReportId(reportId: string): Promise<CommentWithUser[]> {
        const comments = await prisma.comment.findMany({
            where: { reportId },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: "asc" },
        });
        return comments as CommentWithUser[];
    }

    /**
     * Create a new comment
     */
    async create(data: CreateCommentInput): Promise<CommentWithUser> {
        const comment = await prisma.comment.create({
            data: {
                body: data.body,
                reportId: data.reportId,
                userId: data.userId,
                parentId: data.parentId ?? null,
                timestamp: data.timestamp ?? null,
            },
            include: { user: { select: { id: true, name: true, email: true } } },
        });
        return comment as CommentWithUser;
    }

    /**
     * Update a comment
     */
    async update(id: string, data: UpdateCommentInput): Promise<CommentWithUser> {
        const comment = await prisma.comment.update({
            where: { id },
            data: { body: data.body },
            include: { user: { select: { id: true, name: true, email: true } } },
        });
        return comment as CommentWithUser;
    }

    /**
     * Delete a comment
     */
    async delete(id: string): Promise<void> {
        await prisma.comment.delete({ where: { id } });
    }

    /**
     * Check if user owns the comment
     */
    async isOwner(commentId: string, userId: string): Promise<boolean> {
        const comment = await prisma.comment.findFirst({
            where: { id: commentId, userId },
            select: { id: true },
        });
        return comment !== null;
    }

    /**
     * Check if parent comment exists and belongs to the same report
     */
    async validateParent(
        parentId: string,
        reportId: string
    ): Promise<{ valid: boolean; exists: boolean }> {
        const parent = await prisma.comment.findUnique({
            where: { id: parentId },
            select: { reportId: true },
        });
        if (!parent) {
            return { valid: false, exists: false };
        }
        return { valid: parent.reportId === reportId, exists: true };
    }

    /**
     * Count comments for a report
     */
    async countByReportId(reportId: string): Promise<number> {
        return prisma.comment.count({ where: { reportId } });
    }
}
