-- RTB Platform Commerce Engine — Phase 2
-- Subscription lifecycle, entitlements, seat assignments, plan entitlements, overrides, outbox

-- ─── Extend subscription statuses ────────────────────────────────────────────

ALTER TABLE commercial_subscriptions DROP CONSTRAINT IF EXISTS commercial_subscriptions_status_check;

ALTER TABLE commercial_subscriptions
  ADD COLUMN IF NOT EXISTS plan_price_id UUID REFERENCES commercial_plan_prices(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS billing_account_id UUID REFERENCES commercial_billing_accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS billing_interval TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'AUD',
  ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cancellation_effective_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_type TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan_version_id UUID REFERENCES commercial_product_versions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS plan_snapshot_json JSONB NOT NULL DEFAULT '{}';

UPDATE commercial_subscriptions SET status = 'trialing' WHERE status = 'trial';

ALTER TABLE commercial_subscriptions
  ADD CONSTRAINT commercial_subscriptions_status_check
  CHECK (status IN (
    'draft', 'pending_activation', 'trialing', 'active', 'past_due',
    'grace_period', 'paused', 'suspended', 'scheduled_cancellation',
    'cancelled', 'expired', 'pending_renewal', 'pending_payment'
  ));

-- ─── Immutable subscription events (extended) ───────────────────────────────

ALTER TABLE commercial_subscription_events
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS previous_status TEXT,
  ADD COLUMN IF NOT EXISTS new_status TEXT,
  ADD COLUMN IF NOT EXISTS effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS actor_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS actor_type TEXT NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS correlation_id UUID,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS event_payload JSONB NOT NULL DEFAULT '{}';

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_events_idempotency
  ON commercial_subscription_events(subscription_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Prevent updates/deletes on subscription events
CREATE OR REPLACE FUNCTION prevent_subscription_event_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'commercial_subscription_events are immutable';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS commercial_subscription_events_immutable ON commercial_subscription_events;
CREATE TRIGGER commercial_subscription_events_immutable
  BEFORE UPDATE OR DELETE ON commercial_subscription_events
  FOR EACH ROW EXECUTE FUNCTION prevent_subscription_event_mutation();

-- ─── Extend licences ─────────────────────────────────────────────────────────

ALTER TABLE commercial_licenses DROP CONSTRAINT IF EXISTS commercial_licenses_status_check;

ALTER TABLE commercial_licenses
  ADD COLUMN IF NOT EXISTS valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS usage_limit NUMERIC,
  ADD COLUMN IF NOT EXISTS scope_type TEXT NOT NULL DEFAULT 'tenant',
  ADD COLUMN IF NOT EXISTS scope_id UUID,
  ADD COLUMN IF NOT EXISTS issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS issued_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS revoked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS revocation_reason TEXT;

ALTER TABLE commercial_licenses
  ADD CONSTRAINT commercial_licenses_status_check
  CHECK (status IN ('pending', 'active', 'expiring_soon', 'expired', 'suspended', 'revoked', 'cancelled'));

ALTER TABLE commercial_licenses DROP CONSTRAINT IF EXISTS commercial_licenses_license_type_check;
ALTER TABLE commercial_licenses
  ADD CONSTRAINT commercial_licenses_license_type_check
  CHECK (license_type IN ('product', 'application', 'feature', 'workspace', 'named_user', 'seat_pool', 'floating'));

-- ─── Seat assignments ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS commercial_seat_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  seat_pool_id    UUID NOT NULL REFERENCES commercial_seats(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES commercial_subscriptions(id) ON DELETE SET NULL,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'suspended', 'transferred', 'removed')),
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at      TIMESTAMPTZ,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ,
  UNIQUE (seat_pool_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_commercial_seat_assignments_tenant ON commercial_seat_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_commercial_seat_assignments_user ON commercial_seat_assignments(user_id);

CREATE TRIGGER commercial_seat_assignments_updated_at
  BEFORE UPDATE ON commercial_seat_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Plan entitlements ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS commercial_features (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key     TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS commercial_product_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES commercial_products(id) ON DELETE CASCADE,
  application_key TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  UNIQUE (product_id, application_key)
);

CREATE TABLE IF NOT EXISTS commercial_application_features (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES commercial_products(id) ON DELETE CASCADE,
  application_key TEXT NOT NULL,
  feature_key     TEXT NOT NULL REFERENCES commercial_features(feature_key),
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, application_key, feature_key)
);

CREATE TABLE IF NOT EXISTS commercial_plan_entitlements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         UUID NOT NULL REFERENCES commercial_plans(id) ON DELETE CASCADE,
  entitlement_type TEXT NOT NULL
                  CHECK (entitlement_type IN (
                    'product_access', 'application_access', 'feature_access',
                    'seat_limit', 'usage_limit', 'storage_limit', 'workspace_limit',
                    'export_limit', 'trial_restriction', 'support_tier', 'custom'
                  )),
  entitlement_key TEXT NOT NULL,
  value_type      TEXT NOT NULL DEFAULT 'boolean'
                  CHECK (value_type IN ('boolean', 'integer', 'decimal', 'text', 'json')),
  boolean_value   BOOLEAN,
  integer_value   INTEGER,
  decimal_value   NUMERIC,
  text_value      TEXT,
  json_value      JSONB,
  effective_from  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_until TIMESTAMPTZ,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  UNIQUE (plan_id, entitlement_type, entitlement_key)
);

CREATE TRIGGER commercial_plan_entitlements_updated_at
  BEFORE UPDATE ON commercial_plan_entitlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Subscription plan changes ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS commercial_subscription_changes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES commercial_subscriptions(id) ON DELETE CASCADE,
  current_plan_id UUID REFERENCES commercial_plans(id) ON DELETE SET NULL,
  target_plan_id  UUID NOT NULL REFERENCES commercial_plans(id) ON DELETE RESTRICT,
  change_type     TEXT NOT NULL CHECK (change_type IN ('upgrade', 'downgrade', 'conversion', 'override')),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'scheduled', 'applied', 'cancelled', 'failed')),
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  requested_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  effective_at    TIMESTAMPTZ NOT NULL,
  applied_at      TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  reason          TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER commercial_subscription_changes_updated_at
  BEFORE UPDATE ON commercial_subscription_changes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Entitlement overrides ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS commercial_entitlement_overrides (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  product_id      UUID REFERENCES commercial_products(id) ON DELETE SET NULL,
  application_key TEXT,
  feature_key     TEXT,
  override_type   TEXT NOT NULL,
  effect          TEXT NOT NULL CHECK (effect IN ('allow', 'deny', 'limit_override', 'expiry_extension')),
  valid_from      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until     TIMESTAMPTZ,
  reason          TEXT NOT NULL,
  approved_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at      TIMESTAMPTZ,
  revoked_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata        JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_entitlement_overrides_tenant ON commercial_entitlement_overrides(tenant_id);

-- ─── Transactional outbox ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS commercial_outbox_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  aggregate_type  TEXT NOT NULL,
  aggregate_id    UUID NOT NULL,
  event_type      TEXT NOT NULL,
  payload         JSONB NOT NULL DEFAULT '{}',
  payload_version TEXT NOT NULL DEFAULT '1.0',
  correlation_id  UUID,
  idempotency_key TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'processed', 'failed', 'dead_letter')),
  available_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at    TIMESTAMPTZ,
  retry_count     INTEGER NOT NULL DEFAULT 0,
  last_error      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commercial_outbox_pending
  ON commercial_outbox_events(status, available_at)
  WHERE status IN ('pending', 'failed');
