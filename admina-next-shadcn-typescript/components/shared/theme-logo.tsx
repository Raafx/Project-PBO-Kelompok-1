"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";

import { useMounted } from "@/hooks/use-mounted";
import LogoDark from "@/public/assets/images/logo.png";
import LogoWhite from "@/public/assets/images/logo-light.png";

function ThemeLogo() {
  const { theme } = useTheme();
  const isMounted = useMounted();

  // The theme is only known in the browser — render after mount to avoid a hydration mismatch.
  if (!isMounted) return null;

  return (
    <Link href="/dashboard">
      <Image
        src={theme === "dark" ? LogoWhite : LogoDark}
        alt="Logo"
        width={168}
        height={40}
        priority
      />
    </Link>
  );
}

export default ThemeLogo;
