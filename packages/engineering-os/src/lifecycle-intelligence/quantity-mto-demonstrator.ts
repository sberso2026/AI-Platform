import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "./fixture";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import { A11A_SYSTEM_ID } from "../work-generator/fixture";
import { valuePolicyForProject } from "./cross-lifecycle-value";
import {
  compareMtoSnapshots,
  composeMtoChangeImpacts,
  composeMtoThread,
  constructabilityEvidenceFromMto,
  deriveCarbon,
  deriveCost,
  deriveSteelMassTonnes,
  issueMtoSnapshot,
  verifyExtractedItem,
  type ApprovedEmissionFactor,
  type ApprovedRate,
  type QuantityBasis,
  type QuantityItem,
} from "./quantity-mto";

const SCOPE = {
  tenantId: CRUSHER_FEED_TENANT,
  workspaceId: CRUSHER_FEED_WORKSPACE,
  projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
  systemId: A11A_SYSTEM_ID,
  assetId: null as string | null,
};

function basis(partial: Partial<QuantityBasis> & Pick<QuantityBasis, "id" | "sourceType">): QuantityBasis {
  return {
    sourceRef: null,
    sourceRevision: null,
    measurementMethod: null,
    derivationMethod: null,
    formula: null,
    assumptions: [],
    exclusions: [],
    extractionRecordId: null,
    inputRefs: [],
    createdAt: "2026-10-02T00:00:00.000Z",
    createdBy: "cert-er-a1@rtb-cert.test",
    ...partial,
  };
}

function item(partial: QuantityItem): QuantityItem {
  return partial;
}

const SECTION_MASS_SOURCE = "ASI UB 310x165x40 published unit mass 40.4 kg/m";

export function crusherMtoRevAItems(): QuantityItem[] {
  const steelMass = deriveSteelMassTonnes({ lengthM: 2475.2475, unitMassKgPerM: 40.4, unitMassSourceRef: SECTION_MASS_SOURCE });
  const steelQty = steelMass.ok ? steelMass.quantity : null;
  return [
    item({
      ...SCOPE,
      id: "mto-st-steel",
      itemCode: "ST-STEEL-UB",
      description: "UB 310x165x40 crusher support members",
      discipline: "STRUCTURAL",
      category: "structural steel members",
      material: "Steel",
      grade: "300PLUS",
      specification: "AS/NZS 3679.1",
      quantity: steelQty,
      unit: "t",
      quantityOrigin: "DETERMINISTICALLY_DERIVED",
      quantityMaturity: "FEED_MTO",
      verificationStatus: "UNVERIFIED",
      lifecycleStage: "FEED",
      status: "ACTIVE",
      semantics: "bulk_mto",
      section: "310UB40.4",
      length: 2475.2475,
      unitMass: 40.4,
      totalMass: steelQty,
      basis: basis({
        id: "qb-st-steel",
        sourceType: "DETERMINISTICALLY_DERIVED",
        sourceRef: "S-CRU-ST-001",
        sourceRevision: "A",
        derivationMethod: "member length × published section mass",
        formula: "length_m * unit_mass_kg_per_m / 1000",
        inputRefs: ["len-st-steel", "mass-310UB40"],
      }),
    }),
    item({
      ...SCOPE,
      id: "mto-st-conc",
      itemCode: "ST-CONC-FDN",
      description: "Crusher support footing concrete",
      discipline: "STRUCTURAL",
      category: "concrete",
      material: "Concrete",
      grade: "32 MPa",
      specification: "AS 3600",
      quantity: 400,
      unit: "m3",
      quantityOrigin: "SOURCE_EXTRACTED",
      quantityMaturity: "FEED_MTO",
      verificationStatus: "UNVERIFIED",
      lifecycleStage: "FEED",
      status: "ACTIVE",
      semantics: "bulk_mto",
      volume: 400,
      basis: basis({
        id: "qb-st-conc",
        sourceType: "SOURCE_EXTRACTED",
        sourceRef: "S-CRU-ST-002",
        sourceRevision: "A",
        extractionRecordId: "ext-conc-a",
        measurementMethod: "footing take-off from governed drawing",
      }),
    }),
    item({
      ...SCOPE,
      id: "mto-st-ab",
      itemCode: "ST-AB-M36",
      description: "M36 anchor bolts",
      discipline: "STRUCTURAL",
      category: "anchor bolts",
      material: "Steel",
      grade: "8.8",
      specification: "AS 1252",
      quantity: 80,
      unit: "ea",
      quantityOrigin: "SOURCE_EXTRACTED",
      quantityMaturity: "FEED_MTO",
      verificationStatus: "UNVERIFIED",
      lifecycleStage: "FEED",
      status: "ACTIVE",
      semantics: "bulk_mto",
      count: 80,
      basis: basis({
        id: "qb-st-ab",
        sourceType: "SOURCE_EXTRACTED",
        sourceRef: "S-CRU-ST-003",
        sourceRevision: "A",
        extractionRecordId: "ext-ab-a",
      }),
    }),
    item({
      ...SCOPE,
      id: "mto-cv-cut",
      itemCode: "CV-CUT",
      description: "Platform cut",
      discipline: "CIVIL",
      category: "cut",
      material: "In-situ soil",
      grade: null,
      specification: null,
      quantity: 1200,
      unit: "m3",
      quantityOrigin: "SOURCE_EXTRACTED",
      quantityMaturity: "FEED_MTO",
      verificationStatus: "UNVERIFIED",
      lifecycleStage: "FEED",
      status: "ACTIVE",
      semantics: "bulk_mto",
      volume: 1200,
      basis: basis({
        id: "qb-cv-cut",
        sourceType: "SOURCE_EXTRACTED",
        sourceRef: "C-CRU-CV-001",
        sourceRevision: "A",
        extractionRecordId: "ext-cut-a",
      }),
    }),
    item({
      ...SCOPE,
      id: "mto-cv-exc",
      itemCode: "CV-EXC",
      description: "Foundation excavation",
      discipline: "CIVIL",
      category: "excavation",
      material: null,
      grade: null,
      specification: null,
      quantity: 850,
      unit: "m3",
      quantityOrigin: "SOURCE_MEASURED",
      quantityMaturity: "FEED_MTO",
      verificationStatus: "UNVERIFIED",
      lifecycleStage: "FEED",
      status: "ACTIVE",
      semantics: "bulk_mto",
      basis: basis({
        id: "qb-cv-exc",
        sourceType: "SOURCE_MEASURED",
        sourceRef: "survey-cru-a",
        sourceRevision: "A",
        measurementMethod: "governed survey DTM",
      }),
    }),
    item({
      ...SCOPE,
      id: "mto-me-cru",
      itemCode: "ME-CRU-01",
      description: "Primary crusher",
      discipline: "MECHANICAL",
      category: "tagged equipment",
      material: null,
      grade: null,
      specification: "Vendor data sheet CRU-01",
      tag: "CRU-01",
      quantity: 1,
      unit: "ea",
      quantityOrigin: "SOURCE_EXTRACTED",
      quantityMaturity: "FEED_MTO",
      verificationStatus: "UNVERIFIED",
      lifecycleStage: "FEED",
      status: "ACTIVE",
      semantics: "equipment_schedule",
      basis: basis({
        id: "qb-me-cru",
        sourceType: "SOURCE_EXTRACTED",
        sourceRef: "EQ-CRU-01",
        sourceRevision: "A",
        extractionRecordId: "ext-eq-a",
      }),
    }),
    item({
      ...SCOPE,
      id: "mto-pi-slurry",
      itemCode: "PI-DN150-CS",
      description: "DN150 slurry pipe",
      discipline: "PIPING",
      category: "pipe length",
      material: "Carbon steel",
      grade: "AS 1579",
      specification: "CL150",
      quantity: 86,
      unit: "m",
      quantityOrigin: "SOURCE_EXTRACTED",
      quantityMaturity: "FEED_MTO",
      verificationStatus: "UNVERIFIED",
      lifecycleStage: "FEED",
      status: "ACTIVE",
      semantics: "bulk_mto",
      length: 86,
      basis: basis({
        id: "qb-pi-slurry",
        sourceType: "SOURCE_EXTRACTED",
        sourceRef: "P-CRU-LINE-150",
        sourceRevision: "A",
        extractionRecordId: "ext-line-a",
      }),
    }),
    item({
      ...SCOPE,
      id: "mto-el-cable",
      itemCode: "EL-CABLE-PWR",
      description: "Power cable crusher MCC",
      discipline: "ELECTRICAL",
      category: "power cable",
      material: "Cu",
      grade: null,
      specification: "0.6/1 kV",
      quantity: 240,
      unit: "m",
      quantityOrigin: "ENGINEER_ENTERED_ASSUMPTION",
      quantityMaturity: "PARAMETRIC_QUANTITY",
      verificationStatus: "UNVERIFIED",
      lifecycleStage: "FEED",
      status: "ACTIVE",
      semantics: "bulk_mto",
      basis: basis({
        id: "qb-el-cable",
        sourceType: "ENGINEER_ENTERED_ASSUMPTION",
        sourceRef: "E-CRU-SLD-01",
        sourceRevision: "A",
        assumptions: ["Cable length allowance pending tray routing drawing"],
      }),
    }),
    item({
      ...SCOPE,
      id: "mto-gt-pile",
      itemCode: "GT-PILE",
      description: "Bored piles",
      discipline: "GEOTECHNICAL",
      category: "piles",
      material: "Concrete",
      grade: "32 MPa",
      specification: null,
      quantity: 24,
      unit: "ea",
      quantityOrigin: "SOURCE_EXTRACTED",
      quantityMaturity: "FEED_MTO",
      verificationStatus: "UNVERIFIED",
      lifecycleStage: "FEED",
      status: "ACTIVE",
      semantics: "bulk_mto",
      basis: basis({
        id: "qb-gt-pile",
        sourceType: "SOURCE_EXTRACTED",
        sourceRef: "G-CRU-PILE-01",
        sourceRevision: "A",
        extractionRecordId: "ext-pile-a",
      }),
    }),
  ];
}

export function crusherMtoRevBItems(): QuantityItem[] {
  const steelMass = deriveSteelMassTonnes({ lengthM: 2930.693, unitMassKgPerM: 40.4, unitMassSourceRef: SECTION_MASS_SOURCE });
  return crusherMtoRevAItems().map((row) => {
    if (row.itemCode === "ST-STEEL-UB") {
      return {
        ...row,
        quantity: steelMass.ok ? steelMass.quantity : null,
        length: 2930.693,
        totalMass: steelMass.ok ? steelMass.quantity : null,
        basis: { ...row.basis, sourceRevision: "B", inputRefs: ["len-st-steel-b", "mass-310UB40"] },
      };
    }
    if (row.itemCode === "ST-CONC-FDN") {
      return { ...row, quantity: 496, volume: 496, basis: { ...row.basis, sourceRevision: "B", extractionRecordId: "ext-conc-b" } };
    }
    if (row.itemCode === "ST-AB-M36") {
      return { ...row, quantity: 96, count: 96, basis: { ...row.basis, sourceRevision: "B", extractionRecordId: "ext-ab-b" } };
    }
    return { ...row, basis: { ...row.basis, sourceRevision: row.basis.sourceRevision === "A" ? "A" : row.basis.sourceRevision } };
  });
}

export const CRUSHER_APPROVED_STEEL_RATE: ApprovedRate = {
  rateValue: 4200,
  rateUnit: "AUD/t",
  currency: "AUD",
  baseDate: "2026-01-15",
  source: "Company approved structural steel rate register",
  sourceRevision: "R4",
  locationApplicability: "Pilbara staging demonstration",
  approvalStatus: "COMPANY_APPROVED_RATE",
};

export const CRUSHER_STEEL_FACTOR: ApprovedEmissionFactor = {
  source: "ISF steel embodied-carbon register",
  version: "2025.2",
  date: "2025-06-01",
  unit: "tCO2e/t",
  geography: "AU",
  materialOrProcess: "structural steel sections",
  systemBoundary: "A1-A3",
  applicability: "FEED structural steel",
  factor: 1.8,
};

export function crusherMtoDemonstrator() {
  const policy = valuePolicyForProject(CRUSHER_EXPANSION_FEED_PROJECT_ID);
  const revA = issueMtoSnapshot({
    id: "mto-cru-a",
    scope: SCOPE,
    revision: "A",
    disciplineScope: "MULTIDISCIPLINARY",
    lifecycleStage: "FEED",
    generatedBy: "cert-er-a1@rtb-cert.test",
    generatedAt: "2026-10-02T01:00:00.000Z",
    items: crusherMtoRevAItems(),
  });
  const verifiedItems = crusherMtoRevBItems().map((row) => verifyExtractedItem(row, "cert-er-a1@rtb-cert.test", "2026-10-02T02:00:00.000Z"));
  const revB = issueMtoSnapshot({
    id: "mto-cru-b",
    scope: SCOPE,
    revision: "B",
    disciplineScope: "MULTIDISCIPLINARY",
    lifecycleStage: "FEED",
    generatedBy: "cert-er-a1@rtb-cert.test",
    generatedAt: "2026-10-02T02:00:00.000Z",
    items: verifiedItems,
    supersedesSnapshotId: revA.id,
    status: "ISSUED_FOR_ENGINEERING",
    verificationState: "ENGINEER_ACCEPTED",
  });
  const deltas = compareMtoSnapshots(revA, revB);
  const steel = verifiedItems.find((row) => row.itemCode === "ST-STEEL-UB")!;
  const cable = verifiedItems.find((row) => row.itemCode === "EL-CABLE-PWR")!;
  const steelQty = { ok: true as const, quantity: steel.quantity as number, origin: steel.quantityOrigin };
  const cableQty = { ok: true as const, quantity: cable.quantity as number, origin: cable.quantityOrigin };
  return {
    policy,
    classification: "SYNTHETIC_DEMONSTRATION_DATA" as const,
    assignedDisciplines: ["STRUCTURAL", "CIVIL", "MECHANICAL", "PIPING", "ELECTRICAL", "GEOTECHNICAL"] as const,
    revA,
    revB,
    deltas,
    impacts: composeMtoChangeImpacts({
      deltas,
      objectType: "change",
      objectId: "chg-cru-support-revb",
      policy,
      costCalculated: true,
      carbonCalculated: true,
    }),
    constructability: constructabilityEvidenceFromMto(verifiedItems),
    steelCost: deriveCost(steelQty, CRUSHER_APPROVED_STEEL_RATE),
    cableCost: deriveCost(cableQty, null),
    steelCarbon: deriveCarbon({ policy, quantity: steelQty, factor: CRUSHER_STEEL_FACTOR }),
    cableCarbon: deriveCarbon({ policy, quantity: cableQty, factor: null }),
    thread: composeMtoThread({
      source: { type: "document", id: "S-CRU-ST-001" },
      basis: { id: "qb-st-steel" },
      item: { id: "mto-st-steel" },
      snapshot: { id: revB.id },
      priorSnapshotId: revA.id,
      evidenced: { type: "change", id: "chg-cru-support-revb" },
    }),
  };
}
