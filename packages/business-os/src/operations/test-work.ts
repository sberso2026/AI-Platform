import type { BusinessWorkItem, BusinessWorkMilestone } from "@rtb/types";

export function work(partial: Partial<BusinessWorkItem> = {}): BusinessWorkItem {
  return {
    id: "w1",
    tenantId: "t",
    workspaceId: "w",
    reference: "JOB-1",
    name: "Sample work",
    workType: "customer_job",
    owner: "Owner",
    status: "active",
    progressBps: null,
    progressSource: "unknown",
    currency: "AUD",
    scale: 2,
    contractedValueMinor: null,
    budgetCostMinor: "1000000",
    actualCostMinor: null,
    lastStatusAt: "2026-08-18T00:00:00.000Z",
    sourceType: "demo",
    sourceRef: "sample",
    provenance: {},
    isDemo: true,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-18T00:00:00.000Z",
    ...partial,
  };
}

export function milestone(partial: Partial<BusinessWorkMilestone> = {}): BusinessWorkMilestone {
  return {
    id: "m1",
    tenantId: "t",
    workspaceId: "w",
    workId: "w1",
    name: "Gate",
    status: "not_started",
    weightBps: null,
    sourceType: "demo",
    sourceRef: "ms-1",
    provenance: {},
    isDemo: true,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-18T00:00:00.000Z",
    ...partial,
  };
}
