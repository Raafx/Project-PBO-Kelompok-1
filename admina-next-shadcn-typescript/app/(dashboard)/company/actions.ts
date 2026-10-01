"use server";

import { requireUser } from "@/lib/auth-guard";

/**
 * Handles the company profile form.
 * Demo template: connect this to your backend to validate and save the
 * submitted fields (e.g. `formData.get("name")`).
 */
export async function saveProfileAction(_formData: FormData) {
  await requireUser();
}
