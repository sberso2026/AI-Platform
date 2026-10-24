/**
 * Phase 15H Security & Assurance V1 GA Gap Register.
 * Every gap classified — no UNKNOWN. BLOCKER/REQUIRED_BEFORE_GA drive GA readiness.
 */

export type SecurityAssuranceGapClass =
  | "BLOCKER"
  | "REQUIRED_BEFORE_GA"
  | "REQUIRED_BEFORE_TIER1_PRODUCTION"
  | "RECOMMENDED_POST_GA"
  | "EXTERNAL_DEPENDENCY"
  | "INTENTIONALLY_UNAVAILABLE";

export type SecurityAssuranceGapEntry = {
  gapId: string;
  title: string;
  classification: SecurityAssuranceGapClass;
  owner: string;
  status: "open" | "closed" | "accepted";
  notes: string;
};

export const SECURITY_ASSURANCE_V1_GA_GAP_REGISTER: SecurityAssuranceGapEntry[] = [
  {
    gapId: "SA-V1-01",
    title: "Foundation control/evidence/assessment pipeline",
    classification: "REQUIRED_BEFORE_GA",
    owner: "Security & Assurance",
    status: "closed",
    notes: "Closed by Phase 15B; registry + freshness + posture intact",
  },
  {
    gapId: "SA-V1-02",
    title: "Isolation Assurance runtime",
    classification: "REQUIRED_BEFORE_GA",
    owner: "Security & Assurance",
    status: "closed",
    notes: "Closed by Phase 15C",
  },
  {
    gapId: "SA-V1-03",
    title: "AI & Data Security Assurance",
    classification: "REQUIRED_BEFORE_GA",
    owner: "Security & Assurance",
    status: "closed",
    notes: "Closed by Phase 15D",
  },
  {
    gapId: "SA-V1-04",
    title: "Secure Compute Assurance",
    classification: "REQUIRED_BEFORE_GA",
    owner: "Security & Assurance",
    status: "closed",
    notes: "Closed by Phase 15E",
  },
  {
    gapId: "SA-V1-05",
    title: "Compliance Intelligence foundation",
    classification: "REQUIRED_BEFORE_GA",
    owner: "Security & Assurance",
    status: "closed",
    notes: "Closed by Phase 15F (mapping/assessment; not certification)",
  },
  {
    gapId: "SA-V1-06",
    title: "Customer Assurance controlled disclosure",
    classification: "REQUIRED_BEFORE_GA",
    owner: "Security & Assurance",
    status: "closed",
    notes: "Closed by Phase 15G; internal/customer separation certified",
  },
  {
    gapId: "SA-V1-07",
    title: "Ownership matrix / unknown ownership",
    classification: "REQUIRED_BEFORE_GA",
    owner: "Security & Assurance",
    status: "closed",
    notes: "UNKNOWN ownership = 0; ownership matrix locked",
  },
  {
    gapId: "SA-V1-08",
    title: "Public contracts review for V1 readiness",
    classification: "REQUIRED_BEFORE_GA",
    owner: "Security & Assurance",
    status: "closed",
    notes: "0.1–0.7 contracts reviewed; freeze deferred to Phase 15I if GA proceeds",
  },
  {
    gapId: "SA-V1-09",
    title: "External penetration test (S07)",
    classification: "REQUIRED_BEFORE_TIER1_PRODUCTION",
    owner: "Platform Security program / external",
    status: "open",
    notes: "REQUIRED_BEFORE_TIER1_PRODUCTION; not a V1 subsystem GA blocker",
  },
  {
    gapId: "SA-V1-10",
    title: "Customer SSO production-ready (S08)",
    classification: "REQUIRED_BEFORE_TIER1_PRODUCTION",
    owner: "Platform Identity",
    status: "open",
    notes: "Platform Identity OWNS; Sec&A evidences readiness only",
  },
  {
    gapId: "SA-V1-11",
    title: "ISO 27001 / SOC 2 external certification",
    classification: "EXTERNAL_DEPENDENCY",
    owner: "External certification bodies",
    status: "open",
    notes: "Must not be claimed as RTB certification",
  },
  {
    gapId: "SA-V1-12",
    title: "Essential Eight maturity attestation",
    classification: "EXTERNAL_DEPENDENCY",
    owner: "External / corporate IT",
    status: "accepted",
    notes: "Applicability/mapping only; maturity not claimed",
  },
  {
    gapId: "SA-V1-13",
    title: "Continuous control monitoring runtime",
    classification: "RECOMMENDED_POST_GA",
    owner: "Security & Assurance",
    status: "open",
    notes: "Post-V1 expansion; not required for subsystem GA",
  },
  {
    gapId: "SA-V1-14",
    title: "Threat intelligence adapters",
    classification: "RECOMMENDED_POST_GA",
    owner: "Security & Assurance",
    status: "open",
    notes: "Normalize external findings; no SIEM ownership",
  },
  {
    gapId: "SA-V1-15",
    title: "Full public unauthenticated Trust Center",
    classification: "INTENTIONALLY_UNAVAILABLE",
    owner: "—",
    status: "accepted",
    notes: "CustomerTrustCenterImplemented=false",
  },
  {
    gapId: "SA-V1-16",
    title: "SIEM / SOAR / EDR / vulnerability database",
    classification: "INTENTIONALLY_UNAVAILABLE",
    owner: "—",
    status: "accepted",
    notes: "MUST_NEVER_OWN",
  },
  {
    gapId: "SA-V1-17",
    title: "Duplicate Policy Engine / Identity / Audit / AI Runtime",
    classification: "INTENTIONALLY_UNAVAILABLE",
    owner: "—",
    status: "accepted",
    notes: "Anti-duplication flags remain false",
  },
  {
    gapId: "SA-V1-18",
    title: "Automatic certification / compliance claims / remediation",
    classification: "INTENTIONALLY_UNAVAILABLE",
    owner: "—",
    status: "accepted",
    notes: "All automatic* security flags remain false",
  },
];

export function summarizeGaGaps() {
  const byClass: Record<SecurityAssuranceGapClass, number> = {
    BLOCKER: 0,
    REQUIRED_BEFORE_GA: 0,
    REQUIRED_BEFORE_TIER1_PRODUCTION: 0,
    RECOMMENDED_POST_GA: 0,
    EXTERNAL_DEPENDENCY: 0,
    INTENTIONALLY_UNAVAILABLE: 0,
  };
  const openByClass: Record<SecurityAssuranceGapClass, number> = {
    BLOCKER: 0,
    REQUIRED_BEFORE_GA: 0,
    REQUIRED_BEFORE_TIER1_PRODUCTION: 0,
    RECOMMENDED_POST_GA: 0,
    EXTERNAL_DEPENDENCY: 0,
    INTENTIONALLY_UNAVAILABLE: 0,
  };
  for (const g of SECURITY_ASSURANCE_V1_GA_GAP_REGISTER) {
    byClass[g.classification] += 1;
    if (g.status === "open") openByClass[g.classification] += 1;
  }
  const openBlockers = openByClass.BLOCKER;
  const openRequiredBeforeGa = openByClass.REQUIRED_BEFORE_GA;
  const securityAssuranceV1GaReady =
    openBlockers === 0 && openRequiredBeforeGa === 0;
  return {
    total: SECURITY_ASSURANCE_V1_GA_GAP_REGISTER.length,
    byClass,
    openByClass,
    openBlockers,
    openRequiredBeforeGa,
    unknownClassifications: 0,
    securityAssuranceV1GaReady,
    closureGapsRequiredBeforeGa: SECURITY_ASSURANCE_V1_GA_GAP_REGISTER.filter(
      (g) =>
        g.status === "open" &&
        (g.classification === "BLOCKER" || g.classification === "REQUIRED_BEFORE_GA"),
    ),
  };
}
