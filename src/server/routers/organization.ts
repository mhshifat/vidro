import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { OrganizationService } from "@/services/organization-service";
import { Logger } from "@/lib/logger";

const organizationRoleSchema = z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]);

const createOrganizationSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only").optional(),
    logoUrl: z.string().url().optional(),
});

const updateOrganizationSchema = z.object({
    id: z.string(),
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
    logoUrl: z.string().url().nullable().optional(),
});

export const organizationRouter = router({
    /**
     * List all organizations for the current user
     */
    list: protectedProcedure.query(async ({ ctx }) => {
        const context = Logger.createContext(ctx.userId);
        const result = await OrganizationService.listForUser(ctx.userId, context);

        if (result.error) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
        }
        return result.data ?? [];
    }),

    /**
     * Get organization by ID
     */
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId);
            const result = await OrganizationService.getById(input.id, ctx.userId, context);

            if (result.notFound) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
            }
            if (result.forbidden) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You don't have access to this organization" });
            }
            if (result.error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            }
            return result.data;
        }),

    /**
     * Get organization by slug
     */
    getBySlug: protectedProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId);
            const result = await OrganizationService.getBySlug(input.slug, ctx.userId, context);

            if (result.notFound) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
            }
            if (result.forbidden) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You don't have access to this organization" });
            }
            if (result.error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            }
            return result.data;
        }),

    /**
     * Create a new organization
     */
    create: protectedProcedure
        .input(createOrganizationSchema)
        .mutation(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId);
            const result = await OrganizationService.create(input, ctx.userId, context);

            if (result.error) {
                throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
            }
            return result.data;
        }),

    /**
     * Update an organization
     */
    update: protectedProcedure
        .input(updateOrganizationSchema)
        .mutation(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId);
            const { id, ...data } = input;
            const result = await OrganizationService.update(id, data, ctx.userId, context);

            if (result.notFound) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
            }
            if (result.forbidden) {
                throw new TRPCError({ code: "FORBIDDEN", message: result.error || "You don't have permission to update this organization" });
            }
            if (result.error) {
                throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
            }
            return result.data;
        }),

    /**
     * Delete an organization
     */
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId);
            const result = await OrganizationService.delete(input.id, ctx.userId, context);

            if (result.notFound) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
            }
            if (result.forbidden) {
                throw new TRPCError({ code: "FORBIDDEN", message: result.error || "Only the owner can delete this organization" });
            }
            if (result.error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            }
            return { success: true };
        }),

    /**
     * Invite a member to the organization
     */
    inviteMember: protectedProcedure
        .input(z.object({
            organizationId: z.string(),
            userId: z.string(),
            role: organizationRoleSchema.default("MEMBER"),
        }))
        .mutation(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId);
            const result = await OrganizationService.inviteMember(
                input.organizationId,
                input.userId,
                input.role,
                ctx.userId,
                context
            );

            if (result.notFound) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
            }
            if (result.forbidden) {
                throw new TRPCError({ code: "FORBIDDEN", message: result.error || "You don't have permission to invite members" });
            }
            if (result.error) {
                throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
            }
            return { success: true };
        }),

    /**
     * Remove a member from the organization
     */
    removeMember: protectedProcedure
        .input(z.object({
            organizationId: z.string(),
            userId: z.string(),
        }))
        .mutation(async ({ input, ctx }) => {
            const context = Logger.createContext(ctx.userId);
            const result = await OrganizationService.removeMember(
                input.organizationId,
                input.userId,
                ctx.userId,
                context
            );

            if (result.notFound) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
            }
            if (result.forbidden) {
                throw new TRPCError({ code: "FORBIDDEN", message: result.error || "You don't have permission to remove members" });
            }
            if (result.error) {
                throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
            }
            return { success: true };
        }),
});
