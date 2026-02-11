import { Badge } from "@/components/ui/badge";

/* ─── Extension Demo Section ─────────────────────────────── */
export function ExtensionDemoSection() {
  return (
    <section id="extension" className="relative py-24 sm:py-32" aria-label="Chrome Extension walkthrough">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4 gap-1.5 border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Chrome Extension
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            One click in your{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">toolbar</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            A lightweight Chrome extension that sits quietly until you need it.
            Record, screenshot, annotate — all without leaving the page.
          </p>
        </div>

        {/* 3-panel walkthrough */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Panel 1 — Popup Main View */}
          <div className="flex flex-col items-center gap-4">
            <StepBadge step={1} label="Open popup" />
            <div className="w-full max-w-[280px]" aria-hidden="true">
              <PopupMockup />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-[260px]">
              Click the Vidro icon in your toolbar. Record screen or take a screenshot with one tap.
            </p>
          </div>

          {/* Panel 2 — Recording Active */}
          <div className="flex flex-col items-center gap-4">
            <StepBadge step={2} label="Capture the bug" />
            <div className="w-full max-w-[280px]" aria-hidden="true">
              <RecordingMockup />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-[260px]">
              Console logs and network requests are captured automatically in the background.
            </p>
          </div>

          {/* Panel 3 — Screenshot View */}
          <div className="flex flex-col items-center gap-4">
            <StepBadge step={3} label="Screenshot modes" />
            <div className="w-full max-w-[280px]" aria-hidden="true">
              <ScreenshotMockup />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-[260px]">
              4 screenshot modes: visible page, full page scroll-stitch, area select, and responsive device emulation.
            </p>
          </div>
        </div>

        {/* Feature chips */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-2">
          {[
            "Pause / Resume",
            "Webcam overlay",
            "Mic toggle",
            "100 MB max",
            "VP9 codec",
            "Auto console logs",
            "Auto network logs",
            "Usage tracking",
            "6 device presets",
            "Area selection",
            "Full page stitch",
            "Annotation editor",
          ].map((f) => (
            <span
              key={f}
              className="rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Step Badge ─────────────────────────────────────────── */
function StepBadge({ step, label }: { step: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-7 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-500">
        {step}
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

/* ─── Popup Main View Mockup ──────────────────────────────── */
function PopupMockup() {
  return (
    <div className="rounded-2xl border border-border/60 bg-neutral-950 p-5 shadow-2xl shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-red-500">
            <svg viewBox="0 0 32 32" fill="none" className="size-4">
              <circle cx="16" cy="16" r="7" fill="white" opacity="0.9" />
              <circle cx="16" cy="16" r="3.5" fill="#ef4444" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white">Vidro</span>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
          Connected
        </span>
      </div>

      {/* Record button */}
      <button className="flex items-center justify-center gap-2.5 w-full h-14 rounded-xl bg-gradient-to-b from-red-600 to-red-700 text-white font-bold mb-3 relative overflow-hidden cursor-default">
        <span className="relative flex size-5 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-50" />
          <svg viewBox="0 0 24 24" fill="white" className="size-4 relative"><circle cx="12" cy="12" r="6" /></svg>
        </span>
        <span className="text-sm">Record Screen</span>
      </button>

      {/* Screenshot button */}
      <button className="flex items-center justify-center gap-2 w-full h-9 rounded-lg border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-semibold mb-4 cursor-default">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
        Take Screenshot
      </button>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        <ToggleChipMock icon="mic" label="Microphone" active />
        <ToggleChipMock icon="cam" label="Camera" active={false} />
      </div>

      {/* Auto-captured */}
      <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mb-1.5">Auto-captured</p>
      <div className="grid grid-cols-3 gap-1">
        {["Screen", "Console", "Network"].map((l) => (
          <div key={l} className="flex items-center justify-center gap-1 rounded-md border border-neutral-800/60 bg-neutral-900/40 py-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-semibold text-neutral-400">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Recording Active Mockup ─────────────────────────────── */
function RecordingMockup() {
  return (
    <div className="rounded-2xl border border-border/60 bg-neutral-950 p-5 shadow-2xl shadow-black/20">
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing indicator */}
        <div className="relative flex items-center justify-center size-14">
          <span className="absolute size-14 rounded-full bg-red-500/20 animate-ping" />
          <span className="absolute size-10 rounded-full bg-red-500/10" />
          <span className="relative size-5 rounded-full bg-red-500" />
        </div>
        <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Recording</span>

        <p className="text-[10px] text-neutral-500 text-center leading-relaxed px-2">
          Console logs &amp; network requests are captured in real-time while you record.
        </p>

        {/* Live stats */}
        <div className="w-full grid grid-cols-3 gap-1.5">
          <StatChip label="Duration" value="1:24" />
          <StatChip label="Console" value="12" />
          <StatChip label="Network" value="38" />
        </div>

        {/* Overlay hint */}
        <div className="w-full rounded-lg border border-neutral-800/60 bg-neutral-900/40 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="size-2 rounded-full bg-red-500" />
              <span className="size-2 rounded-full bg-amber-500" />
              <span className="size-2 rounded-full bg-neutral-600" />
            </div>
            <span className="text-[9px] text-neutral-500">Floating overlay controls</span>
          </div>
          <div className="mt-1.5 flex gap-1">
            <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[8px] font-semibold text-neutral-300">⏸ Pause</span>
            <span className="rounded bg-red-600 px-1.5 py-0.5 text-[8px] font-semibold text-white">⏹ Stop</span>
            <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[8px] font-semibold text-neutral-400">✕ Cancel</span>
          </div>
        </div>

        {/* Stop button */}
        <button className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-red-600 text-white text-sm font-bold cursor-default">
          <svg viewBox="0 0 24 24" fill="white" className="size-4"><rect x="7" y="7" width="10" height="10" rx="1.5" /></svg>
          Stop &amp; Save
        </button>
      </div>
    </div>
  );
}

/* ─── Screenshot Modes Mockup ──────────────────────────────── */
function ScreenshotMockup() {
  return (
    <div className="rounded-2xl border border-border/60 bg-neutral-950 p-5 shadow-2xl shadow-black/20">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-4 text-neutral-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        <span className="text-blue-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
        </span>
        <span className="text-xs font-bold text-white">Screenshot</span>
      </div>

      {/* Options */}
      <div className="space-y-1.5">
        <ScreenshotOptionMock icon="visible" label="Visible Page" desc="Capture what you currently see" />
        <ScreenshotOptionMock icon="full" label="Full Page" desc="Scroll and capture entire page" />
        <ScreenshotOptionMock icon="area" label="Select Area" desc="Click and drag to select a region" active />
        <ScreenshotOptionMock icon="annotate" label="Annotate Area" desc="Select area → draw arrows & text" />
      </div>

      {/* Responsive presets */}
      <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mt-3 mb-1.5">Responsive</p>
      <div className="grid grid-cols-3 gap-1">
        {["iPhone 14", "iPad", "Galaxy S21"].map((d, i) => (
          <div
            key={d}
            className={`flex flex-col items-center rounded-md border px-1.5 py-1.5 ${
              i === 0
                ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                : "border-neutral-800/60 bg-neutral-900/40 text-neutral-500"
            }`}
          >
            <span className="text-[9px] font-semibold">{d}</span>
            <span className="text-[8px] text-neutral-600">{i === 0 ? "390×844" : i === 1 ? "768×1024" : "360×800"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tiny helper components ──────────────────────────────── */

function ToggleChipMock({ icon, label, active }: { icon: "mic" | "cam"; label: string; active: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 ${
        active
          ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-400"
          : "border-neutral-800/60 bg-neutral-900/40 text-neutral-500"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-3.5">
        {icon === "mic" ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9.75a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        )}
      </svg>
      <div className="flex flex-col">
        <span className="text-[10px] font-semibold leading-none">{label}</span>
        <span className={`text-[8px] mt-0.5 ${active ? "text-emerald-500/60" : "text-neutral-600"}`}>
          {active ? "On" : "Off"}
        </span>
      </div>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-neutral-800/60 bg-neutral-900/40 py-1.5">
      <span className="text-[9px] text-neutral-500">{label}</span>
      <span className="text-xs font-bold tabular-nums text-neutral-200">{value}</span>
    </div>
  );
}

function ScreenshotOptionMock({ icon, label, desc, active }: { icon: string; label: string; desc: string; active?: boolean }) {
  const iconMap: Record<string, React.ReactNode> = {
    visible: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    full: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
      </svg>
    ),
    area: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
    annotate: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
      </svg>
    ),
  };

  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 ${
        active
          ? "border-blue-500/30 bg-blue-500/8"
          : "border-neutral-800/60 bg-neutral-900/40"
      }`}
    >
      <div className={`flex items-center justify-center size-6 rounded-md ${active ? "bg-blue-500/20 text-blue-400" : "bg-neutral-800/60 text-neutral-400"}`}>
        {iconMap[icon]}
      </div>
      <div className="flex flex-col min-w-0">
        <span className={`text-[11px] font-semibold ${active ? "text-blue-300" : "text-neutral-200"}`}>{label}</span>
        <span className="text-[9px] text-neutral-500 leading-tight">{desc}</span>
      </div>
    </div>
  );
}
