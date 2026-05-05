import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import { annotate } from "@/lib/vendors";
import { sendReminderEmail } from "@/lib/email";

// Hit this from any external scheduler (Vercel Cron, GitHub Actions, cron-job.org).
// Authorize with a shared secret in CRON_SECRET so the world can't spam your inbox.
//   curl -H "Authorization: Bearer $CRON_SECRET" https://yourapp/api/cron/reminders

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

  const db = readDb();
  const sentToday: string[] = [];
  const todayKey = new Date().toISOString().slice(0, 10);

  for (const v of db.vendors) {
    if (v.status !== "active") continue;
    const view = annotate(v);
    const kind = kindFor(view.daysUntilNotice);
    if (!kind) continue;

    // Don't double-send the same kind for the same vendor on the same day.
    const alreadySent = db.reminderLog.some(
      (r) => r.vendorId === v.id && r.kind === kind && r.sentAt.startsWith(todayKey),
    );
    if (alreadySent) continue;

    const user = db.users.find((u) => u.id === v.userId);
    if (!user) continue;

    await sendReminderEmail({
      to: user.email,
      vendorName: v.name,
      daysUntilNotice: view.daysUntilNotice,
      noticeDeadline: view.noticeDeadline,
      costMonthly: v.costMonthly,
    });

    db.reminderLog.push({
      id: newId(),
      vendorId: v.id,
      kind,
      sentAt: new Date().toISOString(),
    });
    sentToday.push(`${user.email}:${v.name}:${kind}`);
  }

  writeDb(db);
  return NextResponse.json({ sent: sentToday.length, items: sentToday });
}
