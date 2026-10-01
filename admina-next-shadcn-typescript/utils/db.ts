import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>

const KEY_LENGTH = 64

interface User {
  id: string
  email: string
  name: string
  /** Salted scrypt hash in the form `scrypt:<salt>:<hash>` — never a plaintext password. */
  passwordHash: string
}

export type PublicUser = Omit<User, "passwordHash">

/**
 * Demo user store. Replace this with your real database (Prisma, Drizzle, etc.).
 * Passwords are stored only as salted scrypt hashes — create new ones with
 * `hashPassword()` below.
 *
 * Demo login: admina@gmail.com / Pa$$w0rd!
 */
const users: User[] = [
  {
    id: "1",
    email: "admina@gmail.com",
    name: "Admina",
    passwordHash:
      "scrypt:ef8fce553cd386d83dc480cfa1c0e693:1090bed9c422255019cd766eebbb615b7eacce293c9bb6286e6ad5727a6b05094b3258865dde2cec14d69a1dd7de5596882df68920b6d25420df4a41ec86bf8a",
  },
]

/** Hash a password with a random salt, for storing in your user table. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const hash = await scryptAsync(password, salt, KEY_LENGTH)
  return `scrypt:${salt}:${hash.toString("hex")}`
}

/** Constant-time comparison of a plaintext password against a stored hash. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, salt, hashHex] = stored.split(":")
  if (algorithm !== "scrypt" || !salt || !hashHex) return false

  const expected = Buffer.from(hashHex, "hex")
  const actual = await scryptAsync(password, salt, expected.length)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export async function getUserFromDb(email: string, password: string): Promise<PublicUser | null> {
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return null
  }

  return { id: user.id, email: user.email, name: user.name }
}
