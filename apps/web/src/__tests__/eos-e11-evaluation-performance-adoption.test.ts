/**
 * Phase E11 smoke — evaluation gates + metric separation.
 */
import { describe, expect, it } from "vitest";
import {
  PhaseE11BenchmarkIsNotRealUserKpi,
  PhaseE11NoUnsupportedProductivityClaims,
  buildEvaluationReport,
  phaseE11Ready,
  runAllBenchmarkTasks,
  runKgpBenchmark,
} from "@rtb/engineering-os";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("eos-e11-evaluation-performance-adoption", () => {
  it("exports E11 readiness and forbids benchmark-as-real-user claims", () => {
    expect(phaseE11Ready).toBe(true);
    expect(PhaseE11BenchmarkIsNotRealUserKpi).toBe(true);
    expect(PhaseE11NoUnsupportedProductivityClaims).toBe(true);
    const report = buildEvaluationReport();
    expect(report.adminOnly).toBe(true);
    expect(report.overallBenchmarkPassed).toBe(true);
    expect(runAllBenchmarkTasks().allPassed).toBe(true);
    expect(runKgpBenchmark().passed).toBe(true);
  });

  it("ships admin evaluation page and privacy-safe adoption helper", () => {
    const root = join(process.cwd(), "src");
    const page = readFileSync(
      join(root, "app/(platform)/engineering/evaluation/page.tsx"),
      "utf8",
    );
    const telemetry = readFileSync(
      join(root, "lib/engineering/adoption-telemetry.ts"),
      "utf8",
    );
    expect(page).toContain("BENCHMARK");
    expect(page).toContain("NOT_ENOUGH_DATA");
    expect(telemetry).toContain("containsHiddenCot");
    expect(telemetry).not.toMatch(/chain.of.thought|documentBody/i);
  });
});
