import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/auth";
import { signupAction } from "../actions";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  if (currentUserId()) redirect("/dashboard");
  return (
    <main className="container" style={{ maxWidth: 420, paddingTop: 80 }}>
      <Link href="/" className="muted" style={{ fontSize: 13 }}>← back</Link>
      <h1 style={{ marginTop: 24, marginBottom: 8 }}>Create your account</h1>
      <p className="muted" style={{ marginTop: 0 }}>5 vendors free. No card required.</p>
      <form action={signupAction} className="card" style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {searchParams.error && <div className="error">{searchParams.error}</div>}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoFocus className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required minLength={8} className="input" />
          <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>At least 8 characters.</div>
        </div>
        <button className="btn btn-primary" type="submit">Create account</button>
        <div className="muted" style={{ fontSize: 13, textAlign: "center" }}>
          Already have one? <Link href="/login">Log in</Link>
        </div>
      </form>
    </main>
  );
}
