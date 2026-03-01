/**
 * Auth error handling: never expose raw backend/database errors to the client.
 * Uses correlation IDs for support and logs full details server-side only.
 */

import { TRPCError } from "@trpc/server";
import { Logger } from "@/lib/logger";

/** Messages we allow to pass through to the user (no correlation ID needed) */
const SAFE_AUTH_MESSAGES = new Set([
    "Invalid credentials",
    "Please verify your email first",
    "User not found",
    "Email already verified",
    "Invalid or expired verification token",
    "Verification token has expired",
    "User already exists",
    "Password is required",
]);

const DEFAULT_LOGIN_MESSAGE = "We're having trouble signing you in. Please try again in a moment.";
const DEFAULT_REGISTER_MESSAGE = "We couldn't create your account. Please try again.";
const DEFAULT_VERIFY_MESSAGE = "We couldn't verify your email. Please try again or use a new link.";
const DEFAULT_ME_MESSAGE = "We couldn't load your session. Please sign in again.";
const DEFAULT_RESEND_MESSAGE = "We couldn't send the verification email. Please try again.";

export type AuthOperation = "login" | "register" | "verifyEmail" | "resendVerification" | "me";

function getDefaultUserMessage(operation: AuthOperation): string {
    switch (operation) {
        case "login":
            return DEFAULT_LOGIN_MESSAGE;
        case "register":
            return DEFAULT_REGISTER_MESSAGE;
        case "verifyEmail":
            return DEFAULT_VERIFY_MESSAGE;
        case "resendVerification":
            return DEFAULT_RESEND_MESSAGE;
        case "me":
            return DEFAULT_ME_MESSAGE;
        default:
            return "Something went wrong. Please try again.";
    }
}

/**
 * Handles an error from an auth operation. If the error message is in the safe list,
 * rethrows a TRPCError with that message. Otherwise logs full error server-side,
 * then throws TRPCError with a generic user message and correlationId in data.
 */
export function handleAuthError(error: unknown, operation: AuthOperation): never {
    const message = error instanceof Error ? error.message : String(error);
    const isSafe = SAFE_AUTH_MESSAGES.has(message);

    if (isSafe) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message,
        });
    }

    const context = Logger.createContext();
    const userMessage = getDefaultUserMessage(operation);
    const result = Logger.error(
        `Auth error during ${operation}`,
        error,
        context,
        { userMessage, operation }
    );

    throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: result.message,
        cause: error,
        data: { correlationId: result.correlationId },
    });
}
