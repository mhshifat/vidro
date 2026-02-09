import { Badge } from "@/components/ui/badge";

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: StepProps[] = [
  {
    number: 1,
    title: "Install the Extension",
    description: "Add BugLens to Chrome in one click. It sits quietly in your toolbar until you need it.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    number: 2,
    title: "Capture the Bug",
    description: "Take a screenshot or screen recording. Console logs and network requests are captured automatically.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
  },
  {
    number: 3,
    title: "Annotate & Share",
    description: "Add annotations, write context, and share a link. Your team gets everything they need to fix it.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    ),
  },
];

function Step({ number, title, description, icon }: StepProps) {
  return (
    <div className="group relative flex flex-col items-center text-center">
      {/* Step circle */}
      <div className="relative mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-card text-red-500 shadow-lg shadow-red-500/5 transition-all duration-300 group-hover:border-red-500/30 group-hover:shadow-red-500/10 group-hover:scale-110">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-md">
          {number}
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4 rounded-full px-3 py-1 text-xs">How It Works</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Three steps to
            <span className="ml-2 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              better bug reports
            </span>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-8 left-1/2 hidden h-0.5 w-[60%] -translate-x-1/2 lg:block" aria-hidden="true">
            <svg className="h-full w-full" preserveAspectRatio="none">
              <line x1="0" y1="50%" x2="100%" y2="50%" className="stroke-border" strokeWidth="1" strokeDasharray="8 8" />
            </svg>
          </div>

          <div className="grid gap-12 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step) => (
              <Step key={step.number} {...step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
