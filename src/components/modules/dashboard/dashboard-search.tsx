'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DashboardIcons as Icons } from '@/components/icons/dashboard-icons';

interface DashboardSearchProps {
    searchQuery: string;
    onSearchQueryChange: (value: string) => void;
    searching: boolean;
    searchInterpretation: string | null;
    onSearch: () => void;
    onClearSearch: () => void;
}

export function DashboardSearch({
    searchQuery,
    onSearchQueryChange,
    searching,
    searchInterpretation,
    onSearch,
    onClearSearch,
}: DashboardSearchProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onSearch();
    };

    return (
        <div className="mb-6 space-y-2">
            <div className="relative flex gap-2">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {searching ? Icons.spinner() : Icons.search()}
                    </span>
                    <Input
                        value={searchQuery}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder='AI Search — try "critical login bugs" or "API errors this week"'
                        aria-label="Search bug reports"
                        className="pl-9 pr-9 h-10"
                    />
                    {searchQuery && (
                        <button
                            onClick={onClearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {Icons.close()}
                        </button>
                    )}
                </div>
                <Button onClick={onSearch} disabled={searching || !searchQuery.trim()} className="gap-1.5 h-10">
                    {Icons.sparkles()}
                    Search
                </Button>
            </div>
            {searchInterpretation && (
                <div className="flex items-center gap-2 text-xs animate-in fade-in duration-200">
                    <span className="text-primary">{Icons.sparkles()}</span>
                    <span className="text-muted-foreground">{searchInterpretation}</span>
                    <button onClick={onClearSearch} className="text-primary hover:underline ml-auto">
                        Clear search
                    </button>
                </div>
            )}
        </div>
    );
}
