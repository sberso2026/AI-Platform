import type { CommerceExtensionHooks } from "@rtb/types";
import { ProductRepository } from "../repositories";

/** Extension point registry — Growth Engine hooks registered at runtime */
export class CommerceExtensionRegistry {
  private hooks: CommerceExtensionHooks = {};

  register(hooks: CommerceExtensionHooks): void {
    this.hooks = { ...this.hooks, ...hooks };
  }

  get growth() {
    return this.hooks.growth;
  }

  get referral() {
    return this.hooks.referral;
  }

  get partnerCommission() {
    return this.hooks.partnerCommission;
  }
}

export const commerceExtensions = new CommerceExtensionRegistry();

export class ProductService {
  constructor(private readonly products: ProductRepository) {}

  listCatalog = (options?: Parameters<ProductRepository["listCatalog"]>[0]) =>
    this.products.listCatalog(options);

  getBySlug = (slug: string) => this.products.getBySlug(slug);

  getById = (id: string) => this.products.getById(id);
}
