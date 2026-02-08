import { router, publicProcedure } from "../trpc";
import { authRouter } from "./auth";

export const appRouter = router({
    health: publicProcedure.query(() => {
        return { status: "ok" };
    }),
    auth: authRouter,
});

export type AppRouter = typeof appRouter;
