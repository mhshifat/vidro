import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { AuthService } from "@/services/auth-service";
import { cookies } from "next/headers";

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
});
