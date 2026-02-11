"use client";

import { Suspense } from "react";
import VerifyEmailContent from "@/components/auth/verify-email-content";

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<VerifyEmailLoading />}>
            <VerifyEmailContent />
        </Suspense>
    );
}

function VerifyEmailLoading() {
    return (
        <main className="flex min-h-svh items-center justify-center px-4 py-12 sm:px-6">
            <div className="w-full max-w-md">
                <div className="rounded-3xl border border-border/50 bg-card/70 p-8 shadow-xl shadow-black/3 backdrop-blur-md sm:p-10 text-center space-y-6">
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
                </div>
            </div>
        </main>
    );
}
