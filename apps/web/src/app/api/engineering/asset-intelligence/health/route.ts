import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { handleCommerceDomainError, resolveRequestId } from "@/lib/lifecycle-api";
import {
  collectAssetIntelligencePersistenceHealth,
  createPostgresAssetIntelligenceRepository,
} from "@rtb/asset-intelligence";

export const GET = withEngineeringApi("asset-intelligence-health", async (context, request) => {
  const requestId = resolveRequestId(request) ?? context.correlationId;
  try {
    const repository = createPostgresAssetIntelligenceRepository(context.ctx.supabase);
    const health = await collectAssetIntelligencePersistenceHealth({
      repository,
      probe: async () => {
        const { error } = await context.ctx.supabase
          .from("asset_intelligence_condition_states")
          .select("id", { count: "exact", head: true });
        return {
          ok: !error,
          migrationIdentity: "20260807120000_batch_51_asset_intelligence_hosted_persistence",
        };
      },
    });
    return NextResponse.json({ data: health, requestId });
  } catch (error) {
    return handleCommerceDomainError(error, requestId);
  }
});
