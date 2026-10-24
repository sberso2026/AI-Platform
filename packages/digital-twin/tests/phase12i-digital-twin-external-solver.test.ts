import { describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import {
  assertDefaultsManifest,
  assertNoSilentSolverFallback,
  assertOwnershipLock,
  assertReservedSolversUnavailable,
  assertSimulationForbiddenCapabilities,
  CALCULIX_ADAPTER_VERSION,
  CALCULIX_AXIAL_BAR_BENCHMARK,
  CALCULIX_LINEAR_ELASTIC_DEFAULTS,
  CALCULIX_SOLVER_ID,
  createCalculiXSolverAdapter,
  createTwinSimulationProvider,
  DIGITAL_TWIN_PHASE,
  DIGITAL_TWIN_STATUS,
  DIGITAL_TWIN_VERSION,
  EXTERNAL_ENGINEERING_SOLVER_ADAPTERS_IMPLEMENTED,
  EXTERNAL_SOLVER_ADAPTER_FRAMEWORK_READY,
  FIRST_REAL_ENGINEERING_SOLVER_ADAPTER_IMPLEMENTED,
  FIRST_REAL_SOLVER_ID,
  LINEAR_ELASTIC_STATIC_METHOD_KEY,
  mapCalculixDatToLinearElasticOutput,
  mapLinearElasticStaticInput,
  NATIVE_ENGINEERING_SOLVER_IMPLEMENTED,
  PHASE_12H_CERTIFIED_COMMIT,
  PHASE_12H_HOSTED_RUN,
  PHASE_12H_VERSION,
  PHASE_12J_READY,
  runDeterministicFixtureProvider,
  runNegativeBenchmark,
  SILENT_SOLVER_FALLBACK_ALLOWED,
  SOLVER_EXECUTION_DEFAULTS_MANIFEST_VERSION,
  analyticalAxialBarDisplacementM,
} from "../src/index";

describe("Phase 12I Digital Twin External Solver", () => {
  it("declares 12I version identity and pins 12H", () => {
    expect(DIGITAL_TWIN_VERSION).toBe("1.0.0");
    expect(DIGITAL_TWIN_STATUS).toBe("ga");
    expect(DIGITAL_TWIN_PHASE).toBe("12N");
    expect(PHASE_12H_CERTIFIED_COMMIT).toBe("f276dbb15b3a68d2863b3547a2dc58aa1ef3afbe");
    expect(PHASE_12H_HOSTED_RUN).toBe("31263802033");
    expect(PHASE_12H_VERSION).toBe("0.8.0-simulation-assurance");
    expect(PHASE_12J_READY).toBe(true);
  });

  it("enables external adapter flags with no silent fallback", () => {
    expect(EXTERNAL_ENGINEERING_SOLVER_ADAPTERS_IMPLEMENTED).toBe(true);
    expect(EXTERNAL_SOLVER_ADAPTER_FRAMEWORK_READY).toBe(true);
    expect(FIRST_REAL_ENGINEERING_SOLVER_ADAPTER_IMPLEMENTED).toBe(true);
    expect(FIRST_REAL_SOLVER_ID).toBe("calculix");
    expect(SILENT_SOLVER_FALLBACK_ALLOWED).toBe(false);
    expect(NATIVE_ENGINEERING_SOLVER_IMPLEMENTED).toBe(false);
    expect(assertSimulationForbiddenCapabilities().silentSolverFallbackAllowed).toBe(false);
    expect(assertOwnershipLock().externalEngineeringSolverAdaptersImplemented).toBe(true);
    expect(assertOwnershipLock().engineeringSolverOwnership).toBe("external_engineering_tool");
  });

  it("keeps reserved solvers unavailable", () => {
    expect(assertReservedSolversUnavailable().ok).toBe(true);
  });

  it("rejects silent fixture fallback for real providers", () => {
    expect(() =>
      assertNoSilentSolverFallback({
        providerType: "external_solver",
        providerKey: "calculix",
        usedFixtureInsteadOfReal: true,
      }),
    ).toThrow(/silent_solver_fallback_forbidden/);
    expect(() =>
      runDeterministicFixtureProvider({
        contentHash: "abc",
        timeoutMs: 1000,
        realSolverRequested: true,
      }),
    ).toThrow(/silent_solver_fallback_forbidden/);
  });

  it("fail-closes unknown defaults and unit mismatch", () => {
    expect(() => assertDefaultsManifest({ version: "nope" } as never)).toThrow();
    expect(
      mapLinearElasticStaticInput({
        methodKey: LINEAR_ELASTIC_STATIC_METHOD_KEY,
        unitSystem: "US" as "SI",
        unitCode: "lbf_in" as "N_m",
        youngsModulusPa: 1,
        poissonsRatio: 0.3,
        sectionAreaM2: 1,
        lengthM: 1,
        loadN: 1,
        boundaryCondition: "axial_bar_unit_load",
      }).ok,
    ).toBe(false);
  });

  it("defines axial bar analytical benchmark", () => {
    const expected = analyticalAxialBarDisplacementM({
      loadN: CALCULIX_LINEAR_ELASTIC_DEFAULTS.loadN,
      lengthM: CALCULIX_LINEAR_ELASTIC_DEFAULTS.lengthM,
      youngsModulusPa: CALCULIX_LINEAR_ELASTIC_DEFAULTS.youngsModulusPa,
      sectionAreaM2: CALCULIX_LINEAR_ELASTIC_DEFAULTS.sectionAreaM2,
    });
    expect(CALCULIX_AXIAL_BAR_BENCHMARK.expectedDisplacementM).toBeCloseTo(expected, 12);
    expect(CALCULIX_ADAPTER_VERSION).toBe("1.0.0");
    expect(CALCULIX_SOLVER_ID).toBe("calculix");
    expect(SOLVER_EXECUTION_DEFAULTS_MANIFEST_VERSION).toContain("calculix");
  });

  it("parses CalculiX .dat node displacements without mistaking node ids", () => {
    const dat = `
 displacements (vx,vy,vz) for set Nall and node:

         1  0.000000E+00  0.000000E+00  0.000000E+00
         2  4.761905E-07  0.000000E+00  0.000000E+00

`;
    const mapped = mapCalculixDatToLinearElasticOutput(dat);
    expect(mapped.parseOk).toBe(true);
    expect(mapped.maxDisplacementM).toBeCloseTo(4.761905e-7, 12);
    const rel =
      Math.abs((mapped.maxDisplacementM ?? 0) - CALCULIX_AXIAL_BAR_BENCHMARK.expectedDisplacementM) /
      CALCULIX_AXIAL_BAR_BENCHMARK.expectedDisplacementM;
    expect(rel).toBeLessThanOrEqual(0.05);
  });

  it("creates calculix provider as executable in 12I", () => {
    const p = createTwinSimulationProvider({
      providerId: randomUUID(),
      tenantId: randomUUID(),
      workspaceId: randomUUID(),
      providerKey: "calculix-ccx",
      displayName: "CalculiX",
      providerType: "external_solver",
      solverId: "calculix",
      engineeringToolRegistryRef: "platform-intelligence:ai_tools:calculix-ccx",
    });
    expect(p.executableInPhase12I).toBe(true);
    expect(p.claimsNativeEngineeringSolver).toBe(false);
  });

  it("runs negative benchmark cases without silent fallback", async () => {
    for (const c of [
      "invalid_input",
      "missing_bc",
      "unit_mismatch",
      "wrong_version",
      "unavailable",
    ] as const) {
      const r = await runNegativeBenchmark(c);
      expect(r.silentFallbackUsed).toBe(false);
      expect(r.ok).toBe(true);
    }
  });

  it("version probe fail-closed when binary missing", async () => {
    const prior = process.env.CALCULIX_CCX_PATH;
    process.env.CALCULIX_CCX_PATH = join(tmpdir(), "ccx-missing-binary");
    try {
      const adapter = createCalculiXSolverAdapter();
      const probe = await adapter.versionProbe();
      expect(probe.ok).toBe(false);
      const health = await adapter.healthCheck();
      expect(health.healthy).toBe(false);
    } finally {
      if (prior === undefined) delete process.env.CALCULIX_CCX_PATH;
      else process.env.CALCULIX_CCX_PATH = prior;
    }
  });

  it("optionally executes CalculiX when installed", async () => {
    const adapter = createCalculiXSolverAdapter();
    const health = await adapter.healthCheck();
    if (!health.healthy) {
      expect(health.healthy).toBe(false);
      return;
    }
    const dir = mkdtempSync(join(tmpdir(), "dt12i-unit-"));
    const result = await adapter.execute({
      requestId: randomUUID(),
      adapterId: adapter.adapterId,
      solverId: "calculix",
      methodKey: LINEAR_ELASTIC_STATIC_METHOD_KEY,
      artifactDir: dir,
      inputArtifactRefs: [],
      timeoutMs: 60_000,
      unitSystem: "SI",
      unitCode: "N_m",
      defaultsManifestVersion: SOLVER_EXECUTION_DEFAULTS_MANIFEST_VERSION,
    });
    expect(result.silentFallbackUsed).toBe(false);
    expect(result.nativeSolverInvoked).toBe(false);
    expect(["completed", "completed_with_warnings", "failed", "timeout"]).toContain(
      result.status,
    );
  }, 90_000);
});
