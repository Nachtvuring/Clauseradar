import Link from "next/link";
import { currentUser } from "@/lib/auth";

export default function Landing() {
  const user = currentUser();
  return (
    <>
      <header className="container">
        <nav className="nav">
          <div className="brand">ClauseRadar</div>
          <div className="links">
            <a href="#features" className="muted">Features</a>
            <a href="#pricing" className="muted">Pricing</a>
            {user ? (
              <Link href="/dashboard" className="btn btn-primary">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="muted">Log in</Link>
                <Link href="/signup" className="btn btn-primary">Start free</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="container" style={{ padding: "60px 24px 80px" }}>
        <section style={{ maxWidth: 720, margin: "40px 0 80px" }}>
          <div style={{ fontSize: 13, color: "var(--accent-2)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
            Built for ops &amp; finance teams
          </div>
          <h1 style={{ fontSize: "clamp(38px, 6vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 0 18px" }}>
            Stop discovering auto-renewals on the credit-card statement.
          </h1>
          <p style={{ fontSize: 19, color: "var(--muted)", lineHeight: 1.5, margin: "0 0 32px" }}>
            ClauseRadar tracks every SaaS contract you sign — end dates, notice windows, monthly cost — and emails you 60, 30, and 7 days before each opt-out deadline. So you renew on purpose, not by accident.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/signup" className="btn btn-primary" style={{ padding: "14px 26px", fontSize: 15 }}>
              Track 5 vendors free →
            </Link>
            <Link href="/login" className="btn">Log in</Link>
          </div>
          <div style={{ marginTop: 14, fontSize: 13, color: "var(--muted)" }}>
            No credit card. 5 vendors free, forever.
          </div>
        </section>

        <section id="features" className="row two" style={{ marginBottom: 60 }}>
          <div className="card">
            <h3 style={{ margin: "0 0 8px" }}>One source of truth</h3>
            <p className="muted" style={{ margin: 0 }}>
              Every contract in one list, sorted by what needs your attention this week.
            </p>
          </div>
          <div className="card">
            <h3 style={{ margin: "0 0 8px" }}>Smart reminders</h3>
            <p className="muted" style={{ margin: 0 }}>
              Email at 60, 30, and 7 days before each notice deadline. Plus an immediate alert on overdue items.
            </p>
          </div>
          <div className="card">
            <h3 style={{ margin: "0 0 8px" }}>Spend at a glance</h3>
            <p className="muted" style={{ margin: 0 }}>
              See total active monthly spend on the dashboard — useful when finance asks.
            </p>
          </div>
          <div className="card">
            <h3 style={{ margin: "0 0 8px" }}>Boring on purpose</h3>
            <p className="muted" style={{ margin: 0 }}>
              No Slack bot, no AI, no integrations to misconfigure. Just the spreadsheet you keep meaning to make.
            </p>
          </div>
        </section>

        <section id="pricing" className="row two" style={{ marginBottom: 40 }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h3 style={{ margin: 0 }}>Free</h3>
              <div style={{ fontSize: 24, fontWeight: 700 }}>$0</div>
            </div>
            <ul className="muted" style={{ paddingLeft: 18, lineHeight: 1.7 }}>
              <li>Up to 5 vendors</li>
              <li>Email reminders</li>
              <li>Single user</li>
            </ul>
            <Link href="/signup" className="btn" style={{ width: "100%" }}>Start free</Link>
          </div>
          <div className="card" style={{ borderColor: "var(--accent)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h3 style={{ margin: 0 }}>Pro</h3>
              <div style={{ fontSize: 24, fontWeight: 700 }}>$19<span style={{ fontSize: 14, fontWeight: 400, color: "var(--muted)" }}>/mo</span></div>
            </div>
            <ul className="muted" style={{ paddingLeft: 18, lineHeight: 1.7 }}>
              <li>Unlimited vendors</li>
              <li>Email reminders + weekly digest</li>
              <li>CSV export</li>
              <li>Priority support</li>
            </ul>
            <Link href="/signup" className="btn btn-primary" style={{ width: "100%" }}>Start 14-day trial</Link>
          </div>
        </section>

        <footer style={{ marginTop: 80, paddingTop: 24, borderTop: "1px solid var(--border)", color: "var(--muted)", fontSize: 13 }}>
          ClauseRadar · {new Date().getFullYear()} · contracts you actually remember
        </footer>
      </main>
    </>
  );
}
