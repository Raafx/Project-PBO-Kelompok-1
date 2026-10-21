import type { Metadata } from "next";

import "../admin/adminto.scss";
import "./ceo-chat.scss";
import RoleGuard from "../RoleGuard";

export const metadata: Metadata = {
  title: "Asisten Bisnis | MYMARKET",
  description: "Asisten analitik penjualan untuk CEO MYMARKET.",
};

export default function CeoChatLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RoleGuard area="ceo-chat">{children}</RoleGuard>;
}
