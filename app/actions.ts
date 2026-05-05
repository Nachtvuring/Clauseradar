"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { readDb, writeDb } from "@/lib/db";
import { authenticate, clearSession, createUser, currentUserId, setSession } from "@/lib/auth";
import { createVendor, deleteVendor, updateVendor, type VendorInput } from "@/lib/vendors";

function err(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = await createUser(email, password);
  if ("error" in result) err("/signup", result.error);
  setSession(result.user.id);
  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = await authenticate(email, password);
  if ("error" in result) err("/login", result.error);
  setSession(result.user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  clearSession();
  redirect("/");
}

function readVendorInput(formData: FormData): VendorInput {
  return {
    name: String(formData.get("name") ?? ""),
    costMonthly: Number(formData.get("costMonthly") ?? 0) || 0,
    contractEndDate: String(formData.get("contractEndDate") ?? ""),
    noticePeriodDays: Math.max(0, Number(formData.get("noticePeriodDays") ?? 30) || 0),
    autoRenews: formData.get("autoRenews") === "on",
    status: (String(formData.get("status") ?? "active") as VendorInput["status"]) || "active",
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function createVendorAction(formData: FormData) {
  const uid = currentUserId();
  if (!uid) redirect("/login");
  const result = createVendor(uid, readVendorInput(formData));
  if ("error" in result) err("/vendor/new", result.error);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateVendorAction(formData: FormData) {
  const uid = currentUserId();
  if (!uid) redirect("/login");
  const id = String(formData.get("id"));
  const result = updateVendor(uid, id, readVendorInput(formData));
  if ("error" in result) err(`/vendor/${id}`, result.error);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteVendorAction(formData: FormData) {
  const uid = currentUserId();
  if (!uid) redirect("/login");
  deleteVendor(uid, String(formData.get("id")));
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function upgradeAction() {
  const uid = currentUserId();
  if (!uid) redirect("/login");
  // Production: redirect to Stripe Checkout instead of flipping the flag.
  //   const session = await stripe.checkout.sessions.create({ ... });
  //   redirect(session.url);
  const db = readDb();
  const user = db.users.find((u) => u.id === uid);
  if (user) {
    user.plan = "pro";
    writeDb(db);
  }
  redirect("/dashboard?upgraded=1");
}
