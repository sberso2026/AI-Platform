import { PlanRepository } from "../repositories";

export class PlanService {
  constructor(private readonly plans: PlanRepository) {}

  getById = (planId: string) => this.plans.getById(planId);

  listByProduct = (productId: string) => this.plans.listByProduct(productId);

  listPrices = (planId: string) => this.plans.listPrices(planId);
}
