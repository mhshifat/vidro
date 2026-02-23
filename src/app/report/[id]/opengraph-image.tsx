import { ImageResponse } from "next/og";
import { ReportService } from "@/services/report-service";
import { Logger } from "@/lib/logger";

export const runtime = "nodejs";
export const alt = "Vidro Bug Report";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = Logger.createContext();

  const { report } = await ReportService.getById(id, context);

  const title = report?.title || "Bug Report";
  const description = report?.description || report?.stakeholderSummary || "";
  const type = report?.type === "SCREENSHOT" ? "Screenshot" : "Video";
  const severity = report?.severity || null;
  const createdAt = report?.createdAt
    ? new Date(report.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const severityColors: Record<string, { bg: string; text: string }> = {
    critical: { bg: "#7f1d1d", text: "#fca5a5" },
    high: { bg: "#7c2d12", text: "#fdba74" },
    medium: { bg: "#78350f", text: "#fcd34d" },
    low: { bg: "#14532d", text: "#86efac" },
  };
  const sevStyle = severity
    ? severityColors[severity.toLowerCase()] || { bg: "#1e293b", text: "#94a3b8" }
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(145deg, #0c0c14 0%, #131320 40%, #0f172a 100%)",
          fontFamily: "sans-serif",
          padding: "60px 70px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            display: "flex",
          }}
        />

        {/* Top row: logo + type badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#ef4444",
                  }}
                />
              </div>
            </div>
            <span style={{ fontSize: "26px", fontWeight: 700, color: "#e2e8f0", letterSpacing: "-0.02em" }}>
              Vidro
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {severity && sevStyle && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  background: sevStyle.bg,
                  color: sevStyle.text,
                  fontSize: "14px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {severity}
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 14px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.06)",
                color: "#94a3b8",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {type === "Screenshot" ? "📸" : "🎥"} {type} Report
            </div>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: "16px",
            marginTop: "-20px",
          }}
        >
          <div
            style={{
              fontSize: title.length > 60 ? "38px" : "48px",
              fontWeight: 800,
              color: "#f1f5f9",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              maxWidth: "900px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {title}
          </div>

          {description && (
            <div
              style={{
                fontSize: "20px",
                color: "#64748b",
                lineHeight: 1.4,
                maxWidth: "800px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {description}
            </div>
          )}
        </div>

        {/* Bottom row: date + branding */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {createdAt && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", fontSize: "15px" }}>
              <span>Reported {createdAt}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#334155", fontSize: "14px" }}>
            vidro.dev
          </div>
        </div>

        {/* Decorative accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
