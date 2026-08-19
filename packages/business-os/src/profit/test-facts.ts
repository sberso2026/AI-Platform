import type { BusinessProfitFact } from "@rtb/types";

export function testFact(
  partial: Partial<BusinessProfitFact> & Pick<BusinessProfitFact, "dimensionName">,
): BusinessProfitFact {
  return {
    id: partial.id ?? partial.dimensionName.replace(/\s+/g, "-").toLowerCase(),
    tenantId: "t",
    workspaceId: "w",
    periodStart: "2026-07-01",
    periodEnd: "2026-09-30",
    dimensionType: "customer",
    dimensionId: null,
    dimensionRef: partial.dimensionName,
    revenueMinor: "10000",
    directCostMinor: "4000",
    allocatedCostMinor: null,
    contributionMinor: null,
    profitAfterAllocatedMinor: null,
    currency: "AUD",
    scale: 2,
    valueState: "actual",
    attributionMethod: "source_direct",
    attributionConfidence: "high",
    sourceType: "test",
    sourceRef: partial.dimensionName,
    sourceTimestamp: "2026-09-30T00:00:00.000Z",
    provenance: {},
    isDemo: true,
    createdAt: "2026-09-30T00:00:00.000Z",
    updatedAt: "2026-09-30T00:00:00.000Z",
    ...partial,
  };
}
