-- One row per (code, ip) instead of one row per click, and never store raw IPs.
-- This repo is public, so raw visitor IPs must not land in a tracked migration
-- or in the database at all: we store a salted sha256 hash (ip_hash) and drop
-- the previously-stored raw user_agent column.
alter table public.referral_clicks add column if not exists ip_hash text;
alter table public.referral_clicks drop column if exists user_agent;

create unique index if not exists referral_clicks_code_ip_unique on public.referral_clicks (code, ip_hash) where ip_hash is not null;
