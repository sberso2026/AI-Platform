/**
 * Batch 30 commerce table types — extend via `pnpm db:types` when Supabase is running.
 */
type GenericTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

export type CommerceTables = {
  commercial_categories: GenericTable;
  commercial_products: GenericTable;
  commercial_product_versions: GenericTable;
  commercial_plans: GenericTable;
  commercial_plan_prices: GenericTable;
  commercial_subscriptions: GenericTable;
  commercial_subscription_events: GenericTable;
  commercial_licenses: GenericTable;
  commercial_license_assignments: GenericTable;
  commercial_seats: GenericTable;
  commercial_installations: GenericTable;
  commercial_application_installations: GenericTable;
  commercial_installation_events: GenericTable;
  commercial_usage_types: GenericTable;
  commercial_usage_records: GenericTable;
  commercial_billing_accounts: GenericTable;
  commercial_payment_methods: GenericTable;
  commercial_invoices: GenericTable;
  commercial_invoice_items: GenericTable;
  commercial_transactions: GenericTable;
  commercial_credit_ledger: GenericTable;
  commercial_publishers: GenericTable;
  commercial_marketplace_products: GenericTable;
  commercial_partner_products: GenericTable;
  commercial_seat_assignments: GenericTable;
  commercial_features: GenericTable;
  commercial_product_applications: GenericTable;
  commercial_application_features: GenericTable;
  commercial_plan_entitlements: GenericTable;
  commercial_subscription_changes: GenericTable;
  commercial_entitlement_overrides: GenericTable;
  commercial_outbox_events: GenericTable;
  commercial_installation_versions: GenericTable;
  commercial_installation_requests: GenericTable;
  commercial_installation_workflows: GenericTable;
  commercial_installation_steps: GenericTable;
  commercial_installation_failures: GenericTable;
  commercial_installation_health_checks: GenericTable;
  commercial_installation_dependencies: GenericTable;
  commercial_workspace_product_assignments: GenericTable;
  commercial_workspace_application_assignments: GenericTable;
  commercial_provisioning_runs: GenericTable;
  commercial_provisioning_steps: GenericTable;
  commercial_provisioning_artifacts: GenericTable;
};

export type CommerceDatabase = {
  public: {
    Tables: CommerceTables;
    Views: Record<string, never>;
    Functions: {
      bump_commercial_installation_version: {
        Args: { p_tenant_id: string };
        Returns: number;
      };
      seed_tenant_engineering_os: {
        Args: { p_tenant_id: string };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
