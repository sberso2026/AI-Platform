-- Batch 50: Inspection Intelligence AI Vision (Phase 9I)
create table if not exists public.inspection_vision_analyses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  workspace_id uuid not null,
  analysis_id text not null,
  evidence_id text not null,
  evidence_content_hash text not null,
  provider_id text not null,
  model_version text not null,
  validation_state text not null,
  advisory boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.inspection_vision_derivatives (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  workspace_id uuid not null,
  derivative_id text not null,
  parent_evidence_id text not null,
  parent_content_hash text not null,
  derivative_content_hash text not null,
  kind text not null,
  created_at timestamptz not null default now()
);

alter table public.inspection_vision_analyses enable row level security;
alter table public.inspection_vision_derivatives enable row level security;

create policy tenant_isolation_vision_analyses on public.inspection_vision_analyses
  for all using (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
  with check (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

create policy tenant_isolation_vision_derivatives on public.inspection_vision_derivatives
  for all using (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
  with check (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
