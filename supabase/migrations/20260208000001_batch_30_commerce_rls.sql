-- RTB Platform Commerce Engine — Batch 30 RLS Policies

-- Enable RLS on all commerce tables
ALTER TABLE commercial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_product_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_plan_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_license_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_application_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_installation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_usage_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_billing_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_partner_products ENABLE ROW LEVEL SECURITY;

-- ─── Global catalog (readable by authenticated users) ────────────────────────

CREATE POLICY commercial_categories_read ON commercial_categories
  FOR SELECT USING (
    deleted_at IS NULL
    AND (tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids()))
  );

CREATE POLICY commercial_products_read ON commercial_products
  FOR SELECT USING (
    deleted_at IS NULL
    AND (tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids()))
  );

CREATE POLICY commercial_product_versions_read ON commercial_product_versions
  FOR SELECT USING (
    deleted_at IS NULL
    AND product_id IN (
      SELECT id FROM commercial_products
      WHERE deleted_at IS NULL
        AND (tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids()))
    )
  );

CREATE POLICY commercial_plans_read ON commercial_plans
  FOR SELECT USING (
    deleted_at IS NULL
    AND product_id IN (
      SELECT id FROM commercial_products WHERE deleted_at IS NULL
    )
  );

CREATE POLICY commercial_plan_prices_read ON commercial_plan_prices
  FOR SELECT USING (
    deleted_at IS NULL
    AND plan_id IN (SELECT id FROM commercial_plans WHERE deleted_at IS NULL)
  );

CREATE POLICY commercial_usage_types_read ON commercial_usage_types
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY commercial_publishers_read ON commercial_publishers
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY commercial_marketplace_products_read ON commercial_marketplace_products
  FOR SELECT USING (
    deleted_at IS NULL
    AND listing_status = 'published'
  );

CREATE POLICY commercial_partner_products_read ON commercial_partner_products
  FOR SELECT USING (deleted_at IS NULL);

-- ─── Tenant-scoped commerce (member read, commerce admin write) ──────────────

CREATE POLICY commercial_subscriptions_tenant_read ON commercial_subscriptions
  FOR SELECT USING (
    deleted_at IS NULL AND tenant_id = ANY(get_user_tenant_ids())
  );

CREATE POLICY commercial_subscriptions_tenant_write ON commercial_subscriptions
  FOR ALL USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  );

CREATE POLICY commercial_subscription_events_read ON commercial_subscription_events
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY commercial_subscription_events_write ON commercial_subscription_events
  FOR INSERT WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  );

CREATE POLICY commercial_licenses_tenant_read ON commercial_licenses
  FOR SELECT USING (
    deleted_at IS NULL AND tenant_id = ANY(get_user_tenant_ids())
  );

CREATE POLICY commercial_licenses_tenant_write ON commercial_licenses
  FOR ALL USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  );

CREATE POLICY commercial_license_assignments_tenant ON commercial_license_assignments
  FOR ALL USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND (
      has_permission('commerce', 'read', tenant_id)
      OR has_permission('commerce', 'admin', tenant_id)
    )
  );

CREATE POLICY commercial_seats_tenant_read ON commercial_seats
  FOR SELECT USING (
    deleted_at IS NULL AND tenant_id = ANY(get_user_tenant_ids())
  );

CREATE POLICY commercial_seats_tenant_write ON commercial_seats
  FOR ALL USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  );

CREATE POLICY commercial_installations_tenant_read ON commercial_installations
  FOR SELECT USING (
    deleted_at IS NULL AND tenant_id = ANY(get_user_tenant_ids())
  );

CREATE POLICY commercial_installations_tenant_write ON commercial_installations
  FOR ALL USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  );

CREATE POLICY commercial_app_installations_tenant ON commercial_application_installations
  FOR ALL USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND (
      has_permission('commerce', 'read', tenant_id)
      OR has_permission('commerce', 'admin', tenant_id)
    )
  );

CREATE POLICY commercial_installation_events_tenant ON commercial_installation_events
  FOR ALL USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY commercial_usage_records_tenant_read ON commercial_usage_records
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY commercial_usage_records_tenant_write ON commercial_usage_records
  FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY commercial_billing_accounts_tenant ON commercial_billing_accounts
  FOR ALL USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  );

CREATE POLICY commercial_payment_methods_tenant ON commercial_payment_methods
  FOR ALL USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  );

CREATE POLICY commercial_invoices_tenant_read ON commercial_invoices
  FOR SELECT USING (
    deleted_at IS NULL AND tenant_id = ANY(get_user_tenant_ids())
  );

CREATE POLICY commercial_invoices_tenant_write ON commercial_invoices
  FOR ALL USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  );

CREATE POLICY commercial_invoice_items_tenant ON commercial_invoice_items
  FOR ALL USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY commercial_transactions_tenant ON commercial_transactions
  FOR ALL USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  );

CREATE POLICY commercial_credit_ledger_tenant_read ON commercial_credit_ledger
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY commercial_credit_ledger_tenant_write ON commercial_credit_ledger
  FOR INSERT WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  );
