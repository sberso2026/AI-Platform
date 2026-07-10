-- RTB Platform Commerce Engine — Batch 30 Seed Data
-- Generic platform catalog (not product-specific)

INSERT INTO commercial_categories (id, slug, name, description, sort_order)
VALUES
  ('a1000000-0000-4000-8000-000000000001', 'operating-systems', 'Operating Systems', 'RTB domain operating systems', 1),
  ('a1000000-0000-4000-8000-000000000002', 'applications', 'Applications', 'Product applications and add-ons', 2),
  ('a1000000-0000-4000-8000-000000000003', 'services', 'Platform Services', 'Shared platform services', 3)
ON CONFLICT DO NOTHING;

INSERT INTO commercial_publishers (id, slug, name, publisher_type, is_verified)
VALUES
  ('b1000000-0000-4000-8000-000000000001', 'rtb', 'RTB Engineering', 'rtb', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO commercial_products (
  id, category_id, slug, name, product_type, description, icon,
  lifecycle_status, visibility, marketplace_visible
) VALUES
  (
    'c1000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    'engineering-os',
    'Engineering Operating System',
    'operating_system',
    'Engineering design, analysis, and project management',
    'Wrench',
    'active', 'public', TRUE
  ),
  (
    'c1000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000001',
    'business-os',
    'Business Operating System',
    'operating_system',
    'AI-assisted business operations, finance, and strategy',
    'Briefcase',
    'preview', 'marketplace', TRUE
  ),
  (
    'c1000000-0000-4000-8000-000000000003',
    'a1000000-0000-4000-8000-000000000001',
    'industrial-os',
    'Industrial Operating System',
    'operating_system',
    'Manufacturing, process control, and industrial automation',
    'Factory',
    'draft', 'private', FALSE
  ),
  (
    'c1000000-0000-4000-8000-000000000004',
    'a1000000-0000-4000-8000-000000000002',
    'project-intelligence',
    'Project Intelligence',
    'application',
    'Engineering project analytics and decision support',
    'LineChart',
    'active', 'public', TRUE
  ),
  (
    'c1000000-0000-4000-8000-000000000005',
    'a1000000-0000-4000-8000-000000000002',
    'inspection-intelligence',
    'Inspection Intelligence',
    'application',
    'Inspection planning and findings management',
    'Search',
    'active', 'public', TRUE
  )
ON CONFLICT DO NOTHING;

INSERT INTO commercial_product_versions (product_id, version, release_channel, is_current)
SELECT id, '0.2.0', 'stable', TRUE
FROM commercial_products
WHERE slug IN ('engineering-os', 'business-os')
ON CONFLICT DO NOTHING;

INSERT INTO commercial_plans (id, product_id, slug, name, edition, billing_model, trial_days)
VALUES
  (
    'd1000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000001',
    'enterprise',
    'Enterprise',
    'enterprise',
    'seat',
    NULL
  ),
  (
    'd1000000-0000-4000-8000-000000000002',
    'c1000000-0000-4000-8000-000000000001',
    'trial',
    'Trial',
    'trial',
    'free',
    14
  ),
  (
    'd1000000-0000-4000-8000-000000000003',
    'c1000000-0000-4000-8000-000000000002',
    'professional',
    'Professional',
    'professional',
    'seat',
    30
  )
ON CONFLICT DO NOTHING;

INSERT INTO commercial_plan_prices (plan_id, currency, billing_period, amount_cents, seat_price_cents, min_seats)
VALUES
  ('d1000000-0000-4000-8000-000000000001', 'AUD', 'annual', 0, 12000, 5),
  ('d1000000-0000-4000-8000-000000000002', 'AUD', 'monthly', 0, 0, 1),
  ('d1000000-0000-4000-8000-000000000003', 'AUD', 'monthly', 0, 4900, 1)
ON CONFLICT DO NOTHING;

INSERT INTO commercial_usage_types (metric_key, name, description, unit, aggregation)
VALUES
  ('ai_tokens', 'AI Tokens', 'LLM token consumption', 'tokens', 'sum'),
  ('storage_gb', 'Storage', 'File and document storage', 'gb', 'max'),
  ('documents', 'Documents', 'Document uploads and processing', 'count', 'sum'),
  ('ocr_pages', 'OCR Pages', 'OCR page processing', 'pages', 'sum'),
  ('transcriptions', 'Transcriptions', 'Audio transcription minutes', 'minutes', 'sum'),
  ('meetings', 'Meetings', 'Meeting intelligence sessions', 'count', 'sum'),
  ('api_calls', 'API Calls', 'Platform API invocations', 'count', 'sum'),
  ('compute_hours', 'Compute', 'Compute resource hours', 'hours', 'sum'),
  ('bandwidth_gb', 'Bandwidth', 'Egress bandwidth', 'gb', 'sum'),
  ('exports', 'Exports', 'Data export operations', 'count', 'sum'),
  ('automation_executions', 'Automation Executions', 'Workflow and automation runs', 'count', 'sum')
ON CONFLICT (metric_key) DO NOTHING;

INSERT INTO commercial_marketplace_products (product_id, publisher_id, listing_status, visibility)
SELECT p.id, 'b1000000-0000-4000-8000-000000000001', 'published', 'public'
FROM commercial_products p
WHERE p.slug IN ('engineering-os', 'business-os', 'project-intelligence', 'inspection-intelligence')
ON CONFLICT DO NOTHING;
