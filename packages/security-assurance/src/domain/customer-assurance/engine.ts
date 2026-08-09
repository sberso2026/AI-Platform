import type {
  AssuranceClaimReference,
  AssuranceClaimStatus,
  AssuranceDisclosureLevel,
  AssuranceDisclosurePolicy,
  AssuranceDisclosureRecord,
  AssuranceDocumentReference,
  CustomerAssuranceAudience,
  CustomerAssurancePackage,
  CustomerAssuranceProfile,
  CustomerAssuranceProjection,
  CustomerSecurityQuestionnaireResponseReference,
  SubprocessorAssuranceReference,
} from "../../customer-assurance-contracts";
import {
  isCustomerDisclosable,
  normalizeDisclosureLevel,
} from "../../customer-assurance-contracts";
import type { SecurityEvidenceRegistry } from "../evidence-registry";
import type { SecurityPostureCompositionEngine } from "../posture-engine";
import { createSecurityAssuranceEvent } from "../events";
import {
  createSecurityAssuranceTimelineEvent,
  type SecurityAssuranceTimeline,
} from "../timeline";
import {
  SEED_APPROVED_CLAIMS,
  SEED_ASSURANCE_DOCUMENTS,
  SEED_CUSTOMER_PROFILE,
  SEED_DISCLOSURE_POLICIES,
  SEED_QUESTIONNAIRE_RESPONSES,
  SEED_SUBPROCESSORS,
} from "./seed-claims";

/**
 * CustomerAssuranceEngine — projects approved customer-safe assurance.
 * Does not certify, invent claims, auto-publish, or expose internal findings.
 */
export class CustomerAssuranceEngine {
  readonly kind = "customer_assurance_engine" as const;
  private policies = new Map<string, AssuranceDisclosurePolicy>();
  private claims = new Map<string, AssuranceClaimReference>();
  private documents = new Map<string, AssuranceDocumentReference>();
  private profiles = new Map<string, CustomerAssuranceProfile>();
  private packages = new Map<string, CustomerAssurancePackage>();
  private questionnaire = new Map<string, CustomerSecurityQuestionnaireResponseReference>();
  private subprocessors = new Map<string, SubprocessorAssuranceReference>();
  private disclosures: AssuranceDisclosureRecord[] = [];
  private events: ReturnType<typeof createSecurityAssuranceEvent>[] = [];

  readonly automaticCertificationEnabled = false as const;
  readonly automaticComplianceClaimEnabled = false as const;
  readonly automaticCustomerAssurancePublicationEnabled = false as const;
  readonly automaticExternalDisclosureEnabled = false as const;
  readonly automaticSecurityApprovalEnabled = false as const;
  readonly automaticRemediationEnabled = false as const;
  readonly S07ExternalPenTestComplete = false as const;
  readonly S08CustomerSsoProductionReady = false as const;
  readonly CustomerTrustCenterImplemented = false as const;
  readonly duplicateAssuranceStackDetected = false as const;
  readonly duplicatePolicyEngineDetected = false as const;

  constructor(
    private readonly evidence: SecurityEvidenceRegistry,
    private readonly posture: SecurityPostureCompositionEngine,
    private readonly timeline: SecurityAssuranceTimeline,
  ) {
    for (const p of SEED_DISCLOSURE_POLICIES) this.policies.set(p.policyId, p);
    for (const c of SEED_APPROVED_CLAIMS) this.claims.set(c.claimId, c);
    for (const d of SEED_ASSURANCE_DOCUMENTS) this.documents.set(d.documentId, d);
    this.profiles.set(SEED_CUSTOMER_PROFILE.profileId, SEED_CUSTOMER_PROFILE);
    for (const q of SEED_QUESTIONNAIRE_RESPONSES) this.questionnaire.set(q.responseId, q);
    for (const s of SEED_SUBPROCESSORS) this.subprocessors.set(s.subprocessorId, s);
  }

  listPolicies(): AssuranceDisclosurePolicy[] {
    return [...this.policies.values()];
  }
  listClaims(): AssuranceClaimReference[] {
    return [...this.claims.values()];
  }
  listDocuments(): AssuranceDocumentReference[] {
    return [...this.documents.values()];
  }
  listProfiles(): CustomerAssuranceProfile[] {
    return [...this.profiles.values()];
  }
  listPackages(): CustomerAssurancePackage[] {
    return [...this.packages.values()];
  }
  listQuestionnaireResponses(): CustomerSecurityQuestionnaireResponseReference[] {
    return [...this.questionnaire.values()];
  }
  listSubprocessors(): SubprocessorAssuranceReference[] {
    return [...this.subprocessors.values()];
  }
  listDisclosures(): AssuranceDisclosureRecord[] {
    return [...this.disclosures];
  }

  /** Positive claims require current supporting evidence when evidenceRefs present. */
  evaluateClaimFreshness(claimId: string, forceStaleEvidence?: boolean): AssuranceClaimReference {
    const claim = this.claims.get(claimId);
    if (!claim) throw new Error(`Unknown claim: ${claimId}`);
    if (claim.status === "requires_external_assurance" || claim.status === "not_disclosed") {
      return claim;
    }
    if (claim.evidenceRefs.length === 0 && claim.status === "supported") {
      // Missing evidence for positive claim → fail closed
      const next: AssuranceClaimReference = {
        ...claim,
        status: "unknown",
        limitations: [...claim.limitations, "No approved evidence → unknown / not_disclosed"],
      };
      this.claims.set(claimId, next);
      return next;
    }
    if (forceStaleEvidence && claim.status === "supported") {
      const next: AssuranceClaimReference = {
        ...claim,
        status: "stale",
        limitations: [...claim.limitations, "Supporting evidence stale — requires_review"],
      };
      this.claims.set(claimId, next);
      return next;
    }
    return claim;
  }

  projectForAudience(
    audience: CustomerAssuranceAudience,
    opts?: { tenantId?: string; profileId?: string },
  ): CustomerAssuranceProjection {
    const profile =
      this.profiles.get(opts?.profileId ?? "profile-platform-default") ??
      SEED_CUSTOMER_PROFILE;

    const claims = profile.approvedClaimIds
      .map((id) => this.claims.get(id)!)
      .filter(Boolean)
      .filter((c) => {
        const level = normalizeDisclosureLevel(c.disclosureLevel);
        return isCustomerDisclosable(level, audience);
      })
      .map((c) => this.evaluateClaimFreshness(c.claimId));

    const documents = profile.approvedDocumentIds
      .map((id) => this.documents.get(id)!)
      .filter(Boolean)
      .filter((d) => isCustomerDisclosable(normalizeDisclosureLevel(d.disclosureLevel), audience));

    // Internal findings must never be projected
    const projection: CustomerAssuranceProjection = {
      projectionId: `proj-${audience}-${opts?.tenantId ?? "platform"}`,
      profileId: profile.profileId,
      claims,
      documents,
      packages: [...this.packages.values()].filter((p) => {
        if (p.tenantId && opts?.tenantId && p.tenantId !== opts.tenantId) return false;
        return isCustomerDisclosable(normalizeDisclosureLevel(p.disclosureLevel), audience);
      }),
      frameworkSummaries: [
        {
          frameworkId: "NIST_CSF_2_0",
          customerSafeSummary: "mapped coverage available",
          status: "partially_supported",
        },
        {
          frameworkId: "ISO27001_2022",
          customerSafeSummary: "control mapping available (not certified)",
          status: "not_disclosed",
        },
        {
          frameworkId: "ESSENTIAL_EIGHT",
          customerSafeSummary: "applicability/mapping available; maturity not claimed",
          status: "partially_supported",
        },
        {
          frameworkId: "SOC2_TSC",
          customerSafeSummary: "mapping scaffold only (not attested)",
          status: "not_disclosed",
        },
      ],
      tier1Requirements: {
        s07ExternalPenTest: "REQUIRED_BEFORE_TIER1_PRODUCTION",
        s07Complete: false,
        s08CustomerSso: "REQUIRED_BEFORE_TIER1_PRODUCTION",
        s08ProductionReady: false,
      },
      universalScorePresent: false,
      certificationClaimed: false,
      internalFindingsExposed: false,
    };

    void this.evidence;
    this.posture.compose({
      snapshotId: `posture-from-ca-${projection.projectionId}`,
      scope: "platform",
    });

    return projection;
  }

  publishPackage(input: {
    packageId: string;
    tenantId?: string;
    claimIds: string[];
    actorId: string;
  }): CustomerAssurancePackage {
    if (this.automaticCustomerAssurancePublicationEnabled) {
      throw new Error("Automatic customer assurance publication is forbidden");
    }
    const pkg: CustomerAssurancePackage = {
      packageId: input.packageId,
      version: "1.0.0",
      scope: input.tenantId ? "tenant" : "platform",
      tenantId: input.tenantId,
      profileId: "profile-platform-default",
      claimIds: input.claimIds,
      documentIds: ["doc-security-overview"],
      externalAssuranceRefs: ["ext-pen-s07"],
      frameworkSummaryRefs: ["ISO27001_2022", "NIST_CSF_2_0"],
      disclosureLevel: "customer_safe",
      reviewStatus: "published",
      publishedAt: new Date().toISOString(),
      effectiveAt: new Date().toISOString(),
      immutableOncePublished: true,
      certificationClaimed: false,
    };
    this.packages.set(pkg.packageId, pkg);

    this.recordDisclosure({
      actorId: input.actorId,
      audience: "authenticated_customer",
      tenantId: input.tenantId,
      claimOrPackageRef: pkg.packageId,
      version: pkg.version,
      policyDecisionRef: "pol-ca-customer-safe",
      result: "allowed",
    });

    this.events.push(
      createSecurityAssuranceEvent({
        eventType: "security_assurance.customer.package_published",
        tenantId: input.tenantId ?? "platform",
        workspaceId: "platform",
        occurredAt: pkg.publishedAt!,
        refs: { packageId: pkg.packageId, version: pkg.version },
      }),
    );
    this.timeline.append(
      createSecurityAssuranceTimelineEvent({
        eventId: `tl-ca-${pkg.packageId}`,
        tenantId: input.tenantId ?? "platform",
        workspaceId: "platform",
        eventType: "customer_assurance_package_published",
        entityType: "customer_assurance_package",
        entityId: pkg.packageId,
        recordedAt: pkg.publishedAt!,
        summary: `Customer assurance package ${pkg.packageId} published`,
        refs: { version: pkg.version },
      }),
    );
    return pkg;
  }

  approveClaim(claimId: string, actorId: string): AssuranceClaimReference {
    const claim = this.claims.get(claimId);
    if (!claim) throw new Error(`Unknown claim: ${claimId}`);
    const next: AssuranceClaimReference = {
      ...claim,
      reviewStatus: "approved",
    };
    this.claims.set(claimId, next);
    this.events.push(
      createSecurityAssuranceEvent({
        eventType: "security_assurance.customer.claim_approved",
        tenantId: "platform",
        workspaceId: "platform",
        occurredAt: new Date().toISOString(),
        refs: { claimId, actorId, version: claim.version },
      }),
    );
    return next;
  }

  revokeClaim(claimId: string, reason: string): AssuranceClaimReference {
    const claim = this.claims.get(claimId);
    if (!claim) throw new Error(`Unknown claim: ${claimId}`);
    const next: AssuranceClaimReference = {
      ...claim,
      reviewStatus: "revoked",
      status: "requires_review",
      limitations: [...claim.limitations, reason],
    };
    this.claims.set(claimId, next);
    return next;
  }

  recordDisclosure(input: {
    actorId: string;
    audience: CustomerAssuranceAudience;
    tenantId?: string;
    claimOrPackageRef: string;
    version: string;
    policyDecisionRef: string;
    result: "allowed" | "denied" | "redacted";
    disclosureLevel?: AssuranceDisclosureLevel;
  }): AssuranceDisclosureRecord {
    const level = normalizeDisclosureLevel(input.disclosureLevel ?? "customer_safe");
    if (level === "never_disclose" && input.result === "allowed") {
      throw new Error("Fail closed: never_disclose cannot be allowed");
    }
    const record: AssuranceDisclosureRecord = {
      disclosureId: `disc-${Date.now()}-${input.claimOrPackageRef}`,
      actorId: input.actorId,
      audience: input.audience,
      tenantId: input.tenantId,
      claimOrPackageRef: input.claimOrPackageRef,
      version: input.version,
      policyDecisionRef: input.policyDecisionRef,
      disclosedAt: new Date().toISOString(),
      result: input.result,
      containsSensitivePayload: false,
    };
    this.disclosures.push(record);
    if (input.result === "allowed") {
      this.events.push(
        createSecurityAssuranceEvent({
          eventType: "security_assurance.customer.document_disclosed",
          tenantId: input.tenantId ?? "platform",
          workspaceId: "platform",
          occurredAt: record.disclosedAt,
          refs: {
            disclosureId: record.disclosureId,
            ref: input.claimOrPackageRef,
          },
        }),
      );
    }
    return record;
  }

  /** Tenant A must not access Tenant B packages. */
  assertPackageTenantIsolation(
    packageId: string,
    requestingTenantId: string,
  ): boolean {
    const pkg = this.packages.get(packageId);
    if (!pkg) return false;
    if (!pkg.tenantId) return true; // shared/platform approved material
    return pkg.tenantId === requestingTenantId;
  }

  listEvents() {
    return [...this.events];
  }

  customerSafeStatuses(): AssuranceClaimStatus[] {
    return this.listClaims().map((c) => c.status);
  }

  /** Bounded performance baselines (ms) — not large-enterprise portal claims. */
  measureBaselines(): {
    profileRetrievalMs: number;
    claimEvaluationMs: number;
    packageCompositionMs: number;
    documentListMs: number;
    frameworkSummaryMs: number;
  } {
    const t0 = performance.now();
    this.listProfiles();
    const profileRetrievalMs = performance.now() - t0;
    const t1 = performance.now();
    this.evaluateClaimFreshness("claim-mfa-privileged");
    const claimEvaluationMs = performance.now() - t1;
    const t2 = performance.now();
    this.projectForAudience("authenticated_customer");
    const packageCompositionMs = performance.now() - t2;
    const t3 = performance.now();
    this.listDocuments();
    const documentListMs = performance.now() - t3;
    const t4 = performance.now();
    this.projectForAudience("authenticated_customer").frameworkSummaries;
    const frameworkSummaryMs = performance.now() - t4;
    return {
      profileRetrievalMs,
      claimEvaluationMs,
      packageCompositionMs,
      documentListMs,
      frameworkSummaryMs,
    };
  }

  externalAssuranceSurface(): Array<{
    refId: string;
    category: string;
    state: "available" | "expired" | "pending" | "not_available" | "restricted";
  }> {
    return [
      {
        refId: "ext-pen-s07",
        category: "penetration_test",
        state: "not_available",
      },
      {
        refId: "ext-iso27001",
        category: "iso_certification",
        state: "not_available",
      },
      {
        refId: "ext-soc2",
        category: "soc2_report",
        state: "not_available",
      },
      {
        refId: "ext-e8",
        category: "essential_eight_assessment",
        state: "pending",
      },
    ];
  }

  dataResidencyState():
    | "known"
    | "region_specific"
    | "customer_configurable"
    | "not_verified"
    | "not_applicable" {
    return "not_verified";
  }

  filtersSensitiveMetadata(payload: Record<string, unknown>): Record<string, unknown> {
    const blocked = [
      "secretName",
      "credentialStructure",
      "hostTopology",
      "vulnerabilityDetail",
      "exploitTrace",
      "probeTechnique",
      "scannerRawOutput",
      "systemPrompt",
      "incidentArtifact",
    ];
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(payload)) {
      if (!blocked.includes(k)) out[k] = v;
    }
    return out;
  }
}
