import { BillingRepository } from "../repositories";

export class BillingService {
  constructor(private readonly billing: BillingRepository) {}

  listAccounts = (tenantId: string) => this.billing.listAccounts(tenantId);

  listInvoices = (tenantId: string) => this.billing.listInvoices(tenantId);
}
