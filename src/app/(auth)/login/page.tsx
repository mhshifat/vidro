"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

/* ─── Zod Schema ──────────────────────────────────────────────── */
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

/* ─── SVG Icons ───────────────────────────────────────────────── */
const Icons = {
    bug: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0M3 12h3m12 0h3M12 3v3m0 12v3M5.636 5.636l2.121 2.121m8.486 8.486l2.121 2.121M5.636 18.364l2.121-2.121m8.486-8.486l2.121-2.121" />
        </svg>
    ),
    video: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-5 text-primary/60">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    console: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-5 text-primary/60">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    share: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-5 text-primary/60">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
    ),
    shield: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-5 text-primary/60">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    arrowRight: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
    ),
    spinner: (
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    ),
    eye: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    ),
    eyeOff: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    ),
};

/* ─── Bento Feature Card ──────────────────────────────────────── */
function FeatureCard({
    icon,
    title,
    description,
    className = "",
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    className?: string;
}) {
    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm transition-all duration-500 hover:border-primary/20 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/3 ${className}`}
        >
            <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                <div className="absolute -inset-full rotate-12 bg-linear-to-r from-transparent via-primary/3 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </div>
            <div className="relative space-y-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/6 transition-colors duration-300 group-hover:bg-primary/10">
                    {icon}
                </div>
                <div>
                    <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
                </div>
            </div>
        </div>
    );
}

/* ─── Stat Pill ───────────────────────────────────────────────── */
function StatPill({ value, label }: { value: string; label: string }) {
    return (
        <div className="flex items-center gap-2 rounded-full border border-border/40 bg-card/30 px-3.5 py-1.5 backdrop-blur-sm">
            <span className="text-sm font-bold tabular-nums tracking-tight">{value}</span>
            <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────── */
/*  Login Page                                                     */
/* ──────────────────────────────────────────────────────────────── */
export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [resendStatus, setResendStatus] = useState<"idle" | "pending" | "sent" | "error">("idle");
    const [resendToast, setResendToast] = useState<string | null>(null);

    const loginMutation = trpc.auth.login.useMutation({
        onSuccess: () => {
            router.push("/dashboard");
            router.refresh();
        },
        onError: (e) => setError(e.message),
    });

    const resendMutation = trpc.auth.resendVerification.useMutation({
        onSuccess: () => {
            setResendStatus("sent");
            setResendToast("Verification email sent!");
            setTimeout(() => setResendToast(null), 2500);
        },
        onError: () => {
            setResendStatus("error");
            setResendToast("Failed to send verification email.");
            setTimeout(() => setResendToast(null), 2500);
        },
    });

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    function onSubmit(values: LoginValues) {
        setError("");
        loginMutation.mutate(values);
    }

    function handleResend(email: string) {
        setResendStatus("pending");
        resendMutation.mutate({ email });
    }

    return (
        <main className="flex min-h-svh items-center justify-center px-4 py-12 sm:px-6">
            <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* ── Bento Grid ────────────────────────────────── */}
                <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
                    {/* ── Left: Brand + Features ─────────────── */}
                    <div className="hidden lg:col-span-5 lg:flex lg:flex-col lg:gap-4">
                        {/* Brand row */}
                        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                                    {Icons.bug}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight">Vidro</h2>
                                    <p className="text-xs text-muted-foreground">Your Jam.dev &amp; Loom replacement</p>
                                </div>
                            </div>
                        </div>

                        {/* Feature cards bento */}
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-6 duration-700 [animation-delay:100ms]">
                            <FeatureCard
                                icon={Icons.video}
                                title="Screen Capture"
                                description="1080p 60fps VP9 recordings with one click"
                            />
                            <FeatureCard
                                icon={Icons.console}
                                title="Console & Network"
                                description="Auto-capture logs, errors, and requests"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-8 duration-700 [animation-delay:200ms]">
                            <FeatureCard
                                icon={Icons.share}
                                title="Instant Share"
                                description="Share with a link — no account needed to view"
                            />
                            <FeatureCard
                                icon={Icons.shield}
                                title="Secure Storage"
                                description="500MB cloud storage with per-user quotas"
                            />
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-10 duration-700 [animation-delay:300ms]">
                            <StatPill value="100MB" label="per recording" />
                            <StatPill value="60fps" label="capture" />
                            <StatPill value="VP9" label="codec" />
                        </div>
                    </div>

                    {/* ── Right: Login Form ─────────────────────── */}
                    <div className="lg:col-span-7">
                        <div className="rounded-3xl border border-border/50 bg-card/70 p-8 shadow-xl shadow-black/3 backdrop-blur-md sm:p-10 animate-in fade-in slide-in-from-right-4 duration-500 lg:slide-in-from-right-6">
                            {/* Mobile brand */}
                            <div className="mb-8 flex items-center gap-3 lg:hidden">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                                    {Icons.bug}
                                </div>
                                <span className="text-lg font-black tracking-tight">Vidro</span>
                            </div>

                            {/* Heading */}
                            <div className="mb-8 space-y-2">
                                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                                    Welcome back
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Your free Jam.dev &amp; Loom replacement — sign in to continue.
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div role="alert" className="mb-6 flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4 text-destructive" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-destructive">{error}</p>
                                    {error.includes("verify your email") && (
                                        <div className="flex flex-col items-center gap-2 mt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={resendStatus === "pending"}
                                                onClick={() => handleResend(form.getValues("email"))}
                                            >
                                                {resendStatus === "pending" ? (
                                                    <span className="flex items-center gap-2">
                                                        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                        Sending...
                                                    </span>
                                                ) : resendStatus === "sent" ? "Verification email sent!" : resendStatus === "error" ? "Failed to send email" : "Resend verification email"}
                                            </Button>
                                            {resendToast && (
                                                <div className="text-sm font-semibold text-center text-primary bg-background/80 border border-primary/20 rounded-lg px-4 py-2 shadow animate-in fade-in duration-300">
                                                    {resendToast}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Form */}
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="you@company.com"
                                                        type="email"
                                                        autoComplete="email"
                                                        className="h-12 rounded-xl border-border/50 bg-background/50 px-4 text-sm transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary/30 focus:bg-background focus:shadow-sm focus:shadow-primary/5"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Password
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            autoComplete="current-password"
                                                            className="h-12 rounded-xl border-border/50 bg-background/50 px-4 pr-11 text-sm transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary/30 focus:bg-background focus:shadow-sm focus:shadow-primary/5"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                                                        >
                                                            {showPassword ? Icons.eyeOff : Icons.eye}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={loginMutation.isPending}
                                        className="group h-12 w-full rounded-xl text-sm font-semibold shadow-md shadow-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
                                    >
                                        {loginMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                {Icons.spinner}
                                                Signing in…
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Sign in
                                                <span className="transition-transform duration-300 group-hover:translate-x-1">
                                                    {Icons.arrowRight}
                                                </span>
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            </Form>

                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border/40" />
                                </div>
                            </div>

                            {/* Footer */}
                            <p className="text-center text-sm text-muted-foreground">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/register"
                                    className="font-semibold text-foreground underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
                                >
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
