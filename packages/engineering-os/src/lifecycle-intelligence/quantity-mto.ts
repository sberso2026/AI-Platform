/**
 * EOS-A15A-V2 — Quantity Basis & multidisciplinary MTO.
 *
 * Composition overlay on Lifecycle, Information, Work Plans, Change/Impact,
 * Pre-Issue Review, Digital Thread, and My Engineering Day.
 * Not an MTO / Cost / Carbon / Constructability Intelligence domain.
 *
 * Principle: MTO-first, evidence-based quantitative engineering.
 * Information → Quantity Basis → MTO → optional Cost/Carbon/Constructability
 * → Option/Change evaluation → human decision.
 */

import { createHash } from "node:crypto";
import type { CanonicalDisciplineCode } from "../discipline-intelligence/catalog";
import type { ThreadRelation } from "../digital-thread/types";
import type { PotentialValueImpact, ProjectValuePolicy, ValueLifecycleKey } from "./cross-lifecycle-value";
import { resolveProjectValuePolicy } from "./cross-lifecycle-value";
import type { ExpectedOutputType } from "../work-generator/types";
import type { PreIssueCheckType, PreIssueConditionCode } from "../pre-issue-review/types";

export const A15A_V2_FEATURE_FREEZE = {
  newMtoIntelligenceDomain: false,
  newCostIntelligenceDomain: false,
  newCarbonIntelligenceDomain: false,
  newConstructabilityIntelligenceDomain: false,
  newGraphStore: false,
  newEventBus: false,
  newDms: false,
  newScannerFramework: false,
  scannerV2: false,
} as const;

export const QUANTITY_SEMANTICS = {
  QUANTITY_BASIS: "Evidence explaining where a quantity came from and how it was derived.",
  MTO_ITEM: "Governed quantity of an engineering material, component, or work item.",
  MTO: "Controlled collection/snapshot of MTO items for a defined project/system/discipline/lifecycle/revision context.",
  BOM: "Component/material bill where product/equipment semantics apply. Not automatically an MTO.",
  EQUIPMENT_SCHEDULE: "Tagged equipment list. Not automatically identical to an MTO.",
  BOQ: "Commercial/contract quantity document. Not automatically synonymous with engineering MTO.",
} as const;

export const QUANTITY_ORIGIN_TYPES = [
  "SOURCE_MEASURED",
  "SOURCE_EXTRACTED",
  "DETERMINISTICALLY_DERIVED",
  "ENGINEER_ENTERED_ASSUMPTION",
  "PARAMETRIC_ALLOWANCE",
  "MISSING",
] as const;
export type QuantityOriginType = (typeof QUANTITY_ORIGIN_TYPES)[number];

export const QUANTITY_MATURITY_STATES = [
  "CONCEPT_ALLOWANCE",
  "PARAMETRIC_QUANTITY",
  "PRELIMINARY_TAKEOFF",
  "DEVELOPED_MTO",
  "FEED_MTO",
  "DETAILED_MTO",
  "CONSTRUCTION_QUANTITY",
  "INSTALLED_QUANTITY",
  "AS_BUILT_QUANTITY",
] as const;
export type QuantityMaturity = (typeof QUANTITY_MATURITY_STATES)[number];

export const QUANTITY_VERIFICATION_STATES = ["UNVERIFIED", "DETERMINISTICALLY_VERIFIED", "ENGINEER_ACCEPTED", "REJECTED"] as const;
export type QuantityVerificationStatus = (typeof QUANTITY_VERIFICATION_STATES)[number];

export const COST_SOURCE_STATES = [
  "VENDOR_QUOTE",
  "CONTRACT_RATE",
  "CLIENT_APPROVED_RATE",
  "COMPANY_APPROVED_RATE",
  "HISTORICAL_BENCHMARK",
  "INDEXED_HISTORICAL",
  "ESTIMATOR_ASSUMPTION",
  "UNVERIFIED",
  "MISSING",
] as const;
export type CostSourceState = (typeof COST_SOURCE_STATES)[number];

export const APPROVED_COST_SOURCE_STATES = [
  "VENDOR_QUOTE",
  "CONTRACT_RATE",
  "CLIENT_APPROVED_RATE",
  "COMPANY_APPROVED_RATE",
] as const;

export const MTO_DISCIPLINE_SCOPES = [
  "PROCESS",
  "MECHANICAL",
  "PIPING",
  "STRUCTURAL",
  "CIVIL",
  "GEOTECHNICAL",
  "ELECTRICAL",
  "INSTRUMENTATION_CONTROL",
  "MATERIALS",
  "MULTIDISCIPLINARY",
] as const;
export type MtoDisciplineScope = (typeof MTO_DISCIPLINE_SCOPES)[number];

export const MTO_ITEM_SEMANTICS = {
  STRUCTURAL: "bulk_mto",
  CIVIL: "bulk_mto",
  GEOTECHNICAL: "bulk_mto",
  PIPING: "bulk_mto",
  ELECTRICAL: "bulk_mto",
  INSTRUMENTATION_CONTROL: "index_and_counts",
  MECHANICAL: "equipment_schedule",
  PROCESS: "equipment_and_process_quantities",
  MATERIALS: "enrichment_only",
} as const;

export const LIFECYCLE_QUANTITY_EXPECTATIONS: Record<ValueLifecycleKey, { expectedMaturity: QuantityMaturity; guidance: string }> = {
  CONCEPT: { expectedMaturity: "CONCEPT_ALLOWANCE", guidance: "High-level quantities / allowances only where evidence exists." },
  PREFEASIBILITY: { expectedMaturity: "PRELIMINARY_TAKEOFF", guidance: "Preliminary take-offs and major equipment/material quantities." },
  FEASIBILITY: { expectedMaturity: "DEVELOPED_MTO", guidance: "Developed multidisciplinary quantities." },
  FEED: { expectedMaturity: "FEED_MTO", guidance: "Controlled discipline MTO suitable as an engineering basis where evidence supports it." },
  DETAILED_DESIGN: { expectedMaturity: "DETAILED_MTO", guidance: "Detailed engineering MTO. Do not fabricate unsupported detail." },
  CONSTRUCTION: { expectedMaturity: "CONSTRUCTION_QUANTITY", guidance: "Design vs procured vs installed vs field change." },
  COMMISSIONING: { expectedMaturity: "INSTALLED_QUANTITY", guidance: "Installed/as-built quantity continuity." },
  HANDOVER: { expectedMaturity: "AS_BUILT_QUANTITY", guidance: "Installed/as-built quantity continuity." },
  OPERATIONS: { expectedMaturity: "AS_BUILT_QUANTITY", guidance: "Retained / removed / added / replaced quantities where applicable." },
  MODIFICATION: { expectedMaturity: "CONSTRUCTION_QUANTITY", guidance: "Retained / removed / added / replaced quantities where applicable." },
};

export const AI_QUANTITY_POLICY = {
  mayFindCandidateSources: true,
  mayExtractCandidateQuantities: true,
  mayClassifyMtoRows: true,
  mayMapItemDescriptions: true,
  mayNormalizeUnits: true,
  mayIdentifyDuplicates: true,
  mayReconcileRevisions: true,
  mayExplainQuantityChanges: true,
  mayIdentifyMissingProvenance: true,
  mayDraftMtoNarratives: true,
  mayInventMissingQuantity: false,
  mayInventUnitRate: false,
  mayInventCarbonFactor: false,
  mayInventMaterialGrade: false,
  mayInventDesignGeometry: false,
  maySilentlyPromoteAllowance: false,
  maySilentlyChangeMaturity: false,
  extractedRemainUnverifiedUntilAccepted: true,
} as const;

export const CANONICAL_UNITS = ["mm", "m", "m2", "m3", "kg", "t", "ea", "L", "kW"] as const;
export type CanonicalUnit = (typeof CANONICAL_UNITS)[number];

const UNIT_TO_CANONICAL: Record<string, { unit: CanonicalUnit; factor: number }> = {
  mm: { unit: "mm", factor: 1 },
  m: { unit: "m", factor: 1 },
  m2: { unit: "m2", factor: 1 },
  m3: { unit: "m3", factor: 1 },
  kg: { unit: "kg", factor: 1 },
  t: { unit: "t", factor: 1 },
  ea: { unit: "ea", factor: 1 },
  L: { unit: "L", factor: 1 },
  kW: { unit: "kW", factor: 1 },
  "mm2": { unit: "m2", factor: 1e-6 },
  "m²": { unit: "m2", factor: 1 },
  "m³": { unit: "m3", factor: 1 },
};

export type QuantityScope = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  systemId?: string | null;
  assetId?: string | null;
};

export type QuantityBasis = {
  id: string;
  sourceType: QuantityOriginType;
  sourceRef: string | null;
  sourceRevision: string | null;
  measurementMethod: string | null;
  derivationMethod: string | null;
  formula: string | null;
  assumptions: string[];
  exclusions: string[];
  extractionRecordId?: string | null;
  inputRefs?: string[];
  createdAt: string;
  createdBy: string;
};

export type QuantityItem = QuantityScope & {
  id: string;
  itemCode: string;
  description: string;
  discipline: CanonicalDisciplineCode | "MULTIDISCIPLINARY";
  category: string;
  material: string | null;
  grade: string | null;
  specification: string | null;
  tag?: string | null;
  quantity: number | null;
  unit: string | null;
  sourceUnit?: string | null;
  conversionRecorded?: boolean;
  quantityOrigin: QuantityOriginType;
  quantityMaturity: QuantityMaturity;
  verificationStatus: QuantityVerificationStatus;
  lifecycleStage: ValueLifecycleKey;
  status: "ACTIVE" | "SUPERSEDED" | "REJECTED" | "MISSING";
  basis: QuantityBasis;
  section?: string | null;
  length?: number | null;
  count?: number | null;
  unitMass?: number | null;
  totalMass?: number | null;
  plateThickness?: number | null;
  area?: number | null;
  volume?: number | null;
  semantics: "bulk_mto" | "equipment_schedule" | "index_and_counts" | "process_quantity" | "materials_enrichment";
  verifiedAt?: string | null;
  verifiedBy?: string | null;
};

export type MtoSnapshot = QuantityScope & {
  id: string;
  revision: string;
  disciplineScope: MtoDisciplineScope;
  lifecycleStage: ValueLifecycleKey;
  sourceRevisions: string[];
  generatedAt: string;
  generatedBy: string;
  status: "DRAFT" | "ISSUED_FOR_ENGINEERING" | "VERIFIED" | "SUPERSEDED";
  verificationState: QuantityVerificationStatus;
  items: QuantityItem[];
  itemCount: number;
  fingerprint: string;
  supersedesSnapshotId: string | null;
};

export type QuantityAcceptance =
  | { ok: true; quantity: number; origin: QuantityOriginType }
  | { ok: false; code: "QUANTITY_NOT_AVAILABLE"; origin: QuantityOriginType; reason: string };

export function normalizeUnit(unit: string | null | undefined): { canonical: CanonicalUnit | null; factor: number; recorded: boolean; source: string | null } {
  if (!unit?.trim()) return { canonical: null, factor: 1, recorded: false, source: null };
  const key = unit.trim();
  const mapped = UNIT_TO_CANONICAL[key] ?? UNIT_TO_CANONICAL[key.toLowerCase()];
  if (!mapped) return { canonical: null, factor: 1, recorded: false, source: key };
  return { canonical: mapped.unit, factor: mapped.factor, recorded: mapped.factor !== 1 || mapped.unit !== key, source: key };
}

export function convertQuantity(value: number, fromUnit: string, toUnit: CanonicalUnit): { ok: true; value: number; conversionRecorded: true } | { ok: false; code: "UNIT_CONVERSION_NOT_RECORDED" } {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  if (!from.canonical || !to.canonical) return { ok: false, code: "UNIT_CONVERSION_NOT_RECORDED" };
  if (from.canonical === to.canonical) {
    return { ok: true, value: value * from.factor / (to.factor || 1), conversionRecorded: true };
  }
  const mass = convertMass(value, from.canonical, to.canonical);
  if (mass != null) return { ok: true, value: mass, conversionRecorded: true };
  const length = convertLength(value, from.canonical, to.canonical);
  if (length != null) return { ok: true, value: length, conversionRecorded: true };
  return { ok: false, code: "UNIT_CONVERSION_NOT_RECORDED" };
}

function convertMass(value: number, from: CanonicalUnit | null, to: CanonicalUnit | null) {
  if (from === "kg" && to === "t") return value / 1000;
  if (from === "t" && to === "kg") return value * 1000;
  return null;
}

function convertLength(value: number, from: CanonicalUnit | null, to: CanonicalUnit | null) {
  if (from === "mm" && to === "m") return value / 1000;
  if (from === "m" && to === "mm") return value * 1000;
  return null;
}

export function provenanceAllowsQuantity(basis: QuantityBasis): { ok: true } | { ok: false; reason: string } {
  if (basis.sourceType === "MISSING") return { ok: false, reason: "MISSING origin must not produce a fabricated quantity." };
  if (basis.sourceType === "SOURCE_MEASURED" && !basis.sourceRef) return { ok: false, reason: "SOURCE_MEASURED requires a governed source." };
  if (basis.sourceType === "SOURCE_EXTRACTED" && (!basis.sourceRef || !basis.sourceRevision || !basis.extractionRecordId)) {
    return { ok: false, reason: "SOURCE_EXTRACTED requires source document/model, revision, and extraction record." };
  }
  if (basis.sourceType === "DETERMINISTICALLY_DERIVED" && (!basis.formula || !basis.inputRefs?.length)) {
    return { ok: false, reason: "DETERMINISTICALLY_DERIVED requires inputs and a deterministic formula/method." };
  }
  if (basis.sourceType === "ENGINEER_ENTERED_ASSUMPTION" && (!basis.createdBy || !basis.assumptions.length)) {
    return { ok: false, reason: "ENGINEER_ENTERED_ASSUMPTION requires human attribution and assumption status." };
  }
  if (basis.sourceType === "PARAMETRIC_ALLOWANCE" && !basis.assumptions.length) {
    return { ok: false, reason: "PARAMETRIC_ALLOWANCE requires an explicit basis and must not masquerade as detailed MTO." };
  }
  return { ok: true };
}

export function acceptGovernedQuantity(item: Pick<QuantityItem, "quantity" | "unit" | "quantityOrigin" | "basis">): QuantityAcceptance {
  const origin = item.quantityOrigin;
  if (origin === "MISSING" || item.quantity == null || !Number.isFinite(item.quantity) || !item.unit) {
    return { ok: false, code: "QUANTITY_NOT_AVAILABLE", origin, reason: "Quantity basis is missing. EOS does not originate a governed numeric quantity from generative AI." };
  }
  const provenance = provenanceAllowsQuantity(item.basis);
  if (!provenance.ok) {
    return { ok: false, code: "QUANTITY_NOT_AVAILABLE", origin, reason: provenance.reason };
  }
  return { ok: true, quantity: item.quantity, origin };
}

export function deriveSteelMassTonnes(input: {
  lengthM: number | null;
  unitMassKgPerM: number | null;
  unitMassSourceRef: string | null;
}): QuantityAcceptance {
  if (input.lengthM == null || input.unitMassKgPerM == null || !input.unitMassSourceRef) {
    return {
      ok: false,
      code: "QUANTITY_NOT_AVAILABLE",
      origin: "MISSING",
      reason: "Steel mass requires measured/extracted length and a published/canonical section mass. LLM must not estimate unknown section mass.",
    };
  }
  return {
    ok: true,
    quantity: (input.lengthM * input.unitMassKgPerM) / 1000,
    origin: "DETERMINISTICALLY_DERIVED",
  };
}

export function sumQuantities(values: Array<number | null | undefined>): number {
  return values.reduce<number>((sum, value) => sum + (typeof value === "number" && Number.isFinite(value) ? value : 0), 0);
}

export function fingerprintItems(items: QuantityItem[]): string {
  const canonical = items
    .map((row) =>
      [
        row.itemCode,
        row.discipline,
        row.category,
        row.quantity ?? "null",
        row.unit ?? "",
        row.quantityOrigin,
        row.basis.sourceRef ?? "",
        row.basis.sourceRevision ?? "",
      ].join("|"),
    )
    .sort()
    .join("\n");
  return createHash("sha256").update(canonical).digest("hex");
}

export function issueMtoSnapshot(input: {
  id: string;
  scope: QuantityScope;
  revision: string;
  disciplineScope: MtoDisciplineScope;
  lifecycleStage: ValueLifecycleKey;
  generatedBy: string;
  generatedAt?: string;
  items: QuantityItem[];
  supersedesSnapshotId?: string | null;
  status?: MtoSnapshot["status"];
  verificationState?: QuantityVerificationStatus;
}): MtoSnapshot {
  return {
    ...input.scope,
    id: input.id,
    revision: input.revision,
    disciplineScope: input.disciplineScope,
    lifecycleStage: input.lifecycleStage,
    sourceRevisions: [...new Set(input.items.map((row) => row.basis.sourceRevision).filter((row): row is string => Boolean(row)))],
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    generatedBy: input.generatedBy,
    status: input.status ?? "DRAFT",
    verificationState: input.verificationState ?? "UNVERIFIED",
    items: input.items,
    itemCount: input.items.length,
    fingerprint: fingerprintItems(input.items),
    supersedesSnapshotId: input.supersedesSnapshotId ?? null,
  };
}

export function assertMtoProjectScope(snapshot: MtoSnapshot, scope: QuantityScope): "ok" | "CROSS_PROJECT_MISMATCH" | "CROSS_TENANT" | "CROSS_WORKSPACE" {
  if (snapshot.tenantId !== scope.tenantId) return "CROSS_TENANT";
  if (snapshot.workspaceId !== scope.workspaceId) return "CROSS_WORKSPACE";
  if (snapshot.projectId !== scope.projectId) return "CROSS_PROJECT_MISMATCH";
  return "ok";
}

export const MTO_DELTA_KINDS = ["ADDED", "REMOVED", "INCREASED", "DECREASED", "UNCHANGED"] as const;
export type MtoDeltaKind = (typeof MTO_DELTA_KINDS)[number];

export type MtoItemDelta = {
  itemCode: string;
  description: string;
  discipline: string;
  category: string;
  unit: string | null;
  priorQuantity: number | null;
  currentQuantity: number | null;
  delta: number | null;
  kind: MtoDeltaKind;
};

export function compareMtoSnapshots(prior: MtoSnapshot, current: MtoSnapshot): MtoItemDelta[] {
  const priorByCode = new Map(prior.items.map((row) => [row.itemCode, row]));
  const currentByCode = new Map(current.items.map((row) => [row.itemCode, row]));
  const codes = new Set([...priorByCode.keys(), ...currentByCode.keys()]);
  const rows: MtoItemDelta[] = [];
  for (const itemCode of [...codes].sort()) {
    const left = priorByCode.get(itemCode);
    const right = currentByCode.get(itemCode);
    if (!left && right) {
      rows.push(deltaRow(itemCode, right, null, right.quantity, "ADDED"));
      continue;
    }
    if (left && !right) {
      rows.push(deltaRow(itemCode, left, left.quantity, null, "REMOVED"));
      continue;
    }
    if (!left || !right) continue;
    const a = left.quantity;
    const b = right.quantity;
    let kind: MtoDeltaKind = "UNCHANGED";
    let delta: number | null = null;
    if (a == null && b == null) kind = "UNCHANGED";
    else if (a == null || b == null) kind = b == null ? "REMOVED" : "ADDED";
    else {
      delta = b - a;
      kind = delta > 0 ? "INCREASED" : delta < 0 ? "DECREASED" : "UNCHANGED";
    }
    rows.push(deltaRow(itemCode, right, a ?? null, b ?? null, kind, delta));
  }
  return rows;
}

function deltaRow(
  itemCode: string,
  sample: QuantityItem,
  priorQuantity: number | null,
  currentQuantity: number | null,
  kind: MtoDeltaKind,
  delta: number | null = currentQuantity != null && priorQuantity != null ? currentQuantity - priorQuantity : currentQuantity,
): MtoItemDelta {
  return {
    itemCode,
    description: sample.description,
    discipline: sample.discipline,
    category: sample.category,
    unit: sample.unit,
    priorQuantity,
    currentQuantity,
    delta: delta ?? null,
    kind,
  };
}

export function summarizeCategoryDeltas(deltas: MtoItemDelta[]): Array<{ category: string; unit: string | null; delta: number }> {
  const map = new Map<string, { category: string; unit: string | null; delta: number }>();
  for (const row of deltas) {
    if (row.delta == null) continue;
    const key = `${row.category}|${row.unit ?? ""}`;
    const existing = map.get(key) ?? { category: row.category, unit: row.unit, delta: 0 };
    existing.delta += row.delta;
    map.set(key, existing);
  }
  return [...map.values()];
}

export type ApprovedRate = {
  rateValue: number;
  rateUnit: string;
  currency: string;
  baseDate: string;
  source: string;
  sourceRevision: string;
  locationApplicability: string;
  approvalStatus: CostSourceState;
  escalationBasis?: string | null;
  locationFactor?: number | null;
  productivityBasis?: string | null;
  allowanceBasis?: string | null;
  uncertainty?: string | null;
};

export type DerivedCost =
  | { state: "DERIVED"; amount: number; currency: string; rate: ApprovedRate; quantity: number }
  | { state: "COST_NOT_CALCULATED"; reason: string };

export function deriveCost(quantity: QuantityAcceptance, rate: ApprovedRate | null | undefined): DerivedCost {
  if (!quantity.ok) return { state: "COST_NOT_CALCULATED", reason: quantity.reason };
  if (!rate) return { state: "COST_NOT_CALCULATED", reason: "Approved cost rate missing." };
  const usable = (APPROVED_COST_SOURCE_STATES as readonly string[]).includes(rate.approvalStatus);
  if (!usable) return { state: "COST_NOT_CALCULATED", reason: `${rate.approvalStatus} is not an approved usable cost source.` };
  const missing = [
    !Number.isFinite(rate.rateValue) ? "rate value" : null,
    !rate.rateUnit ? "rate unit" : null,
    !rate.currency ? "currency" : null,
    !rate.baseDate ? "base date" : null,
    !rate.source ? "source" : null,
    !rate.sourceRevision ? "source revision" : null,
    !rate.locationApplicability ? "location applicability" : null,
  ].filter(Boolean);
  if (missing.length) return { state: "COST_NOT_CALCULATED", reason: `Mandatory cost basis absent: ${missing.join(", ")}.` };
  return { state: "DERIVED", amount: quantity.quantity * rate.rateValue, currency: rate.currency, rate, quantity: quantity.quantity };
}

export type ApprovedEmissionFactor = {
  source: string;
  version: string;
  date: string;
  unit: string;
  geography: string;
  materialOrProcess: string;
  systemBoundary: string;
  applicability: string;
  factor: number;
};

export type DerivedCarbon =
  | { state: "DERIVED"; value: number; unit: string }
  | { state: "CARBON_NOT_APPLICABLE"; reason: string }
  | { state: "CARBON_NOT_CALCULATED"; reason: string };

export function deriveCarbon(input: {
  policy: ProjectValuePolicy;
  quantity: QuantityAcceptance;
  factor: ApprovedEmissionFactor | null | undefined;
}): DerivedCarbon {
  if (input.policy.carbon === "NOT_APPLICABLE") {
    return { state: "CARBON_NOT_APPLICABLE", reason: "Project carbon policy is NOT_APPLICABLE." };
  }
  if (!input.quantity.ok) return { state: "CARBON_NOT_CALCULATED", reason: input.quantity.reason };
  if (!input.factor) return { state: "CARBON_NOT_CALCULATED", reason: "Approved emission factor missing." };
  const missing = [
    !input.factor.source ? "source" : null,
    !input.factor.version ? "version" : null,
    !input.factor.date ? "date" : null,
    !input.factor.unit ? "unit" : null,
    !input.factor.geography ? "geography" : null,
    !input.factor.materialOrProcess ? "material/process" : null,
    !input.factor.systemBoundary ? "system boundary" : null,
    !input.factor.applicability ? "applicability" : null,
    !Number.isFinite(input.factor.factor) ? "factor" : null,
  ].filter(Boolean);
  if (missing.length) return { state: "CARBON_NOT_CALCULATED", reason: `Mandatory carbon factor absent: ${missing.join(", ")}.` };
  return { state: "DERIVED", value: input.quantity.quantity * input.factor.factor, unit: input.factor.unit };
}

export type ConstructabilityMtoEvidence = {
  heavyMemberCount: number;
  largestLiftMassT: number | null;
  moduleCount: number;
  fieldConnectionCount: number;
  concreteVolumeM3: number;
  excavationVolumeM3: number;
  pipeWeldCount: number;
  cableLengthM: number;
  opaqueScore: null;
};

export function constructabilityEvidenceFromMto(items: QuantityItem[]): ConstructabilityMtoEvidence {
  const steel = items.filter((row) => row.category.toLowerCase().includes("steel") || row.totalMass != null);
  const lifts = steel.map((row) => row.totalMass).filter((row): row is number => row != null);
  return {
    heavyMemberCount: steel.filter((row) => (row.totalMass ?? 0) >= 5).length,
    largestLiftMassT: lifts.length ? Math.max(...lifts) : null,
    moduleCount: items.filter((row) => /module/i.test(row.category)).length,
    fieldConnectionCount: sumQuantities(items.filter((row) => /bolt|weld|connection/i.test(row.category)).map((row) => row.quantity)),
    concreteVolumeM3: sumQuantities(items.filter((row) => /concrete/i.test(row.category) && row.unit === "m3").map((row) => row.quantity)),
    excavationVolumeM3: sumQuantities(items.filter((row) => /excavation|cut|fill/i.test(row.category) && row.unit === "m3").map((row) => row.quantity)),
    pipeWeldCount: sumQuantities(items.filter((row) => /weld/i.test(row.category) && /pip/i.test(row.discipline)).map((row) => row.quantity)),
    cableLengthM: sumQuantities(items.filter((row) => /cable/i.test(row.category) && row.unit === "m").map((row) => row.quantity)),
    opaqueScore: null,
  };
}

export function composeMtoChangeImpacts(input: {
  deltas: MtoItemDelta[];
  objectType: string;
  objectId: string;
  policy?: ProjectValuePolicy;
  costCalculated?: boolean;
  carbonCalculated?: boolean;
}): PotentialValueImpact[] {
  const policy = input.policy ?? resolveProjectValuePolicy();
  const quantityReason = input.deltas
    .filter((row) => row.kind !== "UNCHANGED")
    .map((row) => `${row.itemCode} ${row.kind} ${row.delta ?? ""} ${row.unit ?? ""}`.trim())
    .join("; ") || "No quantity delta.";
  const rows: PotentialValueImpact[] = [
    {
      dimension: "QUANTITY",
      status: "POTENTIAL",
      quantified: false,
      autoConfirmed: false,
      objectType: input.objectType,
      objectId: input.objectId,
      reason: `Deterministic MTO revision delta. ${quantityReason}. Quantity delta is evidence; impact remains POTENTIAL until human confirmation.`,
    },
    {
      dimension: "TECHNICAL",
      status: "POTENTIAL",
      quantified: false,
      autoConfirmed: false,
      objectType: input.objectType,
      objectId: input.objectId,
      reason: "Quantity change may have technical implications. Related is not confirmed impact.",
    },
  ];
  if (policy.cost !== "NOT_APPLICABLE") {
    rows.push({
      dimension: "COST",
      status: "POTENTIAL",
      quantified: false,
      autoConfirmed: false,
      objectType: input.objectType,
      objectId: input.objectId,
      reason: input.costCalculated
        ? "Quantity delta with approved rates. Cost remains POTENTIAL until human confirmation."
        : "Quantity delta is not a cost impact. COST_NOT_CALCULATED without approved rates.",
    });
  }
  if (policy.constructability !== "NOT_APPLICABLE") {
    rows.push({
      dimension: "CONSTRUCTABILITY",
      status: "POTENTIAL",
      quantified: false,
      autoConfirmed: false,
      objectType: input.objectType,
      objectId: input.objectId,
      reason: "MTO is constructability evidence, not an opaque score.",
    });
  }
  rows.push({
    dimension: "SCHEDULE",
    status: "POTENTIAL",
    quantified: false,
    autoConfirmed: false,
    objectType: input.objectType,
    objectId: input.objectId,
    reason: "Potential schedule implication. Not a planning-system forecast.",
  });
  if (policy.carbon !== "NOT_APPLICABLE") {
    rows.push({
      dimension: "CARBON",
      status: "POTENTIAL",
      quantified: false,
      autoConfirmed: false,
      objectType: input.objectType,
      objectId: input.objectId,
      reason: input.carbonCalculated
        ? "Quantity delta with approved factors. Carbon remains POTENTIAL until human confirmation."
        : "Quantity delta is not a carbon result. CARBON_NOT_CALCULATED without approved factors.",
    });
  }
  return rows;
}

export type MtoReviewFinding = {
  checkType: PreIssueCheckType;
  code: PreIssueConditionCode;
  title: string;
  quantityCorrect: false;
  costAcceptable: false;
  constructable: false;
  carbonCompliant: false;
};

export function reviewMtoProvenance(items: QuantityItem[], opts?: { claimedMaturity?: QuantityMaturity; costPresented?: boolean; carbonPresented?: boolean; costApproved?: boolean; carbonApproved?: boolean }): MtoReviewFinding[] {
  const findings: MtoReviewFinding[] = [];
  const push = (code: PreIssueConditionCode, title: string) => {
    findings.push({
      checkType: "QUANTITY_PROVENANCE_CHECK",
      code,
      title,
      quantityCorrect: false,
      costAcceptable: false,
      constructable: false,
      carbonCompliant: false,
    });
  };
  for (const item of items) {
    const accepted = acceptGovernedQuantity(item);
    if (!accepted.ok) push("QUANTITY_PROVENANCE_MISSING", `${item.itemCode}: ${accepted.reason}`);
    if (item.quantityOrigin === "SOURCE_EXTRACTED" && !item.basis.sourceRevision) push("QUANTITY_SOURCE_REVISION_MISSING", `${item.itemCode}: source revision missing`);
    if (!item.unit) push("QUANTITY_UNIT_MISSING", `${item.itemCode}: unit missing`);
    if (item.quantityOrigin === "DETERMINISTICALLY_DERIVED" && (!item.basis.formula || !item.basis.inputRefs?.length)) {
      push("QUANTITY_DERIVATION_INCOMPLETE", `${item.itemCode}: derivation inputs incomplete`);
    }
    if (item.quantityOrigin === "ENGINEER_ENTERED_ASSUMPTION" && !item.basis.assumptions.length) {
      push("QUANTITY_ASSUMPTION_UNIDENTIFIED", `${item.itemCode}: assumption not identified`);
    }
    if (opts?.claimedMaturity === "DETAILED_MTO" && item.quantityMaturity === "CONCEPT_ALLOWANCE") {
      push("QUANTITY_MATURITY_INCOMPATIBLE", `${item.itemCode}: allowance cannot be claimed as detailed MTO`);
    }
  }
  if (opts?.costPresented && !opts.costApproved) push("COST_PRESENTED_WITHOUT_APPROVED_RATE", "Cost presented without approved rate");
  if (opts?.carbonPresented && !opts.carbonApproved) push("CARBON_PRESENTED_WITHOUT_APPROVED_FACTOR", "Carbon presented without approved factor");
  return findings;
}

export function mtoExpectedOutputsFor(disciplines: readonly string[]): ExpectedOutputType[] {
  const outputs: ExpectedOutputType[] = [];
  if (disciplines.includes("STRUCTURAL")) outputs.push("STRUCTURAL_MTO");
  if (disciplines.includes("CIVIL")) outputs.push("CIVIL_MTO");
  if (disciplines.includes("PIPING")) outputs.push("PIPING_MTO");
  if (disciplines.includes("ELECTRICAL")) outputs.push("ELECTRICAL_MTO");
  if (disciplines.filter((row) => ["PROCESS", "MECHANICAL", "STRUCTURAL", "CIVIL", "PIPING", "ELECTRICAL"].includes(row)).length >= 3) {
    outputs.push("MULTIDISCIPLINARY_MTO");
  }
  return outputs;
}

export function composeMtoAttentionGaps(input: {
  sourceRevisionChanged?: boolean;
  requiresVerification?: boolean;
  quantityBasisMissing?: boolean;
  staleAgainstSource?: boolean;
  costRequestedWithoutBasis?: boolean;
  carbonRequiredWithoutFactor?: boolean;
  carbonApplicable?: boolean;
}): Array<{ kind: "QUANTITY" | "MTO" | "COST" | "CARBON"; title: string }> {
  const gaps: Array<{ kind: "QUANTITY" | "MTO" | "COST" | "CARBON"; title: string }> = [];
  if (input.sourceRevisionChanged) gaps.push({ kind: "MTO", title: "MTO source revision changed" });
  if (input.requiresVerification) gaps.push({ kind: "MTO", title: "MTO requires verification" });
  if (input.quantityBasisMissing) gaps.push({ kind: "QUANTITY", title: "Quantity basis missing" });
  if (input.staleAgainstSource) gaps.push({ kind: "MTO", title: "MTO stale against governing source" });
  if (input.costRequestedWithoutBasis) gaps.push({ kind: "COST", title: "Cost basis missing where cost requested" });
  if (input.carbonApplicable && input.carbonRequiredWithoutFactor) gaps.push({ kind: "CARBON", title: "Carbon factor missing where required" });
  return gaps;
}

/**
 * Digital Thread mapping without a new relation taxonomy:
 * SOURCE_FOR ≡ BASED_ON (quantity_basis BASED_ON drawing/document)
 * PRODUCES ≡ USED_BY (quantity_basis USED_BY mto_item)
 * SUPERSEDES remains SUPERSEDES
 * EVIDENCES ≡ SUPPORTED_BY (option/change/artifact SUPPORTED_BY mto_snapshot)
 */
export function composeMtoThread(input: {
  source: { type: string; id: string };
  basis: { id: string };
  item: { id: string };
  snapshot: { id: string };
  priorSnapshotId?: string | null;
  evidenced?: { type: string; id: string } | null;
}): ThreadRelation[] {
  const link = (relationship: ThreadRelation["relationship"], fromType: string, fromId: string, toType: string, toId: string): ThreadRelation => ({
    fromType,
    fromId,
    relationship,
    toType,
    toId,
  });
  const rows: ThreadRelation[] = [
    link("BASED_ON", "quantity_basis", input.basis.id, input.source.type, input.source.id),
    link("USED_BY", "quantity_basis", input.basis.id, "mto_item", input.item.id),
    link("BASED_ON", "mto_snapshot", input.snapshot.id, "mto_item", input.item.id),
  ];
  if (input.priorSnapshotId) {
    rows.push(link("SUPERSEDES", "mto_snapshot", input.snapshot.id, "mto_snapshot", input.priorSnapshotId));
  }
  if (input.evidenced) {
    rows.push(link("SUPPORTED_BY", input.evidenced.type, input.evidenced.id, "mto_snapshot", input.snapshot.id));
  }
  return rows;
}

export function maturityCompatibleWithLifecycle(maturity: QuantityMaturity, stage: ValueLifecycleKey): boolean {
  const expected = LIFECYCLE_QUANTITY_EXPECTATIONS[stage].expectedMaturity;
  const order = QUANTITY_MATURITY_STATES;
  return order.indexOf(maturity) <= order.indexOf(expected) || order.indexOf(maturity) === order.indexOf(expected);
}

export type MtoAuditEvent =
  | "MTO_SNAPSHOT_CREATED"
  | "MTO_VERIFIED"
  | "MTO_REVISED"
  | "MTO_ASSUMPTION_ACCEPTED"
  | "COST_BASIS_ATTACHED"
  | "CARBON_FACTOR_ATTACHED";

export function mtoAuditRecord(event: MtoAuditEvent, actorId: string, objectId: string) {
  return {
    event,
    actorId,
    objectId,
    surveillance: false as const,
    employeeMonitoring: false as const,
  };
}

export function verifyExtractedItem(item: QuantityItem, verifiedBy: string, at: string): QuantityItem {
  if (item.quantityOrigin === "MISSING") return item;
  return {
    ...item,
    verificationStatus: "ENGINEER_ACCEPTED",
    verifiedBy,
    verifiedAt: at,
  };
}
