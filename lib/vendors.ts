import { supabaseServer } from "./supabase";

export type VendorStatus = "active" | "cancelled" | "renewed";
export type Urgency = "ok" | "soon" | "urgent" | "overdue" | "settled";

export type Vendor = {
  id: string;
  user_id: string;
  name: string;
  cost_monthly: number;
  contract_end_date: string;
  notice_period_days: number;
  auto_renews: boolean;
  status: VendorStatus;
  notes: string;
  created_at: string;
};

export type VendorView = Vendor & {
  daysUntilRenewal: number;
  noticeDeadline: string;
  daysUntilNotice: number;
  urgency: Urgency;
};

export type VendorInput = {
  name: string;
  cost_monthly: number;
  contract_end_date: string;
  notice_period_days: number;
  auto_renews: boolean;
  status: VendorStatus;
  notes: string;
};

export const FREE_LIMIT = 5;

const DAY = 86400 * 1000;

export function annotate(v: Vendor, nowMs = Date.now()): VendorView {
  const end = new Date(v.contract_end_date + "T00:00:00Z").getTime();
  const noticeMs = end - v.notice_period_days * DAY;
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

export async function listVendors(): Promise<VendorView[]> {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("vendors")
    .select("*")
    .order("contract_end_date", { ascending: true });
  if (error) throw error;
  const annotated = (data ?? []).map((v) => annotate(v as Vendor));
  return annotated.sort((a, b) => {
    if (a.urgency === "settled" && b.urgency !== "settled") return 1;
    if (b.urgency === "settled" && a.urgency !== "settled") return -1;
    return a.daysUntilNotice - b.daysUntilNotice;
  });
}

export async function getVendor(vendorId: string): Promise<VendorView | null> {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("vendors")
    .select("*")
    .eq("id", vendorId)
    .single();
  if (error || !data) return null;
  return annotate(data as Vendor);
}

export async function createVendor(
  userId: string,
  input: VendorInput,
): Promise<{ vendor: Vendor } | { error: string }> {
  if (!input.name.trim()) return { error: "Name is required" };
  if (!input.contract_end_date) return { error: "Contract end date is required" };

  const sb = supabaseServer();

  const { count } = await sb
    .from("vendors")
    .select("id", { count: "exact", head: true });

  const { data: profile } = await sb
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  const plan = (profile?.plan as "free" | "pro") ?? "free";
  if (plan === "free" && (count ?? 0) >= FREE_LIMIT) {
    return { error: "Free plan limit reached. Upgrade to add more vendors." };
  }

  const { data, error } = await sb
    .from("vendors")
    .insert({ ...input, name: input.name.trim(), user_id: userId })
    .select()
    .single();
  if (error) return { error: error.message };
  return { vendor: data as Vendor };
}

export async function updateVendor(
  vendorId: string,
  patch: Partial<VendorInput>,
): Promise<{ vendor: Vendor } | { error: string }> {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("vendors")
    .update(patch)
    .eq("id", vendorId)
    .select()
    .single();
  if (error || !data) return { error: error?.message ?? "Not found" };
  return { vendor: data as Vendor };
}

export async function deleteVendor(vendorId: string): Promise<void> {
  const sb = supabaseServer();
  await sb.from("vendors").delete().eq("id", vendorId);
}

export async function totalMonthlySpend(): Promise<number> {
  const sb = supabaseServer();
  const { data } = await sb
    .from("vendors")
    .select("cost_monthly,status")
    .eq("status", "active");
  return (data ?? []).reduce((sum, v) => sum + Number(v.cost_monthly ?? 0), 0);
}
