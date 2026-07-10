import { MarketplaceRepository } from "../repositories";

export class MarketplaceService {
  constructor(private readonly marketplace: MarketplaceRepository) {}

  listPublishers = () => this.marketplace.listPublishers();

  listPublishedProducts = () => this.marketplace.listPublishedProducts();
}
