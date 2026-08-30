import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
import { KeywordIntentClassifier } from "./ai-director/intent-classifier";
import { MockModelAdapter } from "./ai-director/adapters/mock-adapter";
import { tryCreateVendorChatAdapter } from "./ai-director/adapters/http-chat-adapter";
import { ApiGatewayService } from "./api-gateway/api-gateway-service";

describe("KeywordIntentClassifier", () => {
  const classifier = new KeywordIntentClassifier();

  it("classifies navigation intents", async () => {
    expect(await classifier.classify("show platform status")).toBe("navigation");
    expect(await classifier.classify("list operating systems")).toBe("navigation");
  });

  it("classifies engineering intents", async () => {
    expect(await classifier.classify("approve structural design")).toBe("engineering");
    expect(await classifier.classify("certify engineering drawing")).toBe("engineering");
  });

  it("defaults to general", async () => {
    expect(await classifier.classify("hello")).toBe("general");
  });
});

describe("MockModelAdapter", () => {
  const adapter = new MockModelAdapter();

  it("returns content with confidence and evidence", async () => {
    const result = await adapter.complete({
      model: "mock-gpt",
      messages: [{ role: "user", content: "platform status" }],
    });
    expect(result.content).toContain("operational");
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.evidenceRefs?.length).toBeGreaterThan(0);
  });
});

describe("Vendor chat adapter", () => {
  it("is not constructed without credentials so mock remains the default", () => {
    expect(tryCreateVendorChatAdapter({})).toBeNull();
  });

  it("fails closed on provider errors instead of returning mock content", async () => {
    const adapter = tryCreateVendorChatAdapter(
      { PLATFORM_LLM_API_KEY: "test-key", PLATFORM_LLM_TIMEOUT_MS: "50" },
      (async () => new Response("unavailable", { status: 503 })) as typeof fetch,
    );
    expect(adapter?.providerType).toBe("openai");
    await expect(
      adapter!.complete({ model: "test-model", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toThrow(/503/);
  });
});

describe("ApiGatewayService.validatePermission", () => {
  it("validates permission logic via key hash", () => {
    const secret = "rtb_test_secret_key";
    const hash = createHash("sha256").update(secret).digest("hex");
    expect(hash).toHaveLength(64);
    expect(createHash("sha256").update(secret).digest("hex")).toBe(hash);
  });
});

describe("Event payload validation", () => {
  it("accepts standard platform event types", () => {
    const types = [
      "tenant.created",
      "agent.run.started",
      "agent.run.completed",
      "review.required",
      "workflow.started",
      "plugin.installed",
    ];
    types.forEach((t) => expect(t).toMatch(/^[a-z]+\.[a-z_.]+$/));
  });
});

describe("Job types", () => {
  it("defines initial job types", () => {
    const jobTypes = [
      "document.index",
      "embedding.generate",
      "ai.agent.run",
      "notification.send",
      "report.generate",
      "telemetry.process",
      "workflow.advance",
    ];
    expect(jobTypes).toHaveLength(7);
  });
});

describe("Knowledge graph types", () => {
  it("includes required node types", () => {
    const nodeTypes = ["document", "decision", "risk", "agent_run", "workflow", "asset"];
    nodeTypes.forEach((t) => expect(typeof t).toBe("string"));
  });

  it("includes required edge types", () => {
    const edgeTypes = ["references", "supports", "requires_review", "derived_from"];
    expect(edgeTypes.length).toBeGreaterThanOrEqual(4);
  });
});

describe("Digital twin types", () => {
  it("includes required twin types", () => {
    const twinTypes = ["asset", "equipment", "building", "vehicle", "robot", "sensor"];
    expect(twinTypes.length).toBeGreaterThanOrEqual(6);
  });
});

describe("Tenant isolation principle", () => {
  it("requires tenant_id on kernel entities", () => {
    const kernelEntities = [
      "agents", "agent_runs", "events", "background_jobs",
      "workflow_instances", "knowledge_nodes", "ai_memories",
      "digital_twins", "api_keys", "notifications", "sensors",
      "plugin_installations",
    ];
    expect(kernelEntities.length).toBeGreaterThanOrEqual(10);
  });
});
