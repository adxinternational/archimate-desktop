import { type Express, type Request, type Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";

const COOKIE_NAME = "aos_session";
const ONE_YEAR_S = 60 * 60 * 24 * 365;

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET manquant");
  return new TextEncoder().encode(s);
}

function hashPassword(password: string, salt: string): string {
  return createHash("sha256")
    .update(salt + password + (process.env.JWT_SECRET ?? ""))
    .digest("hex");
}

export async function createSessionToken(userId: number, role: string) {
  return new SignJWT({ sub: String(userId), role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ONE_YEAR_S}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    return payload as { sub: string; role: string };
  } catch { return null; }
}

export async function resolveUserFromRequest(req: Request) {
  const token = (req as any).cookies?.[COOKIE_NAME];
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload?.sub) return null;
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, parseInt(payload.sub))).limit(1);
  return result[0] ?? null;
}

function generateSalt(): string {
  return randomBytes(16).toString("hex");
}

function cookieOpts(req: Request) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: ONE_YEAR_S,
  };
}

export function registerAuthRoutes(app: Express) {
  (app as any).post("/api/auth/register", async (req: any, res: any) => {
    const { name, email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis" });
    if (password.length < 8) return res.status(400).json({ error: "Mot de passe trop court (8 car. min)" });
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Base de données indisponible" });
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) return res.status(409).json({ error: "Email déjà utilisé" });
    const salt = randomBytes(16).toString("hex");
    const hash = hashPassword(password, salt);
    await db.insert(users).values({
      openId: `local:${email}`,
      name: name || email.split("@")[0],
      email,
      loginMethod: `local:${salt}:${hash}`,
      role: "user",
      lastSignedIn: new Date(),
    });
    const created = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = created[0];
    const token = await createSessionToken(user.id, user.role);
    res.cookie(COOKIE_NAME, token, cookieOpts(req));
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  (app as any).post("/api/auth/login", async (req: any, res: any) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis" });
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Base de données indisponible" });
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = result[0];
    if (!user || !user.loginMethod?.startsWith("local:")) return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    const [, salt, storedHash] = user.loginMethod.split(":");
    if (hashPassword(password, salt) !== storedHash) return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
    const token = await createSessionToken(user.id, user.role);
    res.cookie(COOKIE_NAME, token, cookieOpts(req));
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  (app as any).post("/api/auth/logout", (req: any, res: any) => {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    res.json({ success: true });
  });
}

// Debug: test route sans DB
