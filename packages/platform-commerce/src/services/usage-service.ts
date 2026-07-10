import type { RecordUsageInput } from "@rtb/types";
import { UsageRepository } from "../repositories";
import { commerceExtensions } from "./product-service";

export class UsageService {
  constructor(private readonly usage: UsageRepository) {}

  listTypes = () => this.usage.listTypes();

  async record(input: RecordUsageInput) {
    const record = await this.usage.record(input);
    await commerceExtensions.growth?.onUsageRecorded?.(record);
    return record;
  }

  aggregateByTenant = (
    tenantId: string,
    periodStart: string,
    periodEnd: string
  ) => this.usage.aggregateByTenant(tenantId, periodStart, periodEnd);
}
