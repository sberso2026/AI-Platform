import { failClosed } from "../errors";
import { applyHumanDisposition, type FindingDisposition } from "../disposition";
import { assertSameOwnership, createReviewOwnership } from "../ownership";
import { verifyEvidenceRecord, type FindingEvidence } from "../evidence";
import type { ReviewFinding } from "../finding";
import type { ReviewPackage } from "../review-package";
import { transitionReviewRun, type ReviewRun } from "../review-run";
import type {
  EngineeringReviewStore,
  KnownReviewDocument,
} from "../ports";
import type { ReviewRegister } from "../register";
import {
  assertDelete,
  assertInsert,
  assertSelect,
  assertUpdate,
  canSelectReviewRow,
  type ReviewAccessPrincipal,
} from "./access";
import {
  dispositionFromRow,
  dispositionToRow,
  evidenceFromRow,
  evidenceToRow,
  findingFromRow,
  findingToRow,
  packageFromRow,
  packageToRow,
  runFromRow,
  runToRow,
} from "./mappers";
import type {
  ReviewDispositionRow,
  ReviewEvidenceRow,
  ReviewFindingRow,
  ReviewPackageRow,
  ReviewRunRow,
} from "./rows";
import { createReviewAuditEvent, type ReviewAuditSink } from "../audit";

export type SharedReviewMemory = {
  packages: Map<string, ReviewPackageRow>;
  runs: Map<string, ReviewRunRow>;
  findings: Map<string, ReviewFindingRow>;
  evidence: Map<string, ReviewEvidenceRow>;
  dispositions: Map<string, ReviewDispositionRow>;
  documents: Map<string, KnownReviewDocument>;
};

export function createSharedReviewMemory(): SharedReviewMemory {
  return {
    packages: new Map(),
    runs: new Map(),
    findings: new Map(),
    evidence: new Map(),
    dispositions: new Map(),
    documents: new Map(),
  };
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

/**
 * In-memory persistence adapter.
 *
 * Enforces the same tenant+workspace membership and ownership predicates as
 * the SQL migration. Does not import a Supabase client.
 */
export class MemoryEngineeringReviewStore implements EngineeringReviewStore {
  constructor(
    private readonly principal: ReviewAccessPrincipal,
    private readonly memory: SharedReviewMemory,
    private readonly audit?: ReviewAuditSink,
  ) {}

  registerKnownDocument(document: KnownReviewDocument): void {
    createReviewOwnership(document);
    this.memory.documents.set(document.documentId, document);
  }

  getKnownDocument(documentId: string): KnownReviewDocument | undefined {
    return this.memory.documents.get(documentId);
  }

  async saveReviewPackage(pkg: ReviewPackage): Promise<ReviewPackage> {
    const existing = this.memory.packages.get(pkg.id);
    if (existing) {
      assertUpdate(this.principal, existing.tenant_id, existing.workspace_id);
      if (
        existing.tenant_id !== pkg.tenantId ||
        existing.workspace_id !== pkg.workspaceId ||
        existing.project_id !== pkg.projectId
      ) {
        failClosed("ownership_immutable", "Review package ownership cannot change after creation");
      }
    } else {
      assertInsert(this.principal, pkg.tenantId, pkg.workspaceId);
    }
    this.assertWorkspaceProject(pkg);
    const row = packageToRow(pkg);
    this.memory.packages.set(pkg.id, clone(row));
    if (!existing) {
      this.emit("review_package.created", "engineering_review_package", pkg.id, pkg, pkg.createdBy);
    }
    return packageFromRow(clone(row));
  }

  async loadReviewPackage(id: string): Promise<ReviewPackage | null> {
    const row = this.memory.packages.get(id);
    if (!row) return null;
    if (!canSelectReviewRow(this.principal, row.tenant_id, row.workspace_id)) return null;
    return packageFromRow(clone(row));
  }

  async deleteReviewPackage(id: string): Promise<void> {
    const row = this.requirePackageRow(id);
    assertDelete(this.principal, row.tenant_id, row.workspace_id);
    this.memory.packages.delete(id);
  }

  async startReviewRun(run: ReviewRun): Promise<ReviewRun> {
    const pkg = this.requireVisiblePackage(run.reviewPackageId);
    assertSameOwnership(pkg, run);
    assertInsert(this.principal, run.tenantId, run.workspaceId);
    this.assertWorkspaceProject(run);
    const started = run.status === "queued" ? transitionReviewRun(run, "running") : run;
    this.memory.runs.set(started.id, clone(runToRow(started)));
    this.emit("review_run.created", "engineering_review_run", started.id, started);
    this.emit("review_run.started", "engineering_review_run", started.id, started);
    return runFromRow(clone(this.memory.runs.get(started.id)!));
  }

  async saveReviewRun(run: ReviewRun): Promise<ReviewRun> {
    const existing = this.memory.runs.get(run.id);
    if (!existing) {
      return this.startReviewRun(run);
    }
    assertUpdate(this.principal, existing.tenant_id, existing.workspace_id);
    if (
      existing.tenant_id !== run.tenantId ||
      existing.workspace_id !== run.workspaceId ||
      existing.project_id !== run.projectId
    ) {
      failClosed("ownership_immutable", "Review run ownership cannot change after creation");
    }
    this.memory.runs.set(run.id, clone(runToRow(run)));
    if (run.status === "completed") {
      this.emit("review_run.completed", "engineering_review_run", run.id, run);
    }
    if (run.status === "failed") {
      this.emit("review_run.failed", "engineering_review_run", run.id, run);
    }
    return runFromRow(clone(this.memory.runs.get(run.id)!));
  }

  async loadReviewRun(id: string): Promise<ReviewRun | null> {
    const row = this.memory.runs.get(id);
    if (!row) return null;
    if (!canSelectReviewRow(this.principal, row.tenant_id, row.workspace_id)) return null;
    return runFromRow(clone(row));
  }

  async deleteReviewRun(id: string): Promise<void> {
    const row = this.requireRunRow(id);
    assertDelete(this.principal, row.tenant_id, row.workspace_id);
    this.memory.runs.delete(id);
  }

  async persistCandidateFindings(findings: readonly ReviewFinding[]): Promise<readonly ReviewFinding[]> {
    const persisted: ReviewFinding[] = [];
    for (const finding of findings) {
      persisted.push(await this.saveReviewFinding(finding));
    }
    return persisted;
  }

  async saveReviewFinding(finding: ReviewFinding): Promise<ReviewFinding> {
    const existing = this.memory.findings.get(finding.id);
    const run = this.requireVisibleRun(finding.reviewRunId);
    assertSameOwnership(run, finding);
    if (existing) {
      assertUpdate(this.principal, existing.tenant_id, existing.workspace_id);
      if (
        existing.tenant_id !== finding.tenantId ||
        existing.workspace_id !== finding.workspaceId ||
        existing.project_id !== finding.projectId ||
        existing.review_run_id !== finding.reviewRunId ||
        existing.review_package_id !== finding.reviewPackageId
      ) {
        failClosed("ownership_immutable", "Review finding ownership/provenance cannot change");
      }
    } else {
      assertInsert(this.principal, finding.tenantId, finding.workspaceId);
    }
    this.assertWorkspaceProject(finding);
    for (const evidence of finding.evidence) {
      this.assertEvidenceDocument(finding, evidence);
    }
    this.memory.findings.set(finding.id, clone(findingToRow(finding)));
    for (const evidence of finding.evidence) {
      this.memory.evidence.set(evidence.evidenceId, clone(evidenceToRow(finding.id, evidence)));
    }
    if (!existing) {
      this.emit("review_finding.created", "engineering_review_finding", finding.id, finding);
    }
    return this.hydrateFinding(finding.id)!;
  }

  async loadReviewFinding(id: string): Promise<ReviewFinding | null> {
    const row = this.memory.findings.get(id);
    if (!row) return null;
    if (!canSelectReviewRow(this.principal, row.tenant_id, row.workspace_id)) return null;
    return this.hydrateFinding(id);
  }

  async attachVerifiedEvidence(findingId: string, evidence: FindingEvidence): Promise<ReviewFinding> {
    const finding = await this.loadReviewFinding(findingId);
    if (!finding) failClosed("finding_not_found", "Review finding not found", { findingId });
    assertUpdate(this.principal, finding.tenantId, finding.workspaceId);
    this.assertEvidenceDocument(finding, evidence);
    const verified = verifyEvidenceRecord(evidence);
    const next: ReviewFinding = {
      ...finding,
      evidence: [...finding.evidence.filter((item) => item.evidenceId !== verified.evidenceId), verified],
      updatedAt: new Date().toISOString(),
    };
    await this.saveReviewFinding(next);
    this.emit("review_evidence.verified", "engineering_review_evidence", verified.evidenceId, finding);
    return this.hydrateFinding(findingId)!;
  }

  async recordHumanDisposition(input: {
    findingId: string;
    action: FindingDisposition["action"];
    actorId: string;
    actorKind?: "human" | "system" | "ai";
    reason?: string;
    assignedTo?: string;
    now?: string;
  }): Promise<{ finding: ReviewFinding; disposition: FindingDisposition }> {
    if (input.actorKind && input.actorKind !== "human") {
      failClosed("ai_cannot_dispose", "AI and system actors cannot perform human disposition", {
        actorKind: input.actorKind,
      });
    }
    const finding = await this.loadReviewFinding(input.findingId);
    if (!finding) failClosed("finding_not_found", "Review finding not found", { findingId: input.findingId });
    assertUpdate(this.principal, finding.tenantId, finding.workspaceId);
    const applied = applyHumanDisposition({
      finding,
      action: input.action,
      actorId: input.actorId,
      reason: input.reason,
      assignedTo: input.assignedTo,
      now: input.now,
    });
    await this.saveReviewFinding(applied.finding);
    const row = dispositionToRow(applied.disposition, applied.finding);
    this.memory.dispositions.set(applied.disposition.id, clone(row));
    this.emit(
      applied.disposition.action === "close" ? "review_finding.closed" : "review_finding.disposition",
      "engineering_review_disposition",
      applied.disposition.id,
      applied.finding,
      applied.disposition.actorId,
      {
        action: applied.disposition.action,
        previousStatus: applied.disposition.previousStatus,
        newStatus: applied.disposition.newStatus,
      },
    );
    return { finding: this.hydrateFinding(applied.finding.id)!, disposition: dispositionFromRow(clone(row)) };
  }

  async loadDispositionHistory(findingId: string): Promise<readonly FindingDisposition[]> {
    const finding = await this.loadReviewFinding(findingId);
    if (!finding) return [];
    return [...this.memory.dispositions.values()]
      .filter((row) => row.finding_id === findingId)
      .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
      .map((row) => dispositionFromRow(clone(row)));
  }

  async loadReviewRegister(runId: string): Promise<ReviewRegister | null> {
    const run = await this.loadReviewRun(runId);
    if (!run) return null;
    const pkg = await this.loadReviewPackage(run.reviewPackageId);
    if (!pkg) return null;
    const findings = [...this.memory.findings.values()]
      .filter((row) => row.review_run_id === runId)
      .filter((row) => canSelectReviewRow(this.principal, row.tenant_id, row.workspace_id))
      .map((row) => this.hydrateFinding(row.id)!)
      .sort((a, b) => a.id.localeCompare(b.id));
    const findingIds = new Set(findings.map((item) => item.id as string));
    const dispositions = [...this.memory.dispositions.values()]
      .filter((row) => findingIds.has(row.finding_id))
      .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
      .map((row) => dispositionFromRow(clone(row)));
    return { pkg, run, findings, dispositions };
  }

  async deleteReviewFinding(id: string): Promise<void> {
    const row = this.requireFindingRow(id);
    assertDelete(this.principal, row.tenant_id, row.workspace_id);
    this.memory.findings.delete(id);
    for (const [evidenceId, evidence] of this.memory.evidence) {
      if (evidence.finding_id === id) this.memory.evidence.delete(evidenceId);
    }
  }

  private hydrateFinding(id: string): ReviewFinding | null {
    const row = this.memory.findings.get(id);
    if (!row) return null;
    const evidence = [...this.memory.evidence.values()]
      .filter((item) => item.finding_id === id)
      .map((item) => evidenceFromRow(clone(item)));
    return findingFromRow(clone(row), evidence);
  }

  private requirePackageRow(id: string): ReviewPackageRow {
    const row = this.memory.packages.get(id);
    if (!row) failClosed("package_not_found", "Review package not found", { id });
    assertSelect(this.principal, row.tenant_id, row.workspace_id);
    return row;
  }

  private requireRunRow(id: string): ReviewRunRow {
    const row = this.memory.runs.get(id);
    if (!row) failClosed("run_not_found", "Review run not found", { id });
    assertSelect(this.principal, row.tenant_id, row.workspace_id);
    return row;
  }

  private requireFindingRow(id: string): ReviewFindingRow {
    const row = this.memory.findings.get(id);
    if (!row) failClosed("finding_not_found", "Review finding not found", { id });
    assertSelect(this.principal, row.tenant_id, row.workspace_id);
    return row;
  }

  private requireVisiblePackage(id: string): ReviewPackage {
    const pkg = this.memory.packages.get(id);
    if (!pkg) failClosed("package_not_found", "Review package not found", { id });
    assertSelect(this.principal, pkg.tenant_id, pkg.workspace_id);
    return packageFromRow(clone(pkg));
  }

  private requireVisibleRun(id: string): ReviewRun {
    const run = this.memory.runs.get(id);
    if (!run) failClosed("run_not_found", "Review run not found", { id });
    assertSelect(this.principal, run.tenant_id, run.workspace_id);
    return runFromRow(clone(run));
  }

  private assertWorkspaceProject(ownership: { tenantId: string; workspaceId: string; projectId: string }): void {
    createReviewOwnership(ownership);
  }

  private assertEvidenceDocument(finding: ReviewFinding, evidence: FindingEvidence): void {
    assertSameOwnership(finding, evidence);
    const known = this.memory.documents.get(evidence.documentId);
    if (!known) {
      failClosed("evidence_document_unknown", "Evidence document is not a known engineering document", {
        documentId: evidence.documentId,
      });
    }
    if (known.tenantId !== evidence.tenantId) {
      failClosed("cross_tenant_rejected", "Cross-tenant evidence attachment is rejected", {
        documentId: evidence.documentId,
      });
    }
    if (known.workspaceId !== evidence.workspaceId) {
      failClosed("cross_workspace_rejected", "Cross-workspace evidence attachment is rejected", {
        documentId: evidence.documentId,
      });
    }
    if (known.projectId !== evidence.projectId) {
      failClosed("cross_project_rejected", "Cross-project evidence attachment is rejected", {
        documentId: evidence.documentId,
      });
    }
  }

  private emit(
    action: Parameters<typeof createReviewAuditEvent>[0]["action"],
    resourceType: string,
    resourceId: string,
    ownership: { tenantId: string; workspaceId: string; projectId: string },
    actorId?: string,
    metadata?: Record<string, unknown>,
  ): void {
    void this.audit?.record(
      createReviewAuditEvent({
        ...createReviewOwnership(ownership),
        action,
        resourceType,
        resourceId,
        actorId: actorId ?? this.principal.userId,
        at: new Date().toISOString(),
        metadata,
      }),
    );
  }
}
