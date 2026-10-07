import type {
  UsConcreteCalculationContext,
  UsConcreteProjectOverride,
  UsConcreteSourcePrecedenceKind,
} from "@rtb/types";
import {
  UNRESOLVED_US_CONCRETE_ADOPTION_CONFLICT_FAILS_CLOSED,
  US_CONCRETE_SOURCE_PRECEDENCE_KINDS,
} from "@rtb/types";

export const DEFAULT_US_CONCRETE_SOURCE_PRECEDENCE: readonly UsConcreteSourcePrecedenceKind[] = [
  "BUILDING_CODE_ADOPTION",
  "ACI_STANDARD_PROFILE",
  "LOCAL_AMENDMENT",
  "PROJECT_REQUIREMENT",
  "CLIENT_REQUIREMENT",
  "ENGINEERING_DESIGN_CRITERIA",
  "VALIDATED_PROJECT_OVERRIDE",
];

export function assertUsConcreteSourcePrecedenceDeclared(precedence: readonly UsConcreteSourcePrecedenceKind[]): void {
  if (precedence.length === 0) throw new Error("STANDARD_CONTEXT_INCOMPLETE: source precedence is required");
  for (const kind of precedence) {
    if (!(US_CONCRETE_SOURCE_PRECEDENCE_KINDS as readonly string[]).includes(kind)) {
      throw new Error(`STANDARD_CONTEXT_CONFLICT: unknown source precedence ${kind}`);
    }
  }
}

export function assertUsConcreteProjectOverrideGoverned(override: UsConcreteProjectOverride): void {
  if (!override.sourceExplicit || !override.authorityExplicit || !override.scopeExplicit) {
    throw new Error("PROJECT_OVERRIDE_CONFLICT: override authority/scope/source must be explicit");
  }
  if (!override.authorityRef?.trim() || !override.reason?.trim() || !override.reviewContextRef?.trim()) {
    throw new Error("PROJECT_OVERRIDE_CONFLICT: override requires authority, reason, and review context");
  }
  if (override.conflictBehavior !== "FAIL_CLOSED") {
    throw new Error("PROJECT_OVERRIDE_CONFLICT: unresolved override conflict must fail closed");
  }
}

export function assertNoSilentUsConcreteSourceConflict(
  context: Pick<UsConcreteCalculationContext, "projectOverrideRefs" | "buildingCodeAdoption" | "localAmendmentSet">,
): void {
  if (!UNRESOLVED_US_CONCRETE_ADOPTION_CONFLICT_FAILS_CLOSED) {
    throw new Error("unresolved US concrete adoption conflicts must fail closed");
  }
  for (const override of context.projectOverrideRefs) {
    assertUsConcreteProjectOverrideGoverned(override);
    if (
      context.buildingCodeAdoption
      && override.buildingCodeContextRef
      && override.buildingCodeContextRef !== context.buildingCodeAdoption.adoptionId
    ) {
      throw new Error("PROJECT_OVERRIDE_CONFLICT: override building-code context does not match bound adoption");
    }
  }
}
