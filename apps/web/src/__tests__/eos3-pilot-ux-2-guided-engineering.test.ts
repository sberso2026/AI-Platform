import { describe, expect, it, beforeEach } from "vitest";
import {
  __resetProjectWorkspacesForTests,
  findByStableId,
  snapshotProjectWorkspace,
} from "../lib/engineering/eos3-project-workspace-service";
import {
  acceptGuidedProposal,
  bulkAcceptSafeProposals,
  buildSimplifiedGateReadiness,
  captureNaturalEngineeringChange,
  EOS_DEFAULT_USER_MODE,
  generateGuidedProjectState,
  measureTimeToFirstValue,
} from "../lib/engineering/eos3-guided-engineering";
import {
  EOS_FIELD_NECESSITY_AUDIT,
  requiredHumanInputFields,
  unjustifiedRequiredFieldCount,
} from "../lib/engineering/eos3-field-necessity-audit";
import { embeddingsAreGraphAuthority } from "../lib/engineering/eos3-digital-thread";

const PROJECT_ID = "pilot-ux-2-guided";

describe("EOS-3-PILOT-UX-2 guided engineering / minimum viable input", () => {
  beforeEach(() => {
    __resetProjectWorkspacesForTests();
  });

  it("defaults to Guided Engineering mode", () => {
    expect(EOS_DEFAULT_USER_MODE).toBe("GUIDED_ENGINEERING");
  });

  it("starts from <=3 meaningful required inputs and generate-first", () => {
    const t0 = performance.now();
    const result = generateGuidedProjectState(PROJECT_ID, {
      objective:
        "Install a new 12 t process equipment module on an existing steel-framed platform while minimising operational disruption.",
      ownerId: "engineer-1",
      ownerName: "Pilot Engineer",
      documentNames: ["scope-brief.pdf"],
    });
    const wall = performance.now() - t0;

    expect(result.initialRequiredInputCount).toBeLessThanOrEqual(3);
    expect(result.initialRequiredInputCount).toBeLessThanOrEqual(5);
    expect(result.proposals.length).toBeGreaterThan(5);
    expect(findByStableId(PROJECT_ID, "EB-001")?.payload.approvalState).toBe("NOT_APPROVED");
    expect(findByStableId(PROJECT_ID, "REQ-001")?.payload.status).toBe("PROPOSED");
    // Mass only because literally present in objective
    expect(findByStableId(PROJECT_ID, "ASM-001")?.payload.equipmentMass).toBe("12 t");
    expect(findByStableId(PROJECT_ID, "ASM-001")?.payload.sourcedFrom).toBe(
      "current-project-objective",
    );
    expect(result.duplicateInputRequestCount).toBe(0);
    expect(result.manualInputReductionPercent).toBeGreaterThanOrEqual(70);
    // HOTFIX-1: no premature structural solution options / calc / decision
    expect(result.options).toHaveLength(0);
    expect(findByStableId(PROJECT_ID, "CALC-001")).toBeFalsy();
    expect(findByStableId(PROJECT_ID, "DEC-001")).toBeFalsy();
    expect(wall).toBeLessThan(5 * 60 * 1000);
    expect(measureTimeToFirstValue(result)).toMatch(/s|m/);
    expect(embeddingsAreGraphAuthority()).toBe(false);
  });

  it("never auto-approves generated engineering content", () => {
    generateGuidedProjectState(PROJECT_ID, {
      objective: "Install a new 12 t process equipment module on an existing steel-framed platform.",
      ownerId: "e1",
    });
    for (const id of ["EB-001", "REQ-001", "ASM-001", "REV-001"]) {
      const obj = findByStableId(PROJECT_ID, id)!;
      expect(
        obj.payload.approvalState === "NOT_APPROVED" ||
          obj.payload.aiMayApprove === false ||
          obj.payload.status === "PROPOSED",
      ).toBe(true);
      expect(obj.payload.aiIsAuthority).not.toBe(true);
    }
  });

  it("assembles G0 readiness without manual multi-register entry", () => {
    generateGuidedProjectState(PROJECT_ID, {
      objective: "Install a new 12 t process equipment module on an existing steel-framed platform.",
      ownerId: "e1",
    });
    const gate = buildSimplifiedGateReadiness(PROJECT_ID);
    expect(gate.gateKey).toBe("G0");
    expect(gate.completed.length).toBeGreaterThan(0);
    expect(gate.primaryActionLabel).toBe("Review readiness");
    expect(gate.advancedHrefSlug).toBe("lifecycle");
    expect(gate.evaluation).toBeTruthy();
    expect(gate.readinessExplainable).toBe(true);
  });

  it("captures natural mass change and maintains relationships", () => {
    generateGuidedProjectState(PROJECT_ID, {
      objective: "Install a new 12 t process equipment module on an existing steel-framed platform.",
      ownerId: "e1",
    });
    const change = captureNaturalEngineeringChange(
      PROJECT_ID,
      "Vendor increased equipment mass from 12 t to 15 t.",
      "e1",
    );
    expect(change.changeStableId).toBe("CHG-001");
    expect(change.affected.length).toBeGreaterThanOrEqual(1);
    expect(change.provenance.humanConfirmationStatus).toBe("PENDING");
    expect(findByStableId(PROJECT_ID, "ASM-001")?.payload.equipmentMass).toBe("15 t");
    const snap = snapshotProjectWorkspace(PROJECT_ID);
    expect(snap.relationships.some((r) => r.relationshipType === "CHANGE_AFFECTS_OBJECT")).toBe(
      true,
    );
  });

  it("safe bulk acceptance skips material engineering items", () => {
    const result = generateGuidedProjectState(PROJECT_ID, {
      objective: "Install a new 12 t process equipment module on an existing steel-framed platform.",
      ownerId: "e1",
    });
    const { accepted, skipped } = bulkAcceptSafeProposals(PROJECT_ID, result.proposals, "e1");
    expect(
      skipped.some((id) => id === "ASM-001" || id.startsWith("ASM") || id === "RISK-001"),
    ).toBe(true);
    for (const id of accepted) {
      const p = result.proposals.find((x) => x.stableObjectId === id);
      expect(p?.bulkSafe).toBe(true);
      expect(p?.provenance.materiality).not.toBe("HIGH");
    }
    acceptGuidedProposal(PROJECT_ID, "REQ-001", "CONFIRMED", "e1");
    expect(findByStableId(PROJECT_ID, "REQ-001")?.payload.approvalState).toBe("NOT_APPROVED");
  });

  it("completes field necessity audit with zero unjustified required fields", () => {
    expect(EOS_FIELD_NECESSITY_AUDIT.length).toBeGreaterThan(10);
    expect(unjustifiedRequiredFieldCount()).toBe(0);
    const required = requiredHumanInputFields();
    expect(required.every((r) => r.justification.length >= 8)).toBe(true);
    expect(required.some((r) => r.field === "objective")).toBe(true);
  });

  it("exposes tasks and next-best actions under 3 interaction estimate", () => {
    const result = generateGuidedProjectState(PROJECT_ID, {
      objective: "Install a new 12 t process equipment module on an existing steel-framed platform.",
      ownerId: "e1",
    });
    expect(result.tasks.length).toBeGreaterThan(5);
    expect(result.tasks.every((t) => t.interactionsEstimate <= 3)).toBe(true);
    expect(result.nextActions.length).toBeGreaterThan(0);
    expect(result.tasks.every((t) => !/12 t → 15 t|PILOT-001/i.test(t.description))).toBe(true);
  });
});
