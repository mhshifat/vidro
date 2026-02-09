import type { ReactNode } from "react";

/* ─── Animated SVG Background ──────────────────────────────────── */
function AuthBackground() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-background via-background to-muted/30" />

            {/* Animated SVG blobs */}
            <svg
                className="absolute inset-0 size-full opacity-[0.04]"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
                            result="goo"
                        />
                    </filter>
                </defs>
                <g filter="url(#goo)">
                    <circle cx="15%" cy="20%" r="180" fill="currentColor">
                        <animate
                            attributeName="cx"
                            values="15%;25%;15%"
                            dur="22s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="cy"
                            values="20%;35%;20%"
                            dur="18s"
                            repeatCount="indefinite"
                        />
                    </circle>
                    <circle cx="75%" cy="70%" r="200" fill="currentColor">
                        <animate
                            attributeName="cx"
                            values="75%;65%;75%"
                            dur="20s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="cy"
                            values="70%;55%;70%"
                            dur="24s"
                            repeatCount="indefinite"
                        />
                    </circle>
                    <circle cx="50%" cy="50%" r="150" fill="currentColor">
                        <animate
                            attributeName="cx"
                            values="50%;40%;60%;50%"
                            dur="26s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="cy"
                            values="50%;60%;40%;50%"
                            dur="30s"
                            repeatCount="indefinite"
                        />
                    </circle>
                </g>
            </svg>

            {/* Grid pattern */}
            <svg className="absolute inset-0 size-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Floating dots */}
            <svg className="absolute inset-0 size-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
                {[
                    { cx: "10%", cy: "15%", r: 3, dur: "8s", delay: "0s" },
                    { cx: "90%", cy: "25%", r: 2, dur: "10s", delay: "1s" },
                    { cx: "20%", cy: "80%", r: 4, dur: "12s", delay: "2s" },
                    { cx: "80%", cy: "85%", r: 2.5, dur: "9s", delay: "0.5s" },
                    { cx: "50%", cy: "10%", r: 3, dur: "11s", delay: "3s" },
                    { cx: "35%", cy: "60%", r: 2, dur: "14s", delay: "1.5s" },
                    { cx: "65%", cy: "40%", r: 3.5, dur: "13s", delay: "2.5s" },
                ].map((dot, i) => (
                    <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill="currentColor">
                        <animate
                            attributeName="opacity"
                            values="0;1;0"
                            dur={dot.dur}
                            begin={dot.delay}
                            repeatCount="indefinite"
                        />
                    </circle>
                ))}
            </svg>

            {/* Radial glow accents */}
            <div className="absolute -top-1/4 -right-1/4 size-150 rounded-full bg-primary/3 blur-3xl animate-pulse" />
            <div className="absolute -bottom-1/4 -left-1/4 size-125 rounded-full bg-primary/2 blur-3xl animate-pulse [animation-delay:4s]" />
        </div>
    );
}

/* ─── Auth Layout ──────────────────────────────────────────────── */
export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative min-h-svh">
            <AuthBackground />
            {children}
        </div>
    );
}
