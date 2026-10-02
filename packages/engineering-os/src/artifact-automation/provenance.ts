import { createHash } from "node:crypto";
import type { ArtifactProvenanceManifest, EngineeringArtifactTemplate, WorkPlanLike } from "./types";
import type { TemplateResolution } from "./resolve-template";
import type { DeliverableComposition } from "../lifecycle-intelligence/deliverable-composition";
import { deliverableThreadLinks } from "../lifecycle-intelligence/deliverable-composition";

export function buildProvenanceManifest(input: {
  plan: WorkPlanLike;
  template: EngineeringArtifactTemplate;
  generationRunId: string;
  generatedAt: string;
  resolution?: TemplateResolution | null;
  composition?: DeliverableComposition | null;
}): ArtifactProvenanceManifest {
  return {
    projectId: input.plan.projectId,
    workspaceId: input.plan.workspaceId,
    workPlanId: input.plan.id,
    workTemplateCode: input.plan.templateCode,
    workTemplateVersion: input.plan.templateVersion,
    artifactTemplateCode: input.template.code,
    artifactTemplateVersion: input.template.version,
    templateSourceClass: input.resolution?.sourceClass ?? input.template.sourceClass ?? "EOS_DEFAULT",
    templateResolutionReason: input.resolution?.reason ?? null,
    templateFallbackUsed: input.resolution?.fallbackUsed ?? false,
    templatePolicyId: input.resolution?.policyId ?? null,
    packagedAssetKey: input.resolution?.packagedAssetKey ?? input.template.code,
    calculationDefinitionCode: input.resolution?.calculationDefinition?.code ?? null,
    calculationDefinitionVersion: input.resolution?.calculationDefinition?.version ?? null,
    calculationDefinitionCertification: input.resolution?.calculationDefinition?.certification ?? (input.template.certification === "EXAMPLE_ONLY" ? "EXAMPLE_ONLY" : input.template.certification),
    lifecycleStage: input.plan.lifecycleStage,
    discipline: input.plan.discipline,
    systemId: input.plan.systemId,
    assetId: input.plan.assetId,
    information: input.plan.context.information.map((row) => ({
      title: row.title,
      revision: row.revision ?? null,
      purpose: row.purpose ?? null,
    })),
    requirements: input.plan.context.requirements.map((row) => row.title),
    assumptions: input.plan.context.assumptions.map((row) => row.title),
    interfaces: input.plan.context.interfaces.map((row) => row.title),
    decisions: input.plan.context.decisions.map((row) => row.title),
    analyses: input.plan.context.analyses.map((row) => row.title),
    deliverable: input.plan.context.deliverable?.title ?? null,
    inputFingerprint: input.plan.inputFingerprint,
    generatedAt: input.generatedAt,
    generationRunId: input.generationRunId,
    draft: true,
    engineeringApproved: false,
    exampleOnly: input.template.certification === "EXAMPLE_ONLY",
    generatorVersion: input.composition?.generatorVersion ?? null,
    compositionFingerprint: input.composition?.compositionFingerprint ?? null,
    sourceManifest: input.composition?.manifest ? { ...input.composition.manifest } : null,
    mtoSnapshotId: input.composition?.manifest.mtoSnapshotId ?? null,
    mtoRevision: input.composition?.manifest.mtoRevision ?? null,
    mtoStatus: input.composition?.manifest.mtoStatus ?? null,
    mtoFingerprint: input.composition?.manifest.mtoFingerprint ?? null,
    mtoVerificationState: input.composition?.manifest.mtoVerificationState ?? null,
    costStatus: input.composition?.costStatus ?? null,
    carbonStatus: input.composition?.carbonStatus ?? null,
    evidenceClasses: input.composition?.evidence.map((row) => row.evidenceClass) ?? undefined,
    generationAuthority: input.composition?.authority ?? "READY_FOR_ENGINEER_REVIEW",
  };
}

export function hashBytes(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export function artifactThreadGraph(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  artifactId: string;
  workPlanId: string;
  plan: WorkPlanLike;
  previousArtifactId?: string | null;
  mtoSnapshotId?: string | null;
}) {
  const node = (objectType: string, objectId: string) => ({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    objectType,
    objectId,
  });
  const link = (relationship: string, fromType: string, fromId: string, toType: string, toId: string) => ({
    relationship,
    fromType,
    fromId,
    toType,
    toId,
    governed: true,
  });
  const nodes = [
    node("engineering_generated_artifact", input.artifactId),
    node("engineering_work_plan", input.workPlanId),
  ];
  const links = [
    link("USES", "engineering_work_plan", input.workPlanId, "engineering_generated_artifact", input.artifactId),
    ...deliverableThreadLinks({
      workPlanId: input.workPlanId,
      artifactId: input.artifactId,
      previousArtifactId: input.previousArtifactId,
      mtoSnapshotId: input.mtoSnapshotId,
      informationIds: input.plan.context.information.map((row) => row.sourceObjectId ?? row.title),
      requirementIds: input.plan.context.requirements.map((row) => row.objectId),
    }).map((row) => link(row.relationship, row.fromType, row.fromId, row.toType, row.toId)),
  ];
  for (const row of input.plan.context.information) {
    const id = row.sourceObjectId ?? row.title;
    nodes.push(node("engineering_information", id));
    links.push(link("USES", "engineering_generated_artifact", input.artifactId, "engineering_information", id));
  }
  for (const row of input.plan.context.requirements) {
    nodes.push(node(row.objectType || "requirement", row.objectId));
    links.push(link("DEPENDS_ON", "engineering_generated_artifact", input.artifactId, row.objectType || "requirement", row.objectId));
  }
  return { nodes, links };
}

export function composeDeliverableFromArtifact() {
  return { bound: false, maturityChanged: false, reviewComplete: false, approved: false, generatedDraftOnly: true };
}

export const ARTIFACT_DOCUMENT_BOUNDARY = {
  generationCreatesCanonicalDocument: false,
  generationIssuesDocument: false,
  generationApprovesDocument: false,
  newDmsCreated: false,
  reuseExistingDocumentOnPublication: true,
};
