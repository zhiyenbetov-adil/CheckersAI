import { createHash, randomUUID } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { sql } from "@vercel/postgres"

type UserRecord = {
  id: string
  name: string
  email: string
  passwordHash: string
  premiumUntil: number | null
  subscriptionTier: "free" | "premium" | "pro"
  createdAt: number
  updatedAt: number
}

type ActivityLog = {
  id: string
  userId: string | null
  email: string | null
  action: string
  details?: Record<string, unknown>
  timestamp: number
}

type DbShape = {
  users: UserRecord[]
  logs: ActivityLog[]
}

const DATA_DIR = path.join(process.cwd(), "data")
const DB_PATH = path.join(DATA_DIR, "app-db.json")
let queue: Promise<unknown> = Promise.resolve()

const initialDb: DbShape = { users: [], logs: [] }
let postgresReady = false

function toSafeNumber(value: unknown): number | null {
  if (value == null) return null
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

async function ensureDb(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  try {
    await readFile(DB_PATH, "utf-8")
  } catch {
    await writeFile(DB_PATH, JSON.stringify(initialDb, null, 2), "utf-8")
  }
}

function shouldUsePostgres(): boolean {
  return Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL)
}

async function ensurePostgresSchema(): Promise<void> {
  if (postgresReady || !shouldUsePostgres()) return
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      premium_until BIGINT,
      subscription_tier TEXT NOT NULL DEFAULT 'free',
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      email TEXT,
      action TEXT NOT NULL,
      details JSONB,
      timestamp BIGINT NOT NULL
    )
  `
  postgresReady = true
}

async function readDb(): Promise<DbShape> {
  await ensureDb()
  const raw = await readFile(DB_PATH, "utf-8")
  return JSON.parse(raw) as DbShape
}

async function writeDb(db: DbShape): Promise<void> {
  await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8")
}

function runExclusive<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn)
  queue = run.then(() => undefined, () => undefined)
  return run
}

export async function createUser(input: { name: string; email: string; password: string }) {
  if (shouldUsePostgres()) {
    await ensurePostgresSchema()
    const email = input.email.trim().toLowerCase()
    const now = Date.now()
    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
    if (existing.rows.length > 0) {
      throw new Error("Email already registered")
    }
    const user: UserRecord = {
      id: randomUUID(),
      name: input.name.trim(),
      email,
      passwordHash: hashPassword(input.password),
      premiumUntil: null,
      subscriptionTier: "free",
      createdAt: now,
      updatedAt: now,
    }
    await sql`
      INSERT INTO users (id, name, email, password_hash, premium_until, subscription_tier, created_at, updated_at)
      VALUES (${user.id}, ${user.name}, ${user.email}, ${user.passwordHash}, ${user.premiumUntil}, ${user.subscriptionTier}, ${user.createdAt}, ${user.updatedAt})
    `
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      premiumUntil: user.premiumUntil,
      subscriptionTier: user.subscriptionTier,
    }
  }

  return runExclusive(async () => {
    const db = await readDb()
    const email = input.email.trim().toLowerCase()
    if (db.users.some((u) => u.email === email)) {
      throw new Error("Email already registered")
    }
    const now = Date.now()
    const user: UserRecord = {
      id: randomUUID(),
      name: input.name.trim(),
      email,
      passwordHash: hashPassword(input.password),
      premiumUntil: null,
      subscriptionTier: "free",
      createdAt: now,
      updatedAt: now,
    }
    db.users.push(user)
    await writeDb(db)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      premiumUntil: user.premiumUntil,
      subscriptionTier: user.subscriptionTier,
    }
  })
}

export async function authenticateUser(input: { email: string; password: string }) {
  if (shouldUsePostgres()) {
    await ensurePostgresSchema()
    const email = input.email.trim().toLowerCase()
    const result = await sql`
      SELECT id, name, email, password_hash, premium_until, subscription_tier
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `
    const row = result.rows[0] as {
      id: string
      name: string
      email: string
      password_hash: string
      premium_until: number | string | null
      subscription_tier: "free" | "premium" | "pro" | null
    } | undefined
    if (!row || row.password_hash !== hashPassword(input.password)) {
      return null
    }
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      premiumUntil: toSafeNumber(row.premium_until),
      subscriptionTier: row.subscription_tier ?? "free",
    }
  }

  const db = await readDb()
  const email = input.email.trim().toLowerCase()
  const user = db.users.find((u) => u.email === email)
  if (!user || user.passwordHash !== hashPassword(input.password)) {
    return null
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    premiumUntil: user.premiumUntil,
    subscriptionTier: user.subscriptionTier ?? "free",
  }
}

export async function activatePremium(input: { email: string; months?: number; plan?: "premium" | "pro" }) {
  if (shouldUsePostgres()) {
    await ensurePostgresSchema()
    const email = input.email.trim().toLowerCase()
    const existing = await sql`
      SELECT id, premium_until
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `
    const user = existing.rows[0] as { id: string; premium_until: number | string | null } | undefined
    if (!user) throw new Error("User not found")
    const now = Date.now()
    const premiumUntilCurrent = toSafeNumber(user.premium_until)
    const base = premiumUntilCurrent && premiumUntilCurrent > now ? premiumUntilCurrent : now
    const months = Math.max(1, input.months ?? 1)
    const premiumUntil = base + months * 30 * 24 * 60 * 60 * 1000
    const tier = input.plan ?? "premium"
    await sql`
      UPDATE users
      SET premium_until = ${premiumUntil},
          subscription_tier = ${tier},
          updated_at = ${now}
      WHERE id = ${user.id}
    `
    return { id: user.id, premiumUntil, subscriptionTier: tier }
  }

  return runExclusive(async () => {
    const db = await readDb()
    const email = input.email.trim().toLowerCase()
    const user = db.users.find((u) => u.email === email)
    if (!user) throw new Error("User not found")
    const now = Date.now()
    const base = user.premiumUntil && user.premiumUntil > now ? user.premiumUntil : now
    const months = Math.max(1, input.months ?? 1)
    user.premiumUntil = base + months * 30 * 24 * 60 * 60 * 1000
    user.subscriptionTier = input.plan ?? "premium"
    user.updatedAt = now
    await writeDb(db)
    return { id: user.id, premiumUntil: user.premiumUntil, subscriptionTier: user.subscriptionTier }
  })
}

export async function writeLog(input: {
  userId?: string | null
  email?: string | null
  action: string
  details?: Record<string, unknown>
}) {
  if (shouldUsePostgres()) {
    await ensurePostgresSchema()
    const entry: ActivityLog = {
      id: randomUUID(),
      userId: input.userId ?? null,
      email: input.email ?? null,
      action: input.action,
      details: input.details,
      timestamp: Date.now(),
    }
    await sql`
      INSERT INTO activity_logs (id, user_id, email, action, details, timestamp)
      VALUES (${entry.id}, ${entry.userId}, ${entry.email}, ${entry.action}, ${JSON.stringify(entry.details ?? {})}, ${entry.timestamp})
    `
    return
  }

  return runExclusive(async () => {
    const db = await readDb()
    const entry: ActivityLog = {
      id: randomUUID(),
      userId: input.userId ?? null,
      email: input.email ?? null,
      action: input.action,
      details: input.details,
      timestamp: Date.now(),
    }
    db.logs.push(entry)
    if (db.logs.length > 5000) {
      db.logs = db.logs.slice(-3000)
    }
    await writeDb(db)
  })
}

export async function getRecentLogs(limit = 100): Promise<ActivityLog[]> {
  if (shouldUsePostgres()) {
    await ensurePostgresSchema()
    const result = await sql`
      SELECT id, user_id, email, action, details, timestamp
      FROM activity_logs
      ORDER BY timestamp DESC
      LIMIT ${Math.max(1, Math.min(limit, 500))}
    `
    return result.rows.map((row) => ({
      id: String(row.id),
      userId: row.user_id ? String(row.user_id) : null,
      email: row.email ? String(row.email) : null,
      action: String(row.action),
      details: (row.details as Record<string, unknown>) ?? undefined,
      timestamp: Number(row.timestamp),
    }))
  }

  const db = await readDb()
  return db.logs.slice(-limit).reverse()
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  if (shouldUsePostgres()) {
    await ensurePostgresSchema()
    const result = await sql`
      SELECT id, name, email, password_hash, premium_until, subscription_tier, created_at, updated_at
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `
    const row = result.rows[0] as {
      id: string
      name: string
      email: string
      password_hash: string
      premium_until: number | string | null
      subscription_tier: "free" | "premium" | "pro" | null
      created_at: number | string
      updated_at: number | string
    } | undefined
    if (!row) return null
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      premiumUntil: toSafeNumber(row.premium_until),
      subscriptionTier: row.subscription_tier ?? "free",
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    }
  }

  const db = await readDb()
  return db.users.find((u) => u.id === userId) ?? null
}

export async function getUserByEmail(emailInput: string): Promise<UserRecord | null> {
  const email = emailInput.trim().toLowerCase()
  if (shouldUsePostgres()) {
    await ensurePostgresSchema()
    const result = await sql`
      SELECT id, name, email, password_hash, premium_until, subscription_tier, created_at, updated_at
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `
    const row = result.rows[0] as {
      id: string
      name: string
      email: string
      password_hash: string
      premium_until: number | string | null
      subscription_tier: "free" | "premium" | "pro" | null
      created_at: number | string
      updated_at: number | string
    } | undefined
    if (!row) return null
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      premiumUntil: toSafeNumber(row.premium_until),
      subscriptionTier: row.subscription_tier ?? "free",
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    }
  }

  const db = await readDb()
  return db.users.find((u) => u.email === email) ?? null
}

export async function listUsers(limit = 500): Promise<UserRecord[]> {
  if (shouldUsePostgres()) {
    await ensurePostgresSchema()
    const result = await sql`
      SELECT id, name, email, password_hash, premium_until, subscription_tier, created_at, updated_at
      FROM users
      ORDER BY created_at ASC
      LIMIT ${Math.max(1, Math.min(limit, 5000))}
    `
    return result.rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      passwordHash: String(row.password_hash),
      premiumUntil: toSafeNumber(row.premium_until),
      subscriptionTier: (row.subscription_tier as "free" | "premium" | "pro" | null) ?? "free",
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    }))
  }

  const db = await readDb()
  return db.users.slice(0, limit)
}

export async function upsertOAuthUser(input: { name: string; email: string }) {
  const email = input.email.trim().toLowerCase()
  const name = input.name.trim() || email.split("@")[0]
  const now = Date.now()
  const oauthPasswordHash = hashPassword(`oauth:${email}`)

  if (shouldUsePostgres()) {
    await ensurePostgresSchema()
    const existing = await sql`
      SELECT id, name, email, premium_until, subscription_tier
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `
    if (existing.rows.length > 0) {
      const row = existing.rows[0] as { id: string; premium_until: number | string | null; subscription_tier: "free" | "premium" | "pro" | null; name: string; email: string }
      await sql`UPDATE users SET name = ${name}, updated_at = ${now} WHERE id = ${row.id}`
      return {
        id: row.id,
        name,
        email: row.email,
        premiumUntil: toSafeNumber(row.premium_until),
        subscriptionTier: row.subscription_tier ?? "free",
      }
    }
    const id = randomUUID()
    await sql`
      INSERT INTO users (id, name, email, password_hash, premium_until, subscription_tier, created_at, updated_at)
      VALUES (${id}, ${name}, ${email}, ${oauthPasswordHash}, ${null}, ${"free"}, ${now}, ${now})
    `
    return { id, name, email, premiumUntil: null, subscriptionTier: "free" as const }
  }

  return runExclusive(async () => {
    const db = await readDb()
    const existing = db.users.find((u) => u.email === email)
    if (existing) {
      existing.name = name
      existing.updatedAt = now
      await writeDb(db)
      return {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        premiumUntil: existing.premiumUntil,
        subscriptionTier: existing.subscriptionTier,
      }
    }
    const user: UserRecord = {
      id: randomUUID(),
      name,
      email,
      passwordHash: oauthPasswordHash,
      premiumUntil: null,
      subscriptionTier: "free",
      createdAt: now,
      updatedAt: now,
    }
    db.users.push(user)
    await writeDb(db)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      premiumUntil: user.premiumUntil,
      subscriptionTier: user.subscriptionTier,
    }
  })
}
