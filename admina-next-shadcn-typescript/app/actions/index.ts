"use server"

import { signIn, signOut } from "@/auth";

const SOCIAL_PROVIDERS = ["google", "github"] as const;
type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

const isSocialProvider = (value: unknown): value is SocialProvider =>
    SOCIAL_PROVIDERS.includes(value as SocialProvider);

export async function doSocialLogin (formData:FormData) {
    const provider = formData.get('action');
    if (!isSocialProvider(provider)) {
        throw new Error("Unsupported sign-in provider.");
    }
    await signIn(provider, { redirectTo: '/dashboard' });
}

export async function doLogout () {
    await signOut();
}
