/**
 * In-process proposal store for certification + ESSENTIAL path.
 * Proposals are orchestration records — not a parallel register SoR.
 */

import { createHash, randomUUID } from "node:crypto";
import type { EngineeringActionProposal } from "./contracts";

export function hashPayload(payload: Record<string, unknown>): string {
  return createHash("sha256").update(stableStringify(payload)).digest("hex").slice(0, 24);
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

export function newProposalId(): string {
  return `eap_${randomUUID()}`;
}

export function newFreshnessToken(context: {
  tenantId: string;
  projectId?: string | null;
  objectId?: string | null;
  resolvedAt?: string | null;
}): string {
  return createHash("sha256")
    .update(
      [
        context.tenantId,
        context.projectId ?? "",
        context.objectId ?? "",
        context.resolvedAt ?? "",
      ].join("|"),
    )
    .digest("hex")
    .slice(0, 16);
}

export interface EngineeringActionProposalStore {
  upsert(proposal: EngineeringActionProposal): Promise<EngineeringActionProposal>;
  get(tenantId: string, proposalId: string): Promise<EngineeringActionProposal | null>;
  list(tenantId: string, limit?: number): Promise<EngineeringActionProposal[]>;
  findByIdempotencyKey(
    tenantId: string,
    key: string,
  ): Promise<EngineeringActionProposal | null>;
}

export class InMemoryEngineeringActionProposalStore
  implements EngineeringActionProposalStore
{
  private readonly byId = new Map<string, EngineeringActionProposal>();

  async upsert(proposal: EngineeringActionProposal): Promise<EngineeringActionProposal> {
    const key = `${proposal.tenantId}:${proposal.proposalId}`;
    this.byId.set(key, structuredClone(proposal));
    return structuredClone(proposal);
  }

  async get(tenantId: string, proposalId: string): Promise<EngineeringActionProposal | null> {
    const row = this.byId.get(`${tenantId}:${proposalId}`);
    return row ? structuredClone(row) : null;
  }

  async list(tenantId: string, limit = 50): Promise<EngineeringActionProposal[]> {
    return [...this.byId.values()]
      .filter((p) => p.tenantId === tenantId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
      .map((p) => structuredClone(p));
  }

  async findByIdempotencyKey(
    tenantId: string,
    key: string,
  ): Promise<EngineeringActionProposal | null> {
    for (const row of this.byId.values()) {
      if (row.tenantId === tenantId && row.executionIdempotencyKey === key) {
        return structuredClone(row);
      }
    }
    return null;
  }
}
