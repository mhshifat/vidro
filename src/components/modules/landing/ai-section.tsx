import { Badge } from "@/components/ui/badge";

const AI_FEATURES = [
  {
    icon: "severity",
    title: "Severity & Priority",
    description: "Auto-classifies bugs as critical/high/medium/low with P0–P3 priority labels.",
  },
  {
    icon: "tags",
    title: "Auto-Tagging",
    description: "Tags bugs with categories like UI, Performance, Crash, Auth, API, or Security.",
  },
  {
    icon: "steps",
    title: "Reproduction Steps",
    description: "Generates step-by-step instructions to reproduce the bug from video & logs.",
  },
  {
    icon: "root",
    title: "Root Cause Analysis",
    description: "Analyzes console & network logs to identify the probable root cause.",
  },
  {
    icon: "log",
    title: "Log Summary",
    description: "Condenses hundreds of console and network events into a concise overview.",
  },
  {
    icon: "stakeholder",
    title: "Stakeholder Summary",
    description: "Non-technical summary for PMs and stakeholders who need the big picture.",
  },
  {
    icon: "fix",
    title: "Suggested Fix",
    description: "AI debugs the issue and suggests code fixes and debugging strategies.",
  },
  {
    icon: "duplicate",
    title: "Duplicate Detection",
    description: "Compares reports and flags potential duplicates with similarity scores.",
  },
  {
    icon: "accessibility",
    title: "Accessibility Audit",
    description: "WCAG compliance audit with scores, issues, and actionable recommendations.",
  },
  {
    icon: "performance",
    title: "Performance Analysis",
    description: "Detects performance bottlenecks with impact ratings and optimization tips.",
  },
  {
    icon: "security",
    title: "Security Scan",
    description: "Scans for security vulnerabilities with severity levels and fixes.",
  },
  {
    icon: "test",
    title: "Test Case Generation",
    description: "Generates test cases to verify the bug is fixed and prevent regressions.",
  },
  {
    icon: "sentiment",
    title: "Sentiment & Urgency",
    description: "Detects reporter frustration and urgency to help prioritize responses.",
  },
  {
    icon: "translate",
    title: "Report Translation",
    description: "Translates bug reports into any language for global, distributed teams.",
  },
  {
    icon: "digest",
    title: "Weekly Digest",
    description: "AI-generated summary of all bugs from the past week for standup & planning.",
  },
  {
    icon: "diff",
    title: "Report Comparison",
    description: "Side-by-side AI diff between two bug reports highlighting similarities.",
  },
  {
    icon: "search",
    title: "Natural Language Search",
    description: "Search reports with plain English — \"critical login bugs from this week\".",
  },
  {
    icon: "assign",
    title: "Smart Assignment",
    description: "Suggests team members to assign bugs to based on expertise and bug type.",
  },
] as const;

function AIIcon({ type }: { type: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    severity: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    tags: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
    steps: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    root: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    log: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    stakeholder: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    fix: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1m0 0L12 4.36m-5.68 5.71h11.37M14.5 4.36l5.68 5.71-5.68 5.71" />
      </svg>
    ),
    duplicate: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
      </svg>
    ),
    accessibility: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-4 4.5h8m-6.5 1.5l2.5 5m2.5-5l-2.5 5" />
      </svg>
    ),
    performance: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    security: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    test: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 7.94A2.252 2.252 0 0114.382 24H9.618a2.252 2.252 0 01-2.148-1.56L5 14.5m14 0H5" />
      </svg>
    ),
    sentiment: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
    translate: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
      </svg>
    ),
    digest: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    diff: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    search: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    assign: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
      </svg>
    ),
  };

  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/15 to-purple-500/15 text-violet-500">
      {iconMap[type] || iconMap.search}
    </div>
  );
}

export function AISection() {
  return (
    <section id="ai" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4 rounded-full border-violet-200 bg-violet-50 px-3 py-1 text-xs text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-1 size-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            18 AI Features
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            AI that actually
            <span className="block bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
              understands your bugs
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every report is analyzed by 18 AI models that classify, summarize, and suggest fixes — so your team can focus on shipping, not triaging.
          </p>
        </div>

        {/* AI feature highlight cards - top 3 large */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          <div className="group relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.03] to-purple-500/[0.03] p-6 transition-all duration-300 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5 sm:col-span-1">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Run All with One Click</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Hit a single button to run all 18 AI analyses sequentially — severity, priority, repro steps, root cause, fix suggestions, and more.
            </p>
            {/* Visual */}
            <div className="mt-5 overflow-hidden rounded-xl border border-border/30 bg-muted/10 p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-[11px] font-medium text-muted-foreground">Running AI analysis...</span>
              </div>
              <div className="space-y-2">
                {["Severity: Critical", "Priority: P0", "Tags: Auth, API"].map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="size-3 text-green-500"><path d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.844-8.791a.75.75 0 00-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 10-1.114 1.004l2.25 2.5a.75.75 0 001.15-.043l4.25-5.5z" /></svg>
                    <span className="text-[11px] text-muted-foreground">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.03] to-purple-500/[0.03] p-6 transition-all duration-300 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Natural Language Search</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Search across 12 fields using plain English. Ask for &quot;critical login bugs from this week&quot; and get precise, ranked results with matched field highlights.
            </p>
            <div className="mt-5 overflow-hidden rounded-xl border border-border/30 bg-muted/10 p-3">
              <div className="flex items-center gap-1.5 rounded-md bg-background/60 border border-border/40 px-2.5 py-1.5">
                <svg viewBox="0 0 16 16" fill="currentColor" className="size-3 text-muted-foreground/50"><path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z" /></svg>
                <span className="text-[11px] text-muted-foreground/70">API errors with 500 status...</span>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.03] to-purple-500/[0.03] p-6 transition-all duration-300 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Duplicate Detection</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              AI compares new reports against your entire history and flags potential duplicates with similarity scores to keep your backlog clean.
            </p>
            <div className="mt-5 overflow-hidden rounded-xl border border-border/30 bg-muted/10 p-3">
              <div className="space-y-1.5">
                {[{t:"Login crash on iOS", s:"92%"},{t:"Auth timeout error", s:"78%"}].map((d,i)=>(
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{d.t}</span>
                    <span className={`text-[10px] font-semibold ${i===0?'text-red-500':'text-amber-500'}`}>{d.s} match</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full AI features grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {AI_FEATURES.map((feature) => (
            <div key={feature.title} className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/30 p-4 transition-all duration-200 hover:border-violet-500/30 hover:bg-violet-500/[0.02] hover:shadow-sm">
              <div className="mb-3">
                <AIIcon type={feature.icon} />
              </div>
              <h4 className="mb-1 text-xs font-semibold tracking-tight">{feature.title}</h4>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
