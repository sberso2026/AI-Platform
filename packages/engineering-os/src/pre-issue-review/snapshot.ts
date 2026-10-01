import { createHash } from "node:crypto";
import type { GeneratedEngineeringArtifact } from "../artifact-automation/types";
import type { EngineeringWorkPlan } from "../work-generator/types";
import { PRE_ISSUE_POLICY_CODE, PRE_ISSUE_POLICY_VERSION, type PreIssueReviewSnapshot, type ReviewInputRef } from "./types";

function refs(rows: EngineeringWorkPlan["context"]["requirements"]): ReviewInputRef[] {
  return rows.map((row) => ({
    objectType: row.objectType,
    objectId: row.objectId,
    title: row.title,
    freshness: row.stale ? "STALE" : "CURRENT",
  }));
}

export function selectReviewTarget(artifacts: GeneratedEngineeringArtifact[]) {
  const active = artifacts.filter((row) => row.status !== "SUPERSEDED");
  const returned = active
    .filter((row) => row.lineageKind === "RETURNED_FROM_ENGINEER")
    .sort((a, b) => (b.returnedAt ?? b.createdAt).localeCompare(a.returnedAt ?? a.createdAt));
  if (returned[0]) return { artifact: returned[0], reviewingGeneratedDraft: false };
  const drafts = active
    .filter((row) => row.lineageKind === "GENERATED_DRAFT")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (drafts[0]) return { artifact: drafts[0], reviewingGeneratedDraft: true };
  return null;
}

export function buildReviewSnapshot(input: {
  plan: EngineeringWorkPlan;
  target: GeneratedEngineeringArtifact;
  artifacts: GeneratedEngineeringArtifact[];
}): PreIssueReviewSnapshot {
  return {
    workPlanId: input.plan.id,
    workPlanFingerprint: input.plan.inputFingerprint,
    workType: input.plan.workType,
    lifecycleStage: input.plan.lifecycleStage,
    discipline: input.plan.discipline,
    projectId: input.plan.projectId,
    targetArtifactId: input.target.id,
    targetArtifactHash: input.target.sha256,
    targetLineageKind: input.target.lineageKind,
    targetArtifactType: input.target.artifactType,
    artifactIds: input.artifacts.map((row) => row.id),
    artifactHashes: input.artifacts.map((row) => ({
      id: row.id,
      sha256: row.sha256,
      lineageKind: row.lineageKind,
    })),
    information: input.plan.context.information.map((row) => ({
      objectType: "engineering_information",
      objectId: row.sourceObjectId ?? row.title,
      title: row.title,
      revision: row.revision ?? null,
      authorityOutcome: row.authorityOutcome ?? null,
      freshness: row.freshness ?? null,
    })),
    informationRequirements: input.plan.context.information
      .filter((row) => row.requirementId)
      .map((row) => ({
        objectType: "engineering_information_requirement",
        objectId: row.requirementId!,
        title: row.title,
        revision: row.revision ?? null,
        freshness: row.freshness ?? null,
      })),
    gaps: input.plan.context.gaps.map((row) => ({ kind: row.kind, title: row.title })),
    requirements: refs(input.plan.context.requirements),
    assumptions: refs(input.plan.context.assumptions),
    interfaces: refs(input.plan.context.interfaces),
    decisions: refs(input.plan.context.decisions),
    analyses: refs(input.plan.context.analyses),
    configuration: { fingerprint: input.plan.inputFingerprint, baselineId: null },
    deliverables: input.plan.context.deliverable
      ? [refs([input.plan.context.deliverable])[0]]
      : [],
    policyCode: PRE_ISSUE_POLICY_CODE,
    policyVersion: PRE_ISSUE_POLICY_VERSION,
    binaryContentCopied: false,
  };
}

export function snapshotFingerprint(snapshot: PreIssueReviewSnapshot) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        workPlanId: snapshot.workPlanId,
        workPlanFingerprint: snapshot.workPlanFingerprint,
        targetArtifactId: snapshot.targetArtifactId,
        targetArtifactHash: snapshot.targetArtifactHash,
        information: snapshot.information,
        gaps: snapshot.gaps,
        requirements: snapshot.requirements,
        assumptions: snapshot.assumptions,
        analyses: snapshot.analyses,
        policyVersion: snapshot.policyVersion,
      }),
    )
    .digest("hex");
}
