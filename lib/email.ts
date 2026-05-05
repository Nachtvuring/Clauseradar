// Single-file email abstraction. Drop in Resend / Postmark / SendGrid here.
// In dev we just log; the shape stays the same.

export type ReminderEmail = {
  to: string;
  vendorName: string;
  daysUntilNotice: number;
  noticeDeadline: string;
  costMonthly: number;
};

export async function sendReminderEmail(payload: ReminderEmail): Promise<void> {
  const subject =
    payload.daysUntilNotice < 0
      ? `[ClauseRadar] OVERDUE: ${payload.vendorName} notice window has passed`
      : `[ClauseRadar] ${payload.vendorName} — ${payload.daysUntilNotice} days to act`;

  const body = [
    `Vendor: ${payload.vendorName}`,
    `Monthly cost: $${payload.costMonthly.toFixed(2)}`,
    `Notice deadline: ${payload.noticeDeadline}`,
    `Days until notice deadline: ${payload.daysUntilNotice}`,
    "",
    "Decide: renew, renegotiate, or cancel.",
  ].join("\n");

  // Production: replace this block with a real provider call.
  // e.g. await resend.emails.send({ from, to: payload.to, subject, html })
  console.log("\n[EMAIL OUT]", "->", payload.to);
  console.log("subject:", subject);
  console.log(body, "\n");
}
