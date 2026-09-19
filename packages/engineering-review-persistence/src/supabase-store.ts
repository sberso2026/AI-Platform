import { randomUUID } from "node:crypto";
import {
  applyHumanDisposition,
  assertSameOwnership,
  createReviewAuditEvent,
  createReviewOwnership,
  dispositionFromRow,
  dispositionToRow,
  evidenceFromRow,
  evidenceToRow,
  failClosed,
  findingFromRow,
  findingToRow,
  packageFromRow,
  packageToRow,
  runFromRow,
  runToRow,
  transitionReviewRun,
  verifyEvidenceRecord,
  type EngineeringReviewStore,
  type FindingDisposition,
  type FindingEvidence,
  type KnownReviewDocument,
  type ReviewAuditSink,
  type ReviewFinding,
  type ReviewPackage,
  type ReviewRegister,
  type ReviewRun,
} from "@rtb/engineering-review";
import { isUuid as hostedUuid } from "./env";
import type { ReviewClientKind, ReviewSqlClient } from "./client";

function asUuid(id: string): string {
  return hostedUuid(id) ? id : randomUUID();
}

function reject(error: { message?: string; code?: string } | null | undefined, fallback: string): void {
  if (!error) return;
  const message = error.message ?? fallback;
  const lower = message.toLowerCase();
  if (lower.includes("immutable")) failClosed("ownership_immutable", message);
  if (lower.includes("document ownership mismatch") || lower.includes("does not belong")) {
    failClosed("cross_workspace_rejected", message);
  }
  if (lower.includes("actor_kind") || lower.includes("require actor")) {
    failClosed("ai_cannot_dispose", message);
  }
  if (
    lower.includes("row-level security") ||
    lower.includes("permission denied") ||
    error.code === "42501" ||
    error.code === "PGRST301" ||
    error.code === "42501"
  ) {
    failClosed("rls_denied", message);
  }
  failClosed("persistence_rejected", message);
}

/**
 * Production Review persistence.
 *
 * `authenticated` — user JWT, subject to RLS. Use this for user-facing operations
 * and for proving isolation.
 * `service` — service role, bypasses RLS. Fixture/internal only. Never treat
 * service-role success as evidence that user RLS works.
 */
export class SupabaseEngineeringReviewStore implements EngineeringReviewStore {
  private readonly catalog = new Map<string, KnownReviewDocument>();

  constructor(
    private readonly client: ReviewSqlClient,
    private readonly kind: ReviewClientKind,
    private readonly audit?: ReviewAuditSink,
  ) {
    if (kind === "anon") {
      failClosed("rls_denied", "Anonymous clients cannot mutate Review AI aggregates");
    }
  }

  get clientKind(): ReviewClientKind {
    return this.kind;
  }

  registerKnownDocument(document: KnownReviewDocument): void {
    createReviewOwnership(document);
    this.catalog.set(document.documentId, document);
  }

  getKnownDocument(documentId: string): KnownReviewDocument | undefined {
    return this.catalog.get(documentId);
  }

  async loadAuthorizedDocument(
    documentId: string,
    expected: { tenantId: string; workspaceId: string; projectId: string },
  ): Promise<KnownReviewDocument> {
    const { data, error } = await this.client
      .from("engineering_documents")
      .select("id, tenant_id, workspace_id, engineering_project_id")
      .eq("id", documentId)
      .maybeSingle();
    reject(error, "document catalog query failed");
    if (!data) {
      failClosed("document_unauthorized", "Document UUID is not visible in the authorized context", {
        documentId,
        clientKind: this.kind,
      });
    }
    const row = data as {
      id: string;
      tenant_id: string;
      workspace_id: string | null;
      engineering_project_id: string | null;
    };
    if (row.tenant_id !== expected.tenantId) {
      failClosed("cross_tenant_rejected", "Document tenant does not match review ownership", {
        documentId,
      });
    }
    if (!row.workspace_id || row.workspace_id !== expected.workspaceId) {
      failClosed("cross_workspace_rejected", "Document workspace does not match review ownership", {
        documentId,
        documentWorkspaceId: row.workspace_id,
      });
    }
    if (!row.engineering_project_id || row.engineering_project_id !== expected.projectId) {
      failClosed("cross_project_rejected", "Document project does not match review ownership", {
        documentId,
        documentProjectId: row.engineering_project_id,
      });
    }
    const known: KnownReviewDocument = {
      documentId: row.id,
      tenantId: row.tenant_id,
      workspaceId: row.workspace_id,
      projectId: row.engineering_project_id,
    };
    this.catalog.set(documentId, known);
    return known;
  }

  async saveReviewPackage(pkg: ReviewPackage): Promise<ReviewPackage> {
    const id = asUuid(pkg.id);
    const row = { ...packageToRow({ ...pkg, id: id as typeof pkg.id }), id };
    const { data, error } = await this.client
      .from("engineering_review_packages")
      .upsert(row, { onConflict: "id" })
      .select("*")
      .single();
    reject(error, "saveReviewPackage failed");
    const saved = packageFromRow(data as never);
    await this.emit("review_package.created", "engineering_review_package", saved.id, saved, pkg.createdBy);
    return saved;
  }

  async loadReviewPackage(id: string): Promise<ReviewPackage | null> {
    const { data, error } = await this.client
      .from("engineering_review_packages")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    reject(error, "loadReviewPackage failed");
    return data ? packageFromRow(data as never) : null;
  }

  async deleteReviewPackage(id: string): Promise<void> {
    const { error } = await this.client.from("engineering_review_packages").delete().eq("id", id);
    reject(error, "deleteReviewPackage failed");
  }

  async startReviewRun(run: ReviewRun): Promise<ReviewRun> {
    const started = run.status === "queued" ? transitionReviewRun(run, "running") : run;
    const id = asUuid(started.id);
    const row = runToRow({ ...started, id: id as typeof started.id });
    const { data, error } = await this.client
      .from("engineering_review_runs")
      .insert({ ...row, id })
      .select("*")
      .single();
    reject(error, "startReviewRun failed");
    const saved = runFromRow(data as never);
    await this.emit("review_run.created", "engineering_review_run", saved.id, saved);
    await this.emit("review_run.started", "engineering_review_run", saved.id, saved);
    return saved;
  }

  async saveReviewRun(run: ReviewRun): Promise<ReviewRun> {
    const row = runToRow(run);
    const { data, error } = await this.client
      .from("engineering_review_runs")
      .upsert(row, { onConflict: "id" })
      .select("*")
      .single();
    reject(error, "saveReviewRun failed");
    const saved = runFromRow(data as never);
    if (saved.status === "completed") {
      await this.emit("review_run.completed", "engineering_review_run", saved.id, saved);
    }
    if (saved.status === "failed") {
      await this.emit("review_run.failed", "engineering_review_run", saved.id, saved);
    }
    return saved;
  }

  async loadReviewRun(id: string): Promise<ReviewRun | null> {
    const { data, error } = await this.client
      .from("engineering_review_runs")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    reject(error, "loadReviewRun failed");
    return data ? runFromRow(data as never) : null;
  }

  async deleteReviewRun(id: string): Promise<void> {
    const { error } = await this.client.from("engineering_review_runs").delete().eq("id", id);
    reject(error, "deleteReviewRun failed");
  }

  async persistCandidateFindings(findings: readonly ReviewFinding[]): Promise<readonly ReviewFinding[]> {
    const saved: ReviewFinding[] = [];
    for (const finding of findings) {
      saved.push(await this.saveReviewFinding(finding));
    }
    return saved;
  }

  async saveReviewFinding(finding: ReviewFinding): Promise<ReviewFinding> {
    for (const evidence of finding.evidence) {
      await this.loadAuthorizedDocument(evidence.documentId, finding);
      assertSameOwnership(finding, evidence);
    }
    const hosted = {
      ...finding,
      id: asUuid(finding.id) as typeof finding.id,
    };
    const findingRow = findingToRow(hosted);
    const evidenceRows = hosted.evidence.map((item) =>
      evidenceToRow(hosted.id, { ...item, evidenceId: asUuid(item.evidenceId) as typeof item.evidenceId }),
    );
    const { data, error } = await this.client.rpc("engineering_review_persist_finding_bundle", {
      p_finding: findingRow,
      p_evidence: evidenceRows,
    });
    reject(error, "saveReviewFinding failed");
    const id = String((data as { id?: string } | null)?.id ?? hosted.id);
    const loaded = await this.loadReviewFinding(id);
    if (!loaded) failClosed("persistence_rejected", "Finding was not visible after persist");
    await this.emit("review_finding.created", "engineering_review_finding", loaded.id, loaded);
    if (loaded.evidence.some((item) => item.verificationState === "verified")) {
      await this.emit("review_evidence.verified", "engineering_review_evidence", loaded.id, loaded);
    }
    return loaded;
  }

  async loadReviewFinding(id: string): Promise<ReviewFinding | null> {
    const { data, error } = await this.client
      .from("engineering_review_findings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    reject(error, "loadReviewFinding failed");
    if (!data) return null;
    const { data: evidence, error: evidenceError } = await this.client
      .from("engineering_review_evidence")
      .select("*")
      .eq("finding_id", id);
    reject(evidenceError, "loadReviewFinding evidence failed");
    return findingFromRow(
      data as never,
      (evidence ?? []).map((row) => evidenceFromRow(row as never)),
    );
  }

  async attachVerifiedEvidence(findingId: string, evidence: FindingEvidence): Promise<ReviewFinding> {
    const finding = await this.loadReviewFinding(findingId);
    if (!finding) failClosed("finding_not_found", "Review finding not found", { findingId });
    await this.loadAuthorizedDocument(evidence.documentId, finding);
    assertSameOwnership(finding, evidence);
    const verified = verifyEvidenceRecord(evidence);
    const next: ReviewFinding = {
      ...finding,
      evidence: [...finding.evidence.filter((item) => item.evidenceId !== verified.evidenceId), verified],
    };
    const saved = await this.saveReviewFinding(next);
    await this.emit("review_evidence.verified", "engineering_review_evidence", verified.evidenceId, saved);
    return saved;
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
    const applied = applyHumanDisposition({
      finding,
      action: input.action,
      actorId: input.actorId,
      reason: input.reason,
      assignedTo: input.assignedTo,
      now: input.now,
    });
    const { error } = await this.client.rpc("engineering_review_record_disposition", {
      p_finding: findingToRow(applied.finding),
      p_disposition: dispositionToRow(applied.disposition, applied.finding),
    });
    reject(error, "recordHumanDisposition failed");
    const loaded = await this.loadReviewFinding(applied.finding.id);
    if (!loaded) failClosed("persistence_rejected", "Finding missing after disposition");
    await this.emit(
      applied.disposition.action === "close" ? "review_finding.closed" : "review_finding.disposition",
      "engineering_review_disposition",
      applied.disposition.id,
      loaded,
      applied.disposition.actorId,
      {
        action: applied.disposition.action,
        previousStatus: applied.disposition.previousStatus,
        newStatus: applied.disposition.newStatus,
      },
    );
    return { finding: loaded, disposition: applied.disposition };
  }

  async loadDispositionHistory(findingId: string): Promise<readonly FindingDisposition[]> {
    const { data, error } = await this.client
      .from("engineering_review_dispositions")
      .select("*")
      .eq("finding_id", findingId)
      .order("occurred_at", { ascending: true });
    reject(error, "loadDispositionHistory failed");
    return (data ?? []).map((row) => dispositionFromRow(row as never));
  }

  async loadReviewRegister(runId: string): Promise<ReviewRegister | null> {
    const run = await this.loadReviewRun(runId);
    if (!run) return null;
    const pkg = await this.loadReviewPackage(run.reviewPackageId);
    if (!pkg) return null;
    const { data: findingRows, error } = await this.client
      .from("engineering_review_findings")
      .select("*")
      .eq("review_run_id", runId);
    reject(error, "loadReviewRegister findings failed");
    const findings: ReviewFinding[] = [];
    for (const row of findingRows ?? []) {
      const loaded = await this.loadReviewFinding(String((row as { id: string }).id));
      if (loaded) findings.push(loaded);
    }
    const findingIds = findings.map((item) => item.id);
    const { data: dispositionRows, error: dispositionError } = await this.client
      .from("engineering_review_dispositions")
      .select("*")
      .in("finding_id", findingIds.length ? findingIds : ["00000000-0000-4000-8000-000000000000"])
      .order("occurred_at", { ascending: true });
    reject(dispositionError, "loadReviewRegister dispositions failed");
    return {
      pkg,
      run,
      findings,
      dispositions: (dispositionRows ?? []).map((row) => dispositionFromRow(row as never)),
    };
  }

  async deleteReviewFinding(id: string): Promise<void> {
    const { error } = await this.client.from("engineering_review_findings").delete().eq("id", id);
    reject(error, "deleteReviewFinding failed");
  }

  private async emit(
    action: Parameters<typeof createReviewAuditEvent>[0]["action"],
    resourceType: string,
    resourceId: string,
    ownership: { tenantId: string; workspaceId: string; projectId: string },
    actorId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.audit?.record(
        createReviewAuditEvent({
          ...createReviewOwnership(ownership),
          action,
          resourceType,
          resourceId,
          actorId,
          at: new Date().toISOString(),
          metadata,
        }),
      );
    } catch {
      // Match AuditService: audit failure does not fail the business operation.
    }
  }
}

export function createSupabaseEngineeringReviewStore(input: {
  client: ReviewSqlClient;
  kind: ReviewClientKind;
  audit?: ReviewAuditSink;
}): SupabaseEngineeringReviewStore {
  return new SupabaseEngineeringReviewStore(input.client, input.kind, input.audit);
}
