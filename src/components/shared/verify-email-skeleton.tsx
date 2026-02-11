import { Card, CardContent } from "@/components/ui/card";

/**
 * Loading skeleton for verify email page
 */
export function VerifyEmailSkeleton() {
    return (
        <main className="flex min-h-svh items-center justify-center px-4 py-12 sm:px-6">
            <div className="w-full max-w-md">
                <Card className="rounded-3xl border border-border/50 bg-card/70 shadow-xl shadow-black/3 backdrop-blur-md">
                    <CardContent className="p-8 sm:p-10">
                        <div className="space-y-6 text-center">
                            <div className="flex justify-center">
                                <div className="relative size-16 animate-pulse rounded-full bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-8 w-48 animate-pulse rounded-lg bg-muted mx-auto" />
                                <div className="h-4 w-56 animate-pulse rounded-lg bg-muted mx-auto" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
