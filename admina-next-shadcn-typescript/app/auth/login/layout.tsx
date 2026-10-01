import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Admina Admin Dashboard",
  description:
    "Sign in to the Admina Admin Dashboard.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
