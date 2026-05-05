import { readDb, writeDb, newId, type Vendor } from "./db";

export type Urgency = "ok" | "soon" | "urgent" | "overdue" | "settled";

export type VendorView = Vendor & {
  daysUntilRenewal: number;
  noticeDeadline: string;
  daysUntilNotice: number;
  urgency: Urgency;
};

export const FREE_LIMIT = 5;

const DAY = 86400 * 1000;

export function annotate(v: Vendor, nowMs = Date.now()): VendorView {
  const end = new Date(v.contractEndDate + "T00:00:00Z").getTime();
  const noticeMs = end - v.noticePeriodDays * DAY;
  const daysUntilRenewal = Math.ceil((end - nowMs) / DAY);
  const daysUntilNotice = Math.ceil((noticeMs - nowMs) / DAY);
  let urgency: Urgency;
  if (v.status !== "active") urgency = "settled";
  else if (daysUntilNotice < 0) urgency = "overdue";
  else if (daysUntilNotice <= 7) urgency = "urgent";
  else if (daysUntilNotice <= 30) urgency = "soon";
  else urgency = "ok";
  return {
    ...v,
    daysUntilRenewal,
    daysUntilNotice,
    noticeDeadline: new Date(noticeMs).toISOString().slice(0, 10),
    urgency,
  };
}

export function listVendors(userId: string): VendorView[] {
  const db = readDb();
  return db.vendors
    .filter((v) => v.userId === userId)
    .map((v) => annotate(v))
    .sort((a, b) => {
      if (a.urgency === "settled" && b.urgency !== "settled") return 1;
      if (b.urgency === "settled" && a.urgency !== "settled") return -1;
      return a.daysUntilNotice - b.daysUntilNotice;
    });
}

export function getVendor(userId: string, vendorId: string): VendorView | null {
  const db = readDb();
  const v = db.vendors.find((x) => x.id === vendorId && x.userId === userId);
  return v ? annotate(v) : null;
}

export type VendorInput = Omit<Vendor, "id" | "userId" | "createdAt">;

export function createVendor(
  userId: string,
  input: VendorInput,
): { vendor: Vendor } | { error: string } {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return { error: "User not found" };
  const userVendors = db.vendors.filter((v) => v.userId === userId);
  if (user.plan === "free" && userVendors.length >= FREE_LIMIT) {
    return { error: "Free plan limit reached. Upgrade to add more vendors." };
  }
  if (!input.name.trim()) return { error: "Name is required" };
  if (!input.contractEndDate) return { error: "Contract end date is required" };
  const v: Vendor = {
    id: newId(),
    userId,
    createdAt: new Date().toISOString(),
    ...input,
    name: input.name.trim(),
  };
  db.vendors.push(v);
  writeDb(db);
  return { vendor: v };
}

export function updateVendor(
  userId: string,
  vendorId: string,
  patch: Partial<VendorInput>,
): { vendor: Vendor } | { error: string } {
  const db = readDb();
  const idx = db.vendors.findIndex((v) => v.id === vendorId && v.userId === userId);
  if (idx < 0) return { error: "Not found" };
  db.vendors[idx] = { ...db.vendors[idx], ...patch };
  writeDb(db);
  return { vendor: db.vendors[idx] };
}

export function deleteVendor(userId: string, vendorId: string) {
  const db = readDb();
  db.vendors = db.vendors.filter((v) => !(v.id === vendorId && v.userId === userId));
  writeDb(db);
}

export function totalMonthlySpend(userId: string): number {
  return listVendors(userId)
    .filter((v) => v.status === "active")
    .reduce((sum, v) => sum + v.costMonthly, 0);
}
