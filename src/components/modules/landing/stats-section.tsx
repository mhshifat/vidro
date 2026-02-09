const STATS = [
  { value: "10x", label: "Faster bug reports" },
  { value: "85%", label: "Less back & forth" },
  { value: "500+", label: "Teams using BugLens" },
  { value: "50k+", label: "Bugs captured" },
] as const;

export function StatsSection() {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-muted/20">
          <div className="grid grid-cols-2 divide-x divide-border/30 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="group flex flex-col items-center justify-center px-4 py-10 text-center transition-colors hover:bg-accent/30 sm:py-12">
                <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent sm:text-4xl lg:text-5xl">
                  {stat.value}
                </span>
                <span className="mt-2 text-sm font-medium text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
