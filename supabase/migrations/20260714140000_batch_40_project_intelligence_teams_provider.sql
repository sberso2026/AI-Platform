-- Batch 40: Project Intelligence Microsoft Teams provider connections, mappings,
-- Graph subscriptions, and durable provider events (Phase 6C-3D).

CREATE TABLE IF NOT EXISTS project_intelligence_meeting_provider_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('microsoft_teams', 'zoom', 'google_meet')),
  provider_tenant_id TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Microsoft Teams',
  status TEXT NOT NULL DEFAULT 'unconfigured'
    CHECK (status IN (
      'unconfigured', 'pending_consent', 'configured', 'healthy', 'degraded', 'failed', 'revoked'
    )),
  auth_mode TEXT NOT NULL DEFAULT 'client_credentials'
    CHECK (auth_mode IN ('client_credentials', 'certificate', 'federated', 'fixture')),
  credential_reference TEXT NOT NULL DEFAULT 'env:MICROSOFT_CLIENT_SECRET',
  configured_capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  certified_capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  consent_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (consent_status IN ('unknown', 'required', 'granted', 'revoked', 'expired')),
  consented_by UUID,
  consented_at TIMESTAMPTZ,
  last_health_check_at TIMESTAMPTZ,
  last_health_status TEXT,
  last_error_code TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pi_meeting_provider_conn_tenant_provider_aad
  ON project_intelligence_meeting_provider_connections(tenant_id, provider, provider_tenant_id)
  WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS project_intelligence_meeting_provider_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  meeting_session_id UUID NOT NULL REFERENCES project_intelligence_meeting_sessions(id) ON DELETE CASCADE,
  provider_connection_id UUID NOT NULL REFERENCES project_intelligence_meeting_provider_connections(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider = 'microsoft_teams'),
  provider_tenant_id TEXT NOT NULL,
  provider_meeting_id TEXT NOT NULL,
  provider_join_url_hash TEXT,
  provider_thread_id TEXT,
  provider_organizer_id TEXT,
  mapping_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (mapping_status IN ('pending', 'mapped', 'verified', 'failed', 'revoked')),
  mapping_source TEXT NOT NULL DEFAULT 'manual'
    CHECK (mapping_source IN ('manual', 'discovery', 'webhook', 'admin')),
  confidence NUMERIC(5,4) NOT NULL DEFAULT 1.0,
  verified_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pi_meeting_provider_mapping_active
  ON project_intelligence_meeting_provider_mappings(tenant_id, provider, provider_meeting_id)
  WHERE mapping_status IN ('pending', 'mapped', 'verified');

CREATE INDEX IF NOT EXISTS idx_pi_meeting_provider_mapping_session
  ON project_intelligence_meeting_provider_mappings(meeting_session_id);

CREATE TABLE IF NOT EXISTS project_intelligence_meeting_graph_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  provider_connection_id UUID NOT NULL REFERENCES project_intelligence_meeting_provider_connections(id) ON DELETE CASCADE,
  graph_subscription_id TEXT NOT NULL,
  resource TEXT NOT NULL,
  change_types TEXT[] NOT NULL DEFAULT ARRAY['created', 'updated']::text[],
  notification_url TEXT NOT NULL,
  lifecycle_notification_url TEXT,
  client_state_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN (
      'requested', 'active', 'renewal_due', 'renewing', 'expired', 'failed', 'revoked', 'deleted'
    )),
  expiration_at TIMESTAMPTZ NOT NULL,
  last_renewed_at TIMESTAMPTZ,
  last_notification_at TIMESTAMPTZ,
  last_error_code TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pi_meeting_graph_sub_id
  ON project_intelligence_meeting_graph_subscriptions(graph_subscription_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pi_meeting_graph_sub_active_resource
  ON project_intelligence_meeting_graph_subscriptions(provider_connection_id, resource)
  WHERE status IN ('requested', 'active', 'renewal_due', 'renewing');

CREATE TABLE IF NOT EXISTS project_intelligence_meeting_provider_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  provider_connection_id UUID REFERENCES project_intelligence_meeting_provider_connections(id) ON DELETE SET NULL,
  meeting_session_id UUID REFERENCES project_intelligence_meeting_sessions(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'microsoft_teams',
  provider_event_id TEXT NOT NULL,
  subscription_id TEXT,
  resource TEXT,
  change_type TEXT,
  provider_timestamp TIMESTAMPTZ,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload_checksum TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'received'
    CHECK (processing_status IN (
      'received', 'deduplicated', 'queued', 'processing', 'completed', 'failed', 'dead_letter'
    )),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  correlation_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pi_meeting_provider_event_id
  ON project_intelligence_meeting_provider_events(provider, provider_event_id);

CREATE INDEX IF NOT EXISTS idx_pi_meeting_provider_events_status
  ON project_intelligence_meeting_provider_events(processing_status, received_at);

CREATE TABLE IF NOT EXISTS project_intelligence_meeting_provider_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider_connection_id UUID NOT NULL REFERENCES project_intelligence_meeting_provider_connections(id) ON DELETE CASCADE,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL
    CHECK (status IN ('healthy', 'warning', 'degraded', 'failed', 'revoked', 'unconfigured')),
  checks JSONB NOT NULL DEFAULT '{}'::jsonb,
  latency_ms INTEGER,
  error_code TEXT,
  correlation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pi_meeting_provider_health_conn
  ON project_intelligence_meeting_provider_health(provider_connection_id, checked_at DESC);

-- Prevent identity mutation on provider tables
CREATE OR REPLACE FUNCTION prevent_pi_meeting_provider_identity_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN
    RAISE EXCEPTION 'tenant_id is immutable';
  END IF;
  IF TG_TABLE_NAME = 'project_intelligence_meeting_provider_connections' THEN
    IF NEW.provider IS DISTINCT FROM OLD.provider THEN
      RAISE EXCEPTION 'provider is immutable';
    END IF;
  END IF;
  IF TG_TABLE_NAME = 'project_intelligence_meeting_provider_mappings' THEN
    IF NEW.workspace_id IS DISTINCT FROM OLD.workspace_id
       OR NEW.meeting_session_id IS DISTINCT FROM OLD.meeting_session_id
       OR NEW.provider IS DISTINCT FROM OLD.provider
       OR NEW.provider_meeting_id IS DISTINCT FROM OLD.provider_meeting_id THEN
      RAISE EXCEPTION 'provider mapping identity fields are immutable';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pi_meeting_provider_conn_identity ON project_intelligence_meeting_provider_connections;
CREATE TRIGGER trg_pi_meeting_provider_conn_identity
  BEFORE UPDATE ON project_intelligence_meeting_provider_connections
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_meeting_provider_identity_mutation();

DROP TRIGGER IF EXISTS trg_pi_meeting_provider_mapping_identity ON project_intelligence_meeting_provider_mappings;
CREATE TRIGGER trg_pi_meeting_provider_mapping_identity
  BEFORE UPDATE ON project_intelligence_meeting_provider_mappings
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_meeting_provider_identity_mutation();

-- RLS
ALTER TABLE project_intelligence_meeting_provider_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_meeting_provider_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_meeting_graph_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_meeting_provider_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_meeting_provider_health ENABLE ROW LEVEL SECURITY;

-- Connections: authenticated may SELECT non-secret columns in tenant; manage requires engineering admin.
-- credential_reference is still readable as a reference string (not the secret); never store secrets here.
CREATE POLICY project_intelligence_meeting_provider_connections_select
  ON project_intelligence_meeting_provider_connections FOR SELECT TO authenticated
  USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY project_intelligence_meeting_provider_connections_manage
  ON project_intelligence_meeting_provider_connections FOR ALL TO authenticated
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY project_intelligence_meeting_provider_mappings_select
  ON project_intelligence_meeting_provider_mappings FOR SELECT TO authenticated
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND workspace_id IN (
      SELECT wm.workspace_id FROM workspace_memberships wm WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY project_intelligence_meeting_provider_mappings_manage
  ON project_intelligence_meeting_provider_mappings FOR ALL TO authenticated
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND workspace_id IN (
      SELECT wm.workspace_id FROM workspace_memberships wm WHERE wm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND workspace_id IN (
      SELECT wm.workspace_id FROM workspace_memberships wm WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY project_intelligence_meeting_graph_subscriptions_select
  ON project_intelligence_meeting_graph_subscriptions FOR SELECT TO authenticated
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY project_intelligence_meeting_graph_subscriptions_manage
  ON project_intelligence_meeting_graph_subscriptions FOR ALL TO authenticated
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

-- Provider events: read for workspace members; inserts via service role / controlled path only
CREATE POLICY project_intelligence_meeting_provider_events_select
  ON project_intelligence_meeting_provider_events FOR SELECT TO authenticated
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND (
      workspace_id IS NULL
      OR workspace_id IN (
        SELECT wm.workspace_id FROM workspace_memberships wm WHERE wm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY project_intelligence_meeting_provider_events_no_user_insert
  ON project_intelligence_meeting_provider_events FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY project_intelligence_meeting_provider_events_no_user_update
  ON project_intelligence_meeting_provider_events FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY project_intelligence_meeting_provider_health_select
  ON project_intelligence_meeting_provider_health FOR SELECT TO authenticated
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY project_intelligence_meeting_provider_health_manage
  ON project_intelligence_meeting_provider_health FOR ALL TO authenticated
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );
