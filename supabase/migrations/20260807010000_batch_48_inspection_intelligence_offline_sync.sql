-- Batch 48 / Phase 9G — Inspection Intelligence offline synchronization
-- Local store metadata, packages, commands, evidence queue, entitlement snapshots (server mirrors).

create table if not exists public.inspection_offline_packages (
  id text primary key,
  tenant_id uuid not null,
  workspace_id uuid not null,
  package_type text not null check (package_type in ('template', 'assignment')),
  version integer not null,
  checksum text not null,
  expires_at timestamptz not null,
  revoked boolean not null default false,
  dependencies jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists inspection_offline_packages_tenant_ws_idx
  on public.inspection_offline_packages (tenant_id, workspace_id);

create table if not exists public.inspection_offline_commands (
  operation_id text primary key,
  tenant_id uuid not null,
  workspace_id uuid not null,
  user_id text not null,
  idempotency_key text not null unique,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  state text not null,
  retry_count integer not null default 0,
  base_server_version integer,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inspection_offline_commands_tenant_ws_idx
  on public.inspection_offline_commands (tenant_id, workspace_id, state);

create table if not exists public.inspection_offline_evidence_queue (
  id text primary key,
  tenant_id uuid not null,
  workspace_id uuid not null,
  stage_id text not null,
  content_hash text not null,
  state text not null,
  idempotency_key text not null unique,
  server_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists inspection_offline_evidence_queue_hash_idx
  on public.inspection_offline_evidence_queue (content_hash);

create table if not exists public.inspection_offline_entitlement_snapshots (
  id text primary key,
  tenant_id uuid not null,
  workspace_id uuid not null,
  user_id text not null,
  capabilities jsonb not null default '[]'::jsonb,
  integrity_hash text not null,
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  revoked boolean not null default false
);

create index if not exists inspection_offline_entitlement_user_idx
  on public.inspection_offline_entitlement_snapshots (tenant_id, workspace_id, user_id);

alter table public.inspection_offline_packages enable row level security;
alter table public.inspection_offline_commands enable row level security;
alter table public.inspection_offline_evidence_queue enable row level security;
alter table public.inspection_offline_entitlement_snapshots enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'inspection_offline_packages' and policyname = 'inspection_offline_packages_tenant_isolation'
  ) then
    create policy inspection_offline_packages_tenant_isolation on public.inspection_offline_packages
      using (tenant_id::text = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id', tenant_id::text));
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'inspection_offline_commands' and policyname = 'inspection_offline_commands_tenant_isolation'
  ) then
    create policy inspection_offline_commands_tenant_isolation on public.inspection_offline_commands
      using (tenant_id::text = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id', tenant_id::text));
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'inspection_offline_evidence_queue' and policyname = 'inspection_offline_evidence_queue_tenant_isolation'
  ) then
    create policy inspection_offline_evidence_queue_tenant_isolation on public.inspection_offline_evidence_queue
      using (tenant_id::text = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id', tenant_id::text));
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'inspection_offline_entitlement_snapshots' and policyname = 'inspection_offline_entitlement_snapshots_tenant_isolation'
  ) then
    create policy inspection_offline_entitlement_snapshots_tenant_isolation on public.inspection_offline_entitlement_snapshots
      using (tenant_id::text = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id', tenant_id::text));
  end if;
end $$;
