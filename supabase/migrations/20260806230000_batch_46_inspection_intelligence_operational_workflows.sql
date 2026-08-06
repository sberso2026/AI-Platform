-- Batch 45+1 / Phase 9E — Inspection Intelligence operational workflows
-- Assignments, workflow instances, audit, SLA timers, reporting outputs (desktop/web).
-- No mobile / offline tables.

create table if not exists public.inspection_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  workspace_id uuid not null,
  session_id uuid not null,
  assignee_person_id text not null,
  assigned_by text,
  due_at timestamptz,
  status text not null default 'open'
    check (status in ('open', 'accepted', 'in_progress', 'completed', 'reassigned', 'cancelled')),
  workflow_instance_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inspection_assignments_tenant_ws_idx
  on public.inspection_assignments (tenant_id, workspace_id);
create index if not exists inspection_assignments_session_idx
  on public.inspection_assignments (session_id);
create index if not exists inspection_assignments_assignee_idx
  on public.inspection_assignments (assignee_person_id, status);

create table if not exists public.inspection_workflow_instances (
  id text primary key,
  tenant_id uuid not null,
  workspace_id uuid not null,
  definition_slug text not null,
  definition_version integer not null default 1,
  entity_type text not null,
  entity_id text not null,
  state text not null,
  started_by text,
  context jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inspection_workflow_instances_tenant_ws_idx
  on public.inspection_workflow_instances (tenant_id, workspace_id);
create index if not exists inspection_workflow_instances_entity_idx
  on public.inspection_workflow_instances (entity_type, entity_id);

create table if not exists public.inspection_workflow_audit (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  workspace_id uuid not null,
  instance_id text not null references public.inspection_workflow_instances(id) on delete cascade,
  action text not null,
  from_state text,
  to_state text,
  actor_person_id text,
  detail jsonb not null default '{}'::jsonb,
  at timestamptz not null default now()
);

create index if not exists inspection_workflow_audit_instance_idx
  on public.inspection_workflow_audit (instance_id, at);

create table if not exists public.inspection_workflow_sla_timers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  workspace_id uuid not null,
  instance_id text not null references public.inspection_workflow_instances(id) on delete cascade,
  due_at timestamptz not null,
  breached boolean not null default false,
  breached_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists inspection_workflow_sla_due_idx
  on public.inspection_workflow_sla_timers (due_at, breached);

create table if not exists public.inspection_reporting_outputs (
  id text primary key,
  tenant_id uuid not null,
  workspace_id uuid not null,
  report_key text not null,
  kind text not null,
  entity_type text not null,
  entity_id text not null,
  workflow_instance_id text,
  payload jsonb not null default '{}'::jsonb,
  mobile_ready boolean not null default false,
  generated_at timestamptz not null default now()
);

create index if not exists inspection_reporting_outputs_tenant_ws_idx
  on public.inspection_reporting_outputs (tenant_id, workspace_id);
create index if not exists inspection_reporting_outputs_key_idx
  on public.inspection_reporting_outputs (report_key);

alter table public.inspection_assignments enable row level security;
alter table public.inspection_workflow_instances enable row level security;
alter table public.inspection_workflow_audit enable row level security;
alter table public.inspection_workflow_sla_timers enable row level security;
alter table public.inspection_reporting_outputs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'inspection_assignments' and policyname = 'inspection_assignments_tenant_isolation'
  ) then
    create policy inspection_assignments_tenant_isolation on public.inspection_assignments
      using (tenant_id::text = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id', tenant_id::text));
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'inspection_workflow_instances' and policyname = 'inspection_workflow_instances_tenant_isolation'
  ) then
    create policy inspection_workflow_instances_tenant_isolation on public.inspection_workflow_instances
      using (tenant_id::text = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id', tenant_id::text));
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'inspection_workflow_audit' and policyname = 'inspection_workflow_audit_tenant_isolation'
  ) then
    create policy inspection_workflow_audit_tenant_isolation on public.inspection_workflow_audit
      using (tenant_id::text = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id', tenant_id::text));
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'inspection_workflow_sla_timers' and policyname = 'inspection_workflow_sla_timers_tenant_isolation'
  ) then
    create policy inspection_workflow_sla_timers_tenant_isolation on public.inspection_workflow_sla_timers
      using (tenant_id::text = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id', tenant_id::text));
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'inspection_reporting_outputs' and policyname = 'inspection_reporting_outputs_tenant_isolation'
  ) then
    create policy inspection_reporting_outputs_tenant_isolation on public.inspection_reporting_outputs
      using (tenant_id::text = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id', tenant_id::text));
  end if;
end $$;
