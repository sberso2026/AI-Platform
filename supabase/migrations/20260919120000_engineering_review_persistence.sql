-- ERA-2 — Engineering Review AI persistence (additive)
--
-- Reference migrations (inspected before writing this file):
--   PRIMARY RLS: 20260712180000_batch_36_project_intelligence_documents.sql
--     tenant_id = ANY(get_user_tenant_ids()) AND workspace membership
--   EXPLICIT WRITES: 20260808140000_batch_75_digital_twin_core.sql (SELECT/INSERT/UPDATE)
--     plus 20260204000001_batch_205_register_rls.sql (execute INSERT/UPDATE, admin DELETE)
--   SELECT-ONLY PI FINDINGS (do not copy write-by-omission):
--     20260806120000_batch_41_project_intelligence_findings.sql
--   DO NOT COPY: 20260203000001_batch_20_engineering_rls.sql
--     engineering_documents / engineering_projects are tenant-only (weaker).
--   Helpers: 20260101000001_rls_policies.sql (get_user_tenant_ids, has_permission)
--   Core FKs: 20260203000000_batch_20_engineering_tables.sql
--   Audit sink: 20260101000000_platform_core.sql (audit_events) — not a competing subsystem
--
-- No existing tables are dropped, renamed, or have RLS weakened.
-- Core engineering_projects / engineering_documents RLS is unchanged (tenant-only
-- issue recorded for later hardening — not in scope of ERA-2).

-- ─── Helpers ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION engineering_review_workspace_allowed(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
  SELECT p_workspace_id IS NOT NULL AND EXISTS (
    SELECT 1
    FROM workspace_memberships
    WHERE user_id = auth.uid()
      AND workspace_id = p_workspace_id
  );
$$ LANGUAGE sql STABLE
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION engineering_review_prevent_ownership_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
     OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id
     OR NEW.project_id IS DISTINCT FROM OLD.project_id THEN
    RAISE EXCEPTION 'engineering review ownership (tenant_id, workspace_id, project_id) is immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION engineering_review_assert_workspace_project()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.workspace_id IS NULL THEN
    RAISE EXCEPTION 'engineering review workspace_id is required';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM workspaces w
    WHERE w.id = NEW.workspace_id AND w.tenant_id = NEW.tenant_id
  ) THEN
    RAISE EXCEPTION 'engineering review workspace does not belong to tenant';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM engineering_projects p
    WHERE p.id = NEW.project_id
      AND p.tenant_id = NEW.tenant_id
      AND (p.workspace_id IS NULL OR p.workspace_id = NEW.workspace_id)
  ) THEN
    RAISE EXCEPTION 'engineering review project does not belong to tenant/workspace';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION engineering_review_assert_document_ownership()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.document_id IS NULL THEN
    RAISE EXCEPTION 'engineering review evidence requires document_id';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM engineering_documents d
    WHERE d.id = NEW.document_id
      AND d.tenant_id = NEW.tenant_id
      AND d.workspace_id IS NOT NULL
      AND d.workspace_id = NEW.workspace_id
      AND d.engineering_project_id IS NOT NULL
      AND d.engineering_project_id = NEW.project_id
  ) THEN
    RAISE EXCEPTION 'engineering review evidence document ownership mismatch (tenant/workspace/project)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION engineering_review_validate_package_documents()
RETURNS TRIGGER AS $$
DECLARE
  elem JSONB;
BEGIN
  IF jsonb_typeof(NEW.documents) <> 'array' THEN
    RAISE EXCEPTION 'engineering_review_packages.documents must be a JSON array';
  END IF;
  FOR elem IN SELECT value FROM jsonb_array_elements(NEW.documents)
  LOOP
    IF COALESCE(elem->>'document_id', '') = '' THEN
      RAISE EXCEPTION 'package document requires document_id';
    END IF;
    IF COALESCE(elem->>'revision', '') = '' THEN
      RAISE EXCEPTION 'package document requires revision';
    END IF;
    IF COALESCE(elem->>'role', '') NOT IN ('specification', 'drawing', 'calculation', 'basis', 'other') THEN
      RAISE EXCEPTION 'invalid package document role';
    END IF;
    IF COALESCE(elem->>'inclusion', 'current') NOT IN ('current', 'superseded') THEN
      RAISE EXCEPTION 'invalid package document inclusion';
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION engineering_review_dispositions_append_only()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'engineering_review_dispositions is append-only';
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION engineering_review_findings_protect_provenance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.review_package_id IS DISTINCT FROM OLD.review_package_id
     OR NEW.review_run_id IS DISTINCT FROM OLD.review_run_id
     OR NEW.provenance IS DISTINCT FROM OLD.provenance THEN
    RAISE EXCEPTION 'engineering review finding provenance is immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

-- ─── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE engineering_review_packages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id    UUID NOT NULL REFERENCES engineering_projects(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'ready', 'in_review', 'completed', 'archived'
  )),
  documents     JSONB NOT NULL DEFAULT '[]',
  created_by    TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id, tenant_id, workspace_id, project_id)
);

CREATE INDEX idx_er_packages_tenant_workspace ON engineering_review_packages(tenant_id, workspace_id);
CREATE INDEX idx_er_packages_project ON engineering_review_packages(tenant_id, workspace_id, project_id);

CREATE TRIGGER engineering_review_packages_updated_at
  BEFORE UPDATE ON engineering_review_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER engineering_review_packages_ownership_immutable
  BEFORE UPDATE ON engineering_review_packages
  FOR EACH ROW EXECUTE FUNCTION engineering_review_prevent_ownership_mutation();
CREATE TRIGGER engineering_review_packages_assert_owners
  BEFORE INSERT OR UPDATE ON engineering_review_packages
  FOR EACH ROW EXECUTE FUNCTION engineering_review_assert_workspace_project();
CREATE TRIGGER engineering_review_packages_validate_documents
  BEFORE INSERT OR UPDATE ON engineering_review_packages
  FOR EACH ROW EXECUTE FUNCTION engineering_review_validate_package_documents();

CREATE TABLE engineering_review_runs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_package_id   UUID NOT NULL,
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id          UUID NOT NULL REFERENCES engineering_projects(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'running', 'completed', 'failed', 'cancelled'
  )),
  scope               JSONB NOT NULL,
  input_documents     JSONB NOT NULL DEFAULT '[]',
  rules               JSONB NOT NULL DEFAULT '[]',
  provenance          JSONB NOT NULL,
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id, tenant_id, workspace_id, project_id),
  FOREIGN KEY (review_package_id, tenant_id, workspace_id, project_id)
    REFERENCES engineering_review_packages (id, tenant_id, workspace_id, project_id)
    ON DELETE CASCADE
);

CREATE INDEX idx_er_runs_package ON engineering_review_runs(review_package_id);
CREATE INDEX idx_er_runs_tenant_workspace ON engineering_review_runs(tenant_id, workspace_id, project_id);

CREATE TRIGGER engineering_review_runs_updated_at
  BEFORE UPDATE ON engineering_review_runs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER engineering_review_runs_ownership_immutable
  BEFORE UPDATE ON engineering_review_runs
  FOR EACH ROW EXECUTE FUNCTION engineering_review_prevent_ownership_mutation();
CREATE TRIGGER engineering_review_runs_assert_owners
  BEFORE INSERT OR UPDATE ON engineering_review_runs
  FOR EACH ROW EXECUTE FUNCTION engineering_review_assert_workspace_project();

CREATE TABLE engineering_review_findings (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_package_id       UUID NOT NULL,
  review_run_id           UUID NOT NULL,
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id              UUID NOT NULL REFERENCES engineering_projects(id) ON DELETE CASCADE,
  discipline              TEXT,
  category                TEXT NOT NULL CHECK (category IN (
    'cross_document_inconsistency',
    'missing_information',
    'requirement_traceability_gap',
    'unsupported_assumption',
    'revision_inconsistency',
    'missing_engineering_evidence',
    'other_observation'
  )),
  title                   TEXT NOT NULL,
  description             TEXT NOT NULL,
  severity                TEXT NOT NULL CHECK (severity IN (
    'informational', 'minor', 'moderate', 'major', 'critical'
  )),
  confidence_band         TEXT NOT NULL CHECK (confidence_band IN ('low', 'medium', 'high')),
  confidence_score        NUMERIC(5,4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  requirement_references  JSONB NOT NULL DEFAULT '[]',
  reasoning_summary       TEXT NOT NULL,
  reasoning_basis         TEXT NOT NULL CHECK (reasoning_basis IN (
    'EVIDENCE_BASED', 'DERIVED', 'ASSUMED', 'INSUFFICIENT_EVIDENCE', 'CONFLICTING'
  )),
  recommended_action      TEXT NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'candidate' CHECK (status IN (
    'candidate', 'awaiting_engineer', 'assigned', 'modified', 'accepted', 'rejected', 'closed'
  )),
  verification_state      TEXT NOT NULL CHECK (verification_state IN (
    'unverified', 'evidence_verified', 'insufficient_evidence', 'revoked'
  )),
  human_disposition_id    TEXT,
  provenance              JSONB NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id, tenant_id, workspace_id, project_id),
  FOREIGN KEY (review_run_id, tenant_id, workspace_id, project_id)
    REFERENCES engineering_review_runs (id, tenant_id, workspace_id, project_id)
    ON DELETE CASCADE,
  FOREIGN KEY (review_package_id, tenant_id, workspace_id, project_id)
    REFERENCES engineering_review_packages (id, tenant_id, workspace_id, project_id)
    ON DELETE CASCADE
);

CREATE INDEX idx_er_findings_run ON engineering_review_findings(review_run_id);
CREATE INDEX idx_er_findings_tenant_workspace ON engineering_review_findings(tenant_id, workspace_id, project_id);
CREATE INDEX idx_er_findings_status ON engineering_review_findings(tenant_id, workspace_id, status);

CREATE TRIGGER engineering_review_findings_updated_at
  BEFORE UPDATE ON engineering_review_findings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER engineering_review_findings_ownership_immutable
  BEFORE UPDATE ON engineering_review_findings
  FOR EACH ROW EXECUTE FUNCTION engineering_review_prevent_ownership_mutation();
CREATE TRIGGER engineering_review_findings_assert_owners
  BEFORE INSERT OR UPDATE ON engineering_review_findings
  FOR EACH ROW EXECUTE FUNCTION engineering_review_assert_workspace_project();
CREATE TRIGGER engineering_review_findings_protect_provenance
  BEFORE UPDATE ON engineering_review_findings
  FOR EACH ROW EXECUTE FUNCTION engineering_review_findings_protect_provenance();

CREATE TABLE engineering_review_evidence (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id            UUID NOT NULL,
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id          UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id            UUID NOT NULL REFERENCES engineering_projects(id) ON DELETE CASCADE,
  document_id           UUID NOT NULL REFERENCES engineering_documents(id) ON DELETE RESTRICT,
  revision              TEXT,
  page                  INTEGER CHECK (page IS NULL OR page >= 1),
  section               TEXT,
  chunk_id              TEXT,
  span                  TEXT,
  retrieval_id          TEXT,
  source_type           TEXT NOT NULL CHECK (source_type IN (
    'extracted_text', 'structured_field', 'document_revision',
    'requirement_statement', 'declared_assumption'
  )),
  verification_state    TEXT NOT NULL CHECK (verification_state IN (
    'unverified', 'verified', 'insufficient', 'revoked'
  )),
  content_hash          TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id, tenant_id, workspace_id, project_id),
  FOREIGN KEY (finding_id, tenant_id, workspace_id, project_id)
    REFERENCES engineering_review_findings (id, tenant_id, workspace_id, project_id)
    ON DELETE CASCADE
);

CREATE INDEX idx_er_evidence_finding ON engineering_review_evidence(finding_id);
CREATE INDEX idx_er_evidence_document ON engineering_review_evidence(document_id);
CREATE INDEX idx_er_evidence_tenant_workspace ON engineering_review_evidence(tenant_id, workspace_id, project_id);

CREATE TRIGGER engineering_review_evidence_updated_at
  BEFORE UPDATE ON engineering_review_evidence FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER engineering_review_evidence_ownership_immutable
  BEFORE UPDATE ON engineering_review_evidence
  FOR EACH ROW EXECUTE FUNCTION engineering_review_prevent_ownership_mutation();
CREATE TRIGGER engineering_review_evidence_assert_owners
  BEFORE INSERT OR UPDATE ON engineering_review_evidence
  FOR EACH ROW EXECUTE FUNCTION engineering_review_assert_workspace_project();
CREATE TRIGGER engineering_review_evidence_assert_document
  BEFORE INSERT OR UPDATE ON engineering_review_evidence
  FOR EACH ROW EXECUTE FUNCTION engineering_review_assert_document_ownership();

CREATE TABLE engineering_review_dispositions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id        UUID NOT NULL,
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id        UUID NOT NULL REFERENCES engineering_projects(id) ON DELETE CASCADE,
  action            TEXT NOT NULL CHECK (action IN (
    'assign', 'accept', 'reject', 'modify', 'close', 'reopen'
  )),
  previous_status   TEXT NOT NULL CHECK (previous_status IN (
    'candidate', 'awaiting_engineer', 'assigned', 'modified', 'accepted', 'rejected', 'closed'
  )),
  new_status        TEXT NOT NULL CHECK (new_status IN (
    'candidate', 'awaiting_engineer', 'assigned', 'modified', 'accepted', 'rejected', 'closed'
  )),
  actor_id          TEXT NOT NULL CHECK (length(trim(actor_id)) > 0),
  actor_kind        TEXT NOT NULL CHECK (actor_kind = 'human'),
  reason            TEXT,
  assigned_to       TEXT,
  occurred_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (finding_id, tenant_id, workspace_id, project_id)
    REFERENCES engineering_review_findings (id, tenant_id, workspace_id, project_id)
    ON DELETE CASCADE
);

CREATE INDEX idx_er_dispositions_finding ON engineering_review_dispositions(finding_id, occurred_at);
CREATE INDEX idx_er_dispositions_tenant_workspace ON engineering_review_dispositions(tenant_id, workspace_id, project_id);

CREATE TRIGGER engineering_review_dispositions_ownership_immutable
  BEFORE UPDATE ON engineering_review_dispositions
  FOR EACH ROW EXECUTE FUNCTION engineering_review_prevent_ownership_mutation();
CREATE TRIGGER engineering_review_dispositions_assert_owners
  BEFORE INSERT OR UPDATE ON engineering_review_dispositions
  FOR EACH ROW EXECUTE FUNCTION engineering_review_assert_workspace_project();
CREATE TRIGGER engineering_review_dispositions_no_update
  BEFORE UPDATE ON engineering_review_dispositions
  FOR EACH ROW EXECUTE FUNCTION engineering_review_dispositions_append_only();
CREATE TRIGGER engineering_review_dispositions_no_delete
  BEFORE DELETE ON engineering_review_dispositions
  FOR EACH ROW EXECUTE FUNCTION engineering_review_dispositions_append_only();

-- ─── RLS (fail closed) ───────────────────────────────────────────────────────
-- Authenticated access requires tenant membership AND workspace membership.
-- Writes additionally require engineering execute (INSERT/UPDATE) or admin (DELETE).
-- Dispositions are append-only: INSERT allowed, UPDATE/DELETE denied.
-- Service role bypasses RLS (Supabase convention); triggers still enforce ownership.

ALTER TABLE engineering_review_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_review_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_review_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_review_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_review_dispositions ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'engineering_review_packages',
    'engineering_review_runs',
    'engineering_review_findings',
    'engineering_review_evidence',
    'engineering_review_dispositions'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND engineering_review_workspace_allowed(workspace_id)
       )',
      tbl || '_select', tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR INSERT WITH CHECK (
         tenant_id = ANY(get_user_tenant_ids())
         AND engineering_review_workspace_allowed(workspace_id)
         AND has_permission(''engineering'', ''execute'', tenant_id)
       )',
      tbl || '_insert', tbl
    );
  END LOOP;
END $$;

-- Mutable aggregates: UPDATE uses tenant+workspace+execute on both USING and WITH CHECK.
CREATE POLICY engineering_review_packages_update ON engineering_review_packages
  FOR UPDATE
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND engineering_review_workspace_allowed(workspace_id)
    AND has_permission('engineering', 'execute', tenant_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND engineering_review_workspace_allowed(workspace_id)
    AND has_permission('engineering', 'execute', tenant_id)
  );

CREATE POLICY engineering_review_runs_update ON engineering_review_runs
  FOR UPDATE
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND engineering_review_workspace_allowed(workspace_id)
    AND has_permission('engineering', 'execute', tenant_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND engineering_review_workspace_allowed(workspace_id)
    AND has_permission('engineering', 'execute', tenant_id)
  );

CREATE POLICY engineering_review_findings_update ON engineering_review_findings
  FOR UPDATE
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND engineering_review_workspace_allowed(workspace_id)
    AND has_permission('engineering', 'execute', tenant_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND engineering_review_workspace_allowed(workspace_id)
    AND has_permission('engineering', 'execute', tenant_id)
  );

CREATE POLICY engineering_review_evidence_update ON engineering_review_evidence
  FOR UPDATE
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND engineering_review_workspace_allowed(workspace_id)
    AND has_permission('engineering', 'execute', tenant_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND engineering_review_workspace_allowed(workspace_id)
    AND has_permission('engineering', 'execute', tenant_id)
  );

-- Dispositions: history is not overwritten. Explicit deny for UPDATE/DELETE.
CREATE POLICY engineering_review_dispositions_update ON engineering_review_dispositions
  FOR UPDATE USING (false) WITH CHECK (false);

CREATE POLICY engineering_review_packages_delete ON engineering_review_packages
  FOR DELETE USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND engineering_review_workspace_allowed(workspace_id)
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY engineering_review_runs_delete ON engineering_review_runs
  FOR DELETE USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND engineering_review_workspace_allowed(workspace_id)
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY engineering_review_findings_delete ON engineering_review_findings
  FOR DELETE USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND engineering_review_workspace_allowed(workspace_id)
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY engineering_review_evidence_delete ON engineering_review_evidence
  FOR DELETE USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND engineering_review_workspace_allowed(workspace_id)
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY engineering_review_dispositions_delete ON engineering_review_dispositions
  FOR DELETE USING (false);

GRANT SELECT ON engineering_review_packages, engineering_review_runs, engineering_review_findings,
  engineering_review_evidence, engineering_review_dispositions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON engineering_review_packages, engineering_review_runs,
  engineering_review_findings, engineering_review_evidence, engineering_review_dispositions TO authenticated;
GRANT ALL ON engineering_review_packages, engineering_review_runs, engineering_review_findings,
  engineering_review_evidence, engineering_review_dispositions TO service_role;

COMMENT ON TABLE engineering_review_packages IS
  'ERA-2 Review Package aggregate. Documents are ID/revision/role snapshots, not duplicated file bytes. Canonical files remain engineering_documents.';
COMMENT ON TABLE engineering_review_runs IS
  'ERA-2 Review Run. Provenance (engine/rules/model) is stored; live LLM is out of scope.';
COMMENT ON TABLE engineering_review_findings IS
  'ERA-2 Review Finding. Not stored in project_intelligence_findings.';
COMMENT ON TABLE engineering_review_evidence IS
  'ERA-2 frozen citations. document_id references engineering_documents; tenant/workspace/project must match.';
COMMENT ON TABLE engineering_review_dispositions IS
  'ERA-2 append-only human disposition history. AI cannot insert (actor_kind CHECK = human).';
