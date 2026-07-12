import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  CERTIFICATION_ARTIFACT_SCHEMA_VERSION,
  scanCertSourceForWeakenedAssertions,
  validateCertificationArtifact,
  type CertificationArtifactV1,
} from "./lib/certification-artifact.js";
import { assertNoServerError } from "./lib/uninstall-contract.js";

const INVALID_HAPPY_PATH_STATUSES = [201, 202, 204, 409, 422, 500];

function minimalArtifact(overrides: Partial<CertificationArtifactV1>): CertificationArtifactV1 {
  return {
    schemaVersion: CERTIFICATION_ARTIFACT_SCHEMA_VERSION,
    verdict: "PASS",
    phase: 4,
    environment: "https://example.supabase.co",
    commitSha: "abc123",
    branch: "master",
    buildTimestamp: new Date().toISOString(),
    packageVersion: "0.1.0",
    supabaseProjectRef: "wcydlhqiqdwgoaqrlget",
    certificationTarget: "hosted_staging",
    environmentSafety: {
      certificationTarget: "hosted_staging",
      allowProductionCertification: false,
      releaseCheckMode: false,
      supabaseUrlPresent: true,
      supabaseAnonKeyPresent: true,
      serviceRoleServerSideOnly: true,
      noServiceRoleInClientBundle: true,
      noServiceRoleInNextPublic: true,
      hostedProjectRef: "wcydlhqiqdwgoaqrlget",
      destructiveTestsAllowed: true,
      productionProjectBlocked: true,
      stagingProjectAllowlisted: true,
    },
    gateSummary: { total: 12, passed: 12, failed: 0, skipped: 0, requiredMissing: [] },
    httpCertificationSummary: [],
    playwrightCertificationSummary: [],
    serverErrorCaptureCount: 0,
    gates: [],
    failures: [],
    skippedTests: 0,
    artifacts: [],
    migrationChecksums: { "20260101000001.sql": "abc" },
    workingTreeClean: true,
    releaseEligible: true,
    releaseEligibilityReasons: [],
    productionCertificationBlocked: true,
    requiredGateCount: 12,
    passedGateCount: 12,
    failedGateCount: 0,
    skippedGateCount: 0,
    unexpectedServerErrorCount: 0,
    ...overrides,
  };
}

describe("Phase 5 — certification regression guards", () => {
  it("rejects weakened allowlists including 500 or 503 in certification sources", () => {
    const pkgRoot = resolve(process.cwd());
    const sources = [
      readFileSync(resolve(pkgRoot, "src/uninstall-http-certification.ts"), "utf8"),
      readFileSync(resolve(pkgRoot, "playwright/flow-n-uninstall.spec.ts"), "utf8"),
      readFileSync(resolve(pkgRoot, "playwright/flows-a-p.spec.ts"), "utf8"),
    ].join("\n");
    const violations = scanCertSourceForWeakenedAssertions(sources);
    expect(violations).toEqual([]);
  });

  it("forbids weakened uninstall probe in flows-a-p (not 401 + below 600)", () => {
    const flows = readFileSync(resolve(process.cwd(), "playwright/flows-a-p.spec.ts"), "utf8");
    expect(flows).not.toMatch(/\/installations\/\$\{[^}]+\}\/uninstall/);
    expect(flows).not.toMatch(/Logical uninstall endpoint/);
    expect(flows).not.toMatch(/not\.toBe\(401\)/);
    expect(flows).not.toMatch(/toBeLessThan\(600\)/);
    expect(flows).not.toMatch(/\[\s*200,\s*403,\s*404,\s*409,\s*422,\s*500\s*\]/);
  });

  it("flow-n uninstall scenarios require exact status per case", () => {
    const flowN = readFileSync(resolve(process.cwd(), "playwright/flow-n-uninstall.spec.ts"), "utf8");
    expect(flowN).toMatch(/assertExactUninstallStatus\(res\.status\(\),\s*401\)/);
    expect(flowN).toMatch(/assertExactUninstallStatus\(res\.status\(\),\s*403\)/);
    expect(flowN).toMatch(/assertExactUninstallStatus\(res\.status\(\),\s*404\)/);
    expect(flowN).toMatch(/assertExactUninstallStatus\(res\.status\(\),\s*409\)/);
    expect(flowN).toMatch(/assertExactUninstallStatus\(res\.status\(\),\s*422\)/);
    expect(flowN).not.toMatch(/toBeLessThan\(600\)/);
    expect(flowN).not.toMatch(/not\.toBe\(401\)/);
  });

  it("Playwright specs do not import vitest expect", () => {
    const flowN = readFileSync(resolve(process.cwd(), "playwright/flow-n-uninstall.spec.ts"), "utf8");
    const flows = readFileSync(resolve(process.cwd(), "playwright/flows-a-p.spec.ts"), "utf8");
    expect(flowN.includes('from "vitest"')).toBe(false);
    expect(flows.includes('from "vitest"')).toBe(false);
    expect(flowN.includes('from "vitest"')).toBe(false);
  });

  it("happy-path uninstall requires exact 200 status in certification sources", () => {
    const http = readFileSync(resolve(process.cwd(), "src/uninstall-http-certification.ts"), "utf8");
    const flowN = readFileSync(resolve(process.cwd(), "playwright/flow-n-uninstall.spec.ts"), "utf8");
    expect(http).toMatch(/assertExactUninstallStatus\(res\.status,\s*200\)/);
    expect(http).toMatch(/happy-path uninstall/);
    expect(flowN).toMatch(/status\)\.toBe\("uninstalled"\)/);
    expect(flowN).not.toMatch(/\[200,\s*201,\s*202/);
    expect(flowN).not.toMatch(/toContain\(.*500/);
    for (const status of INVALID_HAPPY_PATH_STATUSES) {
      expect(status).not.toBe(200);
    }
    expect(() => assertNoServerError(500)).toThrow();
    expect(() => assertNoServerError(503)).toThrow();
    expect(() => assertNoServerError(200)).not.toThrow();
  });

  it("artifact validator rejects missing commit SHA and project ref", () => {
    const base = minimalArtifact({ commitSha: "", supabaseProjectRef: "" });
    expect(() => validateCertificationArtifact(base)).toThrow(/commitSha/);
  });

  it("artifact validator rejects 5xx capture counts", () => {
    const artifact = minimalArtifact({ serverErrorCaptureCount: 1, unexpectedServerErrorCount: 1 });
    expect(() => validateCertificationArtifact(artifact)).toThrow(/5xx/);
  });

  it("post-uninstall health expectation remains exact 404 when not 200", () => {
    const source = readFileSync(resolve(process.cwd(), "src/uninstall-http-certification.ts"), "utf8");
    expect(source).toContain("expect(health.status).toBe(404)");
    expect(source).not.toContain("503");
  });
});

describe("Phase 5 — product detail readiness contract", () => {
  const pageSource = readFileSync(
    resolve(process.cwd(), "../../apps/web/src/app/(platform)/system/products/[productSlug]/page.tsx"),
    "utf8"
  );
  const tabsSource = readFileSync(
    resolve(
      process.cwd(),
      "../../apps/web/src/components/commerce/product-detail/product-detail-tabs.tsx"
    ),
    "utf8"
  );
  const flowB = readFileSync(resolve(process.cwd(), "playwright/flows-a-p.spec.ts"), "utf8");

  it("exposes product-detail-ready only in the ready state", () => {
    expect(pageSource).toContain('data-testid="product-detail-ready"');
    expect(pageSource).toContain('status: "ready"');
    expect(pageSource).toContain('data-testid="product-detail-loading"');
    expect(pageSource).toContain('data-testid="product-detail-error"');
    expect(pageSource).toMatch(/status === "loading"[\s\S]*product-detail-loading/);
    expect(pageSource).toMatch(/status === "error"[\s\S]*product-detail-error/);
    expect(pageSource).not.toMatch(/waitForTimeout/);
    expect(pageSource).not.toMatch(/setTimeout\(\s*\(\)\s*=>/);
  });

  it("renders accessible tab roles with the readiness marker", () => {
    expect(tabsSource).toContain('role="tablist"');
    expect(tabsSource).toContain('role="tab"');
    expect(tabsSource).toContain("aria-selected");
    expect(tabsSource).toContain("aria-controls");
    expect(pageSource).toContain('role="tabpanel"');
    expect(pageSource).toMatch(/product-detail-ready[\s\S]*ProductDetailTabs/);
  });

  it("Flow B validates URL, heading, API success, and readiness before tablist", () => {
    expect(flowB).toContain("assertProductDetailRoute");
    expect(flowB).toContain("product-detail-ready");
    expect(flowB).toContain("Engineering Operating System");
    expect(flowB).toContain("waitUntil: \"domcontentloaded\"");
    expect(flowB).toContain("Product administration API failed");
    expect(flowB).toContain("diag.assertClean");
    expect(flowB).not.toMatch(/waitForTimeout/);
    const readyIdx = flowB.indexOf('getByTestId("product-detail-ready")');
    const tablistIdx = flowB.indexOf('getByRole("tablist"');
    expect(readyIdx).toBeGreaterThan(-1);
    expect(tablistIdx).toBeGreaterThan(readyIdx);
  });

  it("fixture verification runs during provision", () => {
    const provision = readFileSync(resolve(process.cwd(), "scripts/provision-fixtures.ts"), "utf8");
    expect(provision).toContain("assertEngineeringOsFixtureReady");
  });
});

describe("Phase 5 — release eligibility production block signal", () => {
  it("treats disallowed production certification as a non-blocking safety signal", async () => {
    const { computeReleaseEligibility } = await import("./lib/release-eligibility.js");
    const artifact = minimalArtifact({
      environmentSafety: {
        ...minimalArtifact({}).environmentSafety,
        allowProductionCertification: false,
        productionProjectBlocked: false,
      },
    });
    const result = computeReleaseEligibility(artifact, {
      workingTree: { clean: true, allowDirtyOverride: false, dirtyPaths: [] },
      expectedCommitSha: "abc123",
      buildIdentityCommitSha: "abc123",
    });
    expect(result.productionCertificationBlocked).toBe(true);
    expect(result.releaseEligible).toBe(true);
  });
});
