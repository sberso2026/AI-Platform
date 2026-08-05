-- Phase 7B — Certification-only reference-os commercial product
-- Not marketplace visible; used solely for multi-OS isolation certification.

INSERT INTO commercial_products (
  id, category_id, slug, name, product_type, description, icon,
  lifecycle_status, visibility, marketplace_visible, metadata
) VALUES (
  'c1000000-0000-4000-8000-000000000006',
  'a1000000-0000-4000-8000-000000000001',
  'reference-os',
  'Reference OS (Certification Only)',
  'operating_system',
  'Minimal non-business OS fixture for multi-OS isolation certification. Not a customer product.',
  'Box',
  'active',
  'private',
  FALSE,
  '{"certificationOnly": true}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  marketplace_visible = FALSE,
  visibility = 'private',
  metadata = COALESCE(commercial_products.metadata, '{}'::jsonb) || '{"certificationOnly": true}'::jsonb;

INSERT INTO commercial_product_versions (product_id, version, release_channel, is_current)
VALUES ('c1000000-0000-4000-8000-000000000006', '0.1.0', 'stable', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO commercial_plans (id, product_id, slug, name, edition, billing_model, trial_days)
VALUES (
  'd1000000-0000-4000-8000-000000000006',
  'c1000000-0000-4000-8000-000000000006',
  'reference-os-cert',
  'Reference OS Certification',
  'certification',
  'free',
  0
)
ON CONFLICT DO NOTHING;
