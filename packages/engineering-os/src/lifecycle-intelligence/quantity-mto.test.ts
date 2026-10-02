import { describe, expect, it } from "vitest";
import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "./fixture";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import { A11E_PROJECT_B } from "../change-workbench/fixture";
import { IMPACT_VALUE_DIMENSIONS, resolveProjectValuePolicy, valuePolicyForProject } from "./cross-lifecycle-value";
import { ENGINEERING_WORK_TEMPLATES } from "../work-generator/catalog";
import { hostedMalwareScannerAvailable, MALWARE_SCAN_STATUS, scanReturnedBytes } from "../tool-orchestration/return-validation";
import { exportMtoWorkbook } from "./quantity-mto-export";
import { crusherMtoDemonstrator } from "./quantity-mto-demonstrator";
import {
  A15A_V2_FEATURE_FREEZE,
  AI_QUANTITY_POLICY,
  QUANTITY_MATURITY_STATES,
  QUANTITY_ORIGIN_TYPES,
  QUANTITY_SEMANTICS,
  acceptGovernedQuantity,
  assertMtoProjectScope,
  compareMtoSnapshots,
  composeMtoAttentionGaps,
  constructabilityEvidenceFromMto,
  convertQuantity,
  deriveCarbon,
  deriveCost,
  deriveSteelMassTonnes,
  fingerprintItems,
  issueMtoSnapshot,
  mtoExpectedOutputsFor,
  reviewMtoProvenance,
  sumQuantities,
  type QuantityBasis,
  type QuantityItem,
} from "./quantity-mto";

const SCOPE = {
  tenantId: CRUSHER_FEED_TENANT,
  workspaceId: CRUSHER_FEED_WORKSPACE,
  projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
};

function basis(overrides: Partial<QuantityBasis> & Pick<QuantityBasis, "id" | "sourceType">): QuantityBasis {
  return {
    sourceRef: "DOC-1",
    sourceRevision: "A",
    measurementMethod: "take-off",
    derivationMethod: null,
    formula: null,
    assumptions: [],
    exclusions: [],
    extractionRecordId: "ext-1",
    inputRefs: [],
    createdAt: "2026-10-02T00:00:00.000Z",
    createdBy: "cert-er-a1@rtb-cert.test",
    ...overrides,
  };
}

function sampleItem(overrides: Partial<QuantityItem> = {}): QuantityItem {
  return {
    ...SCOPE,
    id: "q1",
    itemCode: "ST-1",
    description: "Member",
    discipline: "STRUCTURAL",
    category: "structural steel members",
    material: "Steel",
    grade: "300PLUS",
    specification: null,
    quantity: 10,
    unit: "t",
    quantityOrigin: "SOURCE_EXTRACTED",
    quantityMaturity: "FEED_MTO",
    verificationStatus: "UNVERIFIED",
    lifecycleStage: "FEED",
    status: "ACTIVE",
    semantics: "bulk_mto",
    basis: basis({ id: "b1", sourceType: "SOURCE_EXTRACTED" }),
    ...overrides,
  };
}

describe("EOS-A15A-V2 quantity basis and multidisciplinary MTO", () => {
  it("does not create a new intelligence domain and keeps MTO-first terminology distinct", () => {
    expect(A15A_V2_FEATURE_FREEZE.newMtoIntelligenceDomain).toBe(false);
    expect(A15A_V2_FEATURE_FREEZE.newCostIntelligenceDomain).toBe(false);
    expect(A15A_V2_FEATURE_FREEZE.scannerV2).toBe(false);
    expect(QUANTITY_SEMANTICS.BOQ).toMatch(/not automatically synonymous/i);
    expect(QUANTITY_SEMANTICS.EQUIPMENT_SCHEDULE).toMatch(/not automatically identical/i);
    expect(QUANTITY_ORIGIN_TYPES).toEqual(expect.arrayContaining(["SOURCE_MEASURED", "MISSING"]));
    expect(QUANTITY_MATURITY_STATES).toContain("FEED_MTO");
  });

  it("fail-closes missing quantity basis instead of inventing a value", () => {
    const missing = acceptGovernedQuantity(sampleItem({ quantity: null, quantityOrigin: "MISSING", basis: basis({ id: "b-miss", sourceType: "MISSING", sourceRef: null }) }));
    expect(missing).toMatchObject({ ok: false, code: "QUANTITY_NOT_AVAILABLE" });
    expect(AI_QUANTITY_POLICY.mayInventMissingQuantity).toBe(false);
    const extracted = acceptGovernedQuantity(sampleItem({ basis: basis({ id: "b-bad", sourceType: "SOURCE_EXTRACTED", sourceRevision: null }) }));
    expect(extracted.ok).toBe(false);
  });

  it("derives steel mass only from length × published section mass", () => {
    const derived = deriveSteelMassTonnes({ lengthM: 12, unitMassKgPerM: 40.4, unitMassSourceRef: "ASI UB table" });
    expect(derived.ok).toBe(true);
    if (derived.ok) expect(derived.quantity).toBeCloseTo(0.4848, 4);
    expect(deriveSteelMassTonnes({ lengthM: 12, unitMassKgPerM: null, unitMassSourceRef: null }).ok).toBe(false);
  });

  it("records unit conversion and refuses silent incompatible conversion", () => {
    const mass = convertQuantity(2500, "kg", "t");
    expect(mass.ok).toBe(true);
    if (mass.ok) {
      expect(mass.value).toBe(2.5);
      expect(mass.conversionRecorded).toBe(true);
    }
    expect(convertQuantity(12, "m", "t").ok).toBe(false);
  });

  it("compares MTO revisions without inferring cost", () => {
    const a = issueMtoSnapshot({
      id: "s-a",
      scope: SCOPE,
      revision: "A",
      disciplineScope: "STRUCTURAL",
      lifecycleStage: "FEED",
      generatedBy: "cert-er-a1@rtb-cert.test",
      items: [sampleItem({ quantity: 10 }), sampleItem({ id: "q2", itemCode: "ST-2", quantity: 4, category: "concrete", unit: "m3" })],
    });
    const b = issueMtoSnapshot({
      id: "s-b",
      scope: SCOPE,
      revision: "B",
      disciplineScope: "STRUCTURAL",
      lifecycleStage: "FEED",
      generatedBy: "cert-er-a1@rtb-cert.test",
      items: [sampleItem({ quantity: 12 }), sampleItem({ id: "q3", itemCode: "ST-3", quantity: 1, category: "bolts", unit: "ea" })],
      supersedesSnapshotId: a.id,
    });
    expect(b.fingerprint).not.toBe(a.fingerprint);
    const deltas = compareMtoSnapshots(a, b);
    expect(deltas.find((row) => row.itemCode === "ST-1")?.kind).toBe("INCREASED");
    expect(deltas.find((row) => row.itemCode === "ST-2")?.kind).toBe("REMOVED");
    expect(deltas.find((row) => row.itemCode === "ST-3")?.kind).toBe("ADDED");
  });

  it("scopes disciplines and does not require MTO on every work plan", () => {
    expect(mtoExpectedOutputsFor(["STRUCTURAL"])).toEqual(["STRUCTURAL_MTO"]);
    expect(mtoExpectedOutputsFor(["PROCESS"])).toEqual([]);
    expect(ENGINEERING_WORK_TEMPLATES.find((row) => row.code === "EWT-DESIGN-REPORT")?.expectedOutputs).not.toContain("STRUCTURAL_MTO");
    expect(ENGINEERING_WORK_TEMPLATES.find((row) => row.code === "EWT-FEED-STRUCT")?.expectedOutputs).toContain("STRUCTURAL_MTO");
  });

  it("denies cross-project MTO attachment", () => {
    const snap = issueMtoSnapshot({
      id: "s-iso",
      scope: SCOPE,
      revision: "A",
      disciplineScope: "STRUCTURAL",
      lifecycleStage: "FEED",
      generatedBy: "cert-er-a1@rtb-cert.test",
      items: [sampleItem()],
    });
    expect(assertMtoProjectScope(snap, { ...SCOPE, projectId: A11E_PROJECT_B })).toBe("CROSS_PROJECT_MISMATCH");
    expect(assertMtoProjectScope(snap, { ...SCOPE, tenantId: "other-tenant" })).toBe("CROSS_TENANT");
  });

  it("requires approved rates and factors and keeps constructability evidence-based", () => {
    const qty = acceptGovernedQuantity(sampleItem());
    expect(deriveCost(qty, null).state).toBe("COST_NOT_CALCULATED");
    expect(deriveCost(qty, {
      rateValue: 10,
      rateUnit: "AUD/t",
      currency: "AUD",
      baseDate: "2026-01-01",
      source: "register",
      sourceRevision: "1",
      locationApplicability: "demo",
      approvalStatus: "UNVERIFIED",
    }).state).toBe("COST_NOT_CALCULATED");
    const policyNa = resolveProjectValuePolicy();
    expect(deriveCarbon({ policy: policyNa, quantity: qty, factor: null }).state).toBe("CARBON_NOT_APPLICABLE");
    const required = valuePolicyForProject(CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(deriveCarbon({ policy: required, quantity: qty, factor: null }).state).toBe("CARBON_NOT_CALCULATED");
    expect(deriveCarbon({
      policy: required,
      quantity: qty,
      factor: {
        source: "ISF",
        version: "1",
        date: "2025-01-01",
        unit: "tCO2e/t",
        geography: "AU",
        materialOrProcess: "steel",
        systemBoundary: "A1-A3",
        applicability: "FEED steel",
        factor: 1.5,
      },
    }).state).toBe("DERIVED");
    expect(constructabilityEvidenceFromMto([sampleItem({ totalMass: 6, quantity: 1, category: "structural steel members" })]).opaqueScore).toBeNull();
  });

  it("lets Pre-Issue check provenance without deciding technical correctness", () => {
    const findings = reviewMtoProvenance([
      sampleItem({ quantity: null, quantityOrigin: "MISSING", basis: basis({ id: "bx", sourceType: "MISSING", sourceRef: null }) }),
    ], { costPresented: true, costApproved: false, claimedMaturity: "DETAILED_MTO" });
    expect(findings.some((row) => row.code === "QUANTITY_PROVENANCE_MISSING")).toBe(true);
    expect(findings.some((row) => row.code === "COST_PRESENTED_WITHOUT_APPROVED_RATE")).toBe(true);
    expect(findings.every((row) => row.quantityCorrect === false && row.costAcceptable === false)).toBe(true);
  });

  it("composes Digital Thread with existing relation codes and Attention quantity gaps", () => {
    const demo = crusherMtoDemonstrator();
    expect(demo.thread.some((row) => row.relationship === "BASED_ON")).toBe(true);
    expect(demo.thread.some((row) => row.relationship === "SUPERSEDES")).toBe(true);
    expect(demo.thread.some((row) => row.relationship === "SUPPORTED_BY")).toBe(true);
    const gaps = composeMtoAttentionGaps({
      sourceRevisionChanged: true,
      quantityBasisMissing: true,
      carbonApplicable: false,
      carbonRequiredWithoutFactor: true,
    });
    expect(gaps.map((row) => row.kind)).toEqual(["MTO", "QUANTITY"]);
    expect(IMPACT_VALUE_DIMENSIONS).toContain("QUANTITY");
  });

  it("runs the Crusher demonstrator with deterministic deltas and fail-closed cost/carbon", () => {
    const demo = crusherMtoDemonstrator();
    expect(demo.assignedDisciplines).toEqual(expect.arrayContaining(["STRUCTURAL", "CIVIL", "MECHANICAL", "PIPING", "ELECTRICAL"]));
    const steel = demo.deltas.find((row) => row.itemCode === "ST-STEEL-UB");
    const conc = demo.deltas.find((row) => row.itemCode === "ST-CONC-FDN");
    const bolts = demo.deltas.find((row) => row.itemCode === "ST-AB-M36");
    expect(steel?.delta).toBeCloseTo(18.4, 1);
    expect(conc?.delta).toBe(96);
    expect(bolts?.delta).toBe(16);
    expect(demo.impacts.some((row) => row.dimension === "QUANTITY" && row.status === "POTENTIAL")).toBe(true);
    expect(demo.steelCost.state).toBe("DERIVED");
    expect(demo.cableCost.state).toBe("COST_NOT_CALCULATED");
    expect(demo.steelCarbon.state).toBe("DERIVED");
    expect(demo.cableCarbon.state).toBe("CARBON_NOT_CALCULATED");
    expect(demo.revB.supersedesSnapshotId).toBe(demo.revA.id);
    expect(demo.revA.status).not.toBe("SUPERSEDED");
  });

  it("exports governed XLSX without inventing a cost sheet when no rates exist", async () => {
    const demo = crusherMtoDemonstrator();
    const empty = await exportMtoWorkbook({ snapshot: demo.revB, policy: demo.policy, deltas: demo.deltas });
    expect(empty.sheets).toEqual(expect.arrayContaining([
      "01_Summary", "05_Structural", "06_Civil", "03_Mechanical", "04_Piping", "08_Electrical", "11_Assumptions", "12_Source_Register", "13_Revision_Changes",
    ]));
    expect(empty.costSheet).toBe(false);
    const withCost = await exportMtoWorkbook({
      snapshot: demo.revB,
      policy: demo.policy,
      deltas: demo.deltas,
      ratesByItemCode: { "ST-STEEL-UB": demo.steelCost.state === "DERIVED" ? demo.steelCost.rate : null, "EL-CABLE-PWR": null },
      factorsByItemCode: { "ST-STEEL-UB": demo.steelCarbon.state === "DERIVED" ? {
        source: "ISF steel embodied-carbon register",
        version: "2025.2",
        date: "2025-06-01",
        unit: "tCO2e/t",
        geography: "AU",
        materialOrProcess: "structural steel sections",
        systemBoundary: "A1-A3",
        applicability: "FEED structural steel",
        factor: 1.8,
      } : null, "EL-CABLE-PWR": null },
    });
    expect(withCost.costSheet).toBe(true);
    expect(withCost.carbonSheet).toBe(true);
    expect(withCost.buffer.length).toBeGreaterThan(1000);
  });

  it("aggregates practical MTO sizes without premature optimization", () => {
    const sizes = [100, 1000, 5000];
    const timings: Record<number, number> = {};
    for (const size of sizes) {
      const items = Array.from({ length: size }, (_, i) => sampleItem({ id: `n${i}`, itemCode: `IT-${i}`, quantity: i % 7 }));
      const started = Date.now();
      const snapA = issueMtoSnapshot({ id: `a-${size}`, scope: SCOPE, revision: "A", disciplineScope: "MULTIDISCIPLINARY", lifecycleStage: "FEED", generatedBy: "perf", items });
      const snapB = issueMtoSnapshot({
        id: `b-${size}`,
        scope: SCOPE,
        revision: "B",
        disciplineScope: "MULTIDISCIPLINARY",
        lifecycleStage: "FEED",
        generatedBy: "perf",
        items: items.map((row, i) => i === 0 ? { ...row, quantity: (row.quantity ?? 0) + 1 } : row),
      });
      compareMtoSnapshots(snapA, snapB);
      sumQuantities(items.map((row) => row.quantity));
      fingerprintItems(items);
      timings[size] = Date.now() - started;
      expect(snapA.itemCount).toBe(size);
    }
    expect(timings[5000]).toBeLessThan(5000);
  });

  it("preserves malware deferment fail-closed behavior", async () => {
    expect(hostedMalwareScannerAvailable({} as NodeJS.ProcessEnv)).toBe(false);
    if (!process.env.RTB_REVIEW_CLAMAV_URL?.trim()) {
      expect(MALWARE_SCAN_STATUS).toBe("UNAVAILABLE_HOSTED_CLAMAV");
      const scan = await scanReturnedBytes(Buffer.from("controlled-clean"), false, {} as NodeJS.ProcessEnv);
      expect(scan.state).toBe("SCANNER_UNAVAILABLE");
    }
  });
});
