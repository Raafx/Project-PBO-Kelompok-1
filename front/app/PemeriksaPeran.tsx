"use client";

// Dipakai oleh layout admin, kasir, dan chat CEO untuk memastikan role boleh masuk.
import { useEffect, useState } from "react";

import { loadAccountProfile } from "./api";
import {
  canAccessArea,
  defaultPathForPermissions,
  readSessionUser,
  type AccessArea,
} from "./access";

export default function PemeriksaPeran({
  area,
  children,
}: Readonly<{
  area: AccessArea;
  children: React.ReactNode;
}>) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const requestedPath = `${window.location.pathname}${window.location.search}`;
    const token = window.localStorage.getItem("mymarket_token");
    if (!token) {
      window.location.replace(`/login?next=${encodeURIComponent(requestedPath)}`);
      return;
    }

    // Izin diverifikasi lagi ke backend, sehingga perubahan role langsung berlaku.
    void loadAccountProfile()
      .then((profile) => {
        if (cancelled) return;
        const previous = readSessionUser();
        window.localStorage.setItem(
          "mymarket_user",
          JSON.stringify({
            employee_code: profile.employee_code,
            full_name: profile.full_name,
            role_name: profile.role_name,
            permissions: profile.permissions,
            expires_at: previous?.expires_at || null,
          }),
        );
        if (!canAccessArea(profile.permissions, area)) {
          window.location.replace(defaultPathForPermissions(profile.permissions));
          return;
        }
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        window.localStorage.removeItem("mymarket_token");
        window.localStorage.removeItem("mymarket_user");
        window.location.replace(
          `/login?next=${encodeURIComponent(requestedPath)}`,
        );
      });

    return () => {
      cancelled = true;
    };
  }, [area]);

  if (!ready) {
    return (
      <div
        role="status"
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "#667085",
          background: "#f4f6f8",
        }}
      >
        Memeriksa akses...
      </div>
    );
  }

  return children;
}
