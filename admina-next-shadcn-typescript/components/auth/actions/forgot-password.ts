'use server'

import { forgotPasswordSchema } from '@/lib/zod'

export async function handleForgotPasswordAction(formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    }
  }

  // Demo template: generate a reset token and email it to `parsed.data.email` here.

  return {
    success: true,
  }
}
