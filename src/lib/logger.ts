/**
 * Centralized logging system with correlation IDs
 * Supports structured logging with user-friendly error messages
 */

import { v4 as uuidv4 } from "uuid";

export interface LogContext {
  correlationId: string;
  userId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

export interface ErrorResponse {
  message: string; // User-friendly message
  correlationId: string;
  details?: string; // Internal details for logging
}

/**
 * Logger class for structured logging with correlation IDs
 * Usage: const context = Logger.createContext(userId);
 * Logger.error("Operation failed", error, context);
 */
export class Logger {
  private static readonly isDev = process.env.NODE_ENV === "development";
  private static readonly LOG_LEVELS = {
    ERROR: "ERROR",
    WARN: "WARN",
    INFO: "INFO",
    DEBUG: "DEBUG",
  };

  /**
   * Create a new log context with a unique correlation ID
   */
  static createContext(userId?: string, sessionId?: string): LogContext {
    return {
      correlationId: uuidv4(),
      userId,
      sessionId,
    };
  }

  /**
   * Log an error with correlation ID
   */
  static error(
    message: string,
    error: Error | unknown,
    context: LogContext,
    additionalData?: Record<string, unknown>
  ): ErrorResponse {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    const logEntry = {
      level: this.LOG_LEVELS.ERROR,
      message,
      error: errorMessage,
      stack: this.isDev ? stack : undefined,
      context,
      additionalData,
      timestamp: new Date().toISOString(),
    };

    // Always log to console in production and development
    console.error(JSON.stringify(logEntry));

    // Return user-friendly error response
    return {
      message: additionalData?.userMessage
        ? String(additionalData.userMessage)
        : "An error occurred. Please try again.",
      correlationId: context.correlationId,
      details: this.isDev ? errorMessage : undefined,
    };
  }

  /**
   * Log a warning
   */
  static warn(
    message: string,
    context: LogContext,
    additionalData?: Record<string, unknown>
  ): void {
    const logEntry = {
      level: this.LOG_LEVELS.WARN,
      message,
      context,
      additionalData,
      timestamp: new Date().toISOString(),
    };

    console.warn(JSON.stringify(logEntry));
  }

  /**
   * Log info level message
   */
  static info(
    message: string,
    context: LogContext,
    data?: Record<string, unknown>
  ): void {
    const logEntry = {
      level: this.LOG_LEVELS.INFO,
      message,
      data,
      context,
      timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(logEntry));
  }

  /**
   * Log debug level message (dev only)
   */
  static debug(
    message: string,
    context: LogContext,
    data?: Record<string, unknown>
  ): void {
    if (!this.isDev) return;

    const logEntry = {
      level: this.LOG_LEVELS.DEBUG,
      message,
      data,
      context,
      timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(logEntry));
  }

  /**
   * Create a user-friendly error message with correlation ID
   * Used to send consistent error responses to clients
   */
  static createErrorResponse(
    userMessage: string,
    correlationId: string,
    details?: string
  ): ErrorResponse {
    return {
      message: userMessage,
      correlationId,
      details,
    };
  }
}

/**
 * Format error response for API responses
 * This includes the correlation ID that users can share with support
 */
export function formatErrorResponse(
  message: string,
  correlationId: string
): { error: string; correlationId: string } {
  return {
    error: message,
    correlationId,
  };
}

/**
 * Extract correlation ID from request headers
 * If not provided, creates a new one
 */
export function getCorrelationId(
  headers?: Record<string, unknown>
): string {
  if (headers && typeof headers["x-correlation-id"] === "string") {
    return headers["x-correlation-id"];
  }
  return uuidv4();
}
