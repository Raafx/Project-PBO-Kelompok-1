import RoleGuard from "../RoleGuard";

export default function AdminAuthGuard({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RoleGuard area="admin">{children}</RoleGuard>;
}
