import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type { CommerceExecutionContext } from "@rtb/types";
import { DEMO_METADATA_MARKER } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";

export interface DemoSeedResult {
  status: "seeded" | "already_seeded";
  message?: string;
  tenant_id: string;
  counts?: Record<string, number>;
}

export interface DemoResetResult {
  deleted: Record<string, number>;
  tenant_id: string;
}

export interface DemoDataStatus {
  present: boolean;
  counts: Record<string, number>;
}

const DEMO_TABLES = [
  "engineering_projects",
  "engineering_assets",
  "engineering_documents",
  "engineering_decisions",
  "engineering_actions",
  "engineering_risks",
  "engineering_issues",
  "engineering_technical_queries",
  "engineering_lessons",
] as const;

export class EngineeringDemoDataService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel?: PlatformKernel
  ) {}

  async getStatus(commerce: CommerceExecutionContext, tenantId: string): Promise<DemoDataStatus> {
    assertEngineeringService(commerce, "demo.status", tenantId);
    const counts: Record<string, number> = {};
    for (const table of DEMO_TABLES) {
      const { count } = await this.supabase
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .contains("metadata", { demo: true });
      counts[table.replace("engineering_", "")] = count ?? 0;
    }
    const present = (counts.projects ?? 0) > 0;
    return { present, counts };
  }

  async seed(commerce: CommerceExecutionContext, tenantId: string): Promise<DemoSeedResult> {
    assertEngineeringService(commerce, "demo.seed", tenantId);
    const { data, error } = await this.supabase.rpc(
      "seed_engineering_os_demo_data" as never,
      { p_tenant_id: tenantId } as never
    );
    if (error) throw new Error(`Failed to seed demo data: ${error.message}`);

    const result = data as unknown as DemoSeedResult;

    if (result.status === "seeded" && this.kernel) {
      try {
        await this.kernel.eventBus.publish({
          tenantId,
          eventType: "engineering.demo.seeded",
          source: "engineering-os",
          payload: { counts: result.counts },
        });
      } catch {
        // best-effort
      }
    }

    return result;
  }

  async reset(commerce: CommerceExecutionContext, tenantId: string): Promise<DemoResetResult> {
    assertEngineeringService(commerce, "demo.seed", tenantId);
    const { data, error } = await this.supabase.rpc(
      "reset_engineering_os_demo_data" as never,
      { p_tenant_id: tenantId } as never
    );
    if (error) throw new Error(`Failed to reset demo data: ${error.message}`);

    const result = data as unknown as DemoResetResult;

    if (this.kernel) {
      try {
        await this.kernel.eventBus.publish({
          tenantId,
          eventType: "engineering.demo.reset",
          source: "engineering-os",
          payload: { deleted: result.deleted },
        });
      } catch {
        // best-effort
      }
    }

    return result;
  }

  /** Metadata marker for programmatic demo creates outside SQL seed */
  static demoMetadata(extra?: Record<string, unknown>) {
    return { ...DEMO_METADATA_MARKER, ...extra };
  }
}
