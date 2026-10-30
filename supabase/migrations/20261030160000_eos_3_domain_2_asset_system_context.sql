-- EOS-3-DOMAIN-2 Asset/System ontology and context.
-- Additive extension of EOS 3.8 operational assets. No duplicate asset/system tables.
-- Rollback: DROP new tables/columns; restore prior operational asset shape.

-- Extend operational assets with Domain-2 context fields (identity continuity preserved).
ALTER TABLE eos3_operational_assets
  ADD COLUMN IF NOT EXISTS context_kind TEXT
    CHECK (context_kind IS NULL OR context_kind IN (
      'FACILITY','AREA','SYSTEM','SUBSYSTEM','ASSET','COMPONENT'
    )),
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS tag TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS configuration_state TEXT
    CHECK (configuration_state IS NULL OR configuration_state IN (
      'PROPOSED','SELECTED','DESIGNED','PROCURED','INSTALLED',
      'COMMISSIONED','OPERATING','MODIFIED','RETIRED'
    )),
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS owner_organization TEXT,
  ADD COLUMN IF NOT EXISTS primary_technical_discipline TEXT,
  ADD COLUMN IF NOT EXISTS supporting_disciplines JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custodial_discipline TEXT,
  ADD COLUMN IF NOT EXISTS inspection_discipline TEXT;

COMMENT ON COLUMN eos3_operational_assets.configuration_state IS
  'Physical/proposed configuration state. Independent of Work Package engineering maturity.';
COMMENT ON COLUMN eos3_operational_assets.context_kind IS
  'Domain-2 context kind. Not a mandatory Facility>Area>System>Asset chain.';

-- Typed context relationships (Phase-3 graph compatible).
CREATE TABLE IF NOT EXISTS eos3_asset_context_relationships (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id          TEXT,
  relationship_type   TEXT NOT NULL
                      CHECK (relationship_type IN (
                        'LOCATED_IN','PART_OF_SYSTEM','PART_OF_ASSET','SUPPORTS',
                        'CONNECTED_TO','SERVES','CONTAINS','ASSOCIATED_WITH'
                      )),
  from_stable_id      TEXT NOT NULL,
  to_stable_id        TEXT NOT NULL,
  from_revision_id    TEXT,
  to_revision_id      TEXT,
  directional         BOOLEAN NOT NULL DEFAULT TRUE,
  provenance          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, relationship_type, from_stable_id, to_stable_id),
  CHECK (from_stable_id <> to_stable_id)
);

CREATE INDEX IF NOT EXISTS idx_eos3_acr_ws
  ON eos3_asset_context_relationships (tenant_id, workspace_id);

ALTER TABLE eos3_asset_context_relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_acr_select ON eos3_asset_context_relationships;
CREATE POLICY eos3_acr_select ON eos3_asset_context_relationships
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_acr_write ON eos3_asset_context_relationships;
CREATE POLICY eos3_acr_write ON eos3_asset_context_relationships
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

-- Work Package ↔ Asset/System links (primary vs related).
CREATE TABLE IF NOT EXISTS eos3_work_package_asset_links (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id              TEXT NOT NULL,
  work_package_stable_id  TEXT NOT NULL,
  context_stable_id       TEXT NOT NULL,
  role                    TEXT NOT NULL
                          CHECK (role IN ('PRIMARY_ASSET_OR_SYSTEM','RELATED_ASSET_OR_SYSTEM')),
  effect                  TEXT NOT NULL DEFAULT 'AFFECTS'
                          CHECK (effect IN ('AFFECTS','CREATES','MODIFIES','RETIRES')),
  provenance              JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, project_id, work_package_stable_id, context_stable_id, role)
);

ALTER TABLE eos3_work_package_asset_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_wpal_select ON eos3_work_package_asset_links;
CREATE POLICY eos3_wpal_select ON eos3_work_package_asset_links
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_wpal_write ON eos3_work_package_asset_links;
CREATE POLICY eos3_wpal_write ON eos3_work_package_asset_links
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

-- Engineering object ↔ Asset/System associations.
CREATE TABLE IF NOT EXISTS eos3_engineering_object_asset_links (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id       UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id         TEXT NOT NULL,
  object_type        TEXT NOT NULL,
  object_stable_id   TEXT NOT NULL,
  context_stable_id  TEXT NOT NULL,
  role               TEXT NOT NULL DEFAULT 'APPLIES_TO'
                     CHECK (role IN ('APPLIES_TO','AFFECTS','MODIFIES')),
  derived            BOOLEAN NOT NULL DEFAULT FALSE,
  provenance         JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, project_id, object_stable_id, context_stable_id)
);

ALTER TABLE eos3_engineering_object_asset_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_eoal_select ON eos3_engineering_object_asset_links;
CREATE POLICY eos3_eoal_select ON eos3_engineering_object_asset_links
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_eoal_write ON eos3_engineering_object_asset_links;
CREATE POLICY eos3_eoal_write ON eos3_engineering_object_asset_links
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

-- Existing baseline vs proposed modification deltas (installed not overwritten by proposal).
CREATE TABLE IF NOT EXISTS eos3_asset_configuration_deltas (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id           UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_stable_id        TEXT NOT NULL,
  member_key             TEXT NOT NULL,
  existing_baseline      JSONB NOT NULL DEFAULT '{}'::jsonb,
  proposed_modification  JSONB NOT NULL DEFAULT '{}'::jsonb,
  installed_updated      BOOLEAN NOT NULL DEFAULT FALSE,
  status                 TEXT NOT NULL DEFAULT 'PROPOSED'
                         CHECK (status IN ('PROPOSED','ACCEPTED_AS_BUILT','REJECTED')),
  provenance             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE eos3_asset_configuration_deltas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_acd_select ON eos3_asset_configuration_deltas;
CREATE POLICY eos3_acd_select ON eos3_asset_configuration_deltas
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_acd_write ON eos3_asset_configuration_deltas;
CREATE POLICY eos3_acd_write ON eos3_asset_configuration_deltas
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

COMMENT ON TABLE eos3_asset_context_relationships IS
  'DOMAIN-2 typed Asset/System context edges. Compatible with DOMAIN-3 relationship graph.';
COMMENT ON TABLE eos3_asset_configuration_deltas IS
  'DOMAIN-2 existing baseline vs proposed modification. Installed config updates only after as-built acceptance.';
