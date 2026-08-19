import { describe, expect, it } from "vitest";
import { RELATIONSHIP_ENDPOINTS } from "./taxonomy";
import { demoContextRecords } from "./demo";

const SCOPE = {
  tenantId: "11111111-1111-4111-8111-111111111111",
  workspaceId: "22222222-2222-4222-8222-222222222222",
  userId: "33333333-3333-4333-8333-333333333333",
};

describe("BOS-10 Engineering OS boundary", () => {
  it("projects only an engineering project reference from work", () => {
    expect(RELATIONSHIP_ENDPOINTS.WORK_LINKED_TO_ENGINEERING_PROJECT_REFERENCE).toEqual({
      from: "work",
      to: "engineering_project_reference",
    });
    const records = demoContextRecords(SCOPE);
    const eng = records.find((row) => row.identity.entityType === "engineering_project_reference");
    const work = records.find((row) => row.identity.entityType === "work");
    expect(eng).toBeDefined();
    expect(work?.links.some((link) => link.relationshipType === "WORK_LINKED_TO_ENGINEERING_PROJECT_REFERENCE")).toBe(
      true,
    );
    expect(records.some((row) => row.identity.domain !== "engineering_reference" && row.identity.entityType.includes("ifc"))).toBe(
      false,
    );
  });
});
