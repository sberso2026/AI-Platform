-- RTB AI Platform Batch 38 — Project Intelligence Meeting Intelligence foundation (Phase 6C-3B)
-- Meetings is a Project Intelligence feature (application project_intelligence, feature meetings).
-- Do not create a separate project-intelligence-meetings commercial application.
-- Manual provider only for certification; Teams/Zoom/Google Meet remain unavailable.
-- No Engineering Core writes in this batch. Document Intelligence baseline dfcf6a1 unchanged.

CREATE OR REPLACE FUNCTION prevent_pi_meeting_identity_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
     OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id
     OR NEW.meeting_session_id IS DISTINCT FROM OLD.meeting_session_id THEN
    RAISE EXCEPTION 'tenant_id, workspace_id, and meeting_session_id are immutable after insert';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION prevent_pi_transcript_segment_identity_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
     OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id
     OR NEW.meeting_session_id IS DISTINCT FROM OLD.meeting_session_id
     OR NEW.engineering_project_id IS DISTINCT FROM OLD.engineering_project_id THEN
    RAISE EXCEPTION 'tenant_id, workspace_id, meeting_session_id, and engineering_project_id are immutable after insert';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION prevent_pi_meeting_session_identity_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
     OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id THEN
    RAISE EXCEPTION 'tenant_id and workspace_id are immutable after insert';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

CREATE TABLE project_intelligence_meeting_sessions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id      UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  title                       TEXT NOT NULL,
  description                 TEXT,
  agenda                      TEXT,
  provider                    TEXT NOT NULL DEFAULT 'manual' CHECK (provider IN (
    'manual', 'microsoft_teams', 'zoom', 'google_meet'
  )),
  provider_meeting_id         TEXT,
  provider_join_url           TEXT,
  status                      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'scheduled', 'connecting', 'connected', 'recording', 'transcribing',
    'live', 'paused', 'ended', 'processing', 'minutes_draft', 'review_pending',
    'approved', 'completed', 'failed', 'cancelled', 'archived'
  )),
  state_version               INTEGER NOT NULL DEFAULT 1 CHECK (state_version >= 1),
  scheduled_start_at          TIMESTAMPTZ,
  scheduled_end_at            TIMESTAMPTZ,
  actual_start_at             TIMESTAMPTZ,
  actual_end_at               TIMESTAMPTZ,
  timezone                    TEXT,
  organizer_user_id           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by                  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by                  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  recording_notice_required   TEXT NOT NULL DEFAULT 'unknown' CHECK (recording_notice_required IN (
    'required', 'not_required', 'unknown'
  )),
  recording_notice_text       TEXT,
  consent_policy              TEXT,
  consent_status              TEXT NOT NULL DEFAULT 'not_requested' CHECK (consent_status IN (
    'not_requested', 'pending', 'granted', 'declined', 'withdrawn', 'not_applicable'
  )),
  jurisdiction                TEXT,
  retention_policy_id         TEXT,
  legal_hold                  BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_classification      TEXT NOT NULL DEFAULT 'internal' CHECK (privacy_classification IN (
    'public', 'internal', 'confidential', 'restricted'
  )),
  metadata                    JSONB NOT NULL DEFAULT '{}'::jsonb,
  correlation_id              TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at                 TIMESTAMPTZ,
  CONSTRAINT pi_meeting_sessions_schedule_chk CHECK (
    scheduled_end_at IS NULL OR scheduled_start_at IS NULL OR scheduled_end_at >= scheduled_start_at
  )
);

CREATE INDEX idx_pi_meeting_sessions_tenant_ws ON project_intelligence_meeting_sessions(tenant_id, workspace_id);
CREATE INDEX idx_pi_meeting_sessions_status ON project_intelligence_meeting_sessions(tenant_id, status);
CREATE INDEX idx_pi_meeting_sessions_project ON project_intelligence_meeting_sessions(engineering_project_id);

CREATE TRIGGER trg_pi_meeting_sessions_updated_at
  BEFORE UPDATE ON project_intelligence_meeting_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_pi_meeting_sessions_identity
  BEFORE UPDATE ON project_intelligence_meeting_sessions
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_meeting_session_identity_mutation();

CREATE TABLE project_intelligence_meeting_participants (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  meeting_session_id        UUID NOT NULL REFERENCES project_intelligence_meeting_sessions(id) ON DELETE CASCADE,
  user_id                   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  external_participant_id   TEXT,
  display_name              TEXT NOT NULL,
  email                     TEXT,
  role                      TEXT NOT NULL DEFAULT 'attendee',
  speaker_id                TEXT,
  attendance_status         TEXT NOT NULL DEFAULT 'invited',
  consent_status            TEXT NOT NULL DEFAULT 'not_requested' CHECK (consent_status IN (
    'not_requested', 'pending', 'granted', 'declined', 'withdrawn', 'not_applicable'
  )),
  joined_at                 TIMESTAMPTZ,
  left_at                   TIMESTAMPTZ,
  source                    TEXT NOT NULL DEFAULT 'manual',
  metadata                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pi_meeting_participants_external_uidx UNIQUE (meeting_session_id, external_participant_id)
);

CREATE INDEX idx_pi_meeting_participants_session ON project_intelligence_meeting_participants(meeting_session_id);

CREATE TRIGGER trg_pi_meeting_participants_updated_at
  BEFORE UPDATE ON project_intelligence_meeting_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_pi_meeting_participants_identity
  BEFORE UPDATE ON project_intelligence_meeting_participants
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_meeting_identity_mutation();

CREATE TABLE project_intelligence_transcript_segments (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  meeting_session_id        UUID NOT NULL REFERENCES project_intelligence_meeting_sessions(id) ON DELETE CASCADE,
  provider_event_id         TEXT NOT NULL,
  speaker_id                TEXT,
  speaker_label             TEXT,
  sequence_number           INTEGER NOT NULL CHECK (sequence_number >= 0),
  start_time_ms             INTEGER NOT NULL DEFAULT 0 CHECK (start_time_ms >= 0),
  end_time_ms               INTEGER NOT NULL DEFAULT 0 CHECK (end_time_ms >= 0),
  text                      TEXT NOT NULL,
  confidence                NUMERIC(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  language                  TEXT,
  revision_number           INTEGER NOT NULL DEFAULT 1 CHECK (revision_number >= 1),
  source                    TEXT NOT NULL DEFAULT 'manual',
  status                    TEXT NOT NULL DEFAULT 'active',
  correlation_id            TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pi_transcript_segments_time_chk CHECK (end_time_ms >= start_time_ms),
  CONSTRAINT pi_transcript_segments_provider_uidx UNIQUE (meeting_session_id, provider_event_id),
  CONSTRAINT pi_transcript_segments_seq_rev_uidx UNIQUE (meeting_session_id, sequence_number, revision_number)
);

CREATE INDEX idx_pi_transcript_segments_session_seq ON project_intelligence_transcript_segments(meeting_session_id, sequence_number);

CREATE TRIGGER trg_pi_transcript_segments_updated_at
  BEFORE UPDATE ON project_intelligence_transcript_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_pi_transcript_segments_identity
  BEFORE UPDATE ON project_intelligence_transcript_segments
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_transcript_segment_identity_mutation();

CREATE TABLE project_intelligence_transcript_revisions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  meeting_session_id        UUID NOT NULL REFERENCES project_intelligence_meeting_sessions(id) ON DELETE CASCADE,
  transcript_segment_id     UUID NOT NULL REFERENCES project_intelligence_transcript_segments(id) ON DELETE CASCADE,
  revision_number           INTEGER NOT NULL CHECK (revision_number >= 1),
  previous_text             TEXT NOT NULL,
  revised_text              TEXT NOT NULL,
  revision_reason           TEXT,
  revised_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  correlation_id            TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pi_transcript_revisions_uidx UNIQUE (transcript_segment_id, revision_number)
);

CREATE TRIGGER trg_pi_transcript_revisions_identity
  BEFORE UPDATE ON project_intelligence_transcript_revisions
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_meeting_identity_mutation();

CREATE TABLE project_intelligence_meeting_events (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  meeting_session_id        UUID NOT NULL REFERENCES project_intelligence_meeting_sessions(id) ON DELETE CASCADE,
  event_type                TEXT NOT NULL,
  event_source              TEXT NOT NULL DEFAULT 'system',
  provider_event_id         TEXT,
  actor_user_id             UUID REFERENCES profiles(id) ON DELETE SET NULL,
  previous_state            TEXT,
  new_state                 TEXT,
  payload                   JSONB NOT NULL DEFAULT '{}'::jsonb,
  correlation_id            TEXT,
  occurred_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pi_meeting_events_provider_uidx UNIQUE (meeting_session_id, provider_event_id)
);

CREATE INDEX idx_pi_meeting_events_session ON project_intelligence_meeting_events(meeting_session_id, occurred_at);

-- Future-phase tables (ownership + RLS fully defined; unused by 6C-3B user flows)

CREATE TABLE project_intelligence_meeting_processing_runs (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  meeting_session_id        UUID NOT NULL REFERENCES project_intelligence_meeting_sessions(id) ON DELETE CASCADE,
  status                    TEXT NOT NULL DEFAULT 'queued',
  started_at                TIMESTAMPTZ,
  completed_at              TIMESTAMPTZ,
  metadata                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  correlation_id            TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_intelligence_meeting_proposals (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  meeting_session_id        UUID NOT NULL REFERENCES project_intelligence_meeting_sessions(id) ON DELETE CASCADE,
  proposal_type             TEXT NOT NULL CHECK (proposal_type IN (
    'decision', 'action', 'risk', 'issue', 'technical_query', 'lesson_learned', 'finding'
  )),
  review_state              TEXT NOT NULL DEFAULT 'pending',
  payload                   JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence                NUMERIC(5,4),
  provider                  TEXT,
  model                     TEXT,
  prompt_version            TEXT,
  trace_id                  TEXT,
  correlation_id            TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_intelligence_meeting_review_items (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  meeting_session_id        UUID NOT NULL REFERENCES project_intelligence_meeting_sessions(id) ON DELETE CASCADE,
  proposal_id               UUID REFERENCES project_intelligence_meeting_proposals(id) ON DELETE SET NULL,
  status                    TEXT NOT NULL DEFAULT 'pending',
  reviewer_user_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  decision                  TEXT,
  notes                     TEXT,
  core_record_id            UUID,
  correlation_id            TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_intelligence_meeting_minutes (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  meeting_session_id        UUID NOT NULL REFERENCES project_intelligence_meeting_sessions(id) ON DELETE CASCADE,
  status                    TEXT NOT NULL DEFAULT 'draft',
  current_version           INTEGER NOT NULL DEFAULT 1,
  correlation_id            TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pi_meeting_minutes_session_uidx UNIQUE (meeting_session_id)
);

CREATE TABLE project_intelligence_meeting_minutes_versions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  meeting_session_id        UUID NOT NULL REFERENCES project_intelligence_meeting_sessions(id) ON DELETE CASCADE,
  minutes_id                UUID NOT NULL REFERENCES project_intelligence_meeting_minutes(id) ON DELETE CASCADE,
  version_number            INTEGER NOT NULL CHECK (version_number >= 1),
  body_markdown             TEXT NOT NULL DEFAULT '',
  body_json                 JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  correlation_id            TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pi_meeting_minutes_versions_uidx UNIQUE (minutes_id, version_number)
);

CREATE TABLE project_intelligence_meeting_evidence (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  meeting_session_id        UUID NOT NULL REFERENCES project_intelligence_meeting_sessions(id) ON DELETE CASCADE,
  evidence_type             TEXT NOT NULL,
  transcript_segment_id     UUID REFERENCES project_intelligence_transcript_segments(id) ON DELETE SET NULL,
  document_citation         JSONB,
  payload                   JSONB NOT NULL DEFAULT '{}'::jsonb,
  correlation_id            TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_intelligence_meeting_jobs (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  meeting_session_id        UUID REFERENCES project_intelligence_meeting_sessions(id) ON DELETE CASCADE,
  job_type                  TEXT NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'queued',
  attempt_count             INTEGER NOT NULL DEFAULT 0,
  max_attempts              INTEGER NOT NULL DEFAULT 5,
  available_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_by                 TEXT,
  locked_at                 TIMESTAMPTZ,
  lease_expires_at          TIMESTAMPTZ,
  payload                   JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_error_code           TEXT,
  last_error_message        TEXT,
  correlation_id            TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at              TIMESTAMPTZ
);

CREATE TABLE project_intelligence_meeting_job_attempts (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                    UUID NOT NULL REFERENCES project_intelligence_meeting_jobs(id) ON DELETE CASCADE,
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  attempt_number            INTEGER NOT NULL,
  status                    TEXT NOT NULL,
  error_code                TEXT,
  error_message             TEXT,
  started_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at               TIMESTAMPTZ
);

CREATE TABLE project_intelligence_meeting_worker_leases (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id                 TEXT NOT NULL,
  tenant_id                 UUID REFERENCES tenants(id) ON DELETE CASCADE,
  leased_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at                TIMESTAMPTZ NOT NULL,
  metadata                  JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE project_intelligence_meeting_dead_letters (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                    UUID REFERENCES project_intelligence_meeting_jobs(id) ON DELETE SET NULL,
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  meeting_session_id        UUID,
  job_type                  TEXT NOT NULL,
  error_code                TEXT,
  error_message             TEXT,
  payload                   JSONB NOT NULL DEFAULT '{}'::jsonb,
  review_state              TEXT NOT NULL DEFAULT 'pending',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_intelligence_meeting_outbox (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  aggregate_type            TEXT NOT NULL,
  aggregate_id              UUID NOT NULL,
  event_type                TEXT NOT NULL,
  payload                   JSONB NOT NULL DEFAULT '{}'::jsonb,
  correlation_id            TEXT,
  idempotency_key           TEXT,
  status                    TEXT NOT NULL DEFAULT 'pending',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pi_meeting_outbox_idem_uidx UNIQUE (idempotency_key)
);

-- RLS
-- Tables with tenant_id + workspace_id
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'project_intelligence_meeting_sessions',
    'project_intelligence_meeting_participants',
    'project_intelligence_transcript_segments',
    'project_intelligence_transcript_revisions',
    'project_intelligence_meeting_events',
    'project_intelligence_meeting_processing_runs',
    'project_intelligence_meeting_proposals',
    'project_intelligence_meeting_review_items',
    'project_intelligence_meeting_minutes',
    'project_intelligence_meeting_minutes_versions',
    'project_intelligence_meeting_evidence',
    'project_intelligence_meeting_jobs',
    'project_intelligence_meeting_dead_letters',
    'project_intelligence_meeting_outbox'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT TO authenticated USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT wm.workspace_id FROM workspace_memberships wm WHERE wm.user_id = auth.uid()
         )
       )',
      t || '_select', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL TO authenticated USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND has_permission(''engineering'', ''admin'', tenant_id)
         AND workspace_id IN (
           SELECT wm.workspace_id FROM workspace_memberships wm WHERE wm.user_id = auth.uid()
         )
       ) WITH CHECK (
         tenant_id = ANY(get_user_tenant_ids())
         AND has_permission(''engineering'', ''admin'', tenant_id)
         AND workspace_id IN (
           SELECT wm.workspace_id FROM workspace_memberships wm WHERE wm.user_id = auth.uid()
         )
       )',
      t || '_manage', t
    );
  END LOOP;
END $$;

-- job_attempts: tenant scoped, no workspace_id
ALTER TABLE project_intelligence_meeting_job_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY project_intelligence_meeting_job_attempts_select
  ON project_intelligence_meeting_job_attempts FOR SELECT TO authenticated
  USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY project_intelligence_meeting_job_attempts_manage
  ON project_intelligence_meeting_job_attempts FOR ALL TO authenticated
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

-- worker_leases: optional tenant; deny authenticated by default (service role only)
ALTER TABLE project_intelligence_meeting_worker_leases ENABLE ROW LEVEL SECURITY;
CREATE POLICY project_intelligence_meeting_worker_leases_select
  ON project_intelligence_meeting_worker_leases FOR SELECT TO authenticated
  USING (
    tenant_id IS NOT NULL
    AND tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

