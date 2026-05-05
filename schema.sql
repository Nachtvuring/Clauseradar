-- ClauseRadar production schema (Postgres / Supabase)

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  password_salt text not null,
  plan text not null default 'free' check (plan in ('free','pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  cost_monthly numeric(10,2) not null default 0,
  contract_end_date date not null,
  notice_period_days int not null default 30,
  auto_renews boolean not null default true,
  status text not null default 'active' check (status in ('active','cancelled','renewed')),
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists vendors_user_idx on vendors(user_id);
create index if not exists vendors_end_idx on vendors(contract_end_date);

create table if not exists reminder_log (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  kind text not null check (kind in ('60d','30d','7d','overdue')),
  sent_at timestamptz not null default now()
);
create index if not exists reminder_log_vendor_idx on reminder_log(vendor_id);
