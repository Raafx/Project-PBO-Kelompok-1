import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./dreams-pos.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: "MYMARKET POS",
  description: "Antarmuka kasir MYMARKET untuk terminal POS Samarinda Central.",
  applicationName: "MYMARKET",
  icons: {
    icon: [{ url: "/logo-app.png", type: "image/png" }],
    shortcut: "/logo-app.png",
    apple: "/logo-app.png",
  },
  openGraph: {
    title: "MYMARKET POS",
    description: "Antarmuka kasir dan operasional MYMARKET.",
    images: ["/logo-app.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f6f7",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
