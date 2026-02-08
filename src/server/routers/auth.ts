import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { AuthService } from "@/services/auth-service";
import { cookies } from "next/headers";

const authService = new AuthService();

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
            return user;
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
            return user;
        }),

    logout: publicProcedure.mutation(async () => {
        (await cookies()).delete("token");
        return { success: true };
    }),
});
