import type { AuthContext } from "@/lib/kernel";
import {
  ENGINEERING_CERTIFIED_V1_MODULES,
  mapEntitlementReasonToUiState,
  moduleAccessLabel,
  type EngineeringModuleAccessUiState,
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
  reasonCode?: string;
  uiState: EngineeringModuleAccessUiState;
  uiLabel: string;
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

  const modules: CanonicalModuleAccess[] = PILOT_APPLICATION_KEYS.map((applicationKey, index) => {
    const decision = appDecisions[index];
    const certified = ENGINEERING_CERTIFIED_V1_MODULES.find((m) => m.applicationKey === applicationKey);
    const allowed = Boolean(decision?.allowed);
    const uiState = mapEntitlementReasonToUiState(allowed, decision?.reasonCode);
    return {
      key: applicationKey,
      applicationKey,
      allowed,
      reasonCode: decision?.reasonCode,
      uiState,
      uiLabel: moduleAccessLabel(uiState),
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
