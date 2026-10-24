import type { ReviewAuditSink } from "../audit";
import { runDeterministicReview } from "../engine";
import type { ReviewFinding } from "../finding";
import { createReviewOwnership } from "../ownership";
import type { EngineeringReviewStore } from "../ports";
import type { ReviewRegister } from "../register";
import { createReviewPackage, type ReviewPackage } from "../review-package";
import { createReviewRun, transitionReviewRun, type ReviewRun } from "../review-run";
import { createReviewScope, type ReviewScope } from "../review-scope";
import { ERA1_REVIEW_RULES } from "../rule";
import {
  adaptProjectIntelligenceDocuments,
  assertReviewInputsReady,
  type PiReviewInputReport,
  type ProjectIntelligenceDocumentSnapshot,
} from "./pi-input";
import type { FindingDisposition } from "../disposition";

export type PersistedDeterministicReviewInput = {
  packageId: string;
  runId: string;
  name: string;
  createdBy: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  documents: readonly ProjectIntelligenceDocumentSnapshot[];
  scope?: ReviewScope;
  now?: string;
};

export type PersistedDeterministicReviewResult = {
  report: PiReviewInputReport;
  pkg: ReviewPackage;
  run: ReviewRun;
  findings: readonly ReviewFinding[];
  register: ReviewRegister;
};

/**
 * End-to-end persistence flow without live AI or HTTP:
 * PI snapshot → canonical input → package → run → detectors → persist → register.
 */
export async function persistDeterministicReview(
  store: EngineeringReviewStore,
  _audit: ReviewAuditSink | undefined,
  input: PersistedDeterministicReviewInput,
): Promise<PersistedDeterministicReviewResult> {
  const ownership = createReviewOwnership(input);
  const report = adaptProjectIntelligenceDocuments(
    input.documents.map((doc) => ({
      ...doc,
      tenantId: doc.tenantId || input.tenantId,
      workspaceId: doc.workspaceId || input.workspaceId,
      engineeringProjectId: doc.engineeringProjectId || input.projectId,
    })),
  );
  const fixtures = assertReviewInputsReady(report);

  for (const fixture of fixtures) {
    store.registerKnownDocument({
      documentId: fixture.documentId,
      tenantId: fixture.tenantId,
      workspaceId: fixture.workspaceId,
      projectId: fixture.projectId,
    });
  }

  const pkg = await store.saveReviewPackage(
    createReviewPackage({
      id: input.packageId,
      tenantId: ownership.tenantId,
      workspaceId: ownership.workspaceId,
      projectId: ownership.projectId,
      name: input.name,
      createdBy: input.createdBy,
      now: input.now,
      documents: fixtures.map((doc) => ({
        documentId: doc.documentId,
        revision: doc.revision,
        role: doc.role,
        documentNumber: doc.documentNumber,
        inclusion: doc.inclusion,
      })),
    }),
  );

  const scope =
    input.scope ??
    createReviewScope({
      reviewTypes: ERA1_REVIEW_RULES.map((rule) => rule.reviewType),
    });
  const queued = createReviewRun({
    id: input.runId,
    pkg,
    scope,
    rules: ERA1_REVIEW_RULES.filter((rule) => scope.reviewTypes.includes(rule.reviewType)),
    now: input.now,
  });
  const run = await store.startReviewRun(queued);

  const result = runDeterministicReview({ run, pkg, documents: fixtures, now: input.now });
  const findings = await store.persistCandidateFindings(result.findings);
  for (const finding of findings) {
    for (const evidence of finding.evidence) {
      if (evidence.verificationState === "verified") {
        await store.attachVerifiedEvidence(finding.id, evidence);
      }
    }
  }

  const completed = await store.saveReviewRun(transitionReviewRun(run, "completed", input.now));
  const register = await store.loadReviewRegister(completed.id);
  if (!register) {
    throw new Error("Review register could not be loaded after persistence");
  }

  return { report, pkg, run: completed, findings: register.findings, register };
}

export async function persistHumanDisposition(
  store: EngineeringReviewStore,
  input: {
    findingId: string;
    action: FindingDisposition["action"];
    actorId: string;
    actorKind?: "human" | "system" | "ai";
    reason?: string;
    assignedTo?: string;
    now?: string;
  },
): Promise<{ finding: ReviewFinding; disposition: FindingDisposition; history: readonly FindingDisposition[] }> {
  const applied = await store.recordHumanDisposition(input);
  const history = await store.loadDispositionHistory(input.findingId);
  return { ...applied, history };
}
