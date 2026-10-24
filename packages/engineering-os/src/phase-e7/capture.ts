/**
 * Passive capture + governed promotion for Engineering Memory.
 */

import type { EngineeringToolResult } from "../phase-e6/contracts";
import type {
  EngineeringMemoryCaptureCandidate,
  EngineeringMemoryClass,
  EngineeringMemoryRecord,
} from "./contracts";
import {
  rejectCotPersistence,
  rejectUnsupportedAiFactPromotion,
} from "./contracts";
import {
  computeCaptureHash,
  newMemoryId,
  type EngineeringMemoryStore,
  InMemoryEngineeringMemoryStore,
} from "./store";

const APPROVED_LIKE = new Set(["APPROVED", "REVIEWED"]);

function containsCotSignals(text: string): boolean {
  return /\b(chain[- ]of[- ]thought|hidden reasoning|private reasoning|scratchpad)\b/i.test(
    text,
  );
}

function looksLikeUnsupportedAiFact(candidate: EngineeringMemoryCaptureCandidate): boolean {
  if (candidate.authorityStatus === "APPROVED" && !candidate.evidenceRefs?.length) {
    if (candidate.sourceType === "engineering_conclusion" || !candidate.sourceId) {
      return true;
    }
  }
  return false;
}

export class EngineeringMemoryCaptureService {
  constructor(
    private readonly store: EngineeringMemoryStore = new InMemoryEngineeringMemoryStore(),
  ) {}

  getStore(): EngineeringMemoryStore {
    return this.store;
  }

  /**
   * Capture a governed event as memory. Dedupes by captureHash.
   * Never stores CoT or unsupported AI facts as APPROVED knowledge.
   */
  async capture(
    candidate: EngineeringMemoryCaptureCandidate,
  ): Promise<{ record: EngineeringMemoryRecord | null; deduped: boolean; blockedReason?: string }> {
    if (containsCotSignals(candidate.summary) || containsCotSignals(candidate.fact ?? "")) {
      rejectCotPersistence();
    }
    if (looksLikeUnsupportedAiFact(candidate)) {
      rejectUnsupportedAiFactPromotion();
    }
    if (candidate.authorityStatus === "REJECTED") {
      return {
        record: null,
        deduped: false,
        blockedReason: "rejected_recommendations_are_not_approved_knowledge",
      };
    }

    const captureHash = computeCaptureHash({
      tenantId: candidate.tenantId,
      sourceType: candidate.sourceType,
      sourceId: candidate.sourceId,
      eventType: candidate.eventType,
      toolInvocationId: candidate.toolInvocationId,
    });

    const existing = await this.store.findByCaptureHash(candidate.tenantId, captureHash);
    if (existing) {
      return { record: existing, deduped: true };
    }

    const memoryClass: EngineeringMemoryClass =
      candidate.memoryClass ??
      (candidate.projectId ? "PROJECT_MEMORY" : "WORKING_CONTEXT");

    const now = new Date().toISOString();
    const record: EngineeringMemoryRecord = {
      memoryId: newMemoryId(),
      tenantId: candidate.tenantId,
      workspaceId: candidate.workspaceId ?? null,
      projectId: candidate.projectId ?? null,
      memoryClass,
      subject: candidate.subject,
      summary: candidate.summary.trim(),
      fact: candidate.fact?.trim() ?? null,
      relatedObjects: candidate.relatedObjects ?? [],
      evidenceRefs: candidate.evidenceRefs ?? [],
      sourceType: candidate.sourceType,
      sourceId: candidate.sourceId,
      authorityStatus: candidate.authorityStatus,
      provenance: {
        mechanism: "PASSIVE_CAPTURE",
        platformMemoryOwner: "platform_kernel",
        platformMemoryId: null,
        llmGenerated: false,
        containsCot: false,
        eventType: candidate.eventType ?? null,
        captureHash,
        originalEvidenceRefs: candidate.evidenceRefs ?? [],
      },
      createdBy: candidate.createdBy,
      createdAt: now,
      validFrom: candidate.validFrom ?? now,
      supersededBy: null,
      retentionPolicy: {
        action: "RETAIN",
        hardDeletePermitted: false,
        reason: "default_audit_retain",
      },
      sensitivity: candidate.sensitivity ?? "general",
      access: {
        revoked: false,
        sourceAccessRequired: true,
        restricted: candidate.access?.restricted ?? false,
        authorizedUserIds: candidate.access?.authorizedUserIds,
      },
    };

    const saved = await this.store.upsert(record);
    return { record: saved, deduped: false };
  }

  /**
   * Capture E6 tool result only when immutable + successful enough.
   * Experimental/failed/incomplete never auto-become APPROVED organisational knowledge.
   */
  async captureToolResult(input: {
    tenantId: string;
    workspaceId?: string | null;
    projectId?: string | null;
    userId: string;
    subject: EngineeringMemoryCaptureCandidate["subject"];
    toolResult: EngineeringToolResult;
    relatedObjects?: EngineeringMemoryCaptureCandidate["relatedObjects"];
  }): Promise<{ record: EngineeringMemoryRecord | null; blockedReason?: string }> {
    const tr = input.toolResult;
    if (tr.provenance.llmGenerated) {
      return { record: null, blockedReason: "llm_fabricated_tool_result_rejected" };
    }
    if (tr.status === "FAILED" || tr.status === "TIMEOUT" || tr.status === "INCOMPLETE") {
      return { record: null, blockedReason: "failed_or_incomplete_tool_not_promoted" };
    }
    if (tr.status === "BLOCKED") {
      return { record: null, blockedReason: "blocked_tool_not_promoted" };
    }

    const authorityStatus =
      tr.authorityStatus === "REQUIRES_HUMAN_REVIEW" || tr.reviewRequired
        ? "OBSERVED"
        : "REVIEWED";

    const result = await this.capture({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      memoryClass: "WORKING_CONTEXT",
      subject: input.subject,
      summary: `Governed tool ${tr.toolId}@${tr.toolVersion} → ${tr.status} (${tr.outputKind})`,
      fact:
        tr.status === "SUCCESS" && tr.output
          ? JSON.stringify(tr.output)
          : null,
      evidenceRefs: tr.evidenceRefs,
      sourceType: "tool_result",
      sourceId: tr.invocationId,
      authorityStatus,
      eventType: "engineering.tool.invoked",
      createdBy: input.userId,
      relatedObjects: input.relatedObjects,
      toolInvocationId: tr.invocationId,
      sensitivity: "general",
    });

    return { record: result.record, blockedReason: result.blockedReason };
  }

  /**
   * Governed promotion. WORKING_CONTEXT never auto-becomes ORGANISATIONAL_KNOWLEDGE.
   */
  async promote(input: {
    tenantId: string;
    memoryId: string;
    targetClass: EngineeringMemoryClass;
    actorUserId: string;
    requireHumanReview?: boolean;
    humanReviewed?: boolean;
  }): Promise<{ record: EngineeringMemoryRecord | null; blockedReason?: string }> {
    const existing = await this.store.getById(input.tenantId, input.memoryId);
    if (!existing) return { record: null, blockedReason: "memory_not_found" };

    if (
      existing.memoryClass === "WORKING_CONTEXT" &&
      input.targetClass === "ORGANISATIONAL_KNOWLEDGE"
    ) {
      return {
        record: null,
        blockedReason: "working_context_cannot_auto_become_organisational_knowledge",
      };
    }

    if (!existing.evidenceRefs.length && !existing.provenance.originalEvidenceRefs.length) {
      return { record: null, blockedReason: "promotion_requires_evidence" };
    }

    if (
      input.targetClass === "ORGANISATIONAL_KNOWLEDGE" ||
      input.targetClass === "ENGINEERING_KNOWLEDGE"
    ) {
      if (!APPROVED_LIKE.has(existing.authorityStatus) && !input.humanReviewed) {
        return {
          record: null,
          blockedReason: "promotion_requires_review_or_approved_authority",
        };
      }
      if (input.requireHumanReview && !input.humanReviewed) {
        return { record: null, blockedReason: "human_review_required_for_promotion" };
      }
    }

    if (existing.authorityStatus === "REJECTED" || existing.authorityStatus === "DRAFT") {
      return { record: null, blockedReason: "draft_or_rejected_cannot_promote" };
    }

    const promoted: EngineeringMemoryRecord = {
      ...existing,
      memoryClass: input.targetClass,
      authorityStatus:
        input.humanReviewed || APPROVED_LIKE.has(existing.authorityStatus)
          ? existing.authorityStatus === "APPROVED"
            ? "APPROVED"
            : "REVIEWED"
          : existing.authorityStatus,
      provenance: {
        ...existing.provenance,
        mechanism: "PROMOTED",
        llmGenerated: false,
        containsCot: false,
      },
    };

    const saved = await this.store.upsert(promoted);
    return { record: saved };
  }

  async supersede(input: {
    tenantId: string;
    memoryId: string;
    supersededByMemoryId: string;
  }): Promise<EngineeringMemoryRecord | null> {
    const existing = await this.store.getById(input.tenantId, input.memoryId);
    if (!existing) return null;
    return this.store.upsert({
      ...existing,
      authorityStatus: "SUPERSEDED",
      supersededBy: input.supersededByMemoryId,
    });
  }
}
