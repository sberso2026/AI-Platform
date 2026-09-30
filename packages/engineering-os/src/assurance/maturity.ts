import type { ThreadCatalogNode } from "../digital-thread/types";
import type { AssuranceMateriality, TraceabilityMaturityState } from "./types";

export function inferTraceabilityMaturity(node: ThreadCatalogNode): TraceabilityMaturityState {
  if (node.superseded) return "SUPERSEDED";
  const status = String(node.status ?? "").toLowerCase();
  if (status === "draft") return "DRAFT";
  if (status === "superseded") return "SUPERSEDED";
  if (status === "retired" || status === "waived" || status === "withdrawn") return "NOT_APPLICABLE";
  if (status === "issued") return "ISSUED";
  if (status === "approved" || status === "accepted" || status === "frozen") return "APPROVED";
  if (status === "verified") return "VERIFIED";
  if (status === "reviewed" || status === "completed") return "REVIEWED";
  return "WORKING";
}

export function maturityApplies(
  node: ThreadCatalogNode,
  applicable: readonly TraceabilityMaturityState[],
): boolean {
  return applicable.includes(inferTraceabilityMaturity(node));
}

export function mapObjectMateriality(value?: string | null): AssuranceMateriality {
  const raw = String(value ?? "").toLowerCase();
  if (raw === "low") return "LOW";
  if (raw === "medium") return "MEDIUM";
  if (raw === "high") return "HIGH";
  if (raw === "critical") return "CRITICAL";
  return "UNASSESSED";
}

export function isLowMaterialityInformational(node: ThreadCatalogNode): boolean {
  if (mapObjectMateriality(node.materiality) === "LOW") return true;
  const title = `${node.title ?? ""} ${node.objectCode ?? ""}`.toLowerCase();
  return title.includes("informational");
}

export function ageDays(detectedAt: string, now: string): number {
  const start = Date.parse(detectedAt);
  const end = Date.parse(now);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
  return Math.floor((end - start) / 86_400_000);
}
