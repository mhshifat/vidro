/** Animated SVG background decorations for the landing page */
export function AnimatedGridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Dot grid pattern */}
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotGrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" className="fill-foreground/[0.04]" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" />
      </svg>

      {/* Gradient orbs with float animation */}
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-red-500/10 to-orange-400/5 blur-3xl animate-[float_20s_ease-in-out_infinite]" />
      <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-blue-500/8 to-violet-400/5 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-red-500/5 to-amber-500/5 blur-3xl animate-[pulse_15s_ease-in-out_infinite]" />
    </div>
  );
}

export function HeroGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Central radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px]">
        <svg viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full animate-[spin_60s_linear_infinite]">
          <circle cx="400" cy="400" r="350" stroke="url(#heroGrad)" strokeWidth="0.5" opacity="0.3" />
          <circle cx="400" cy="400" r="280" stroke="url(#heroGrad)" strokeWidth="0.5" opacity="0.2" />
          <circle cx="400" cy="400" r="200" stroke="url(#heroGrad)" strokeWidth="0.5" opacity="0.15" />
          <defs>
            <linearGradient id="heroGrad" x1="0" y1="0" x2="800" y2="800">
              <stop stopColor="#ef4444" stopOpacity="0.5" />
              <stop offset="0.5" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="1" stopColor="#ef4444" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating geometric shapes */}
      <svg className="absolute top-20 left-[10%] h-16 w-16 animate-[float_12s_ease-in-out_infinite]" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="8" width="48" height="48" rx="12" className="stroke-red-500/10" strokeWidth="1" />
      </svg>
      <svg className="absolute top-40 right-[15%] h-12 w-12 animate-[float_16s_ease-in-out_infinite_reverse]" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" className="stroke-orange-400/10" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-32 left-[20%] h-10 w-10 animate-[float_14s_ease-in-out_2s_infinite]" viewBox="0 0 40 40" fill="none">
        <polygon points="20,2 38,38 2,38" className="stroke-red-500/8" strokeWidth="1" />
      </svg>
    </div>
  );
}

export function SectionDivider() {
  return (
    <div className="relative mx-auto w-full max-w-5xl" aria-hidden="true">
      <svg viewBox="0 0 1024 4" fill="none" className="w-full h-1">
        <line x1="0" y1="2" x2="1024" y2="2" className="stroke-border" strokeWidth="0.5" strokeDasharray="6 6" />
      </svg>
    </div>
  );
}
