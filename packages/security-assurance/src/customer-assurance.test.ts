import { describe, expect, it } from "vitest";
import {
  CUSTOMER_ASSURANCE_CONTRACT_NAMES,
  CUSTOMER_ASSURANCE_SEMANTICS,
  isCustomerDisclosable,
  normalizeDisclosureLevel,
} from "./customer-assurance-contracts";
import {
  CustomerAssuranceImplemented,
  S07ExternalPenTestComplete,
  S08CustomerSsoProductionReady,
  automaticCustomerAssurancePublicationEnabled,
  automaticExternalDisclosureEnabled,
  getSecurityAssuranceCustomerAssuranceDeclaration,
  phase15HReady,
} from "./customer-assurance-flags";
import { CustomerTrustCenterImplemented } from "./discovery-flags";
import { createCustomerAssuranceRuntime } from "./domain/customer-assurance/runtime";
import {
  SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION,
  SECURITY_ASSURANCE_VERSION,
  PHASE_15F_BASELINE_COMMIT,
  PHASE_15F_BASELINE_HOSTED_RUN,
} from "./version";

describe("Phase 15G Customer Assurance", () => {
  it("declares 1.0.0 on Phase 15F baseline", () => {
    expect(SECURITY_ASSURANCE_VERSION).toBe("1.0.0");
    expect(SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION).toBe(
      "1.0.0",
    );
    expect(PHASE_15F_BASELINE_COMMIT).toBe(
      "924b2eaa7f6bfc635d742c5310cff3a22ed5d446",
    );
    expect(PHASE_15F_BASELINE_HOSTED_RUN).toBe("31306360885");
  });

  it("exposes required contracts and semantics", () => {
    expect(CUSTOMER_ASSURANCE_CONTRACT_NAMES).toContain("CustomerAssuranceProfile");
    expect(CUSTOMER_ASSURANCE_CONTRACT_NAMES).toContain("AssuranceDisclosurePolicy");
    expect(CUSTOMER_ASSURANCE_CONTRACT_NAMES).toContain("AssuranceClaimReference");
    expect(CUSTOMER_ASSURANCE_CONTRACT_NAMES).toContain("CustomerAssurancePackage");
    expect(CUSTOMER_ASSURANCE_SEMANTICS.customerAssuranceNeqCertification).toBe(true);
    expect(CUSTOMER_ASSURANCE_SEMANTICS.noFullPublicTrustCenter).toBe(true);
  });

  it("fails closed on unknown disclosure classification", () => {
    expect(normalizeDisclosureLevel(undefined)).toBe("never_disclose");
    expect(normalizeDisclosureLevel("bogus" as never)).toBe("never_disclose");
    expect(isCustomerDisclosable("never_disclose", "authenticated_customer")).toBe(
      false,
    );
    expect(isCustomerDisclosable("restricted_internal", "authenticated_customer")).toBe(
      false,
    );
  });

  it("projects customer-safe claims without internal findings", () => {
    const { engine } = createCustomerAssuranceRuntime();
    const projection = engine.projectForAudience("authenticated_customer");
    expect(projection.internalFindingsExposed).toBe(false);
    expect(projection.certificationClaimed).toBe(false);
    expect(projection.universalScorePresent).toBe(false);
    expect(projection.tier1Requirements.s07Complete).toBe(false);
    expect(projection.tier1Requirements.s08ProductionReady).toBe(false);
    expect(projection.claims.every((c) => c.disclosureLevel !== "never_disclose")).toBe(
      true,
    );
    expect(
      projection.frameworkSummaries.some((f) =>
        /ISO compliant|SOC 2 compliant|passed Essential Eight/i.test(
          f.customerSafeSummary,
        ),
      ),
    ).toBe(false);
  });

  it("does not invent positive claims without evidence", () => {
    const { engine } = createCustomerAssuranceRuntime();
    const claim = engine.listClaims().find((c) => c.claimId === "claim-mfa-privileged")!;
    expect(claim.evidenceRefs.length).toBeGreaterThan(0);
    expect(claim.status).toBe("supported");
  });

  it("marks stale supported claims requires_review path", () => {
    const { engine } = createCustomerAssuranceRuntime();
    const stale = engine.evaluateClaimFreshness("claim-mfa-privileged", true);
    expect(stale.status).toBe("stale");
  });

  it("publishes packages immutably with disclosure audit", () => {
    const { engine } = createCustomerAssuranceRuntime();
    const pkg = engine.publishPackage({
      packageId: "pkg-demo",
      claimIds: ["claim-mfa-privileged"],
      actorId: "assurance-admin",
      tenantId: "tenant-a",
    });
    expect(pkg.immutableOncePublished).toBe(true);
    expect(pkg.certificationClaimed).toBe(false);
    expect(engine.listDisclosures().length).toBeGreaterThan(0);
    expect(engine.assertPackageTenantIsolation("pkg-demo", "tenant-a")).toBe(true);
    expect(engine.assertPackageTenantIsolation("pkg-demo", "tenant-b")).toBe(false);
  });

  it("keeps S07/S08 and Trust Center truthful", () => {
    expect(S07ExternalPenTestComplete).toBe(false);
    expect(S08CustomerSsoProductionReady).toBe(false);
    expect(CustomerTrustCenterImplemented).toBe(false);
    expect(automaticCustomerAssurancePublicationEnabled).toBe(false);
    expect(automaticExternalDisclosureEnabled).toBe(false);
    expect(CustomerAssuranceImplemented).toBe(true);
    expect(phase15HReady).toBe(true);
    const decl = getSecurityAssuranceCustomerAssuranceDeclaration();
    expect(decl.ComplianceIntelligenceImplemented).toBe(true);
    expect(decl.duplicateAssuranceStackDetected).toBe(false);
    expect(decl.duplicatePolicyEngineDetected).toBe(false);
  });

  it("exposes external assurance and filters sensitive metadata", () => {
    const { engine } = createCustomerAssuranceRuntime();
    const ext = engine.externalAssuranceSurface();
    expect(ext.find((e) => e.refId === "ext-pen-s07")?.state).toBe("not_available");
    expect(engine.dataResidencyState()).toBe("not_verified");
    const filtered = engine.filtersSensitiveMetadata({
      claimId: "x",
      systemPrompt: "secret",
      vulnerabilityDetail: "cve",
    });
    expect(filtered.claimId).toBe("x");
    expect(filtered.systemPrompt).toBeUndefined();
    expect(filtered.vulnerabilityDetail).toBeUndefined();
  });

  it("records bounded performance baselines", () => {
    const { engine } = createCustomerAssuranceRuntime();
    const b = engine.measureBaselines();
    expect(b.profileRetrievalMs).toBeLessThan(500);
    expect(b.claimEvaluationMs).toBeLessThan(500);
    expect(b.packageCompositionMs).toBeLessThan(1000);
  });

  it("reuses platform policy engine and files (no duplicates)", () => {
    const { reuses } = createCustomerAssuranceRuntime();
    expect(reuses.policyEngine).toBe(true);
    expect(reuses.platformFiles).toBe(true);
    expect(reuses.duplicatePolicyEngine).toBe(false);
    expect(reuses.duplicateFileStore).toBe(false);
    expect(reuses.duplicateAssuranceStack).toBe(false);
    expect(reuses.customerAssuranceReviewAction).toBe(
      "security_assurance.customer_assurance_review",
    );
    expect(reuses.trustCenterProduct).toBe(false);
  });
});
