import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroGlow } from "./animated-background";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-28 sm:pt-28 sm:pb-36">
      <HeroGlow />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Announcement badge */}
          <div className="mb-8 flex justify-center animate-in fade-in slide-in-from-bottom-3 duration-700">
            <Badge variant="outline" className="gap-2 rounded-full border-red-200 bg-red-50 px-4 py-1.5 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              77 features &middot; 18 AI models
            </Badge>
          </div>

          {/* Replaces badge */}
          <div className="mb-4 flex justify-center animate-in fade-in slide-in-from-bottom-3 duration-700 delay-75">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
              Replaces
              <span className="font-semibold text-foreground">Jam.dev</span>
              +
              <span className="font-semibold text-foreground">Loom</span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl">
            <span className="block text-foreground"></span>
            <span className="mt-1 block bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Jam &amp; Loom alternative
            </span>
          </h1>

          {/* Sub-heading */}
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200 sm:text-xl">
            Capture screenshots &amp; screen recordings, annotate with precision,
            get 18 AI-powered insights per report — and share instant bug reports your team will actually use.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <Button size="lg" asChild className="group h-12 min-w-[200px] bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/25 transition-all hover:shadow-2xl hover:shadow-red-500/30">
              <Link href="/register">
                <span>Get Started Free</span>
                <svg viewBox="0 0 20 20" fill="currentColor" className="ml-1 size-4 transition-transform group-hover:translate-x-0.5">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="h-12 min-w-[200px] border-border/60">
              <a href="#features">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1 size-4">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                See how it works
              </a>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-14 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-500">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
              Trusted by teams at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-40 grayscale">
              <CompanyLogo name="Vercel" />
              <CompanyLogo name="Linear" />
              <CompanyLogo name="Stripe" />
              <CompanyLogo name="Notion" />
              <CompanyLogo name="Figma" />
            </div>
          </div>
        </div>

        {/* Hero visual — browser mockup */}
        <div className="relative mt-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <div className="mx-auto max-w-5xl">
            {/* Glow behind browser */}
            <div className="absolute inset-0 -m-4 rounded-3xl bg-gradient-to-b from-red-500/10 via-transparent to-transparent blur-2xl" />

            {/* Browser chrome */}
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/10">
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-border/40 bg-muted/30 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/70" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/70" />
                  <div className="h-3 w-3 rounded-full bg-green-400/70" />
                </div>
                <div className="mx-auto flex h-7 w-80 items-center justify-center rounded-md bg-background/60 text-xs text-muted-foreground">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="mr-1.5 size-3 opacity-40">
                    <path fillRule="evenodd" d="M8 1a4 4 0 00-4 4v3H3a1 1 0 00-1 1v5a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 00-1-1h-1V5a4 4 0 00-4-4zm2 7V5a2 2 0 10-4 0v3h4z" clipRule="evenodd" />
                  </svg>
                  vidro.dev/dashboard
                </div>
              </div>

              {/* Dashboard content preview */}
              <div className="relative aspect-[16/9] bg-gradient-to-br from-background via-background to-muted/30">
                <DashboardPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompanyLogo({ name }: { name: string }) {
  return (
    <span className="text-sm font-semibold tracking-wide text-foreground/70">{name}</span>
  );
}

/** Fake dashboard preview with SVG illustration */
function DashboardPreview() {
  return (
    <div className="absolute inset-0 p-6 sm:p-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="h-4 w-4">
              <circle cx="16" cy="16" r="6" className="fill-red-500" />
              <circle cx="16" cy="16" r="3" fill="white" />
            </svg>
          </div>
          <div className="h-3 w-24 rounded bg-foreground/10" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-md bg-red-500/10" />
          <div className="h-8 w-8 rounded-md bg-muted" />
        </div>
      </div>

      {/* Bento grid mockup */}
      <div className="grid grid-cols-12 gap-3 sm:gap-4">
        {/* Stat cards row */}
        <div className="col-span-4 rounded-xl border border-border/40 bg-card/50 p-4">
          <div className="h-2 w-16 rounded bg-muted-foreground/10 mb-3" />
          <div className="h-6 w-12 rounded bg-foreground/10 mb-2" />
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded-full bg-green-500/20" />
            <div className="h-2 w-10 rounded bg-green-500/20" />
          </div>
        </div>
        <div className="col-span-4 rounded-xl border border-border/40 bg-card/50 p-4">
          <div className="h-2 w-20 rounded bg-muted-foreground/10 mb-3" />
          <div className="h-6 w-10 rounded bg-foreground/10 mb-2" />
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded-full bg-amber-500/20" />
            <div className="h-2 w-8 rounded bg-amber-500/20" />
          </div>
        </div>
        <div className="col-span-4 rounded-xl border border-border/40 bg-card/50 p-4">
          <div className="h-2 w-14 rounded bg-muted-foreground/10 mb-3" />
          <div className="h-6 w-14 rounded bg-foreground/10 mb-2" />
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded-full bg-red-500/20" />
            <div className="h-2 w-12 rounded bg-red-500/20" />
          </div>
        </div>

        {/* Main chart area */}
        <div className="col-span-8 row-span-2 rounded-xl border border-border/40 bg-card/50 p-4">
          <div className="h-2 w-24 rounded bg-muted-foreground/10 mb-4" />
          <svg viewBox="0 0 400 120" className="h-full w-full max-h-32" fill="none">
            <path d="M0,90 C40,85 60,60 100,55 S160,70 200,40 S280,20 320,35 S380,25 400,15" className="stroke-red-500/40" strokeWidth="2" />
            <path d="M0,90 C40,85 60,60 100,55 S160,70 200,40 S280,20 320,35 S380,25 400,15 V120 H0 Z" className="fill-red-500/5" />
            <path d="M0,80 C50,90 80,75 130,70 S200,80 250,65 S330,55 400,60" className="stroke-orange-400/30" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>
        </div>

        {/* Side list */}
        <div className="col-span-4 row-span-2 rounded-xl border border-border/40 bg-card/50 p-4">
          <div className="h-2 w-20 rounded bg-muted-foreground/10 mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mb-3 flex items-center gap-2">
              <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-red-500/10 to-orange-400/10" />
              <div className="flex-1 space-y-1">
                <div className="h-2 w-full rounded bg-foreground/8" />
                <div className="h-1.5 w-2/3 rounded bg-muted-foreground/8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
