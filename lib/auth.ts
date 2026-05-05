import { cookies } from "next/headers";
import { scrypt, randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { readDb, writeDb, newId, type User } from "./db";

const scryptAsync = promisify(scrypt) as (
  pw: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me-in-prod";
const COOKIE = "cr_session";
const SESSION_DAYS = 30;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return { hash: buf.toString("hex"), salt };
}

export async function verifyPassword(password: string, hash: string, salt: string) {
  const buf = await scryptAsync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");
  if (stored.length !== buf.length) return false;
  return timingSafeEqual(stored, buf);
}

function sign(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

export function setSession(userId: string) {
  const expires = Date.now() + SESSION_DAYS * 86400 * 1000;
  const value = `${userId}.${expires}`;
  const sig = sign(value);
  cookies().set(COOKIE, `${value}.${sig}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expires),
  });
}

export function clearSession() {
  cookies().delete(COOKIE);
}

export function currentUserId(): string | null {
  const c = cookies().get(COOKIE)?.value;
  if (!c) return null;
  const parts = c.split(".");
  if (parts.length !== 3) return null;
  const [userId, expires, sig] = parts;
  if (sign(`${userId}.${expires}`) !== sig) return null;
  if (Date.now() > Number(expires)) return null;
  return userId;
}

export function currentUser(): User | null {
  const uid = currentUserId();
  if (!uid) return null;
  return readDb().users.find((u) => u.id === uid) ?? null;
}

export async function createUser(
  email: string,
  password: string,
): Promise<{ user: User } | { error: string }> {
  email = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Invalid email" };
  if (password.length < 8) return { error: "Password must be at least 8 characters" };
  const db = readDb();
  if (db.users.some((u) => u.email === email)) return { error: "Email already in use" };
  const { hash, salt } = await hashPassword(password);
  const user: User = {
    id: newId(),
    email,
    passwordHash: hash,
    passwordSalt: salt,
    plan: "free",
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDb(db);
  return { user };
}

export async function authenticate(
  email: string,
  password: string,
): Promise<{ user: User } | { error: string }> {
  email = email.trim().toLowerCase();
  const db = readDb();
  const user = db.users.find((u) => u.email === email);
  if (!user) return { error: "Invalid credentials" };
  const ok = await verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!ok) return { error: "Invalid credentials" };
  return { user };
}
