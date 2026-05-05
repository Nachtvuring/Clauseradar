import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { FREE_LIMIT, listVendors } from "@/lib/vendors";
import { createVendorAction } from "../../actions";

export default async function NewVendor({ searchParams }: { searchParams: { error?: string } }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.plan === "free") {
    const vendors = await listVendors();
    if (vendors.length >= FREE_LIMIT) redirect("/billing");
  }

  const today = new Date();
  const defaultEnd = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
    .toISOString()
    .slice(0, 10);

  return (
    <div className="container">
      <Link href="/dashboard" className="muted" style={{ fontSize: 13 }}>← back to dashboard</Link>
      <h1 style={{ marginTop: 18 }}>Add a vendor</h1>

      <form action={createVendorAction} className="card" style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
        {searchParams.error && <div className="error">{searchParams.error}</div>}
        <div>
          <label className="label" htmlFor="name">Vendor name</label>
          <input id="name" name="name" required autoFocus placeholder="e.g. Notion, Figma, AWS" className="input" />
        </div>
        <div className="row two">
          <div>
            <label className="label" htmlFor="costMonthly">Monthly cost (USD)</label>
            <input id="costMonthly" name="costMonthly" type="number" min={0} step="0.01" defaultValue="0" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="contractEndDate">Contract end date</label>
            <input id="contractEndDate" name="contractEndDate" type="date" required defaultValue={defaultEnd} className="input" />
          </div>
        </div>
        <div className="row two">
          <div>
            <label className="label" htmlFor="noticePeriodDays">Notice period (days)</label>
            <input id="noticePeriodDays" name="noticePeriodDays" type="number" min={0} defaultValue={30} className="input" />
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>How long before end-date you must give notice. Common: 30 or 60.</div>
          </div>
          <div>
            <label className="label" htmlFor="autoRenews">Auto-renews?</label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0" }}>
              <input id="autoRenews" name="autoRenews" type="checkbox" defaultChecked />
              <span>Yes, this contract auto-renews</span>
            </label>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" placeholder="Account owner, contract link, anything else…" className="textarea" />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="btn btn-primary">Add vendor</button>
          <Link href="/dashboard" className="btn">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
