import { describe, expect, it } from "vitest";
import { assertControlEffectivenessAllowed, computeResidual, controlReducesResidual } from "./residual";

describe("BOS-9 inherent vs residual risk", () => {
  it("does not reduce residual merely because a control record exists", () => {
    const residual = computeResidual("extreme", [
      {
        status: "planned",
        effectiveness: "untested",
        evidenceRefs: [],
      },
    ]);
    expect(residual.residualLevel).toBe("extreme");
    expect(residual.reduced).toBe(false);
    expect(residual.method).toBe("residual_risk.v1");
  });

  it("does not reduce residual for untested or ineffective controls", () => {
    expect(
      computeResidual("high", [
        { status: "implemented", effectiveness: "untested", evidenceRefs: [{ sourceType: "doc", sourceRef: "x", title: "x" }] },
      ]).residualLevel,
    ).toBe("high");
    expect(
      computeResidual("high", [
        { status: "operating", effectiveness: "ineffective", evidenceRefs: [{ sourceType: "doc", sourceRef: "x", title: "x" }] },
      ]).residualLevel,
    ).toBe("high");
    expect(
      computeResidual("high", [
        { status: "operating", effectiveness: "partially_effective", evidenceRefs: [{ sourceType: "doc", sourceRef: "x", title: "x" }] },
      ]).residualLevel,
    ).toBe("high");
  });

  it("reduces residual by at most one band when an evidenced effective operating control applies", () => {
    const residual = computeResidual("extreme", [
      {
        status: "operating",
        effectiveness: "effective",
        evidenceRefs: [{ sourceType: "document", sourceRef: "test-1", title: "Test" }],
      },
    ]);
    expect(residual.residualLevel).toBe("high");
    expect(residual.reduced).toBe(true);
    expect(residual.evidencedControlCount).toBe(1);
    expect(
      computeResidual("low", [
        {
          status: "operating",
          effectiveness: "effective",
          evidenceRefs: [{ sourceType: "document", sourceRef: "test-1", title: "Test" }],
        },
      ]).residualLevel,
    ).toBe("low");
  });

  it("keeps unknown residual when inherent is unknown even if controls are evidenced", () => {
    expect(
      computeResidual("unknown", [
        {
          status: "operating",
          effectiveness: "effective",
          evidenceRefs: [{ sourceType: "document", sourceRef: "test-1", title: "Test" }],
        },
      ]).residualLevel,
    ).toBe("unknown");
  });

  it("forbids marking a control effective without evidence", () => {
    expect(() => assertControlEffectivenessAllowed("effective", [])).toThrow("control_evidence_required");
    expect(() => assertControlEffectivenessAllowed("effective", [{ sourceType: "doc", sourceRef: "t", title: "t" }])).not.toThrow();
    expect(controlReducesResidual({ status: "implemented", effectiveness: "effective", evidenceRefs: [] })).toBe(false);
  });
});
