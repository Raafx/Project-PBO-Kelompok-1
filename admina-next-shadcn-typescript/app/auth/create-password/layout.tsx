import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Password | Admina Admin Dashboard",
  description:
    "Set up and manage secure passwords for your account in the Admina Admin Dashboard built with Next.js and Tailwind CSS.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
