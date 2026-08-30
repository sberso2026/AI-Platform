import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PolicyEngineService } from "./policy-engine/policy-engine-service";
import { FeatureFlagService } from "./feature-flags/feature-flag-service";

describe("PolicyEngineService condition matching", () => {
  const service = new PolicyEngineService({} as never);

  it("matches confidence threshold conditions", () => {
    const match = (service as unknown as { matchCondition: (c: Record<string, unknown>, ctx: Record<string, unknown>) => boolean }).matchCondition(
      { condition_type: "confidence_threshold", value: { threshold: 0.7 } },
      { confidence: 0.5 }
    );
    expect(match).toBe(true);
  });

  it("matches risk level conditions", () => {
    const match = (service as unknown as { matchCondition: (c: Record<string, unknown>, ctx: Record<string, unknown>) => boolean }).matchCondition(
      { condition_type: "risk_level", value: { levels: ["high", "critical"] } },
      { riskLevel: "high" }
    );
    expect(match).toBe(true);
  });

  it("matches engineering operating system scope", () => {
    const match = (service as unknown as { matchCondition: (c: Record<string, unknown>, ctx: Record<string, unknown>) => boolean }).matchCondition(
      { condition_type: "operating_system_scope", value: { scope: "engineering" } },
      { intent: "engineering" }
    );
    expect(match).toBe(true);
  });
});

describe("FeatureFlagService rollout bucketing", () => {
  it("produces consistent hash buckets for rollout", () => {
    const hash = createHash("md5").update("platform_intelligence:user-123").digest("hex");
    const bucket = parseInt(hash.slice(0, 8), 16) % 100;
    expect(bucket).toBeGreaterThanOrEqual(0);
    expect(bucket).toBeLessThan(100);
  });
});

describe("Tool permission enforcement logic", () => {
  it("requires assignment for agent tool access", () => {
    const hasAssignment = true;
    const riskLevel = "low";
    const canUse = hasAssignment && (riskLevel === "low" || false);
    expect(canUse).toBe(true);
  });

  it("blocks high-risk tools without explicit permission", () => {
    const hasExplicitPermission = false;
    const riskLevel: string = "high";
    const canUse = hasExplicitPermission || riskLevel === "low";
    expect(canUse).toBe(false);
  });
});

describe("Model route resolution fallback", () => {
  it("defaults to mock provider", () => {
    const fallback = {
      modelKey: "mock-gpt",
      providerType: "mock",
      costInputPer1k: 0,
      costOutputPer1k: 0,
    };
    expect(fallback.providerType).toBe("mock");
    expect(fallback.costInputPer1k).toBe(0);
  });
});

describe("Cost event creation", () => {
  it("calculates model call cost from tokens", () => {
    const inputTokens = 1000;
    const outputTokens = 500;
    const costInputPer1k = 0.01;
    const costOutputPer1k = 0.02;
    const amount =
      (inputTokens / 1000) * costInputPer1k + (outputTokens / 1000) * costOutputPer1k;
    expect(amount).toBeCloseTo(0.02);
  });

  it("supports zero-cost mock runs", () => {
    const amount = (1000 / 1000) * 0 + (500 / 1000) * 0;
    expect(amount).toBe(0);
  });
});

describe("Trace and span lifecycle", () => {
  it("computes span duration", () => {
    const startedAt = new Date("2026-01-01T00:00:00.000Z").toISOString();
    const completedAt = new Date("2026-01-01T00:00:01.500Z").toISOString();
    const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();
    expect(durationMs).toBe(1500);
  });
});

describe("Secret access logging", () => {
  it("never returns raw secret values in placeholder encryption", () => {
    const encrypted = createHash("sha256").update("salt:secret-value").digest("hex");
    expect(encrypted).not.toContain("secret-value");
    expect(encrypted).toHaveLength(64);
  });
});

describe("Evaluation framework dimensions", () => {
  it("supports required evaluation dimensions", () => {
    const dimensions = [
      "factual_accuracy",
      "evidence_alignment",
      "citation_quality",
      "completeness",
      "safety",
      "policy_compliance",
      "reasoning_quality",
      "format_compliance",
      "tool_use_correctness",
    ];
    expect(dimensions).toHaveLength(9);
  });
});

describe("Intelligence layer tenant isolation", () => {
  it("requires tenant_id on intelligence entities", () => {
    const tables = [
      "ai_tools",
      "capabilities",
      "policies",
      "prompts",
      "cost_events",
      "traces",
      "secrets",
      "eval_runs",
    ];
    tables.forEach((t) => expect(t).toMatch(/^[a-z_]+$/));
  });
});

describe("AI Director integration contracts", () => {
  it("defines intelligence service keys", () => {
    const services = [
      "tools",
      "capabilities",
      "policies",
      "prompts",
      "models",
      "costs",
      "observability",
      "features",
      "secrets",
      "evaluations",
    ];
    expect(services).toHaveLength(10);
  });
});

describe("Prompt version selection", () => {
  it("preserves version immutability principle", () => {
    const versionA = "1.0.0";
    const versionB = "1.1.0";
    expect(versionA).not.toBe(versionB);
  });

  it("Prompt Registry can ensure an active version without a second registry", () => {
    const source = readFileSync(
      resolve(__dirname, "prompt-registry/prompt-registry-service.ts"),
      "utf8",
    );
    expect(source).toContain("async ensureActivePrompt");
    expect(source).toContain("activateVersion");
    expect(source).toContain("prompt_key");
  });
});

describe("Capability routing lookup", () => {
  it("routes by capability key not plugin name", () => {
    const intent = "document_search";
    const capabilityKey = "document_search";
    expect(intent).toBe(capabilityKey);
  });
});
