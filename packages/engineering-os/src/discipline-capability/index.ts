export {
  EOS_D0_CANONICAL_IDS,
  EOS_DISCIPLINE_REGISTRY,
  STRUCTURAL_D1_GAPS,
  STRUCTURAL_DISCIPLINE_PACK,
  disciplineMaturity,
  getDisciplinePack,
  listRegisteredDisciplineIds,
} from "./registry";
export { EOS_D0_GOVERNANCE_RISK_REGISTER } from "./risks";
export {
  assertCoreRegisterOwnership,
  assertCrossDisciplineImpact,
  assertCrossDisciplineInterface,
  assertDisciplineAiGovernance,
  assertDisciplineInheritsGlobalGovernance,
  assertDisciplinePrivacyAndSecurity,
  assertGlobalFirstDisciplineFramework,
  assertNationalAnnexInheritance,
  assertNoDuplicatePlatformFramework,
  assertNoUncertifiedSilentFallback,
} from "./guards";

export const DISCIPLINE_FRAMEWORK_PACKAGE_DECISION =
  "common contracts in @rtb/types; framework and registry in @rtb/engineering-os; no separate discipline packages in D0" as const;
