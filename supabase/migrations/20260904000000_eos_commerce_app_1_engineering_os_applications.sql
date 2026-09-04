-- EOS-COMMERCE-APP-1: register certified Engineering OS applications in the product catalog.
-- Catalog identity only. Does not change commercial_plan_entitlements or GA declarations.

INSERT INTO commercial_product_applications (product_id, application_key, name)
VALUES
  ('c1000000-0000-4000-8000-000000000001', 'asset_intelligence', 'Asset Intelligence'),
  ('c1000000-0000-4000-8000-000000000001', 'digital_twin', 'Digital Twin'),
  (
    'c1000000-0000-4000-8000-000000000001',
    'engineering_model_interoperability',
    'Engineering Models'
  )
ON CONFLICT (product_id, application_key) DO UPDATE
SET name = EXCLUDED.name,
    updated_at = NOW(),
    deleted_at = NULL;
