import NextAuth from "next-auth"
import type { Provider } from "next-auth/providers"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { ZodError } from "zod"
import { loginSchema } from "./lib/zod"
import { getUserFromDb } from "./utils/db"

// Credentials login always works (mock user DB). OAuth providers are only added
// when their env vars are present, so a deployment without Google/GitHub keys
// still boots instead of throwing "There is a problem with the server configuration".
const providers: Provider[] = [
  Credentials({
    credentials: {
      email: {},
      password: {},
    },
    authorize: async (credentials) => {
      try {
        const { email, password } = await loginSchema.parseAsync(credentials)

        const user = await getUserFromDb(email, password)

        if (!user) {
          return null
        }
        return user
      }
      catch (error) {
        if (error instanceof ZodError) {
          return null
        }
        return null
      }
    }
  }),
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    })
  )
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    })
  )
}

// Session-encryption secret, read from the AUTH_SECRET env var (generate one with
// `npx auth secret` and set it in .env.local / your host's environment variables).
// A throwaway fallback is used ONLY in local development so the template runs out
// of the box; production never falls back to a secret that is public in the source.
const AUTH_SECRET =
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV === "development"
    ? "admina-local-development-only-secret-do-not-use-in-production"
    : undefined)

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  secret: AUTH_SECRET,
  // Vercel sets this automatically, but being explicit is safe on all hosts.
  trustHost: true,
})
