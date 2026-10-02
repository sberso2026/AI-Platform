-- EOS-A15A-V3: Governed MTO snapshot persistence.
-- Additive after 20261001210000_eos_a14a_artifact_object_storage.sql.
-- Composes V2 Quantity Basis & MTO. Not an MTO Intelligence domain.
-- Quantity-basis provenance is embedded on items (no third table).

CREATE TABLE IF NOT EXISTS engineering_mto_snapshots (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id             UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id               TEXT NOT NULL,
  work_plan_id             UUID REFERENCES engineering_work_plans(id) ON DELETE SET NULL,
  system_id                TEXT,
  discipline               TEXT,
  discipline_scope         TEXT NOT NULL,
  lifecycle_stage          TEXT NOT NULL,
  revision                 TEXT NOT NULL,
  status                   TEXT NOT NULL CHECK (status IN (
    'DRAFT', 'UNDER_REVIEW', 'VERIFIED', 'SUPERSEDED'
  )),
  verification_state       TEXT NOT NULL CHECK (verification_state IN (
    'UNVERIFIED', 'VERIFIED', 'REJECTED', 'NEEDS_INFORMATION'
  )),
  source_revision_set      TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  item_count               INTEGER NOT NULL DEFAULT 0,
  snapshot_fingerprint     TEXT NOT NULL,
  staleness                TEXT NOT NULL DEFAULT 'CURRENT' CHECK (staleness IN (
    'CURRENT', 'SOURCE_CHANGED', 'MTO_REVIEW_REQUIRED'
  )),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by               TEXT,
  verified_at              TIMESTAMPTZ,
  verified_by              TEXT,
  supersedes_snapshot_id   UUID REFERENCES engineering_mto_snapshots(id) ON DELETE SET NULL,
  export_disclaimer        TEXT NOT NULL DEFAULT 'Export does not imply engineering approval, IFC, or DESIGN ACCEPTED.'
);

CREATE TABLE IF NOT EXISTS engineering_mto_items (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id              UUID NOT NULL REFERENCES engineering_mto_snapshots(id) ON DELETE CASCADE,
  tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id             UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id               TEXT NOT NULL,
  item_code                TEXT NOT NULL,
  description              TEXT NOT NULL,
  discipline               TEXT NOT NULL,
  system_id                TEXT,
  asset_id                 TEXT,
  tag                      TEXT,
  category                 TEXT NOT NULL,
  material                 TEXT,
  grade                    TEXT,
  specification            TEXT,
  quantity                 NUMERIC,
  unit                     TEXT,
  source_unit              TEXT,
  conversion_recorded      BOOLEAN NOT NULL DEFAULT FALSE,
  quantity_origin          TEXT NOT NULL,
  quantity_maturity        TEXT NOT NULL,
  source_type              TEXT NOT NULL,
  source_ref               TEXT,
  source_revision          TEXT,
  measurement_method       TEXT,
  derivation_method        TEXT,
  formula                  TEXT,
  extraction_record_id     TEXT,
  input_refs               TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  assumptions              TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  exclusions               TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  verification_status      TEXT NOT NULL CHECK (verification_status IN (
    'UNVERIFIED', 'VERIFIED', 'REJECTED', 'NEEDS_INFORMATION'
  )),
  verified_at              TIMESTAMPTZ,
  verified_by              TEXT,
  semantics                TEXT NOT NULL DEFAULT 'bulk_mto',
  status                   TEXT NOT NULL DEFAULT 'ACTIVE',
  section                  TEXT,
  length                   NUMERIC,
  unit_mass                NUMERIC,
  total_mass               NUMERIC,
  volume                   NUMERIC,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_mto_snapshots_project
  ON engineering_mto_snapshots (tenant_id, workspace_id, project_id, revision, status);
CREATE INDEX IF NOT EXISTS idx_eng_mto_snapshots_plan
  ON engineering_mto_snapshots (work_plan_id);
CREATE INDEX IF NOT EXISTS idx_eng_mto_snapshots_discipline
  ON engineering_mto_snapshots (tenant_id, workspace_id, project_id, discipline_scope);
CREATE INDEX IF NOT EXISTS idx_eng_mto_items_snapshot
  ON engineering_mto_items (snapshot_id, discipline, verification_status);
CREATE INDEX IF NOT EXISTS idx_eng_mto_items_project
  ON engineering_mto_items (tenant_id, workspace_id, project_id, item_code);

DROP TRIGGER IF EXISTS engineering_mto_snapshots_workspace_tenant ON engineering_mto_snapshots;
CREATE TRIGGER engineering_mto_snapshots_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_mto_snapshots
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_mto_items_workspace_tenant ON engineering_mto_items;
CREATE TRIGGER engineering_mto_items_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_mto_items
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

CREATE OR REPLACE FUNCTION engineering_mto_prevent_verified_item_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  snapshot_status TEXT;
BEGIN
  SELECT status INTO snapshot_status
  FROM engineering_mto_snapshots
  WHERE id = COALESCE(NEW.snapshot_id, OLD.snapshot_id);
  IF snapshot_status IN ('VERIFIED', 'SUPERSEDED') THEN
    RAISE EXCEPTION 'verified_mto_immutable';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS engineering_mto_items_immutable ON engineering_mto_items;
CREATE TRIGGER engineering_mto_items_immutable
  BEFORE UPDATE OR DELETE ON engineering_mto_items
  FOR EACH ROW EXECUTE FUNCTION engineering_mto_prevent_verified_item_mutation();

CREATE OR REPLACE FUNCTION engineering_mto_prevent_verified_snapshot_fingerprint_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IN ('VERIFIED', 'SUPERSEDED')
     AND (
       NEW.snapshot_fingerprint IS DISTINCT FROM OLD.snapshot_fingerprint
       OR NEW.revision IS DISTINCT FROM OLD.revision
       OR NEW.project_id IS DISTINCT FROM OLD.project_id
       OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
       OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id
     ) THEN
    RAISE EXCEPTION 'verified_mto_immutable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS engineering_mto_snapshots_immutable ON engineering_mto_snapshots;
CREATE TRIGGER engineering_mto_snapshots_immutable
  BEFORE UPDATE ON engineering_mto_snapshots
  FOR EACH ROW EXECUTE FUNCTION engineering_mto_prevent_verified_snapshot_fingerprint_mutation();

COMMENT ON TABLE engineering_mto_snapshots IS
  'EOS-A15A-V3 governed MTO snapshot. Verification is quantity/basis verification, not design approval.';
COMMENT ON TABLE engineering_mto_items IS
  'EOS-A15A-V3 MTO items with embedded quantity-basis provenance. AI-extracted quantities remain UNVERIFIED until human verification.';

ALTER TABLE engineering_mto_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_mto_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_mto_snapshots_select ON engineering_mto_snapshots;
DROP POLICY IF EXISTS eng_mto_snapshots_insert ON engineering_mto_snapshots;
DROP POLICY IF EXISTS eng_mto_snapshots_update ON engineering_mto_snapshots;
DROP POLICY IF EXISTS eng_mto_snapshots_delete ON engineering_mto_snapshots;
DROP POLICY IF EXISTS eng_mto_items_select ON engineering_mto_items;
DROP POLICY IF EXISTS eng_mto_items_insert ON engineering_mto_items;
DROP POLICY IF EXISTS eng_mto_items_update ON engineering_mto_items;
DROP POLICY IF EXISTS eng_mto_items_delete ON engineering_mto_items;

CREATE POLICY eng_mto_snapshots_select ON engineering_mto_snapshots
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_mto_snapshots_insert ON engineering_mto_snapshots
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_mto_snapshots_update ON engineering_mto_snapshots
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_mto_snapshots_delete ON engineering_mto_snapshots
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_mto_items_select ON engineering_mto_items
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_mto_items_insert ON engineering_mto_items
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_mto_items_update ON engineering_mto_items
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_mto_items_delete ON engineering_mto_items
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
