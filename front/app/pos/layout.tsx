import RoleGuard from "../RoleGuard";

export default function PosLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RoleGuard area="pos">{children}</RoleGuard>;
}
