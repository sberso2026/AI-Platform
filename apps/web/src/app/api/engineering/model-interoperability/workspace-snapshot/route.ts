import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { handleCommerceDomainError, lifecycleErrorResponse, resolveRequestId } from "@/lib/lifecycle-api";
import {
  ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
  createPostgresEngineeringModelRepository,
  getSpaceGassProviderStatus,
  getEtabsProviderStatus,
  SPACEGASS_LIVE_EXECUTION_CERTIFIED,
} from "@rtb/engineering-model-interoperability";

async function safeRead<T>(label: string, fn: () => Promise<T>) {
  try {
    const data = await fn();
    const present =
      data !== undefined && data !== null && !(Array.isArray(data) && data.length === 0);
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

/** Operational EMI workspace inventory from hosted persistence + provider status. */
export const GET = withEngineeringApi(
  "model-interoperability-workspace-snapshot",
  async (context, request) => {
    const requestId = resolveRequestId(request) ?? context.correlationId;
    try {
      if (!context.ctx.workspaceId) {
        return lifecycleErrorResponse("workspace_required", "workspaceId is required", 400, requestId);
      }
      const tenantId = context.ctx.tenantId;
      const workspaceId = context.ctx.workspaceId;
      const repo = createPostgresEngineeringModelRepository(context.ctx.supabase);

      const [models, versions, elements, mappings, reviews, impacts, results] = await Promise.all([
        safeRead("models", () => repo.listModels(tenantId, workspaceId)),
        safeRead("versions", () => repo.listVersions(tenantId, workspaceId)),
        safeRead("elements", () => repo.listElements(tenantId, workspaceId)),
        safeRead("mappings", () => repo.listMappings(tenantId, workspaceId)),
        safeRead("reviews", () => repo.listReviews(tenantId, workspaceId)),
        safeRead("change_impacts", () => repo.listChangeImpacts(tenantId, workspaceId)),
        safeRead("results", () => repo.listResults(tenantId, workspaceId)),
      ]);

      const spacegass = getSpaceGassProviderStatus();
      let etabs: unknown = null;
      try {
        etabs = getEtabsProviderStatus();
      } catch {
        etabs = { available: false, note: "ETABS provider status unavailable" };
      }

      return NextResponse.json({
        data: {
          tenantId,
          workspaceId,
          moduleVersion: ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
          surfaces: {
            models,
            versions,
            elements,
            mappings,
            reviews,
            change_impacts: impacts,
            results,
            spacegass: {
              surface: "spacegass",
              present: true,
              data: {
                provider: spacegass,
                liveExecutionCertified: SPACEGASS_LIVE_EXECUTION_CERTIFIED,
                executionLabel: "NOT CERTIFIED",
              },
            },
            etabs: {
              surface: "etabs",
              present: true,
              data: {
                provider: etabs,
                liveExecutionCertified: false,
                executionLabel: "NOT CERTIFIED",
              },
            },
          },
          notCertified: [
            "spacegass_live_execution",
            "etabs_live_execution",
            "live_native_com",
          ],
          unavailable: [
            "sap2000",
            "safe",
            "csi_bridge",
            "analysis_model_generation",
          ],
        },
        requestId,
      });
    } catch (error) {
      return handleCommerceDomainError(error, requestId);
    }
  },
);
