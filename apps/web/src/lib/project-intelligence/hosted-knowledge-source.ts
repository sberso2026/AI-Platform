import {
  emptyKnowledgeSnapshot,
  unbound,
  type CommandCentreAvailability,
  type CommandCentreKnowledgeLoad,
  type CommandCentreKnowledgePort,
  type CommandCentreScope,
  type KnowledgeFindingRef,
} from "@rtb/project-intelligence";
import type { AuthContext } from "@/lib/kernel";

const OPEN_FINDING_STATUSES = new Set([
  "candidate",
  "triage_pending",
  "under_review",
  "changes_requested",
  "accepted",
  "conversion_proposed",
  "reopened",
]);

function classifyFailure(error: unknown): CommandCentreAvailability {
  const message = error instanceof Error ? error.message : String(error);
  if (/permission|rls|forbidden|not authorized|jwt/i.test(message)) return "forbidden";
  return "error";
}

export class HostedProjectKnowledgeSource implements CommandCentreKnowledgePort {
  readonly sourceDomain = "project_intelligence" as const;
  readonly mutatesCanonicalState = false as const;

  constructor(private readonly ctx: AuthContext) {}

  async load(scope: CommandCentreScope): Promise<CommandCentreKnowledgeLoad> {
    try {
      const { data, error } = await this.ctx.supabase
        .from("project_intelligence_findings")
        .select(
          "id,status,proposed_severity,confirmed_severity,proposed_category,confirmed_category,updated_at,engineering_project_id,workspace_id,tenant_id",
        )
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .eq("engineering_project_id", scope.projectId)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) {
        return { snapshot: emptyKnowledgeSnapshot(), availability: classifyFailure(error) };
      }

      const items: KnowledgeFindingRef[] = (data ?? []).map((row) => {
        const status = String(row.status ?? "candidate");
        const severity = String(row.confirmed_severity ?? row.proposed_severity ?? "");
        const category = String(row.confirmed_category ?? row.proposed_category ?? "");
        return {
          id: String(row.id),
          entityType: "finding" as const,
          status,
          severity: severity || undefined,
          category: category || undefined,
          open: OPEN_FINDING_STATUSES.has(status),
          sourceTimestamp: row.updated_at ? String(row.updated_at) : undefined,
          storesCanonicalCopy: false as const,
        };
      });

      return {
        snapshot: {
          findings: { bound: true, items, sourceTimestamp: items[0]?.sourceTimestamp },
          inspectionFindings: unbound(),
        },
        availability: "ok",
      };
    } catch (error) {
      return { snapshot: emptyKnowledgeSnapshot(), availability: classifyFailure(error) };
    }
  }
}
