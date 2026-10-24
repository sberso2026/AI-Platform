/**
 * Phase 15G certification gates A–BR — Customer Assurance (70 gates).
 */
export const PHASE_15G_SECURITY_ASSURANCE_CUSTOMER_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 15F baseline intact"],
  ["C", "Phase 15E–15A regression"],
  ["D", "Engineering OS V1 tag intact"],
  ["E", "Frozen module tags intact"],
  ["F", "Version 0.7.0-customer-assurance"],
  ["G", "Contracts 0.7.0-customer-assurance"],
  ["H", "Ownership / reuse boundary"],
  ["I", "CustomerAssuranceProfile"],
  ["J", "AssuranceDisclosurePolicy"],
  ["K", "Disclosure classification fail-closed"],
  ["L", "AssuranceClaimReference"],
  ["M", "Claim lifecycle / status taxonomy"],
  ["N", "Approved claim library"],
  ["O", "External assurance surfaces"],
  ["P", "Questionnaire mapping"],
  ["Q", "CustomerAssurancePackage"],
  ["R", "AssuranceDocumentReference / Platform Files"],
  ["S", "Framework customer-safe view"],
  ["T", "Data governance / residency"],
  ["U", "Subprocessor assurance"],
  ["V", "AI assurance (customer-safe)"],
  ["W", "Isolation assurance projection"],
  ["X", "Secure compute assurance projection"],
  ["Y", "Secure SDLC assurance"],
  ["Z", "Incident assurance"],
  ["AA", "Backup/recovery assurance"],
  ["AB", "Tier-1 S07/S08 truthful"],
  ["AC", "Internal/customer separation"],
  ["AD", "Identity/entitlements reuse"],
  ["AE", "Governed review action"],
  ["AF", "Disclosure audit"],
  ["AG", "Events customer.*"],
  ["AH", "Evidence freshness / stale claims"],
  ["AI", "Claim revocation"],
  ["AJ", "Versioning / immutable packages"],
  ["AK", "Tenant/customer package isolation (IDOR)"],
  ["AL", "Sensitive metadata filtering"],
  ["AM", "Migration batch_95"],
  ["AN", "RLS"],
  ["AO", "Unit tests"],
  ["AP", "Secret scan"],
  ["AQ", "Browser E2E"],
  ["AR", "Accessibility"],
  ["AS", "Responsive"],
  ["AT", "Performance baselines"],
  ["AU", "Architecture test"],
  ["AV", "Workflow exists"],
  ["AW", "CustomerAssurance flags"],
  ["AX", "Advanced products unimplemented"],
  ["AY", "EngineeringOSV1Intact"],
  ["AZ", "Module V1 intact"],
  ["BA", "phase15HReady"],
  ["BB", "Artifact identity"],
  ["BC", "releaseEligible"],
  ["BD", "Semantics / claim safety locks"],
  ["BE", "Foundation+Isolation+AI/data+SC+Compliance still ready"],
  ["BF", "No Trust Center/GRC packages"],
  ["BG", "EOS still 1.0.0"],
  ["BH", "Package not 1.0.0"],
  ["BI", "Customer Assurance docs"],
  ["BJ", "Anti-duplication"],
  ["BK", "No automatic publication/disclosure"],
  ["BL", "CustomerTrustCenterImplemented=false"],
  ["BM", "ComplianceIntelligenceImplemented=true"],
  ["BN", "S07ExternalPenTestComplete=false"],
  ["BO", "S08CustomerSsoProductionReady=false"],
  ["BP", "SecurityAssuranceBoundaryLocked"],
  ["BQ", "No fabricated certification wording"],
  ["BR", "CustomerAssuranceImplemented=true"],
] as const;

export type Phase15gGateId =
  (typeof PHASE_15G_SECURITY_ASSURANCE_CUSTOMER_GATES)[number][0];

export const PHASE_15G_GATE_COUNT =
  PHASE_15G_SECURITY_ASSURANCE_CUSTOMER_GATES.length;

export const PHASE_15G_VERSION = "0.7.0-customer-assurance" as const;
export const PHASE_15F_BASELINE =
  "924b2eaa7f6bfc635d742c5310cff3a22ed5d446" as const;
export const PHASE_15E_BASELINE =
  "aa5150fc4acf287b50c973220c40d62b7f91687f" as const;
export const PHASE_15D_BASELINE =
  "ef8efd2b4b30082e9c26ac867c65c51e3e39d207" as const;
export const PHASE_15C_BASELINE =
  "897383f5a95cf81847ee866c1c1fdac5012b25a5" as const;
export const PHASE_15B_BASELINE =
  "c0e96eaa03c76146bbeb6eb68bdc8c49f5efdf0f" as const;
export const PHASE_15A_BASELINE =
  "4748972076f77e7392bb41ec664adddfeb677407" as const;
export const PHASE_15G_EOS_TAG = "engineering-os-v1.0.0" as const;
export const PHASE_15G_EOS_COMMIT =
  "3bfc02478f50ce17f7a81e4e312986c9e1377535" as const;

export const PHASE_15G_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_15G_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_15G_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_15G_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_15G_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_15G_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
