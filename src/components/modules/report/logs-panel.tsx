'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ReportIcons as Icons } from '@/components/icons/report-icons';
import { ReportEmptyState } from './report-empty-state';
import type { ConsoleLogEntry, NetworkLogEntry } from '@/types/report';
import { formatTimestamp, getStatusColor, getConsoleTypeStyle, getConsoleTypeIcon } from '@/types/report';

interface LogsPanelProps {
    consoleLogs: ConsoleLogEntry[];
    networkLogs: NetworkLogEntry[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function LogsPanel({ consoleLogs, networkLogs, activeTab, onTabChange }: LogsPanelProps) {
    return (
        <Card className="lg:col-span-12 py-0 overflow-hidden">
            <Tabs value={activeTab} onValueChange={onTabChange} className="h-full">
                <div className="flex items-center justify-between border-b px-5 py-2.5 bg-muted/30">
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-bold tracking-tight">Captured Data</h3>
                        <Separator orientation="vertical" className="h-4" />
                        <TabsList variant="line" className="h-8">
                            <TabsTrigger value="console" className="text-xs gap-1.5 px-3">
                                {Icons.console()}
                                Console
                                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                                    {consoleLogs?.length ?? 0}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="network" className="text-xs gap-1.5 px-3">
                                {Icons.network()}
                                Network
                                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                                    {networkLogs?.length ?? 0}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <TabsContent value="console" className="m-0">
                    <ScrollArea className="h-80">
                        <div className="divide-y divide-border/50">
                            {consoleLogs?.length === 0 && <ReportEmptyState message="No console events captured" />}
                            {consoleLogs?.map((log, i) => (
                                <div
                                    key={i}
                                    className="group flex items-start gap-3 px-5 py-2 text-xs font-mono transition-colors hover:bg-muted/40 animate-in fade-in slide-in-from-left-1 duration-200"
                                    style={{ animationDelay: `${Math.min(i * 20, 400)}ms` }}
                                >
                                    <span className="text-[10px] text-muted-foreground tabular-nums pt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {formatTimestamp(log.timestamp)}
                                    </span>
                                    <span
                                        className={`inline-flex items-center justify-center size-5 rounded text-[10px] font-bold shrink-0 ${getConsoleTypeStyle(log.type)}`}
                                    >
                                        {getConsoleTypeIcon(log.type)}
                                    </span>
                                    <span className="text-foreground/80 break-all leading-relaxed">
                                        {log.args?.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="network" className="m-0">
                    <ScrollArea className="h-80">
                        <div className="sticky top-0 z-10 grid grid-cols-[70px_56px_1fr] gap-4 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/60 border-b backdrop-blur-sm">
                            <span>Status</span>
                            <span>Method</span>
                            <span>URL</span>
                        </div>
                        <div className="divide-y divide-border/50">
                            {networkLogs?.length === 0 && <ReportEmptyState message="No network requests captured" />}
                            {networkLogs?.map((req, i) => (
                                <div
                                    key={i}
                                    className="group grid grid-cols-[70px_56px_1fr] gap-4 px-5 py-2 text-xs font-mono transition-colors hover:bg-muted/40 animate-in fade-in slide-in-from-left-1 duration-200"
                                    style={{ animationDelay: `${Math.min(i * 15, 300)}ms` }}
                                >
                                    <span className={`font-bold tabular-nums ${getStatusColor(req.status)}`}>{req.status}</span>
                                    <Badge variant="outline" className="h-5 text-[10px] font-bold justify-center">
                                        {req.method}
                                    </Badge>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="text-foreground/70 truncate cursor-default">{req.url}</span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-md break-all text-xs font-mono">
                                            {req.url}
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </Card>
    );
}
