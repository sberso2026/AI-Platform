import { A14A_NAMED_PILOT_USERS, A14A_PILOT_PROFILE, A14A_PILOT_SCOPE, returnedBinaryUploadsInPilot } from "./a14a-profile";
import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "../lifecycle-intelligence/fixture";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import { A11A_SYSTEM_ID } from "../work-generator/fixture";
import { A11E_PROJECT_B } from "../change-workbench/fixture";

export const A15A_MODE = "DEMONSTRATION_ONLY" as const;
export const A15A_PHASE = "PROVE" as const;
export const A15A_FEATURE_FREEZE = "ACTIVE" as const;

export const A15A_DATA_CLASSIFICATIONS = [
  "SYNTHETIC_DEMONSTRATION_DATA",
  "ENGINEER_PROVIDED_FIXTURE",
  "EOS_GENERATED_DRAFT",
  "HUMAN_CONFIRMED_DEMONSTRATION_DECISION",
  "CONTROLLED_FIXTURE_NOT_USER_UPLOAD",
] as const;
export type A15ADataClassification = (typeof A15A_DATA_CLASSIFICATIONS)[number];

export const A15A_SCENARIO = {
  name: "Crusher Support System / Crusher Area Engineering",
  projectLabel: "Crusher Expansion Demonstrator",
  systemLabel: "Crusher Support System",
  environment: "DEMONSTRATION / NON-PRODUCTION",
  tenantId: CRUSHER_FEED_TENANT,
  workspaceId: CRUSHER_FEED_WORKSPACE,
  projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
  systemId: A11A_SYSTEM_ID,
  secondProjectId: A11E_PROJECT_B,
  profile: A14A_PILOT_PROFILE,
  namedUsers: A14A_NAMED_PILOT_USERS,
  dataClassification: "SYNTHETIC_DEMONSTRATION_DATA" as const,
  notLivePilot: true,
  notProductionTrial: true,
  notCertifiedDesignAutomation: true,
  disciplines: ["PROCESS", "MECHANICAL", "STRUCTURAL", "CIVIL", "GEOTECHNICAL"] as const,
  excludedDisciplinesUnlessRequired: ["ELECTRICAL", "PIPING"] as const,
} as const;

export const A15A_AUTHORITY_REMINDER = {
  eosAssists: true,
  humanRetainsJudgment: true,
  noUncertifiedSolverDecision: true,
  noExampleOnlyDesignAcceptance: true,
  noAutonomousApproval: true,
} as const;

export const A15A_CARRY_FORWARD_BLOCKERS = [
  { id: "HUMAN_AAL2_GATE", state: "BLOCKED" as const, waived: false },
  { id: "SERVER_AAL2_PROOF", state: "NOT_TESTED" as const, waived: false },
  { id: "AUTHENTICATED_BROWSER_HITL", state: "NOT_TESTED" as const, waived: false },
  { id: "MULTI_PROJECT_BROWSER_HITL", state: "NOT_TESTED" as const, waived: false },
  { id: "LIFECYCLE_BROWSER_HITL", state: "NOT_TESTED" as const, waived: false },
  { id: "HOSTED_MALWARE_SCANNER", state: "BLOCKED" as const, waived: false },
  { id: "RETURNED_ARTIFACT_PILOT", state: "BLOCKED" as const, waived: false },
  { id: "DEPENDENCY_POLICY_GATE", state: "BLOCKED" as const, waived: false },
] as const;

export function a15aReturnedUserUploadAllowed(env: NodeJS.ProcessEnv = process.env): boolean {
  return returnedBinaryUploadsInPilot(env);
}

export const A15A_PRODUCTIVITY_CLAIM = "NONE" as const;

export const A15A_VALUE_CLASSES = ["PROVEN_IN_DEMONSTRATOR", "OBSERVED", "NOT_YET_PROVEN", "FUTURE_PILOT_METRIC"] as const;

export const A15A_FUTURE_PILOT_METRICS = [
  "finding engineering inputs",
  "setting up engineering work",
  "preparing RFI/TQ response",
  "preparing Review Package",
  "performing initial change impact review",
  "preparing draft Design Report",
  "handover compilation",
] as const;

export const A15A_SURVEILLANCE_PROHIBITED = {
  screenTime: false,
  excelDuration: false,
  keystrokes: false,
  activityVolumeInference: false,
} as const;

export const A15A_FEATURE_FREEZE_BOUNDARIES = {
  newEngineeringDomain: false,
  newVendorConnector: false,
  newReviewEngine: false,
  newChangeEngine: false,
  newLifecycleEngine: false,
  newGraphStore: false,
  newEventBus: false,
  newJobSystem: false,
  newDms: false,
  realSolver: false,
  pdfProductFeature: false,
  semanticAiReview: false,
  malwareBypass: false,
  mfaBypass: false,
  dependencyAutoAcceptance: false,
} as const;

export const A15A_OPTIONAL_PROFILE_A = {
  liveSharePoint: "NOT_APPLICABLE",
  liveEdms: "NOT_APPLICABLE",
  liveBimAcc: "NOT_APPLICABLE",
  liveP6: "NOT_APPLICABLE",
  realSolverExecution: "NOT_APPLICABLE",
  exampleOnlyCalculationAcceptance: "NOT_APPLICABLE",
  pdfExport: "NOT_APPLICABLE",
} as const;

export const A15A_UX_FRICTION = [
  { id: "HUMAN_AAL2_GATE", class: "BLOCKER" as const, scope: "PILOT", note: "Operator TOTP not completed; demonstrator uses server/integration evidence." },
  { id: "AUTHENTICATED_BROWSER_HITL", class: "HIGH FRICTION" as const, scope: "PILOT", note: "Blocked by AAL2. Workbench-first journey certified in-process." },
  { id: "HOSTED_MALWARE_SCANNER", class: "BLOCKER" as const, scope: "PILOT", note: "Untrusted returned upload remains disabled. Controlled fixture is not a user-upload round-trip." },
  { id: "DEPENDENCY_POLICY_GATE", class: "BLOCKER" as const, scope: "PILOT", note: "Expired SCA exceptions were not auto-renewed." },
  { id: "OFFICE_NATIVE_HITL", class: "MINOR" as const, scope: "DEMONSTRATOR", note: "Native Office open is honestly NOT_TESTED unless an operator opens generated files." },
  { id: "SOAK_AND_MEMORY", class: "MINOR" as const, scope: "PILOT", note: "A14B soak/memory limitations remain; A15A does not claim long-term stability." },
] as const;

export const A15A_POST_V1_BACKLOG = [
  "live SharePoint / Aconex / ACC / P6 connectors",
  "hosted malware scanner deployment",
  "returned-file pilot round-trip",
  "real solver execution",
  "PDF export product feature",
  "semantic AI review",
  "human AAL2 browser HITL closeout",
  "dependency exception governance closeout",
] as const;

export const A15A_DEMONSTRATION_SCRIPT = [
  "My Engineering Day — WAITING_ON_OTHERS / DO_NOW / REVIEW_REQUIRED",
  "Start/continue Crusher Support engineering from /engineering/work",
  "Governing information, assumptions, and Mechanical/Geotechnical dependencies",
  "Generate professional company-template or EOS-default artifact to object storage",
  "Run deterministic Pre-Issue Review — no automatic approval",
  "Vendor load revision (synthetic Rev C → Rev D)",
  "EOS finds potential impacts; human confirms / marks NOT_IMPACTED",
  "Construction RFI: anchor bolt / reinforcement clash",
  "Prepare governed RFI response draft for engineer review",
  "Commissioning query and handover package",
  "Digital Thread: why did this change / why is handover stale",
] as const;

export type A15AEvidenceStep = {
  step: string;
  lifecycle: string;
  objectType: string;
  objectId: string;
  classification: A15ADataClassification;
  resultState: string;
  durationMs?: number;
};

export type A15AArtifactManifestRow = {
  artifactType: string;
  filename: string;
  templateSource: string;
  templateVersion: string;
  workPlanId: string;
  sha256: string;
  byteSize: number;
  storageKind: string;
  generationStatus: string;
  reviewStatus: string;
};

export function a15aPilotEligible(controlledPilotReady: boolean): {
  a15bEligible: boolean;
  recommendedNextPhase: "EOS-A15B Controlled Engineering Pilot" | "EOS Pilot Gate Closeout";
  reason: string;
} {
  if (controlledPilotReady) {
    return {
      a15bEligible: true,
      recommendedNextPhase: "EOS-A15B Controlled Engineering Pilot",
      reason: "CONTROLLED_PILOT_READY = YES.",
    };
  }
  return {
    a15bEligible: false,
    recommendedNextPhase: "EOS Pilot Gate Closeout",
    reason: "A15A demonstrator success is not a substitute for remaining Profile A security/readiness gates.",
  };
}

export function remainingPilotBlockers(): string[] {
  return A15A_CARRY_FORWARD_BLOCKERS.filter((row) => row.state === "BLOCKED" || row.state === "NOT_TESTED").map((row) => `${row.id} ${row.state}`);
}

export function a15aScopeIncludes(capability: string): boolean {
  return (A14A_PILOT_SCOPE.included as readonly string[]).some((row) => row.toLowerCase().includes(capability.toLowerCase()));
}
