import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Admina Admin Dashboard",
  description:
    "Create a new account for the Admina Admin Dashboard.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
