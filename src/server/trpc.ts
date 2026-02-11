import { initTRPC, TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";

export interface TRPCContext {
    userId: string | null;
}

/**
 * Create context for tRPC procedures
 * Extracts user ID from JWT token in cookies
 */
export async function createContext(): Promise<TRPCContext> {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    if (!token) {
        return { userId: null };
    }

    const payload = await JWTManager.verify(token);
    return { userId: payload?.userId ?? null };
}

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authenticated user
 * Throws UNAUTHORIZED if no valid token
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
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
