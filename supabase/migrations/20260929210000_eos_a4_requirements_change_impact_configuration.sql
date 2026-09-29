-- EOS-A4 — Requirements, Change, Impact & Configuration Intelligence
-- Additive. Does not rewrite A2/A3 objects.
-- Does not merge Project Controls change intelligence, PI findings, ERA findings,
-- document versions, or Digital Twin state into Engineering Core.
-- Does not add Optimization / Value / graph-store schema.

-- ─── Requirements ────────────────────────────────────────────────────────────

CREATE TABLE engineering_requirements (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id              UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  requirement_code        TEXT NOT NULL,
  title                   TEXT NOT NULL,
  statement               TEXT NOT NULL,
  requirement_type        TEXT NOT NULL CHECK (requirement_type IN (
    'FUNCTIONAL', 'PERFORMANCE', 'SAFETY', 'REGULATORY', 'CLIENT',
    'DESIGN', 'OPERABILITY', 'MAINTAINABILITY', 'ENVIRONMENTAL'
  )),
  source                  TEXT,
  rationale               TEXT,
  status                  TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'active', 'superseded', 'retired', 'waived'
  )),
  priority                TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN (
    'low', 'medium', 'high', 'critical'
  )),
  owner_id                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  acceptance_criteria     TEXT,
  verification_method     TEXT CHECK (verification_method IS NULL OR verification_method IN (
    'ANALYSIS', 'INSPECTION', 'TEST', 'DEMONSTRATION', 'REVIEW', 'CERTIFICATION'
  )),
  verification_status     TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN (
    'unverified', 'in_progress', 'verified', 'waived', 'failed'
  )),
  verification_evidence_ref TEXT,
  created_by              UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata                JSONB NOT NULL DEFAULT '{}',
  UNIQUE (tenant_id, workspace_id, requirement_code)
);

CREATE INDEX idx_eng_requirements_ws ON engineering_requirements(tenant_id, workspace_id, requirement_code);
CREATE INDEX idx_eng_requirements_project ON engineering_requirements(project_id);
CREATE INDEX idx_eng_requirements_type ON engineering_requirements(tenant_id, requirement_type, status);

CREATE TRIGGER engineering_requirements_updated_at
  BEFORE UPDATE ON engineering_requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_requirements IS
  'EOS-A4 canonical Requirement. Governed obligation/acceptance condition. Not a Document, Finding, or Assumption.';
COMMENT ON COLUMN engineering_requirements.acceptance_criteria IS
  'Summary of testable acceptance conditions. Full standards text is not stored here.';
COMMENT ON COLUMN engineering_requirements.verification_status IS
  'Requirement verification lifecycle. Distinct from ERA finding verification and document status.';

-- ─── Changes ─────────────────────────────────────────────────────────────────

CREATE TABLE engineering_changes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id              UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  change_code             TEXT NOT NULL,
  title                   TEXT NOT NULL,
  description             TEXT,
  change_type             TEXT NOT NULL CHECK (change_type IN (
    'DESIGN', 'SCOPE', 'TECHNICAL', 'SAFETY', 'REGULATORY',
    'INTERFACE', 'REQUIREMENT', 'CONFIGURATION', 'OTHER'
  )),
  source                  TEXT,
  reason                  TEXT,
  status                  TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN (
    'proposed', 'assessing', 'approved', 'rejected',
    'implementing', 'implemented', 'verified', 'cancelled'
  )),
  priority                TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN (
    'low', 'medium', 'high', 'critical'
  )),
  owner_id                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  requested_by            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  effective_at            TIMESTAMPTZ,
  created_by              UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata                JSONB NOT NULL DEFAULT '{}',
  UNIQUE (tenant_id, workspace_id, change_code)
);

CREATE INDEX idx_eng_changes_ws ON engineering_changes(tenant_id, workspace_id, change_code);
CREATE INDEX idx_eng_changes_project ON engineering_changes(project_id);
CREATE INDEX idx_eng_changes_status ON engineering_changes(tenant_id, status);

CREATE TRIGGER engineering_changes_updated_at
  BEFORE UPDATE ON engineering_changes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_changes IS
  'EOS-A4 canonical Change: controlled modification/event. Not an Impact. Not a Configuration Baseline. Not Project Controls advisory change intelligence.';

-- ─── Impacts ─────────────────────────────────────────────────────────────────

CREATE TABLE engineering_impacts (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id              UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  impact_code             TEXT NOT NULL,
  title                   TEXT NOT NULL,
  description             TEXT,
  impact_type             TEXT NOT NULL CHECK (impact_type IN (
    'TECHNICAL', 'SAFETY', 'COST', 'SCHEDULE',
    'INTERFACE', 'REQUIREMENT', 'CONFIGURATION', 'OPERABILITY'
  )),
  severity                TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN (
    'low', 'medium', 'high', 'critical'
  )),
  likelihood              TEXT NOT NULL DEFAULT 'unknown' CHECK (likelihood IN (
    'unknown', 'low', 'medium', 'high'
  )),
  status                  TEXT NOT NULL DEFAULT 'candidate' CHECK (status IN (
    'candidate', 'confirmed', 'rejected', 'closed'
  )),
  owner_id                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by              UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata                JSONB NOT NULL DEFAULT '{}',
  UNIQUE (tenant_id, workspace_id, impact_code)
);

CREATE INDEX idx_eng_impacts_ws ON engineering_impacts(tenant_id, workspace_id, impact_code);
CREATE INDEX idx_eng_impacts_project ON engineering_impacts(project_id);
CREATE INDEX idx_eng_impacts_status ON engineering_impacts(tenant_id, status, severity);

CREATE TRIGGER engineering_impacts_updated_at
  BEFORE UPDATE ON engineering_impacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_impacts IS
  'EOS-A4 canonical Impact: consequence of a Change or other governed event. status=candidate is DISCOVERED_DEPENDENCY until explicitly confirmed. Not auto-confirmed by traversal.';
COMMENT ON COLUMN engineering_impacts.status IS
  'candidate = discovered/proposed consequence; confirmed = CONFIRMED_ENGINEERING_IMPACT after human confirmation.';

-- ─── Configuration baselines ─────────────────────────────────────────────────

CREATE TABLE engineering_configuration_baselines (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id              UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  baseline_code           TEXT NOT NULL,
  name                    TEXT NOT NULL,
  description             TEXT,
  baseline_type           TEXT NOT NULL CHECK (baseline_type IN (
    'DESIGN', 'FEED', 'IFC', 'INSTALLED', 'AS_BUILT',
    'COMMISSIONED', 'OPERATIONAL', 'MODIFICATION'
  )),
  status                  TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'frozen', 'superseded', 'archived'
  )),
  effective_at            TIMESTAMPTZ,
  frozen_at               TIMESTAMPTZ,
  frozen_by               UUID REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_baseline_id  UUID REFERENCES engineering_configuration_baselines(id) ON DELETE RESTRICT,
  created_by              UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata                JSONB NOT NULL DEFAULT '{}',
  UNIQUE (tenant_id, workspace_id, baseline_code),
  CONSTRAINT engineering_configuration_baselines_no_self_supersede
    CHECK (supersedes_baseline_id IS NULL OR supersedes_baseline_id <> id)
);

CREATE INDEX idx_eng_cfg_baselines_ws ON engineering_configuration_baselines(tenant_id, workspace_id, baseline_code);
CREATE INDEX idx_eng_cfg_baselines_project ON engineering_configuration_baselines(project_id);
CREATE INDEX idx_eng_cfg_baselines_supersedes ON engineering_configuration_baselines(supersedes_baseline_id)
  WHERE supersedes_baseline_id IS NOT NULL;

CREATE TRIGGER engineering_configuration_baselines_updated_at
  BEFORE UPDATE ON engineering_configuration_baselines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_configuration_baselines IS
  'EOS-A4 Configuration Baseline: governed valid set of engineering objects at a named state. Not a Change status. Not a Document Version.';
COMMENT ON COLUMN engineering_configuration_baselines.baseline_type IS
  'IFC here means Issued-for-Construction configuration state, not the IFC file format.';

-- ─── Configuration items (point-in-time snapshot) ────────────────────────────

CREATE TABLE engineering_configuration_items (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  baseline_id             UUID NOT NULL REFERENCES engineering_configuration_baselines(id) ON DELETE RESTRICT,
  object_type             TEXT NOT NULL,
  object_id               UUID NOT NULL,
  revision_ref            TEXT,
  object_code_snapshot    TEXT,
  object_title_snapshot   TEXT,
  effective_state         TEXT,
  provenance              JSONB NOT NULL DEFAULT '{}',
  captured_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  captured_by             UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (baseline_id, object_type, object_id)
);

CREATE INDEX idx_eng_cfg_items_baseline ON engineering_configuration_items(baseline_id);
CREATE INDEX idx_eng_cfg_items_object ON engineering_configuration_items(object_type, object_id);
CREATE INDEX idx_eng_cfg_items_ws ON engineering_configuration_items(tenant_id, workspace_id);

COMMENT ON TABLE engineering_configuration_items IS
  'EOS-A4 Configuration Item snapshot. Historical validity is the captured code/title/revision_ref, not a live join to today''s object. revision_ref is NULL when the object has no version model.';
COMMENT ON COLUMN engineering_configuration_items.revision_ref IS
  'Optional document/model revision identity at capture. Not fabricated when the object has no version model.';

-- ─── Workspace/tenant match + ownership immutability ─────────────────────────

DROP TRIGGER IF EXISTS engineering_requirements_workspace_tenant ON engineering_requirements;
CREATE TRIGGER engineering_requirements_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_requirements
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_changes_workspace_tenant ON engineering_changes;
CREATE TRIGGER engineering_changes_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_changes
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_impacts_workspace_tenant ON engineering_impacts;
CREATE TRIGGER engineering_impacts_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_impacts
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_configuration_baselines_workspace_tenant ON engineering_configuration_baselines;
CREATE TRIGGER engineering_configuration_baselines_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_configuration_baselines
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_configuration_items_workspace_tenant ON engineering_configuration_items;
CREATE TRIGGER engineering_configuration_items_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_configuration_items
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_requirements_ownership_immutable ON engineering_requirements;
CREATE TRIGGER engineering_requirements_ownership_immutable
  BEFORE UPDATE ON engineering_requirements
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_ownership_mutation();

DROP TRIGGER IF EXISTS engineering_changes_ownership_immutable ON engineering_changes;
CREATE TRIGGER engineering_changes_ownership_immutable
  BEFORE UPDATE ON engineering_changes
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_ownership_mutation();

DROP TRIGGER IF EXISTS engineering_impacts_ownership_immutable ON engineering_impacts;
CREATE TRIGGER engineering_impacts_ownership_immutable
  BEFORE UPDATE ON engineering_impacts
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_ownership_mutation();

DROP TRIGGER IF EXISTS engineering_configuration_baselines_ownership_immutable ON engineering_configuration_baselines;
CREATE TRIGGER engineering_configuration_baselines_ownership_immutable
  BEFORE UPDATE ON engineering_configuration_baselines
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_ownership_mutation();

DROP TRIGGER IF EXISTS engineering_configuration_items_ownership_immutable ON engineering_configuration_items;
CREATE TRIGGER engineering_configuration_items_ownership_immutable
  BEFORE UPDATE ON engineering_configuration_items
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_ownership_mutation();

-- ─── Frozen baseline immutability ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION engineering_configuration_baseline_immutable()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('frozen', 'superseded', 'archived') THEN
      RAISE EXCEPTION 'cannot delete frozen/superseded/archived configuration baseline';
    END IF;
    RETURN OLD;
  END IF;
  IF OLD.status IN ('frozen', 'superseded', 'archived') THEN
    -- Allow frozen → superseded or archived only. Identity fields stay frozen.
    IF OLD.status = 'frozen' AND NEW.status IN ('superseded', 'archived')
       AND NEW.baseline_code = OLD.baseline_code
       AND NEW.name = OLD.name
       AND NEW.baseline_type = OLD.baseline_type
       AND NEW.supersedes_baseline_id IS NOT DISTINCT FROM OLD.supersedes_baseline_id THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'frozen configuration baseline is immutable; create a superseding baseline';
  END IF;
  IF NEW.supersedes_baseline_id IS NOT NULL AND NEW.supersedes_baseline_id = NEW.id THEN
    RAISE EXCEPTION 'configuration baseline cannot supersede itself';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS engineering_configuration_baselines_immutable ON engineering_configuration_baselines;
CREATE TRIGGER engineering_configuration_baselines_immutable
  BEFORE UPDATE OR DELETE ON engineering_configuration_baselines
  FOR EACH ROW EXECUTE FUNCTION engineering_configuration_baseline_immutable();

CREATE OR REPLACE FUNCTION engineering_configuration_item_immutable()
RETURNS TRIGGER AS $$
DECLARE
  baseline_status TEXT;
  baseline_ws UUID;
  baseline_tenant UUID;
  object_tenant UUID;
  object_ws UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT status INTO baseline_status
      FROM engineering_configuration_baselines WHERE id = OLD.baseline_id;
    IF baseline_status IN ('frozen', 'superseded', 'archived') THEN
      RAISE EXCEPTION 'cannot remove items from a frozen configuration baseline';
    END IF;
    RETURN OLD;
  END IF;
  SELECT status, workspace_id, tenant_id
    INTO baseline_status, baseline_ws, baseline_tenant
    FROM engineering_configuration_baselines WHERE id = NEW.baseline_id;
  IF baseline_status IS NULL THEN
    RAISE EXCEPTION 'configuration baseline not found';
  END IF;
  IF NEW.workspace_id IS DISTINCT FROM baseline_ws OR NEW.tenant_id IS DISTINCT FROM baseline_tenant THEN
    RAISE EXCEPTION 'configuration item must share tenant and workspace with its baseline';
  END IF;
  SELECT r.tenant_id, r.workspace_id INTO object_tenant, object_ws
    FROM engineering_object_link_resolve(NEW.object_type, NEW.object_id) r;
  IF object_tenant IS NULL THEN
    RAISE EXCEPTION 'configuration item object not found or unresolvable in Engineering Core';
  END IF;
  IF object_tenant IS DISTINCT FROM NEW.tenant_id OR object_ws IS DISTINCT FROM NEW.workspace_id THEN
    RAISE EXCEPTION 'configuration item cannot include an object from another tenant or workspace';
  END IF;
  IF TG_OP = 'INSERT' AND baseline_status IN ('frozen', 'superseded', 'archived') THEN
    RAISE EXCEPTION 'cannot add items to a frozen configuration baseline';
  END IF;
  IF TG_OP = 'UPDATE' AND baseline_status IN ('frozen', 'superseded', 'archived') THEN
    RAISE EXCEPTION 'frozen configuration baseline items are immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS engineering_configuration_items_immutable ON engineering_configuration_items;
CREATE TRIGGER engineering_configuration_items_immutable
  BEFORE INSERT OR UPDATE OR DELETE ON engineering_configuration_items
  FOR EACH ROW EXECUTE FUNCTION engineering_configuration_item_immutable();

-- Historical CI provenance: referenced objects cannot be deleted while snapshotted.
CREATE OR REPLACE FUNCTION engineering_core_prevent_delete_while_configuration_item()
RETURNS TRIGGER AS $$
DECLARE
  p_object_type TEXT := TG_ARGV[0];
BEGIN
  IF EXISTS (
    SELECT 1 FROM engineering_configuration_items ci
     WHERE ci.object_type = p_object_type
       AND ci.object_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'cannot delete % while configuration baseline items reference it', p_object_type;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS engineering_requirements_prevent_ci_delete ON engineering_requirements;
CREATE TRIGGER engineering_requirements_prevent_ci_delete
  BEFORE DELETE ON engineering_requirements
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_delete_while_configuration_item('requirement');

DROP TRIGGER IF EXISTS engineering_changes_prevent_ci_delete ON engineering_changes;
CREATE TRIGGER engineering_changes_prevent_ci_delete
  BEFORE DELETE ON engineering_changes
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_delete_while_configuration_item('change');

DROP TRIGGER IF EXISTS engineering_impacts_prevent_ci_delete ON engineering_impacts;
CREATE TRIGGER engineering_impacts_prevent_ci_delete
  BEFORE DELETE ON engineering_impacts
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_delete_while_configuration_item('impact');

DROP TRIGGER IF EXISTS engineering_systems_prevent_ci_delete ON engineering_systems;
CREATE TRIGGER engineering_systems_prevent_ci_delete
  BEFORE DELETE ON engineering_systems
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_delete_while_configuration_item('system');

DROP TRIGGER IF EXISTS engineering_interfaces_prevent_ci_delete ON engineering_interfaces;
CREATE TRIGGER engineering_interfaces_prevent_ci_delete
  BEFORE DELETE ON engineering_interfaces
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_delete_while_configuration_item('interface');

DROP TRIGGER IF EXISTS engineering_assets_prevent_ci_delete ON engineering_assets;
CREATE TRIGGER engineering_assets_prevent_ci_delete
  BEFORE DELETE ON engineering_assets
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_delete_while_configuration_item('asset');

DROP TRIGGER IF EXISTS engineering_documents_prevent_ci_delete ON engineering_documents;
CREATE TRIGGER engineering_documents_prevent_ci_delete
  BEFORE DELETE ON engineering_documents
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_delete_while_configuration_item('document');

DROP TRIGGER IF EXISTS engineering_decisions_prevent_ci_delete ON engineering_decisions;
CREATE TRIGGER engineering_decisions_prevent_ci_delete
  BEFORE DELETE ON engineering_decisions
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_delete_while_configuration_item('decision');

DROP TRIGGER IF EXISTS engineering_assumptions_prevent_ci_delete ON engineering_assumptions;
CREATE TRIGGER engineering_assumptions_prevent_ci_delete
  BEFORE DELETE ON engineering_assumptions
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_delete_while_configuration_item('assumption');

-- Object-link delete protection for A4 canonical objects.
CREATE OR REPLACE FUNCTION engineering_core_prevent_delete_while_linked()
RETURNS TRIGGER AS $$
DECLARE
  object_type TEXT := TG_ARGV[0];
BEGIN
  IF EXISTS (
    SELECT 1 FROM engineering_object_links
     WHERE (from_type = object_type AND from_id = OLD.id)
        OR (to_type = object_type AND to_id = OLD.id)
  ) THEN
    RAISE EXCEPTION 'cannot delete % while object links exist; unlink first', object_type;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS engineering_requirements_prevent_linked_delete ON engineering_requirements;
CREATE TRIGGER engineering_requirements_prevent_linked_delete
  BEFORE DELETE ON engineering_requirements
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_delete_while_linked('requirement');

DROP TRIGGER IF EXISTS engineering_changes_prevent_linked_delete ON engineering_changes;
CREATE TRIGGER engineering_changes_prevent_linked_delete
  BEFORE DELETE ON engineering_changes
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_delete_while_linked('change');

DROP TRIGGER IF EXISTS engineering_impacts_prevent_linked_delete ON engineering_impacts;
CREATE TRIGGER engineering_impacts_prevent_linked_delete
  BEFORE DELETE ON engineering_impacts
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_delete_while_linked('impact');

DROP TRIGGER IF EXISTS engineering_configuration_baselines_prevent_linked_delete ON engineering_configuration_baselines;
CREATE TRIGGER engineering_configuration_baselines_prevent_linked_delete
  BEFORE DELETE ON engineering_configuration_baselines
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_delete_while_linked('configuration_baseline');

-- ─── Extend governed link resolve + endpoint visibility ──────────────────────

CREATE OR REPLACE FUNCTION engineering_object_link_resolve(p_type TEXT, p_id UUID)
RETURNS TABLE (tenant_id UUID, workspace_id UUID) AS $$
BEGIN
  CASE p_type
    WHEN 'decision' THEN
      RETURN QUERY SELECT d.tenant_id, d.workspace_id FROM engineering_decisions d WHERE d.id = p_id;
    WHEN 'assumption' THEN
      RETURN QUERY SELECT a.tenant_id, a.workspace_id FROM engineering_assumptions a WHERE a.id = p_id;
    WHEN 'document' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_documents x WHERE x.id = p_id;
    WHEN 'risk' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_risks x WHERE x.id = p_id;
    WHEN 'project' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_projects x WHERE x.id = p_id;
    WHEN 'asset' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_assets x WHERE x.id = p_id;
    WHEN 'alternative' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_decision_alternatives x WHERE x.id = p_id;
    WHEN 'review_package' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_review_packages x WHERE x.id = p_id;
    WHEN 'review_evidence' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_review_evidence x WHERE x.id = p_id;
    WHEN 'system' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_systems x WHERE x.id = p_id;
    WHEN 'interface' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_interfaces x WHERE x.id = p_id;
    WHEN 'requirement' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_requirements x WHERE x.id = p_id;
    WHEN 'change' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_changes x WHERE x.id = p_id;
    WHEN 'impact' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_impacts x WHERE x.id = p_id;
    WHEN 'configuration_baseline' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_configuration_baselines x WHERE x.id = p_id;
    ELSE
      RETURN;
  END CASE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION engineering_core_link_endpoint_allowed(p_type TEXT, p_id UUID)
RETURNS BOOLEAN AS $$
  SELECT CASE
    WHEN p_type IN (
      'decision', 'assumption', 'document', 'risk', 'project', 'asset',
      'alternative', 'review_package', 'review_evidence', 'system', 'interface',
      'requirement', 'change', 'impact', 'configuration_baseline'
    ) THEN EXISTS (
      SELECT 1
      FROM engineering_object_link_resolve(p_type, p_id) r
      WHERE engineering_core_workspace_member(r.workspace_id)
    )
    ELSE TRUE
  END;
$$ LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp;

-- ─── RLS (A2C/A3 workspace fail-closed) ──────────────────────────────────────

ALTER TABLE engineering_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_impacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_configuration_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_configuration_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY eng_requirements_select ON engineering_requirements FOR SELECT USING (
  tenant_id = ANY(get_user_tenant_ids())
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_requirements_insert ON engineering_requirements FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids())
  AND has_permission('engineering', 'execute', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_requirements_update ON engineering_requirements FOR UPDATE
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_requirements_delete ON engineering_requirements FOR DELETE USING (
  has_permission('engineering', 'admin', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);

CREATE POLICY eng_changes_select ON engineering_changes FOR SELECT USING (
  tenant_id = ANY(get_user_tenant_ids())
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_changes_insert ON engineering_changes FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids())
  AND has_permission('engineering', 'execute', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_changes_update ON engineering_changes FOR UPDATE
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_changes_delete ON engineering_changes FOR DELETE USING (
  has_permission('engineering', 'admin', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);

CREATE POLICY eng_impacts_select ON engineering_impacts FOR SELECT USING (
  tenant_id = ANY(get_user_tenant_ids())
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_impacts_insert ON engineering_impacts FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids())
  AND has_permission('engineering', 'execute', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_impacts_update ON engineering_impacts FOR UPDATE
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_impacts_delete ON engineering_impacts FOR DELETE USING (
  has_permission('engineering', 'admin', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);

CREATE POLICY eng_cfg_baselines_select ON engineering_configuration_baselines FOR SELECT USING (
  tenant_id = ANY(get_user_tenant_ids())
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_cfg_baselines_insert ON engineering_configuration_baselines FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids())
  AND has_permission('engineering', 'execute', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_cfg_baselines_update ON engineering_configuration_baselines FOR UPDATE
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_cfg_baselines_delete ON engineering_configuration_baselines FOR DELETE USING (
  has_permission('engineering', 'admin', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);

CREATE POLICY eng_cfg_items_select ON engineering_configuration_items FOR SELECT USING (
  tenant_id = ANY(get_user_tenant_ids())
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_cfg_items_insert ON engineering_configuration_items FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids())
  AND has_permission('engineering', 'execute', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_cfg_items_update ON engineering_configuration_items FOR UPDATE
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_cfg_items_delete ON engineering_configuration_items FOR DELETE USING (
  has_permission('engineering', 'admin', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_requirements TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_changes TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_impacts TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_configuration_baselines TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_configuration_items TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_configuration_baseline_immutable() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_configuration_item_immutable() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_core_prevent_delete_while_configuration_item() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_core_prevent_delete_while_linked() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_object_link_resolve(TEXT, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_core_link_endpoint_allowed(TEXT, UUID) TO anon, authenticated, service_role;
