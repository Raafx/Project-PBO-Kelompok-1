import { ImageResponse } from "next/og";

// Social preview image (Open Graph + Twitter), generated at build time and served
// from the current deployment — no hard-coded domain or missing static file.
export const alt = "Admina Admin Dashboard Preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #1e2734 0%, #273142 60%, #487fff 140%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>Admina</div>
        <div style={{ fontSize: 40, marginTop: 24, color: "#c7d2fe" }}>
          Admin Dashboard — Next.js, Tailwind CSS &amp; shadcn/ui
        </div>
      </div>
    ),
    size
  );
}
