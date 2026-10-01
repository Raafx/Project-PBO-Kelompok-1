import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email | Admina Admin Dashboard",
  description:
    "Access and manage email communications, inbox features, and message organization in the Admina Admin Dashboard built with Next.js and Tailwind CSS.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
