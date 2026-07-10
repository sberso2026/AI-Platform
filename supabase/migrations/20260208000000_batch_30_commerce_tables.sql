-- RTB Platform Commerce Engine — Batch 30
-- Shared platform service: catalog, subscriptions, licensing, seats, installations, usage, billing, marketplace

-- ─── Product Catalog ─────────────────────────────────────────────────────────

CREATE TABLE commercial_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES commercial_categories(id) ON DELETE SET NULL,
  slug            TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_commercial_categories_slug_global
  ON commercial_categories(slug) WHERE tenant_id IS NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX idx_commercial_categories_slug_tenant
  ON commercial_categories(tenant_id, slug) WHERE tenant_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_commercial_categories_tenant ON commercial_categories(tenant_id);

CREATE TABLE commercial_products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID REFERENCES tenants(id) ON DELETE CASCADE,
  category_id         UUID REFERENCES commercial_categories(id) ON DELETE SET NULL,
  slug                TEXT NOT NULL,
  name                TEXT NOT NULL,
  product_type        TEXT NOT NULL DEFAULT 'operating_system'
                      CHECK (product_type IN ('operating_system', 'application', 'addon', 'service', 'bundle')),
  description         TEXT,
  icon                TEXT,
  lifecycle_status    TEXT NOT NULL DEFAULT 'draft'
                      CHECK (lifecycle_status IN ('draft', 'preview', 'active', 'deprecated', 'retired')),
  visibility          TEXT NOT NULL DEFAULT 'private'
                      CHECK (visibility IN ('private', 'tenant', 'marketplace', 'public')),
  marketplace_visible BOOLEAN NOT NULL DEFAULT FALSE,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_commercial_products_slug_global
  ON commercial_products(slug) WHERE tenant_id IS NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX idx_commercial_products_slug_tenant
  ON commercial_products(tenant_id, slug) WHERE tenant_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_commercial_products_category ON commercial_products(category_id);
CREATE INDEX idx_commercial_products_lifecycle ON commercial_products(lifecycle_status);

CREATE TABLE commercial_product_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES commercial_products(id) ON DELETE CASCADE,
  version         TEXT NOT NULL,
  release_channel TEXT NOT NULL DEFAULT 'stable'
                  CHECK (release_channel IN ('alpha', 'beta', 'stable', 'lts')),
  changelog       TEXT,
  is_current      BOOLEAN NOT NULL DEFAULT FALSE,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ,
  UNIQUE (product_id, version)
);

CREATE INDEX idx_commercial_product_versions_product ON commercial_product_versions(product_id);

-- ─── Plans & Pricing ─────────────────────────────────────────────────────────

CREATE TABLE commercial_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES commercial_products(id) ON DELETE CASCADE,
  slug            TEXT NOT NULL,
  name            TEXT NOT NULL,
  edition         TEXT NOT NULL DEFAULT 'standard'
                  CHECK (edition IN ('free', 'trial', 'starter', 'professional', 'business', 'enterprise', 'custom')),
  description     TEXT,
  billing_model   TEXT NOT NULL DEFAULT 'seat'
                  CHECK (billing_model IN ('free', 'flat', 'seat', 'usage', 'hybrid', 'custom')),
  trial_days      INT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ,
  UNIQUE (product_id, slug)
);

CREATE INDEX idx_commercial_plans_product ON commercial_plans(product_id);

CREATE TABLE commercial_plan_prices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         UUID NOT NULL REFERENCES commercial_plans(id) ON DELETE CASCADE,
  currency        TEXT NOT NULL DEFAULT 'AUD',
  billing_period  TEXT NOT NULL DEFAULT 'monthly'
                  CHECK (billing_period IN ('monthly', 'annual', 'multi_year', 'one_time', 'custom')),
  amount_cents    BIGINT NOT NULL DEFAULT 0,
  seat_price_cents BIGINT,
  usage_unit_price_cents BIGINT,
  min_seats       INT,
  max_seats       INT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_commercial_plan_prices_plan ON commercial_plan_prices(plan_id);

-- ─── Subscriptions ───────────────────────────────────────────────────────────

CREATE TABLE commercial_subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id        UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  product_id          UUID NOT NULL REFERENCES commercial_products(id) ON DELETE RESTRICT,
  plan_id             UUID REFERENCES commercial_plans(id) ON DELETE SET NULL,
  status              TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN (
                        'trial', 'active', 'paused', 'suspended', 'cancelled',
                        'grace_period', 'pending_renewal', 'pending_payment'
                      )),
  billing_period      TEXT,
  quantity            INT NOT NULL DEFAULT 1,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  renewal_date        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  trial_ends_at       TIMESTAMPTZ,
  scheduled_plan_id   UUID REFERENCES commercial_plans(id) ON DELETE SET NULL,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_commercial_subscriptions_tenant ON commercial_subscriptions(tenant_id);
CREATE INDEX idx_commercial_subscriptions_product ON commercial_subscriptions(product_id);
CREATE INDEX idx_commercial_subscriptions_status ON commercial_subscriptions(status);

CREATE TABLE commercial_subscription_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id   UUID NOT NULL REFERENCES commercial_subscriptions(id) ON DELETE CASCADE,
  event_type        TEXT NOT NULL,
  from_status       TEXT,
  to_status         TEXT,
  payload           JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_commercial_subscription_events_sub ON commercial_subscription_events(subscription_id);

-- ─── Licensing ───────────────────────────────────────────────────────────────

CREATE TABLE commercial_licenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  product_id      UUID REFERENCES commercial_products(id) ON DELETE SET NULL,
  application_key TEXT,
  subscription_id UUID REFERENCES commercial_subscriptions(id) ON DELETE SET NULL,
  license_type    TEXT NOT NULL DEFAULT 'product'
                  CHECK (license_type IN ('product', 'application', 'feature', 'workspace', 'floating', 'named_user')),
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'suspended', 'expired', 'revoked')),
  feature_key     TEXT,
  max_seats       INT,
  expires_at      TIMESTAMPTZ,
  activated_at    TIMESTAMPTZ,
  deactivated_at  TIMESTAMPTZ,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_commercial_licenses_tenant ON commercial_licenses(tenant_id);
CREATE INDEX idx_commercial_licenses_product ON commercial_licenses(product_id);
CREATE INDEX idx_commercial_licenses_status ON commercial_licenses(status);

CREATE TABLE commercial_license_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  license_id      UUID NOT NULL REFERENCES commercial_licenses(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'transferred', 'revoked')),
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at      TIMESTAMPTZ,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_commercial_license_assignments_license ON commercial_license_assignments(license_id);
CREATE INDEX idx_commercial_license_assignments_user ON commercial_license_assignments(user_id);

-- ─── Seats ───────────────────────────────────────────────────────────────────

CREATE TABLE commercial_seats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  product_id      UUID NOT NULL REFERENCES commercial_products(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES commercial_subscriptions(id) ON DELETE SET NULL,
  license_id      UUID REFERENCES commercial_licenses(id) ON DELETE SET NULL,
  pool_name       TEXT NOT NULL DEFAULT 'default',
  total_seats     INT NOT NULL DEFAULT 0,
  assigned_seats  INT NOT NULL DEFAULT 0,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_commercial_seats_tenant ON commercial_seats(tenant_id);
CREATE INDEX idx_commercial_seats_product ON commercial_seats(product_id);

-- ─── Installations ───────────────────────────────────────────────────────────

CREATE TABLE commercial_installations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  product_id      UUID NOT NULL REFERENCES commercial_products(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES commercial_subscriptions(id) ON DELETE SET NULL,
  version         TEXT,
  status          TEXT NOT NULL DEFAULT 'not_installed'
                  CHECK (status IN ('not_installed', 'installing', 'healthy', 'degraded', 'failed', 'uninstalling')),
  health_message  TEXT,
  installed_at    TIMESTAMPTZ,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_commercial_installations_tenant ON commercial_installations(tenant_id);
CREATE INDEX idx_commercial_installations_product ON commercial_installations(product_id);

CREATE TABLE commercial_application_installations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  product_id      UUID NOT NULL REFERENCES commercial_products(id) ON DELETE CASCADE,
  application_key TEXT NOT NULL,
  version         TEXT,
  status          TEXT NOT NULL DEFAULT 'not_installed'
                  CHECK (status IN ('not_installed', 'installing', 'healthy', 'degraded', 'failed', 'uninstalling')),
  installed_at    TIMESTAMPTZ,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ,
  UNIQUE (tenant_id, product_id, application_key)
);

CREATE INDEX idx_commercial_app_installations_tenant ON commercial_application_installations(tenant_id);

CREATE TABLE commercial_installation_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  installation_id   UUID REFERENCES commercial_installations(id) ON DELETE CASCADE,
  app_installation_id UUID REFERENCES commercial_application_installations(id) ON DELETE CASCADE,
  event_type        TEXT NOT NULL,
  from_status       TEXT,
  to_status         TEXT,
  payload           JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- ─── Usage Metering ──────────────────────────────────────────────────────────

CREATE TABLE commercial_usage_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key      TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT,
  unit            TEXT NOT NULL DEFAULT 'count',
  aggregation     TEXT NOT NULL DEFAULT 'sum'
                  CHECK (aggregation IN ('sum', 'max', 'avg', 'last')),
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE TABLE commercial_usage_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  product_id      UUID REFERENCES commercial_products(id) ON DELETE SET NULL,
  application_key TEXT,
  metric_key      TEXT NOT NULL REFERENCES commercial_usage_types(metric_key),
  quantity        NUMERIC NOT NULL DEFAULT 0,
  unit            TEXT,
  period_start    TIMESTAMPTZ NOT NULL,
  period_end      TIMESTAMPTZ NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_commercial_usage_records_tenant ON commercial_usage_records(tenant_id);
CREATE INDEX idx_commercial_usage_records_metric ON commercial_usage_records(metric_key);
CREATE INDEX idx_commercial_usage_records_period ON commercial_usage_records(period_start, period_end);

-- ─── Billing ─────────────────────────────────────────────────────────────────

CREATE TABLE commercial_billing_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  legal_name      TEXT,
  currency        TEXT NOT NULL DEFAULT 'AUD',
  tax_id          TEXT,
  cost_centre     TEXT,
  parent_id       UUID REFERENCES commercial_billing_accounts(id) ON DELETE SET NULL,
  provider        TEXT NOT NULL DEFAULT 'manual'
                  CHECK (provider IN ('stripe', 'xero', 'manual', 'purchase_order')),
  external_id     TEXT,
  is_default      BOOLEAN NOT NULL DEFAULT FALSE,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_commercial_billing_accounts_tenant ON commercial_billing_accounts(tenant_id);

CREATE TABLE commercial_payment_methods (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  billing_account_id  UUID NOT NULL REFERENCES commercial_billing_accounts(id) ON DELETE CASCADE,
  provider            TEXT NOT NULL DEFAULT 'manual',
  method_type         TEXT NOT NULL DEFAULT 'card'
                      CHECK (method_type IN ('card', 'bank_transfer', 'purchase_order', 'invoice')),
  external_id         TEXT,
  is_default          BOOLEAN NOT NULL DEFAULT FALSE,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_commercial_payment_methods_account ON commercial_payment_methods(billing_account_id);

CREATE TABLE commercial_invoices (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  billing_account_id  UUID NOT NULL REFERENCES commercial_billing_accounts(id) ON DELETE RESTRICT,
  subscription_id     UUID REFERENCES commercial_subscriptions(id) ON DELETE SET NULL,
  invoice_number      TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  currency            TEXT NOT NULL DEFAULT 'AUD',
  subtotal_cents      BIGINT NOT NULL DEFAULT 0,
  tax_cents           BIGINT NOT NULL DEFAULT 0,
  total_cents         BIGINT NOT NULL DEFAULT 0,
  tax_type            TEXT CHECK (tax_type IN ('gst', 'vat', 'none')),
  issued_at           TIMESTAMPTZ,
  due_at              TIMESTAMPTZ,
  paid_at             TIMESTAMPTZ,
  provider            TEXT NOT NULL DEFAULT 'manual',
  external_id         TEXT,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at          TIMESTAMPTZ,
  UNIQUE (tenant_id, invoice_number)
);

CREATE INDEX idx_commercial_invoices_tenant ON commercial_invoices(tenant_id);

CREATE TABLE commercial_invoice_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_id      UUID NOT NULL REFERENCES commercial_invoices(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  quantity        NUMERIC NOT NULL DEFAULT 1,
  unit_amount_cents BIGINT NOT NULL DEFAULT 0,
  total_cents     BIGINT NOT NULL DEFAULT 0,
  product_id      UUID REFERENCES commercial_products(id) ON DELETE SET NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_commercial_invoice_items_invoice ON commercial_invoice_items(invoice_id);

CREATE TABLE commercial_transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  billing_account_id  UUID REFERENCES commercial_billing_accounts(id) ON DELETE SET NULL,
  invoice_id          UUID REFERENCES commercial_invoices(id) ON DELETE SET NULL,
  transaction_type    TEXT NOT NULL
                      CHECK (transaction_type IN ('charge', 'refund', 'credit', 'adjustment')),
  amount_cents        BIGINT NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'AUD',
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  provider            TEXT NOT NULL DEFAULT 'manual',
  external_id         TEXT,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_commercial_transactions_tenant ON commercial_transactions(tenant_id);

CREATE TABLE commercial_credit_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entry_type      TEXT NOT NULL
                  CHECK (entry_type IN ('credit', 'debit', 'expiry', 'adjustment')),
  amount_cents    BIGINT NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'AUD',
  balance_after_cents BIGINT NOT NULL DEFAULT 0,
  reason          TEXT,
  reference_type  TEXT,
  reference_id    UUID,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_commercial_credit_ledger_tenant ON commercial_credit_ledger(tenant_id);

-- ─── Marketplace ─────────────────────────────────────────────────────────────

CREATE TABLE commercial_publishers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  publisher_type  TEXT NOT NULL DEFAULT 'rtb'
                  CHECK (publisher_type IN ('rtb', 'partner', 'verified_third_party')),
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE TABLE commercial_marketplace_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES commercial_products(id) ON DELETE CASCADE,
  publisher_id    UUID NOT NULL REFERENCES commercial_publishers(id) ON DELETE RESTRICT,
  listing_status  TEXT NOT NULL DEFAULT 'draft'
                  CHECK (listing_status IN ('draft', 'published', 'suspended', 'archived')),
  visibility      TEXT NOT NULL DEFAULT 'public'
                  CHECK (visibility IN ('public', 'private', 'partner_only')),
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  UNIQUE (product_id, publisher_id)
);

CREATE TABLE commercial_partner_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id    UUID NOT NULL REFERENCES commercial_publishers(id) ON DELETE CASCADE,
  external_sku    TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  UNIQUE (publisher_id, external_sku)
);

-- ─── Updated_at triggers ─────────────────────────────────────────────────────

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'commercial_categories', 'commercial_products', 'commercial_product_versions',
    'commercial_plans', 'commercial_plan_prices', 'commercial_subscriptions',
    'commercial_licenses', 'commercial_license_assignments', 'commercial_seats',
    'commercial_installations', 'commercial_application_installations',
    'commercial_usage_types', 'commercial_billing_accounts', 'commercial_payment_methods',
    'commercial_invoices', 'commercial_invoice_items', 'commercial_publishers',
    'commercial_marketplace_products', 'commercial_partner_products'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER %I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t, t
    );
  END LOOP;
END $$;
