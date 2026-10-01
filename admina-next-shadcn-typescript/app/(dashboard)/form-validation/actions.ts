"use server";

import { requireUser } from "@/lib/auth-guard";

/**
 * Handles the validated demo form.
 * Demo template: connect this to your backend to validate and save the
 * submitted fields (e.g. `formData.get("email")`).
 */
export async function formAction(_formData: FormData) {
  await requireUser();
}
