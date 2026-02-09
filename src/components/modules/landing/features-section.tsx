import { Badge } from "@/components/ui/badge";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  visual?: React.ReactNode;
}

function FeatureCard({ icon, title, description, className = "", visual }: FeatureCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 transition-all duration-300 hover:border-border hover:bg-card hover:shadow-lg hover:shadow-black/5 ${className}`}>
      {/* Hover gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-500/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>

      {visual && (
        <div className="relative z-10 mt-5">
          {visual}
        </div>
      )}
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4 rounded-full px-3 py-1 text-xs">Features</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Everything you need to
            <span className="block bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              squash bugs faster
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete toolkit for capturing, annotating, and sharing bug reports — built right into your browser.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid auto-rows-min gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">

          {/* Large card — Screenshot capture */}
          <FeatureCard
            className="sm:col-span-2 lg:col-span-2 lg:row-span-2"
            icon={<CameraIcon />}
            title="Instant Screen Capture"
            description="Capture visible viewport, full page, custom area, or responsive screenshots in a single click. Everything happens right in your browser — no desktop app needed."
            visual={<ScreenCaptureVisual />}
          />

          {/* Annotation */}
          <FeatureCard
            icon={<PenIcon />}
            title="Rich Annotations"
            description="Draw, type, highlight, and annotate directly on your screenshots with shapes, arrows, text, and a freehand brush."
          />

          {/* Console logs */}
          <FeatureCard
            icon={<ConsoleIcon />}
            title="Console & Network Logs"
            description="Automatically captures browser console errors, warnings, and network requests alongside your recording for full context."
          />

          {/* Screen recording — large */}
          <FeatureCard
            className="sm:col-span-2 lg:col-span-2"
            icon={<VideoIcon />}
            title="Screen Recording with Audio"
            description="Record your screen, tab, or window with optional microphone and webcam overlay. Recordings are stored efficiently and ready to share instantly."
            visual={<RecordingVisual />}
          />

          {/* One-click sharing */}
          <FeatureCard
            icon={<ShareIcon />}
            title="One-Click Sharing"
            description="Generate a shareable link instantly. Your team gets the screenshot or recording plus all captured browser context in one place."
          />

          {/* Responsive testing */}
          <FeatureCard
            icon={<DeviceIcon />}
            title="Responsive Testing"
            description="Test how pages look across iPhone, iPad, Galaxy, and Pixel devices with one-click responsive screenshots."
          />

          {/* Extension powered */}
          <FeatureCard
            icon={<ExtensionIcon />}
            title="Browser Extension"
            description="Lightweight Chrome extension that sits in your toolbar. Capture bugs from any website without switching contexts."
          />

        </div>
      </div>
    </section>
  );
}

/* ─── Visual Components ─────────────────────────────────── */

function ScreenCaptureVisual() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/40 bg-muted/20">
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        {(["Visible", "Full Page", "Area", "Responsive"] as const).map((mode, i) => (
          <div key={mode} className="group/card flex flex-col items-center gap-2 rounded-lg border border-border/30 bg-background/50 p-3 transition-all hover:border-red-500/30 hover:bg-red-500/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/10 to-orange-400/10">
              {i === 0 && <VisibleIcon />}
              {i === 1 && <FullPageIcon />}
              {i === 2 && <AreaIcon />}
              {i === 3 && <DeviceIcon />}
            </div>
            <span className="text-xs font-medium text-muted-foreground">{mode}</span>
          </div>
        ))}
      </div>

      {/* Fake "captured" thumbnail strip */}
      <div className="border-t border-border/30 bg-muted/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] font-medium text-muted-foreground">3 screenshots captured</span>
        </div>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-20 shrink-0 rounded-md border border-border/40 bg-gradient-to-br from-muted/50 to-muted/20" />
          ))}
        </div>
      </div>
    </div>
  );
}

function RecordingVisual() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/40 bg-muted/20 p-4">
      <div className="flex items-center gap-4">
        {/* Recording indicator */}
        <div className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          <span className="text-xs font-semibold text-red-600 dark:text-red-400 tabular-nums">02:34</span>
        </div>

        {/* Waveform */}
        <div className="flex flex-1 items-center gap-0.5">
          {Array.from({ length: 40 }).map((_, i) => {
            const height = 8 + Math.sin(i * 0.7) * 12 + Math.cos(i * 1.3) * 6;
            return (
              <div
                key={i}
                className="w-1 shrink-0 rounded-full bg-red-500/30"
                style={{ height: `${Math.max(4, height)}px` }}
              />
            );
          })}
        </div>

        {/* Size badge */}
        <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">4.2 MB</span>
      </div>
    </div>
  );
}

/* ─── SVG Icons ───────────────────────────────────────────── */

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    </svg>
  );
}

function ConsoleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9.75a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  );
}

function ExtensionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.491 48.491 0 01-4.163-.3c-1.18-.143-2.13-.876-2.379-2.033a47.435 47.435 0 01-.788-5.754C3.101 7.589 4.087 7.5 5.086 7.5h13.828c.999 0 1.985.089 2.953.265a47.437 47.437 0 01-.788 5.754c-.249 1.157-1.2 1.89-2.379 2.033a48.394 48.394 0 01-4.163.3v0a.64.64 0 01-.657-.643v0c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.035-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.656.656 0 01-.658.663 47.703 47.703 0 00-4.168.341c-1.176.175-2.098.93-2.336 2.086a47.674 47.674 0 00-.628 5.332C3.093 21.41 4.078 21.5 5.08 21.5h13.84c1.002 0 1.987-.09 2.953-.265a47.676 47.676 0 00-.628-5.332c-.238-1.156-1.16-1.911-2.336-2.086A47.602 47.602 0 0014.907 13.489a.656.656 0 01-.658-.663z" />
    </svg>
  );
}

function VisibleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5 text-red-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
    </svg>
  );
}

function FullPageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5 text-red-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5 text-red-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.165 2.165 0 011.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199m0 0a4.323 4.323 0 012.068-1.379l5.325-1.628a4.5 4.5 0 012.48-.044l.803.215-7.794 4.5m-2.882-1.664A4.33 4.33 0 0010.607 12m3.736 0l7.794 4.5-.802.215a4.5 4.5 0 01-2.48-.043l-5.326-1.629a4.324 4.324 0 01-2.068-1.379M14.343 12l-2.882 1.664" />
    </svg>
  );
}
