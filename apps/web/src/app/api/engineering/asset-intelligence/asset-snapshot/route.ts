import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { handleCommerceDomainError, lifecycleErrorResponse, resolveRequestId } from "@/lib/lifecycle-api";
import {
  PREDICTIVE_OBJECTIVE_REGISTRY,
  createFailureTaxonomyRegistry,
  createPostgresAssetIntelligenceRepository,
} from "@rtb/asset-intelligence";

async function safeRead<T>(label: string, fn: () => Promise<T>): Promise<{
  surface: string;
  present: boolean;
  data: T | null;
  error?: string;
}> {
  try {
    const data = await fn();
    const present = data !== undefined && data !== null && !(Array.isArray(data) && data.length === 0);
    return { surface: label, present, data: data ?? null };
  } catch (error) {
    return {
      surface: label,
      present: false,
      data: null,
      error: error instanceof Error ? error.message : "read_failed",
    };
  }
}

/**
 * Operational read snapshot for one asset — hosted postgres + certified registries.
 * Does not synthesize assessments; empty surfaces return present:false.
 */
export const GET = withEngineeringApi(
  "asset-intelligence-asset-snapshot",
  async (context, request) => {
    const requestId = resolveRequestId(request) ?? context.correlationId;
    try {
      if (!context.ctx.workspaceId) {
        return lifecycleErrorResponse("workspace_required", "workspaceId is required", 400, requestId);
      }
      const assetId = new URL(request.url).searchParams.get("assetId");
      if (!assetId) {
        return lifecycleErrorResponse("invalid_asset_snapshot", "assetId is required", 400, requestId);
      }

      const tenantId = context.ctx.tenantId;
      const workspaceId = context.ctx.workspaceId;
      const repo = createPostgresAssetIntelligenceRepository(context.ctx.supabase);
      const taxonomy = createFailureTaxonomyRegistry();

      const [
        condition,
        criticality,
        reliability,
        failure,
        degradation,
        lifecycle,
        risk,
        maintenance,
        priority,
        fusion,
        health,
        timeline,
        conditionHistory,
      ] = await Promise.all([
        safeRead("condition", () => repo.latestCondition(tenantId, workspaceId, assetId)),
        safeRead("criticality", () => repo.latestCriticality(tenantId, workspaceId, assetId)),
        safeRead("reliability", () => repo.latestReliability(tenantId, workspaceId, assetId)),
        safeRead("failure", () => repo.latestFailureMode(tenantId, workspaceId, assetId)),
        safeRead("trend_degradation", () =>
          repo.latestDegradationState(tenantId, workspaceId, assetId),
        ),
        safeRead("lifecycle", () => repo.latestLifecycleState(tenantId, workspaceId, assetId)),
        safeRead("risk", () => repo.latestRiskSignal(tenantId, workspaceId, assetId)),
        safeRead("maintenance", () =>
          repo.latestMaintenanceRecommendation(tenantId, workspaceId, assetId),
        ),
        safeRead("priority", () => repo.latestPriorityProfile(tenantId, workspaceId, assetId)),
        safeRead("fusion", () => repo.latestFusionState(tenantId, workspaceId, assetId)),
        safeRead("health", () => repo.latestHealthIndex(tenantId, workspaceId, assetId)),
        safeRead("timeline", () => repo.listTimeline(assetId)),
        safeRead("condition_history", () =>
          repo.listConditionHistory(tenantId, workspaceId, assetId),
        ),
      ]);

      return NextResponse.json({
        data: {
          assetId,
          tenantId,
          workspaceId,
          surfaces: {
            condition,
            criticality,
            reliability,
            failure,
            trend_degradation: degradation,
            lifecycle,
            risk,
            maintenance,
            priority,
            fusion,
            health,
            timeline,
            condition_history: conditionHistory,
            predictive_governance: {
              surface: "predictive_governance",
              present: true,
              data: {
                objectives: PREDICTIVE_OBJECTIVE_REGISTRY.map((o) => ({
                  objectiveId: o.objectiveId,
                  status: o.status,
                  certified: o.certified,
                  description: o.description,
                })),
                executionEnabled: false,
                note: "Governance registry only — predictive execution is unavailable in V1.0.",
              },
            },
            failure_taxonomy: {
              surface: "failure_taxonomy",
              present: true,
              data: {
                taxonomyVersion: taxonomy.taxonomyVersion,
                count: taxonomy.list().length,
              },
            },
          },
          unavailable: [
            "predictive_execution",
            "probability_of_failure",
            "remaining_useful_life",
            "predictive_ml",
          ],
        },
        requestId,
      });
    } catch (error) {
      return handleCommerceDomainError(error, requestId);
    }
  },
);
