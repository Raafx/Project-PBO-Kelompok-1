// Pembatas khusus rute /admin; aturan role bersama ada di PemeriksaPeran.tsx.
import PemeriksaPeran from "../PemeriksaPeran";

export default function PemeriksaAksesAdmin({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <PemeriksaPeran area="admin">{children}</PemeriksaPeran>;
}
