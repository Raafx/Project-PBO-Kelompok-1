import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colors | Admina Admin Dashboard",
  description:
    "Explore the color schemes, theme palettes, and customizable color utilities in the Admina Admin Dashboard built with Next.js and Tailwind CSS.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
