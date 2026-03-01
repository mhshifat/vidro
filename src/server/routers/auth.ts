import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { AuthService } from "@/services/auth-service";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { SanitizedUser, User } from "@/entities/user";
import { handleAuthError } from "@/lib/auth-errors";

const authService = new AuthService();

function sanitizeUser(user: User): SanitizedUser {
    const { password, storageUsed, storageLimit, youtubeAccessToken, youtubeRefreshToken, youtubeTokenExpiry, emailVerificationToken, ...rest } = user;
    return {
        ...rest,
        storageUsed: storageUsed != null ? Number(storageUsed) : 0,
        storageLimit: storageLimit != null ? Number(storageLimit) : 0,
    };
}

export const authRouter = router({
        resendVerification: publicProcedure
            .input(
                z.object({
                    email: z.string().email(),
                })
            )
            .mutation(async ({ input }) => {
                try {
                    const user = await prisma.user.findUnique({ where: { email: input.email } });
                    if (!user) throw new Error("User not found");
                    if (user.emailVerified) throw new Error("Email already verified");

                    const token = await authService.generateEmailVerificationToken(user);
                    await authService.sendVerificationEmail(user, token);
                    return { success: true };
                } catch (e) {
                    handleAuthError(e, "resendVerification");
                }
            }),
    register: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                password: z.string().min(6),
                name: z.string().min(1),
            })
        )
        .mutation(async ({ input }) => {
            try {
                return await authService.register(input);
            } catch (e) {
                handleAuthError(e, "register");
            }
        }),

    verifyEmail: publicProcedure
        .input(
            z.object({
                token: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                const { token, user } = await authService.verifyEmail(input.token);
                (await cookies()).set("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
                return sanitizeUser(user);
            } catch (e) {
                handleAuthError(e, "verifyEmail");
            }
        }),

    login: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                password: z.string().min(1),
            })
        )
        .mutation(async ({ input }) => {
            try {
                const { token, user } = await authService.login(input);
                (await cookies()).set("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
                return sanitizeUser(user);
            } catch (e) {
                handleAuthError(e, "login");
            }
        }),

    logout: publicProcedure.mutation(async () => {
        (await cookies()).delete("token");
        return { success: true };
    }),

    me: publicProcedure.query(async () => {
        try {
            const token = (await cookies()).get("token")?.value;
            if (!token) return null;
            const payload = await JWTManager.verify(token);
            if (!payload) return null;
            const user = await prisma.user.findUnique({ where: { id: payload.userId } });
            if (!user) return null;
            return sanitizeUser(user);
        } catch (e) {
            handleAuthError(e, "me");
        }
    }),
});
