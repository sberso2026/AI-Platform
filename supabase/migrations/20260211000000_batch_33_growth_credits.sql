-- RTB Platform — Batch 33 Growth Credits (Phase 4 Customer Administration)

CREATE TABLE commercial_growth_credit_accounts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  available_balance INTEGER NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
  reserved_balance  INTEGER NOT NULL DEFAULT 0 CHECK (reserved_balance >= 0),
  lifetime_earned   INTEGER NOT NULL DEFAULT 0,
  lifetime_redeemed INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id)
);

CREATE TABLE commercial_growth_credit_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  account_id        UUID NOT NULL REFERENCES commercial_growth_credit_accounts(id) ON DELETE CASCADE,
  transaction_type  TEXT NOT NULL
                    CHECK (transaction_type IN (
                      'earned', 'redeemed', 'reserved', 'released',
                      'expired', 'reversed', 'adjusted'
                    )),
  amount            INTEGER NOT NULL,
  source            TEXT,
  description       TEXT,
  expires_at        TIMESTAMPTZ,
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_growth_credit_accounts_tenant ON commercial_growth_credit_accounts(tenant_id);
CREATE INDEX idx_growth_credit_tx_tenant ON commercial_growth_credit_transactions(tenant_id);
CREATE INDEX idx_growth_credit_tx_account ON commercial_growth_credit_transactions(account_id);

ALTER TABLE commercial_growth_credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_growth_credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY growth_credit_accounts_tenant_read ON commercial_growth_credit_accounts
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY growth_credit_accounts_tenant_write ON commercial_growth_credit_accounts
  FOR ALL USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  );

CREATE POLICY growth_credit_tx_tenant_read ON commercial_growth_credit_transactions
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY growth_credit_tx_tenant_write ON commercial_growth_credit_transactions
  FOR ALL USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  );

GRANT ALL ON commercial_growth_credit_accounts TO service_role;
GRANT ALL ON commercial_growth_credit_transactions TO service_role;
