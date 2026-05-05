import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { FREE_LIMIT, listVendors, totalMonthlySpend } from "@/lib/vendors";
import { deleteVendorAction, logoutAction } from "../actions";

function urgencyLabel(u: string) {
  switch (u) {
    case "overdue":
      return "Overdue";
    case "urgent":
      return "≤ 7 days";
    case "soon":
      return "≤ 30 days";
    case "settled":
      return "Settled";
    default:
      return "On track";
  }
}

export default function Dashboard({ searchParams }: { searchParams: { upgraded?: string } }) {
  const user = currentUser();
  if (!user) redirect("/login");
  const vendors = listVendors(user.id);
  const spend = totalMonthlySpend(user.id);
  const dueSoon = vendors.filter((v) => v.urgency === "urgent" || v.urgency === "overdue");
  const atLimit = user.plan === "free" && vendors.length >= FREE_LIMIT;

  return (
    <div className="container">
      <nav className="nav">
        <div className="brand">ClauseRadar</div>
        <div className="links">
          <span className="muted" style={{ fontSize: 13 }}>{user.email}</span>
          <span className="badge ok" style={{ background: user.plan === "pro" ? "rgba(79,140,255,0.18)" : undefined, color: user.plan === "pro" ? "var(--accent)" : undefined }}>
            {user.plan}
          </span>
          {user.plan === "free" && <Link href="/billing" className="btn btn-primary">Upgrade</Link>}
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost">Log out</button>
          </form>
        </div>
      </nav>

      <main style={{ paddingTop: 28 }}>
        {searchParams.upgraded && (
          <div className="banner" style={{ marginBottom: 18 }}>
            <div>You&apos;re on Pro. Add as many vendors as you want.</div>
          </div>
        )}

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
          <div className="card">
            <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Active vendors</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{vendors.filter((v) => v.status === "active").length}</div>
          </div>
          <div className="card">
            <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Monthly spend</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>${spend.toFixed(2)}</div>
          </div>
          <div className="card">
            <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Need attention</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: dueSoon.length > 0 ? "var(--danger)" : undefined }}>
              {dueSoon.length}
            </div>
          </div>
        </section>

        {dueSoon.length > 0 && (
          <div className="banner" style={{ marginBottom: 18 }}>
            <div>
              <strong>{dueSoon.length}</strong> vendor{dueSoon.length === 1 ? "" : "s"} need a decision in the next 7 days
              {dueSoon.length <= 3 && `: ${dueSoon.map((v) => v.name).join(", ")}`}
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ margin: 0 }}>Vendors</h2>
          {atLimit ? (
            <Link href="/billing" className="btn btn-primary">Upgrade to add more</Link>
          ) : (
            <Link href="/vendor/new" className="btn btn-primary">+ Add vendor</Link>
          )}
        </div>

        {vendors.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 40 }}>
            <p className="muted" style={{ marginTop: 0 }}>No vendors yet. Add the first contract you signed this year.</p>
            <Link href="/vendor/new" className="btn btn-primary">Add your first vendor</Link>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="vendors">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Cost / mo</th>
                  <th>Notice deadline</th>
                  <th>Days left</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <Link href={`/vendor/${v.id}`} style={{ fontWeight: 600, color: "var(--text)" }}>{v.name}</Link>
                      {v.autoRenews && <span className="muted" style={{ fontSize: 12, marginLeft: 8 }}>auto-renews</span>}
                    </td>
                    <td>${v.costMonthly.toFixed(2)}</td>
                    <td>{v.noticeDeadline}</td>
                    <td>{v.status !== "active" ? "—" : v.daysUntilNotice < 0 ? `${Math.abs(v.daysUntilNotice)}d overdue` : `${v.daysUntilNotice}d`}</td>
                    <td><span className={`badge ${v.urgency}`}>{urgencyLabel(v.urgency)}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <form action={deleteVendorAction} style={{ display: "inline" }}>
                        <input type="hidden" name="id" value={v.id} />
                        <button type="submit" className="btn btn-ghost" style={{ fontSize: 13 }}>Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
