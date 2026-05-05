import { supabaseServer } from "./supabase";

export type AppUser = {
  id: string;
  email: string;
  plan: "free" | "pro";
};

// Returns the current user with their profile row, or null.
export async function currentUser(): Promise<AppUser | null> {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const { data: profile } = await sb
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    plan: (profile?.plan as "free" | "pro") ?? "free",
  };
}

export async function currentUserId(): Promise<string | null> {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  return user?.id ?? null;
}
