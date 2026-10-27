import type { ReviewFindingCategory } from "@rtb/types";

export interface PreIssueReviewMemory {
  readonly documents: object;
}

export interface PreIssueReviewPackage {
  id: string;
  status: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
}

export interface PreIssueReviewRun {
  id: string;
  status: string;
  scope: unknown;
}

export interface PreIssueReviewFinding {
  id: string;
  title: string;
  description: string;
  category: ReviewFindingCategory;
  status: string;
  reasoningSummary: string;
  evidence: readonly { documentId: string; span?: string | null }[];
}

export interface PreIssueBoundStore {
  registerKnownDocument(document: {
    documentId: string;
    tenantId: string;
    workspaceId: string;
    projectId: string;
  }): void;
  saveReviewPackage(pkg: PreIssueReviewPackage): Promise<PreIssueReviewPackage>;
  queueReviewRun(run: PreIssueReviewRun): Promise<PreIssueReviewRun>;
  startReviewRun(run: PreIssueReviewRun): Promise<PreIssueReviewRun>;
  persistCandidateFindings(findings: readonly PreIssueReviewFinding[]): Promise<readonly PreIssueReviewFinding[]>;
  saveReviewRun(run: PreIssueReviewRun): Promise<PreIssueReviewRun>;
  recordHumanDisposition(input: {
    findingId: string;
    action: "accept" | "reject" | "modify" | "close" | "reopen" | "assign";
    actorId: string;
    actorKind?: "human";
    reason?: string;
    assignedTo?: string;
  }): Promise<{ finding: PreIssueReviewFinding; disposition: { action: string; actorId: string } }>;
}

export interface PreIssueInferenceCandidate {
  category: ReviewFindingCategory;
  title: string;
  description: string;
  proposedSeverity: "informational" | "minor" | "moderate" | "major" | "critical";
  proposedConfidenceScore?: number;
  evidence: readonly {
    documentId: string;
    span?: string | null;
    tenantId?: string;
    workspaceId?: string;
    projectId?: string;
    revision?: string;
    sourceType?: string;
  }[];
  reasoningSummary: string;
  recommendedAction: string;
}

export interface PreIssueInference {
  proposeFindings(input: {
    documents: readonly unknown[];
    scope: unknown;
  }): Promise<readonly PreIssueInferenceCandidate[]>;
}

export interface PreIssueReviewFindingDraft {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  reviewPackageId: string;
  reviewRunId: string;
  category: ReviewFindingCategory;
  title: string;
  description: string;
  severity: "informational" | "minor" | "moderate" | "major" | "critical";
  confidence: { band?: "low" | "medium" | "high"; score?: number };
  evidence: readonly Record<string, unknown>[];
  reasoningSummary: string;
  recommendedAction: string;
  provenance: Record<string, unknown>;
}

export interface PreIssueReviewBridge {
  createMemory(): PreIssueReviewMemory;
  createStore(memory: PreIssueReviewMemory, tenantId: string, workspaceId: string, userId: string): PreIssueBoundStore;
  rejectingInference(): PreIssueInference;
  isRejectingInference(inference: PreIssueInference): boolean;
  mvpReviewTypes: readonly string[];
  createReviewScope(input: { reviewTypes: readonly string[]; discipline?: string }): unknown;
  createReviewRun(input: {
    id: string;
    pkg: PreIssueReviewPackage;
    scope: unknown;
    rules: readonly { ruleId: string; version: string }[];
  }): PreIssueReviewRun;
  createReviewPackage(input: {
    id: string;
    tenantId: string;
    workspaceId: string;
    projectId: string;
    name: string;
    documents: readonly {
      documentId: string;
      revision: string;
      role: "calculation" | "specification" | "drawing" | "basis" | "other";
      documentNumber: string;
      inclusion: "current";
    }[];
    createdBy: string;
  }): PreIssueReviewPackage;
  createReviewFinding(input: PreIssueReviewFindingDraft): PreIssueReviewFinding;
  verifyFindingEvidence(finding: PreIssueReviewFinding): PreIssueReviewFinding;
  createReviewOwnership(input: { tenantId: string; workspaceId: string; projectId: string }): Record<string, unknown>;
  asUntrustedDocumentText(text: string): unknown;
  runDetectors(input: { ownership: unknown; documents: readonly unknown[]; scope: unknown }): readonly unknown[];
  constructFindingFromDetection(detection: unknown, context: unknown, sequence: number): PreIssueReviewFinding;
  transitionReviewRun(run: PreIssueReviewRun, status: "completed"): PreIssueReviewRun;
}
