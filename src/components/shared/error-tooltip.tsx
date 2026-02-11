'use client';

import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ErrorTooltipProps {
    message: string;
    correlationId?: string;
    className?: string;
    children?: React.ReactNode;
}

/**
 * ErrorTooltip - Displays error messages with correlation ID
 * On hover, shows the correlation ID and instructions for support
 * Allows copying the correlation ID to clipboard
 */
export function ErrorTooltip({ message, correlationId, className, children }: ErrorTooltipProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!correlationId) return;
        
        try {
            await navigator.clipboard.writeText(correlationId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = correlationId;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!correlationId) {
        return (
            <div className={cn("text-destructive text-sm", className)}>
                {children || message}
            </div>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className={cn("text-destructive text-sm cursor-help underline decoration-dotted", className)}>
                    {children || message}
                </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs p-3 space-y-2">
                <p className="font-medium text-sm">{message}</p>
                <div className="text-xs text-muted-foreground space-y-1">
                    <p>If this issue persists, please contact support with the following ID:</p>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors w-full"
                    >
                        <code className="text-xs font-mono truncate flex-1 text-left">
                            {correlationId}
                        </code>
                        <span className="text-xs shrink-0">
                            {copied ? '✓ Copied!' : 'Copy'}
                        </span>
                    </button>
                </div>
            </TooltipContent>
        </Tooltip>
    );
}

interface ErrorAlertProps {
    title?: string;
    message: string;
    correlationId?: string;
    className?: string;
    onDismiss?: () => void;
}

/**
 * ErrorAlert - A more prominent error display with correlation ID
 * Ideal for form errors or page-level errors
 */
export function ErrorAlert({ title = "Error", message, correlationId, className, onDismiss }: ErrorAlertProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!correlationId) return;
        try {
            await navigator.clipboard.writeText(correlationId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Silent fallback
        }
    };

    return (
        <div className={cn(
            "rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-2",
            className
        )}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <svg className="size-5 text-destructive shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="font-medium text-destructive">{title}</h4>
                </div>
                {onDismiss && (
                    <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
            <p className="text-sm text-muted-foreground">{message}</p>
            {correlationId && (
                <div className="flex items-center gap-2 pt-2 border-t border-destructive/20">
                    <span className="text-xs text-muted-foreground">Support ID:</span>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted hover:bg-muted/80 transition-colors text-xs"
                    >
                        <code className="font-mono">{correlationId.slice(0, 8)}...</code>
                        <span>{copied ? '✓' : 'Copy'}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
