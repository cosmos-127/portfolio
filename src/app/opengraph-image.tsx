import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Gagan — Generalist AI Engineer | Agents, LLMs & Production Systems";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#080b11",
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          padding: "68px 80px",
          fontFamily: "sans-serif",
          color: "#ffffff",
          position: "relative",
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "600px",
            height: "600px",
            borderRadius: "9999px",
            background: "radial-gradient(circle, rgba(230, 57, 70, 0.28) 0%, transparent 65%)",
          }}
        />

        {/* Header Eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "9999px",
              backgroundColor: "rgba(230, 57, 70, 0.15)",
              border: "1px solid rgba(230, 57, 70, 0.4)",
              color: "#e63946",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "0.12em",
            }}
          >
            <span>{"//"}</span>
            <span>AI SYSTEMS &amp; LLMOPS</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#94a3b8",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "9999px",
                backgroundColor: "#10b981",
              }}
            />
            <span>AVAILABLE FOR COLLABORATION</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              fontSize: "92px",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              margin: 0,
              lineHeight: 1,
              display: "flex",
              alignItems: "baseline",
            }}
          >
            <span>Gagan</span>
            <span style={{ color: "#e63946" }}>.</span>
          </h1>

          <p
            style={{
              fontSize: "34px",
              color: "#cbd5e1",
              margin: 0,
              fontWeight: 400,
              letterSpacing: "-0.01em",
              maxWidth: "920px",
              lineHeight: 1.35,
            }}
          >
            Building AI systems that <span style={{ color: "#e63946", fontStyle: "italic" }}>reason, retrieve &amp; act</span>.
          </p>
        </div>

        {/* Footer Telemetry Matrix */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            {["vLLM Serving", "LangGraph Agents", "GraphRAG", "MCP Tool Protocol", "Trino SQL"].map(
              (tag) => (
                <div
                  key={tag}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#94a3b8",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </div>
              )
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#e63946",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            <span>cosmos127.dev</span>
            <span style={{ color: "#64748b" }}>·</span>
            <span style={{ color: "#94a3b8" }}>@cosmos-127</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
