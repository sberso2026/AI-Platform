import { ProjectIntelligenceError } from "../domain/errors.js";
import { canTransition } from "../domain/mapping-state-machine.js";
import { MappingStatus, type ProjectMapping } from "../types/mapping.js";

export interface MappingRepository {
  get(id: string): Promise<ProjectMapping | null>;
  save(mapping: ProjectMapping): Promise<ProjectMapping>;
}

export class MappingService {
  constructor(private readonly repository: MappingRepository, private readonly now = () => new Date().toISOString()) {}

  approve(id: string): Promise<ProjectMapping> { return this.transition(id, MappingStatus.Approved); }
  reject(id: string): Promise<ProjectMapping> { return this.transition(id, MappingStatus.Retired); }
  markConflict(id: string): Promise<ProjectMapping> { return this.transition(id, MappingStatus.Conflict); }
  defer(id: string): Promise<ProjectMapping> { return this.transition(id, MappingStatus.PendingReview); }

  private async transition(id: string, target: MappingStatus): Promise<ProjectMapping> {
    const mapping = await this.repository.get(id);
    if (!mapping) throw new ProjectIntelligenceError("mapping_not_found", "Mapping was not found", 404, { id });
    if (!canTransition(mapping.status, target)) {
      throw new ProjectIntelligenceError("mapping_transition_invalid", "Mapping status transition is not allowed", 409, { id, from: mapping.status, to: target });
    }
    return this.repository.save({ ...mapping, status: target, updatedAt: this.now() });
  }
}
