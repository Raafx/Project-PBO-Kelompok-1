import { LoadingProvider } from "@/contexts/loading-context";
import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admina - Tailwind & Next.js Admin Dashboard with shadcn UI (Typescript)",
  description: "Admina - Admin Dashboard Multipurpose Next.js, TypeScript, ShadCn UI & Tailwind Template",
  // Resolved per deployment (env var / Vercel preview / localhost) — see lib/site-url.ts.
  // The preview image comes from app/opengraph-image.tsx and is resolved against this base.
  metadataBase: getSiteUrl(),
  openGraph: {
    title: "Admina - Admin Dashboard UI",
    description: "A modern, responsive admin dashboard template built with Next.js, Tailwind CSS, and ShadCN UI.",
    url: "/",
    siteName: "Admina",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Admina - Admin Dashboard UI",
    description: "A modern, responsive admin dashboard template built with Next.js, Tailwind CSS, and ShadCN UI.",
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}
