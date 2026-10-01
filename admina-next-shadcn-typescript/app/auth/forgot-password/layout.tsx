import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Admina Admin Dashboard",
  description:
    "Recover your account by resetting your password in the Admina Admin Dashboard built with Next.js and Tailwind CSS.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
