import type { AuthContext } from "@/lib/kernel";
import { createServiceClient } from "@/lib/supabase/service";
import {
  ENGINEERING_CERTIFIED_V1_MODULES,
  engineeringSystemsCommerceState,
  mapEntitlementReasonToUiState,
  moduleAccessLabel,
  type EngineeringModuleAccessUiState,
  type EngineeringSystemsCommerceState,
} from "@/lib/engineering/certified-modules";

const PILOT_APPLICATION_KEYS = [
  "project_intelligence",
  "documents",
  "inspection_intelligence",
  "project_controls",
  "asset_intelligence",
  "digital_twin",
  "engineering_model_interoperability",
] as const;

export type CanonicalModuleAccess = {
  key: string;
  applicationKey: string;
  allowed: boolean;
  installed: boolean;
  reasonCode?: string;
  uiState: EngineeringModuleAccessUiState;
  uiLabel: string;
  systemsState: EngineeringSystemsCommerceState;
  name?: string;
  href?: string;
};

export async function loadCanonicalEngineeringAccess(ctx: AuthContext) {
  const base = {
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    productKey: "engineering-os" as const,
    action: "access" as const,
  };

  const [productAccess, aiAssistant, ...appDecisions] = await Promise.all([
    ctx.commerce.entitlements.check(base),
    ctx.commerce.entitlements.check({ ...base, featureKey: "ai_assistant", action: "ai.execute" }),
    ...PILOT_APPLICATION_KEYS.map((applicationKey) =>
      ctx.commerce.entitlements.check({ ...base, applicationKey }),
    ),
  ]);

  let installations: Array<{ application_key?: string; applicationKey?: string; status?: string }> = [];
  try {
    installations = await ctx.commerce.applicationInstallationLifecycle.listByTenant(ctx.tenantId);
  } catch {
    installations = [];
  }
  if (installations.length === 0) {
    try {
      const service = createServiceClient();
      const { data } = await service
        .from("commercial_application_installations")
        .select("application_key, status")
        .eq("tenant_id", ctx.tenantId);
      installations = (data ?? []) as Array<{ application_key?: string; status?: string }>;
    } catch {
      installations = [];
    }
  }

  const installedKeys = new Set(
    (installations ?? [])
      .filter((row) => {
        const status = String(row.status ?? "");
        return status === "active" || status === "healthy" || status === "degraded";
      })
      .map((row) => String(row.application_key ?? row.applicationKey ?? ""))
      .filter(Boolean),
  );

  const modules: CanonicalModuleAccess[] = PILOT_APPLICATION_KEYS.map((applicationKey, index) => {
    const decision = appDecisions[index];
    const certified = ENGINEERING_CERTIFIED_V1_MODULES.find((m) => m.applicationKey === applicationKey);
    const allowed = Boolean(decision?.allowed);
    const installed = installedKeys.has(applicationKey);
    const uiState = mapEntitlementReasonToUiState(allowed, decision?.reasonCode);
    return {
      key: applicationKey,
      applicationKey,
      allowed,
      installed,
      reasonCode: decision?.reasonCode,
      uiState,
      uiLabel: moduleAccessLabel(uiState),
      systemsState: engineeringSystemsCommerceState({
        allowed,
        installed,
        reasonCode: decision?.reasonCode,
      }),
      name: certified?.name,
      href: certified?.href,
    };
  });

  const documents = modules.find((m) => m.applicationKey === "documents");
  if (documents && !ENGINEERING_CERTIFIED_V1_MODULES.some((m) => m.applicationKey === "documents")) {
    documents.name = "Documents";
    documents.href = "/engineering/documents";
  }

  return {
    productAccess: {
      allowed: Boolean(productAccess.allowed),
      reasonCode: productAccess.reasonCode,
    },
    aiAssistant: {
      allowed: Boolean(aiAssistant.allowed),
      reasonCode: aiAssistant.reasonCode,
    },
    features: [
      {
        key: "ai_assistant",
        allowed: Boolean(aiAssistant.allowed),
        reasonCode: aiAssistant.reasonCode,
      },
    ],
    modules,
    entitledApplicationKeys: modules.filter((m) => m.allowed).map((m) => m.applicationKey),
    entitledFeatureKeys: aiAssistant.allowed ? ["ai_assistant"] : [],
    deploymentProfile: process.env.NEXT_PUBLIC_EOS_DEPLOYMENT_PROFILE ?? "ESSENTIAL",
  };
}

export function isReadOnlyEngineeringRole(roleSlug: string | undefined): boolean {
  return roleSlug === "viewer";
}
