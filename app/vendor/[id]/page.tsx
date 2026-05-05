import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getVendor } from "@/lib/vendors";
import { deleteVendorAction, updateVendorAction } from "../../actions";

export default async function EditVendor({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const vendor = await getVendor(params.id);
  if (!vendor) notFound();

  return (
    <div className="container">
      <Link href="/dashboard" className="muted" style={{ fontSize: 13 }}>← back to dashboard</Link>
      <h1 style={{ marginTop: 18 }}>Edit vendor</h1>

      <form action={updateVendorAction} className="card" style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
        {searchParams.error && <div className="error">{searchParams.error}</div>}
        <input type="hidden" name="id" value={vendor.id} />
        <div>
          <label className="label" htmlFor="name">Vendor name</label>
          <input id="name" name="name" required defaultValue={vendor.name} className="input" />
        </div>
        <div className="row two">
          <div>
            <label className="label" htmlFor="costMonthly">Monthly cost (USD)</label>
            <input id="costMonthly" name="costMonthly" type="number" min={0} step="0.01" defaultValue={Number(vendor.cost_monthly)} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="contractEndDate">Contract end date</label>
            <input id="contractEndDate" name="contractEndDate" type="date" required defaultValue={vendor.contract_end_date} className="input" />
          </div>
        </div>
        <div className="row two">
          <div>
            <label className="label" htmlFor="noticePeriodDays">Notice period (days)</label>
            <input id="noticePeriodDays" name="noticePeriodDays" type="number" min={0} defaultValue={vendor.notice_period_days} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={vendor.status} className="select">
              <option value="active">Active</option>
              <option value="renewed">Renewed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input name="autoRenews" type="checkbox" defaultChecked={vendor.auto_renews} />
            <span>Auto-renews</span>
          </label>
        </div>
        <div>
          <label className="label" htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" defaultValue={vendor.notes} className="textarea" />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn btn-primary">Save</button>
            <Link href="/dashboard" className="btn">Cancel</Link>
          </div>
        </div>
      </form>

      <form action={deleteVendorAction} style={{ marginTop: 18 }}>
        <input type="hidden" name="id" value={vendor.id} />
        <button type="submit" className="btn btn-danger">Delete vendor</button>
      </form>
    </div>
  );
}
