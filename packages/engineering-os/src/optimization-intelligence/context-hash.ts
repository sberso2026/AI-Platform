import { fingerprintCanonical } from "./fingerprint";

/**
 * Fields that affect Optimization context hash / staleness.
 * Display-only metadata (title, name, owner, timestamps) is excluded.
 */
export function requirementContextProjection(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ""),
    requirement_code: String(row.requirement_code ?? ""),
    statement: String(row.statement ?? ""),
    acceptance_criteria: (row.acceptance_criteria as string | null) ?? null,
    verification_method: (row.verification_method as string | null) ?? null,
    verification_status: (row.verification_status as string | null) ?? null,
  };
}

export function assumptionContextProjection(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ""),
    statement: String(row.statement ?? ""),
    confidence: row.confidence == null ? null : Number(row.confidence),
    validation_status: String(row.validation_status ?? ""),
    materiality: String(row.materiality ?? ""),
  };
}

export function interfaceContextProjection(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ""),
    interface_code: String(row.interface_code ?? ""),
    interface_type: String(row.interface_type ?? ""),
    status: String(row.status ?? ""),
    criticality: String(row.criticality ?? ""),
  };
}

export function systemContextProjection(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ""),
    system_code: String(row.system_code ?? ""),
    status: String(row.status ?? ""),
  };
}

export function decisionContextProjection(row: Record<string, unknown> | null) {
  if (!row) return null;
  return {
    id: String(row.id ?? ""),
    status: String(row.status ?? ""),
  };
}

export function isMaterialAssumption(row: Record<string, unknown>): boolean {
  const materiality = String(row.materiality ?? "medium");
  return materiality === "medium" || materiality === "high" || materiality === "critical";
}

export function fingerprintStudyContext(input: {
  baselineId: string | null;
  decision: ReturnType<typeof decisionContextProjection>;
  systems: ReturnType<typeof systemContextProjection>[];
  requirements: ReturnType<typeof requirementContextProjection>[];
  assumptions: ReturnType<typeof assumptionContextProjection>[];
  interfaces: ReturnType<typeof interfaceContextProjection>[];
}): string {
  return fingerprintCanonical({
    baseline_id: input.baselineId,
    decision: input.decision,
    systems: [...input.systems].sort((a, b) => a.id.localeCompare(b.id)),
    requirements: [...input.requirements].sort((a, b) => a.id.localeCompare(b.id)),
    assumptions: [...input.assumptions].sort((a, b) => a.id.localeCompare(b.id)),
    interfaces: [...input.interfaces].sort((a, b) => a.id.localeCompare(b.id)),
  });
}
