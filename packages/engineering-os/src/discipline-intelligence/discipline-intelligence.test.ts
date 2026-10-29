import { describe, expect, it } from "vitest";
import {
  CANONICAL_DISCIPLINE_CODES,
  DISCIPLINE_KEY_BY_CODE,
  EXTRA_DISCIPLINE_KEYS,
  resolveDisciplineCode,
} from "./catalog";
import { LLM_AS_SOLVER, LLM_AS_SOLVER_RULE, HUMAN_AUTHORITY_RULE, assertLlmMustNotSolve, blockedSolverResult } from "./contracts";
import { crusherSystemFixtureContext, resolveDisciplineContext } from "./context-resolver";
import { buildDefaultDisciplineCatalog, buildDefaultDisciplineProfile } from "./profile-defaults";
import {
  applyEffectiveCapabilities,
  assertCapabilityCertificationAuthorized,
  deriveDisciplineReadiness,
  effectiveCapabilityStatus,
  rejectDisciplineToolInstallFields,
  spaceGassStructuralAnalysisStatus,
} from "./readiness";
import { crusherMechanicalToStructuralRequirements, crossDisciplineTrace, mergeCatalogWithRows, validateInformationRequirement } from "./service";

describe("EOS-A7A multidiscipline intelligence foundation", () => {
  it("reuses one canonical registry and does not invent a second identity", () => {
    expect(CANONICAL_DISCIPLINE_CODES).toHaveLength(11);
    expect(DISCIPLINE_KEY_BY_CODE.INSTRUMENTATION_CONTROL).toBe("instrumentation");
    expect(resolveDisciplineCode({ disciplineKey: "structural" })).toBe("STRUCTURAL");
    expect(EXTRA_DISCIPLINE_KEYS).toContain("hse");
    expect(EXTRA_DISCIPLINE_KEYS).not.toContain("structural");
  });

  it("keeps SPACE GASS structural analysis blocked and tool-independent review available", () => {
    const structural = buildDefaultDisciplineProfile({ tenantId: "tenant-a", code: "STRUCTURAL" });
    expect(structural.readiness).toBe("PARTIALLY_AVAILABLE");
    const linear = structural.capabilities.find((c) => c.key === "LINEAR_STRUCTURAL_ANALYSIS");
    expect(linear?.declaredStatus).toBe("TOOL_DEPENDENT");
    expect(linear?.effectiveStatus).toBe("BLOCKED");
    expect(structural.capabilities.find((c) => c.key === "DOCUMENT_REVIEW")?.effectiveStatus).toBe("AVAILABLE");
    expect(spaceGassStructuralAnalysisStatus([{ toolCode: "spacegass", profileId: null, readiness: "NOT_CONFIGURED" }])).toBe("BLOCKED");
    expect(structural.toolBindings[0]?.toolCode).toBe("spacegass");
    expect(structural.toolBindings[0]).not.toHaveProperty("executablePath");
  });

  it("never treats available or connected as certified", () => {
    expect(
      effectiveCapabilityStatus({
        declared: "AVAILABLE",
        toolIndependent: true,
        preferredToolCode: null,
        tools: [{ toolCode: "spacegass", profileId: "p1", readiness: "NOT_CONFIGURED" }],
      }),
    ).toBe("AVAILABLE");
    expect(
      effectiveCapabilityStatus({
        declared: "CERTIFIED",
        toolIndependent: false,
        preferredToolCode: "spacegass",
        tools: [{ toolCode: "spacegass", profileId: "p1", readiness: "NOT_CONFIGURED" }],
      }),
    ).toBe("BLOCKED");
  });

  it("requires admin to certify a capability", () => {
    expect(() =>
      assertCapabilityCertificationAuthorized({ isEngineeringAdmin: false, from: "NOT_CERTIFIED", to: "CERTIFIED" }),
    ).toThrow(/capability_certification_requires_admin/);
    expect(() =>
      assertCapabilityCertificationAuthorized({ isEngineeringAdmin: true, from: "NOT_CERTIFIED", to: "CERTIFIED" }),
    ).not.toThrow();
  });

  it("rejects executable path and licence on discipline payloads", () => {
    expect(() => rejectDisciplineToolInstallFields({ executablePath: "C:\\\\sg.exe" })).toThrow(/must_not_store/);
    expect(() => rejectDisciplineToolInstallFields({ externalToolProfileId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee" })).not.toThrow();
  });

  it("resolves crusher system disciplines from explicit participation, not LLM", () => {
    expect(resolveDisciplineContext(crusherSystemFixtureContext())).toEqual([
      "PROCESS",
      "MECHANICAL",
      "STRUCTURAL",
      "PIPING",
      "ELECTRICAL",
      "INSTRUMENTATION_CONTROL",
      "CIVIL",
    ]);
  });

  it("supports interface source/receiver and required mechanical-to-structural information", () => {
    const reqs = crusherMechanicalToStructuralRequirements();
    expect(reqs.every((row) => row.sourceDiscipline === "MECHANICAL" && row.receivingDiscipline === "STRUCTURAL")).toBe(true);
    expect(reqs.map((row) => row.informationKey)).toContain("operating_mass");
    expect(() => validateInformationRequirement({ informationKey: "", sourceDiscipline: "MECHANICAL", receivingDiscipline: "STRUCTURAL" })).toThrow();
  });

  it("traces requirement → system → interface → review without a solver", () => {
    const participants = crusherSystemFixtureContext().systemParticipants!;
    const trace = crossDisciplineTrace({
      requirementId: "req-1",
      systemId: "sys-crusher-primary",
      systemParticipants: participants,
      interfaceId: "if-104",
      interfaceParticipants: [
        { objectKind: "INTERFACE", objectId: "if-104", disciplineCode: "MECHANICAL", role: "SOURCE" },
        { objectKind: "INTERFACE", objectId: "if-104", disciplineCode: "STRUCTURAL", role: "RECEIVING" },
      ],
      information: crusherMechanicalToStructuralRequirements().map((row, index) => ({
        ...row,
        id: `info-${index}`,
        interfaceId: "if-104",
      })),
      reviewPackageId: "rev-crusher",
    });
    expect(trace.disciplines).toContain("MECHANICAL");
    expect(trace.disciplines).toContain("STRUCTURAL");
    expect(trace.mechanicalSupplies.length).toBeGreaterThan(0);
    expect(trace.structuralConsumes).toEqual(trace.mechanicalSupplies);
  });

  it("prohibits LLM-as-solver and autonomous approval in the contract", () => {
    expect(LLM_AS_SOLVER).toBe("PROHIBITED");
    expect(LLM_AS_SOLVER_RULE).toMatch(/must not replace deterministic engineering solvers/i);
    expect(HUMAN_AUTHORITY_RULE).toMatch(/must not independently approve/i);
    expect(() => assertLlmMustNotSolve("LINEAR_STRUCTURAL_ANALYSIS")).toThrow(/llm_must_not_replace_solver/);
    expect(blockedSolverResult("STRUCTURAL", "LINEAR_STRUCTURAL_ANALYSIS", "tool_not_configured").status).toBe("BLOCKED");
  });

  it("derives PARTIALLY_AVAILABLE when review is available and analysis is blocked", () => {
    const caps = applyEffectiveCapabilities(
      [
        { key: "DOCUMENT_REVIEW", declaredStatus: "AVAILABLE", toolIndependent: true, preferredToolCode: null, notes: "" },
        { key: "LINEAR_STRUCTURAL_ANALYSIS", declaredStatus: "TOOL_DEPENDENT", toolIndependent: false, preferredToolCode: "spacegass", notes: "" },
      ],
      [{ toolCode: "spacegass", profileId: null, readiness: "NOT_CONFIGURED" }],
    );
    expect(deriveDisciplineReadiness(caps)).toBe("PARTIALLY_AVAILABLE");
  });

  it("lists all canonical profiles without fabricating READY analysis", () => {
    const listed = mergeCatalogWithRows("tenant-a", []);
    expect(listed.map((row) => row.code)).toEqual([...CANONICAL_DISCIPLINE_CODES]);
    expect(listed.every((row) => row.readiness !== "READY_FOR_ANALYSIS")).toBe(true);
    expect(buildDefaultDisciplineCatalog("tenant-a")).toHaveLength(11);
  });

  it("does not store copyrighted standard text", () => {
    const structural = buildDefaultDisciplineProfile({ tenantId: "t", code: "STRUCTURAL" });
    expect(structural.standards.every((row) => /reference only/i.test(row.sourceReference))).toBe(true);
    expect(structural.standards.some((row) => row.standardCode === "AS 4100")).toBe(true);
  });
});
