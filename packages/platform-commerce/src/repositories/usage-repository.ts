import type { SupabaseClient } from "@rtb/database";
import type {
  CommercialUsageAggregate,
  CommercialUsageRecord,
  CommercialUsageType,
  RecordUsageInput,
} from "@rtb/types";
import { BaseRepository } from "./base-repository";

export class UsageRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async listTypes(): Promise<CommercialUsageType[]> {
    const { data, error } = await this.supabase
      .from("commercial_usage_types")
      .select("*")
      .is("deleted_at", null)
      .order("name");
    if (error) this.fail("list usage types", error);
    return this.mapRows<CommercialUsageType>(data);
  }

  async record(input: RecordUsageInput): Promise<CommercialUsageRecord> {
    const { data, error } = await this.supabase
      .from("commercial_usage_records")
      .insert({
        tenant_id: input.tenantId,
        metric_key: input.metricKey,
        quantity: input.quantity,
        product_id: input.productId ?? null,
        application_key: input.applicationKey ?? null,
        workspace_id: input.workspaceId ?? null,
        period_start: input.periodStart,
        period_end: input.periodEnd,
        created_by: input.createdBy ?? null,
      })
      .select("*")
      .single();
    if (error) this.fail("record usage", error);
    return this.mapRow<CommercialUsageRecord>(data);
  }

  async aggregateByTenant(
    tenantId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<CommercialUsageAggregate[]> {
    const { data, error } = await this.supabase
      .from("commercial_usage_records")
      .select("metric_key, quantity, period_start, period_end")
      .eq("tenant_id", tenantId)
      .gte("period_start", periodStart)
      .lte("period_end", periodEnd);
    if (error) this.fail("aggregate usage", error);

    const types = await this.listTypes();
    const typeMap = new Map(types.map((t) => [t.metric_key, t]));

    const totals = new Map<string, number>();
    for (const row of data ?? []) {
      const key = row.metric_key as string;
      totals.set(key, (totals.get(key) ?? 0) + Number(row.quantity));
    }

    return Array.from(totals.entries()).map(([metric_key, total_quantity]) => {
      const type = typeMap.get(metric_key);
      return {
        metric_key,
        name: type?.name ?? metric_key,
        unit: type?.unit ?? "count",
        total_quantity,
        period_start: periodStart,
        period_end: periodEnd,
      };
    });
  }
}
