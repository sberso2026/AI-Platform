import { describe, expect, it } from "vitest";
import {
  AssetIntelligenceV1Intact,
  DigitalTwinV1Intact,
  EngineeringModelInteroperabilityV1Intact,
  EngineeringOSProductBoundaryLocked,
  InspectionIntelligenceV1Intact,
  ProjectControlsV1Intact,
  ProjectIntelligenceV1Intact,
  duplicateAssetOwnershipDetected,
  duplicateEngineeringToolFrameworkDetected,
  privateCrossModuleCouplingDetected,
} from "../version";
import {
  assertPhaseE6Invariants,
  getPhaseE6Declaration,
  PhaseE6LlmCannotImpersonateToolExecution,
  PhaseE6NoSecondToolRegistry,
  PhaseE6ReusesPlatformToolRegistry,
  rejectLlmFabricatedToolResult,
} from "./contracts";
import { EngineeringToolDiscoveryService } from "./discovery";
import { EngineeringToolInvocationService } from "./invocation";
import { applyToolResultToReasoning } from "./e5-bridge";
import { EngineeringReasoningService } from "../phase-e5/reasoning-service";
import { EngineeringRetrievalService } from "../services/engineering-retrieval-service";
import { runGroundedEngineeringAsk } from "../services/grounded-ask";

const perms = ["engineering_tool.execute", "engineering_tool.discover"];

describe("Phase E6 governed tool framework", () => {
  it("18. E0-E5 invariants + no second registry", () => {
    expect(PhaseE6NoSecondToolRegistry).toBe(true);
    expect(PhaseE6ReusesPlatformToolRegistry).toBe(true);
    expect(PhaseE6LlmCannotImpersonateToolExecution).toBe(true);
    expect(duplicateEngineeringToolFrameworkDetected).toBe(false);
    expect(getPhaseE6Declaration().platformRegistryOwner).toBe("platform_intelligence");
    assertPhaseE6Invariants({
      ProjectIntelligenceV1Intact,
      InspectionIntelligenceV1Intact,
      AssetIntelligenceV1Intact,
      ProjectControlsV1Intact,
      DigitalTwinV1Intact,
      EngineeringModelInteroperabilityV1Intact,
      privateCrossModuleCouplingDetected,
      duplicateAssetOwnershipDetected,
      duplicateEngineeringToolFrameworkDetected,
      EngineeringOSProductBoundaryLocked,
    });
  });

  it("1. tool discovery", () => {
    const discovery = new EngineeringToolDiscoveryService();
    const hits = discovery.discover({
      tenantId: "t1",
      userId: "u1",
      intent: "calculate rectangle area",
      permissions: perms,
    });
    expect(hits.some((h) => h.tool.toolId === "eos.rectangle_area" && h.eligible)).toBe(true);
  });

  it("2. permission denial", async () => {
    const inv = new EngineeringToolInvocationService();
    const result = await inv.invoke({
      tenantId: "t1",
      userId: "u1",
      toolId: "eos.rectangle_area",
      inputs: { length: 2, width: 3 },
      units: { length: "m", width: "m" },
      permissions: [],
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.limitations.join(" ")).toMatch(/permission_denied/);
  });

  it("3. uncertified tool block on certified path", async () => {
    const inv = new EngineeringToolInvocationService();
    const result = await inv.invoke({
      tenantId: "t1",
      userId: "u1",
      toolId: "eos.material_length_estimator",
      inputs: { pieceCount: 2, pieceLength: 3 },
      units: { pieceLength: "m" },
      permissions: perms,
      requireCertifiedPath: true,
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.limitations.join(" ")).toMatch(/certified-use|experimental/i);
  });

  it("4. experimental status visible", () => {
    const discovery = new EngineeringToolDiscoveryService();
    const hits = discovery.discover({
      tenantId: "t1",
      userId: "u1",
      intent: "estimate material length",
      permissions: perms,
    });
    const exp = hits.find((h) => h.tool.toolId === "eos.material_length_estimator");
    expect(exp?.tool.certification).toBe("EXPERIMENTAL");
    expect(exp?.eligible).toBe(true);
    expect(exp?.reasons).toContain("experimental_visible");
  });

  it("5. valid deterministic invocation", async () => {
    const inv = new EngineeringToolInvocationService();
    const result = await inv.invoke({
      tenantId: "t1",
      userId: "u1",
      toolId: "eos.rectangle_area",
      inputs: { length: 2, width: 3 },
      units: { length: "m", width: "m" },
      permissions: perms,
    });
    expect(result.status).toBe("SUCCESS");
    expect(result.outputKind).toBe("CALCULATED");
    expect(result.output?.area).toBe(6);
    expect(result.reviewRequired).toBe(true);
    expect(result.provenance.llmGenerated).toBe(false);
  });

  it("6. invalid input / unit mismatch", async () => {
    const inv = new EngineeringToolInvocationService();
    const result = await inv.invoke({
      tenantId: "t1",
      userId: "u1",
      toolId: "eos.rectangle_area",
      inputs: { length: 2, width: 3 },
      units: { length: "m", width: "mm" },
      permissions: perms,
    });
    expect(result.status).toBe("FAILED");
    expect(result.output).toBeNull();
  });

  it("7. missing input", async () => {
    const inv = new EngineeringToolInvocationService();
    const result = await inv.invoke({
      tenantId: "t1",
      userId: "u1",
      toolId: "eos.rectangle_area",
      inputs: { length: 2 },
      units: { length: "m" },
      permissions: perms,
    });
    expect(result.status).toBe("INCOMPLETE");
    expect(result.limitations.join(" ")).toMatch(/Missing required inputs/);
  });

  it("8. unit ambiguity", async () => {
    const inv = new EngineeringToolInvocationService();
    const result = await inv.invoke({
      tenantId: "t1",
      userId: "u1",
      toolId: "eos.rectangle_area",
      inputs: { length: 2, width: 3 },
      permissions: perms,
    });
    expect(result.status).toBe("INCOMPLETE");
    expect(result.limitations.join(" ")).toMatch(/Unit ambiguity/);
  });

  it("9. timeout", async () => {
    const inv = new EngineeringToolInvocationService(
      undefined,
      {
        "eos.rectangle_area": async () => {
          await new Promise((r) => setTimeout(r, 50));
          return { output: { area: 1 }, outputKind: "CALCULATED" };
        },
      },
    );
    const result = await inv.invoke({
      tenantId: "t1",
      userId: "u1",
      toolId: "eos.rectangle_area",
      inputs: { length: 1, width: 1 },
      units: { length: "m", width: "m" },
      permissions: perms,
      timeoutMs: 5,
    });
    expect(result.status).toBe("TIMEOUT");
    expect(result.output).toBeNull();
  });

  it("10. tool failure — no fabricated substitute", async () => {
    const inv = new EngineeringToolInvocationService(undefined, {
      "eos.rectangle_area": async () => {
        throw new Error("boom");
      },
    });
    const result = await inv.invoke({
      tenantId: "t1",
      userId: "u1",
      toolId: "eos.rectangle_area",
      inputs: { length: 1, width: 1 },
      units: { length: "m", width: "m" },
      permissions: perms,
    });
    expect(result.status).toBe("FAILED");
    expect(result.output).toBeNull();
    expect(result.limitations.join(" ")).toMatch(/no fabricated/i);
  });

  it("11. immutable provenance", async () => {
    const inv = new EngineeringToolInvocationService();
    const result = await inv.invoke({
      tenantId: "t1",
      userId: "u1",
      toolId: "eos.evidence_keyword_check",
      inputs: { haystack: "temporary repair", needle: "repair" },
      permissions: perms,
    });
    expect(result.immutable).toBe(true);
    expect(() => {
      (result as { status: string }).status = "SUCCESS";
    }).toThrow();
  });

  it("12. version captured", async () => {
    const inv = new EngineeringToolInvocationService();
    const result = await inv.invoke({
      tenantId: "t1",
      userId: "u1",
      toolId: "eos.document_title_comparator",
      inputs: { titleA: "A", titleB: "A" },
      permissions: perms,
    });
    expect(result.toolVersion).toBe("1.0.0-e6");
    expect(result.provenance.toolVersion).toBe("1.0.0-e6");
  });

  it("13. evidence linkage", async () => {
    const inv = new EngineeringToolInvocationService();
    const result = await inv.invoke({
      tenantId: "t1",
      userId: "u1",
      toolId: "eos.evidence_keyword_check",
      inputs: { haystack: "x", needle: "x" },
      permissions: perms,
      evidenceRefs: ["doc-1", "dec-9"],
    });
    expect(result.evidenceRefs).toEqual(["doc-1", "dec-9"]);
  });

  it("14. E5 Why? tool provenance", async () => {
    const reasoning = await new EngineeringReasoningService().reason({
      query: "compare titles",
      evidence: [],
    });
    const inv = new EngineeringToolInvocationService();
    const toolResult = await inv.invoke({
      tenantId: "t1",
      userId: "u1",
      toolId: "eos.document_title_comparator",
      inputs: { titleA: "IR-1", titleB: "IR-1" },
      permissions: perms,
    });
    const merged = applyToolResultToReasoning(reasoning, toolResult);
    expect(merged.why.ruleOrToolBasis.some((l) => l.includes("eos.document_title_comparator"))).toBe(
      true,
    );
    expect(merged.why.chainOfThoughtExposed).toBe(false);
  });

  it("15. no fake LLM result", () => {
    const inv = new EngineeringToolInvocationService();
    expect(() => inv.rejectFabricatedResultFromLlm()).toThrow(/llm_cannot_fabricate/);
    expect(() => rejectLlmFabricatedToolResult()).toThrow(/llm_cannot_fabricate/);
  });

  it("16. unauthorized / cross-tenant invocation", async () => {
    const inv = new EngineeringToolInvocationService(undefined, undefined, {
      hasPermission: async ({ tenantId }) => tenantId === "allowed-tenant",
    });
    const denied = await inv.invoke({
      tenantId: "other-tenant",
      userId: "u1",
      toolId: "eos.rectangle_area",
      inputs: { length: 1, width: 1 },
      units: { length: "m", width: "m" },
      permissions: [],
    });
    expect(denied.status).toBe("BLOCKED");
  });

  it("17. unavailable capability", async () => {
    const inv = new EngineeringToolInvocationService();
    const result = await inv.invoke({
      tenantId: "t1",
      userId: "u1",
      toolId: "eos.cap.structural_calculator",
      inputs: {},
      permissions: perms,
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.limitations.join(" ")).toMatch(/unavailable|not implemented/i);
  });

  it("Ask path runs governed tool after reasoning", async () => {
    const retrieval = new EngineeringRetrievalService({
      search: async () => ({
        projects: [],
        documents: [
          {
            id: "d1",
            tenant_id: "t1",
            title: "Temporary repair procedure",
            status: "approved",
          },
        ],
        assets: [],
        decisions: [],
        actions: [],
        risks: [],
        issues: [],
        technical_queries: [],
        lessons: [],
      }),
    });
    const result = await runGroundedEngineeringAsk({
      commerce: {} as never,
      retrieval,
      query: { tenantId: "t1", userId: "u1", query: "temporary repair procedure" },
      toolAction: "compare",
      toolInputs: { titleA: "A", titleB: "B" },
      toolPermissions: perms,
    });
    expect(result.meta.phase).toBe("E6");
    expect(result.toolResult?.toolId).toBe("eos.document_title_comparator");
    expect(result.meta.llmFabricatedToolResult).toBe(false);
    expect(result.why?.ruleOrToolBasis.some((l) => /eos\.document_title_comparator/.test(l))).toBe(
      true,
    );
  });
});
