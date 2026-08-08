import { describe, expect, it } from "vitest";
import {
  assertOwnershipLock,
  assertReservedProvidersUnimplemented,
  listConcernsByRelation,
  ASSET_INTELLIGENCE_V1_COMMIT,
  ASSET_INTELLIGENCE_V1_INTACT,
  ASSET_INTELLIGENCE_V1_TAG,
  ASSET_INTELLIGENCE_V1_VERSION,
  BUDGET_LEDGER_IMPLEMENTED,
  CANONICAL_LIFECYCLE_MUTATION_ALLOWED,
  CANONICAL_PROJECT_HIERARCHY_OWNERSHIP,
  CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS,
  CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
  CANONICAL_PROJECT_IDENTITY_PHYSICAL_STORE,
  AI_MAY_PUBLISH_CHANGE_FORBIDDEN,
  AUTONOMOUS_CHANGE_PUBLICATION_ALLOWED,
  CASH_FLOW_IMPLEMENTED,
  CHANGE_CONFIDENCE_ENGINE_READY,
  CHANGE_CONTROL_IMPLEMENTED,
  CHANGE_EXECUTION_IMPLEMENTED,
  CHANGE_INTELLIGENCE_IS_ADVISORY_ONLY,
  CHANGE_INTELLIGENCE_IS_CONTRACTUAL_AUTHORITY,
  CHANGE_INTELLIGENCE_READY,
  CHANGE_PERSISTENCE_READY,
  CHANGE_REVIEW_WORKFLOW_READY,
  CLAIMS_ANALYSIS_IMPLEMENTED,
  CONTINGENCY_MANAGEMENT_IMPLEMENTED,
  CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED,
  COST_ENGINE_IMPLEMENTED,
  CPM_SCHEDULING_IMPLEMENTED,
  DUPLICATE_ASSET_OWNERSHIP_INTRODUCED,
  DUPLICATE_PROJECT_OWNERSHIP_DETECTED,
  EARNED_VALUE_IMPLEMENTED,
  FINANCIAL_POSTING_IMPLEMENTED,
  FLOAT_COMPUTATION_IMPLEMENTED,
  FORECASTING_IMPLEMENTED,
  getProjectControlsDeclaration,
  INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_11A_CERTIFIED_COMMIT,
  PHASE_11A_HOSTED_RUN,
  PHASE_11B_CERTIFIED_COMMIT,
  PHYSICAL_PERCENT_COMPLETE_CERTIFIED,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  PRODUCTION_PROJECT_CONTROLS_READY,
  PRODUCTIVITY_ANALYSIS_IMPLEMENTED,
  PROGRESS_CONFIDENCE_ENGINE_READY,
  PROGRESS_INTELLIGENCE_READY,
  PROGRESS_MEASUREMENT_IMPLEMENTED,
  PROGRESS_MEASUREMENT_IS_ADVISORY_ONLY,
  PROGRESS_MEASUREMENT_IS_EARNED_VALUE,
  PROJECT_CONTEXT_ENGINE_READY,
  PROJECT_CONTROLS_CHANGE_TABLES,
  PROJECT_CONTROLS_CHANGE_TABLES_INTRODUCED,
  PROJECT_CONTROLS_COST_SCHEDULE_TABLES_INTRODUCED,
  PROJECT_CONTROLS_IMPLEMENTED,
  PROJECT_CONTROLS_MODULE_KEY,
  PROJECT_CONTROLS_MODULE_REGISTRY_STATUS,
  PROJECT_CONTROLS_OWNERSHIP,
  PROJECT_CONTROLS_OWNERSHIP_MATRIX,
  PROJECT_CONTROLS_PHASE,
  PROJECT_CONTROLS_PRODUCT_NAME,
  PROJECT_CONTROLS_PRODUCT_UI_IMPLEMENTED,
  PROJECT_CONTROLS_PROGRESS_TABLES,
  PROJECT_CONTROLS_PROGRESS_TABLES_INTRODUCED,
  PROJECT_CONTROLS_SCHEDULE_TABLES,
  PROJECT_CONTROLS_SCHEDULE_TABLES_INTRODUCED,
  PROJECT_CONTROLS_SHARED_PROJECT_TABLES,
  PROJECT_CONTROLS_STATUS,
  PROJECT_CONTROLS_VERSION,
  PROJECT_IDENTITY_MUTATION_BY_PROJECT_CONTROLS_ALLOWED,
  PROJECT_IDENTITY_OWNER_SPELLING_UNIFICATION,
  PROJECT_IDENTITY_OWNERSHIP,
  PROJECT_INTELLIGENCE_V1_COMMIT,
  PROJECT_SNAPSHOT_READY,
  PROJECT_TIMELINE_READY,
  RESERVED_PROVIDER_KEYS,
  RESOURCE_LEVELING_IMPLEMENTED,
  RISK_CORE_AUTO_MUTATION_ALLOWED,
  SCHEDULE_EXECUTION_IMPLEMENTED,
  SCHEDULE_INTELLIGENCE_READY,
  SHARED_PROJECT_DOMAIN_READY,
  WORK_PACKAGING_UI_IMPLEMENTED,
  createReservedProviderSet,
} from "../src/index";

describe("Phase 11E Project Controls ownership and forbid locks", () => {
  it("declares the cost intelligence module identity", () => {
    expect(PROJECT_CONTROLS_PRODUCT_NAME).toBe("Project Controls");
    expect(PROJECT_CONTROLS_MODULE_KEY).toBe("project_controls");
    expect(PROJECT_CONTROLS_VERSION).toBe("0.5.0-cost-intelligence");
    expect(PROJECT_CONTROLS_STATUS).toBe("cost_intelligence");
    expect(PROJECT_CONTROLS_PHASE).toBe("11E");
    expect(PROJECT_CONTROLS_IMPLEMENTED).toBe(false);
    expect(PRODUCTION_PROJECT_CONTROLS_READY).toBe(false);
    expect(PHASE_11A_CERTIFIED_COMMIT).toBe("b9a3a6091ec4af1eb1ebdd9749da497ce5af9700");
    expect(PHASE_11A_HOSTED_RUN).toBe("31179910364");
    expect(PHASE_11B_CERTIFIED_COMMIT).toBe("336707d4baaf63b6a4e5f4ef4255f9ca8d7e4dd6");
  });

  it("flips Phase 11B, 11C and 11D capability flags", () => {
    expect(SHARED_PROJECT_DOMAIN_READY).toBe(true);
    expect(PROJECT_CONTEXT_ENGINE_READY).toBe(true);
    expect(PROGRESS_INTELLIGENCE_READY).toBe(true);
    expect(SCHEDULE_INTELLIGENCE_READY).toBe(true);
    expect(CHANGE_INTELLIGENCE_READY).toBe(true);
    expect(CHANGE_CONFIDENCE_ENGINE_READY).toBe(true);
    expect(CHANGE_REVIEW_WORKFLOW_READY).toBe(true);
    expect(CHANGE_PERSISTENCE_READY).toBe(true);
    expect(CHANGE_INTELLIGENCE_IS_ADVISORY_ONLY).toBe(true);
    expect(CHANGE_INTELLIGENCE_IS_CONTRACTUAL_AUTHORITY).toBe(false);
    expect(PROJECT_TIMELINE_READY).toBe(true);
    expect(PROJECT_SNAPSHOT_READY).toBe(true);
    expect(CHANGE_EXECUTION_IMPLEMENTED).toBe(false);
    expect(FINANCIAL_POSTING_IMPLEMENTED).toBe(false);
    expect(CONTINGENCY_MANAGEMENT_IMPLEMENTED).toBe(false);
    expect(AI_MAY_PUBLISH_CHANGE_FORBIDDEN).toBe(true);
    expect(AUTONOMOUS_CHANGE_PUBLICATION_ALLOWED).toBe(false);
    expect(CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED).toBe(false);
    expect(PROGRESS_CONFIDENCE_ENGINE_READY).toBe(true);
    expect(PROGRESS_MEASUREMENT_IMPLEMENTED).toBe(true);
    expect(PROGRESS_MEASUREMENT_IS_ADVISORY_ONLY).toBe(true);
    expect(PROGRESS_MEASUREMENT_IS_EARNED_VALUE).toBe(false);
    expect(PHYSICAL_PERCENT_COMPLETE_CERTIFIED).toBe(false);
    expect(PRODUCTION_MEMORY_REPOSITORY_ALLOWED).toBe(false);
    expect(FLOAT_COMPUTATION_IMPLEMENTED).toBe(false);
    expect(CPM_SCHEDULING_IMPLEMENTED).toBe(false);
  });

  it("moves canonical project identity to the shared project domain", () => {
    const lock = assertOwnershipLock();
    expect(lock.ok).toBe(true);
    expect(lock.projectIdentityOwnership).toBe("engineering_os_shared_project_domain");
    expect(lock.canonicalProjectIdentityOwnership).toBe("engineering_os_shared_project_domain");
    expect(lock.canonicalProjectIdentityClaimedByProjectControls).toBe(false);
    expect(lock.canonicalAssetIdentityOwnership).toBe("engineering_os_shared_domain");
    expect(lock.canonicalEngineeringRiskOwnership).toBe("engineering_core");
    expect(lock.progressIntelligenceOwnership).toBe("project_controls");
    expect(lock.scheduleIntelligenceOwnership).toBe("project_controls");
    expect(lock.scheduleIntelligenceReady).toBe(true);
    expect(lock.changeIntelligenceOwnership).toBe("project_controls");
    expect(lock.changeIntelligenceReady).toBe(true);
    expect(lock.changeIntelligenceIsContractualAuthority).toBe(false);
    expect(lock.contractualChangeAuthorityOwnership).toBe("reserved_not_project_controls");
    expect(lock.financialLedgerOwnership).toBe("external_finance_or_future_finance_domain");
    expect(PROJECT_CONTROLS_OWNERSHIP).toBe("project_controls");
    expect(PROJECT_IDENTITY_OWNERSHIP).toBe("engineering_os_shared_project_domain");
    expect(CANONICAL_PROJECT_IDENTITY_OWNERSHIP).toBe("engineering_os_shared_project_domain");
    expect(CANONICAL_PROJECT_HIERARCHY_OWNERSHIP).toBe("engineering_os_shared_project_domain");
    expect(CANONICAL_PROJECT_IDENTITY_PHYSICAL_STORE).toBe("engineering_projects");
    expect(CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS).toBe(false);
    expect(PROJECT_IDENTITY_MUTATION_BY_PROJECT_CONTROLS_ALLOWED).toBe(false);
    expect(PROJECT_IDENTITY_OWNER_SPELLING_UNIFICATION).toBe("unified_in_phase_11b");
  });

  it("never assigns Asset, Inspection or Project Intelligence to Project Controls", () => {
    const foreign = PROJECT_CONTROLS_OWNERSHIP_MATRIX.filter((row) =>
      [
        "asset_identity_canonical",
        "asset_lifecycle_canonical",
        "asset_intelligence",
        "inspection_intelligence",
        "project_knowledge",
        "project_identity_canonical",
        "project_hierarchy_wbs_canonical",
        "canonical_risk_register",
        "financial_ledgers_billing",
      ].includes(row.concern),
    );
    expect(foreign.length).toBe(9);
    for (const row of foreign) {
      expect(row.owner, row.concern).not.toBe("project_controls");
    }
  });

  it("splits the matrix into owns / consumes / forbidden with no gaps", () => {
    const owns = listConcernsByRelation("owns");
    const consumes = listConcernsByRelation("consumes");
    const forbidden = listConcernsByRelation("forbidden");
    expect(owns.length + consumes.length + forbidden.length).toBe(
      PROJECT_CONTROLS_OWNERSHIP_MATRIX.length,
    );
    expect(owns.every((row) => row.owner === "project_controls")).toBe(true);
    expect(owns.some((row) => row.concern === "progress_controls_intelligence")).toBe(true);
    expect(owns.some((row) => row.concern === "schedule_controls_intelligence")).toBe(true);
    expect(owns.some((row) => row.concern === "project_profile_composition")).toBe(true);
    expect(forbidden.some((row) => row.concern === "earned_value")).toBe(true);
  });

  it("keeps every reserved Project Controls capability unimplemented", () => {
    for (const [name, flag] of [
      ["earned value", EARNED_VALUE_IMPLEMENTED],
      ["CPM", CPM_SCHEDULING_IMPLEMENTED],
      ["float", FLOAT_COMPUTATION_IMPLEMENTED],
      ["cost engine", COST_ENGINE_IMPLEMENTED],
      ["budget ledger", BUDGET_LEDGER_IMPLEMENTED],
      ["schedule execution", SCHEDULE_EXECUTION_IMPLEMENTED],
      ["forecasting", FORECASTING_IMPLEMENTED],
      ["resource leveling", RESOURCE_LEVELING_IMPLEMENTED],
      ["work packaging UI", WORK_PACKAGING_UI_IMPLEMENTED],
      ["change control", CHANGE_CONTROL_IMPLEMENTED],
      ["contingency management", CONTINGENCY_MANAGEMENT_IMPLEMENTED],
      ["productivity analysis", PRODUCTIVITY_ANALYSIS_IMPLEMENTED],
      ["claims analysis", CLAIMS_ANALYSIS_IMPLEMENTED],
      ["cash flow", CASH_FLOW_IMPLEMENTED],
      ["cost/schedule tables", PROJECT_CONTROLS_COST_SCHEDULE_TABLES_INTRODUCED],
      ["product UI", PROJECT_CONTROLS_PRODUCT_UI_IMPLEMENTED],
      ["duplicate asset ownership", DUPLICATE_ASSET_OWNERSHIP_INTRODUCED],
      ["duplicate project ownership", DUPLICATE_PROJECT_OWNERSHIP_DETECTED],
      ["canonical lifecycle mutation", CANONICAL_LIFECYCLE_MUTATION_ALLOWED],
      ["core risk auto mutation", RISK_CORE_AUTO_MUTATION_ALLOWED],
    ] as const) {
      expect(flag, name).toBe(false);
    }
  });

  it("rejects every reserved provider call with not_implemented", async () => {
    const guard = assertReservedProvidersUnimplemented();
    expect(guard.ok).toBe(true);
    expect(guard.reservedProviderKeys).toEqual(RESERVED_PROVIDER_KEYS);

    const providers = createReservedProviderSet();
    const query = {
      tenantId: "t1",
      workspaceId: "w1",
      scope: { kind: "project" as const, projectId: "p1" },
    };
    await expect(providers.earnedValue.getEarnedValue(query)).rejects.toThrow(
      /not_implemented:earned_value\.getEarnedValue/,
    );
    await expect(providers.schedule.getCriticalPath(query)).rejects.toThrow(
      /not_implemented:schedule\.getCriticalPath/,
    );
    await expect(providers.cost.getBudget(query)).rejects.toThrow(/not_implemented:cost\.getBudget/);
    await expect(providers.forecast.getCostForecast(query)).rejects.toThrow(/not_implemented/);
    await expect(providers.change.getChangeImpact(query)).rejects.toThrow(/not_implemented/);
    await expect(providers.productivity.getUnitRates(query)).rejects.toThrow(/not_implemented/);
  });

  it("introduces progress, schedule and change tables", () => {
    expect(PROJECT_CONTROLS_PROGRESS_TABLES_INTRODUCED).toBe(true);
    expect(PROJECT_CONTROLS_SCHEDULE_TABLES_INTRODUCED).toBe(true);
    expect(PROJECT_CONTROLS_CHANGE_TABLES_INTRODUCED).toBe(true);
    expect(PROJECT_CONTROLS_PROGRESS_TABLES.length).toBe(8);
    expect(PROJECT_CONTROLS_SCHEDULE_TABLES.length).toBe(5);
    expect(PROJECT_CONTROLS_CHANGE_TABLES.length).toBe(5);
    expect(PROJECT_CONTROLS_SHARED_PROJECT_TABLES.length).toBe(2);
    expect(PROJECT_CONTROLS_SCHEDULE_TABLES).toContain("project_controls_schedule_assessments");
    expect(PROJECT_CONTROLS_CHANGE_TABLES).toContain("project_controls_change_states");
    for (const table of [
      ...PROJECT_CONTROLS_PROGRESS_TABLES,
      ...PROJECT_CONTROLS_SCHEDULE_TABLES,
      ...PROJECT_CONTROLS_CHANGE_TABLES,
      ...PROJECT_CONTROLS_SHARED_PROJECT_TABLES,
    ]) {
      expect(table.startsWith("project_controls_")).toBe(true);
    }
  });

  it("references the frozen V1 baselines", () => {
    expect(ASSET_INTELLIGENCE_V1_TAG).toBe("asset-intelligence-v1.0.0");
    expect(ASSET_INTELLIGENCE_V1_COMMIT).toBe("925e2ed74025cac6a145c346c17c53320efb8757");
    expect(ASSET_INTELLIGENCE_V1_VERSION).toBe("1.0.0");
    expect(ASSET_INTELLIGENCE_V1_INTACT).toBe(true);
    expect(PROJECT_INTELLIGENCE_V1_COMMIT).toBe("34975b1cf660580d46287f24e746b8915903f768");
    expect(INSPECTION_INTELLIGENCE_V1_COMMIT).toBe("d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09");
  });

  it("keeps the Engineering OS module registry entry coming_soon", () => {
    expect(PROJECT_CONTROLS_MODULE_REGISTRY_STATUS).toBe("coming_soon");
  });

  it("exposes a coherent declaration", () => {
    const declaration = getProjectControlsDeclaration();
    expect(declaration.version).toBe("0.5.0-cost-intelligence");
    expect(declaration.status).toBe("cost_intelligence");
    expect(declaration.phase).toBe("11E");
    expect(declaration.productionProjectControlsReady).toBe(false);
    expect(declaration.sharedProjectDomainReady).toBe(true);
    expect(declaration.projectContextEngineReady).toBe(true);
    expect(declaration.progressIntelligenceReady).toBe(true);
    expect(declaration.scheduleIntelligenceReady).toBe(true);
    expect(declaration.changeIntelligenceReady).toBe(true);
    expect(declaration.changeIntelligenceIsAdvisoryOnly).toBe(true);
    expect(declaration.changeIntelligenceIsContractualAuthority).toBe(false);
    expect(declaration.financialPostingImplemented).toBe(false);
    expect(declaration.changeExecutionImplemented).toBe(false);
    expect(declaration.financialLedgerOwnership).toBe("external_finance_or_future_finance_domain");
    expect(declaration.canonicalProjectIdentityOwnership).toBe(
      "engineering_os_shared_project_domain",
    );
    expect(declaration.hierarchy).toContain("progress + schedule + change + cost intelligence");
    expect(declaration.hierarchy).toContain("advisory only");
  });
});
