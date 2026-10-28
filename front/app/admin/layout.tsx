import "./adminto.scss";

import PemeriksaAksesAdmin from "./PemeriksaAksesAdmin";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <PemeriksaAksesAdmin>{children}</PemeriksaAksesAdmin>;
}
