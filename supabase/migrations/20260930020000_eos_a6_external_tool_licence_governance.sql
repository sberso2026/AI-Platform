-- EOS-A6 — generic external-tool licence governance fields
-- licence_type / expiry / api_available / production_use_permitted apply to all tools.
-- Does not store licence secrets. Does not certify SPACE GASS production use.

ALTER TABLE engineering_external_tool_profiles
  ADD COLUMN IF NOT EXISTS licence_type TEXT NOT NULL DEFAULT 'UNKNOWN'
    CHECK (licence_type IN ('TRIAL', 'SUBSCRIPTION', 'PERPETUAL', 'ENTERPRISE', 'EDUCATIONAL', 'OTHER', 'UNKNOWN'));

ALTER TABLE engineering_external_tool_profiles
  ADD COLUMN IF NOT EXISTS licence_expires_at TIMESTAMPTZ;

ALTER TABLE engineering_external_tool_profiles
  ADD COLUMN IF NOT EXISTS api_available BOOLEAN;

ALTER TABLE engineering_external_tool_profiles
  ADD COLUMN IF NOT EXISTS production_use_permitted BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN engineering_external_tool_profiles.licence_type IS
  'Generic licence class. Trial does not authorize production use.';

COMMENT ON COLUMN engineering_external_tool_profiles.licence_expires_at IS
  'Optional expiry. Trial expiry is mandatory at the application layer; unknown trial expiry fail-closes.';

COMMENT ON COLUMN engineering_external_tool_profiles.api_available IS
  'Whether a documented API/automation mechanism is currently reachable. Null = unknown. Not inferred from GUI launch.';

COMMENT ON COLUMN engineering_external_tool_profiles.production_use_permitted IS
  'Platform production authorization. Workspace assignment cannot override. Trial must remain FALSE.';
