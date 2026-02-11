"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/react";
import Link from "next/link";

export default function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [error, setError] = useState("");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    const verifyMutation = trpc.auth.verifyEmail.useMutation({
        onSuccess: () => {
            setStatus("success");
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                router.push("/dashboard");
                router.refresh();
            }, 2000);
        },
        onError: (e) => {
            setError(e.message);
            setStatus("error");
        },
    });

    useEffect(() => {
        if (!token) {
            setError("No verification token found");
            setStatus("error");
            return;
        }

        verifyMutation.mutate({ token });
    }, [token]);

    return (
        <main className="flex min-h-svh items-center justify-center px-4 py-12 sm:px-6">
            <div className="w-full max-w-md">
                <div className="rounded-3xl border border-border/50 bg-card/70 p-8 shadow-xl shadow-black/3 backdrop-blur-md sm:p-10 text-center space-y-6">
                    {status === "loading" && (
                        <>
                            {/* Spinner */}
                            <div className="flex justify-center">
                                <div className="relative size-16">
                                    <svg className="size-16 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-black tracking-tight">Verifying your email</h1>
                                <p className="text-sm text-muted-foreground">
                                    Please wait while we confirm your email address...
                                </p>
                            </div>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            {/* Success icon */}
                            <div className="flex justify-center">
                                <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-8 text-emerald-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-black tracking-tight">Email verified!</h1>
                                <p className="text-sm text-muted-foreground">
                                    Your account is now active. Redirecting you to the dashboard...
                                </p>
                            </div>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            {/* Error icon */}
                            <div className="flex justify-center">
                                <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-8 text-destructive">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4v2m-6-4a6 6 0 1112 0 6 6 0 01-12 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-black tracking-tight">Verification failed</h1>
                                <p className="text-sm text-muted-foreground">{error}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 pt-4">
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                                >
                                    Back to register
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Log in instead
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
