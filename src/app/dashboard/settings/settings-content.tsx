"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardIcons } from "@/components/icons/dashboard-icons";

const Icons = DashboardIcons;

function isUnauthorized(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof (error as { data?: { code?: string } }).data === "object" &&
        (error as { data: { code?: string } }).data?.code === "UNAUTHORIZED"
    );
}

async function logoutAndRedirect(router: ReturnType<typeof useRouter>) {
    try {
        await fetch("/api/auth/logout", { method: "POST" });
    } catch {
        // ignore
    }
    router.replace("/login");
}

export function SettingsContent() {
    const router = useRouter();
    const { data: preferences, isLoading, error: queryError } = trpc.user.getPreferences.useQuery();
    const utils = trpc.useUtils();
    const updatePrefs = trpc.user.updatePreferences.useMutation({
        onMutate: async (next) => {
            await utils.user.getPreferences.cancel();
            const prev = utils.user.getPreferences.getData();
            utils.user.getPreferences.setData(undefined, (old) => ({
                ...old,
                ...(next.autoBlurSensitiveFields !== undefined && { autoBlurSensitiveFields: next.autoBlurSensitiveFields }),
                ...(next.suppressNotifications !== undefined && { suppressNotifications: next.suppressNotifications }),
            }));
            return { prev };
        },
        onError: (err, _vars, context) => {
            if (context?.prev !== undefined) {
                utils.user.getPreferences.setData(undefined, () => context.prev);
            }
            if (isUnauthorized(err)) {
                logoutAndRedirect(router);
            }
        },
        onSettled: () => utils.user.getPreferences.invalidate(),
    });

    useEffect(() => {
        if (queryError && isUnauthorized(queryError)) {
            logoutAndRedirect(router);
        }
    }, [queryError, router]);

    const handleAutoBlurToggle = (checked: boolean) => {
        updatePrefs.mutate({ autoBlurSensitiveFields: checked });
        try {
            window.postMessage({ type: 'VIDRO_AUTO_BLUR_SETTING', enabled: checked }, '*');
        } catch {}
    };

    const handleSuppressNotificationsToggle = (checked: boolean) => {
        updatePrefs.mutate({ suppressNotifications: checked });
        try {
            window.postMessage({ type: 'VIDRO_SUPPRESS_NOTIFICATIONS_SETTING', enabled: checked }, '*');
        } catch {}
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                    <Link href="/dashboard" className="flex items-center gap-3 group" aria-label="Back to dashboard">
                        <div className="size-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                            {Icons.bug()}
                        </div>
                        <span className="text-base font-bold tracking-tight">Vidro</span>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm">
                            Back to dashboard
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-3xl font-black tracking-tight mb-2">Settings</h1>
                <p className="text-muted-foreground mb-8">
                    Manage your account and extension preferences.
                </p>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recording privacy</CardTitle>
                        <CardDescription>
                            Control how sensitive information is handled during screen recordings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                            <div className="space-y-0.5 flex-1">
                                <Label htmlFor="auto-blur" className="text-base font-medium">
                                    Auto-blur sensitive form fields
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    During recordings, automatically blur password, email, and other sensitive inputs on login, registration, and similar forms so they never appear in your video.
                                </p>
                            </div>
                            {isLoading ? (
                                <Skeleton className="h-6 w-11 shrink-0 rounded-full" />
                            ) : (
                                <Switch
                                    id="auto-blur"
                                    checked={preferences?.autoBlurSensitiveFields ?? true}
                                    onCheckedChange={handleAutoBlurToggle}
                                    disabled={updatePrefs.isPending}
                                />
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            You can also configure this in the Vidro extension: right-click the extension icon → Options. Custom blur zones can be drawn or selected from the recording overlay.
                        </p>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Notification suppression</CardTitle>
                        <CardDescription>
                            Prevent notifications from appearing in your recordings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                            <div className="space-y-0.5 flex-1">
                                <Label htmlFor="suppress-notif" className="text-base font-medium">
                                    Suppress notifications during recording
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Block browser notifications from websites while recording so popups and banners don't appear in your video.
                                </p>
                            </div>
                            {isLoading ? (
                                <Skeleton className="h-6 w-11 shrink-0 rounded-full" />
                            ) : (
                                <Switch
                                    id="suppress-notif"
                                    checked={preferences?.suppressNotifications ?? true}
                                    onCheckedChange={handleSuppressNotificationsToggle}
                                    disabled={updatePrefs.isPending}
                                />
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This blocks browser notifications from websites. For system-level notifications (Windows Focus Assist, macOS Do Not Disturb, Linux DND), enable your OS's focus mode manually before recording.
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
