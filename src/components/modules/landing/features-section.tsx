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
          <Badge variant="outline" className="mb-4 rounded-full px-3 py-1 text-xs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-1 size-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            </svg>
            Capture &amp; Record
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Every capture mode
            <span className="block bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              you could ever need
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Screenshots, screen recordings, webcam overlays, and automatic browser context — all from a lightweight Chrome extension.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid auto-rows-min gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">

          {/* Large card — Screenshot capture */}
          <FeatureCard
            className="sm:col-span-2 lg:col-span-2 lg:row-span-2"
            icon={<CameraIcon />}
            title="4 Screenshot Modes"
            description="Capture the visible viewport, stitch the full page, drag a custom area, or test responsive layouts across iPhone, iPad, Galaxy, and Pixel emulations — all from one extension popup."
            visual={<ScreenCaptureVisual />}
          />

          {/* Screenshot Annotation */}
          <FeatureCard
            icon={<PenIcon />}
            title="Screenshot Annotations"
            description="Full annotation editor for screenshots: arrows, rectangles, circles, text, blur, freehand drawing with undo/redo, color/stroke/opacity controls."
          />

          {/* Console & Network logs */}
          <FeatureCard
            icon={<ConsoleIcon />}
            title="Auto Console & Network Logs"
            description="Intercepts console.log/error/warn and all HTTP requests automatically during recording. Zero setup — full context every time."
          />

          {/* Screen recording — large */}
          <FeatureCard
            className="sm:col-span-2 lg:col-span-2"
            icon={<VideoIcon />}
            title="Screen Recording with Webcam & Mic"
            description="Record your screen, tab, or window with optional microphone audio and a draggable webcam bubble. Includes a floating overlay showing elapsed time, file size, and auto-stop at 100MB."
            visual={<RecordingVisual />}
          />

          {/* Smart Capture — large feature */}
          <FeatureCard
            className="sm:col-span-2 lg:col-span-2"
            icon={<SmartCaptureIcon />}
            title="Smart Capture"
            description="Hover or drag to select any element — Vidro auto-detects and snaps to the closest DOM element. Export at custom sizes (OG Image, Twitter, 4K, and more) with auto-detected background color, padding, and toggles to include or remove box shadow, border, and outline."
            visual={<SmartCaptureVisual />}
          />

          {/* Paste & Export */}
          <FeatureCard
            icon={<PasteExportIcon />}
            title="Paste & Export"
            description="Paste an image from your clipboard, drag & drop, or browse a file — then export at any custom size with auto-matched background and padding presets."
          />

          {/* Recording Privacy */}
          <FeatureCard
            icon={<PrivacyIcon />}
            title="Recording Privacy"
            description="Draw blur zones over sensitive areas that stay blurred throughout the recording. Block entire tabs from appearing in screen or window captures — passwords, emails, and internal tools never leak."
            visual={<PrivacyVisual />}
          />

          {/* One-click sharing */}
          <FeatureCard
            icon={<ShareIcon />}
            title="Instant Shareable Links"
            description="Generate a link with one click. Deep-link to specific timestamps with ?t= parameters so your team jumps right to the bug."
          />

          {/* Responsive testing */}
          <FeatureCard
            icon={<DeviceIcon />}
            title="Responsive Device Screenshots"
            description="Emulate iPhone, iPad, Galaxy, and Pixel viewports using Chrome DevTools Protocol, then capture at that resolution."
          />

          {/* Extension powered */}
          <FeatureCard
            icon={<ExtensionIcon />}
            title="Chrome Extension"
            description="Lightweight extension that sits in your toolbar. Capture bugs from any website with pause/resume, recording timer, and usage tracking."
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

      {/* Webcam + Mic indicators */}
      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-green-500/5 border border-green-500/20 px-2 py-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="text-[10px] text-green-600 dark:text-green-400">Webcam</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-blue-500/5 border border-blue-500/20 px-2 py-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="text-[10px] text-blue-600 dark:text-blue-400">Mic</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-amber-500/5 border border-amber-500/20 px-2 py-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span className="text-[10px] text-amber-600 dark:text-amber-400">Logs</span>
        </div>
      </div>
    </div>
  );
}

function PrivacyVisual() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/40 bg-muted/20 p-4">
      <div className="flex gap-3">
        {/* Blur zones panel */}
        <div className="flex-1 rounded-lg border border-border/40 bg-background/50 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-3 text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.163 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Blur Zones</span>
          </div>
          <div className="relative h-16 rounded-md bg-gradient-to-br from-muted/50 to-muted/20 overflow-hidden">
            <div className="absolute top-2 left-2 right-6 h-3 rounded bg-foreground/8" />
            <div className="absolute top-7 left-2 right-10 h-3 rounded bg-foreground/8" />
            {/* Blur zone overlay */}
            <div className="absolute top-1 left-1 h-8 w-20 rounded border border-red-500/40 bg-red-500/10 backdrop-blur-sm flex items-center justify-center">
              <span className="text-[7px] font-bold text-red-400/70">BLURRED</span>
            </div>
          </div>
        </div>

        {/* Tab blocking panel */}
        <div className="flex-1 rounded-lg border border-border/40 bg-background/50 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-3 text-amber-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Tab Blocking</span>
          </div>
          <div className="space-y-1.5">
            {[
              { name: "Gmail", blocked: true },
              { name: "Dashboard", blocked: false },
              { name: "1Password", blocked: true },
            ].map((tab) => (
              <div key={tab.name} className="flex items-center justify-between rounded-md border border-border/30 bg-muted/20 px-2 py-1">
                <span className={`text-[9px] font-medium ${tab.blocked ? "text-muted-foreground/50 line-through" : "text-foreground/70"}`}>{tab.name}</span>
                <span className={`rounded px-1 py-0.5 text-[7px] font-bold ${tab.blocked ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                  {tab.blocked ? "BLOCKED" : "VISIBLE"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SmartCaptureVisual() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/40 bg-muted/20">
      <div className="p-4">
        {/* Element detection simulation */}
        <div className="relative rounded-lg border-2 border-dashed border-purple-400/50 bg-purple-500/5 p-3">
          <div className="absolute -top-2.5 left-3 flex items-center gap-1 rounded-full bg-purple-500 px-2 py-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="size-2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span className="text-[9px] font-bold text-white">div.card</span>
            <span className="text-[8px] text-white/60">320 x 180</span>
          </div>

          {/* Mock captured card */}
          <div className="rounded-lg border border-border/60 bg-card/80 p-3 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-red-400 to-orange-400" />
              <div className="flex-1 space-y-1">
                <div className="h-2 w-24 rounded bg-foreground/10" />
                <div className="h-1.5 w-16 rounded bg-muted-foreground/10" />
              </div>
            </div>
            <div className="h-12 rounded-md bg-gradient-to-br from-muted/50 to-muted/20" />
          </div>
        </div>

        {/* Confirm toolbar mockup */}
        <div className="mt-2 flex items-center justify-end gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-2.5 text-purple-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span className="text-[9px] text-purple-400">Snapped</span>
          </span>
          <span className="rounded bg-green-600 px-2 py-0.5 text-[9px] font-semibold text-white">Capture</span>
          <span className="rounded bg-neutral-700 px-2 py-0.5 text-[9px] font-semibold text-neutral-300">Reselect</span>
        </div>
      </div>

      {/* Export bar mockup */}
      <div className="border-t border-border/30 bg-muted/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-muted-foreground">Export</span>
            <div className="flex gap-1">
              {["OG Image", "Twitter", "HD", "4K"].map((p) => (
                <span key={p} className="rounded border border-border/40 bg-background/60 px-1.5 py-0.5 text-[8px] font-medium text-muted-foreground">{p}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[8px] font-medium text-purple-400">Shadow</span>
            <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[8px] font-medium text-purple-400">Border</span>
          </div>
        </div>
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

function PrivacyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function SmartCaptureIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  );
}

function PasteExportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 12.75h3m-3 3h3m-6-3h.008v.008H7.5v-.008zm0 3h.008v.008H7.5v-.008z" />
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
  );
}
