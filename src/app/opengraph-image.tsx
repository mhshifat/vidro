import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Vidro — AI-Powered Bug Reporting";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#ef4444",
                }}
              />
            </div>
          </div>
          <span style={{ fontSize: "48px", fontWeight: 700, color: "#fff" }}>
            Vidro
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "40px",
            fontWeight: 700,
            color: "#e2e8f0",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.2,
          }}
        >
          AI-Powered Screen Recording & Bug Reporting
        </div>

        {/* Sub */}
        <div
          style={{
            fontSize: "22px",
            color: "#94a3b8",
            marginTop: "16px",
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          77 features · 18 AI models · Open source
        </div>
      </div>
    ),
    { ...size }
  );
}
