import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-red-500/5 via-card to-orange-500/5 p-8 sm:p-12 lg:p-16">
          {/* Background pattern */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="ctaGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.5" className="fill-red-500/[0.06]" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#ctaGrid)" />
            </svg>

            {/* Corner accent */}
            <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-red-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-orange-500/10 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Ready to stop
              <span className="block mt-1 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                wasting time on bug reports?
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-muted-foreground">
              Start capturing smarter bug reports today. Free for individuals, powerful plans for teams.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="group h-13 min-w-[220px] bg-red-500 hover:bg-red-600 text-white text-base shadow-xl shadow-red-500/25 transition-all hover:shadow-2xl hover:shadow-red-500/30">
                <Link href="/register">
                  Start Free — No Credit Card
                  <svg viewBox="0 0 20 20" fill="currentColor" className="ml-1 size-4 transition-transform group-hover:translate-x-0.5">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground/60">
              Free plan includes 25 captures/month · No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
