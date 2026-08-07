import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");

describe("Phase 10G Asset Intelligence Lifecycle architecture lock", () => {
  it("defines exactly 55 gates (A–BC)", () => {
    const gatesSource = readFileSync(
      resolve(
        root,
        "packages/asset-intelligence-certification/src/phase10g/gates.ts",
      ),
      "utf8",
    );
    const ids = [...gatesSource.matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(55);
    expect(ids[0]).toBe("A");
    expect(ids[ids.length - 1]).toBe("BC");
  });

  it("exports lifecycle readiness and pins Phase 10F authoritative baseline", () => {
    const version = readFileSync(
      resolve(root, "packages/asset-intelligence/src/version.ts"),
      "utf8",
    );
    expect(version).toMatch(
      /ASSET_INTELLIGENCE_VERSION = "0\.[78]\.0-(lifecycle|risk-priority)"/,
    );
    expect(version).toMatch(/LIFECYCLE_CONTEXT_ENGINE_READY = true/);
    expect(version).toMatch(/LIFECYCLE_TAXONOMY_REGISTRY_READY = true/);
    expect(version).toMatch(/LIFECYCLE_HEALTH_CONTRIBUTION_ENABLED = false/);
    expect(version).toMatch(
      /CANONICAL_ASSET_LIFECYCLE_OWNERSHIP = "engineering_os_shared_domain"/,
    );
    expect(version).toMatch(
      /ASSET_LIFECYCLE_INTELLIGENCE_OWNERSHIP = "asset_intelligence"/,
    );
    expect(version).toMatch(/PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/);
    expect(version).toMatch(/PRODUCTION_ASSET_INTELLIGENCE_READY = false/);
    expect(version).toMatch(/ACCURACY_CLAIMS_CERTIFIED = false/);
    expect(version).toMatch(/RUL_CLAIMS_CERTIFIED = false/);
    expect(version).toMatch(/PROBABILITY_OF_FAILURE_CERTIFIED = false/);
    expect(version).toMatch(/ASSET_PRIORITY_ENGINE_READY = (false|true)/);
    expect(version).toMatch(/MULTI_SOURCE_FUSION_READY = false/);
    expect(version).toMatch(
      /PHASE_10F_CERTIFIED_COMMIT = "94019ae995468ccddadc78a203e92e8460fe4bf0"/,
    );
    expect(version).toMatch(/PHASE_10F_RECERTIFICATION_RUN = "31150273985"/);
    expect(version).toMatch(
      /ENGINEERING_TIME_SERIES_READY = true/,
    );
  });

  it("keeps lifecycle out of Health Index composition", () => {
    const hc = readFileSync(
      resolve(root, "packages/asset-intelligence/src/domain/health-composer.ts"),
      "utf8",
    );
    expect(hc).toMatch(/LIFECYCLE_HEALTH_CONTRIBUTION_ENABLED = false/);
  });

  it("has LifecycleContextEngine, lifecycle state, and taxonomy registry", () => {
    const engine = readFileSync(
      resolve(root, "packages/asset-intelligence/src/domain/lifecycle-engine.ts"),
      "utf8",
    );
    expect(engine).toMatch(/class LifecycleContextEngine/);

    const lifecycle = readFileSync(
      resolve(root, "packages/asset-intelligence/src/domain/lifecycle.ts"),
      "utf8",
    );
    expect(lifecycle).toMatch(/AssetLifecycleIntelligenceState/);
    expect(lifecycle).toMatch(/LifecycleTransitionCandidate/);
    expect(lifecycle).toMatch(/mutatesCanonicalLifecycle: false/);

    const reference = readFileSync(
      resolve(root, "packages/asset-intelligence/src/domain/lifecycle-reference.ts"),
      "utf8",
    );
    expect(reference).toMatch(/engineering_os_shared_domain/);
    expect(reference).toMatch(/writeBackForbidden: true/);

    const taxonomy = readFileSync(
      resolve(root, "packages/asset-intelligence/src/domain/lifecycle-taxonomy.ts"),
      "utf8",
    );
    expect(taxonomy).toMatch(/class LifecycleTaxonomyRegistry/);
  });

  it("has lifecycle docs, migration lineage, workflow, HTTP route, and cert runner", () => {
    expect(
      existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_LIFECYCLE_MODEL.md")),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          root,
          "supabase/migrations/20260807160000_batch_55_asset_intelligence_timeseries.sql",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          root,
          "supabase/migrations/20260807161000_batch_55b_asset_intelligence_degradation_created_by.sql",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(root, "supabase/migrations/20260807170000_batch_56_asset_intelligence_lifecycle.sql"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(root, ".github/workflows/phase-10g-asset-intelligence-lifecycle.yml"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          root,
          "packages/asset-intelligence-certification/scripts/run-phase10g-certification.ts",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          root,
          "apps/web/src/app/api/engineering/asset-intelligence/lifecycle/route.ts",
        ),
      ),
    ).toBe(true);
  });
});
