import { router, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { CommentService } from "@/services/comment-service";
import { Logger } from "@/lib/logger";

// Zod schemas for comment operations
const createCommentSchema = z.object({
    reportId: z.string(),
    body: z.string().min(1, "Comment cannot be empty"),
    parentId: z.string().optional(),
    timestamp: z.number().optional(),
});

const updateCommentSchema = z.object({
    id: z.string(),
    body: z.string().min(1, "Comment cannot be empty"),
});

export const commentRouter = router({
    /**
     * Get all comments for a report
     * Public - anyone can view comments on a report
     */
    getByReportId: publicProcedure
        .input(z.object({ reportId: z.string() }))
        .query(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId ?? undefined);
            const result = await CommentService.getCommentsForReport(input.reportId, context);
            
            if (result.error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            }
            return result.comments;
        }),

    /**
     * Create a new comment
     */
    create: protectedProcedure
        .input(createCommentSchema)
        .mutation(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId);
            const result = await CommentService.create(input, ctx.userId, context);
            
            if (result.notFound) {
                throw new TRPCError({ 
                    code: "NOT_FOUND", 
                    message: result.error || "Report not found" 
                });
            }
            if (result.error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            }
            if (!result.comment) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create comment" });
            }
            return result.comment;
        }),

    /**
     * Update a comment
     */
    update: protectedProcedure
        .input(updateCommentSchema)
        .mutation(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId);
            const result = await CommentService.update(
                input.id,
                ctx.userId,
                { body: input.body },
                context
            );
            
            if (result.notFound) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
            }
            if (result.forbidden) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You don't have permission to update this comment" });
            }
            if (result.error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            }
            return result.comment;
        }),

    /**
     * Delete a comment
     */
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId);
            const result = await CommentService.delete(input.id, ctx.userId, context);
            
            if (result.notFound) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
            }
            if (result.forbidden) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You don't have permission to delete this comment" });
            }
            if (result.error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            }
            return { success: true };
        }),
});
