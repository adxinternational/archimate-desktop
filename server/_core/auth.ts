/**
 * auth.ts — Authentification JWT autonome
 * Remplace l'intégration Manus OAuth pour fonctionner sur Vercel + Railway.
 *
 * Flux :
 *   POST /api/auth/register  → crée un compte (email + password)
 *   POST /api/auth/login     → retourne un JWT dans un cookie httpOnly
 *   POST /api/auth/logout    → efface le cookie
 *   GET  /api/auth/me        → retourne l'utilisateur courant (via tRPC)
 */

import type { Express, Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";

const COOKIE_NAME = "aos_session";
const JWT_ALGORITHM = "HS256";
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
const ONE_YEAR_S = ONE_YEAR_MS / 1000;

// ── Helpers ─────────────────────────────────────────────────

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env variable is required");
  return new TextEncoder().encode(secret);
}

function hashPassword(password: string, salt: string): string {
  return createHash("sha256")
    .update(salt + password + (process.env.JWT_SECRET ?? ""))
    .digest("hex");
}

function generateSalt(): string {
  return randomBytes(16).toString("hex");
}

function cookieOptions(req: Request) {
  const isSecure =
    req.headers["x-forwarded-proto"] === "https" ||
    process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: ONE_YEAR_S,
  };
}

// ── Token ────────────────────────────────────────────────────

export async function createSessionToken(userId: number, role: string): Promise<string> {
  return new SignJWT({ sub: String(userId), role })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${ONE_YEAR_S}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: [JWT_ALGORITHM],
    });
    return payload as { sub: string; role: string };
  } catch {
    return null;
  }
}

// ── Middleware : lit le cookie et résout l'utilisateur ───────

export async function resolveUserFromRequest(req: Request) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload?.sub) return null;

  const db = await getDb();
  if (!db) return null;

  const userId = parseInt(payload.sub, 10);
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] ?? null;
}

// ── Routes Express ───────────────────────────────────────────

export function registerAuthRoutes(app: Express) {
  // ── Register ───────────────────────────────────────────────
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { name, email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: "Email et mot de passe requis" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "Mot de passe trop court (8 caractères min)" });
      return;
    }

    const db = await getDb();
    if (!db) { res.status(503).json({ error: "Base de données indisponible" }); return; }

    // Check email unique
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Un compte existe déjà avec cet email" });
      return;
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    // Stocké dans loginMethod pour ne pas modifier le schéma (champ texte libre)
    const openId = `local:${email}`;

    try {
      await db.insert(users).values({
        openId,
        name: name || email.split("@")[0],
        email,
        loginMethod: `local:${salt}:${passwordHash}`,
        role: "user",
        lastSignedIn: new Date(),
      });

      const created = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      const user = created[0];
      const token = await createSessionToken(user.id, user.role);
      res.cookie(COOKIE_NAME, token, cookieOptions(req));
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      console.error("[Auth] Register failed:", err);
      res.status(500).json({ error: "Erreur lors de la création du compte" });
    }
  });

  // ── Login ──────────────────────────────────────────────────
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: "Email et mot de passe requis" });
      return;
    }

    const db = await getDb();
    if (!db) { res.status(503).json({ error: "Base de données indisponible" }); return; }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = result[0];
    if (!user || !user.loginMethod?.startsWith("local:")) {
      res.status(401).json({ error: "Email ou mot de passe incorrect" });
      return;
    }

    const [, salt, storedHash] = user.loginMethod.split(":");
    const inputHash = hashPassword(password, salt);

    if (inputHash !== storedHash) {
      res.status(401).json({ error: "Email ou mot de passe incorrect" });
      return;
    }

    // Update lastSignedIn
    await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

    const token = await createSessionToken(user.id, user.role);
    res.cookie(COOKIE_NAME, token, cookieOptions(req));
    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  });

  // ── Logout ─────────────────────────────────────────────────
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    res.json({ success: true });
  });
}
