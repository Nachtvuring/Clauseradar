"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase";
import { currentUserId } from "@/lib/auth";
import {
  createVendor,
  deleteVendor,
  updateVendor,
  type VendorInput,
} from "@/lib/vendors";

function err(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const sb = supabaseServer();
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) err("/signup", error.message);

  // If email confirmation is enabled in the Supabase project, no session is set yet.
  if (!data.session) {
    redirect("/login?confirm=1");
  }
  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const sb = supabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) err("/login", error.message);
  redirect("/dashboard");
}

export async function logoutAction() {
  const sb = supabaseServer();
  await sb.auth.signOut();
  redirect("/");
}

function readVendorInput(formData: FormData): VendorInput {
  return {
    name: String(formData.get("name") ?? ""),
    cost_monthly: Number(formData.get("costMonthly") ?? 0) || 0,
    contract_end_date: String(formData.get("contractEndDate") ?? ""),
    notice_period_days: Math.max(0, Number(formData.get("noticePeriodDays") ?? 30) || 0),
    auto_renews: formData.get("autoRenews") === "on",
    status: (String(formData.get("status") ?? "active") as VendorInput["status"]) || "active",
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function createVendorAction(formData: FormData) {
  const uid = await currentUserId();
  if (!uid) redirect("/login");
  const result = await createVendor(uid, readVendorInput(formData));
  if ("error" in result) err("/vendor/new", result.error);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateVendorAction(formData: FormData) {
  const uid = await currentUserId();
  if (!uid) redirect("/login");
  const id = String(formData.get("id"));
  const result = await updateVendor(id, readVendorInput(formData));
  if ("error" in result) err(`/vendor/${id}`, result.error);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteVendorAction(formData: FormData) {
  const uid = await currentUserId();
  if (!uid) redirect("/login");
  await deleteVendor(String(formData.get("id")));
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function upgradeAction() {
  const uid = await currentUserId();
  if (!uid) redirect("/login");
  // Production: Stripe Checkout. For MVP this just flips the flag.
  const sb = supabaseServer();
  await sb.from("profiles").update({ plan: "pro" }).eq("id", uid);
  redirect("/dashboard?upgraded=1");
}
