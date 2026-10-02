import { randomUUID } from "node:crypto";
import { ARTIFACT_TEMPLATES, findArtifactTemplate, templatesForExpectedOutput } from "./catalog";
import { buildDocx } from "./docx";
import { defaultArtifactFileName } from "./filename";
import { isGovernedFormula } from "./formulas";
import { buildPptx } from "./pptx";
import { artifactThreadGraph, buildProvenanceManifest, composeDeliverableFromArtifact, hashBytes } from "./provenance";
import { resolveEngineeringArtifactTemplate, type TemplateResolution } from "./resolve-template";
import type { ArtifactBranding } from "./template-policy";
import type {
  ArtifactGenerationResult,
  ArtifactType,
  EngineeringArtifactGenerationRun,
  EngineeringArtifactTemplate,
  GeneratedEngineeringArtifact,
  WorkPlanLike,
} from "./types";
import { assertOfficePackage } from "./validate";
import { buildXlsx } from "./xlsx";
import type { DeliverableComposition } from "../lifecycle-intelligence/deliverable-composition";

const BLOCKED_STATES = new Set([
  "BLOCKED_INFORMATION_MISSING",
  "BLOCKED_INFORMATION_STALE",
  "BLOCKED_INFORMATION_UNACCEPTED",
  "BLOCKED",
]);

export function selectTemplate(plan: WorkPlanLike, artifactType?: ArtifactType, templateCode?: string, templateVersion?: string) {
  const resolved = resolveEngineeringArtifactTemplate({
    plan,
    artifactType,
    requestedCode: templateCode,
    requestedVersion: templateVersion,
  });
  if (resolved.template) return resolved.template;
  if (templateCode) return findArtifactTemplate(templateCode, templateVersion);
  if (artifactType) {
    return (
      ARTIFACT_TEMPLATES.find(
        (row) =>
          row.artifactType === artifactType &&
          row.workTypes.includes(plan.workType) &&
          row.lifecycleStages.includes(plan.lifecycleStage),
      ) ?? ARTIFACT_TEMPLATES.find((row) => row.artifactType === artifactType && row.workTypes.includes(plan.workType))
    );
  }
  const expected = plan.context.expectedOutputs[0]?.outputType;
  return expected ? templatesForExpectedOutput(expected)[0] ?? null : null;
}

export function evaluateReadinessGate(template: EngineeringArtifactTemplate, plan: WorkPlanLike) {
  const blocked = BLOCKED_STATES.has(plan.readiness);
  if (template.readinessPolicy === "REQUIRE_READY" && (blocked || plan.readiness !== "READY")) {
    return {
      allowed: false,
      status: "GENERATION_BLOCKED" as const,
      explanation: `Generation blocked: required information is not READY (${plan.readiness}). Open Missing Information, Request Information, Refresh Context, or create a governed Assumption where permitted. No invented fallback values.`,
      warnings: [] as string[],
    };
  }
  if (template.readinessPolicy === "ALLOW_READY_WITH_CONDITIONS" && blocked) {
    return {
      allowed: false,
      status: "GENERATION_BLOCKED" as const,
      explanation: `Generation blocked: Work Plan is ${plan.readiness}. Conditional templates still refuse blocked information states.`,
      warnings: [] as string[],
    };
  }
  const warnings: string[] = [];
  if (plan.readiness !== "READY") warnings.push(`CONDITIONAL INPUTS PRESENT (${plan.readiness}). ENGINEER REVIEW REQUIRED.`);
  if (plan.context.gaps.length) warnings.push("Missing/unaccepted values remain explicit. No silent defaults.");
  return { allowed: true, status: "GENERATED_DRAFT" as const, explanation: null as string | null, warnings };
}

export async function generateEngineeringArtifact(input: {
  plan: WorkPlanLike;
  template: EngineeringArtifactTemplate;
  requestedBy?: string | null;
  projectCode?: string | null;
  resolution?: TemplateResolution | null;
  branding?: ArtifactBranding | null;
  composition?: DeliverableComposition | null;
  previousArtifactId?: string | null;
}): Promise<ArtifactGenerationResult> {
  const started = Date.now();
  const runId = randomUUID();
  const generatedAt = new Date().toISOString();
  const gate = evaluateReadinessGate(input.template, input.plan);
  const runBase: EngineeringArtifactGenerationRun = {
    id: runId,
    tenantId: input.plan.tenantId,
    workspaceId: input.plan.workspaceId,
    projectId: input.plan.projectId,
    workPlanId: input.plan.id,
    templateCode: input.template.code,
    templateVersion: input.template.version,
    artifactType: input.template.artifactType,
    outputFormat: input.template.outputFormat,
    requestedBy: input.requestedBy ?? null,
    generatedAt,
    workPlanInputFingerprint: input.plan.inputFingerprint,
    artifactId: null,
    status: gate.status,
    warnings: gate.warnings,
    explanation: gate.explanation,
    metrics: {
      sourceRefsConsumed: input.plan.context.information.length,
      requirementsConsumed: input.plan.context.requirements.length,
      durationMs: 0,
      byteSize: 0,
      sheetOrSlideCount: 0,
    },
  };
  if (!gate.allowed) {
    return { ok: false, run: { ...runBase, metrics: { ...runBase.metrics, durationMs: Date.now() - started } }, artifact: null };
  }
  for (const formula of input.template.formulas) {
    if (!isGovernedFormula(formula.formula)) throw new Error("ungoverned_formula");
  }
  const provenance = buildProvenanceManifest({
    plan: input.plan,
    template: input.template,
    generationRunId: runId,
    generatedAt,
    resolution: input.resolution,
    composition: input.composition,
  });
  const projectCode = input.projectCode ?? input.plan.projectId.slice(0, 8);
  const branding = input.branding ?? input.resolution?.branding ?? {};
  let buffer: Buffer;
  let sheetOrSlideCount = 0;
  if (input.template.outputFormat === "XLSX") {
    const built = await buildXlsx({ template: input.template, plan: input.plan, provenance, projectCode, branding, composition: input.composition });
    buffer = built.buffer;
    sheetOrSlideCount = built.sheetCount;
  } else if (input.template.outputFormat === "DOCX") {
    const built = await buildDocx({ template: input.template, plan: input.plan, provenance, projectCode, branding, composition: input.composition });
    buffer = built.buffer;
    sheetOrSlideCount = built.sectionCount;
  } else {
    const built = await buildPptx({ template: input.template, plan: input.plan, provenance, projectCode, branding });
    buffer = built.buffer;
    sheetOrSlideCount = built.slideCount;
  }
  assertOfficePackage(buffer, input.template.outputFormat);
  const artifactId = randomUUID();
  const fileName = defaultArtifactFileName({
    projectCode,
    discipline: input.plan.discipline,
    title: input.template.artifactType.replaceAll("_", " "),
    format: input.template.outputFormat,
  });
  const mimeType =
    input.template.outputFormat === "XLSX"
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : input.template.outputFormat === "DOCX"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  const artifact: GeneratedEngineeringArtifact = {
    id: artifactId,
    tenantId: input.plan.tenantId,
    workspaceId: input.plan.workspaceId,
    projectId: input.plan.projectId,
    generationRunId: runId,
    workPlanId: input.plan.id,
    templateCode: input.template.code,
    templateVersion: input.template.version,
    artifactType: input.template.artifactType,
    outputFormat: input.template.outputFormat,
    fileName,
    mimeType,
    sha256: hashBytes(buffer),
    byteSize: buffer.length,
    status: "READY_FOR_ENGINEER_REVIEW",
    sheetOrSlideCount,
    provenance,
    warnings: runBase.warnings,
    contentBase64: buffer.toString("base64"),
    createdAt: generatedAt,
    supersededById: null,
    lineageKind: "GENERATED_DRAFT",
    originArtifactId: null,
    originGenerationRunId: null,
    originSha256: null,
    returnedBy: null,
    returnedAt: null,
    malwareScanStatus: "NOT_APPLICABLE",
  };
  const run: EngineeringArtifactGenerationRun = {
    ...runBase,
    artifactId,
    status: "READY_FOR_ENGINEER_REVIEW",
    metrics: {
      ...runBase.metrics,
      durationMs: Date.now() - started,
      byteSize: buffer.length,
      sheetOrSlideCount,
    },
  };
  void artifactThreadGraph({
    tenantId: artifact.tenantId,
    workspaceId: artifact.workspaceId,
    projectId: artifact.projectId,
    artifactId: artifact.id,
    workPlanId: input.plan.id,
    plan: input.plan,
    previousArtifactId: input.previousArtifactId,
    mtoSnapshotId: input.composition?.manifest.mtoSnapshotId ?? null,
  });
  void composeDeliverableFromArtifact();
  return { ok: true, run, artifact };
}
