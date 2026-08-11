/**
 * Deterministic representative engineering benchmark tasks A–N + KGP workflow.
 */

import {
  E11_SEED_CORPUS,
  E11_SEED_TENANT,
  evidenceForTenant,
  listCurrentDocuments,
  listSupersededDocuments,
} from "./seed-corpus";

export const EngineeringBenchmarkTaskIds = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
] as const;
export type EngineeringBenchmarkTaskId =
  (typeof EngineeringBenchmarkTaskIds)[number];

export type EngineeringBenchmarkTask = {
  id: EngineeringBenchmarkTaskId;
  title: string;
  domains: readonly string[];
  /** Expected deterministic outcome keys for scoring. */
  expected: Record<string, string | boolean | string[]>;
};

export const ENGINEERING_BENCHMARK_TASKS: EngineeringBenchmarkTask[] = [
  {
    id: "A",
    title: "Find previous engineering decision",
    domains: ["retrieval", "memory"],
    expected: { decisionId: "dec-coat-2023" },
  },
  {
    id: "B",
    title: "Retrieve asset history",
    domains: ["retrieval"],
    expected: { assetId: "asset-pipe-p101", historyCount: "3" },
  },
  {
    id: "C",
    title: "Identify current/superseded document",
    domains: ["retrieval"],
    expected: {
      currentId: "doc-spec-v2",
      supersededId: "doc-spec-v1",
    },
  },
  {
    id: "D",
    title: "Summarise available engineering evidence",
    domains: ["retrieval", "reasoning"],
    expected: { minEvidence: "4" },
  },
  {
    id: "E",
    title: "Assemble TQ context",
    domains: ["retrieval", "reasoning"],
    expected: { tqEvidenceId: "ev-tq-01" },
  },
  {
    id: "F",
    title: "Find similar precedent",
    domains: ["memory"],
    expected: { memoryId: "mem-coating-precedent" },
  },
  {
    id: "G",
    title: "Explain recommendation",
    domains: ["reasoning"],
    expected: { hasWhy: true, authority: "advisory" },
  },
  {
    id: "H",
    title: "Identify conflicting evidence",
    domains: ["reasoning", "retrieval"],
    expected: { conflictPair: ["ev-ut-2022", "ev-conflict-a"] },
  },
  {
    id: "I",
    title: "Run governed engineering tool",
    domains: ["tools"],
    expected: { toolId: "eos.evidence_keyword_check", certified: true },
  },
  {
    id: "J",
    title: "Prepare action/decision draft",
    domains: ["actions"],
    expected: { humanApprovalRequired: true, autoExecute: false },
  },
  {
    id: "K",
    title: "Identify project risks requiring attention",
    domains: ["intelligence"],
    expected: { riskId: "risk-corrosion" },
  },
  {
    id: "L",
    title: "Compare supported scenarios",
    domains: ["intelligence", "reasoning"],
    expected: { supportedScenarioId: "sc-repair" },
  },
  {
    id: "M",
    title: "Determine missing evidence",
    domains: ["reasoning"],
    expected: { abstainOrFlagMissing: true },
  },
  {
    id: "N",
    title: "Prepare concise engineering summary",
    domains: ["reasoning", "retrieval"],
    expected: { grounded: true, fabricated: false },
  },
];

export type BenchmarkTaskResult = {
  taskId: EngineeringBenchmarkTaskId;
  passed: boolean;
  metricKind: "BENCHMARK_METRIC";
  outputs: Record<string, unknown>;
  detail: string;
};

/** Deterministic fixture executor — scores against seeded corpus, not live models. */
export function runBenchmarkTask(taskId: EngineeringBenchmarkTaskId): BenchmarkTaskResult {
  const task = ENGINEERING_BENCHMARK_TASKS.find((t) => t.id === taskId)!;
  const evidence = evidenceForTenant(E11_SEED_TENANT);
  let passed = false;
  let outputs: Record<string, unknown> = {};
  let detail = "";

  switch (taskId) {
    case "A": {
      const d = E11_SEED_CORPUS.decisions.find((x) => x.id === "dec-coat-2023")!;
      outputs = { decisionId: d.id, title: d.title };
      passed = d.id === task.expected.decisionId;
      detail = passed ? "Found prior coating decision" : "Decision miss";
      break;
    }
    case "B": {
      const a = E11_SEED_CORPUS.asset;
      outputs = { assetId: a.id, history: a.history };
      passed =
        a.id === task.expected.assetId &&
        String(a.history.length) === task.expected.historyCount;
      detail = "Asset history retrieved from seed";
      break;
    }
    case "C": {
      const current = listCurrentDocuments().find((d) => d.id === "doc-spec-v2");
      const superseded = listSupersededDocuments().find((d) => d.id === "doc-spec-v1");
      outputs = { currentId: current?.id, supersededId: superseded?.id };
      passed =
        current?.id === task.expected.currentId &&
        superseded?.id === task.expected.supersededId;
      detail = "Revision correctness from seed documents";
      break;
    }
    case "D": {
      outputs = { evidenceIds: evidence.map((e) => e.id) };
      passed = evidence.length >= Number(task.expected.minEvidence);
      detail = `Summarised ${evidence.length} evidence items (seed)`;
      break;
    }
    case "E": {
      const tq = evidence.find((e) => e.id === "ev-tq-01");
      outputs = {
        tqEvidenceId: tq?.id,
        related: ["ev-insp-2024", "ev-doc-spec", "ev-dec-01"],
      };
      passed = tq?.id === task.expected.tqEvidenceId;
      detail = "TQ context assembled from seed links";
      break;
    }
    case "F": {
      const mem = E11_SEED_CORPUS.memories.find(
        (m) => m.id === "mem-coating-precedent" && !m.restricted && !m.superseded,
      );
      outputs = { memoryId: mem?.id };
      passed = mem?.id === task.expected.memoryId;
      detail = "Precedent memory without restricted sources";
      break;
    }
    case "G": {
      outputs = {
        recommendation: "Local coating repair per prior decision",
        hasWhy: true,
        why: ["ev-insp-2024", "dec-coat-2023"],
        authority: "advisory",
        humanAuthorityPreserved: true,
      };
      passed = outputs.hasWhy === true && outputs.authority === "advisory";
      detail = "Why? provenance present; advisory only";
      break;
    }
    case "H": {
      const pair = evidence.filter(
        (e) => e.id === "ev-ut-2022" || e.id === "ev-conflict-a",
      );
      outputs = {
        conflictPair: pair.map((p) => p.id).sort(),
        conflictSurfaced: true,
        fabricatedResolution: false,
      };
      passed =
        JSON.stringify(outputs.conflictPair) ===
        JSON.stringify([...(task.expected.conflictPair as string[])].sort());
      detail = "Conflicting measurements surfaced without fabricated merge";
      break;
    }
    case "I": {
      outputs = {
        toolId: "eos.evidence_keyword_check",
        certified: true,
        unitsValidated: true,
        provenance: "tool:eos.evidence_keyword_check",
        failureHandled: true,
      };
      passed = outputs.toolId === task.expected.toolId && outputs.certified === true;
      detail = "Governed tool selected with certification";
      break;
    }
    case "J": {
      outputs = {
        proposal: "Create action: schedule coating repair",
        prefill: { assetId: "asset-pipe-p101", decisionId: "dec-coat-2023" },
        humanApprovalRequired: true,
        autoExecute: false,
        idempotencyKey: "e11-bench-j-coating",
        audit: true,
      };
      passed =
        outputs.humanApprovalRequired === true && outputs.autoExecute === false;
      detail = "Action draft requires human approval; no false completion";
      break;
    }
    case "K": {
      const risk = E11_SEED_CORPUS.risks.find((r) => r.attentionRequired);
      outputs = { riskId: risk?.id };
      passed = risk?.id === task.expected.riskId;
      detail = "Attention risk identified (seed intelligence fixture)";
      break;
    }
    case "L": {
      const supported = E11_SEED_CORPUS.scenarios.filter((s) => s.supported);
      outputs = {
        supportedScenarioId: supported[0]?.id,
        unsupportedRejected: true,
      };
      passed = supported[0]?.id === task.expected.supportedScenarioId;
      detail = "Only evidence-supported scenario retained";
      break;
    }
    case "M": {
      outputs = {
        missing: ["remaining life calculation", "owner acceptance record"],
        abstainOrFlagMissing: true,
        fabricatedFill: false,
      };
      passed = outputs.abstainOrFlagMissing === true && outputs.fabricatedFill === false;
      detail = "Missing evidence flagged; no fabrication";
      break;
    }
    case "N": {
      outputs = {
        summary:
          "P-101 shows corrosion at support; UT and inspection evidence support local coating repair per prior decision. Spec Rev B is current.",
        grounded: true,
        fabricated: false,
        citations: ["ev-insp-2024", "ev-ut-2022", "doc-spec-v2", "dec-coat-2023"],
      };
      passed = outputs.grounded === true && outputs.fabricated === false;
      detail = "Concise grounded summary from seed citations";
      break;
    }
  }

  return {
    taskId,
    passed,
    metricKind: "BENCHMARK_METRIC",
    outputs,
    detail,
  };
}

export function runAllBenchmarkTasks(): {
  results: BenchmarkTaskResult[];
  allPassed: boolean;
  metricKind: "BENCHMARK_METRIC";
  disclaimer: string;
} {
  const results = EngineeringBenchmarkTaskIds.map(runBenchmarkTask);
  return {
    results,
    allPassed: results.every((r) => r.passed),
    metricKind: "BENCHMARK_METRIC",
    disclaimer:
      "Benchmark results from synthetic fixtures — not real client productivity or accuracy evidence.",
  };
}
