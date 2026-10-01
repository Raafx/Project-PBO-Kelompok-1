import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat | Admina Admin Dashboard",
  description:
    "Engage in seamless real-time conversations and manage messages efficiently in the Admina Admin Dashboard built with Next.js, Tailwind CSS, and shadcn UI.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
