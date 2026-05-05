-- ClauseRadar schema for Supabase.
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste → Run.

-- ============ tables ============

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free' check (plan in ('free','pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  cost_monthly numeric(10,2) not null default 0,
  contract_end_date date not null,
  notice_period_days int not null default 30,
  auto_renews boolean not null default true,
  status text not null default 'active' check (status in ('active','cancelled','renewed')),
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists vendors_user_idx on public.vendors(user_id);
create index if not exists vendors_end_idx on public.vendors(contract_end_date);

create table if not exists public.reminder_log (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  kind text not null check (kind in ('60d','30d','7d','overdue')),
  sent_at timestamptz not null default now()
);
create index if not exists reminder_log_vendor_idx on public.reminder_log(vendor_id);

-- ============ profile row created automatically on signup ============

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ row level security ============

alter table public.profiles    enable row level security;
alter table public.vendors     enable row level security;
alter table public.reminder_log enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "vendors_self_all" on public.vendors;
create policy "vendors_self_all" on public.vendors
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "reminder_log_self_read" on public.reminder_log;
create policy "reminder_log_self_read" on public.reminder_log
  for select using (
    exists (
      select 1 from public.vendors v
      where v.id = reminder_log.vendor_id and v.user_id = auth.uid()
    )
  );

-- service_role automatically bypasses RLS, so the cron endpoint can read all rows.
