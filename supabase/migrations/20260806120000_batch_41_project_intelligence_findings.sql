-- Phase 8E — Findings Intelligence schema identity
-- Findings Intelligence owns consolidated finding lifecycle records.
-- Document Intelligence retains project_intelligence_document_findings as source rows.
-- No competing Engineering Core register tables.

CREATE TABLE IF NOT EXISTS project_intelligence_findings (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  engineering_asset_id      UUID,
  source_type               TEXT NOT NULL,
  source_feature            TEXT NOT NULL,
  source_id                 TEXT NOT NULL,
  title                     TEXT NOT NULL,
  description               TEXT,
  status                    TEXT NOT NULL DEFAULT 'candidate',
  proposed_category         TEXT NOT NULL DEFAULT 'other',
  proposed_severity         TEXT NOT NULL DEFAULT 'medium',
  proposed_priority         TEXT,
  confirmed_category        TEXT,
  confirmed_severity        TEXT,
  confidence                NUMERIC(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  evidence                  JSONB NOT NULL DEFAULT '[]',
  citations                 JSONB NOT NULL DEFAULT '[]',
  duplicate_group_id        UUID,
  conflict_state            TEXT NOT NULL DEFAULT 'none',
  core_record_id            UUID,
  core_record_type          TEXT,
  idempotency_key           TEXT NOT NULL,
  trace_id                  TEXT NOT NULL,
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ,
  CONSTRAINT pi_findings_idem_uidx UNIQUE (idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_pi_findings_tenant_status
  ON project_intelligence_findings(tenant_id, workspace_id, status)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS project_intelligence_finding_events (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  finding_id                UUID NOT NULL REFERENCES project_intelligence_findings(id) ON DELETE CASCADE,
  event_type                TEXT NOT NULL,
  actor_user_id             UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_kind                TEXT NOT NULL DEFAULT 'human',
  previous_state            TEXT,
  new_state                 TEXT,
  reason                    TEXT,
  payload                   JSONB NOT NULL DEFAULT '{}',
  idempotency_key           TEXT NOT NULL,
  occurred_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pi_finding_events_idem_uidx UNIQUE (idempotency_key)
);

CREATE TABLE IF NOT EXISTS project_intelligence_finding_review_items (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  finding_id                UUID NOT NULL REFERENCES project_intelligence_findings(id) ON DELETE CASCADE,
  review_state              TEXT NOT NULL DEFAULT 'pending',
  assigned_to               UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_at                    TIMESTAMPTZ,
  escalation_state          TEXT NOT NULL DEFAULT 'none',
  reason_code               TEXT,
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS project_intelligence_finding_patterns (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  pattern_kind              TEXT NOT NULL,
  pattern_key               TEXT NOT NULL,
  contributing_finding_ids  JSONB NOT NULL DEFAULT '[]',
  confidence                NUMERIC(5,4),
  abstained                 BOOLEAN NOT NULL DEFAULT FALSE,
  human_acknowledged        BOOLEAN NOT NULL DEFAULT FALSE,
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE project_intelligence_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_finding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_finding_review_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_finding_patterns ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'project_intelligence_findings',
    'project_intelligence_finding_events',
    'project_intelligence_finding_review_items',
    'project_intelligence_finding_patterns'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid())
       )',
      tbl || '_select', tbl
    );
  END LOOP;
END $$;

COMMENT ON TABLE project_intelligence_findings IS
  'Phase 8E Findings Intelligence consolidated findings. Core registers remain Engineering Core owned.';
