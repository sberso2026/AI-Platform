/**
 * Phase 14D S03 — Bounded incident tabletop / certification fixtures.
 * Not a SIEM/SOC.
 */

export type IncidentSeverity = "SEV1" | "SEV2" | "SEV3" | "SEV4";

export type IncidentCategory =
  | "cross_tenant_access_suspected"
  | "privileged_credential_compromise"
  | "external_ai_provider_security_event"
  | "execution_host_compromise"
  | "production_secret_exposure";

export interface IncidentFixture {
  id: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  detection: string;
  owner: string;
  technicalEscalation: string;
  securityEscalation: string;
  containment: string[];
  evidencePreservation: string[];
  recovery: string[];
  customerCommunicationGovernance: string;
  postIncidentReviewRequired: true;
}

export const PHASE_14D_INCIDENT_FIXTURES: readonly IncidentFixture[] = [
  {
    id: "IR-FIX-01",
    category: "cross_tenant_access_suspected",
    severity: "SEV1",
    detection: "RLS negative probe / anomalous cross-tenant read",
    owner: "Platform On-Call",
    technicalEscalation: "Platform Kernel + DB owner",
    securityEscalation: "Security On-Call",
    containment: [
      "Freeze suspected principal sessions",
      "Preserve query/audit logs",
      "Verify RLS policies on affected tables",
    ],
    evidencePreservation: [
      "Export relevant audit_events without payloads",
      "Capture request ids / JWT subject hashes",
    ],
    recovery: ["Confirm isolation", "Rotate affected credentials if warranted"],
    customerCommunicationGovernance:
      "Security lead authorizes any customer notice; no invented SLA periods",
    postIncidentReviewRequired: true,
  },
  {
    id: "IR-FIX-02",
    category: "privileged_credential_compromise",
    severity: "SEV1",
    detection: "Unexpected privileged admin activity / leaked credential report",
    owner: "Security On-Call",
    technicalEscalation: "Identity owner",
    securityEscalation: "Incident Commander",
    containment: [
      "Revoke sessions",
      "Disable principal",
      "Invalidate service tokens if applicable",
    ],
    evidencePreservation: ["Auth logs", "Break-glass audit if used"],
    recovery: ["Issue new credentials", "Enforce MFA before re-enable"],
    customerCommunicationGovernance:
      "Notify only if customer data impact confirmed per governance",
    postIncidentReviewRequired: true,
  },
  {
    id: "IR-FIX-03",
    category: "external_ai_provider_security_event",
    severity: "SEV2",
    detection: "Provider advisory / anomalous provider failures",
    owner: "AI Runtime owner",
    technicalEscalation: "Platform Intelligence",
    securityEscalation: "Security On-Call",
    containment: [
      "Fail-closed provider policy",
      "Disable affected provider pin",
      "Stop training-use paths (already forbidden)",
    ],
    evidencePreservation: ["Provider policy decisions", "AI audit metadata refs"],
    recovery: ["Re-enable only after provider clearance + policy review"],
    customerCommunicationGovernance: "Product/security joint review before customer statements",
    postIncidentReviewRequired: true,
  },
  {
    id: "IR-FIX-04",
    category: "execution_host_compromise",
    severity: "SEV1",
    detection: "Host integrity alert / unauthorized job execution",
    owner: "Execution Host owner",
    technicalEscalation: "Engineering Tool Framework owner",
    securityEscalation: "Security On-Call",
    containment: [
      "Quarantine host",
      "Suspend jobs",
      "Revoke host credentials",
    ],
    evidencePreservation: ["Job authz logs", "Artifact refs/hashes"],
    recovery: ["Rebuild host from trusted image", "Re-pin provider versions"],
    customerCommunicationGovernance: "Client-owned solver impact communicated by account owner if needed",
    postIncidentReviewRequired: true,
  },
  {
    id: "IR-FIX-05",
    category: "production_secret_exposure",
    severity: "SEV1",
    detection: "Secret scan hit / public exposure report",
    owner: "Ops On-Call",
    technicalEscalation: "Secret Management owner",
    securityEscalation: "Security On-Call",
    containment: ["Emergency revoke", "Rotate replacements", "Invalidate CI secrets if needed"],
    evidencePreservation: ["Exposure location metadata (no secret values)", "Rotation audit"],
    recovery: ["Validate services with new secrets", "Retire old versions"],
    customerCommunicationGovernance: "Escalate if customer systems/keys implicated",
    postIncidentReviewRequired: true,
  },
] as const;

export function assertIncidentFixturesComplete(): void {
  const cats = new Set(PHASE_14D_INCIDENT_FIXTURES.map((f) => f.category));
  for (const required of [
    "cross_tenant_access_suspected",
    "privileged_credential_compromise",
    "external_ai_provider_security_event",
    "execution_host_compromise",
    "production_secret_exposure",
  ] as const) {
    if (!cats.has(required)) {
      throw new Error(`Missing incident fixture: ${required}`);
    }
  }
}

