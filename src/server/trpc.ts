import { initTRPC, TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { Logger } from "@/lib/logger";
import { prisma } from "@/lib/db";

export interface TRPCContext {
    userId: string | null;
}

/**
 * Create context for tRPC procedures.
 * Extracts user ID from JWT and validates that the user still exists in the DB
 * (so a reset DB or deleted user invalidates the session).
 */
export async function createContext(): Promise<TRPCContext> {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return { userId: null };
    }

    const payload = await JWTManager.verify(token);
    const userId = payload?.userId ?? null;
    if (!userId) {
        return { userId: null };
    }

    const exists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    });
    if (!exists) {
        return { userId: null };
    }

    return { userId };
}

const t = initTRPC.context<TRPCContext>().create();

/** Safe user-facing message when an unexpected error occurs */
const INTERNAL_ERROR_MESSAGE = "Something went wrong. Please try again.";

/**
 * Middleware: catch unexpected errors, log with correlation ID, and rethrow with
 * safe message + data.correlationId so clients never see raw backend errors.
 */
const errorHandlerMiddleware = t.middleware(async ({ next }) => {
    try {
        return await next();
    } catch (e) {
        if (e instanceof TRPCError) {
            if (e.code !== "INTERNAL_SERVER_ERROR") {
                throw e;
            }
            const data = e.data as { correlationId?: string } | undefined;
            if (data?.correlationId) {
                throw e;
            }
        }
        const context = Logger.createContext();
        const result = Logger.error(
            "tRPC procedure error",
            e,
            context,
            { userMessage: INTERNAL_ERROR_MESSAGE }
        );
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.message,
            cause: e,
            data: { correlationId: result.correlationId },
        });
    }
});

export const router = t.router;
export const publicProcedure = t.procedure.use(errorHandlerMiddleware);

/**
 * Protected procedure - requires authenticated user
 * Throws UNAUTHORIZED if no valid token
 */
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
    if (!ctx.userId) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to perform this action",
        });
    }
    return next({
        ctx: {
            ...ctx,
            userId: ctx.userId,
        },
    });
});
