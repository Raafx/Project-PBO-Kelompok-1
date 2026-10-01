import { auth } from "@/auth"

/**
 * Authorization check for server actions and route handlers.
 *
 * Every server action / API endpoint is publicly reachable by its own URL, so each
 * one must verify the session itself instead of relying on proxy.ts alone.
 */
export async function requireUser() {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session.user
}
