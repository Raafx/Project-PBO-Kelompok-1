"use server";

import { requireUser } from "@/lib/auth-guard";

/**
 * Handles the email reply form.
 * Demo template: connect this to your backend to validate and save the
 * submitted fields (e.g. `formData.get("message")`).
 */
export async function sendMessageAction(_formData: FormData) {
  await requireUser();
}
