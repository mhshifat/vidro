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
const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterValues = z.infer<typeof registerSchema>;

/* ─── SVG Icons ───────────────────────────────────────────────── */
const Icons = {
    bug: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0M3 12h3m12 0h3M12 3v3m0 12v3M5.636 5.636l2.121 2.121m8.486 8.486l2.121 2.121M5.636 18.364l2.121-2.121m8.486-8.486l2.121-2.121" />
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
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5 text-emerald-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    ),
    user: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4 text-muted-foreground/60">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
};

/* ─── Benefit Item ────────────────────────────────────────────── */
function BenefitItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                {Icons.check}
            </div>
            <span className="text-xs text-muted-foreground">{text}</span>
        </div>
    );
}

/* ─── Testimonial Card ────────────────────────────────────────── */
function TestimonialCard({
    quote,
    name,
    role,
    className = "",
}: {
    quote: string;
    name: string;
    role: string;
    className?: string;
}) {
    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm transition-all duration-500 hover:border-primary/20 hover:bg-card/80 ${className}`}
        >
            <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                <div className="absolute -inset-full rotate-12 bg-linear-to-r from-transparent via-primary/3 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </div>
            <div className="relative space-y-3">
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-primary/20">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                </svg>
                <p className="text-sm leading-relaxed text-foreground/80">{quote}</p>
                <div className="flex items-center gap-2.5 pt-1">
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary/6">
                        {Icons.user}
                    </div>
                    <div>
                        <p className="text-xs font-semibold">{name}</p>
                        <p className="text-[10px] text-muted-foreground">{role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────── */
/*  Register Page                                                  */
/* ──────────────────────────────────────────────────────────────── */
export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const registerMutation = trpc.auth.register.useMutation({
        onSuccess: () => {
            router.push("/dashboard");
            router.refresh();
        },
        onError: (e) => setError(e.message),
    });

    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    function onSubmit(values: RegisterValues) {
        setError("");
        registerMutation.mutate(values);
    }

    return (
        <div className="flex min-h-svh items-center justify-center px-4 py-12 sm:px-6">
            <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* ── Bento Grid ────────────────────────────────── */}
                <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
                    {/* ── Left: Register Form ──────────────────── */}
                    <div className="lg:col-span-7">
                        <div className="rounded-3xl border border-border/50 bg-card/70 p-8 shadow-xl shadow-black/3 backdrop-blur-md sm:p-10 animate-in fade-in slide-in-from-left-4 duration-500 lg:slide-in-from-left-6">
                            {/* Mobile brand */}
                            <div className="mb-8 flex items-center gap-3 lg:hidden">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                                    {Icons.bug}
                                </div>
                                <span className="text-lg font-black tracking-tight">Jam Clone</span>
                            </div>

                            {/* Heading */}
                            <div className="mb-8 space-y-2">
                                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                                    Create your account
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Start capturing and sharing bug reports in seconds.
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4 text-destructive">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-destructive">{error}</p>
                                </div>
                            )}

                            {/* Form */}
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Full name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Jane Doe"
                                                        autoComplete="name"
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
                                                            autoComplete="new-password"
                                                            className="h-12 rounded-xl border-border/50 bg-background/50 px-4 pr-11 text-sm transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary/30 focus:bg-background focus:shadow-sm focus:shadow-primary/5"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            tabIndex={-1}
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
                                        disabled={registerMutation.isPending}
                                        className="group h-12 w-full rounded-xl text-sm font-semibold shadow-md shadow-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
                                    >
                                        {registerMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                {Icons.spinner}
                                                Creating account…
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Create account
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
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="font-semibold text-foreground underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* ── Right: Social Proof + Benefits ─────── */}
                    <div className="hidden lg:col-span-5 lg:flex lg:flex-col lg:gap-4">
                        {/* Brand row */}
                        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                                    {Icons.bug}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight">Jam Clone</h2>
                                    <p className="text-xs text-muted-foreground">Bug reporting, reimagined</p>
                                </div>
                            </div>
                        </div>

                        {/* Benefits card */}
                        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm space-y-4 animate-in fade-in slide-in-from-right-6 duration-700 [animation-delay:100ms]">
                            <h3 className="text-sm font-bold tracking-tight">What you get — free</h3>
                            <div className="space-y-3">
                                <BenefitItem text="500MB secure cloud storage" />
                                <BenefitItem text="Up to 25 bug reports" />
                                <BenefitItem text="1080p 60fps screen recording" />
                                <BenefitItem text="Auto-captured console & network logs" />
                                <BenefitItem text="Shareable links — no account to view" />
                                <BenefitItem text="Download recordings anytime" />
                            </div>
                        </div>

                        {/* Testimonials bento */}
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-8 duration-700 [animation-delay:200ms]">
                            <TestimonialCard
                                quote="Replaced our entire bug reporting workflow. So much faster."
                                name="Alex Chen"
                                role="Frontend Lead"
                            />
                            <TestimonialCard
                                quote="The auto-captured logs save us hours of back-and-forth."
                                name="Sarah K."
                                role="QA Engineer"
                            />
                        </div>

                        {/* Trust badge */}
                        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/40 bg-card/30 py-3 backdrop-blur-sm animate-in fade-in slide-in-from-right-10 duration-700 [animation-delay:300ms]">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-4 text-emerald-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-xs text-muted-foreground">Your data is encrypted and secure</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
