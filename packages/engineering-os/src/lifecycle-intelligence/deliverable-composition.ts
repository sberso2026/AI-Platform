/**
 * EOS-A15A-V4 — Governed engineering deliverable composition.
 *
 * Evidence-backed document assembly over existing Work Plans, Engineering
 * Information, Requirements, Assumptions, Decisions, Interfaces, MTO V3,
 * artifact automation, Pre-Issue Review, and Digital Thread.
 * Not a Deliverable Intelligence domain.
 */

import { createHash } from "node:crypto";
import type { WorkReference } from "../work-generator/types";
import type { ArtifactType, WorkPlanLike } from "../artifact-automation/types";
import { snapshotFromPersisted, type PersistedMtoSnapshot } from "./quantity-mto-persist";
import {
  acceptGovernedQuantity,
  compareMtoSnapshots,
  composeMtoChangeImpacts,
  constructabilityEvidenceFromMto,
  type MtoItemDelta,
  type MtoSnapshot,
  type QuantityItem,
} from "./quantity-mto";
import { valuePolicyForProject, type ProjectValuePolicy, type ValueApplicability } from "./cross-lifecycle-value";
import { mtoInputRefs, mtoSourceCalculationId, type CompositionBindingKind, type CompositionCalculationRef } from "./composition-evidence";

export const A15A_V4_GENERATOR_VERSION = "EOS-A15A-V4";

export const A15A_V4_FEATURE_FREEZE = {
  newTopLevelDomain: false,
  newDeliverableIntelligenceDomain: false,
  newMtoIntelligenceDomain: false,
  newCostIntelligenceDomain: false,
  newCarbonIntelligenceDomain: false,
  newGraphStore: false,
  newEventBus: false,
  newDms: false,
  newConnectorFramework: false,
  newSolver: false,
  scannerV2: false,
} as const;

export const DELIVERABLE_HUMAN_AUTHORITY = {
  generationCannotVerifyMto: true,
  generationCannotAcceptAssumption: true,
  generationCannotMakeDecision: true,
  generationCannotApproveRequirement: true,
  generationCannotConfirmChangeImpact: true,
  generationCannotApproveDeliverable: true,
  generationCannotIssueIfc: true,
  generationCannotCertify: true,
} as const;

export const EVIDENCE_CLASSES = [
  "GOVERNED_FACT",
  "DETERMINISTIC_RESULT",
  "ENGINEER_ENTERED_ASSUMPTION",
  "AI_DRAFT_NARRATIVE",
  "MISSING_INFORMATION",
  "NOT_APPLICABLE",
] as const;
export type EvidenceClass = (typeof EVIDENCE_CLASSES)[number];

export const SOURCE_READINESS_STATES = ["READY", "CONDITIONAL", "MISSING", "NOT_APPLICABLE"] as const;
export type SourceReadinessState = (typeof SOURCE_READINESS_STATES)[number];

export const GENERATION_AUTHORITY_STATES = ["GENERATED_DRAFT", "READY_FOR_ENGINEER_REVIEW"] as const;
export type GenerationAuthorityState = (typeof GENERATION_AUTHORITY_STATES)[number];

export const MISSING_INFORMATION_STATES = [
  "INFORMATION_REQUIRED",
  "SOURCE_NOT_AVAILABLE",
  "QUANTITY_NOT_AVAILABLE",
  "COST_NOT_CALCULATED",
  "CARBON_NOT_CALCULATED",
  "ENGINEER_INPUT_REQUIRED",
  "ENGINEER_CONCLUSION_REQUIRED",
] as const;
export type MissingInformationState = (typeof MISSING_INFORMATION_STATES)[number];

export const REQUIREMENT_EVIDENCE_STATES = ["EVIDENCE_PRESENT", "EVIDENCE_MISSING", "REVIEW_REQUIRED"] as const;
export type RequirementEvidenceState = (typeof REQUIREMENT_EVIDENCE_STATES)[number];

export const DESIGN_REPORT_SECTIONS = [
  "Document Control",
  "Purpose",
  "Scope",
  "Design Basis",
  "Applicable Requirements",
  "Governing Information",
  "Design Assumptions",
  "System / Asset Context",
  "Design Description",
  "Engineering Quantities / MTO Summary",
  "Interfaces",
  "Options / Decisions",
  "Constructability Considerations",
  "Cost Basis",
  "Carbon Basis",
  "Risks / Limitations",
  "Outstanding Information",
  "Conclusions / Recommendations",
  "References",
  "Appendices",
] as const;

export const TECHNICAL_NOTE_SECTIONS = [
  "Document Control",
  "Purpose",
  "Issue / Context",
  "Governing Evidence",
  "Decision Status",
  "Conclusions",
  "Outstanding Information",
  "References",
] as const;

export type SourceReadinessPanel = {
  governingInformation: SourceReadinessState;
  requirements: SourceReadinessState;
  assumptions: SourceReadinessState;
  decisions: SourceReadinessState;
  interfaces: SourceReadinessState;
  mto: SourceReadinessState;
  costBasis: SourceReadinessState;
  carbonBasis: SourceReadinessState;
};

export type DeliverableSourceManifest = {
  workPlanId: string;
  workPlanFingerprint: string;
  projectId: string;
  systemId: string | null;
  discipline: string | null;
  lifecycle: string;
  engineeringInformation: Array<{ title: string; revision: string | null }>;
  requirements: Array<{ id: string; title: string; type?: string | null; source?: string | null; status?: string | null }>;
  assumptions: Array<{ id: string; title: string; status?: string | null; owner?: string | null; rationale?: string | null }>;
  decisions: Array<{ id: string; title: string; status?: string | null; rationale?: string | null }>;
  interfaces: Array<{ id: string; title: string; status?: string | null }>;
  mtoSnapshotId: string | null;
  mtoRevision: string | null;
  mtoStatus: string | null;
  mtoFingerprint: string | null;
  mtoSourceRevisions: string[];
  mtoVerificationState: string | null;
  mtoSourceType?: "MTO_SNAPSHOT" | null;
  mtoScope?: string | null;
  mtoProducingWorkPlanId?: string | null;
  mtoBindingKind?: "EXPLICIT" | "PLAN_LOCAL" | "NONE" | null;
  mtoSourceCalculationId?: string | null;
  mtoSourceInputRefs?: string[];
  calculationId?: string | null;
  calculationInputFingerprint?: string | null;
  calculationEngine?: string | null;
  calculationMethod?: string | null;
  calculationReviewState?: string | null;
  templateCode: string;
  templateVersion: string;
  generatedAt: string;
  generatorVersion: typeof A15A_V4_GENERATOR_VERSION;
};

export type QuantitySummaryRow = {
  category: string;
  unit: string | null;
  quantity: number | null;
  verified: boolean;
  origin: string;
  evidenceClass: EvidenceClass;
  statusLabel: string;
  itemCodes: string[];
};

export type ComposedSection = {
  title: string;
  applicable: boolean;
  evidenceClass: EvidenceClass;
  missingState: MissingInformationState | null;
  paragraphs: string[];
  rows: string[][];
};

export type DeliverableComposition = {
  generatorVersion: typeof A15A_V4_GENERATOR_VERSION;
  artifactType: ArtifactType;
  authority: GenerationAuthorityState;
  engineeringApproved: false;
  manifest: DeliverableSourceManifest;
  compositionFingerprint: string;
  readiness: SourceReadinessPanel;
  evidence: Array<{ statement: string; evidenceClass: EvidenceClass }>;
  sections: ComposedSection[];
  quantityRows: QuantitySummaryRow[];
  deltas: MtoItemDelta[];
  costStatus: "DERIVED" | "COST_NOT_CALCULATED" | "NOT_APPLICABLE";
  carbonStatus: "DERIVED" | "CARBON_NOT_CALCULATED" | "NOT_APPLICABLE";
  constructabilityScore: null;
  v2Snapshot: MtoSnapshot | null;
  changeImpacts: ReturnType<typeof composeMtoChangeImpacts>;
  narrativePolicy: {
    aiDraftCannotBecomeGovernedFact: true;
    noAdequacyClaims: true;
    noComplianceClaims: true;
    noCostAcceptabilityClaims: true;
    noConstructabilityScore: true;
  };
};

function hashStable(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function refStatus(row: WorkReference) {
  return row.stale ? "STALE" : /open|pending|unsupported|unaccepted|missing/i.test(row.whyIncluded) ? "OPEN" : "RECORDED";
}

function requirementEvidence(row: WorkReference): RequirementEvidenceState {
  if (row.stale || /missing|without evidence|unsupported/i.test(row.whyIncluded)) return "EVIDENCE_MISSING";
  if (/review|candidate|unverified/i.test(row.whyIncluded)) return "REVIEW_REQUIRED";
  return row.whyIncluded ? "EVIDENCE_PRESENT" : "EVIDENCE_MISSING";
}

function isVerifiedItem(item: QuantityItem) {
  return item.verificationStatus === "ENGINEER_ACCEPTED"
    || item.verificationStatus === "DETERMINISTICALLY_VERIFIED"
    || String(item.verificationStatus) === "VERIFIED";
}

function itemEvidenceClass(item: QuantityItem): EvidenceClass {
  if (item.quantityOrigin === "MISSING" || item.quantity == null) return "MISSING_INFORMATION";
  if (item.quantityOrigin === "ENGINEER_ENTERED_ASSUMPTION") return "ENGINEER_ENTERED_ASSUMPTION";
  if (!isVerifiedItem(item)) return "MISSING_INFORMATION";
  if (item.quantityOrigin === "DETERMINISTICALLY_DERIVED") return "DETERMINISTIC_RESULT";
  return "GOVERNED_FACT";
}

function itemStatusLabel(item: QuantityItem) {
  if (item.quantityOrigin === "MISSING" || !acceptGovernedQuantity(item).ok) return "QUANTITY_NOT_AVAILABLE";
  if (item.quantityOrigin === "ENGINEER_ENTERED_ASSUMPTION") return "ENGINEER_ENTERED_ASSUMPTION";
  if (!isVerifiedItem(item)) return `UNVERIFIED (${item.quantityOrigin})`;
  return item.verificationStatus;
}

function readinessFromCount(present: number, open: number, applicable = true): SourceReadinessState {
  if (!applicable) return "NOT_APPLICABLE";
  if (!present) return "MISSING";
  if (open > 0) return "CONDITIONAL";
  return "READY";
}

function applicability(plan: WorkPlanLike, kind: "COST" | "CARBON" | "CONSTRUCTABILITY", policy: ProjectValuePolicy): ValueApplicability {
  const row = plan.context.evaluationRequirements?.find((item) => item.kind === kind);
  if (row) return row.applicability;
  if (kind === "COST") return policy.cost;
  if (kind === "CARBON") return policy.carbon;
  return policy.constructability;
}

export function summarizePresentQuantities(items: QuantityItem[]): QuantitySummaryRow[] {
  const groups = new Map<string, QuantitySummaryRow>();
  for (const item of items) {
    const key = `${item.category}\u0000${item.unit ?? ""}`;
    const existing = groups.get(key);
    const accepted = acceptGovernedQuantity(item);
    const qty = accepted.ok ? accepted.quantity : null;
    if (!existing) {
      groups.set(key, {
        category: item.category,
        unit: item.unit,
        quantity: qty,
        verified: isVerifiedItem(item) && accepted.ok,
        origin: item.quantityOrigin,
        evidenceClass: itemEvidenceClass(item),
        statusLabel: itemStatusLabel(item),
        itemCodes: [item.itemCode],
      });
      continue;
    }
    existing.itemCodes.push(item.itemCode);
    if (qty != null && existing.quantity != null && item.unit === existing.unit) existing.quantity += qty;
    else if (qty != null && existing.quantity == null) existing.quantity = qty;
    if (!isVerifiedItem(item) || !accepted.ok) {
      existing.verified = false;
      if (existing.evidenceClass === "GOVERNED_FACT" || existing.evidenceClass === "DETERMINISTIC_RESULT") {
        existing.evidenceClass = itemEvidenceClass(item);
        existing.statusLabel = itemStatusLabel(item);
      }
    }
  }
  return [...groups.values()].sort((a, b) => a.category.localeCompare(b.category));
}

function deterministicDeltaNarrative(deltas: MtoItemDelta[], priorRev: string, currentRev: string) {
  const changed = deltas.filter((row) => row.kind !== "UNCHANGED" && row.delta != null);
  const lines: Array<{ statement: string; evidenceClass: EvidenceClass }> = [];
  for (const row of changed.slice(0, 8)) {
    const sign = row.delta! > 0 ? "more" : "less";
    lines.push({
      statement: `Rev ${currentRev} contains ${Math.abs(row.delta!)} ${row.unit ?? ""} ${sign} ${row.category} (${row.itemCode}) than Rev ${priorRev}.`,
      evidenceClass: "DETERMINISTIC_RESULT",
    });
  }
  if (changed.length > 8) {
    lines.push({
      statement: `${changed.length - 8} additional deterministic quantity deltas are recorded in the governed MTO compare. Full item listing is not embedded in this narrative.`,
      evidenceClass: "DETERMINISTIC_RESULT",
    });
  }
  return lines;
}

function section(title: string, evidenceClass: EvidenceClass, paragraphs: string[], extra?: Partial<ComposedSection>): ComposedSection {
  return {
    title,
    applicable: extra?.applicable ?? true,
    evidenceClass,
    missingState: extra?.missingState ?? null,
    paragraphs,
    rows: extra?.rows ?? [],
  };
}

export function composeDeliverableSource(input: {
  plan: WorkPlanLike;
  templateCode: string;
  templateVersion: string;
  artifactType: ArtifactType;
  generatedAt?: string;
  snapshot?: PersistedMtoSnapshot | null;
  previousSnapshot?: PersistedMtoSnapshot | null;
  bindingKind?: CompositionBindingKind;
  calculation?: CompositionCalculationRef | null;
}): DeliverableComposition {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const policy = valuePolicyForProject(input.plan.projectId);
  const snapshot = input.snapshot ?? null;
  const previous = input.previousSnapshot ?? null;
  const v2 = snapshot ? snapshotFromPersisted(snapshot) : null;
  const priorV2 = previous ? snapshotFromPersisted(previous) : null;
  const items = snapshot?.items ?? [];
  const carbonApp = applicability(input.plan, "CARBON", policy);
  const costApp = applicability(input.plan, "COST", policy);
  const constructApp = applicability(input.plan, "CONSTRUCTABILITY", policy);

  const infoOpen = input.plan.context.information.filter((row) => /stale|missing|unaccepted/i.test(`${row.freshness ?? ""} ${row.authorityOutcome ?? ""}`)).length;
  const reqOpen = input.plan.context.requirements.filter((row) => requirementEvidence(row) !== "EVIDENCE_PRESENT").length;
  const assumptionOpen = input.plan.context.assumptions.filter((row) => row.stale || /open|pending|unsupported/i.test(row.whyIncluded)).length;
  const decisionOpen = input.plan.context.decisions.filter((row) => /open|pending|required/i.test(row.whyIncluded)).length;
  const interfaceOpen = input.plan.context.interfaces.filter((row) => row.stale || /open|unaccepted/i.test(row.whyIncluded)).length;
  const unverified = items.filter((row) => !isVerifiedItem(row)).length;

  const readiness: SourceReadinessPanel = {
    governingInformation: readinessFromCount(input.plan.context.information.length, infoOpen + input.plan.context.gaps.length),
    requirements: readinessFromCount(input.plan.context.requirements.length, reqOpen),
    assumptions: readinessFromCount(input.plan.context.assumptions.length, assumptionOpen),
    decisions: readinessFromCount(input.plan.context.decisions.length, decisionOpen),
    interfaces: readinessFromCount(input.plan.context.interfaces.length, interfaceOpen),
    mto: snapshot
      ? snapshot.status === "VERIFIED" && unverified === 0
        ? "READY"
        : "CONDITIONAL"
      : "MISSING",
    costBasis: costApp === "NOT_APPLICABLE" ? "NOT_APPLICABLE" : "MISSING",
    carbonBasis: carbonApp === "NOT_APPLICABLE" ? "NOT_APPLICABLE" : "MISSING",
  };

  const manifest: DeliverableSourceManifest = {
    workPlanId: input.plan.id,
    workPlanFingerprint: input.plan.inputFingerprint,
    projectId: input.plan.projectId,
    systemId: input.plan.systemId,
    discipline: input.plan.discipline,
    lifecycle: input.plan.lifecycleStage,
    engineeringInformation: input.plan.context.information.map((row) => ({ title: row.title, revision: row.revision ?? null })),
    requirements: input.plan.context.requirements.map((row) => ({
      id: row.objectId,
      title: row.title,
      type: row.objectType,
      source: row.whyIncluded,
      status: requirementEvidence(row),
    })),
    assumptions: input.plan.context.assumptions.map((row) => ({
      id: row.objectId,
      title: row.title,
      status: refStatus(row),
      rationale: row.whyIncluded,
    })),
    decisions: input.plan.context.decisions.map((row) => ({
      id: row.objectId,
      title: row.title,
      status: refStatus(row),
      rationale: row.whyIncluded,
    })),
    interfaces: input.plan.context.interfaces.map((row) => ({
      id: row.objectId,
      title: row.title,
      status: refStatus(row),
    })),
    mtoSnapshotId: snapshot?.id ?? null,
    mtoRevision: snapshot?.revision ?? null,
    mtoStatus: snapshot?.status ?? null,
    mtoFingerprint: snapshot?.snapshotFingerprint ?? null,
    mtoSourceRevisions: snapshot?.sourceRevisionSet ?? [],
    mtoVerificationState: snapshot?.verificationState ?? snapshot?.status ?? null,
    mtoSourceType: snapshot ? "MTO_SNAPSHOT" : null,
    mtoScope: snapshot?.disciplineScope ?? null,
    mtoProducingWorkPlanId: snapshot?.workPlanId ?? null,
    mtoBindingKind: input.bindingKind ?? (snapshot ? "PLAN_LOCAL" : "NONE"),
    mtoSourceCalculationId: mtoSourceCalculationId(snapshot),
    mtoSourceInputRefs: mtoInputRefs(snapshot),
    calculationId: input.calculation?.id ?? null,
    calculationInputFingerprint: input.calculation?.inputFingerprint ?? null,
    calculationEngine: input.calculation?.engineId ?? null,
    calculationMethod: input.calculation?.method ?? null,
    calculationReviewState: input.calculation?.reviewStatus ?? null,
    templateCode: input.templateCode,
    templateVersion: input.templateVersion,
    generatedAt,
    generatorVersion: A15A_V4_GENERATOR_VERSION,
  };

  const compositionFingerprint = hashStable({
    generatorVersion: A15A_V4_GENERATOR_VERSION,
    templateCode: input.templateCode,
    templateVersion: input.templateVersion,
    workPlanId: input.plan.id,
    workPlanFingerprint: input.plan.inputFingerprint,
    mtoFingerprint: snapshot?.snapshotFingerprint ?? null,
    mtoRevision: snapshot?.revision ?? null,
    requirements: manifest.requirements.map((row) => row.id),
    assumptions: manifest.assumptions.map((row) => row.id),
    decisions: manifest.decisions.map((row) => row.id),
    interfaces: manifest.interfaces.map((row) => row.id),
    information: manifest.engineeringInformation,
    ...(input.bindingKind === "EXPLICIT"
      ? {
          mtoSnapshotId: snapshot?.id ?? null,
          mtoProducingWorkPlanId: snapshot?.workPlanId ?? null,
          bindingKind: "EXPLICIT",
        }
      : {}),
    ...(input.calculation?.inputFingerprint
      ? { calculationInputFingerprint: input.calculation.inputFingerprint }
      : {}),
  });

  const quantityRows = summarizePresentQuantities(items);
  const deltas = v2 && priorV2 ? compareMtoSnapshots(priorV2, v2) : [];
  const deltaNarrative = priorV2 && snapshot ? deterministicDeltaNarrative(deltas, previous!.revision, snapshot.revision) : [];
  const changeImpacts = composeMtoChangeImpacts({
    deltas,
    objectType: "engineering_generated_artifact",
    objectId: input.plan.id,
    policy,
    costCalculated: false,
    carbonCalculated: false,
  });

  const constructability = items.length ? constructabilityEvidenceFromMto(items) : null;
  const evidence: Array<{ statement: string; evidenceClass: EvidenceClass }> = [
    { statement: "Generated artifact remains a draft. Engineer review required. Not engineering approval, IFC, or certified.", evidenceClass: "AI_DRAFT_NARRATIVE" },
    ...deltaNarrative,
  ];

  const quantityParagraphs = snapshot
    ? [
        `Quantities assembled from persisted MTO revision ${snapshot.revision} (${snapshot.status}). Fingerprint ${snapshot.snapshotFingerprint.slice(0, 16)}. Source revisions: ${snapshot.sourceRevisionSet.join(", ") || "none recorded"}.`,
        snapshot.status === "VERIFIED" && unverified === 0
          ? "MTO snapshot is VERIFIED. Unverified items are not hidden."
          : `MTO snapshot is ${snapshot.status}. ${unverified} item(s) remain UNVERIFIED/NEEDS_INFORMATION/REJECTED and are labelled below.`,
      ]
    : ["QUANTITY_NOT_AVAILABLE. No persisted MTO snapshot is bound to this Work Plan."];

  const costStatus = costApp === "NOT_APPLICABLE" ? "NOT_APPLICABLE" as const : "COST_NOT_CALCULATED" as const;
  const carbonStatus = carbonApp === "NOT_APPLICABLE" ? "NOT_APPLICABLE" as const : "CARBON_NOT_CALCULATED" as const;

  const requirementRows = input.plan.context.requirements.map((row) => [
    row.code ?? row.objectId,
    row.objectType,
    row.title,
    requirementEvidence(row),
    row.whyIncluded,
  ]);
  const assumptionRows = input.plan.context.assumptions.map((row) => [
    row.objectId,
    row.title,
    refStatus(row),
    row.whyIncluded,
  ]);
  const decisionRows = input.plan.context.decisions.map((row) => [
    row.objectId,
    row.title,
    refStatus(row),
    row.whyIncluded,
    "Rationale limited to recorded Work Plan text. Unrecorded rationale is not inferred.",
  ]);
  const interfaceRows = input.plan.context.interfaces.map((row) => [
    row.objectId,
    row.title,
    refStatus(row),
    row.whyIncluded,
  ]);

  const quantityTable = quantityRows.map((row) => [
    row.category,
    row.quantity == null ? "QUANTITY_NOT_AVAILABLE" : String(row.quantity),
    row.unit ?? "",
    row.statusLabel,
    row.evidenceClass,
    row.itemCodes.length <= 8 ? row.itemCodes.join(", ") : `${row.itemCodes.slice(0, 8).join(", ")} (+${row.itemCodes.length - 8} more)`,
  ]);

  const isNote = input.artifactType === "TECHNICAL_MEMORANDUM";
  const humanDecision = input.plan.context.decisions.find((row) => /selected|accepted|decided|approved/i.test(`${row.title} ${row.whyIncluded}`));

  const sections: ComposedSection[] = isNote
    ? [
        section("Document Control", "GOVERNED_FACT", [
          `Work Plan ${input.plan.templateCode}@${input.plan.templateVersion}. Template ${input.templateCode}@${input.templateVersion}.`,
          `Composition fingerprint ${compositionFingerprint}. Generation authority READY_FOR_ENGINEER_REVIEW. engineeringApproved=false.`,
        ]),
        section("Purpose", "AI_DRAFT_NARRATIVE", [
          "This technical note assembles governed Work Plan and MTO context for a bounded engineering issue. It does not invent a technical conclusion.",
        ]),
        section("Issue / Context", "GOVERNED_FACT", [
          `Project ${input.plan.projectId}. System ${input.plan.systemId ?? "not specified"}. Discipline ${input.plan.discipline ?? "unspecified"}. Lifecycle ${input.plan.lifecycleStage}.`,
          snapshot ? `Bound MTO revision ${snapshot.revision} (${snapshot.status}).` : "No MTO snapshot is bound.",
        ]),
        section("Governing Evidence", items.length ? "GOVERNED_FACT" : "MISSING_INFORMATION", quantityParagraphs, {
          missingState: snapshot ? null : "QUANTITY_NOT_AVAILABLE",
          rows: quantityTable,
        }),
        section("Decision Status", humanDecision ? "GOVERNED_FACT" : "MISSING_INFORMATION", humanDecision
          ? [`Recorded decision: ${humanDecision.title}. ${humanDecision.whyIncluded}`]
          : ["ENGINEER_CONCLUSION_REQUIRED. No human Decision record supports a technical conclusion."], {
          missingState: humanDecision ? null : "ENGINEER_CONCLUSION_REQUIRED",
        }),
        section("Conclusions", "MISSING_INFORMATION", [
          "ENGINEER_CONCLUSION_REQUIRED. EOS does not state that the design is adequate, compliant, or acceptable.",
        ], { missingState: "ENGINEER_CONCLUSION_REQUIRED" }),
        section("Outstanding Information", input.plan.context.gaps.length ? "MISSING_INFORMATION" : "GOVERNED_FACT",
          input.plan.context.gaps.map((row) => `${row.kind}: ${row.title} — ${row.explanation}`).concat(
            input.plan.context.gaps.length || input.plan.readiness !== "READY" ? ["CONDITIONAL INPUTS PRESENT where gaps exist. Missing/unaccepted values remain explicit."] : [],
            assumptionOpen ? ["Open assumptions remain visibly open."] : [],
          ),
          { missingState: input.plan.context.gaps.length ? "INFORMATION_REQUIRED" : null },
        ),
        section("References", "GOVERNED_FACT", input.plan.context.information.map((row) => `${row.title}${row.revision ? ` Rev ${row.revision}` : ""}`)),
      ]
    : [
        section("Document Control", "GOVERNED_FACT", [
          `Project ${input.plan.projectId}. Work Plan ${input.plan.templateCode}@${input.plan.templateVersion}. Template ${input.templateCode}@${input.templateVersion}.`,
          `Lifecycle ${input.plan.lifecycleStage}. Discipline ${input.plan.discipline ?? "unspecified"}. System ${input.plan.systemId ?? "not specified"}.`,
          `Source fingerprint ${compositionFingerprint}. MTO ${snapshot ? `Rev ${snapshot.revision} (${snapshot.status})` : "not bound"}.`,
          "DRAFT FOR ENGINEER REVIEW. Not issued. Not engineering approval. Not IFC. Not CERTIFIED.",
        ]),
        section("Purpose", "AI_DRAFT_NARRATIVE", [
          "This design report draft assembles governed Engineering OS context. Connecting narrative is draft only and is not a governed engineering fact. It does not invent technical conclusions.",
        ]),
        section("Scope", "AI_DRAFT_NARRATIVE", [
          `Scope is the ${input.plan.workType.replaceAll("_", " ").toLowerCase()} Work Plan for ${input.plan.lifecycleStage}. Missing facts remain missing.`,
        ]),
        section("Design Basis", input.plan.context.information.length ? "GOVERNED_FACT" : "MISSING_INFORMATION",
          input.plan.context.information.map((row) => `${row.title}${row.revision ? ` (Rev ${row.revision})` : ""} — ${row.whyIncluded}`),
          { missingState: input.plan.context.information.length ? null : "SOURCE_NOT_AVAILABLE" },
        ),
        section("Applicable Requirements", input.plan.context.requirements.length ? "GOVERNED_FACT" : "MISSING_INFORMATION", [
          "Requirement compliance is not declared. Evidence status is EVIDENCE_PRESENT, EVIDENCE_MISSING, or REVIEW_REQUIRED.",
        ], { rows: requirementRows, missingState: input.plan.context.requirements.length ? null : "INFORMATION_REQUIRED" }),
        section("Governing Information", input.plan.context.information.length ? "GOVERNED_FACT" : "MISSING_INFORMATION",
          input.plan.context.information.map((row) => `${row.title}${row.revision ? ` Rev ${row.revision}` : ""} (${row.freshness ?? "freshness unknown"})`),
        ),
        section("Design Assumptions", input.plan.context.assumptions.length ? "ENGINEER_ENTERED_ASSUMPTION" : "MISSING_INFORMATION", [
          "Open assumptions remain visibly open. Narrative generation does not convert an assumption into a fact.",
        ], { rows: assumptionRows }),
        section("System / Asset Context", "GOVERNED_FACT", [
          `System ${input.plan.systemId ?? "not specified"}. Asset ${input.plan.assetId ?? "not specified"}.`,
        ]),
        section("Design Description", "AI_DRAFT_NARRATIVE", [
          "Design description is limited to governed Work Plan context. No loads, capacities, grades, or dimensions are invented to complete this section.",
          ...deltaNarrative.map((row) => row.statement),
        ]),
        section("Engineering Quantities / MTO Summary", snapshot ? "GOVERNED_FACT" : "MISSING_INFORMATION", quantityParagraphs, {
          rows: [["Category", "Quantity", "Unit", "Status", "Evidence class", "Items"], ...quantityTable],
          missingState: snapshot ? null : "QUANTITY_NOT_AVAILABLE",
        }),
        section("Interfaces", input.plan.context.interfaces.length ? "GOVERNED_FACT" : "MISSING_INFORMATION", [
          "Unresolved interface conditions are not converted into resolved statements.",
        ], { rows: interfaceRows }),
        section("Options / Decisions", input.plan.context.decisions.length ? "GOVERNED_FACT" : "MISSING_INFORMATION", [
          "Only recorded Decision records are shown. Unrecorded rationale is not inferred.",
        ], { rows: decisionRows }),
        section("Constructability Considerations", constructApp === "NOT_APPLICABLE" ? "NOT_APPLICABLE" : constructability ? "DETERMINISTIC_RESULT" : "MISSING_INFORMATION", constructability
          ? [
              `Heavy-item count (governed mass ≥ 5 t): ${constructability.heavyMemberCount}.`,
              `Largest known governed item mass: ${constructability.largestLiftMassT ?? "not recorded"} t.`,
              `Concrete volume in MTO: ${constructability.concreteVolumeM3} m3.`,
              `Earthworks quantity in MTO: ${constructability.excavationVolumeM3} m3.`,
              `Field connection count in MTO: ${constructability.fieldConnectionCount}.`,
              "No universal constructability score is produced. This is not a constructability-acceptable conclusion.",
            ]
          : ["ENGINEER_INPUT_REQUIRED. Constructability evidence is limited to quantities actually present in the bound MTO."], {
          applicable: constructApp !== "NOT_APPLICABLE",
          missingState: constructability ? null : "ENGINEER_INPUT_REQUIRED",
        }),
        section("Cost Basis", costStatus === "NOT_APPLICABLE" ? "NOT_APPLICABLE" : "MISSING_INFORMATION", [
          costStatus === "NOT_APPLICABLE" ? "Cost is NOT_APPLICABLE for this project policy." : "COST_NOT_CALCULATED. No approved rate basis is bound. Placeholder rates are not invented.",
        ], { applicable: costApp !== "NOT_APPLICABLE", missingState: costStatus === "COST_NOT_CALCULATED" ? "COST_NOT_CALCULATED" : null }),
        section("Carbon Basis", carbonStatus === "NOT_APPLICABLE" ? "NOT_APPLICABLE" : "MISSING_INFORMATION", [
          carbonStatus === "NOT_APPLICABLE"
            ? "Carbon is NOT_APPLICABLE for this project policy. No carbon gap is invented."
            : "CARBON_NOT_CALCULATED. Required carbon has no approved factor. No inferred factor.",
        ], { applicable: carbonApp !== "NOT_APPLICABLE" || carbonApp === "NOT_APPLICABLE", missingState: carbonStatus === "CARBON_NOT_CALCULATED" ? "CARBON_NOT_CALCULATED" : null }),
        section("Risks / Limitations", "AI_DRAFT_NARRATIVE", [
          "This draft does not certify design adequacy, code compliance, cost acceptability, or constructability.",
          "AI_DRAFT_NARRATIVE cannot become a governed engineering fact merely because it appears in this document.",
        ]),
        section("Outstanding Information", input.plan.context.gaps.length || unverified ? "MISSING_INFORMATION" : "GOVERNED_FACT", [
          ...input.plan.context.gaps.map((row) => `${row.kind}: ${row.title} — ${row.explanation}`),
          ...(input.plan.context.gaps.length || input.plan.readiness !== "READY" ? ["CONDITIONAL INPUTS PRESENT where gaps exist. Missing/unaccepted values remain explicit."] : []),
          ...items.filter((row) => !isVerifiedItem(row) || !acceptGovernedQuantity(row).ok).slice(0, 12).map((row) => `${row.itemCode}: ${itemStatusLabel(row)}`),
          ...(unverified > 12 ? [`${unverified - 12} additional unverified/missing items not listed in this narrative. See governed XLSX MTO.`] : []),
          ...input.plan.context.assumptions.filter((row) => refStatus(row) === "OPEN").map((row) => `Assumption ${row.title} remains OPEN.`),
        ], { missingState: input.plan.context.gaps.length ? "INFORMATION_REQUIRED" : null }),
        section("Conclusions / Recommendations", "MISSING_INFORMATION", [
          "ENGINEER_CONCLUSION_REQUIRED. Generation does not approve the deliverable or select a technical solution.",
        ], { missingState: "ENGINEER_CONCLUSION_REQUIRED" }),
        section("References", "GOVERNED_FACT", input.plan.context.information.map((row) => `${row.title}${row.revision ? ` Rev ${row.revision}` : ""}`)),
        section("Appendices", "GOVERNED_FACT", [
          "Full MTO item listing is not embedded in this narrative DOCX. Use the governed XLSX MTO export bound to the same snapshot.",
        ]),
      ];

  if (carbonApp === "NOT_APPLICABLE") {
    const carbon = sections.find((row) => row.title === "Carbon Basis");
    if (carbon) {
      carbon.applicable = false;
      carbon.evidenceClass = "NOT_APPLICABLE";
      carbon.paragraphs = ["Carbon section omitted / N/A per project policy. NOT_APPLICABLE."];
    }
  }

  return {
    generatorVersion: A15A_V4_GENERATOR_VERSION,
    artifactType: input.artifactType,
    authority: "READY_FOR_ENGINEER_REVIEW",
    engineeringApproved: false,
    manifest,
    compositionFingerprint,
    readiness,
    evidence,
    sections: sections.filter((row) => row.applicable || row.evidenceClass === "NOT_APPLICABLE"),
    quantityRows,
    deltas,
    costStatus,
    carbonStatus,
    constructabilityScore: null,
    v2Snapshot: v2,
    changeImpacts,
    narrativePolicy: {
      aiDraftCannotBecomeGovernedFact: true,
      noAdequacyClaims: true,
      noComplianceClaims: true,
      noCostAcceptabilityClaims: true,
      noConstructabilityScore: true,
    },
  };
}

export function compareDeliverableStaleness(input: {
  artifactPlanFingerprint: string;
  currentPlanFingerprint: string;
  artifactMtoFingerprint?: string | null;
  currentMtoFingerprint?: string | null;
  artifactCompositionFingerprint?: string | null;
  currentCompositionFingerprint?: string | null;
}) {
  const mtoChanged = Boolean(
    input.artifactMtoFingerprint
    && input.currentMtoFingerprint
    && input.artifactMtoFingerprint !== input.currentMtoFingerprint,
  );
  const compositionChanged = Boolean(
    input.artifactCompositionFingerprint
    && input.currentCompositionFingerprint
    && input.artifactCompositionFingerprint !== input.currentCompositionFingerprint,
  );
  const planChanged = input.artifactPlanFingerprint !== input.currentPlanFingerprint;
  if (mtoChanged) {
    return {
      stale: true as const,
      reason: "MTO_SOURCE_CHANGED" as const,
      regenerationRequired: true as const,
      message: "MTO_SOURCE_CHANGED. REGENERATION_REQUIRED. Prior artifact remains immutable.",
    };
  }
  if (compositionChanged || planChanged) {
    return {
      stale: true as const,
      reason: "STALE" as const,
      regenerationRequired: true as const,
      message: "Governing source changed. REGENERATION_REQUIRED. Prior artifact remains immutable.",
    };
  }
  return { stale: false as const, reason: "CURRENT" as const, regenerationRequired: false as const };
}

export function deliverableThreadLinks(input: {
  workPlanId: string;
  artifactId: string;
  previousArtifactId?: string | null;
  mtoSnapshotId?: string | null;
  informationIds: string[];
  requirementIds: string[];
}) {
  const links = [
    { relationship: "PRODUCED", fromType: "engineering_work_plan", fromId: input.workPlanId, toType: "engineering_generated_artifact", toId: input.artifactId },
    { relationship: "USES", fromType: "engineering_work_plan", fromId: input.workPlanId, toType: "engineering_generated_artifact", toId: input.artifactId },
  ];
  if (input.mtoSnapshotId) {
    links.push({ relationship: "USED_BY", fromType: "engineering_mto_snapshot", fromId: input.mtoSnapshotId, toType: "engineering_generated_artifact", toId: input.artifactId });
    links.push({ relationship: "SOURCE_FOR", fromType: "engineering_mto_snapshot", fromId: input.mtoSnapshotId, toType: "engineering_generated_artifact", toId: input.artifactId });
    links.push({ relationship: "USES", fromType: "engineering_work_plan", fromId: input.workPlanId, toType: "engineering_mto_snapshot", toId: input.mtoSnapshotId });
  }
  if (input.previousArtifactId) {
    links.push({ relationship: "SUPERSEDED_BY", fromType: "engineering_generated_artifact", fromId: input.previousArtifactId, toType: "engineering_generated_artifact", toId: input.artifactId });
  }
  for (const id of input.informationIds) {
    links.push({ relationship: "EVIDENCED_BY", fromType: "engineering_information", fromId: id, toType: "engineering_generated_artifact", toId: input.artifactId });
  }
  for (const id of input.requirementIds) {
    links.push({ relationship: "EVIDENCED_BY", fromType: "requirement", fromId: id, toType: "engineering_generated_artifact", toId: input.artifactId });
  }
  return links;
}
