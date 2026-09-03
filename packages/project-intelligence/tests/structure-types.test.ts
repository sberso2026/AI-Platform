import { describe, expect, it } from "vitest";
import { detectEvidenceCompleteness, parseEngineeringStructure } from "@rtb/engineering-os";

describe("other engineering structure types", () => {
  it("parses nested minimum, maximum, prohibition, exception, definition, and table/figure references", () => {
    const text = `
3.1 Definitions
Access way means a walkway provided for personnel.

5.1 Guards
Sheet metal guards shall be not less than 1.8 mm thick, except where mesh is used.
Openings shall not be permitted in moving parts.
5.2 Loading
Where the platform is used for maintenance, width shall be not less than 750 mm.
Where the platform is used only for inspection, width shall be not less than 500 mm.
Supports shall be provided at intervals not exceeding 2.4 m.
Illuminance shall comply with Table 8.1.
Alignment shall be as shown in Figure 2.3.
`;
    const nodes = parseEngineeringStructure(text, 4);
    expect(nodes.some((node) => node.clauseNumber === "3.1")).toBe(true);
    expect(nodes.some((node) => node.requirements?.some((fact) => fact.operator === "MIN" && fact.value === "1.8"))).toBe(true);
    expect(nodes.some((node) => node.requirements?.some((fact) => fact.operator === "MAX" && fact.value === "2.4"))).toBe(true);
    expect(nodes.some((node) => /shall not be permitted/i.test(node.text))).toBe(true);
    expect(nodes.some((node) => node.requirements?.some((fact) => Boolean(fact.exception)))).toBe(true);
    expect(detectEvidenceCompleteness("Illuminance shall comply with Table 8.1")).toBe("REQUIRES_TABLE");
    expect(detectEvidenceCompleteness("Alignment shall be as shown in Figure 2.3")).toBe("REQUIRES_FIGURE");
  });
});
