/**
 * Type definitions for console and network logs
 * Used across the application for proper type safety
 */

export interface ConsoleLog {
  type: "log" | "error" | "warn" | "info" | "debug";
  args?: (string | Record<string, unknown>)[];
  timestamp?: number;
}

export interface NetworkLog {
  method: string;
  url: string;
  status: number;
  statusText?: string;
  duration?: number;
  timestamp?: number;
  requestSize?: number;
  responseSize?: number;
}

export interface ParsedLogs {
  consoleLogs: string[];
  networkLogs: string[];
}
