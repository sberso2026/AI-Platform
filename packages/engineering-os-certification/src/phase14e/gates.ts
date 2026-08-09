/**
 * Phase 14E certification gates A–BT — Engineering OS V1.0 Production GA (72 gates).
 */
export const PHASE_14E_ENGINEERING_OS_GA_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 14D baseline intact"],
  ["C", "Phase 14C/14B/14A baselines referenced"],
  ["D", "Frozen V1 module tags intact"],
  ["E", "Version 1.0.0 ga"],
  ["F", "Public contracts frozen 1.0.0"],
  ["G", "Manifest frozen 1.0.0"],
  ["H", "Shared domain pins"],
  ["I", "Ownership alias"],
  ["J", "Module registry truthful"],
  ["K", "Launcher complete"],
  ["L", "Navigation ready"],
  ["M", "Home v1-ready marker"],
  ["N", "EngineeringContext frozen"],
  ["O", "Cross-module search ready"],
  ["P", "AI orchestration ready"],
  ["Q", "implementsOwnAiStack false"],
  ["R", "Classification-aware AI preserved"],
  ["S", "Sensitive logging preserved"],
  ["T", "Health ready"],
  ["U", "Tool Framework singular"],
  ["V", "Execution host client-owned architecture"],
  ["W", "Solver certs remain false"],
  ["X", "silentSolverFallbackAllowed false"],
  ["Y", "Commercial packaging"],
  ["Z", "Entitlement coverage"],
  ["AA", "Installability"],
  ["AB", "Compatibility resolver"],
  ["AC", "Capability matrix"],
  ["AD", "Security GA gate passed"],
  ["AE", "S01–S06 remain CLOSED"],
  ["AF", "Privileged MFA preserved"],
  ["AG", "Break-glass preserved"],
  ["AH", "SCA preserved"],
  ["AI", "Incident response preserved"],
  ["AJ", "Secret lifecycle preserved"],
  ["AK", "Backup/restore preserved"],
  ["AL", "RPO/RTO truthful"],
  ["AM", "S07 Tier-1 remains open"],
  ["AN", "S08 Tier-1 remains open"],
  ["AO", "External assurance non-claims"],
  ["AP", "No Security & Assurance package"],
  ["AQ", "Operations doc"],
  ["AR", "Observability metadata bounded"],
  ["AS", "No destructive GA migration"],
  ["AT", "Upgrade path documented"],
  ["AU", "Historical module tags intact"],
  ["AV", "Restore regression"],
  ["AW", "Performance baseline"],
  ["AX", "Browser E2E CERTIFY_BROWSER=1"],
  ["AY", "Unit tests"],
  ["AZ", "14D security flags"],
  ["BA", "knownCrossTenantLeakageDetected false"],
  ["BB", "secretExposureDetected false"],
  ["BC", "Gap register GA open = 0"],
  ["BD", "productionEngineeringOSReady true"],
  ["BE", "engineeringOSV1GaCertified true"],
  ["BF", "engineeringOSV1Frozen true"],
  ["BG", "duplicate ownership flags false"],
  ["BH", "duplicatePolicyEngineDetected false"],
  ["BI", "Workflow exists"],
  ["BJ", "Platform architecture test"],
  ["BK", "Enterprise deployment requirements"],
  ["BL", "Public contracts doc"],
  ["BM", "Packaging doc"],
  ["BN", "Hierarchy freeze"],
  ["BO", "Release tag declared"],
  ["BP", "Release tag integrity"],
  ["BQ", "Secret scan"],
  ["BR", "Dependency SCA run"],
  ["BS", "Artifact identity"],
  ["BT", "releaseEligible"],
] as const;

export type Phase14eGateId =
  (typeof PHASE_14E_ENGINEERING_OS_GA_GATES)[number][0];

export const PHASE_14E_GATE_COUNT = PHASE_14E_ENGINEERING_OS_GA_GATES.length;

export const PHASE_14E_EOS_VERSION = "1.0.0" as const;
export const PHASE_14E_RELEASE_TAG = "engineering-os-v1.0.0" as const;
export const PHASE_14D_COMMIT =
  "f9a66781c00f10ae5f05182968060403013fddd6" as const;
export const PHASE_14C_COMMIT =
  "5fd29af093e009e7e2aaf961c797141f452cc1c2" as const;
export const PHASE_14B_COMMIT =
  "70ae39837ac9e2cd3039b344ca083004884238c6" as const;
export const PHASE_14A_COMMIT =
  "1542a4973dcf98539eefbf710c500927cb939fa8" as const;

export const PHASE_14E_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_14E_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_14E_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_14E_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_14E_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_14E_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
