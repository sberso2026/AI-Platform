-- EOS-A8D: Assurance governance, Review citations, evaluation completeness.
-- Additive after 20260930070000_eos_a8c_engineering_assurance_conditions.sql.
-- Does not create Findings, Issues, or a rule DSL.

ALTER TABLE engineering_assurance_conditions
  DROP CONSTRAINT IF EXISTS engineering_assurance_conditions_resolution_source_check;

ALTER TABLE engineering_assurance_conditions
  ADD CONSTRAINT engineering_assurance_conditions_resolution_source_check
  CHECK (
    resolution_source IS NULL OR resolution_source IN (
      'CANONICAL_STATE_CHANGED',
      'HUMAN_DISPOSITION',
      'SUPERSEDED_BY_RULE',
      'RULE_DISABLED'
    )
  );

CREATE TABLE IF NOT EXISTS engineering_assurance_rule_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  rule_id         TEXT NOT NULL,
  rule_version    TEXT NOT NULL,
  enabled         BOOLEAN NOT NULL,
  configured_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  configured_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, rule_id, rule_version)
);

CREATE INDEX IF NOT EXISTS idx_eng_assurance_rule_settings_ws
  ON engineering_assurance_rule_settings (tenant_id, workspace_id);

DROP TRIGGER IF EXISTS engineering_assurance_rule_settings_updated_at ON engineering_assurance_rule_settings;
CREATE TRIGGER engineering_assurance_rule_settings_updated_at
  BEFORE UPDATE ON engineering_assurance_rule_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_assurance_rule_settings_workspace_tenant ON engineering_assurance_rule_settings;
CREATE TRIGGER engineering_assurance_rule_settings_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_assurance_rule_settings
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_assurance_rule_settings IS
  'EOS-A8D governed enable/disable overrides for code-catalog Assurance rules. Version-aware. Not a rule authoring DSL.';

CREATE TABLE IF NOT EXISTS engineering_assurance_evaluation_runs (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id             UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  started_at               TIMESTAMPTZ NOT NULL,
  completed_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  triggered_by             UUID REFERENCES profiles(id) ON DELETE SET NULL,
  completeness             TEXT NOT NULL CHECK (completeness IN ('COMPLETE', 'PARTIAL', 'FAILED')),
  truncated                BOOLEAN NOT NULL DEFAULT FALSE,
  link_count               INTEGER NOT NULL DEFAULT 0,
  link_limit               INTEGER NOT NULL DEFAULT 2000,
  objects_evaluated        INTEGER NOT NULL DEFAULT 0,
  rules_evaluated          INTEGER NOT NULL DEFAULT 0,
  conditions_detected      INTEGER NOT NULL DEFAULT 0,
  conditions_resolved      INTEGER NOT NULL DEFAULT 0,
  conditions_created       INTEGER NOT NULL DEFAULT 0,
  remaining_scope_unknown  BOOLEAN NOT NULL DEFAULT FALSE,
  ruleset_fingerprint      TEXT NOT NULL DEFAULT '',
  failure_reason           TEXT,
  reason                   TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_assurance_eval_runs_ws
  ON engineering_assurance_evaluation_runs (tenant_id, workspace_id, completed_at DESC);

DROP TRIGGER IF EXISTS engineering_assurance_evaluation_runs_workspace_tenant ON engineering_assurance_evaluation_runs;
CREATE TRIGGER engineering_assurance_evaluation_runs_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_assurance_evaluation_runs
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_assurance_evaluation_runs IS
  'EOS-A8D evaluation completeness record. PARTIAL/FAILED must not be treated as conclusive zero conditions.';

CREATE TABLE IF NOT EXISTS engineering_assurance_review_citations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id       UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  condition_id       UUID NOT NULL REFERENCES engineering_assurance_conditions(id) ON DELETE CASCADE,
  review_package_id  UUID NOT NULL REFERENCES engineering_review_packages(id) ON DELETE CASCADE,
  created_by         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, condition_id, review_package_id)
);

CREATE INDEX IF NOT EXISTS idx_eng_assurance_citations_pkg
  ON engineering_assurance_review_citations (tenant_id, workspace_id, review_package_id);
CREATE INDEX IF NOT EXISTS idx_eng_assurance_citations_condition
  ON engineering_assurance_review_citations (tenant_id, workspace_id, condition_id);

DROP TRIGGER IF EXISTS engineering_assurance_review_citations_workspace_tenant ON engineering_assurance_review_citations;
CREATE TRIGGER engineering_assurance_review_citations_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_assurance_review_citations
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

CREATE OR REPLACE FUNCTION engineering_assurance_citation_same_scope()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  condition_tenant UUID;
  condition_ws UUID;
  package_tenant UUID;
  package_ws UUID;
BEGIN
  SELECT tenant_id, workspace_id INTO condition_tenant, condition_ws
  FROM engineering_assurance_conditions
  WHERE id = NEW.condition_id;
  IF condition_tenant IS NULL THEN
    RAISE EXCEPTION 'assurance_condition_not_found';
  END IF;
  IF condition_tenant <> NEW.tenant_id OR condition_ws <> NEW.workspace_id THEN
    RAISE EXCEPTION 'cross_workspace_review_link_denied';
  END IF;

  SELECT tenant_id, workspace_id INTO package_tenant, package_ws
  FROM engineering_review_packages
  WHERE id = NEW.review_package_id;
  IF package_tenant IS NULL THEN
    RAISE EXCEPTION 'review_package_not_found';
  END IF;
  IF package_tenant <> NEW.tenant_id THEN
    RAISE EXCEPTION 'cross_tenant_review_link_denied';
  END IF;
  IF package_ws <> NEW.workspace_id THEN
    RAISE EXCEPTION 'cross_workspace_review_link_denied';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS engineering_assurance_citation_same_scope ON engineering_assurance_review_citations;
CREATE TRIGGER engineering_assurance_citation_same_scope
  BEFORE INSERT OR UPDATE ON engineering_assurance_review_citations
  FOR EACH ROW EXECUTE FUNCTION engineering_assurance_citation_same_scope();

COMMENT ON TABLE engineering_assurance_review_citations IS
  'EOS-A8D governed citation from an Assurance Condition to a canonical Review Package. Does not create Findings.';

ALTER TABLE engineering_assurance_rule_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_assurance_evaluation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_assurance_review_citations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_assurance_rule_settings_select ON engineering_assurance_rule_settings;
DROP POLICY IF EXISTS eng_assurance_rule_settings_insert ON engineering_assurance_rule_settings;
DROP POLICY IF EXISTS eng_assurance_rule_settings_update ON engineering_assurance_rule_settings;
DROP POLICY IF EXISTS eng_assurance_rule_settings_delete ON engineering_assurance_rule_settings;

CREATE POLICY eng_assurance_rule_settings_select ON engineering_assurance_rule_settings
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_assurance_rule_settings_insert ON engineering_assurance_rule_settings
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_assurance_rule_settings_update ON engineering_assurance_rule_settings
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_assurance_rule_settings_delete ON engineering_assurance_rule_settings
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_assurance_eval_runs_select ON engineering_assurance_evaluation_runs;
DROP POLICY IF EXISTS eng_assurance_eval_runs_insert ON engineering_assurance_evaluation_runs;
DROP POLICY IF EXISTS eng_assurance_eval_runs_update ON engineering_assurance_evaluation_runs;
DROP POLICY IF EXISTS eng_assurance_eval_runs_delete ON engineering_assurance_evaluation_runs;

CREATE POLICY eng_assurance_eval_runs_select ON engineering_assurance_evaluation_runs
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_assurance_eval_runs_insert ON engineering_assurance_evaluation_runs
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_assurance_eval_runs_update ON engineering_assurance_evaluation_runs
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_assurance_eval_runs_delete ON engineering_assurance_evaluation_runs
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_assurance_citations_select ON engineering_assurance_review_citations;
DROP POLICY IF EXISTS eng_assurance_citations_insert ON engineering_assurance_review_citations;
DROP POLICY IF EXISTS eng_assurance_citations_update ON engineering_assurance_review_citations;
DROP POLICY IF EXISTS eng_assurance_citations_delete ON engineering_assurance_review_citations;

CREATE POLICY eng_assurance_citations_select ON engineering_assurance_review_citations
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_assurance_citations_insert ON engineering_assurance_review_citations
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_assurance_citations_update ON engineering_assurance_review_citations
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_assurance_citations_delete ON engineering_assurance_review_citations
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_assurance_rule_settings TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_assurance_evaluation_runs TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_assurance_review_citations TO anon, authenticated, service_role;
