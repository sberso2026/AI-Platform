-- Batch 49: Inspection Intelligence condition rating and predictive signals (Phase 9H)
-- Server mirrors for governed ratings/signals. Client offline drafts sync via existing queues.

create table if not exists public.inspection_condition_ratings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  workspace_id uuid not null,
  session_id text not null,
  rating_id text not null,
  pack_id text not null,
  scheme_id text not null,
  scheme_version text not null,
  review_state text not null,
  confidence numeric not null,
  uncertainty numeric not null,
  evidence_sufficiency text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inspection_predictive_signals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  workspace_id uuid not null,
  signal_id text not null,
  signal_type text not null,
  advisory boolean not null default true,
  abstained boolean not null default false,
  disposition text not null,
  provider_id text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.inspection_condition_ratings enable row level security;
alter table public.inspection_predictive_signals enable row level security;

create policy tenant_isolation_condition_ratings on public.inspection_condition_ratings
  for all using (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
  with check (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

create policy tenant_isolation_predictive_signals on public.inspection_predictive_signals
  for all using (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
  with check (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
