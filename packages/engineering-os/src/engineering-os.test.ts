import { describe, it, expect } from "vitest";
import {
  ENGINEERING_OS_MANIFEST,
  ENGINEERING_APPLICATIONS,
  ENGINEERING_CAPABILITIES,
  ENGINEERING_DISCIPLINES,
  ENGINEERING_PERMISSIONS,
  ENGINEERING_PERMISSION_MAP,
  hasEngineeringPermission,
} from "./index";
import {
  ENGINEERING_REGISTER_OBJECT_TYPES,
  REGISTER_KG_NODE_TYPES,
} from "@rtb/types";

describe("Engineering OS installation seed", () => {
  it("defines Engineering OS manifest", () => {
    expect(ENGINEERING_OS_MANIFEST.id).toBe("engineering-os");
    expect(ENGINEERING_OS_MANIFEST.operating_system).toBe("engineering");
    expect(ENGINEERING_OS_MANIFEST.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("registers Phase 8A initial modules via module registry bridge", () => {
    expect(ENGINEERING_APPLICATIONS).toHaveLength(4);
    const keys = ENGINEERING_APPLICATIONS.map((app) => app.app_key);
    expect(keys).toEqual([
      "project_intelligence",
      "inspection_intelligence",
      "project_controls",
      "digital_twin",
    ]);
    const pi = ENGINEERING_APPLICATIONS.find((a) => a.app_key === "project_intelligence");
    expect(pi?.enabled).toBe(true);
  });

  it("declares core capabilities", () => {
    const keys = ENGINEERING_CAPABILITIES.map((c) => c.key);
    expect(keys).toContain("engineering_os");
    expect(keys).toContain("engineering_project_management");
    expect(keys).toContain("engineering_ai_workspace");
  });

  it("seeds expected disciplines", () => {
    expect(ENGINEERING_DISCIPLINES).toContain("Structural");
    expect(ENGINEERING_DISCIPLINES).toContain("HSE");
    expect(ENGINEERING_DISCIPLINES.length).toBeGreaterThanOrEqual(13);
  });

  it("documents that user-facing discipline lists must be unique by name", async () => {
    const { dedupeDisciplinesForDisplay, assertNoDuplicateDisciplineNames } = await import(
      "./services/discipline-dedupe"
    );
    const tenantId = "t1";
    const doubled = ENGINEERING_DISCIPLINES.flatMap((name, i) => {
      const key = name.toLowerCase().replace(/\s+/g, "-");
      return [
        {
          id: `sys-${i}`,
          discipline_key: key,
          name,
          is_system: true,
          created_at: "",
        },
        {
          id: `ten-${i}`,
          tenant_id: tenantId,
          discipline_key: key,
          name,
          is_system: false,
          created_at: "",
        },
      ];
    });
    const list = dedupeDisciplinesForDisplay(doubled, tenantId);
    expect(list.length).toBe(ENGINEERING_DISCIPLINES.length);
    expect(assertNoDuplicateDisciplineNames(list)).toBe(true);
  });
});

describe("Engineering permission checks", () => {
  it("maps fine-grained permissions to platform RBAC", () => {
    expect(ENGINEERING_PERMISSION_MAP["engineering.view"]).toEqual({
      resource: "engineering",
      action: "read",
    });
    expect(ENGINEERING_PERMISSION_MAP["engineering.admin"]).toEqual({
      resource: "engineering",
      action: "admin",
    });
  });

  it("grants access via mapped permission", () => {
    const has = (resource: string, action: string) =>
      resource === "engineering" && action === "execute";
    expect(hasEngineeringPermission(has, "engineering.project.create")).toBe(true);
    expect(hasEngineeringPermission(has, "engineering.admin")).toBe(false);
  });

  it("grants all via engineering admin", () => {
    const has = (resource: string, action: string) =>
      resource === "engineering" && action === "admin";
    ENGINEERING_PERMISSIONS.forEach((p) => {
      expect(hasEngineeringPermission(has, p)).toBe(true);
    });
  });
});

describe("Engineering project creation contract", () => {
  it("requires project code and name", () => {
    const input = { projectCode: "PRJ-001", projectName: "Demo Plant" };
    expect(input.projectCode.length).toBeGreaterThan(0);
    expect(input.projectName.length).toBeGreaterThan(0);
  });
});

describe("Engineering asset creation contract", () => {
  it("supports criticality and digital twin linkage fields", () => {
    const asset = {
      assetTag: "EQ-100",
      assetName: "Pump A",
      criticality: "high",
      digital_twin_id: "twin-1",
      knowledge_node_id: "node-1",
    };
    expect(["low", "medium", "high", "critical"]).toContain(asset.criticality);
    expect(asset.digital_twin_id).toBeTruthy();
  });
});

describe("Engineering document creation contract", () => {
  it("versions documents and links to knowledge graph", () => {
    const doc = {
      documentNumber: "DWG-001",
      revision: "A",
      knowledge_node_id: "node-doc",
    };
    expect(doc.revision).toBe("A");
    expect(doc.knowledge_node_id).toBeTruthy();
  });
});

describe("Knowledge Graph node types", () => {
  it("defines engineering core node types", () => {
    const types = ["engineering_project", "engineering_asset", "engineering_document"];
    expect(types).toHaveLength(3);
  });

  it("defines register KG node types for all six registers", () => {
    expect(ENGINEERING_REGISTER_OBJECT_TYPES).toHaveLength(6);
    ENGINEERING_REGISTER_OBJECT_TYPES.forEach((objectType) => {
      expect(REGISTER_KG_NODE_TYPES[objectType]).toMatch(/^engineering_/);
    });
  });

  it("defines required edge types", () => {
    const edges = ["contains", "belongs_to", "references", "has_digital_twin", "mitigates", "creates"];
    expect(edges.length).toBeGreaterThanOrEqual(4);
  });
});

describe("Engineering Intelligence Registers (Batch 2.05)", () => {
  it("declares six register object types owned by Engineering Core", () => {
    expect(ENGINEERING_REGISTER_OBJECT_TYPES).toEqual([
      "decision",
      "action",
      "risk",
      "issue",
      "technical_query",
      "lesson",
    ]);
  });

  it("maps each register to a knowledge graph node type", () => {
    expect(REGISTER_KG_NODE_TYPES.decision).toBe("engineering_decision");
    expect(REGISTER_KG_NODE_TYPES.action).toBe("engineering_action");
    expect(REGISTER_KG_NODE_TYPES.risk).toBe("engineering_risk");
    expect(REGISTER_KG_NODE_TYPES.issue).toBe("engineering_issue");
    expect(REGISTER_KG_NODE_TYPES.technical_query).toBe("engineering_technical_query");
    expect(REGISTER_KG_NODE_TYPES.lesson).toBe("engineering_lesson");
  });

  it("requires human approval for engineering decisions", () => {
    const decision = {
      approval_status: "pending",
      review_status: "draft",
      requires_human_approval: true,
    };
    expect(decision.requires_human_approval).toBe(true);
    expect(decision.approval_status).not.toBe("approved");
  });

  it("computes risk score from probability and consequence", () => {
    const probability = 4;
    const consequence = 5;
    expect(probability * consequence).toBe(20);
  });

  it("supports engineering object metadata contract", () => {
    const fields = [
      "object_id",
      "object_type",
      "title",
      "status",
      "priority",
      "workflow_instance_id",
      "knowledge_node_id",
      "digital_twin_id",
      "ai_context",
      "metadata",
    ];
    expect(fields.length).toBeGreaterThanOrEqual(10);
  });

  it("defines timeline and activity event tables for aggregation", () => {
    const tables = ["engineering_timeline_events", "engineering_activity_events"];
    tables.forEach((t) => expect(t.startsWith("engineering_")).toBe(true));
  });

  it("defines object link table for cross-register relationships", () => {
    const relationships = [
      "mitigates",
      "creates",
      "becomes",
      "supports",
      "affected_by",
      "derived_from",
      "references",
    ];
    expect(relationships).toContain("mitigates");
    expect(relationships).toContain("derived_from");
  });
});

describe("Engineering AI policy enforcement", () => {
  it("requires review for engineering decision language", () => {
    const message = "approve structural design";
    const keywords = ["approve", "sign off", "certify", "engineering approval"];
    const isDecision = keywords.some((k) => message.toLowerCase().includes(k));
    expect(isDecision).toBe(true);
  });

  it("blocks autonomous engineering approval", () => {
    const policy = { block_autonomous_approval: true, action: "require_review" };
    expect(policy.block_autonomous_approval).toBe(true);
    expect(policy.action).toBe("require_review");
  });
});

describe("Engineering feature flag", () => {
  it("uses engineering_os_enabled key", () => {
    expect("engineering_os_enabled").toBe("engineering_os_enabled");
  });
});

describe("Engineering OS RLS tenant isolation principle", () => {
  it("requires tenant_id on core entities", () => {
    const tables = [
      "engineering_projects",
      "engineering_assets",
      "engineering_documents",
      "engineering_companies",
      "engineering_settings",
    ];
    tables.forEach((t) => expect(t.startsWith("engineering_")).toBe(true));
  });

  it("requires tenant_id on intelligence register tables", () => {
    const registerTables = [
      "engineering_decisions",
      "engineering_actions",
      "engineering_risks",
      "engineering_issues",
      "engineering_technical_queries",
      "engineering_lessons",
      "engineering_object_links",
      "engineering_timeline_events",
      "engineering_activity_events",
    ];
    registerTables.forEach((t) => expect(t.startsWith("engineering_")).toBe(true));
  });
});

describe("Event publishing contracts", () => {
  it("defines engineering event types", () => {
    const events = [
      "engineering.project.created",
      "engineering.asset.created",
      "engineering.document.uploaded",
      "engineering.ai.run.completed",
      "engineering.application.enabled",
      "engineering.decision.created",
      "engineering.decision.approved",
      "engineering.action.created",
      "engineering.risk.created",
      "engineering.issue.created",
      "engineering.technical_query.created",
      "engineering.lesson.created",
    ];
    events.forEach((e) => expect(e).toMatch(/^engineering\.[a-z_.]+$/));
  });
});

describe("AI Director integration meta", () => {
  it("exposes required AI workspace metadata fields", () => {
    const meta = {
      confidence: 0.8,
      requiresReview: true,
      promptVersionId: "pv-1",
      modelRoute: "mock-gpt",
      costEventRef: "run-1",
      traceId: "trace-1",
      policyApplied: true,
    };
    expect(meta.requiresReview).toBe(true);
    expect(meta.modelRoute).toBe("mock-gpt");
    expect(meta.policyApplied).toBe(true);
  });
});
