import { Badge } from "@/components/ui/badge";

const PROVIDERS = [
  {
    category: "AI Providers",
    items: ["Groq", "Gemini", "OpenAI"],
    color: "violet",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    category: "Storage",
    items: ["Cloudinary", "R2"],
    color: "cyan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
  },
  {
    category: "Integration",
    items: ["YouTube", "tRPC"],
    color: "red",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
  {
    category: "Database",
    items: ["Prisma", "PostgreSQL"],
    color: "emerald",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; pill: string }> = {
  violet: { bg: "bg-violet-500/10", text: "text-violet-500", border: "border-violet-500/20", pill: "bg-violet-500/10 text-violet-600" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/20", pill: "bg-cyan-500/10 text-cyan-600" },
  red: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", pill: "bg-red-500/10 text-red-600" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", pill: "bg-emerald-500/10 text-emerald-600" },
};

export function ArchitectureSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4 rounded-full px-3 py-1 text-xs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-1 size-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
            Open Architecture
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Pluggable by
            <span className="ml-2 bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              design
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Swap AI models, storage backends, and integrations. Built with a factory-pattern architecture so you&apos;re never locked in.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROVIDERS.map((p) => {
            const c = colorMap[p.color];
            return (
              <div key={p.category} className={`group overflow-hidden rounded-2xl border ${c.border} bg-card/50 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-black/5`}>
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
                  {p.icon}
                </div>
                <h3 className="mb-3 text-base font-semibold">{p.category}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.items.map((item) => (
                    <span key={item} className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.pill}`}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tech stack strip */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-border/40 bg-muted/10">
          <div className="flex items-center justify-center gap-8 px-6 py-6 flex-wrap">
            {["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Prisma ORM", "tRPC", "WXT", "Chrome Extension"].map((tech) => (
              <span key={tech} className="text-sm font-medium text-muted-foreground/60 transition-colors hover:text-foreground">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
