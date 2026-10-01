import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notification Alerts | Admina Admin Dashboard",
  description:
    "Send and preview notification alerts in the Admina Admin Dashboard.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
