/**
 * E10 profile evaluation — ESSENTIAL / PROFESSIONAL / ENTERPRISE.
 */

import type { DeploymentProfile } from "../phase-e10/contracts";
import { getEngineeringProfileContract } from "../phase-e10/profiles";
import { resolveCapabilityVisibility } from "../phase-e10/visibility";
import { resolveDegradation } from "../phase-e10/degradation";
import { buildPerformanceBudgets, evaluateAgainstBudgets } from "./performance-budgets";
import { runAllBenchmarkTasks } from "./benchmark-tasks";

export type ProfileEvaluationResult = {
  profileId: DeploymentProfile;
  essentialZeroConnectorIndependent: boolean;
  enterpriseServicesRequired: boolean;
  optionalDegradesSafely: boolean;
  nativeAskWithinBudget: boolean;
  passed: boolean;
  detail: string;
};

export function evaluateProfile(profileId: DeploymentProfile): ProfileEvaluationResult {
  const profile = getEngineeringProfileContract(profileId);
  const bench = runAllBenchmarkTasks();
  const budgets = buildPerformanceBudgets();
  const navBudget = budgets.find((b) => b.surface === "navigation")!;
  const askBudget = budgets.find((b) => b.surface === "total_ask_response")!;

  // Simulated native Ask path latency (fixture) — enterprise connector path excluded.
  const nativeAskMs = 280;
  const nativeAskWithinBudget = evaluateAgainstBudgets({
    surface: "total_ask_response",
    observedMs: nativeAskMs,
    budgets,
  }).withinBudget;

  const enterpriseRequired =
    profile.connectorPolicy === "DISABLED"
      ? false
      : resolveCapabilityVisibility({
          profileId,
          capabilityKey: "enterprise_connectors",
          audience: "engineer",
          entitledKeys: ["engineering-os"],
        }).usable === true;

  let optionalDegradesSafely = true;
  if (profileId === "PROFESSIONAL") {
    const deg = resolveDegradation("connector_outage", "PROFESSIONAL");
    const intel = resolveDegradation("intelligence_pack_unavailable", "PROFESSIONAL");
    optionalDegradesSafely = deg.continueNativeEos && intel.continueNativeEos;
  }
  if (profileId === "ENTERPRISE") {
    const deg = resolveDegradation("connector_outage", "ENTERPRISE");
    // Native path must remain within Ask budget even if connector budget is higher.
    const connectorNonBlocking = budgets.find(
      (b) => b.surface === "connector_retrieval",
    )!.nonBlockingForNavigation;
    optionalDegradesSafely = deg.continueNativeEos && connectorNonBlocking;
  }

  const essentialZero =
    profileId !== "ESSENTIAL" ||
    (profile.connectorPolicy === "DISABLED" && !enterpriseRequired);

  const passed =
    bench.allPassed &&
    nativeAskWithinBudget &&
    optionalDegradesSafely &&
    (profileId !== "ESSENTIAL" || essentialZero) &&
    (profileId !== "ESSENTIAL" || !enterpriseRequired);

  return {
    profileId,
    essentialZeroConnectorIndependent: essentialZero,
    enterpriseServicesRequired: enterpriseRequired,
    optionalDegradesSafely,
    nativeAskWithinBudget,
    passed,
    detail: `navBudget=${navBudget.budgetMs}ms askBudget=${askBudget.budgetMs}ms nativeAsk=${nativeAskMs}ms connectorPolicy=${profile.connectorPolicy}`,
  };
}

export function runProfileEvaluations(): {
  results: ProfileEvaluationResult[];
  allPassed: boolean;
} {
  const results = (["ESSENTIAL", "PROFESSIONAL", "ENTERPRISE"] as const).map(
    evaluateProfile,
  );
  return { results, allPassed: results.every((r) => r.passed) };
}
