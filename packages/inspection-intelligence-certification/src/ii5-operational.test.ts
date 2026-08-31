import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AI_INSPECTION_ENGINEER_AUTONOMOUS_APPROVAL,
  AI_INSPECTION_ENGINEER_AUTONOMOUS_CERTIFICATION,
  AI_INSPECTION_ENGINEER_AUTONOMOUS_REMEDIATION,
  AI_INSPECTION_ENGINEER_EXTERNAL_WRITES,
  CROSS_TENANT_AI_ACCESS,
  DIRECT_PROVIDER_ACCESS_FROM_II,
  DUPLICATE_AGENT_RUNTIME_DETECTED,
  DUPLICATE_KNOWLEDGE_GRAPH_DETECTED,
  DUPLICATE_MEMORY_STACK_DETECTED,
  DUPLICATE_MODEL_REGISTRY_DETECTED,
  DUPLICATE_PROMPT_REGISTRY_DETECTED,
  DUPLICATE_TOOL_REGISTRY_DETECTED,
  II_5_IMPLEMENTED,
  II_6_READY,
  II_AI_INSPECTION_ENGINEER_IMPLEMENTED,
  II_COMMAND_CENTRE_IMPLEMENTED,
  II_ENGINEER_PLATFORM_TOOL_KEYS,
  II_PERFORMANCE_GA_BLOCKER_OPEN,
  IMPLEMENTS_OWN_AI_STACK,
  INSPECTION_INTELLIGENCE_II_5_IMPLEMENTED,
  SCHEMA_CHANGED,
  UNRESTRICTED_GRAPH_ACCESS,
} from "@rtb/inspection-intelligence";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("II-5 AI Inspection Engineer certification", () => {
  it("exposes the engineer surface through Platform AI without a private stack or schema", () => {
    expect(INSPECTION_INTELLIGENCE_II_5_IMPLEMENTED).toBe(true);
    expect(II_5_IMPLEMENTED).toBe(true);
    expect(II_6_READY).toBe(true);
    expect(II_AI_INSPECTION_ENGINEER_IMPLEMENTED).toBe(true);
    expect(II_COMMAND_CENTRE_IMPLEMENTED).toBe(false);
    expect(IMPLEMENTS_OWN_AI_STACK).toBe(false);
    expect(DUPLICATE_AGENT_RUNTIME_DETECTED).toBe(false);
    expect(DUPLICATE_PROMPT_REGISTRY_DETECTED).toBe(false);
    expect(DUPLICATE_MODEL_REGISTRY_DETECTED).toBe(false);
    expect(DUPLICATE_TOOL_REGISTRY_DETECTED).toBe(false);
    expect(DUPLICATE_KNOWLEDGE_GRAPH_DETECTED).toBe(false);
    expect(DUPLICATE_MEMORY_STACK_DETECTED).toBe(false);
    expect(DIRECT_PROVIDER_ACCESS_FROM_II).toBe(false);
    expect(UNRESTRICTED_GRAPH_ACCESS).toBe(false);
    expect(CROSS_TENANT_AI_ACCESS).toBe(false);
    expect(AI_INSPECTION_ENGINEER_EXTERNAL_WRITES).toBe(false);
    expect(AI_INSPECTION_ENGINEER_AUTONOMOUS_APPROVAL).toBe(false);
    expect(AI_INSPECTION_ENGINEER_AUTONOMOUS_CERTIFICATION).toBe(false);
    expect(AI_INSPECTION_ENGINEER_AUTONOMOUS_REMEDIATION).toBe(false);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(II_PERFORMANCE_GA_BLOCKER_OPEN).toBe(true);
    expect(II_ENGINEER_PLATFORM_TOOL_KEYS).toHaveLength(12);
    expect(
      existsSync(
        resolve(ROOT, "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/engineer/page.tsx"),
      ),
    ).toBe(true);
    const hosted = readFileSync(
      resolve(ROOT, "apps/web/src/lib/inspection-intelligence/ai-inspection-engineer-service.ts"),
      "utf8",
    );
    expect(hosted).toContain("kernel.aiDirector.run");
    expect(hosted).toContain("ensureActivePrompt");
    expect(hosted).toContain("upsertCatalogAgent");
    expect(hosted).toContain("models.resolveRoute");
    expect(hosted).not.toContain("new OpenAI");
    expect(hosted).not.toContain("createServiceClient");
    const repo = readFileSync(resolve(ROOT, "packages/inspection-intelligence/src/hosted/repository.ts"), "utf8");
    expect(repo).not.toContain("create table");
  });
});
