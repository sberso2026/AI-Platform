-- EOS-A12B: My Engineering Day acknowledgement and preference persistence.
-- Additive after 20261001000000_eos_a12a_artifact_template_governance.sql.
-- Attention Items themselves are derived from canonical domain state.
-- These tables store only user presentation state (ack/snooze/FYI preference).
-- No content_base64, no notification payload dump, no employee telemetry.

CREATE TABLE IF NOT EXISTS engineering_attention_acknowledgements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL,
  fingerprint     TEXT NOT NULL,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  snoozed_until   TIMESTAMPTZ,
  UNIQUE (tenant_id, workspace_id, user_id, fingerprint)
);

CREATE TABLE IF NOT EXISTS engineering_attention_preferences (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL,
  fyi_display   BOOLEAN NOT NULL DEFAULT TRUE,
  digest_mode   TEXT NOT NULL DEFAULT 'IMMEDIATE' CHECK (digest_mode IN ('IMMEDIATE', 'DIGEST')),
  muted_fyi     BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_eng_attention_ack_user
  ON engineering_attention_acknowledgements (tenant_id, workspace_id, user_id);

CREATE INDEX IF NOT EXISTS idx_eng_attention_pref_user
  ON engineering_attention_preferences (tenant_id, workspace_id, user_id);

DROP TRIGGER IF EXISTS engineering_attention_ack_workspace_tenant ON engineering_attention_acknowledgements;
CREATE TRIGGER engineering_attention_ack_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_attention_acknowledgements
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_attention_pref_workspace_tenant ON engineering_attention_preferences;
CREATE TRIGGER engineering_attention_pref_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_attention_preferences
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_attention_preferences_updated_at ON engineering_attention_preferences;
CREATE TRIGGER engineering_attention_preferences_updated_at
  BEFORE UPDATE ON engineering_attention_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_attention_acknowledgements IS
  'EOS-A12B user acknowledgement/snooze of derived Attention fingerprints. Does not resolve engineering source state. No content_base64.';
COMMENT ON TABLE engineering_attention_preferences IS
  'EOS-A12B user presentation preferences for FYI/digest. Cannot weaken authorization or mandatory governance.';

ALTER TABLE engineering_attention_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_attention_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_attention_ack_select ON engineering_attention_acknowledgements;
DROP POLICY IF EXISTS eng_attention_ack_insert ON engineering_attention_acknowledgements;
DROP POLICY IF EXISTS eng_attention_ack_update ON engineering_attention_acknowledgements;
DROP POLICY IF EXISTS eng_attention_ack_delete ON engineering_attention_acknowledgements;
DROP POLICY IF EXISTS eng_attention_pref_select ON engineering_attention_preferences;
DROP POLICY IF EXISTS eng_attention_pref_insert ON engineering_attention_preferences;
DROP POLICY IF EXISTS eng_attention_pref_update ON engineering_attention_preferences;
DROP POLICY IF EXISTS eng_attention_pref_delete ON engineering_attention_preferences;

CREATE POLICY eng_attention_ack_select ON engineering_attention_acknowledgements
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND user_id = auth.uid()
  );

CREATE POLICY eng_attention_ack_insert ON engineering_attention_acknowledgements
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND user_id = auth.uid()
  );

CREATE POLICY eng_attention_ack_update ON engineering_attention_acknowledgements
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND user_id = auth.uid()
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND user_id = auth.uid()
  );

CREATE POLICY eng_attention_ack_delete ON engineering_attention_acknowledgements
  FOR DELETE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND user_id = auth.uid()
  );

CREATE POLICY eng_attention_pref_select ON engineering_attention_preferences
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND user_id = auth.uid()
  );

CREATE POLICY eng_attention_pref_insert ON engineering_attention_preferences
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND user_id = auth.uid()
  );

CREATE POLICY eng_attention_pref_update ON engineering_attention_preferences
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND user_id = auth.uid()
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND user_id = auth.uid()
  );

CREATE POLICY eng_attention_pref_delete ON engineering_attention_preferences
  FOR DELETE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND user_id = auth.uid()
  );
