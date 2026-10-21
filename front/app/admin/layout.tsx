import "./adminto.scss";

import AdminAuthGuard from "./AdminAuthGuard";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
