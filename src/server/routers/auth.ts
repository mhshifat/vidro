import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { AuthService } from "@/services/auth-service";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { prisma } from "@/lib/db";

const authService = new AuthService();

function sanitizeUser(user: any) {
    const { password, storageUsed, storageLimit, youtubeAccessToken, youtubeRefreshToken, youtubeTokenExpiry, ...rest } = user;
    return {
        ...rest,
        storageUsed: storageUsed != null ? Number(storageUsed) : 0,
        storageLimit: storageLimit != null ? Number(storageLimit) : 0,
    };
}

export const authRouter = router({
    register: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                password: z.string().min(6),
                name: z.string().min(1),
            })
        )
        .mutation(async ({ input }) => {
            const { token, user } = await authService.register(input);
            (await cookies()).set("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
            return sanitizeUser(user);
        }),

    login: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                password: z.string().min(1),
            })
        )
        .mutation(async ({ input }) => {
            const { token, user } = await authService.login(input);
            (await cookies()).set("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
            return sanitizeUser(user);
        }),

    logout: publicProcedure.mutation(async () => {
        (await cookies()).delete("token");
        return { success: true };
    }),

    me: publicProcedure.query(async () => {
        const token = (await cookies()).get("token")?.value;
        if (!token) return null;
        const payload = await JWTManager.verify(token);
        if (!payload) return null;
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) return null;
        return sanitizeUser(user);
    }),
});
