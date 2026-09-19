import type { FindingDisposition, ReviewDispositionAction } from "./disposition";
import type { FindingEvidence } from "./evidence";
import type { ReviewFinding } from "./finding";
import type { ReviewPackage } from "./review-package";
import type { ReviewRun } from "./review-run";
import type { ReviewRegister } from "./register";

/**
 * Persistence ports. Interfaces only — no Supabase, HTTP, or SQL client.
 * Implementations live in persistence/ and may be swapped without changing
 * the domain engine.
 */

export type KnownReviewDocument = {
  documentId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export interface ReviewPackageRepository {
  saveReviewPackage(pkg: ReviewPackage): Promise<ReviewPackage>;
  loadReviewPackage(id: string): Promise<ReviewPackage | null>;
  deleteReviewPackage(id: string): Promise<void>;
}

export interface ReviewRunRepository {
  startReviewRun(run: ReviewRun): Promise<ReviewRun>;
  saveReviewRun(run: ReviewRun): Promise<ReviewRun>;
  loadReviewRun(id: string): Promise<ReviewRun | null>;
  deleteReviewRun(id: string): Promise<void>;
}

export interface ReviewFindingRepository {
  persistCandidateFindings(findings: readonly ReviewFinding[]): Promise<readonly ReviewFinding[]>;
  saveReviewFinding(finding: ReviewFinding): Promise<ReviewFinding>;
  loadReviewFinding(id: string): Promise<ReviewFinding | null>;
  attachVerifiedEvidence(findingId: string, evidence: FindingEvidence): Promise<ReviewFinding>;
  recordHumanDisposition(input: {
    findingId: string;
    action: ReviewDispositionAction;
    actorId: string;
    actorKind?: "human" | "system" | "ai";
    reason?: string;
    assignedTo?: string;
    now?: string;
  }): Promise<{ finding: ReviewFinding; disposition: FindingDisposition }>;
  loadDispositionHistory(findingId: string): Promise<readonly FindingDisposition[]>;
  loadReviewRegister(runId: string): Promise<ReviewRegister | null>;
  deleteReviewFinding(id: string): Promise<void>;
}

export interface ReviewDocumentCatalog {
  registerKnownDocument(document: KnownReviewDocument): void;
  getKnownDocument(documentId: string): KnownReviewDocument | undefined;
}

export type EngineeringReviewStore = ReviewPackageRepository &
  ReviewRunRepository &
  ReviewFindingRepository &
  ReviewDocumentCatalog;
