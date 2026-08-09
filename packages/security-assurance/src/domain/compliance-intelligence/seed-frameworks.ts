/**
 * Seed frameworks/requirements for Compliance Intelligence (identifiers only).
 * Does not reproduce copyrighted standard text.
 */

import type {
  ComplianceControlMapping,
  ComplianceFramework,
  ComplianceFrameworkVersion,
  ComplianceRequirement,
  ExternalAssuranceRequirement,
} from "../../compliance-intelligence-contracts";

export const SEED_COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  {
    frameworkId: "ISO27001_2022",
    name: "ISO/IEC 27001",
    publisher: "ISO/IEC",
    description: "ISMS control mapping scaffold (A.5 themes)",
    status: "active",
  },
  {
    frameworkId: "NIST_CSF_2_0",
    name: "NIST Cybersecurity Framework",
    publisher: "NIST",
    description: "CSF 2.0 function/category mapping scaffold",
    status: "active",
  },
  {
    frameworkId: "ESSENTIAL_EIGHT",
    name: "Australian Essential Eight",
    publisher: "ASD",
    description: "Essential Eight strategy mapping scaffold",
    status: "active",
  },
  {
    frameworkId: "SOC2_TSC",
    name: "SOC 2 Trust Services Criteria",
    publisher: "AICPA",
    description: "TSC mapping scaffold only — not an attestation",
    status: "active",
  },
];

export const SEED_COMPLIANCE_FRAMEWORK_VERSIONS: ComplianceFrameworkVersion[] = [
  {
    frameworkVersionId: "iso27001-2022",
    frameworkId: "ISO27001_2022",
    versionLabel: "2022",
    publishedYear: 2022,
    provenanceRef: "registry:iso27001-2022",
    registeredAt: "2026-08-09T00:00:00.000Z",
  },
  {
    frameworkVersionId: "nist-csf-2.0",
    frameworkId: "NIST_CSF_2_0",
    versionLabel: "2.0",
    publishedYear: 2024,
    provenanceRef: "registry:nist-csf-2.0",
    registeredAt: "2026-08-09T00:00:00.000Z",
  },
  {
    frameworkVersionId: "e8-current",
    frameworkId: "ESSENTIAL_EIGHT",
    versionLabel: "current",
    provenanceRef: "registry:essential-eight",
    registeredAt: "2026-08-09T00:00:00.000Z",
  },
  {
    frameworkVersionId: "soc2-tsc-scaffold",
    frameworkId: "SOC2_TSC",
    versionLabel: "TSC-scaffold",
    provenanceRef: "registry:soc2-tsc-scaffold",
    registeredAt: "2026-08-09T00:00:00.000Z",
  },
];

export const SEED_COMPLIANCE_REQUIREMENTS: ComplianceRequirement[] = [
  {
    requirementId: "req-iso-a5-access",
    frameworkId: "ISO27001_2022",
    frameworkVersionId: "iso27001-2022",
    requirementCode: "A.5",
    title: "Organizational / access control themes",
    requiresExternalAssurance: false,
    notApplicableAllowed: false,
  },
  {
    requirementId: "req-nist-pr-aa",
    frameworkId: "NIST_CSF_2_0",
    frameworkVersionId: "nist-csf-2.0",
    requirementCode: "PR.AA",
    title: "Identity management / authentication",
    requiresExternalAssurance: false,
    notApplicableAllowed: false,
  },
  {
    requirementId: "req-nist-id-ra",
    frameworkId: "NIST_CSF_2_0",
    frameworkVersionId: "nist-csf-2.0",
    requirementCode: "ID.RA",
    title: "Risk assessment",
    requiresExternalAssurance: false,
    notApplicableAllowed: false,
  },
  {
    requirementId: "req-e8-mfa",
    frameworkId: "ESSENTIAL_EIGHT",
    frameworkVersionId: "e8-current",
    requirementCode: "E8-MFA",
    title: "Multi-factor authentication",
    requiresExternalAssurance: false,
    notApplicableAllowed: false,
  },
  {
    requirementId: "req-soc2-cc6",
    frameworkId: "SOC2_TSC",
    frameworkVersionId: "soc2-tsc-scaffold",
    requirementCode: "CC6",
    title: "Logical access scaffold",
    requiresExternalAssurance: true,
    externalAssuranceTypes: ["independent_attestation", "external_audit"],
    notApplicableAllowed: false,
  },
  {
    requirementId: "req-iso-ext-pen",
    frameworkId: "ISO27001_2022",
    frameworkVersionId: "iso27001-2022",
    requirementCode: "EXT-PEN",
    title: "External penetration-test dependency (marker)",
    requiresExternalAssurance: true,
    externalAssuranceTypes: ["penetration_testing"],
    notApplicableAllowed: false,
  },
  {
    requirementId: "req-nist-na-demo",
    frameworkId: "NIST_CSF_2_0",
    frameworkVersionId: "nist-csf-2.0",
    requirementCode: "NA.DEMO",
    title: "Demonstrative not-applicable requirement",
    requiresExternalAssurance: false,
    notApplicableAllowed: true,
  },
];

/** Cross-framework: RTB-SEC-S01 maps to ISO + NIST + E8 (many-to-many). */
export const SEED_COMPLIANCE_CONTROL_MAPPINGS: ComplianceControlMapping[] = [
  {
    mappingId: "cmap-s01-iso-a5",
    requirementId: "req-iso-a5-access",
    controlId: "RTB-SEC-S01",
    frameworkId: "ISO27001_2022",
    soleControlInfersCompliance: false,
    certified: false,
  },
  {
    mappingId: "cmap-s01-nist-pr-aa",
    requirementId: "req-nist-pr-aa",
    controlId: "RTB-SEC-S01",
    frameworkId: "NIST_CSF_2_0",
    soleControlInfersCompliance: false,
    certified: false,
  },
  {
    mappingId: "cmap-s01-e8-mfa",
    requirementId: "req-e8-mfa",
    controlId: "RTB-SEC-S01",
    frameworkId: "ESSENTIAL_EIGHT",
    soleControlInfersCompliance: false,
    certified: false,
  },
  {
    mappingId: "cmap-s02-nist-id-ra",
    requirementId: "req-nist-id-ra",
    controlId: "RTB-SEC-S02",
    frameworkId: "NIST_CSF_2_0",
    soleControlInfersCompliance: false,
    certified: false,
  },
  {
    mappingId: "cmap-s01-soc2-cc6",
    requirementId: "req-soc2-cc6",
    controlId: "RTB-SEC-S01",
    frameworkId: "SOC2_TSC",
    soleControlInfersCompliance: false,
    certified: false,
  },
  {
    mappingId: "cmap-s07-iso-ext",
    requirementId: "req-iso-ext-pen",
    controlId: "RTB-SEC-S07",
    frameworkId: "ISO27001_2022",
    soleControlInfersCompliance: false,
    certified: false,
  },
];

export const SEED_EXTERNAL_ASSURANCE_REQUIREMENTS: ExternalAssuranceRequirement[] =
  [
    {
      externalRequirementId: "ext-soc2-cc6",
      requirementId: "req-soc2-cc6",
      assuranceType: "independent_attestation",
      status: "absent",
      internalEvidenceCannotSatisfy: true,
    },
    {
      externalRequirementId: "ext-iso-pen",
      requirementId: "req-iso-ext-pen",
      assuranceType: "penetration_testing",
      status: "absent",
      internalEvidenceCannotSatisfy: true,
    },
  ];
