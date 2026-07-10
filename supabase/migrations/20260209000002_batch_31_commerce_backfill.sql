-- RTB Commerce Phase 2 — Plan entitlements, product applications, tenant backfill

INSERT INTO commercial_features (feature_key, name, description) VALUES
  ('ai_ocr', 'AI OCR', 'Optical character recognition'),
  ('speech_transcription', 'Speech Transcription', 'Audio transcription'),
  ('api_access', 'API Access', 'Platform API access'),
  ('advanced_analytics', 'Advanced Analytics', 'Premium analytics'),
  ('premium_support', 'Premium Support', 'Priority support tier')
ON CONFLICT (feature_key) DO NOTHING;

INSERT INTO commercial_product_applications (product_id, application_key, name) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'project_intelligence', 'Project Intelligence'),
  ('c1000000-0000-4000-8000-000000000001', 'inspection_intelligence', 'Inspection Intelligence'),
  ('c1000000-0000-4000-8000-000000000001', 'project_controls', 'Project Controls'),
  ('c1000000-0000-4000-8000-000000000001', 'meetings', 'Meetings'),
  ('c1000000-0000-4000-8000-000000000001', 'documents', 'Documents'),
  ('c1000000-0000-4000-8000-000000000001', 'structural_intelligence', 'Structural Intelligence'),
  ('c1000000-0000-4000-8000-000000000001', 'knowledge', 'Knowledge')
ON CONFLICT (product_id, application_key) DO NOTHING;

INSERT INTO commercial_plan_entitlements (plan_id, entitlement_type, entitlement_key, value_type, boolean_value, integer_value) VALUES
  ('d1000000-0000-4000-8000-000000000001', 'product_access', 'engineering-os', 'boolean', TRUE, NULL),
  ('d1000000-0000-4000-8000-000000000001', 'application_access', 'project_intelligence', 'boolean', TRUE, NULL),
  ('d1000000-0000-4000-8000-000000000001', 'application_access', 'inspection_intelligence', 'boolean', TRUE, NULL),
  ('d1000000-0000-4000-8000-000000000001', 'application_access', 'project_controls', 'boolean', TRUE, NULL),
  ('d1000000-0000-4000-8000-000000000001', 'application_access', 'documents', 'boolean', TRUE, NULL),
  ('d1000000-0000-4000-8000-000000000001', 'application_access', 'meetings', 'boolean', TRUE, NULL),
  ('d1000000-0000-4000-8000-000000000001', 'application_access', 'knowledge', 'boolean', TRUE, NULL),
  ('d1000000-0000-4000-8000-000000000001', 'feature_access', 'ai_ocr', 'boolean', TRUE, NULL),
  ('d1000000-0000-4000-8000-000000000001', 'seat_limit', 'default', 'integer', NULL, 100),
  ('d1000000-0000-4000-8000-000000000002', 'product_access', 'engineering-os', 'boolean', TRUE, NULL),
  ('d1000000-0000-4000-8000-000000000002', 'application_access', 'project_intelligence', 'boolean', TRUE, NULL),
  ('d1000000-0000-4000-8000-000000000002', 'seat_limit', 'default', 'integer', NULL, 5)
ON CONFLICT (plan_id, entitlement_type, entitlement_key) DO NOTHING;

-- Idempotent legacy access backfill for existing tenants
DO $$
DECLARE
  v_tenant RECORD;
  v_sub_id UUID;
  v_pool_id UUID;
  v_member RECORD;
  v_product_id UUID := 'c1000000-0000-4000-8000-000000000001';
  v_plan_id UUID := 'd1000000-0000-4000-8000-000000000001';
BEGIN
  FOR v_tenant IN SELECT id FROM tenants WHERE status = 'active' LOOP
    IF EXISTS (
      SELECT 1 FROM commercial_subscriptions
      WHERE tenant_id = v_tenant.id AND product_id = v_product_id AND deleted_at IS NULL
    ) THEN
      CONTINUE;
    END IF;

    INSERT INTO commercial_subscriptions (
      tenant_id, product_id, plan_id, status, quantity,
      billing_interval, currency, activated_at, metadata, plan_snapshot_json
    ) VALUES (
      v_tenant.id, v_product_id, v_plan_id, 'active', 1,
      'annual', 'AUD', NOW(),
      jsonb_build_object('source', 'migration_legacy_access', 'migrated_at', NOW()),
      jsonb_build_object('plan_id', v_plan_id, 'source', 'migration_legacy_access')
    )
    RETURNING id INTO v_sub_id;

    INSERT INTO commercial_subscription_events (
      tenant_id, subscription_id, event_type, previous_status, new_status,
      from_status, to_status, effective_at, actor_type, source, event_payload, payload
    ) VALUES (
      v_tenant.id, v_sub_id, 'subscription.activated', NULL, 'active',
      NULL, 'active', NOW(), 'system', 'migration_legacy_access',
      jsonb_build_object('source', 'migration_legacy_access'),
      jsonb_build_object('source', 'migration_legacy_access')
    );

    INSERT INTO commercial_licenses (
      tenant_id, product_id, subscription_id, license_type, status,
      valid_from, issued_at, activated_at, max_seats
    ) VALUES (
      v_tenant.id, v_product_id, v_sub_id, 'product', 'active',
      NOW(), NOW(), NOW(), 100
    );

    INSERT INTO commercial_licenses (tenant_id, product_id, subscription_id, application_key, license_type, status, valid_from, issued_at, activated_at)
    SELECT v_tenant.id, v_product_id, v_sub_id, pa.application_key, 'application', 'active', NOW(), NOW(), NOW()
    FROM commercial_product_applications pa
    WHERE pa.product_id = v_product_id
      AND NOT EXISTS (
        SELECT 1 FROM commercial_licenses cl
        WHERE cl.tenant_id = v_tenant.id
          AND cl.subscription_id = v_sub_id
          AND cl.application_key = pa.application_key
          AND cl.deleted_at IS NULL
      );

    INSERT INTO commercial_seats (tenant_id, product_id, subscription_id, pool_name, total_seats, assigned_seats)
    VALUES (v_tenant.id, v_product_id, v_sub_id, 'default', 100, 0)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_pool_id;

    IF v_pool_id IS NULL THEN
      SELECT id INTO v_pool_id FROM commercial_seats
      WHERE tenant_id = v_tenant.id AND product_id = v_product_id AND deleted_at IS NULL
      LIMIT 1;
    END IF;

    FOR v_member IN
      SELECT user_id FROM tenant_memberships
      WHERE tenant_id = v_tenant.id AND status = 'active'
    LOOP
      INSERT INTO commercial_seat_assignments (
        tenant_id, seat_pool_id, subscription_id, user_id, status, assigned_at
      ) VALUES (
        v_tenant.id, v_pool_id, v_sub_id, v_member.user_id, 'active', NOW()
      )
      ON CONFLICT (seat_pool_id, user_id) DO NOTHING;
    END LOOP;

    UPDATE commercial_seats
    SET assigned_seats = (
      SELECT COUNT(*) FROM commercial_seat_assignments
      WHERE seat_pool_id = v_pool_id AND status = 'active' AND deleted_at IS NULL
    )
    WHERE id = v_pool_id;
  END LOOP;
END $$;
