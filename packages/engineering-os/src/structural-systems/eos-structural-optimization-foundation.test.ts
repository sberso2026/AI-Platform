import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  D1J_R1_CANDIDATE_GENERATION_RUNTIME_COUNT,
  D1J_R1_CERTIFICATION_ELIGIBLE,
  D1J_R1_CONSTRAINT_EVALUATION_RUNTIME_COUNT,
  D1J_R1_FEASIBILITY_RUNTIME_COUNT,
  D1J_R1_OBJECTIVE_EVALUATION_RUNTIME_COUNT,
  D1J_R1_PARAMETER_REGISTRY,
  D1J_R1_SOLVER_EXECUTION_COUNT,
  createD1jR1Store,
  createOptimizationProblemFoundation,
  createVariableSet,
  evaluateOptimizationProblemFoundationStatus,
  inspectBaselineDesignReference,
  inspectOptimizationProblem,
  produceOptimizationProblemFoundationResult,
  propagateFoundationStaleness,
  registerBaselineDesignReference,
  registerDesignVariableDefinition,
  retireParameterRegistryVersion,
  type D1jR1Actor,
  type D1jR1Catalog,
  type D1jR1ProblemInput,
  type D1jR1Store,
} from "./optimization-problem-foundation";

const here = dirname(fileURLToPath(import.meta.url));

function clock(): () => string {
  let tick = 0;
  return () => `2026-03-01T00:00:${String(tick++).padStart(2, "0")}.000Z`;
}

function identity(kind: "STRUCTURAL_SYSTEM" | "MEMBER", id: string, systemId = "sys-1") {
  return {
    kind,
    id,
    structuralSystemId: kind === "STRUCTURAL_SYSTEM" ? id : systemId,
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    version: "v1",
    lifecycle: "CURRENT" as const,
    authority: "D1F_OWNER",
    validationState: "RECORDED",
    contentFingerprint: `${kind}-${id}-fp`,
    status: "CURRENT" as const,
  };
}

function catalog(): D1jR1Catalog {
  return {
    identities: [
      identity("STRUCTURAL_SYSTEM", "sys-1"),
      identity("MEMBER", "mem-1"),
      identity("MEMBER", "mem-2"),
      identity("STRUCTURAL_SYSTEM", "sys-2", "sys-2"),
      identity("MEMBER", "mem-x", "sys-2"),
    ],
    bindings: [
      {
        bindingId: "bind-1",
        jurisdictionBindingRef: "jurisdiction-au",
        standardBindingRefs: ["standard-1"],
        fingerprint: "bind-fp-1",
        tenantId: "tenant-1",
        workspaceId: "workspace-1",
        projectId: "project-1",
        status: "CURRENT",
      },
    ],
    domainSources: [
      {
        domainSourceId: "length-rule",
        sourceClass: "GOVERNED_ENGINEERING_RULE",
        authority: "RULE_AUTHORITY",
        fingerprint: "length-rule-fp",
        version: "1",
        tenantId: "tenant-1",
        workspaceId: "workspace-1",
        projectId: "project-1",
        status: "CURRENT",
        catalogueEntries: null,
        enumerationIds: null,
        booleanMeanings: null,
        quantity: "length",
        unit: "m",
        engineeringMinimum: 1,
        engineeringMaximum: 10,
        integerMinimum: null,
        integerMaximum: null,
      },
      {
        domainSourceId: "catalogue-1",
        sourceClass: "APPROVED_CATALOGUE",
        authority: "CATALOGUE_AUTHORITY",
        fingerprint: "catalogue-fp-1",
        version: "1",
        tenantId: "tenant-1",
        workspaceId: "workspace-1",
        projectId: "project-1",
        status: "CURRENT",
        catalogueEntries: ["entry-a", "entry-b"],
        enumerationIds: null,
        booleanMeanings: null,
        quantity: null,
        unit: null,
        engineeringMinimum: null,
        engineeringMaximum: null,
        integerMinimum: null,
        integerMaximum: null,
      },
      {
        domainSourceId: "length-rule-b",
        sourceClass: "GOVERNED_ENGINEERING_RULE",
        authority: "RULE_AUTHORITY",
        fingerprint: "length-rule-fp-b",
        version: "2",
        tenantId: "tenant-1",
        workspaceId: "workspace-1",
        projectId: "project-1",
        status: "CURRENT",
        catalogueEntries: null,
        enumerationIds: null,
        booleanMeanings: null,
        quantity: "length",
        unit: "m",
        engineeringMinimum: 1,
        engineeringMaximum: 8,
        integerMinimum: null,
        integerMaximum: null,
      },
      {
        domainSourceId: "enum-1",
        sourceClass: "PROJECT_CONSTRAINT",
        authority: "PROJECT_AUTHORITY",
        fingerprint: "enum-fp-1",
        version: "1",
        tenantId: "tenant-1",
        workspaceId: "workspace-1",
        projectId: "project-1",
        status: "CURRENT",
        catalogueEntries: null,
        enumerationIds: ["choice-a", "choice-b"],
        booleanMeanings: null,
        quantity: null,
        unit: null,
        engineeringMinimum: null,
        engineeringMaximum: null,
        integerMinimum: null,
        integerMaximum: null,
      },
    ],
  };
}

function actor(overrides: Partial<D1jR1Actor> = {}): D1jR1Actor {
  return { actorId: "engineer-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", authority: "HUMAN_ENGINEER", ...overrides };
}

function problemInput(overrides: Partial<D1jR1ProblemInput> = {}): D1jR1ProblemInput {
  return {
    optimizationProblemId: "problem-1",
    baselineRefId: "baseline-1",
    sourceDomain: "D1F_STRUCTURAL_SYSTEM",
    sourceObjectId: "sys-1",
    bindingId: "bind-1",
    scope: {
      scopeKind: "STRUCTURAL_SYSTEM",
      structuralSystemId: "sys-1",
      designDiscipline: "STRUCTURAL",
      projectStage: "DETAILED_DESIGN",
      purpose: "study foundation",
      limitations: "r1 only",
    },
    limitations: "not evaluable",
    version: "1",
    governanceProfileRef: "profile-1",
    ...overrides,
  };
}

function store(): D1jR1Store {
  return createD1jR1Store(catalog(), clock());
}

function variableInput(overrides: Record<string, unknown> = {}) {
  return {
    variableId: "var-1",
    optimizationProblemId: "problem-1",
    semanticKey: "GOVERNED_BOUNDED_QUANTITY",
    targetKind: "MEMBER" as const,
    targetId: "mem-1",
    parameterKind: "GOVERNED_BOUNDED_QUANTITY",
    quantity: "length",
    unit: "m",
    domainSourceId: "length-rule",
    applicability: "APPLICABLE",
    limitations: "definition only",
    version: "1",
    ...overrides,
  };
}

describe("EOS-D1J-R1 optimization problem baseline variable foundation", () => {
  it("creates a non-evaluable problem on a governed structural target", () => {
    const runtime = store();
    const problem = createOptimizationProblemFoundation(runtime, actor(), problemInput());
    expect(problem.status).toBe("FOUNDATION_DEFINED");
    expect(problem.optimizationReady).toBe(false);
    expect(problem.objectiveSetRef).toBeNull();
    expect(problem.constraintSetRef).toBeNull();
    expect(problem.structuralSystemRef).toBe("sys-1");
    expect(problem.provenance.callerBackdated).toBe(false);
    expect(createOptimizationProblemFoundation(runtime, actor(), problemInput())).toBe(problem);
    expect(runtime.problems).toHaveLength(1);
  });

  it("rejects an orphan target and cross-project or cross-tenant actors", () => {
    const runtime = store();
    expect(() => createOptimizationProblemFoundation(runtime, actor(), problemInput({ scope: { ...problemInput().scope, structuralSystemId: "missing" } }))).toThrow("STRUCTURAL_TARGET_NOT_FOUND");
    expect(() => createOptimizationProblemFoundation(runtime, actor({ projectId: "project-2" }), problemInput())).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => createOptimizationProblemFoundation(runtime, actor({ tenantId: "tenant-2" }), problemInput())).toThrow("CROSS_TENANT_OPERATION");
  });

  it("resolves baseline truth from the structural identity", () => {
    const runtime = store();
    const problem = createOptimizationProblemFoundation(runtime, actor(), problemInput());
    const baseline = inspectBaselineDesignReference(runtime, problem.baselineRefId);
    expect(baseline.sourceVersion).toBe("v1");
    expect(baseline.sourceFingerprint).toBe("STRUCTURAL_SYSTEM-sys-1-fp");
    expect(baseline.authority).toBe("D1F_OWNER");
    expect(baseline.validationState).toBe("RECORDED");
    expect(baseline.copiesSourceBody).toBe(false);
    expect(baseline.floatsToLatest).toBe(false);
  });

  it("rejects a spoofed baseline fingerprint, authority, or validation state", () => {
    const runtime = store();
    expect(() => createOptimizationProblemFoundation(runtime, actor(), problemInput({ expectedBaselineFingerprint: "spoof" }))).toThrow("BASELINE_FINGERPRINT_MISMATCH");
    const problem = createOptimizationProblemFoundation(runtime, actor(), problemInput({ baselineAuthority: "ELEVATED", baselineValidationState: "CERTIFIED", sourceFingerprint: "caller-fp" }));
    const baseline = inspectBaselineDesignReference(runtime, problem.baselineRefId);
    expect(baseline.authority).toBe("D1F_OWNER");
    expect(baseline.validationState).toBe("RECORDED");
    expect(baseline.sourceFingerprint).toBe("STRUCTURAL_SYSTEM-sys-1-fp");
  });

  it("rejects an unrelated baseline and keeps the pin fixed when the source changes", () => {
    const runtime = store();
    expect(() => createOptimizationProblemFoundation(runtime, actor(), problemInput({ sourceObjectId: "sys-2" }))).toThrow("BASELINE_SCOPE_MISMATCH");
    const problem = createOptimizationProblemFoundation(runtime, actor(), problemInput());
    const before = inspectBaselineDesignReference(runtime, "baseline-1").sourceFingerprint;
    runtime.catalog.identities[0]!.contentFingerprint = "STRUCTURAL_SYSTEM-sys-1-fp-2";
    runtime.catalog.identities[0]!.version = "v2";
    expect(inspectBaselineDesignReference(runtime, "baseline-1").sourceFingerprint).toBe(before);
    const successor = registerBaselineDesignReference(runtime, actor(), { ...problemInput({ optimizationProblemId: problem.optimizationProblemId, baselineRefId: "baseline-2", expectedBaselineFingerprint: "STRUCTURAL_SYSTEM-sys-1-fp-2", expectedBaselineVersion: "v2" }), successorProblemId: "problem-2" });
    expect(successor.baselineRefId).toBe("baseline-2");
    expect(inspectBaselineDesignReference(runtime, "baseline-1").sourceFingerprint).toBe(before);
    expect(inspectOptimizationProblem(runtime, "problem-1").status).toBe("SUPERSEDED");
  });

  it("allowlists parameter semantics and rejects property paths without mutating the model", () => {
    const runtime = store();
    createOptimizationProblemFoundation(runtime, actor(), problemInput());
    const snapshot = JSON.stringify(runtime.catalog.identities);
    const variable = registerDesignVariableDefinition(runtime, actor(), variableInput());
    expect(variable.parameterKind).toBe("GOVERNED_BOUNDED_QUANTITY");
    expect(variable.mutatesTarget).toBe(false);
    expect(JSON.stringify(runtime.catalog.identities)).toBe(snapshot);
    expect(D1J_R1_PARAMETER_REGISTRY.every((row) => row.mutatesModel === false)).toBe(true);
    expect(() => registerDesignVariableDefinition(runtime, actor(), variableInput({ variableId: "var-path", semanticKey: "members[0].section.depth", parameterKind: "members[0].section.depth" }))).toThrow("PARAMETER_KIND_UNSUPPORTED");
    expect(() => registerDesignVariableDefinition(runtime, actor(), variableInput({ variableId: "var-proto", semanticKey: "constructor.prototype", parameterKind: "constructor.prototype" }))).toThrow("PARAMETER_KIND_UNSUPPORTED");
  });

  it("rejects a variable target outside the declared member scope", () => {
    const runtime = store();
    createOptimizationProblemFoundation(runtime, actor(), problemInput({
      scope: { scopeKind: "MEMBER_SET", structuralSystemId: "sys-1", memberIds: ["mem-1"], designDiscipline: "STRUCTURAL", projectStage: "DETAILED_DESIGN", purpose: "member", limitations: "explicit" },
    }));
    expect(() => registerDesignVariableDefinition(runtime, actor(), variableInput({ targetId: "mem-2" }))).toThrow("PARAMETER_TARGET_OUT_OF_SCOPE");
  });

  it("requires a governed unit and rejects an incompatible unit", () => {
    const runtime = store();
    createOptimizationProblemFoundation(runtime, actor(), problemInput());
    expect(registerDesignVariableDefinition(runtime, actor(), variableInput()).unit).toBe("m");
    expect(() => registerDesignVariableDefinition(runtime, actor(), variableInput({ variableId: "var-unit", unit: null }))).toThrow("VARIABLE_UNIT_REQUIRED");
    expect(() => registerDesignVariableDefinition(runtime, actor(), variableInput({ variableId: "var-pa", unit: "Pa" }))).toThrow("VARIABLE_UNIT_INCOMPATIBLE");
  });

  it("pins a governed domain and rejects caller bounds without that source", () => {
    const runtime = store();
    createOptimizationProblemFoundation(runtime, actor(), problemInput());
    const variable = registerDesignVariableDefinition(runtime, actor(), variableInput());
    expect(variable.domainAuthority).toBe("RULE_AUTHORITY");
    expect(variable.domainFingerprint).toBe("length-rule-fp");
    expect(() => registerDesignVariableDefinition(runtime, actor(), variableInput({ variableId: "var-free", domainSourceId: null, lowerBound: 1, upperBound: 2 }))).toThrow("VARIABLE_DOMAIN_SOURCE_UNRESOLVED");
  });

  it("accepts a narrower search range and keeps it distinct from the engineering limit", () => {
    const runtime = store();
    createOptimizationProblemFoundation(runtime, actor(), problemInput());
    const source = runtime.catalog.domainSources[0]!;
    const before = source.engineeringMinimum;
    const variable = registerDesignVariableDefinition(runtime, actor(), variableInput({ searchMinimum: 2, searchMaximum: 4, searchUnit: "m" }));
    expect(variable.bounds.some((row) => row.semanticType === "SEARCH_MINIMUM" && row.value === 2)).toBe(true);
    expect(variable.bounds.some((row) => row.semanticType === "ENGINEERING_MINIMUM" && row.value === 1)).toBe(true);
    expect(variable.searchBoundEqualsEngineeringLimit).toBe(false);
    expect(source.engineeringMinimum).toBe(before);
    expect(() => registerDesignVariableDefinition(runtime, actor(), variableInput({ variableId: "var-wide", searchMinimum: 0, searchMaximum: 12, searchUnit: "m" }))).toThrow("SEARCH_DOMAIN_OUTSIDE_GOVERNED_DOMAIN");
  });

  it("pins catalogue entries and rejects a freeform category or unknown applicability", () => {
    const runtime = store();
    createOptimizationProblemFoundation(runtime, actor(), problemInput());
    const catalogue = registerDesignVariableDefinition(runtime, actor(), variableInput({
      variableId: "var-cat",
      semanticKey: "GOVERNED_CATALOGUE_CHOICE",
      parameterKind: "GOVERNED_CATALOGUE_CHOICE",
      quantity: null,
      unit: null,
      domainSourceId: "catalogue-1",
    }));
    expect(catalogue.domainFingerprint).toBe("catalogue-fp-1");
    expect(catalogue.discreteValues).toEqual(["entry-a", "entry-b"]);
    expect(() => registerDesignVariableDefinition(runtime, actor(), variableInput({
      variableId: "var-freeform",
      semanticKey: "GOVERNED_ENUMERATION",
      parameterKind: "GOVERNED_ENUMERATION",
      quantity: null,
      unit: null,
      domainSourceId: "enum-1",
      discreteSubset: ["invented"],
    }))).toThrow("VARIABLE_DOMAIN_UNAUTHORIZED");
    expect(() => registerDesignVariableDefinition(runtime, actor(), variableInput({ variableId: "var-unknown", applicability: "UNKNOWN" }))).toThrow("VARIABLE_APPLICABILITY_UNRESOLVED");
  });

  it("builds an order-independent variable set and rejects duplicates, conflicts, and an empty set", () => {
    const first = store();
    createOptimizationProblemFoundation(first, actor(), problemInput());
    registerDesignVariableDefinition(first, actor(), variableInput());
    registerDesignVariableDefinition(first, actor(), variableInput({ variableId: "var-2", targetId: "mem-2", semanticKey: "GOVERNED_CATALOGUE_CHOICE", parameterKind: "GOVERNED_CATALOGUE_CHOICE", quantity: null, unit: null, domainSourceId: "catalogue-1" }));
    const forward = createVariableSet(first, actor(), { variableSetId: "set-1", optimizationProblemId: "problem-1", variableIds: ["var-1", "var-2"], version: "1" });
    const second = store();
    createOptimizationProblemFoundation(second, actor(), problemInput());
    registerDesignVariableDefinition(second, actor(), variableInput());
    registerDesignVariableDefinition(second, actor(), variableInput({ variableId: "var-2", targetId: "mem-2", semanticKey: "GOVERNED_CATALOGUE_CHOICE", parameterKind: "GOVERNED_CATALOGUE_CHOICE", quantity: null, unit: null, domainSourceId: "catalogue-1" }));
    const reverse = createVariableSet(second, actor(), { variableSetId: "set-1", optimizationProblemId: "problem-1", variableIds: ["var-2", "var-1"], version: "1" });
    expect(forward.variableSet.fingerprint).toBe(reverse.variableSet.fingerprint);
    expect(forward.problem.optimizationReady).toBe(false);
    const conflict = store();
    createOptimizationProblemFoundation(conflict, actor(), problemInput());
    registerDesignVariableDefinition(conflict, actor(), variableInput());
    expect(() => registerDesignVariableDefinition(conflict, actor(), variableInput({ variableId: "var-conflict", domainSourceId: "length-rule-b" }))).toThrow("CONFLICTING_VARIABLE_DOMAIN");
    expect(conflict.variables).toHaveLength(1);
    const fresh = store();
    createOptimizationProblemFoundation(fresh, actor(), problemInput());
    expect(() => createVariableSet(fresh, actor(), { variableSetId: "empty", optimizationProblemId: "problem-1", variableIds: [], version: "1" })).toThrow("EMPTY_VARIABLE_SET");
    registerDesignVariableDefinition(fresh, actor(), variableInput());
    expect(registerDesignVariableDefinition(fresh, actor(), variableInput()).variableId).toBe("var-1");
    expect(fresh.variables.filter((row) => row.targetId === "mem-1" && row.parameterKind === "GOVERNED_BOUNDED_QUANTITY")).toHaveLength(1);
  });

  it("keeps a complete foundation short of optimization, feasibility, candidates, and solver execution", () => {
    const runtime = store();
    createOptimizationProblemFoundation(runtime, actor(), problemInput());
    registerDesignVariableDefinition(runtime, actor(), variableInput());
    const bound = createVariableSet(runtime, actor(), { variableSetId: "set-1", optimizationProblemId: "problem-1", variableIds: ["var-1"], version: "1" });
    const status = evaluateOptimizationProblemFoundationStatus(runtime, bound.problem.optimizationProblemId);
    const result = produceOptimizationProblemFoundationResult(runtime, bound.problem.optimizationProblemId);
    expect(status.optimizationReady).toBe(false);
    expect(status.feasibilityReady).toBe(false);
    expect(status.certificationReady).toBe(false);
    expect(result.completeness).toBe("COMPLETE_FOR_R1_FOUNDATION_SCOPE");
    expect(result.diagnosticEqualsEngineeringCheck).toBe(false);
    expect(result.blockingRuntimeDiagnostics).toContain("OBJECTIVES_AND_CONSTRAINTS_UNBOUND");
    expect(D1J_R1_CANDIDATE_GENERATION_RUNTIME_COUNT).toBe(0);
    expect(D1J_R1_OBJECTIVE_EVALUATION_RUNTIME_COUNT).toBe(0);
    expect(D1J_R1_CONSTRAINT_EVALUATION_RUNTIME_COUNT).toBe(0);
    expect(D1J_R1_FEASIBILITY_RUNTIME_COUNT).toBe(0);
    expect(D1J_R1_SOLVER_EXECUTION_COUNT).toBe(0);
    expect(D1J_R1_CERTIFICATION_ELIGIBLE).toBe(false);
    const source = readFileSync(join(here, "optimization-problem-foundation.ts"), "utf8");
    expect(source).not.toContain("eval(");
    expect(source).not.toContain("new Function");
    expect(source).not.toContain("child_process");
    expect(scanAnalysisFormulaBypass(join(here, "optimization-problem-foundation.ts"), source)).toEqual([]);
    expect(readdirSync(here).filter((name) => /digital-twin|d1i-/i.test(name))).toEqual([]);
  });

  it("keeps history reproducible and propagates staleness without rewriting pins", () => {
    const runtime = store();
    createOptimizationProblemFoundation(runtime, actor(), problemInput());
    const original = registerDesignVariableDefinition(runtime, actor(), variableInput());
    const successorVariable = registerDesignVariableDefinition(runtime, actor(), variableInput({ variableId: "var-2", successorOfVariableId: "var-1", version: "2" }));
    expect(original.status).toBe("SUPERSEDED");
    expect(original.fingerprint).not.toBe(successorVariable.fingerprint);
    runtime.catalog.domainSources[0]!.status = "STALE";
    runtime.catalog.bindings[0]!.status = "STALE";
    runtime.catalog.identities[0]!.status = "STALE";
    const historyBefore = runtime.history.length;
    propagateFoundationStaleness(runtime);
    expect(runtime.history.length).toBeGreaterThan(historyBefore);
    expect(inspectBaselineDesignReference(runtime, "baseline-1").sourceFingerprint).toBe("STRUCTURAL_SYSTEM-sys-1-fp");
    expect(successorVariable.domainFingerprint).toBe("length-rule-fp");
    expect(inspectOptimizationProblem(runtime, "problem-1").status).toBe("STALE");
    const registry = store();
    createOptimizationProblemFoundation(registry, actor(), problemInput());
    const pinned = registerDesignVariableDefinition(registry, actor(), variableInput());
    retireParameterRegistryVersion(registry, pinned.parameterRegistryVersion);
    expect(pinned.status).toBe("STALE");
    expect(pinned.domainAuthority).toBe("RULE_AUTHORITY");
  });

  it("records distinct provenance and repeats an exact registration once", () => {
    const runtime = store();
    const problem = createOptimizationProblemFoundation(runtime, actor(), problemInput());
    const variable = registerDesignVariableDefinition(runtime, actor(), variableInput());
    expect(problem.provenance.registrationAuthority).toBe("HUMAN_ENGINEER");
    expect(problem.provenance.sourceAuthority).toBe("D1F_OWNER");
    expect(variable.provenance.sourceAuthority).toBe("RULE_AUTHORITY");
    expect(variable.provenance.registrationAuthority).toBe("HUMAN_ENGINEER");
    const count = runtime.history.length;
    registerDesignVariableDefinition(runtime, actor(), variableInput());
    expect(runtime.history).toHaveLength(count);
    const row = STRUCTURAL_CAPABILITY_MANIFEST.find((item) => item.capabilityId === "D1J.R1.OPTIMIZATION_PROBLEM_FOUNDATION");
    expect(row?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(row?.validationState).toBe("NOT_VALIDATED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((item) => item.capabilityId === "D1J.STRUCTURAL_OPTIMIZATION_RUNTIME")?.implementationState).toBe("NOT_IMPLEMENTED");
    expect(() => registerDesignVariableDefinition(runtime, actor({ authority: "AI" }), variableInput({ variableId: "var-ai" }))).toThrow("UNAUTHORIZED");
  });
});
