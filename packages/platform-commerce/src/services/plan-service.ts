import { PlanRepository } from "../repositories";

export class PlanService {
  constructor(private readonly plans: PlanRepository) {}

  listByProduct = (productId: string) => this.plans.listByProduct(productId);

  listPrices = (planId: string) => this.plans.listPrices(planId);
}
