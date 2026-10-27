import {
  MemoryEngineeringReviewStore,
  createSharedReviewMemory,
  type SharedReviewMemory,
} from "./persistence/memory-store";
import { RejectingInferenceProvider, type ReviewInferenceProvider } from "./ai-boundary";
import { createReviewFinding, verifyFindingEvidence, type ReviewFinding } from "./finding";
import { createReviewPackage, type ReviewPackage } from "./review-package";
import { createReviewRun, transitionReviewRun, type ReviewRun } from "./review-run";
import { MVP_REVIEW_TYPES, createReviewScope } from "./review-scope";
import { createReviewOwnership } from "./ownership";
import { asUntrustedDocumentText } from "./trust-boundary";
import { runDetectors } from "./detectors";
import { constructFindingFromDetection } from "./engine";

export function createPreIssueReviewBridge() {
  return {
    createMemory() {
      return createSharedReviewMemory();
    },
    createStore(memory: { documents: object }, tenantId: string, workspaceId: string, userId: string) {
      const store = new MemoryEngineeringReviewStore(
        {
          userId,
          tenantIds: [tenantId],
          workspaceIds: [workspaceId],
          permissions: [{ resource: "engineering", action: "execute" }],
        },
        memory as SharedReviewMemory,
      );
      return {
        registerKnownDocument(document: {
          documentId: string;
          tenantId: string;
          workspaceId: string;
          projectId: string;
        }) {
          store.registerKnownDocument(document);
        },
        saveReviewPackage(pkg: ReviewPackage) {
          return store.saveReviewPackage(pkg);
        },
        queueReviewRun(run: ReviewRun) {
          return store.queueReviewRun(run);
        },
        startReviewRun(run: ReviewRun) {
          return store.startReviewRun(run);
        },
        persistCandidateFindings(findings: readonly ReviewFinding[]) {
          return store.persistCandidateFindings(findings);
        },
        saveReviewRun(run: ReviewRun) {
          return store.saveReviewRun(run);
        },
        recordHumanDisposition(input: {
          findingId: string;
          action: "accept" | "reject" | "modify" | "close" | "reopen" | "assign";
          actorId: string;
          actorKind?: "human";
          reason?: string;
          assignedTo?: string;
        }) {
          return store.recordHumanDisposition(input);
        },
      };
    },
    rejectingInference(): ReviewInferenceProvider {
      return new RejectingInferenceProvider();
    },
    isRejectingInference(inference: ReviewInferenceProvider) {
      return inference instanceof RejectingInferenceProvider;
    },
    mvpReviewTypes: MVP_REVIEW_TYPES,
    createReviewScope(input: { reviewTypes: readonly string[]; discipline?: string }) {
      return createReviewScope(input as never);
    },
    createReviewRun(input: {
      id: string;
      pkg: ReviewPackage;
      scope: unknown;
      rules: readonly { ruleId: string; version: string }[];
    }) {
      return createReviewRun(input as never);
    },
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
    }) {
      return createReviewPackage(input);
    },
    createReviewFinding(input: unknown) {
      return createReviewFinding(input as never);
    },
    verifyFindingEvidence(finding: ReviewFinding) {
      return verifyFindingEvidence(finding);
    },
    createReviewOwnership(input: { tenantId: string; workspaceId: string; projectId: string }) {
      return createReviewOwnership(input);
    },
    asUntrustedDocumentText,
    runDetectors(input: { ownership: unknown; documents: readonly unknown[]; scope: unknown }) {
      return runDetectors(input as never);
    },
    constructFindingFromDetection(detection: unknown, context: unknown, sequence: number) {
      return constructFindingFromDetection(detection as never, context as never, sequence);
    },
    transitionReviewRun(run: ReviewRun, status: "completed") {
      return transitionReviewRun(run, status);
    },
  };
}
