import { describe, it, expect } from "vitest";
import type { EngineeringDiscipline } from "@rtb/types";
import {
  assertNoDuplicateDisciplineNames,
  dedupeDisciplinesForDisplay,
  normalizeDisciplineKey,
} from "./discipline-dedupe";

const tenantId = "tenant-a";

function disc(
  partial: Partial<EngineeringDiscipline> & Pick<EngineeringDiscipline, "id" | "discipline_key" | "name">
): EngineeringDiscipline {
  return {
    is_system: partial.tenant_id == null,
    created_at: "2026-01-01T00:00:00Z",
    ...partial,
  };
}

describe("Discipline deduplication", () => {
  it("normalizes keys and names for comparison", () => {
    expect(normalizeDisciplineKey("Civil")).toBe("civil");
    expect(normalizeDisciplineKey(" civil_engineering ")).toBe("civil-engineering");
  });

  it("prefers tenant discipline over system when keys match", () => {
    const rows = [
      disc({
        id: "sys-civil",
        discipline_key: "civil",
        name: "Civil",
        tenant_id: undefined,
        is_system: true,
      }),
      disc({
        id: "ten-civil",
        discipline_key: "civil",
        name: "Civil",
        tenant_id: tenantId,
        is_system: false,
      }),
    ];
    const result = dedupeDisciplinesForDisplay(rows, tenantId);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("ten-civil");
    expect(assertNoDuplicateDisciplineNames(result)).toBe(true);
  });

  it("dedupes by name when keys differ but labels collide", () => {
    const rows = [
      disc({
        id: "sys-1",
        discipline_key: "civ",
        name: "Civil",
        is_system: true,
      }),
      disc({
        id: "ten-1",
        discipline_key: "civil",
        name: "Civil",
        tenant_id: tenantId,
        is_system: false,
      }),
    ];
    const result = dedupeDisciplinesForDisplay(rows, tenantId);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("ten-1");
  });

  it("collapses system+tenant pairs for every seeded discipline", () => {
    const names = ["Civil", "Construction", "Electrical", "Structural", "HSE"];
    const rows: EngineeringDiscipline[] = [];
    for (const name of names) {
      const key = name.toLowerCase();
      rows.push(
        disc({ id: `sys-${key}`, discipline_key: key, name, is_system: true }),
        disc({
          id: `ten-${key}`,
          discipline_key: key,
          name,
          tenant_id: tenantId,
          is_system: false,
        })
      );
    }
    expect(rows).toHaveLength(10);
    const result = dedupeDisciplinesForDisplay(rows, tenantId);
    expect(result).toHaveLength(5);
    expect(assertNoDuplicateDisciplineNames(result)).toBe(true);
    expect(result.every((r) => r.tenant_id === tenantId)).toBe(true);
  });

  it("keeps system-only disciplines when tenant has no override", () => {
    const rows = [
      disc({ id: "sys-mech", discipline_key: "mechanical", name: "Mechanical", is_system: true }),
      disc({
        id: "ten-civil",
        discipline_key: "civil",
        name: "Civil",
        tenant_id: tenantId,
        is_system: false,
      }),
    ];
    const result = dedupeDisciplinesForDisplay(rows, tenantId);
    expect(result).toHaveLength(2);
    expect(result.find((r) => r.discipline_key === "mechanical")?.id).toBe("sys-mech");
  });

  it("models seed idempotency contract: second copy does not change unique display set", () => {
    const firstPass = [
      disc({ id: "ten-civil-1", discipline_key: "civil", name: "Civil", tenant_id: tenantId }),
    ];
    // Simulated second seed with same key (DB unique would block; if rows leaked, display still unique)
    const secondPass = [
      ...firstPass,
      disc({ id: "ten-civil-2", discipline_key: "civil", name: "Civil", tenant_id: tenantId }),
    ];
    const result = dedupeDisciplinesForDisplay(secondPass, tenantId);
    expect(result).toHaveLength(1);
  });
});
