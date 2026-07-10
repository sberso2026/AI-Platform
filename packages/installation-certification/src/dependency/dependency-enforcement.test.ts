import { describe, expect, it } from "vitest";

import { isCertificationMode, loadFixturesManifest } from "../lib/env.js";
import { createAdminClient } from "../lib/supabase.js";

const skipUnlessReady = !isCertificationMode() && !process.env.SUPABASE_URL;

describe.skipIf(skipUnlessReady)("Application dependency enforcement", () => {
  it("catalog includes Project Intelligence dependency on Engineering OS", async () => {
    const admin = createAdminClient();
    const { data: products } = await admin
      .from("commercial_products")
      .select("id, slug")
      .is("tenant_id", null)
      .in("slug", ["engineering-os", "project-intelligence"]);

    const eng = (products ?? []).find((p) => p.slug === "engineering-os");
    const pi = (products ?? []).find((p) => p.slug === "project-intelligence");
    expect(eng?.id).toBeTruthy();
    expect(pi?.id).toBeTruthy();

    const { data: deps } = await admin
      .from("commercial_installation_dependencies")
      .select("depends_on_product_id, dependency_type")
      .eq("product_id", pi!.id as string)
      .is("tenant_id", null)
      .eq("dependency_type", "required");

    expect((deps ?? []).some((d) => d.depends_on_product_id === eng!.id)).toBe(true);
  });

  it("fixture tenant has parent product installation before app installations", async () => {
    const manifest = loadFixturesManifest();
    if (!manifest) {
      if (isCertificationMode()) throw new Error("cert-fixtures.json required");
      return;
    }

    const admin = createAdminClient();
    const productInstallId = manifest.tenantA.installations.productInstallationId;

    const { data: apps } = await admin
      .from("commercial_application_installations")
      .select("application_key, parent_product_installation_id")
      .eq("tenant_id", manifest.tenantA.id);

    expect((apps ?? []).length).toBeGreaterThan(0);
    for (const app of apps ?? []) {
      expect(app.parent_product_installation_id).toBe(productInstallId);
    }
  });

  it("tenant B cannot read tenant A installation dependencies rows", async () => {
    const manifest = loadFixturesManifest();
    if (!manifest) return;

    const { createAuthedClient } = await import("../lib/supabase.js");
    const client = createAuthedClient(manifest.tenantB.users.owner.jwt);
    const { data } = await client
      .from("commercial_installations")
      .select("id")
      .eq("tenant_id", manifest.tenantA.id);
    expect(data ?? []).toHaveLength(0);
  });
});
