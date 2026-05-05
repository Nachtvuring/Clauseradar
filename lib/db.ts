import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  plan: "free" | "pro";
  stripeCustomerId?: string;
  createdAt: string;
};

export type Vendor = {
  id: string;
  userId: string;
  name: string;
  costMonthly: number;
  contractEndDate: string;
  noticePeriodDays: number;
  autoRenews: boolean;
  status: "active" | "cancelled" | "renewed";
  notes: string;
  createdAt: string;
};

export type DB = {
  users: User[];
  vendors: Vendor[];
  reminderLog: { id: string; vendorId: string; kind: string; sentAt: string }[];
};

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function readDb(): DB {
  ensureDir();
  if (!fs.existsSync(DB_PATH)) {
    const empty: DB = { users: [], vendors: [], reminderLog: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(empty, null, 2));
    return empty;
  }
  const parsed = JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as Partial<DB>;
  return {
    users: parsed.users ?? [],
    vendors: parsed.vendors ?? [],
    reminderLog: parsed.reminderLog ?? [],
  };
}

export function writeDb(db: DB) {
  ensureDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function newId(): string {
  return crypto.randomUUID();
}
