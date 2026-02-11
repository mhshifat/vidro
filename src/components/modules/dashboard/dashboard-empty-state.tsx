'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardIcons as Icons } from '@/components/icons/dashboard-icons';

interface DashboardEmptyStateProps {
    isSearchMode: boolean;
    onClearSearch?: () => void;
}

export function DashboardEmptyState({ isSearchMode, onClearSearch }: DashboardEmptyStateProps) {
    return (
        <Card className="py-20">
            <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
                <span className="text-muted-foreground/30">{Icons.inbox()}</span>
                <div className="space-y-1">
                    <h3 className="text-lg font-bold tracking-tight">
                        {isSearchMode ? 'No matching reports' : 'No reports yet'}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        {isSearchMode
                            ? 'Try adjusting your search query or clear the search.'
                            : 'Use the Vidro browser extension to record your first bug report. It captures video, console logs, and network requests automatically.'
                        }
                    </p>
                </div>
                {isSearchMode && onClearSearch && (
                    <Button variant="outline" size="sm" onClick={onClearSearch}>
                        Clear Search
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
