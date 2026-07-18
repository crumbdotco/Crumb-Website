-- Referral click tracking for /referral redirect links.
create table if not exists public.referral_clicks (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  platform text not null check (platform in ('ios', 'android', 'other')),
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists referral_clicks_code_idx on public.referral_clicks (code);
create index if not exists referral_clicks_created_at_idx on public.referral_clicks (created_at);

alter table public.referral_clicks enable row level security;

revoke all on public.referral_clicks from anon;
revoke all on public.referral_clicks from authenticated;
