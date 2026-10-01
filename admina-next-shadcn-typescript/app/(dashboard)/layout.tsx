import { ClientRoot } from "@/app/client-root";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";

// Errors thrown here are handled by the nearest error boundary (app/error.tsx).
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <ClientRoot>{children}</ClientRoot>
    </SessionProvider>
  );
}
