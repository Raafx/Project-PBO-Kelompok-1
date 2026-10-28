import type { Metadata } from "next";

import "../admin/adminto.scss";
import "./ceo-chat.scss";
import PemeriksaPeran from "../PemeriksaPeran";

export const metadata: Metadata = {
  title: "Asisten Bisnis | MYMARKET",
  description: "Asisten analitik penjualan untuk CEO MYMARKET.",
};

export default function CeoChatLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <PemeriksaPeran area="ceo-chat">{children}</PemeriksaPeran>;
}
