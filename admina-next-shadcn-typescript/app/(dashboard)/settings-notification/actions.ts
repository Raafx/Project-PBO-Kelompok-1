"use server";

import { requireUser } from "@/lib/auth-guard";

/**
 * Handles the Firebase notification settings form.
 * Demo template: connect this to your backend to validate and save the
 * submitted fields (e.g. `formData.get("firebaseAPIKey")`).
 */
export async function handleFirebaseSettings(_formData: FormData) {
  await requireUser();
}
