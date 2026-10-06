import type {
  EuConcreteProjectOverride,
  EuConcreteSourcePrecedenceKind,
  EurocodeConcreteCalculationContext,
} from "@rtb/types";
import {
  EU_CONCRETE_SOURCE_PRECEDENCE_KINDS,
  UNRESOLVED_EU_CONCRETE_STANDARD_CONFLICT_FAILS_CLOSED,
} from "@rtb/types";

export const DEFAULT_EU_CONCRETE_SOURCE_PRECEDENCE: readonly EuConcreteSourcePrecedenceKind[] = [
  "EN_1992_BASE_STANDARD",
  "NATIONAL_ANNEX",
  "PROJECT_REQUIREMENT",
  "CLIENT_REQUIREMENT",
  "ENGINEERING_DESIGN_CRITERIA",
  "VALIDATED_PROJECT_OVERRIDE",
];

export function assertSourcePrecedenceDeclared(precedence: readonly EuConcreteSourcePrecedenceKind[]): void {
  if (precedence.length === 0) throw new Error("STANDARD_CONTEXT_INCOMPLETE: source precedence is required");
  for (const kind of precedence) {
    if (!(EU_CONCRETE_SOURCE_PRECEDENCE_KINDS as readonly string[]).includes(kind)) {
      throw new Error(`STANDARD_CONTEXT_CONFLICT: unknown source precedence ${kind}`);
    }
  }
}

export function assertProjectOverrideGoverned(override: EuConcreteProjectOverride): void {
  if (!override.sourceExplicit || !override.authorityExplicit || !override.scopeExplicit) {
    throw new Error("PROJECT_OVERRIDE_CONFLICT: override authority/scope/source must be explicit");
  }
  if (!override.authorityRef?.trim() || !override.reason?.trim() || !override.approverReviewerRef?.trim()) {
    throw new Error("PROJECT_OVERRIDE_CONFLICT: override requires authority, reason, and reviewer");
  }
  if (override.conflictBehavior !== "FAIL_CLOSED") {
    throw new Error("PROJECT_OVERRIDE_CONFLICT: unresolved override conflict must fail closed");
  }
}

export function assertNoSilentSourceConflict(
  context: Pick<EurocodeConcreteCalculationContext, "projectOverrideRefs" | "nationalAnnex" | "ndpSet">,
): void {
  if (!UNRESOLVED_EU_CONCRETE_STANDARD_CONFLICT_FAILS_CLOSED) {
    throw new Error("unresolved EU concrete standard conflicts must fail closed");
  }
  const ndpKeys = new Map<string, string>();
  for (const row of context.ndpSet) {
    const key = `${row.parameterId}:${row.nationalAnnexRef ?? ""}:${row.generationFamily}`;
    const prior = ndpKeys.get(key);
    const serial = `${row.value ?? "null"}:${row.version}`;
    if (prior && prior !== serial) {
      throw new Error("STANDARD_CONTEXT_CONFLICT: conflicting NDP values are not silently resolved");
    }
    ndpKeys.set(key, serial);
  }
  for (const override of context.projectOverrideRefs) {
    assertProjectOverrideGoverned(override);
    if (context.nationalAnnex && override.nationalAnnexRef && override.nationalAnnexRef !== context.nationalAnnex.nationalAnnexId) {
      throw new Error("PROJECT_OVERRIDE_CONFLICT: override annex does not match bound National Annex");
    }
  }
}
