import { createClient } from "@supabase/supabase-js";

import { HOSTED_PROJECT_REF, resolveSupabaseUrl } from "./env.js";

const ENGINEERING_PRODUCT_ID = "c1000000-0000-4000-8000-000000000001";
const ENGINEERING_SLUG = "engineering-os";

export interface FlowBFixtureManifest {
  tenantA: {
    id: string;
    subscriptionId?: string;
    seatPoolId?: string;
    users: {
      owner: { email: string; userId?: string };
    };
    workspaces: Array<{ id: string; slug: string }>;
    installations: {
      productInstallationId: string;
    };
  };
}

/**
 * Fail fast if Engineering OS fixture state is not ready for Flow B.
 * Never logs secret values.
 */
export async function assertEngineeringOsFixtureReady(
  manifest: FlowBFixtureManifest
): Promise<void> {
  const url = resolveSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    throw new Error("Fixture verification requires SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  const projectRef = url.match(/https:\/\/([^.]+)/)?.[1];
  if (projectRef !== HOSTED_PROJECT_REF) {
    throw new Error(
      `Fixture verification refused: project ${projectRef ?? "unknown"} is not hosted staging ${HOSTED_PROJECT_REF}`
    );
  }

  const admin = createClient(url, serviceKey);
  const tenantId = manifest.tenantA.id;
  const installationId = manifest.tenantA.installations.productInstallationId;
  const errors: string[] = [];

  const { data: product, error: productError } = await admin
    .from("commercial_products")
    .select("id, slug, name")
    .eq("id", ENGINEERING_PRODUCT_ID)
    .maybeSingle();

  if (productError) errors.push(`catalogue lookup failed: ${productError.message}`);
  if (!product) errors.push("Engineering OS catalogue row missing");
  if (product && product.slug !== ENGINEERING_SLUG) {
    errors.push(`product slug expected ${ENGINEERING_SLUG}, got ${String(product.slug)}`);
  }

  const { data: subscription } = await admin
    .from("commercial_subscriptions")
    .select("id, status")
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  if (!subscription) errors.push("tenant A active subscription missing");

  const { data: licence } = await admin
    .from("commercial_licenses")
    .select("id, status")
    .eq("tenant_id", tenantId)
    .eq("product_id", ENGINEERING_PRODUCT_ID)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  if (!licence) errors.push("tenant A active Engineering OS licence missing");

  const { data: installation } = await admin
    .from("commercial_installations")
    .select("id, status, current_state, desired_state, product_id")
    .eq("id", installationId)
    .maybeSingle();
  if (!installation) {
    errors.push("Engineering OS product installation missing");
  } else {
    if (installation.product_id !== ENGINEERING_PRODUCT_ID) {
      errors.push("installation product_id is not Engineering OS");
    }
    if (installation.status !== "active") {
      errors.push(`installation status expected active, got ${String(installation.status)}`);
    }
    if (installation.current_state && installation.current_state !== "active") {
      errors.push(`installation current_state expected active, got ${String(installation.current_state)}`);
    }
  }

  if (!manifest.tenantA.workspaces?.length) {
    errors.push("tenant A workspace assignment fixture missing");
  }

  if (!manifest.tenantA.users?.owner?.email) {
    errors.push("authorized owner user missing from fixture manifest");
  }

  if (errors.length > 0) {
    throw new Error(
      `Engineering OS Flow B fixture verification failed:\n- ${errors.join("\n- ")}`
    );
  }

  console.log("[fixture-verify] Engineering OS Flow B prerequisites PASS");
  console.log(`  productSlug: ${ENGINEERING_SLUG}`);
  console.log(`  installationId: ${installationId}`);
  console.log(`  tenantId: ${tenantId}`);
}
