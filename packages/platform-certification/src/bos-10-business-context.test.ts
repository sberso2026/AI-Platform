import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BUSINESS_OS_RUNTIME_MANIFEST,
  createBusinessOS,
  implementsOwnAiStack,
  duplicateKnowledgeGraphDetected,
} from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("BOS-10 Business Context Graph", () => {
  it("reuses Platform Kernel Knowledge Graph and forbids a second AI/graph stack", () => {
    expect(implementsOwnAiStack).toBe(false);
    expect(duplicateKnowledgeGraphDetected).toBe(false);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-12");
    expect(bos.businessContextGraph).toBeDefined();
    expect(bos.capabilities.isImplemented("business_context")).toBe(true);
    expect(bos.capabilities.isImplemented("ai_workforce")).toBe(true);
    expect(bos.businessContextGraph.contract().reuses).toEqual([
      "platform_kernel_knowledge_graph",
      "platform_kernel_event_bus",
      "platform_kernel_ai_director",
    ]);
    expect(() => bos.businessContextGraph.executeRawGraphQuery()).toThrow("unrestricted_graph_query_forbidden");
    expect(() => bos.businessContextGraph.writeExternalGraph()).toThrow("external_graph_write_forbidden");
    expect(() => bos.businessContextGraph.treatAdjacencyAsCausation()).toThrow("graph_adjacency_is_not_causation");
    expect(() => bos.businessContextGraph.projectEngineeringDomain()).toThrow(
      "engineering_os_internal_projection_forbidden",
    );
    expect(bos.businessContextGraph.aiWorkforce().available).toBe(true);
  });

  it("registers /business/context", () => {
    expect(
      BUSINESS_OS_RUNTIME_MANIFEST.routes?.some((r) => r.path === "/business/context" && r.title === "Business Context"),
    ).toBe(true);
    const page = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/context/page.tsx"), "utf8");
    expect(page).toContain("Business Context");
    expect(page).toContain("bos-context-search");
    expect(page).not.toMatch(/cypher|chain-of-thought/i);
    expect(existsSync(resolve(ROOT, "apps/web/src/app/api/business/context/query/route.ts"))).toBe(true);
  });

  it("does not create a second graph table", () => {
    const migration = resolve(
      ROOT,
      "supabase/migrations/20260819150000_batch_106_business_os_business_context.sql",
    );
    expect(existsSync(migration)).toBe(true);
    const sql = readFileSync(migration, "utf8");
    expect(sql).toContain("knowledge_nodes");
    expect(sql.toLowerCase()).not.toContain("create table if not exists business_os_graph_nodes");
    expect(sql.toLowerCase()).not.toContain("create table if not exists vector_");
  });
});
