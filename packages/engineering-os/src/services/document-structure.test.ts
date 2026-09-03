import { describe, expect, it } from "vitest";
import {
  assembleStructuralEvidence,
  detectEvidenceCompleteness,
  parseEngineeringStructure,
} from "./document-structure";

const GENERIC_NESTED = `
4.2.9.1 Stop control cable.
(d) The force required to operate the stop control shall not exceed the following:
(i) Where applied midway between the supports and at right angles to the cable . . . 55 N.
(ii) Where applied along the axis of the cable in either direction . . . 180 N.
(e) Supports for the cable shall be provided at intervals not exceeding 2.8 m.
`;

describe("engineering document structure", () => {
  it("reconstructs parent-child lettered and roman lists", () => {
    const nodes = parseEngineeringStructure(GENERIC_NESTED, 9);
    const ids = nodes.map((node) => node.id);
    expect(ids).toContain("4.2.9.1");
    expect(ids.some((id) => id.endsWith("(d)"))).toBe(true);
    expect(ids.some((id) => id.includes("(d)(i)"))).toBe(true);
    expect(ids.some((id) => id.includes("(d)(ii)"))).toBe(true);
    expect(ids.some((id) => id.endsWith("(e)"))).toBe(true);
    const parent = nodes.find((node) => node.id.endsWith("(d)"));
    expect(parent?.childIds.length).toBeGreaterThanOrEqual(2);
    expect(parent?.completeness === "COMPLETE" || parent?.completeness === "REQUIRES_CHILD").toBe(true);
  });

  it("binds conditional child values to an incomplete parent requirement", () => {
    const nodes = parseEngineeringStructure(GENERIC_NESTED, 9);
    const midway = nodes.find((node) => node.id.includes("(d)(i)"))?.requirement;
    const axial = nodes.find((node) => node.id.includes("(d)(ii)"))?.requirement;
    const interval = nodes.find((node) => node.id.endsWith("(e)"))?.requirement;
    expect(midway?.value).toBe("55");
    expect(midway?.unit).toBe("N");
    expect(midway?.property).toBe("force");
    expect(midway?.operator).toBe("MAX");
    expect(midway?.qualifier).toBe("midway");
    expect(axial?.value).toBe("180");
    expect(axial?.qualifier).toBe("along_axis");
    expect(interval?.value).toBe("2.8");
    expect(interval?.unit).toBe("m");
    expect(interval?.property).toBe("interval");
    expect(interval?.operator).toBe("MAX");
  });

  it("disambiguates conditional values and does not pick a sibling interval for a force question", () => {
    const nodes = parseEngineeringStructure(GENERIC_NESTED, 9);
    const general = assembleStructuralEvidence(nodes, { query: "What is the operating force?" });
    expect(general.facts.length).toBeGreaterThanOrEqual(2);
    expect(general.facts.some((fact) => fact.value === "55")).toBe(true);
    expect(general.facts.some((fact) => fact.value === "180")).toBe(true);
    expect(general.facts.every((fact) => fact.value !== "2.8")).toBe(true);

    const midway = assembleStructuralEvidence(nodes, { query: "What is the force midway between supports?" });
    expect(midway.facts).toHaveLength(1);
    expect(midway.facts[0]?.value).toBe("55");

    const interval = assembleStructuralEvidence(nodes, { query: "maximum support interval?" });
    expect(interval.facts[0]?.value).toBe("2.8");
    expect(interval.excerpt).not.toMatch(/55 N/);
  });

  it("classifies incomplete following-lists as REQUIRES_CHILD until children exist", () => {
    expect(detectEvidenceCompleteness("The force shall not exceed the following:")).toBe("REQUIRES_CHILD");
    expect(detectEvidenceCompleteness("Guards shall comply with Table 5.1")).toBe("REQUIRES_TABLE");
  });
});
