import { describe, expect, it } from "vitest";
import { KnowledgeGraphService } from "./knowledge-graph-service";

describe("Platform Kernel Knowledge Graph", () => {
  it("exposes idempotent projection helpers on the existing service", () => {
    expect(typeof KnowledgeGraphService.prototype.upsertNode).toBe("function");
    expect(typeof KnowledgeGraphService.prototype.upsertEdge).toBe("function");
    expect(typeof KnowledgeGraphService.prototype.findNodeBySourceRef).toBe("function");
    expect(typeof KnowledgeGraphService.prototype.loadWorkspaceSnapshot).toBe("function");
    expect(typeof KnowledgeGraphService.prototype.searchNodes).toBe("function");
    expect(typeof KnowledgeGraphService.prototype.deleteNode).toBe("function");
  });

  it("does not introduce a second graph class", () => {
    const src = Object.getOwnPropertyNames(KnowledgeGraphService.prototype);
    expect(src).toContain("createNode");
    expect(src).toContain("createEdge");
    expect(src).toContain("upsertNode");
  });
});
