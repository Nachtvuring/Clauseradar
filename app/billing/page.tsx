import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { upgradeAction } from "../actions";

export default async function Billing() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return (
    <div className="container">
      <Link href="/dashboard" className="muted" style={{ fontSize: 13 }}>← back</Link>
      <h1 style={{ marginTop: 18 }}>Upgrade to Pro</h1>
      <p className="muted">Unlimited vendors, weekly digest, CSV export, priority support.</p>

      <div className="card" style={{ marginTop: 20, maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ margin: 0 }}>Pro</h2>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            $19<span style={{ fontSize: 14, fontWeight: 400, color: "var(--muted)" }}>/mo</span>
          </div>
        </div>
        <ul className="muted" style={{ paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Unlimited vendors</li>
          <li>Email reminders + weekly digest</li>
          <li>CSV export</li>
          <li>Priority support</li>
        </ul>
        {user.plan === "pro" ? (
          <div className="banner ok">
            You&apos;re already on Pro. Thanks!
          </div>
        ) : (
          <form action={upgradeAction}>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              Upgrade now
            </button>
            <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
              In production this hits Stripe Checkout. In this MVP it just flips your plan flag — see <code>app/actions.ts</code>.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
