import type { EvidenceStatus, SecurityEvidenceReference } from "../contracts";
import {
  assertNoSensitivePayload,
  assertObservedProvenance,
  evaluateEvidenceFreshness,
} from "./semantics";

export class SecurityEvidenceRegistry {
  readonly kind = "security_evidence_registry" as const;
  private evidence = new Map<string, SecurityEvidenceReference>();

  record(item: SecurityEvidenceReference): SecurityEvidenceReference {
    assertNoSensitivePayload(item.containsSensitivePayload);
    assertObservedProvenance(item.provenance);
    if (!item.sourceRef || !item.sourceType || !item.collector) {
      throw new Error("Evidence provenance incomplete");
    }
    const freshness = evaluateEvidenceFreshness(item);
    const stored: SecurityEvidenceReference = {
      ...item,
      freshness,
      status: freshness === "current" ? item.status === "invalid" ? "invalid" : freshness : freshness,
    };
    this.evidence.set(stored.evidenceId, stored);
    return stored;
  }

  get(evidenceId: string): SecurityEvidenceReference | undefined {
    return this.evidence.get(evidenceId);
  }

  require(evidenceId: string): SecurityEvidenceReference {
    const e = this.evidence.get(evidenceId);
    if (!e) throw new Error(`Unknown evidence: ${evidenceId}`);
    return e;
  }

  listByControl(controlId: string): SecurityEvidenceReference[] {
    return [...this.evidence.values()].filter((e) => e.controlId === controlId);
  }

  list(): SecurityEvidenceReference[] {
    return [...this.evidence.values()];
  }

  statusesForControl(controlId: string): EvidenceStatus[] {
    return this.listByControl(controlId).map((e) => e.freshness);
  }

  /** Conflicting evidence when same control has current + invalid observed claims. */
  detectConflict(controlId: string): boolean {
    const items = this.listByControl(controlId);
    const hasCurrent = items.some((e) => e.freshness === "current");
    const hasInvalid = items.some((e) => e.freshness === "invalid" || e.status === "invalid");
    return hasCurrent && hasInvalid;
  }
}
