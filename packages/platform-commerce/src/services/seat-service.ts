import { SeatRepository } from "../repositories";

export class SeatService {
  constructor(private readonly seats: SeatRepository) {}

  listByTenant = (tenantId: string) => this.seats.listByTenant(tenantId);

  getByProduct = (tenantId: string, productId: string) =>
    this.seats.getByProduct(tenantId, productId);

  upsertPool = (input: Parameters<SeatRepository["upsertPool"]>[0]) =>
    this.seats.upsertPool(input);
}
