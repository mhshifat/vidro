import { router, publicProcedure } from "../trpc";
import { authRouter } from "./auth";
import { reportRouter } from "./report";
import { commentRouter } from "./comment";
import { organizationRouter } from "./organization";
import { reportActionRouter } from "./report-action";

export const appRouter = router({
    health: publicProcedure.query(() => {
        return { status: "ok" };
    }),
    auth: authRouter,
    report: reportRouter,
    comment: commentRouter,
    organization: organizationRouter,
    reportAction: reportActionRouter,
});

export type AppRouter = typeof appRouter;
