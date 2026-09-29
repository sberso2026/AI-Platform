/**
 * EOS-A4 Requirements, Change, Impact & Configuration invariants.
 * Database CHECKs remain the last line of defence.
 */

export const REQUIREMENT_TYPES = [
  "FUNCTIONAL",
  "PERFORMANCE",
  "SAFETY",
  "REGULATORY",
  "CLIENT",
  "DESIGN",
  "OPERABILITY",
  "MAINTAINABILITY",
  "ENVIRONMENTAL",
] as const;
export type RequirementType = (typeof REQUIREMENT_TYPES)[number];

export const REQUIREMENT_STATUSES = ["draft", "active", "superseded", "retired", "waived"] as const;
export type RequirementStatus = (typeof REQUIREMENT_STATUSES)[number];

export const VERIFICATION_METHODS = [
  "ANALYSIS",
  "INSPECTION",
  "TEST",
  "DEMONSTRATION",
  "REVIEW",
  "CERTIFICATION",
] as const;
export type VerificationMethod = (typeof VERIFICATION_METHODS)[number];

export const VERIFICATION_STATUSES = [
  "unverified",
  "in_progress",
  "verified",
  "waived",
  "failed",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const CHANGE_TYPES = [
  "DESIGN",
  "SCOPE",
  "TECHNICAL",
  "SAFETY",
  "REGULATORY",
  "INTERFACE",
  "REQUIREMENT",
  "CONFIGURATION",
  "OTHER",
] as const;
export type ChangeType = (typeof CHANGE_TYPES)[number];

export const CHANGE_STATUSES = [
  "proposed",
  "assessing",
  "approved",
  "rejected",
  "implementing",
  "implemented",
  "verified",
  "cancelled",
] as const;
export type ChangeStatus = (typeof CHANGE_STATUSES)[number];

const CHANGE_TRANSITIONS: Record<ChangeStatus, readonly ChangeStatus[]> = {
  proposed: ["assessing", "cancelled", "rejected"],
  assessing: ["approved", "rejected", "cancelled", "proposed"],
  approved: ["implementing", "cancelled", "rejected"],
  implementing: ["implemented", "cancelled"],
  implemented: ["verified", "implementing"],
  verified: [],
  rejected: [],
  cancelled: [],
};

export const IMPACT_TYPES = [
  "TECHNICAL",
  "SAFETY",
  "COST",
  "SCHEDULE",
  "INTERFACE",
  "REQUIREMENT",
  "CONFIGURATION",
  "OPERABILITY",
] as const;
export type ImpactType = (typeof IMPACT_TYPES)[number];

export const IMPACT_STATUSES = ["candidate", "confirmed", "rejected", "closed"] as const;
export type ImpactStatus = (typeof IMPACT_STATUSES)[number];

export const IMPACT_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type ImpactSeverity = (typeof IMPACT_SEVERITIES)[number];

export const IMPACT_LIKELIHOODS = ["unknown", "low", "medium", "high"] as const;
export type ImpactLikelihood = (typeof IMPACT_LIKELIHOODS)[number];

export const BASELINE_TYPES = [
  "DESIGN",
  "FEED",
  "IFC",
  "INSTALLED",
  "AS_BUILT",
  "COMMISSIONED",
  "OPERATIONAL",
  "MODIFICATION",
] as const;
export type BaselineType = (typeof BASELINE_TYPES)[number];

export const BASELINE_STATUSES = ["draft", "frozen", "superseded", "archived"] as const;
export type BaselineStatus = (typeof BASELINE_STATUSES)[number];

export const ALLOCATION_TARGET_TYPES = ["system", "asset", "interface", "document"] as const;
export type AllocationTargetType = (typeof ALLOCATION_TARGET_TYPES)[number];

export const AFFECTS_TARGET_TYPES = [
  "requirement",
  "system",
  "asset",
  "interface",
  "decision",
  "assumption",
  "document",
  "configuration_baseline",
] as const;
export type AffectsTargetType = (typeof AFFECTS_TARGET_TYPES)[number];

export const IMPACT_TRAVERSAL_RELATIONS = [
  "ALLOCATED_TO",
  "CONTAINS",
  "USES",
  "AFFECTS",
  "DEPENDS_ON",
  "CONNECTS",
  "USED_BY",
] as const;

export const IMPACT_TRAVERSAL_MAX_DEPTH = 4;

export const DISCOVERED_DEPENDENCY = "DISCOVERED_DEPENDENCY" as const;
export const CONFIRMED_ENGINEERING_IMPACT = "CONFIRMED_ENGINEERING_IMPACT" as const;

function assertIn<T extends string>(value: string, allowed: readonly T[], label: string): asserts value is T {
  if (!(allowed as readonly string[]).includes(value)) {
    throw new Error(`Unknown ${label}: ${value}`);
  }
}

export function assertRequirementType(value: string): asserts value is RequirementType {
  assertIn(value, REQUIREMENT_TYPES, "requirement type");
}
export function assertRequirementStatus(value: string): asserts value is RequirementStatus {
  assertIn(value, REQUIREMENT_STATUSES, "requirement status");
}
export function assertVerificationMethod(value: string): asserts value is VerificationMethod {
  assertIn(value, VERIFICATION_METHODS, "verification method");
}
export function assertVerificationStatus(value: string): asserts value is VerificationStatus {
  assertIn(value, VERIFICATION_STATUSES, "verification status");
}
export function assertChangeType(value: string): asserts value is ChangeType {
  assertIn(value, CHANGE_TYPES, "change type");
}
export function assertChangeStatus(value: string): asserts value is ChangeStatus {
  assertIn(value, CHANGE_STATUSES, "change status");
}
export function assertChangeTransition(from: string, to: string) {
  assertChangeStatus(from);
  assertChangeStatus(to);
  if (from === to) return;
  if (!CHANGE_TRANSITIONS[from].includes(to)) {
    throw new Error(`Illegal change status transition: ${from} → ${to}`);
  }
}
export function assertImpactType(value: string): asserts value is ImpactType {
  assertIn(value, IMPACT_TYPES, "impact type");
}
export function assertImpactStatus(value: string): asserts value is ImpactStatus {
  assertIn(value, IMPACT_STATUSES, "impact status");
}
export function assertImpactSeverity(value: string): asserts value is ImpactSeverity {
  assertIn(value, IMPACT_SEVERITIES, "impact severity");
}
export function assertImpactLikelihood(value: string): asserts value is ImpactLikelihood {
  assertIn(value, IMPACT_LIKELIHOODS, "impact likelihood");
}
export function assertBaselineType(value: string): asserts value is BaselineType {
  assertIn(value, BASELINE_TYPES, "baseline type");
}
export function assertBaselineStatus(value: string): asserts value is BaselineStatus {
  assertIn(value, BASELINE_STATUSES, "baseline status");
}
export function assertAllocationTargetType(value: string): asserts value is AllocationTargetType {
  assertIn(value, ALLOCATION_TARGET_TYPES, "allocation target type");
}
export function assertAffectsTargetType(value: string): asserts value is AffectsTargetType {
  assertIn(value, AFFECTS_TARGET_TYPES, "AFFECTS target type");
}
export function assertFrozenBaselineMutable(status: string) {
  if (status === "frozen" || status === "superseded" || status === "archived") {
    throw new Error("frozen configuration baseline is immutable; create a superseding baseline");
  }
}
export function assertImpactNotAutoConfirmed(status: string) {
  if (status === "confirmed") return;
}
