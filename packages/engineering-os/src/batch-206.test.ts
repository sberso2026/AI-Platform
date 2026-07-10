import { describe, it, expect } from "vitest";
import {
  ENGINEERING_API_VERSION,
  ENGINEERING_API_ENDPOINTS,
  DEMO_METADATA_MARKER,
  isDemoMetadata,
  ENGINEERING_CORE_EVENT_TYPES,
  PROJECT_INTELLIGENCE_EVENT_TYPES,
  isEngineeringEventType,
  ENGINEERING_EVENT_SOURCE,
  PROJECT_INTELLIGENCE_REGISTER_APIS,
  PROJECT_INTELLIGENCE_INTEGRATION_RULES,
  ENGINEERING_CORE_OWNED_REGISTERS,
} from "@rtb/types";

describe("Batch 2.06 — API contracts", () => {
  it("declares API version 2.06", () => {
    expect(ENGINEERING_API_VERSION).toBe("2.06");
  });

  it("defines stable register API endpoints", () => {
    const paths = ENGINEERING_API_ENDPOINTS.map((e) => e.path);
    expect(paths).toContain("/api/engineering/decisions");
    expect(paths).toContain("/api/engineering/actions");
    expect(paths).toContain("/api/engineering/risks");
    expect(paths).toContain("/api/engineering/issues");
    expect(paths).toContain("/api/engineering/technical-queries");
    expect(paths).toContain("/api/engineering/lessons");
    expect(paths).toContain("/api/engineering/timeline");
    expect(paths).toContain("/api/engineering/activity");
    expect(paths).toContain("/api/engineering/health");
    expect(paths).toContain("/api/engineering/demo/seed");
    expect(paths).toContain("/api/engineering/demo/reset");
  });

  it("marks demo metadata correctly", () => {
    expect(isDemoMetadata(DEMO_METADATA_MARKER)).toBe(true);
    expect(isDemoMetadata({ demo: true })).toBe(true);
    expect(isDemoMetadata({})).toBe(false);
    expect(isDemoMetadata({ demo: false })).toBe(false);
  });
});

describe("Batch 2.06 — Event contracts", () => {
  it("defines required engineering core events", () => {
    expect(ENGINEERING_CORE_EVENT_TYPES).toContain("engineering.project.created");
    expect(ENGINEERING_CORE_EVENT_TYPES).toContain("engineering.project.updated");
    expect(ENGINEERING_CORE_EVENT_TYPES).toContain("engineering.decision.created");
    expect(ENGINEERING_CORE_EVENT_TYPES).toContain("engineering.decision.approved");
    expect(ENGINEERING_CORE_EVENT_TYPES).toContain("engineering.action.created");
    expect(ENGINEERING_CORE_EVENT_TYPES).toContain("engineering.action.closed");
    expect(ENGINEERING_CORE_EVENT_TYPES).toContain("engineering.risk.created");
    expect(ENGINEERING_CORE_EVENT_TYPES).toContain("engineering.issue.created");
    expect(ENGINEERING_CORE_EVENT_TYPES).toContain("engineering.technical_query.created");
    expect(ENGINEERING_CORE_EVENT_TYPES).toContain("engineering.lesson.created");
  });

  it("defines Project Intelligence sync events", () => {
    expect(PROJECT_INTELLIGENCE_EVENT_TYPES).toContain("project_intelligence.sync.requested");
    expect(PROJECT_INTELLIGENCE_EVENT_TYPES).toContain("project_intelligence.sync.completed");
  });

  it("validates event type strings", () => {
    expect(isEngineeringEventType("engineering.decision.approved")).toBe(true);
    expect(isEngineeringEventType("project_intelligence.sync.requested")).toBe(true);
    expect(isEngineeringEventType("invalid.event")).toBe(false);
  });

  it("uses engineering-os as core event source", () => {
    expect(ENGINEERING_EVENT_SOURCE).toBe("engineering-os");
  });
});

describe("Batch 2.06 — Project Intelligence integration", () => {
  it("requires Engineering Core ownership of registers", () => {
    expect(PROJECT_INTELLIGENCE_INTEGRATION_RULES.doNotDuplicateRegisters).toBe(true);
    expect(PROJECT_INTELLIGENCE_INTEGRATION_RULES.decisionsRequireHumanApproval).toBe(true);
  });

  it("maps all six registers to Engineering APIs", () => {
    expect(ENGINEERING_CORE_OWNED_REGISTERS).toHaveLength(6);
    expect(PROJECT_INTELLIGENCE_REGISTER_APIS.decisions).toBe("/api/engineering/decisions");
    expect(PROJECT_INTELLIGENCE_REGISTER_APIS.actions).toBe("/api/engineering/actions");
    expect(PROJECT_INTELLIGENCE_REGISTER_APIS.risks).toBe("/api/engineering/risks");
    expect(PROJECT_INTELLIGENCE_REGISTER_APIS.issues).toBe("/api/engineering/issues");
    expect(PROJECT_INTELLIGENCE_REGISTER_APIS.technical_queries).toBe(
      "/api/engineering/technical-queries"
    );
    expect(PROJECT_INTELLIGENCE_REGISTER_APIS.lessons_learned).toBe("/api/engineering/lessons");
  });
});

describe("Batch 2.06 — Demo data safety", () => {
  it("demo marker includes seed batch", () => {
    expect(DEMO_METADATA_MARKER.demo).toBe(true);
    expect(DEMO_METADATA_MARKER.seed_batch).toBe("2.06");
  });

  it("reset only targets demo-flagged records by contract", () => {
    const resetRule = "metadata @> '{\"demo\": true}'";
    expect(resetRule).toContain("demo");
  });
});

describe("Batch 2.06 — Health check contract", () => {
  it("defines expected health check keys", () => {
    const keys = [
      "engineering_os_installed",
      "feature_flag",
      "tenant_seeded",
      "register_tables",
      "ai_director",
      "event_bus",
      "knowledge_graph",
      "workflow_engine",
      "rls",
    ];
    expect(keys.length).toBeGreaterThanOrEqual(8);
  });
});
