import { Badge } from "@/components/ui/badge";

const VIDEO_FEATURES = [
  {
    icon: "chapters",
    title: "AI Video Chapters",
    description: "Auto-generated chapter markers on the timeline from report context.",
  },
  {
    icon: "clip",
    title: "GIF & Clip Export",
    description: "Export any time range as a WebM or animated GIF file.",
  },
  {
    icon: "trim",
    title: "Video Trimming",
    description: "Trim your recording to a selected range and download the result.",
  },
  {
    icon: "ocr",
    title: "Screen OCR",
    description: "AI text extraction from the current video frame using report context.",
  },
  {
    icon: "timestamp",
    title: "Timestamp Deep Links",
    description: "Share links that open directly at a specific moment in the video.",
  },
  {
    icon: "heatmap",
    title: "Error Heatmap",
    description: "Red zones on the timeline marking where console errors occurred.",
  },
  {
    icon: "thumbnail",
    title: "Thumbnail Preview",
    description: "Hover over the progress bar to see frame-by-frame thumbnail previews.",
  },
  {
    icon: "slowmo",
    title: "Auto Slow-Mo",
    description: "AI-detected bug moments auto-play at 0.5x speed so nothing is missed.",
  },
  {
    icon: "speed",
    title: "Playback Speed",
    description: "Cycle between 0.5x, 1x, 1.5x, and 2x playback with one click.",
  },
  {
    icon: "pip",
    title: "Picture-in-Picture",
    description: "Pop the video into a floating window while browsing other tabs.",
  },
  {
    icon: "keyboard",
    title: "Keyboard Shortcuts",
    description: "Arrow keys for ±5s skip, spacebar play/pause, and more.",
  },
  {
    icon: "fullscreen",
    title: "Fullscreen Mode",
    description: "Expand the video to full screen for detailed frame inspection.",
  },
] as const;

const ANNOTATION_FEATURES = [
  {
    icon: "arrow",
    title: "Arrows & Shapes",
    description: "Draw arrows, circles, and rectangles to highlight specific areas.",
  },
  {
    icon: "text",
    title: "Text Labels",
    description: "Add text annotations with customizable colors at any timestamp.",
  },
  {
    icon: "blur",
    title: "Blur & Redaction",
    description: "Time-ranged blur regions that persist across configurable time windows.",
  },
  {
    icon: "undo",
    title: "Undo / Redo",
    description: "Full history stack with Ctrl+Z / Ctrl+Y keyboard shortcuts.",
  },
  {
    icon: "save",
    title: "Auto-Save",
    description: "Debounced 800ms auto-save persists annotations to the database.",
  },
  {
    icon: "markers",
    title: "Timeline Markers",
    description: "Colored dots on the progress bar show where annotations exist.",
  },
] as const;

const COMMENT_FEATURES = [
  {
    icon: "thread",
    title: "Threaded Comments",
    description: "Nested tree-structured comment threads with avatars and relative timestamps.",
  },
  {
    icon: "timestamp",
    title: "Timestamped Comments",
    description: "Attach a video timestamp — clicking the badge seeks to that moment.",
  },
  {
    icon: "ai-reply",
    title: "AI-Suggested Replies",
    description: "AI generates contextual reply suggestions from report and thread context.",
  },
  {
    icon: "edit",
    title: "Edit & Delete",
    description: "Comment owners can edit or delete their own comments with full control.",
  },
] as const;

function FeatureIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    chapters: <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25c0 .621.504 1.125 1.125 1.125M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5" />,
    clip: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9.75a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />,
    trim: <path strokeLinecap="round" strokeLinejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.165 2.165 0 011.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    ocr: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />,
    timestamp: <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />,
    heatmap: <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />,
    thumbnail: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 3.75h-1.5M18 3.75h1.5m-1.5 0v1.5m0-1.5v-1.5m-3 7.5a3 3 0 11-6 0 3 3 0 016 0z" />,
    slowmo: <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811z" />,
    speed: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />,
    pip: <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />,
    keyboard: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />,
    fullscreen: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />,
    arrow: <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />,
    text: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />,
    blur: <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />,
    undo: <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />,
    save: <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />,
    markers: <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />,
    thread: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />,
    "ai-reply": <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />,
    edit: <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />,
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
      {icons[type]}
    </svg>
  );
}

function SmallFeature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="group flex gap-3 rounded-xl border border-border/40 bg-card/30 p-3.5 transition-all duration-200 hover:border-cyan-500/30 hover:bg-cyan-500/[0.02]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
        <FeatureIcon type={icon} />
      </div>
      <div>
        <h4 className="text-sm font-semibold tracking-tight">{title}</h4>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function VideoToolsSection() {
  return (
    <section id="video-tools" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4 rounded-full border-cyan-200 bg-cyan-50 px-3 py-1 text-xs text-cyan-700 dark:border-cyan-900/50 dark:bg-cyan-950/30 dark:text-cyan-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-1 size-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Video, Annotations & Comments
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            A video player
            <span className="block bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              built for debugging
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Not just playback — chapters, annotations, blur redaction, threaded comments, and 22+ tools to dissect every frame.
          </p>
        </div>

        {/* Feature-rich video player preview */}
        <div className="mb-12 overflow-hidden rounded-2xl border border-border/50 bg-card/50">
          <div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-4 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400/70" />
              <div className="h-3 w-3 rounded-full bg-amber-400/70" />
              <div className="h-3 w-3 rounded-full bg-green-400/70" />
            </div>
            <span className="mx-auto text-[11px] font-medium text-muted-foreground">Vidro Video Player</span>
          </div>
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 p-6 sm:p-8">
            {/* Mock video area */}
            <div className="relative aspect-video rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
              {/* Annotation overlay */}
              <svg className="absolute inset-0 h-full w-full">
                {/* Arrow annotation */}
                <line x1="15%" y1="25%" x2="35%" y2="45%" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                  </marker>
                </defs>
                {/* Circle */}
                <circle cx="65%" cy="35%" r="8%" stroke="#3b82f6" strokeWidth="2" fill="none" />
                {/* Blur zone */}
                <rect x="70%" y="60%" width="20%" height="15%" rx="4" fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" />
                <text x="72%" y="72%" className="text-[8px] fill-purple-400/70" fontFamily="monospace">blur</text>
                {/* Text annotation */}
                <text x="20%" y="70%" className="text-[10px] fill-amber-400" fontFamily="sans-serif">Bug here!</text>
              </svg>

              {/* Chapter markers */}
              <div className="absolute bottom-10 left-0 right-0 px-4">
                <div className="flex items-center gap-1 text-[9px] text-white/40">
                  <span className="rounded bg-white/10 px-1.5 py-0.5">Ch 1: Login</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5">Ch 2: Dashboard</span>
                  <span className="rounded bg-cyan-500/30 px-1.5 py-0.5 text-cyan-300">Ch 3: Error</span>
                </div>
              </div>

              {/* Progress bar mockup */}
              <div className="absolute bottom-3 left-4 right-4">
                <div className="relative h-1.5 rounded-full bg-white/10">
                  <div className="h-full w-[55%] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                  {/* Error heatmap zones */}
                  <div className="absolute top-0 left-[30%] h-full w-[8%] rounded-full bg-red-500/40" />
                  <div className="absolute top-0 left-[72%] h-full w-[5%] rounded-full bg-red-500/40" />
                  {/* Bug moment highlight */}
                  <div className="absolute top-0 left-[45%] h-full w-[12%] rounded-full bg-amber-500/30" />
                  {/* Comment markers */}
                  <div className="absolute -top-1 left-[25%] h-3 w-3 rounded-full bg-amber-400 border-2 border-gray-900" />
                  <div className="absolute -top-1 left-[60%] h-3 w-3 rounded-full bg-cyan-400 border-2 border-gray-900" />
                </div>
              </div>

              {/* Playback controls */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 bg-gradient-to-t from-black/60 to-transparent px-4 py-2">
                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="ml-0.5 border-l-[6px] border-l-white border-y-[4px] border-y-transparent" />
                </div>
                <span className="text-[10px] text-white/60 tabular-nums">01:34 / 03:12</span>
                <div className="flex-1" />
                <span className="text-[10px] text-white/40 bg-white/10 px-1.5 py-0.5 rounded">1.5x</span>
                <div className="h-4 w-4 rounded bg-white/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Three column feature grid: Video | Annotations | Comments */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Video Features */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Video Player</h3>
              <Badge className="bg-cyan-500/10 text-cyan-600 text-[10px] border-0">{VIDEO_FEATURES.length} features</Badge>
            </div>
            <div className="space-y-2">
              {VIDEO_FEATURES.map((f) => (
                <SmallFeature key={f.title} {...f} />
              ))}
            </div>
          </div>

          {/* Annotations Features */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Annotations</h3>
              <Badge className="bg-orange-500/10 text-orange-600 text-[10px] border-0">{ANNOTATION_FEATURES.length} tools</Badge>
            </div>
            <div className="space-y-2">
              {ANNOTATION_FEATURES.map((f) => (
                <SmallFeature key={f.title} {...f} />
              ))}
            </div>

            {/* Comments Features */}
            <div className="mt-8">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Comments</h3>
                <Badge className="bg-amber-500/10 text-amber-600 text-[10px] border-0">{COMMENT_FEATURES.length} features</Badge>
              </div>
              <div className="space-y-2">
                {COMMENT_FEATURES.map((f) => (
                  <SmallFeature key={f.title} {...f} />
                ))}
              </div>
            </div>
          </div>

          {/* Dashboard & Report Management */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Dashboard & Reports</h3>
            </div>
            <div className="space-y-2">
              {[
                { icon: "fullscreen", title: "Reports Grid", description: "Visual grid of bug reports with thumbnails, error/request badges." },
                { icon: "heatmap", title: "Stats Overview", description: "Aggregate stats: total reports, console errors, failed requests." },
                { icon: "save", title: "Storage Tracker", description: "Visual storage bar with MB used, report count, and codec info." },
                { icon: "edit", title: "Inline Editing", description: "Edit report titles and descriptions directly with save/cancel." },
                { icon: "clip", title: "Download & Share", description: "Download media and copy shareable links from any report." },
                { icon: "thumbnail", title: "Copy to Clipboard", description: "One-click copy screenshots directly to your clipboard." },
                { icon: "chapters", title: "Console & Network Logs", description: "Scrollable panels with color-coded console events and HTTP requests." },
                { icon: "ocr", title: "Transcript Viewer", description: "View AI-generated transcripts in a dedicated scrollable tab." },
              ].map((f) => (
                <SmallFeature key={f.title} {...f} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
