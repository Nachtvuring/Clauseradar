import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/auth";
import { loginAction } from "../actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  if (currentUserId()) redirect("/dashboard");
  return (
    <main className="container" style={{ maxWidth: 420, paddingTop: 80 }}>
      <Link href="/" className="muted" style={{ fontSize: 13 }}>← back</Link>
      <h1 style={{ marginTop: 24, marginBottom: 8 }}>Welcome back</h1>
      <form action={loginAction} className="card" style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {searchParams.error && <div className="error">{searchParams.error}</div>}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoFocus className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required className="input" />
        </div>
        <button className="btn btn-primary" type="submit">Log in</button>
        <div className="muted" style={{ fontSize: 13, textAlign: "center" }}>
          New here? <Link href="/signup">Create an account</Link>
        </div>
      </form>
    </main>
  );
}
