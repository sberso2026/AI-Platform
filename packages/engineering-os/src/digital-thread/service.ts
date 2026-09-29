import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { evaluateThreadCoverage } from "./coverage";
import { GOVERNED_RELATION_SEMANTICS } from "./relation-semantics";
import {
  analysisTrace,
  changeTrace,
  configurationTrace,
  decisionTrace,
  requirementTrace,
} from "./traces";
import { clampThreadDepth, traverseThread } from "./traversal";
import type {
  ThreadAuthorization,
  ThreadCatalogNode,
  ThreadDirection,
  ThreadGraphInput,
  ThreadQuery,
  ThreadRelation,
  ThreadRootType,
} from "./types";

const OBJECT_TABLES: Record<string, string> = {
  requirement: "engineering_requirements",
  system: "engineering_systems",
  asset: "engineering_assets",
  interface: "engineering_interfaces",
  assumption: "engineering_assumptions",
  analysis_request: "engineering_analysis_requests",
  analysis_result: "engineering_analysis_results",
  decision: "engineering_decisions",
  change: "engineering_changes",
  impact: "engineering_impacts",
  configuration_baseline: "engineering_configuration_baselines",
  document: "engineering_documents",
  project: "engineering_projects",
  optimization_study: "engineering_optimization_studies",
  optimization_run: "engineering_optimization_runs",
  review_package: "engineering_review_packages",
};

function db(client: SupabaseClient): any {
  return client;
}

function mapLink(row: Record<string, unknown>): ThreadRelation {
  return {
    relationship: String(row.relationship),
    fromType: String(row.from_type),
    fromId: String(row.from_id),
    toType: String(row.to_type),
    toId: String(row.to_id),
    governed: row.relationship_governed === true,
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: (row.created_at as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown> | undefined) ?? {},
  };
}

export class EngineeringDigitalThreadService {
  constructor(private readonly supabase: SupabaseClient) {}

  async trace(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      objectType: ThreadRootType | string;
      objectId: string;
      direction?: ThreadDirection;
      relationTypes?: string[];
      objectTypes?: string[];
      maxDepth?: number;
      kind?: "requirement" | "decision" | "analysis" | "configuration" | "change" | "graph";
    },
  ) {
    assertEngineeringService(commerce, "thread.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) {
      return {
        root: { tenantId, workspaceId: "", objectType: input.objectType, objectId: input.objectId },
        nodes: [],
        relationships: [],
        paths: [],
        maxDepthUsed: clampThreadDepth(input.maxDepth),
        truncated: false,
        cycleDetected: false,
      };
    }

    const graph = await this.loadGraph(tenantId, workspaceId, input.objectType, input.objectId);
    const auth = this.authFromGraph(tenantId, workspaceId, graph);
    const query: ThreadQuery = {
      tenantId,
      workspaceId,
      root: { objectType: input.objectType, objectId: input.objectId },
      direction: input.direction ?? "both",
      relationTypes: input.relationTypes,
      objectTypes: input.objectTypes,
      maxDepth: input.maxDepth,
    };

    if (input.kind === "requirement") return requirementTrace(graph, query, auth);
    if (input.kind === "decision") return decisionTrace(graph, query, auth);
    if (input.kind === "analysis") return analysisTrace(graph, query, auth);
    if (input.kind === "configuration") return configurationTrace(graph, query, auth);
    if (input.kind === "change") return changeTrace(graph, query, auth);
    return traverseThread(graph, query, auth);
  }

  async coverage(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "thread.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return { findings: [], maturityModel: "EOS-A1" as const, universalTraceabilityScore: false as const };
    const graph = await this.loadGraph(tenantId, workspaceId);
    return evaluateThreadCoverage(graph);
  }

  catalog() {
    return Object.values(GOVERNED_RELATION_SEMANTICS);
  }

  private authFromGraph(tenantId: string, workspaceId: string, graph: ThreadGraphInput): ThreadAuthorization {
    return {
      tenantId,
      allowedWorkspaceIds: [workspaceId],
      role: "member",
      nodeAccess: new Map(
        graph.nodes.map((n) => [`${n.objectType}:${n.objectId}`, { tenantId: n.tenantId, workspaceId: n.workspaceId }]),
      ),
    };
  }

  private async loadGraph(
    tenantId: string,
    workspaceId: string,
    rootType?: string,
    rootId?: string,
  ): Promise<ThreadGraphInput> {
    const { data: linkRows, error } = await db(this.supabase)
      .from("engineering_object_links")
      .select("*")
      .eq("tenant_id", tenantId)
      .limit(THREAD_LINK_SCAN_LIMIT);
    if (error) throw new Error(`Failed to load engineering object links: ${error.message}`);
    const links = ((linkRows ?? []) as Record<string, unknown>[]).map(mapLink);

    const idsByType = new Map<string, Set<string>>();
    const add = (type: string, id: string) => {
      if (!idsByType.has(type)) idsByType.set(type, new Set());
      idsByType.get(type)!.add(id);
    };
    if (rootType && rootId) add(rootType, rootId);
    for (const link of links) {
      add(link.fromType, link.fromId);
      add(link.toType, link.toId);
    }

    const nodes: ThreadCatalogNode[] = [];
    for (const [objectType, ids] of idsByType) {
      const table = OBJECT_TABLES[objectType];
      if (!table || ids.size === 0) continue;
      const { data, error: loadError } = await db(this.supabase)
        .from(table)
        .select("*")
        .eq("tenant_id", tenantId)
        .in("id", [...ids]);
      if (loadError) continue;
      for (const row of (data ?? []) as Record<string, unknown>[]) {
        const rowWorkspace = String(row.workspace_id ?? workspaceId);
        nodes.push({
          tenantId: String(row.tenant_id ?? tenantId),
          workspaceId: rowWorkspace,
          objectType,
          objectId: String(row.id),
          projectId: (row.project_id as string | null) ?? null,
          objectCode: String(row.requirement_code ?? row.system_code ?? row.interface_code ?? row.change_code ?? row.baseline_code ?? row.decision_number ?? row.assumption_number ?? row.id),
          title: (row.title as string | null) ?? (row.name as string | null) ?? (row.question as string | null),
          status: (row.status as string | null) ?? (row.acceptance_state as string | null),
          stale: row.stale === true,
          superseded: String(row.status ?? "") === "superseded",
          discipline: (row.discipline as string | null) ?? null,
          capability: (row.capability as string | null) ?? null,
          blockingReasons: Array.isArray(row.blocking_reasons) ? (row.blocking_reasons as string[]) : undefined,
          toolCode: (row.tool_code as string | null) ?? null,
          provenance: {
            createdBy: (row.created_by as string | null) ?? null,
            createdAt: (row.created_at as string | null) ?? null,
            sourceAnalysisId: objectType === "analysis_result" ? String(row.analysis_request_id ?? "") : null,
            inputFingerprint: (row.analysis_input_fingerprint as string | null) ?? null,
            sourceExternalTool: (row.tool_code as string | null) ?? null,
          },
        });
      }
    }
    if (rootType && rootId && !nodes.some((n) => n.objectType === rootType && n.objectId === rootId)) {
      nodes.push({ tenantId, workspaceId, objectType: rootType, objectId: rootId });
    }
    return { nodes, links };
  }
}

const THREAD_LINK_SCAN_LIMIT = 2000;
