import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const preferencesSchema = z.object({
    autoBlurSensitiveFields: z.boolean().optional(),
    suppressNotifications: z.boolean().optional(),
});

export type UserPreferences = z.infer<typeof preferencesSchema>;

const SESSION_INVALID_MESSAGE = "Session invalid. Please sign in again.";

export const userRouter = router({
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
        const user = await prisma.user.findUnique({
            where: { id: ctx.userId },
            select: { preferences: true },
        });
        if (!user) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: SESSION_INVALID_MESSAGE,
            });
        }
        const prefs = (user.preferences as Record<string, unknown>) ?? {};
        return preferencesSchema.parse({
            autoBlurSensitiveFields: prefs.autoBlurSensitiveFields ?? true,
            suppressNotifications: prefs.suppressNotifications ?? true,
        });
    }),

    updatePreferences: protectedProcedure
        .input(preferencesSchema.partial())
        .mutation(async ({ ctx, input }) => {
            const user = await prisma.user.findUnique({
                where: { id: ctx.userId },
                select: { preferences: true },
            });
            if (!user) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: SESSION_INVALID_MESSAGE,
                });
            }
            const current = (user.preferences as Record<string, unknown>) ?? {};
            const next = { ...current, ...input };
            try {
                await prisma.user.update({
                    where: { id: ctx.userId },
                    data: { preferences: next },
                });
            } catch (e: unknown) {
                const isNotFound =
                    e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2025";
                if (isNotFound) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: SESSION_INVALID_MESSAGE,
                    });
                }
                throw e;
            }
            return preferencesSchema.parse({
                autoBlurSensitiveFields: next.autoBlurSensitiveFields ?? true,
                suppressNotifications: next.suppressNotifications ?? true,
            });
        }),
});
