import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Switches | Admina Admin Dashboard",
  description:
    "Manage and customize switch and toggle controls for interactive settings in the Admina Admin Dashboard built with Next.js and Tailwind CSS.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
