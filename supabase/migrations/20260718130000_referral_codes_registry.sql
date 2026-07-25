-- Registry of referral codes, so a code can be created/managed BEFORE anyone
-- clicks a link with it (the owner needs to see which creator a code belongs
-- to and retire one). This table already exists in the live database; this
-- migration file mirrors it verbatim for the repo history, it is NOT meant
-- to be re-applied against the live project.
create table if not exists public.referral_codes (
  code text primary key,
  creator_name text not null,
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.referral_codes enable row level security;

revoke all on public.referral_codes from anon, authenticated;
