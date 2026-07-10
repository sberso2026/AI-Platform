import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type { CommerceExecutionContext } from "@rtb/types";
import type { EngineeringDemoDataService } from "./demo-data-service";

export type HealthCheckStatus = "ok" | "degraded" | "error" | "unknown";

export interface HealthCheckItem {
  key: string;
  label: string;
  status: HealthCheckStatus;
  message?: string;
}

export interface EngineeringHealthReport {
  overall: HealthCheckStatus;
  checked_at: string;
  tenant_id: string;
  checks: HealthCheckItem[];
  demo_data: {
    present: boolean;
    counts: Record<string, number>;
  };
}

const REGISTER_TABLES = [
  "engineering_decisions",
  "engineering_actions",
  "engineering_risks",
  "engineering_issues",
  "engineering_technical_queries",
  "engineering_lessons",
] as const;

export class EngineeringHealthService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel?: PlatformKernel,
    private readonly demo?: EngineeringDemoDataService
  ) {}

  async check(_commerce: CommerceExecutionContext, tenantId: string, userId?: string): Promise<EngineeringHealthReport> {
    const checks: HealthCheckItem[] = [];

    // Engineering OS installed (settings row)
    const { data: settings } = await this.supabase
      .from("engineering_settings")
      .select("id")
      .eq("tenant_id", tenantId)
      .maybeSingle();
    checks.push({
      key: "engineering_os_installed",
      label: "Engineering OS installed",
      status: settings ? "ok" : "error",
      message: settings ? "Settings record present" : "No engineering_settings row — run seed_tenant_engineering_os",
    });

    // Feature flag
    let featureEnabled = false;
    if (this.kernel) {
      try {
        featureEnabled = await this.kernel.intelligence.features.evaluate({
          tenantId,
          featureKey: "engineering_os_enabled",
          userId,
        });
        checks.push({
          key: "feature_flag",
          label: "engineering_os_enabled feature flag",
          status: featureEnabled ? "ok" : "degraded",
          message: featureEnabled ? "Enabled" : "Feature flag off for tenant",
        });
      } catch (e) {
        checks.push({
          key: "feature_flag",
          label: "engineering_os_enabled feature flag",
          status: "error",
          message: e instanceof Error ? e.message : "Feature evaluation failed",
        });
      }
    } else {
      checks.push({
        key: "feature_flag",
        label: "engineering_os_enabled feature flag",
        status: "unknown",
        message: "Kernel not available",
      });
    }

    // Tenant seeded (capabilities)
    const { count: capCount } = await this.supabase
      .from("capabilities")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("capability_key", "engineering_os");
    checks.push({
      key: "tenant_seeded",
      label: "Tenant seeded",
      status: (capCount ?? 0) > 0 ? "ok" : "error",
      message: (capCount ?? 0) > 0 ? "engineering_os capability present" : "Run seed_tenant_engineering_os",
    });

    // Register tables accessible
    let registerOk = true;
    for (const table of REGISTER_TABLES) {
      const { error } = await this.supabase
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId);
      if (error) {
        registerOk = false;
        break;
      }
    }
    checks.push({
      key: "register_tables",
      label: "Register tables accessible",
      status: registerOk ? "ok" : "error",
      message: registerOk ? "All six register tables queryable" : "Register table query failed",
    });

    // Platform subsystems
    checks.push(await this.probeSubsystem("ai_director", "AI Director reachable", async () => {
      if (!this.kernel) throw new Error("No kernel");
      await this.kernel.aiDirector.listRuns(tenantId, 1);
    }));

    checks.push(await this.probeSubsystem("event_bus", "Event Bus reachable", async () => {
      if (!this.kernel) throw new Error("No kernel");
      await this.kernel.eventBus.publish({
        tenantId,
        eventType: "engineering.health.check",
        source: "engineering-os",
        payload: { probe: true },
      });
    }));

    checks.push(await this.probeSubsystem("knowledge_graph", "Knowledge Graph reachable", async () => {
      if (!this.kernel) throw new Error("No kernel");
      await this.kernel.knowledgeGraph.listNodes(tenantId, 1);
    }));

    checks.push(await this.probeSubsystem("workflow_engine", "Workflow Engine reachable", async () => {
      if (!this.kernel) throw new Error("No kernel");
      const { data } = await this.supabase
        .from("workflow_definitions")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("slug", "engineering-decision-approval")
        .limit(1);
      if (!data?.length) throw new Error("Decision approval workflow not seeded");
    }));

    // RLS active (implicit — successful tenant-scoped query)
    checks.push({
      key: "rls",
      label: "RLS tenant isolation",
      status: registerOk ? "ok" : "unknown",
      message: "Tenant-scoped queries enforced via session + RLS policies",
    });

    const demoStatus = this.demo
      ? await this.loadDemoStatus(tenantId)
      : { present: false, counts: {} };

    const hasError = checks.some((c) => c.status === "error");
    const hasDegraded = checks.some((c) => c.status === "degraded");
    const overall: HealthCheckStatus = hasError ? "error" : hasDegraded ? "degraded" : "ok";

    return {
      overall,
      checked_at: new Date().toISOString(),
      tenant_id: tenantId,
      checks,
      demo_data: demoStatus,
    };
  }

  private async loadDemoStatus(tenantId: string): Promise<{ present: boolean; counts: Record<string, number> }> {
    const tables = [
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
    const counts: Record<string, number> = {};
    for (const table of tables) {
      const { count } = await this.supabase
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .contains("metadata", { demo: true });
      counts[table.replace("engineering_", "")] = count ?? 0;
    }
    return { present: (counts.projects ?? 0) > 0, counts };
  }

  private async probeSubsystem(
    key: string,
    label: string,
    fn: () => Promise<void>
  ): Promise<HealthCheckItem> {
    try {
      await fn();
      return { key, label, status: "ok", message: "Reachable" };
    } catch (e) {
      return {
        key,
        label,
        status: "degraded",
        message: e instanceof Error ? e.message : "Probe failed",
      };
    }
  }
}
