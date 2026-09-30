import type {
  AssuranceEvaluationRun,
  AssuranceReviewCitation,
  AssuranceRuleSetting,
  EngineeringAssuranceCondition,
} from "./types";

export type AssuranceListFilter = {
  status?: string;
  conditionType?: string;
  discipline?: string;
  materiality?: string;
  rootObjectType?: string;
  rootObjectId?: string;
  ruleId?: string;
};

export interface AssuranceConditionStore {
  list(tenantId: string, workspaceId: string, filter?: AssuranceListFilter): Promise<EngineeringAssuranceCondition[]>;
  get(tenantId: string, workspaceId: string, id: string): Promise<EngineeringAssuranceCondition | null>;
  upsertMany(conditions: EngineeringAssuranceCondition[]): Promise<void>;
  listSettings(tenantId: string, workspaceId: string): Promise<AssuranceRuleSetting[]>;
  upsertSetting(setting: AssuranceRuleSetting): Promise<AssuranceRuleSetting>;
  deleteSetting(tenantId: string, workspaceId: string, ruleId: string, ruleVersion: string): Promise<AssuranceRuleSetting | null>;
  listCitations(
    tenantId: string,
    workspaceId: string,
    filter?: { conditionId?: string; reviewPackageId?: string },
  ): Promise<AssuranceReviewCitation[]>;
  insertCitation(citation: AssuranceReviewCitation): Promise<AssuranceReviewCitation>;
  insertEvaluationRun(run: AssuranceEvaluationRun): Promise<AssuranceEvaluationRun>;
  latestEvaluationRun(tenantId: string, workspaceId: string): Promise<AssuranceEvaluationRun | null>;
}

export class MemoryAssuranceStore implements AssuranceConditionStore {
  private rows: EngineeringAssuranceCondition[] = [];
  private settings: AssuranceRuleSetting[] = [];
  private citations: AssuranceReviewCitation[] = [];
  private runs: AssuranceEvaluationRun[] = [];

  async list(tenantId: string, workspaceId: string, filter?: AssuranceListFilter): Promise<EngineeringAssuranceCondition[]> {
    return this.rows.filter((row) => {
      if (row.tenantId !== tenantId || row.workspaceId !== workspaceId) return false;
      if (filter?.status && row.status !== filter.status) return false;
      if (filter?.conditionType && row.conditionType !== filter.conditionType) return false;
      if (filter?.discipline && row.discipline !== filter.discipline) return false;
      if (filter?.materiality && row.materiality !== filter.materiality) return false;
      if (filter?.rootObjectType && row.rootObjectType !== filter.rootObjectType) return false;
      if (filter?.rootObjectId && row.rootObjectId !== filter.rootObjectId) return false;
      if (filter?.ruleId && row.ruleId !== filter.ruleId) return false;
      return true;
    });
  }

  async get(tenantId: string, workspaceId: string, id: string): Promise<EngineeringAssuranceCondition | null> {
    return this.rows.find((row) => row.id === id && row.tenantId === tenantId && row.workspaceId === workspaceId) ?? null;
  }

  async upsertMany(conditions: EngineeringAssuranceCondition[]): Promise<void> {
    for (const condition of conditions) {
      const index = this.rows.findIndex(
        (row) =>
          row.tenantId === condition.tenantId &&
          row.workspaceId === condition.workspaceId &&
          row.fingerprint === condition.fingerprint,
      );
      if (index >= 0) this.rows[index] = condition;
      else this.rows.push(condition);
    }
  }

  async listSettings(tenantId: string, workspaceId: string): Promise<AssuranceRuleSetting[]> {
    return this.settings.filter((row) => row.tenantId === tenantId && row.workspaceId === workspaceId);
  }

  async upsertSetting(setting: AssuranceRuleSetting): Promise<AssuranceRuleSetting> {
    const index = this.settings.findIndex(
      (row) =>
        row.tenantId === setting.tenantId &&
        row.workspaceId === setting.workspaceId &&
        row.ruleId === setting.ruleId &&
        row.ruleVersion === setting.ruleVersion,
    );
    const next = { ...setting, id: setting.id ?? (index >= 0 ? this.settings[index]!.id : crypto.randomUUID()) };
    if (index >= 0) this.settings[index] = next;
    else this.settings.push(next);
    return next;
  }

  async deleteSetting(
    tenantId: string,
    workspaceId: string,
    ruleId: string,
    ruleVersion: string,
  ): Promise<AssuranceRuleSetting | null> {
    const index = this.settings.findIndex(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.ruleId === ruleId &&
        row.ruleVersion === ruleVersion,
    );
    if (index < 0) return null;
    const [removed] = this.settings.splice(index, 1);
    return removed ?? null;
  }

  async listCitations(
    tenantId: string,
    workspaceId: string,
    filter?: { conditionId?: string; reviewPackageId?: string },
  ): Promise<AssuranceReviewCitation[]> {
    return this.citations.filter((row) => {
      if (row.tenantId !== tenantId || row.workspaceId !== workspaceId) return false;
      if (filter?.conditionId && row.conditionId !== filter.conditionId) return false;
      if (filter?.reviewPackageId && row.reviewPackageId !== filter.reviewPackageId) return false;
      return true;
    });
  }

  async insertCitation(citation: AssuranceReviewCitation): Promise<AssuranceReviewCitation> {
    const existing = this.citations.find(
      (row) =>
        row.tenantId === citation.tenantId &&
        row.workspaceId === citation.workspaceId &&
        row.conditionId === citation.conditionId &&
        row.reviewPackageId === citation.reviewPackageId,
    );
    if (existing) return existing;
    this.citations.push(citation);
    return citation;
  }

  async insertEvaluationRun(run: AssuranceEvaluationRun): Promise<AssuranceEvaluationRun> {
    const stored = { ...run, id: run.id ?? crypto.randomUUID() };
    this.runs.push(stored);
    return stored;
  }

  async latestEvaluationRun(tenantId: string, workspaceId: string): Promise<AssuranceEvaluationRun | null> {
    const matches = this.runs.filter((row) => row.tenantId === tenantId && row.workspaceId === workspaceId);
    return matches.at(-1) ?? null;
  }
}
