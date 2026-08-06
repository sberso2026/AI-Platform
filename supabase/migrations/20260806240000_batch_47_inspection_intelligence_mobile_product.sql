-- Batch 47 / Phase 9F — Inspection Intelligence mobile product persistence
-- Media staging metadata, annotations (derivatives), attestations. No offline queue tables.

create table if not exists public.inspection_media_stages (
  id text primary key,
  tenant_id uuid not null,
  workspace_id uuid not null,
  session_id uuid not null,
  temporary_local_id text not null,
  mime_type text not null,
  byte_length integer not null,
  content_hash text,
  state text not null
    check (state in (
      'local_draft', 'media_staged', 'upload_pending', 'uploading',
      'uploaded', 'server_confirmed', 'failed', 'cancelled'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inspection_media_stages_tenant_ws_idx
  on public.inspection_media_stages (tenant_id, workspace_id);

create table if not exists public.inspection_evidence_annotations (
  id text primary key,
  tenant_id uuid not null,
  workspace_id uuid not null,
  source_evidence_id text not null,
  source_evidence_hash text not null,
  annotation_version integer not null default 1,
  overlay jsonb not null default '[]'::jsonb,
  rendered_derivative_file_id text,
  author_person_id text not null,
  purpose text not null,
  annotation_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists inspection_evidence_annotations_source_idx
  on public.inspection_evidence_annotations (source_evidence_id);

create table if not exists public.inspection_attestations (
  id text primary key,
  tenant_id uuid not null,
  workspace_id uuid not null,
  project_id text,
  inspection_id text not null,
  actor_id text not null,
  workflow_transition text not null,
  content_hash text not null,
  authentication_context text not null,
  reason text not null,
  signature_mark_id text,
  signature_supplementary_only boolean not null default true,
  asserted_at timestamptz not null default now()
);

create index if not exists inspection_attestations_inspection_idx
  on public.inspection_attestations (inspection_id);

alter table public.inspection_media_stages enable row level security;
alter table public.inspection_evidence_annotations enable row level security;
alter table public.inspection_attestations enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'inspection_media_stages' and policyname = 'inspection_media_stages_tenant_isolation'
  ) then
    create policy inspection_media_stages_tenant_isolation on public.inspection_media_stages
      using (tenant_id::text = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id', tenant_id::text));
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'inspection_evidence_annotations' and policyname = 'inspection_evidence_annotations_tenant_isolation'
  ) then
    create policy inspection_evidence_annotations_tenant_isolation on public.inspection_evidence_annotations
      using (tenant_id::text = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id', tenant_id::text));
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'inspection_attestations' and policyname = 'inspection_attestations_tenant_isolation'
  ) then
    create policy inspection_attestations_tenant_isolation on public.inspection_attestations
      using (tenant_id::text = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id', tenant_id::text));
  end if;
end $$;
