import PemeriksaPeran from "../PemeriksaPeran";

export default function PosLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <PemeriksaPeran area="pos">{children}</PemeriksaPeran>;
}
