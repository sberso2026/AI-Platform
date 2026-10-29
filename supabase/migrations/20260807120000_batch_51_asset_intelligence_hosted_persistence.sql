-- Phase 10B.1 — Asset Intelligence hosted persistence (condition slice)
-- Intelligence ABOUT assets only. Does NOT create a canonical asset registry.
-- References tenant_id / workspace_id / asset_id owned by Engineering OS Shared Domain.

CREATE TABLE IF NOT EXISTS asset_intelligence_condition_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'observed'
    CHECK (status IN ('observed', 'calculated', 'reviewed', 'published')),
  condition_rating text,
  condition_index numeric,
  confidence numeric,
  method text,
  source_type text NOT NULL DEFAULT 'inspection'
    CHECK (source_type IN (
      'inspection', 'manual_engineering_assessment', 'project_intelligence',
      'shm', 'sensor', 'external_import', 'ai_derived', 'calculated'
    )),
  source_key text NOT NULL DEFAULT 'inspection_intelligence.public_contracts',
  source_reference text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  observed_at timestamptz,
  calculated_at timestamptz,
  reviewed_at timestamptz,
  published_at timestamptz,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES asset_intelligence_condition_states(id) ON DELETE SET NULL,
  condition_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, asset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_condition_tenant_ws_asset
  ON asset_intelligence_condition_states(tenant_id, workspace_id, asset_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_condition_asset_latest
  ON asset_intelligence_condition_states(asset_id, version DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  schema_version text NOT NULL DEFAULT 'asset_snapshot/1',
  captured_at timestamptz NOT NULL DEFAULT now(),
  condition_state_id uuid REFERENCES asset_intelligence_condition_states(id) ON DELETE SET NULL,
  health_index jsonb,
  identity_reference jsonb NOT NULL,
  source_set jsonb NOT NULL DEFAULT '[]'::jsonb,
  timeline_position text,
  snapshot_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_asset_registry boolean NOT NULL DEFAULT false CHECK (is_asset_registry = false),
  mutates_identity boolean NOT NULL DEFAULT false CHECK (mutates_identity = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_snapshots_tenant_ws_asset
  ON asset_intelligence_snapshots(tenant_id, workspace_id, asset_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  entry_id text NOT NULL,
  state_id text,
  kind text NOT NULL,
  event_type text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  source_key text NOT NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  governance jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, entry_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_timeline_asset
  ON asset_intelligence_timeline(tenant_id, workspace_id, asset_id, recorded_at ASC);

CREATE TABLE IF NOT EXISTS asset_intelligence_source_provenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  source_key text NOT NULL,
  source_type text NOT NULL,
  contract_family text,
  contract_version text,
  ownership text NOT NULL,
  evidence_duplication_forbidden boolean NOT NULL DEFAULT true,
  writeback_identity_forbidden boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_source_prov_asset
  ON asset_intelligence_source_provenance(tenant_id, workspace_id, asset_id, created_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_idempotency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  operation text NOT NULL,
  resource_id text,
  request_hash text,
  response_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS asset_intelligence_outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  correlation_id text,
  state_id text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_ai_outbox_unpublished
  ON asset_intelligence_outbox_events(published, created_at ASC)
  WHERE published = false;

-- RLS
ALTER TABLE asset_intelligence_condition_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_source_provenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_idempotency ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_outbox_events ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'asset_intelligence_condition_states',
    'asset_intelligence_snapshots',
    'asset_intelligence_timeline',
    'asset_intelligence_source_provenance',
    'asset_intelligence_idempotency',
    'asset_intelligence_outbox_events'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_select', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR INSERT WITH CHECK (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_insert', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR UPDATE USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       ) WITH CHECK (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_update', t
    );
  END LOOP;
END $$;

COMMENT ON TABLE asset_intelligence_condition_states IS
  'Asset Intelligence condition states. References canonical engineering_assets; not an asset registry.';
COMMENT ON TABLE asset_intelligence_snapshots IS
  'Immutable composed AssetSnapshot records. is_asset_registry must remain false.';
