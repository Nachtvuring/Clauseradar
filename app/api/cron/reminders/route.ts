import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { annotate, type Vendor } from "@/lib/vendors";
import { sendReminderEmail } from "@/lib/email";

// Hit this from any external scheduler (Vercel Cron, GitHub Actions, cron-job.org).
//   curl -H "Authorization: Bearer $CRON_SECRET" https://yourapp/api/cron/reminders
//
// Requires SUPABASE_SERVICE_ROLE_KEY in env so this can read all vendors across users.

function kindFor(daysUntilNotice: number): "60d" | "30d" | "7d" | "overdue" | null {
  if (daysUntilNotice < 0) return "overdue";
  if (daysUntilNotice <= 7) return "7d";
  if (daysUntilNotice <= 30) return "30d";
  if (daysUntilNotice <= 60) return "60d";
  return null;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not set" },
      { status: 500 },
    );
  }

  const sb = supabaseAdmin();
  const todayKey = new Date().toISOString().slice(0, 10);

  const { data: vendors, error } = await sb
    .from("vendors")
    .select("*, profiles!vendors_user_id_fkey(email)")
    .eq("status", "active");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const sent: string[] = [];

  for (const row of vendors ?? []) {
    const v = row as Vendor & { profiles?: { email?: string } | null };
    const view = annotate(v);
    const kind = kindFor(view.daysUntilNotice);
    if (!kind) continue;

    const { count } = await sb
      .from("reminder_log")
      .select("id", { count: "exact", head: true })
      .eq("vendor_id", v.id)
      .eq("kind", kind)
      .gte("sent_at", `${todayKey}T00:00:00Z`)
      .lte("sent_at", `${todayKey}T23:59:59Z`);
    if ((count ?? 0) > 0) continue;

    const email = v.profiles?.email;
    if (!email) continue;

    await sendReminderEmail({
      to: email,
      vendorName: v.name,
      daysUntilNotice: view.daysUntilNotice,
      noticeDeadline: view.noticeDeadline,
      costMonthly: Number(v.cost_monthly),
    });

    await sb.from("reminder_log").insert({ vendor_id: v.id, kind });
    sent.push(`${email}:${v.name}:${kind}`);
  }

  return NextResponse.json({ sent: sent.length, items: sent });
}
