-- EOS-3-DOMAIN-4 Decision & Assumption lineage.
-- Additive structured records linked by stable_id to canonical objects.
-- Does not duplicate Decision/Assumption object families or graph lineage stores.
-- Rollback: DROP TABLE eos3_decision_records, eos3_assumption_records;

CREATE TABLE IF NOT EXISTS eos3_decision_records (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id                  TEXT NOT NULL,
  tenant_id                  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id               UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                 TEXT NOT NULL,
  work_package_stable_id     TEXT,
  asset_system_stable_ids    JSONB NOT NULL DEFAULT '[]'::jsonb,
  title                      TEXT NOT NULL,
  question                   TEXT NOT NULL,
  decision_type              TEXT NOT NULL DEFAULT 'ENGINEERING_DECISION',
  problem_context            TEXT NOT NULL DEFAULT '',
  options                    JSONB NOT NULL DEFAULT '[]'::jsonb,
  criteria                   JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendation             TEXT,
  selected_option_id         TEXT,
  rationale                  TEXT,
  assumption_stable_ids      JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_stable_ids        JSONB NOT NULL DEFAULT '[]'::jsonb,
  calculation_stable_ids     JSONB NOT NULL DEFAULT '[]'::jsonb,
  responsible_engineer       TEXT,
  decision_authority         TEXT,
  decision_authority_role    TEXT,
  decision_date              TIMESTAMPTZ,
  conditions                 JSONB NOT NULL DEFAULT '[]'::jsonb,
  status                     TEXT NOT NULL DEFAULT 'PROPOSED'
                             CHECK (status IN (
                               'PROPOSED','UNDER_REVIEW','DECISION_REQUIRED','DECIDED',
                               'REJECTED','SUPERSEDED','REASSESSMENT_REQUIRED','CLOSED'
                             )),
  revision                   INTEGER NOT NULL DEFAULT 1,
  revision_label             TEXT NOT NULL DEFAULT 'Rev 1',
  superseded_decision_id     UUID,
  supersedes_decision_id     UUID,
  human_decision_event       JSONB,
  provenance                 JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, project_id, stable_id, revision)
);

CREATE INDEX IF NOT EXISTS idx_eos3_dec_ws_project
  ON eos3_decision_records (tenant_id, workspace_id, project_id);

ALTER TABLE eos3_decision_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_dec_select ON eos3_decision_records;
CREATE POLICY eos3_dec_select ON eos3_decision_records
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_dec_write ON eos3_decision_records;
CREATE POLICY eos3_dec_write ON eos3_decision_records
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_assumption_records (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id                    TEXT NOT NULL,
  tenant_id                    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                 UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                   TEXT NOT NULL,
  work_package_stable_id       TEXT,
  asset_system_stable_ids      JSONB NOT NULL DEFAULT '[]'::jsonb,
  statement                    TEXT NOT NULL,
  assumption_type              TEXT,
  value                        TEXT,
  units                        TEXT,
  basis                        TEXT NOT NULL DEFAULT '',
  source_evidence_stable_ids   JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence                   TEXT NOT NULL DEFAULT 'unknown',
  materiality                  TEXT NOT NULL DEFAULT 'UNKNOWN',
  owner                        TEXT,
  verification_responsibility  TEXT,
  verification_requirement     TEXT,
  status                       TEXT NOT NULL DEFAULT 'PROPOSED'
                               CHECK (status IN (
                                 'PROPOSED','ACTIVE','UNVERIFIED','VERIFIED',
                                 'SUPERSEDED','INVALIDATED','RETIRED'
                               )),
  revision                     INTEGER NOT NULL DEFAULT 1,
  revision_label               TEXT NOT NULL DEFAULT 'Rev 1',
  prior_revision_id            UUID,
  superseded_assumption_id     UUID,
  supersedes_assumption_id     UUID,
  evidence_classification      TEXT NOT NULL DEFAULT 'ASSUMPTION'
                               CHECK (evidence_classification = 'ASSUMPTION'),
  provenance                   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, project_id, stable_id, revision)
);

CREATE INDEX IF NOT EXISTS idx_eos3_asm_ws_project
  ON eos3_assumption_records (tenant_id, workspace_id, project_id);

ALTER TABLE eos3_assumption_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_asm_select ON eos3_assumption_records;
CREATE POLICY eos3_asm_select ON eos3_assumption_records
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_asm_write ON eos3_assumption_records;
CREATE POLICY eos3_asm_write ON eos3_assumption_records
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

COMMENT ON TABLE eos3_decision_records IS
  'DOMAIN-4 Decision records. Lineage via relationship graph. Human authority required for finalization.';
COMMENT ON TABLE eos3_assumption_records IS
  'DOMAIN-4 Assumption records. evidence_classification remains ASSUMPTION (never FACT). Not an orchestration anchor.';
