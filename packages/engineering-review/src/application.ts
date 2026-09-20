import { randomUUID } from "node:crypto";
import { InMemoryReviewAuditSink, type ReviewAuditSink } from "./audit";
import {
  assertControlPlaneUnchanged,
  scanUntrustedDocumentsForControlAttempts,
  type ReviewControlPlaneSnapshot,
} from "./control-plane";
import { EngineeringReviewError, failClosed } from "./errors";
import {
  assertReviewFileIngestionAllowed,
  type ReviewFileIngestionPolicy,
} from "./file-ingestion-policy";
import {
  assertReviewScanAllowsExecution,
  scanReviewDocumentBytes,
  establishedMalwareScannerAvailable,
} from "./malware-scan";
import { persistHumanDisposition } from "./adapters/persisted-flow";
import {
  adaptProjectIntelligenceDocuments,
  type CanonicalReviewDocumentInput,
  type ProjectIntelligenceDocumentSnapshot,
} from "./adapters/pi-input";
import { runGroundedReviewPipeline } from "./pipeline";
import type { EngineeringReviewStore } from "./ports";
import type { ReviewPackage } from "./review-package";
import { createReviewPackage, updateReviewPackage } from "./review-package";
import { createReviewRun, transitionReviewRun, type ReviewRun } from "./review-run";
import {
  createReviewScope,
  MVP_REVIEW_TYPES,
  type MvpReviewType,
  type ReviewScope,
} from "./review-scope";
import { ERA1_REVIEW_RULES } from "./rule";
import type { ReviewRegister } from "./register";
import type { ReviewFinding } from "./finding";
import type { FindingDisposition, ReviewDispositionAction } from "./disposition";
import {
  InMemoryReviewProductTelemetry,
  type ReviewProductTelemetry,
} from "./telemetry";
import { AI_ASSISTED_FIRST_PASS_DISCLAIMER, ZERO_FINDING_MESSAGE } from "./version";
import type { ReviewDocumentRole } from "./review-package";

export type ReviewActor = {
  userId: string;
  tenantId: string;
  workspaceId: string;
};

export type AuthorizedProjectSummary = {
  id: string;
  code?: string;
  name: string;
  tenantId: string;
  workspaceId: string;
};

export type AuthorizedDocumentView = {
  documentId: string;
  title?: string;
  documentNumber?: string;
  revision: string;
  documentType?: string;
  mimeType?: string;
  role: ReviewDocumentRole;
  readiness: CanonicalReviewDocumentInput["readiness"];
  reasons: readonly string[];
  selectable: boolean;
};

export interface ReviewProjectDirectory {
  listProjects(actor: ReviewActor): Promise<readonly AuthorizedProjectSummary[]>;
  getProject(actor: ReviewActor, projectId: string): Promise<AuthorizedProjectSummary>;
}

export interface ReviewDocumentDirectory {
  listDocuments(
    actor: ReviewActor,
    projectId: string,
  ): Promise<readonly ProjectIntelligenceDocumentSnapshot[]>;
}

export type TrustedReviewServiceOptions = {
  store: EngineeringReviewStore;
  projects: ReviewProjectDirectory;
  documents: ReviewDocumentDirectory;
  audit?: ReviewAuditSink;
  telemetry?: ReviewProductTelemetry;
  now?: () => string;
  ids?: () => string;
  fileIngestionPolicy?: ReviewFileIngestionPolicy;
};

export type ReviewPackageView = {
  pkg: ReviewPackage;
  documents: readonly AuthorizedDocumentView[];
  excluded: readonly AuthorizedDocumentView[];
  pendingScope?: ReviewScope;
  latestRun?: ReviewRun;
};

export type StartReviewResult = {
  pkg: ReviewPackage;
  run: ReviewRun;
  register: ReviewRegister;
  excluded: readonly AuthorizedDocumentView[];
  attemptedControlEffects: number;
  zeroFinding: boolean;
  zeroFindingMessage?: string;
  disclaimer: typeof AI_ASSISTED_FIRST_PASS_DISCLAIMER;
  limitations: readonly string[];
};

function requireActor(actor: ReviewActor): ReviewActor {
  if (!actor.userId?.trim()) failClosed("unauthenticated", "Authentication is required");
  if (!actor.tenantId?.trim()) failClosed("tenant_required", "Tenant is required");
  if (!actor.workspaceId?.trim()) failClosed("workspace_required", "Workspace is required");
  return {
    userId: actor.userId.trim(),
    tenantId: actor.tenantId.trim(),
    workspaceId: actor.workspaceId.trim(),
  };
}

export class MemoryReviewProjectDirectory implements ReviewProjectDirectory {
  constructor(private readonly projects: readonly AuthorizedProjectSummary[]) {}

  async listProjects(actor: ReviewActor): Promise<readonly AuthorizedProjectSummary[]> {
    const auth = requireActor(actor);
    return this.projects.filter(
      (project) => project.tenantId === auth.tenantId && project.workspaceId === auth.workspaceId,
    );
  }

  async getProject(actor: ReviewActor, projectId: string): Promise<AuthorizedProjectSummary> {
    const auth = requireActor(actor);
    const project = this.projects.find((item) => item.id === projectId);
    if (!project || project.tenantId !== auth.tenantId) {
      failClosed("project_unauthorized", "Project is not authorized for this actor", { projectId });
    }
    if (project.workspaceId !== auth.workspaceId) {
      failClosed("cross_workspace_rejected", "Project belongs to another workspace", { projectId });
    }
    return project;
  }
}

export class MemoryReviewDocumentDirectory implements ReviewDocumentDirectory {
  constructor(private readonly snapshots: readonly ProjectIntelligenceDocumentSnapshot[]) {}

  async listDocuments(
    actor: ReviewActor,
    projectId: string,
  ): Promise<readonly ProjectIntelligenceDocumentSnapshot[]> {
    const auth = requireActor(actor);
    return this.snapshots.filter(
      (doc) =>
        doc.tenantId === auth.tenantId &&
        doc.workspaceId === auth.workspaceId &&
        doc.engineeringProjectId === projectId,
    );
  }
}

export class TrustedReviewService {
  private readonly store: EngineeringReviewStore;
  private readonly projects: ReviewProjectDirectory;
  private readonly documents: ReviewDocumentDirectory;
  private readonly audit: ReviewAuditSink;
  private readonly telemetry: ReviewProductTelemetry;
  private readonly now: () => string;
  private readonly ids: () => string;
  private readonly fileIngestionPolicy: ReviewFileIngestionPolicy;

  constructor(options: TrustedReviewServiceOptions) {
    this.store = options.store;
    this.projects = options.projects;
    this.documents = options.documents;
    this.audit = options.audit ?? new InMemoryReviewAuditSink();
    this.telemetry = options.telemetry ?? new InMemoryReviewProductTelemetry();
    this.now = options.now ?? (() => new Date().toISOString());
    this.ids = options.ids ?? (() => randomUUID());
    this.fileIngestionPolicy = options.fileIngestionPolicy ?? {
      mode: "internal_test",
      malwareScanningAvailable: false,
      allowExternalCustomerUpload: false,
    };
  }

  async listProjects(actor: ReviewActor): Promise<readonly AuthorizedProjectSummary[]> {
    return this.projects.listProjects(requireActor(actor));
  }

  async getProject(actor: ReviewActor, projectId: string): Promise<AuthorizedProjectSummary> {
    return this.projects.getProject(requireActor(actor), projectId);
  }

  async listDocuments(actor: ReviewActor, projectId: string): Promise<readonly AuthorizedDocumentView[]> {
    const auth = requireActor(actor);
    await this.projects.getProject(auth, projectId);
    const snapshots = await this.authorizedSnapshots(auth, projectId);
    return adaptProjectIntelligenceDocuments(snapshots).documents.map(toDocumentView);
  }

  async listPackages(actor: ReviewActor, projectId: string): Promise<readonly ReviewPackage[]> {
    const auth = requireActor(actor);
    await this.projects.getProject(auth, projectId);
    return this.store.listReviewPackages({
      tenantId: auth.tenantId,
      workspaceId: auth.workspaceId,
      projectId,
    });
  }

  async createPackage(
    actor: ReviewActor,
    input: { projectId: string; name: string; documentIds: readonly string[] },
  ): Promise<ReviewPackageView> {
    const auth = requireActor(actor);
    if (input.documentIds.length === 0) {
      failClosed("documents_required", "Select at least one authorized document");
    }
    const project = await this.projects.getProject(auth, input.projectId);
    const snapshots = await this.authorizedSnapshots(auth, project.id);
    const selected = selectSnapshots(snapshots, input.documentIds);
    const report = adaptProjectIntelligenceDocuments(selected);
    for (const doc of report.documents) {
      this.store.registerKnownDocument({
        documentId: doc.documentId,
        tenantId: auth.tenantId,
        workspaceId: auth.workspaceId,
        projectId: project.id,
      });
      await this.store.loadAuthorizedDocument(doc.documentId, {
        tenantId: auth.tenantId,
        workspaceId: auth.workspaceId,
        projectId: project.id,
      });
    }

    const pkg = await this.store.saveReviewPackage(
      createReviewPackage({
        id: this.ids(),
        tenantId: auth.tenantId,
        workspaceId: auth.workspaceId,
        projectId: project.id,
        name: input.name,
        createdBy: auth.userId,
        now: this.now(),
        documents: report.documents.map((doc) => ({
          documentId: doc.documentId,
          revision: doc.revision || "—",
          role: inferRole(doc.documentType),
          documentNumber: doc.documentNumber,
        })),
      }),
    );

    return {
      pkg,
      documents: report.documents.map(toDocumentView),
      excluded: report.blocking.map(toDocumentView),
    };
  }

  async getPackage(actor: ReviewActor, packageId: string): Promise<ReviewPackageView> {
    const auth = requireActor(actor);
    const pkg = await this.requirePackage(auth, packageId);
    await this.projects.getProject(auth, pkg.projectId);
    const snapshots = await this.authorizedSnapshots(auth, pkg.projectId);
    const selected = selectSnapshots(
      snapshots,
      pkg.documents.map((doc) => doc.documentId),
    );
    const report = adaptProjectIntelligenceDocuments(selected);
    const runs = await this.store.listReviewRunsForPackage(pkg.id);
    const latestRun = runs[runs.length - 1];
    const pending = runs.filter((run) => run.status === "queued").at(-1);
    return {
      pkg,
      documents: report.documents.map(toDocumentView),
      excluded: report.blocking.map(toDocumentView),
      pendingScope: pending?.scope,
      latestRun,
    };
  }

  async setScope(
    actor: ReviewActor,
    packageId: string,
    reviewTypes: readonly MvpReviewType[],
  ): Promise<ReviewScope> {
    const auth = requireActor(actor);
    const pkg = await this.requirePackage(auth, packageId);
    const scope = createReviewScope({ reviewTypes });
    const rules = ERA1_REVIEW_RULES.filter((rule) => scope.reviewTypes.includes(rule.reviewType));
    const existing = (await this.store.listReviewRunsForPackage(pkg.id)).find((run) => run.status === "queued");
    if (existing) {
      await this.store.saveReviewRun({ ...existing, scope, rules, updatedAt: this.now() });
      return scope;
    }
    await this.store.queueReviewRun(
      createReviewRun({
        id: this.ids(),
        pkg,
        scope,
        rules,
        now: this.now(),
      }),
    );
    await this.store.saveReviewPackage(updateReviewPackage(pkg, { status: "ready", now: this.now() }));
    return scope;
  }

  async startReview(
    actor: ReviewActor,
    packageId: string,
    reviewTypes?: readonly MvpReviewType[],
  ): Promise<StartReviewResult> {
    const auth = requireActor(actor);
    const pkg = await this.requirePackage(auth, packageId);
    await this.projects.getProject(auth, pkg.projectId);
    const snapshots = await this.authorizedSnapshots(auth, pkg.projectId);
    const selected = selectSnapshots(
      snapshots,
      pkg.documents.map((doc) => doc.documentId),
    );
    assertReviewFileIngestionAllowed(
      this.fileIngestionPolicy,
      selected.map((doc) => {
        const scanned = scanReviewDocumentBytes({
          controlledFixture: doc.controlledFixture,
          adminPreScanned: doc.scanState === "CLEAN" || doc.ingestionSource === "internal_fixture",
          establishedScannerAvailable: establishedMalwareScannerAvailable(),
        });
        const state = doc.scanState ?? scanned.state;
        if (this.fileIngestionPolicy.mode === "pilot") {
          assertReviewScanAllowsExecution(state, doc.engineeringDocumentId);
        }
        return {
          documentId: doc.engineeringDocumentId,
          fileName: doc.fileName,
          mimeType: doc.mimeType,
          controlledFixture: doc.controlledFixture,
          ingestionSource: doc.ingestionSource,
          scanState: state,
        };
      }),
    );
    const report = adaptProjectIntelligenceDocuments(selected);
    const ready = report.ready;
    const excluded = report.blocking.map(toDocumentView);
    if (ready.length === 0) {
      failClosed("review_input_empty", "No machine-readable documents are ready for execution", {
        excluded: excluded.map((item) => ({ documentId: item.documentId, readiness: item.readiness })),
      });
    }

    const queued = (await this.store.listReviewRunsForPackage(pkg.id)).find((run) => run.status === "queued");
    const scope = reviewTypes
      ? createReviewScope({ reviewTypes })
      : queued?.scope ?? createReviewScope({ reviewTypes: [...MVP_REVIEW_TYPES] });
    const rules = ERA1_REVIEW_RULES.filter((rule) => scope.reviewTypes.includes(rule.reviewType));

    const controlBefore: ReviewControlPlaneSnapshot = {
      tenantId: auth.tenantId,
      workspaceId: auth.workspaceId,
      projectId: pkg.projectId,
      actorId: auth.userId,
      reviewTypes: scope.reviewTypes,
      evidenceVerificationRequired: true,
      humanDispositionRequired: true,
      toolsEnabled: false,
    };
    const attempted = scanUntrustedDocumentsForControlAttempts(
      selected.map((doc) => doc.extractedText ?? "").filter(Boolean),
    );

    let run = queued
      ? await this.store.saveReviewRun(
          queued.status === "queued"
            ? { ...queued, scope, rules, inputDocuments: pkg.documents, updatedAt: this.now() }
            : queued,
        )
      : await this.store.startReviewRun(
          createReviewRun({
            id: this.ids(),
            pkg,
            scope,
            rules,
            now: this.now(),
          }),
        );
    if (run.status === "queued") {
      run = await this.store.saveReviewRun(transitionReviewRun(run, "running", this.now()));
    }

    this.telemetry.record({
      name: "review_started",
      at: this.now(),
      actorId: auth.userId,
      reviewPackageId: pkg.id,
      reviewRunId: run.id,
      documentCount: ready.length,
    });
    const startedAt = Date.now();

    try {
      const pipeline = await runGroundedReviewPipeline({
        run,
        pkg,
        documents: ready,
        now: this.now(),
      });

      const controlAfter: ReviewControlPlaneSnapshot = {
        ...controlBefore,
        reviewTypes: pipeline.run.scope.reviewTypes,
      };
      assertControlPlaneUnchanged(controlBefore, controlAfter);
      if (attempted.some((item) => item.attempted === "auto_approve")) {
        if (pipeline.findings.some((finding) => finding.status === "accepted" || finding.status === "closed")) {
          failClosed("control_plane_mutated", "Document instructions cannot auto-approve findings");
        }
      }

      const findings = await this.store.persistCandidateFindings(pipeline.findings);
      for (const finding of findings) {
        for (const evidence of finding.evidence) {
          if (evidence.verificationState === "verified") {
            await this.store.attachVerifiedEvidence(finding.id, evidence);
          }
        }
      }
      const completed = await this.store.saveReviewRun(transitionReviewRun(run, "completed", this.now()));
      await this.store.saveReviewPackage(updateReviewPackage(pkg, { status: "completed", now: this.now() }));
      const register = await this.store.loadReviewRegister(completed.id);
      if (!register) failClosed("register_unavailable", "Review register could not be loaded after persistence");

      this.telemetry.record({
        name: "review_completed",
        at: this.now(),
        actorId: auth.userId,
        reviewPackageId: pkg.id,
        reviewRunId: completed.id,
        durationMs: Date.now() - startedAt,
        documentCount: ready.length,
        findingCount: register.findings.length,
      });

      return {
        pkg,
        run: completed,
        register,
        excluded,
        attemptedControlEffects: attempted.length,
        zeroFinding: register.findings.length === 0,
        zeroFindingMessage: register.findings.length === 0 ? ZERO_FINDING_MESSAGE : undefined,
        disclaimer: AI_ASSISTED_FIRST_PASS_DISCLAIMER,
        limitations: pipeline.limitations,
      };
    } catch (error) {
      const failed = await this.store.saveReviewRun(transitionReviewRun(run, "failed", this.now()));
      this.telemetry.record({
        name: "review_failed",
        at: this.now(),
        actorId: auth.userId,
        reviewPackageId: pkg.id,
        reviewRunId: failed.id,
        durationMs: Date.now() - startedAt,
        errorCode: error instanceof EngineeringReviewError ? error.code : "review_execution_failed",
      });
      throw error;
    }
  }

  async getRegister(actor: ReviewActor, packageId: string): Promise<StartReviewResult | null> {
    const auth = requireActor(actor);
    const pkg = await this.requirePackage(auth, packageId);
    const runs = await this.store.listReviewRunsForPackage(pkg.id);
    const completed = [...runs].reverse().find((run) => run.status === "completed" || run.status === "failed");
    if (!completed) return null;
    const register = await this.store.loadReviewRegister(completed.id);
    if (!register) return null;
    const snapshots = await this.authorizedSnapshots(auth, pkg.projectId);
    const selected = selectSnapshots(
      snapshots,
      pkg.documents.map((doc) => doc.documentId),
    );
    const excluded = adaptProjectIntelligenceDocuments(selected).blocking.map(toDocumentView);
    return {
      pkg,
      run: completed,
      register,
      excluded,
      attemptedControlEffects: 0,
      zeroFinding: register.findings.length === 0 && completed.status === "completed",
      zeroFindingMessage:
        register.findings.length === 0 && completed.status === "completed" ? ZERO_FINDING_MESSAGE : undefined,
      disclaimer: AI_ASSISTED_FIRST_PASS_DISCLAIMER,
      limitations: [
        "ERA-5 default execution is deterministic/local. A live external model is not required.",
        "Drawing visual interpretation, OCR, FEA, and standards interpretation remain out of scope.",
        "Findings are candidates for a human engineer — not certification or approval.",
      ],
    };
  }

  async recordDisposition(
    actor: ReviewActor,
    input: {
      findingId: string;
      action: ReviewDispositionAction;
      reason?: string;
      assignedTo?: string;
    },
  ): Promise<{ finding: ReviewFinding; disposition: FindingDisposition; history: readonly FindingDisposition[] }> {
    const auth = requireActor(actor);
    const finding = await this.store.loadReviewFinding(input.findingId);
    if (!finding) failClosed("finding_not_found", "Review finding not found", { findingId: input.findingId });
    if (finding.tenantId !== auth.tenantId) {
      failClosed("project_unauthorized", "Finding is not authorized for this actor");
    }
    if (finding.workspaceId !== auth.workspaceId) {
      failClosed("cross_workspace_rejected", "Finding belongs to another workspace");
    }
    await this.projects.getProject(auth, finding.projectId);
    const applied = await persistHumanDisposition(this.store, {
      findingId: input.findingId,
      action: input.action,
      actorId: auth.userId,
      actorKind: "human",
      reason: input.reason,
      assignedTo: input.assignedTo,
      now: this.now(),
    });
    const register = await this.store.loadReviewRegister(finding.reviewRunId);
    const firstDispositionAt = register?.dispositions[0]?.at;
    const startedAt = register?.run.startedAt;
    this.telemetry.record({
      name: "finding_disposition",
      at: this.now(),
      actorId: auth.userId,
      reviewPackageId: finding.reviewPackageId,
      reviewRunId: finding.reviewRunId,
      findingId: finding.id,
      action: input.action,
      timeToFirstDispositionMs:
        !firstDispositionAt && startedAt
          ? new Date(this.now()).getTime() - new Date(startedAt).getTime()
          : register?.dispositions.length === 1 && startedAt
            ? new Date(applied.disposition.at).getTime() - new Date(startedAt).getTime()
            : undefined,
    });
    return applied;
  }

  private async authorizedSnapshots(
    actor: ReviewActor,
    projectId: string,
  ): Promise<readonly ProjectIntelligenceDocumentSnapshot[]> {
    const snapshots = await this.documents.listDocuments(actor, projectId);
    return snapshots.filter((doc) => {
      if (doc.tenantId !== actor.tenantId) return false;
      if (doc.workspaceId !== actor.workspaceId) return false;
      if (doc.engineeringProjectId !== projectId) return false;
      return true;
    });
  }

  private async requirePackage(actor: ReviewActor, packageId: string): Promise<ReviewPackage> {
    const pkg = await this.store.loadReviewPackage(packageId);
    if (!pkg) failClosed("package_not_found", "Review package not found", { packageId });
    if (pkg.tenantId !== actor.tenantId) {
      failClosed("project_unauthorized", "Review package is not authorized for this actor", { packageId });
    }
    if (pkg.workspaceId !== actor.workspaceId) {
      failClosed("cross_workspace_rejected", "Review package belongs to another workspace", { packageId });
    }
    return pkg;
  }
}

function selectSnapshots(
  snapshots: readonly ProjectIntelligenceDocumentSnapshot[],
  documentIds: readonly string[],
): ProjectIntelligenceDocumentSnapshot[] {
  const byId = new Map(snapshots.map((doc) => [doc.engineeringDocumentId, doc]));
  return documentIds.map((id) => {
    const found = byId.get(id);
    if (!found) {
      failClosed("document_unauthorized", "Document is not visible in the authorized catalog", {
        documentId: id,
      });
    }
    return found;
  });
}

function inferRole(documentType?: string): ReviewDocumentRole {
  const value = (documentType ?? "").toLowerCase();
  if (value.includes("spec")) return "specification";
  if (value.includes("draw") || value.includes("p&id") || value.includes("pid")) return "drawing";
  if (value.includes("calc")) return "calculation";
  if (value.includes("basis") || value.includes("dbm")) return "basis";
  return "other";
}

function toDocumentView(doc: CanonicalReviewDocumentInput): AuthorizedDocumentView {
  return {
    documentId: doc.documentId,
    title: doc.title,
    documentNumber: doc.documentNumber,
    revision: doc.revision,
    documentType: doc.documentType,
    mimeType: doc.mimeType,
    role: inferRole(doc.documentType),
    readiness: doc.readiness,
    reasons: doc.reasons,
    selectable: true,
  };
}

export const READINESS_LABELS: Record<AuthorizedDocumentView["readiness"], string> = {
  READY_MACHINE_READABLE: "READY",
  OCR_REQUIRED: "OCR REQUIRED",
  UNSUPPORTED: "UNSUPPORTED",
  FAILED_INGESTION: "FAILED",
  NOT_READY: "NOT READY",
};
