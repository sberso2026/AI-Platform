import { describe, expect, it } from "vitest";
import { assembleStructuralEvidence, parseEngineeringStructure } from "@rtb/engineering-os";

const FOUNDER_CLAUSE = `
4.8.7.6 Lanyard or pull wire. Automatic lock-out
(d) The force required to operate the lanyard or pull wire stop control shall not exceed the following:
(i) Where applied midway between the lanyard or pull wire supports and at right angles . . . 70 N.
(ii) Where applied along the axis of the lanyard or pull wire in either direction . . . 230 N.
(e) Supports for lanyards or pull wires shall be provided at intervals not exceeding 4.5 m.
`;

describe("founder clause structural reconstruction (evaluation fixture only)", () => {
  it("discovers parent-child force and interval relationships from source structure", () => {
    const nodes = parseEngineeringStructure(FOUNDER_CLAUSE, 13);
    const d = nodes.find((node) => node.id.endsWith("(d)"));
    const i = nodes.find((node) => node.id.includes("(d)(i)"));
    const ii = nodes.find((node) => node.id.includes("(d)(ii)"));
    const e = nodes.find((node) => node.id.endsWith("(e)"));
    expect(d && i && ii && e).toBeTruthy();
    expect(d?.childIds.includes(i!.id)).toBe(true);
    expect(d?.childIds.includes(ii!.id)).toBe(true);
    expect(i?.requirement?.value).toBe("70");
    expect(i?.requirement?.unit).toBe("N");
    expect(i?.requirement?.property).toBe("force");
    expect(ii?.requirement?.value).toBe("230");
    expect(e?.requirement?.value).toBe("4.5");
    expect(e?.requirement?.unit).toBe("m");
    expect(e?.requirement?.property).toBe("interval");

    const midway = assembleStructuralEvidence(nodes, { query: "force midway between supports at right angles" });
    const axial = assembleStructuralEvidence(nodes, { query: "force along the axis" });
    const interval = assembleStructuralEvidence(nodes, { query: "maximum interval for supports" });
    expect(midway.facts[0]?.value).toBe("70");
    expect(axial.facts[0]?.value).toBe("230");
    expect(interval.facts[0]?.value).toBe("4.5");
  });
});
