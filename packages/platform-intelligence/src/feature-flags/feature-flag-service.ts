import type { SupabaseClient } from "@rtb/database";
import type { FeatureEvaluationInput } from "@rtb/types";
import { createHash } from "crypto";

export class FeatureFlagService {
  constructor(private readonly supabase: SupabaseClient) {}

  async listFeatures() {
    const { data, error } = await this.supabase.from("features").select("*").order("name");
    if (error) throw new Error(`Failed to list features: ${error.message}`);
    return data ?? [];
  }

  async listFlags(tenantId: string) {
    const { data, error } = await this.supabase
      .from("feature_flags")
      .select("*, features(*)")
      .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to list feature flags: ${error.message}`);
    return data ?? [];
  }

  async evaluate(input: FeatureEvaluationInput): Promise<boolean> {
    const env = input.environment ?? "production";

    const { data: feature } = await this.supabase
      .from("features")
      .select("id, default_enabled, is_experimental")
      .eq("feature_key", input.featureKey)
      .single();

    if (!feature) {
      await this.logEvaluation(input, false, "feature_not_found");
      return false;
    }

    const { data: flag } = await this.supabase
      .from("feature_flags")
      .select("enabled, rollout_pct")
      .eq("feature_id", feature.id as string)
      .or(`tenant_id.eq.${input.tenantId},tenant_id.is.null`)
      .eq("environment", env)
      .order("tenant_id", { ascending: false, nullsFirst: false })
      .limit(1)
      .single();

    let result: boolean = Boolean(
      (flag?.enabled as boolean | undefined) ?? (feature.default_enabled as boolean)
    );

    if (result && flag && (flag.rollout_pct as number) < 100 && input.userId) {
      const hash = createHash("md5").update(`${input.featureKey}:${input.userId}`).digest("hex");
      const bucket = parseInt(hash.slice(0, 8), 16) % 100;
      result = bucket < (flag.rollout_pct as number);
    }

    if ((feature.is_experimental as boolean) && !flag) {
      result = false;
    }

    await this.logEvaluation(input, result, flag ? "flag_evaluated" : "default");
    return result;
  }

  private async logEvaluation(input: FeatureEvaluationInput, result: boolean, reason: string) {
    await this.supabase.from("feature_evaluations").insert({
      tenant_id: input.tenantId,
      feature_key: input.featureKey,
      user_id: input.userId ?? null,
      result,
      reason,
    });
  }

  async setFlag(tenantId: string, featureKey: string, enabled: boolean, rolloutPct = 100) {
    const { data: feature } = await this.supabase
      .from("features")
      .select("id")
      .eq("feature_key", featureKey)
      .single();
    if (!feature) throw new Error("Feature not found");

    const { data, error } = await this.supabase
      .from("feature_flags")
      .upsert({
        feature_id: feature.id,
        tenant_id: tenantId,
        environment: "production",
        enabled,
        rollout_pct: rolloutPct,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to set feature flag: ${error.message}`);
    return data;
  }
}
