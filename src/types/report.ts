/**
 * Report-related type definitions
 * Used by report/new and report/[id] pages
 */

export interface ConsoleLogEntry {
    type: string;
    args: unknown[];
    timestamp: number;
}

export interface NetworkLogEntry {
    type: string;
    method: string;
    url: string;
    status: number;
    timestamp: number;
}

export interface RecordingPayload {
    id: string;
    videoUrl: string;
    consoleLogs: ConsoleLogEntry[];
    networkLogs: NetworkLogEntry[];
    timestamp: number;
}

export interface ScreenshotPayload {
    id: string;
    imageUrl: string;
    title: string;
    consoleLogs: ConsoleLogEntry[];
    networkLogs: NetworkLogEntry[];
    timestamp: number;
}

/**
 * Format time in mm:ss format
 */
export function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format timestamp to time string
 */
export function formatTimestamp(ts: number): string {
    return new Date(ts).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
}

/**
 * Get status color class based on HTTP status code
 */
export function getStatusColor(status: number): string {
    if (status >= 200 && status < 300) return 'text-emerald-400';
    if (status >= 300 && status < 400) return 'text-amber-400';
    return 'text-red-400';
}

/**
 * Get console type styling classes
 */
export function getConsoleTypeStyle(type: string): string {
    switch (type) {
        case 'error':
            return 'text-red-400 bg-red-500/10';
        case 'warn':
            return 'text-amber-400 bg-amber-500/10';
        case 'info':
            return 'text-sky-400 bg-sky-500/10';
        default:
            return 'text-emerald-400 bg-emerald-500/10';
    }
}

/**
 * Get console type icon character
 */
export function getConsoleTypeIcon(type: string): string {
    switch (type) {
        case 'error':
            return '✕';
        case 'warn':
            return '▲';
        case 'info':
            return 'ℹ';
        default:
            return '›';
    }
}
