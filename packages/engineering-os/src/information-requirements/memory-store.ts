import type {
  EngineeringHandoverPackage,
  EngineeringInformationRequirement,
  HandoverPackageItem,
  InformationRequirementSatisfaction,
  InformationRequirementTemplate,
} from "./types";

export interface InformationRequirementStore {
  listRequirements(workspaceId: string, projectId: string): Promise<EngineeringInformationRequirement[]>;
  getRequirement(id: string): Promise<EngineeringInformationRequirement | null>;
  saveRequirement(row: EngineeringInformationRequirement): Promise<EngineeringInformationRequirement>;
  listSatisfactions(workspaceId: string, requirementIds: string[]): Promise<InformationRequirementSatisfaction[]>;
  saveSatisfaction(row: InformationRequirementSatisfaction): Promise<InformationRequirementSatisfaction>;
  listPackages(workspaceId: string, projectId: string): Promise<EngineeringHandoverPackage[]>;
  getPackage(id: string): Promise<EngineeringHandoverPackage | null>;
  savePackage(row: EngineeringHandoverPackage): Promise<EngineeringHandoverPackage>;
  listPackageItems(packageId: string): Promise<HandoverPackageItem[]>;
  savePackageItem(row: HandoverPackageItem): Promise<HandoverPackageItem>;
  listTemplates(): Promise<InformationRequirementTemplate[]>;
}

export function createMemoryInformationRequirementStore(
  templates: InformationRequirementTemplate[] = [],
): InformationRequirementStore {
  const requirements = new Map<string, EngineeringInformationRequirement>();
  const satisfactions = new Map<string, InformationRequirementSatisfaction>();
  const packages = new Map<string, EngineeringHandoverPackage>();
  const items = new Map<string, HandoverPackageItem>();

  return {
    async listRequirements(workspaceId, projectId) {
      return [...requirements.values()].filter((row) => row.workspaceId === workspaceId && row.projectId === projectId);
    },
    async getRequirement(id) {
      return requirements.get(id) ?? null;
    },
    async saveRequirement(row) {
      requirements.set(row.id, row);
      return row;
    },
    async listSatisfactions(workspaceId, requirementIds) {
      const allow = new Set(requirementIds);
      return [...satisfactions.values()].filter((row) => row.workspaceId === workspaceId && allow.has(row.requirementId));
    },
    async saveSatisfaction(row) {
      satisfactions.set(row.id, row);
      return row;
    },
    async listPackages(workspaceId, projectId) {
      return [...packages.values()].filter((row) => row.workspaceId === workspaceId && row.projectId === projectId);
    },
    async getPackage(id) {
      return packages.get(id) ?? null;
    },
    async savePackage(row) {
      packages.set(row.id, row);
      return row;
    },
    async listPackageItems(packageId) {
      return [...items.values()].filter((row) => row.packageId === packageId);
    },
    async savePackageItem(row) {
      items.set(row.id, row);
      return row;
    },
    async listTemplates() {
      return templates;
    },
  };
}
