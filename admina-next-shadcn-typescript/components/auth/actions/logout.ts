"use server";

import { signOut } from "@/auth";

export type LogoutResponse = { success: true } | { error: string };

export async function doLogout(): Promise<LogoutResponse> {
  try {
    // Let Auth.js clear the session (handles cookie name/prefix, chunked
    // cookies and any adapter cleanup) instead of deleting a cookie by hand.
    await signOut({ redirect: false });

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { error: "Logout failed. Please try again." };
  }
}
