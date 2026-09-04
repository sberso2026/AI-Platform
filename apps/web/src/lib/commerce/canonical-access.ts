import { ApplicationInstallationLifecycleService, InstallationStateMachine } from "@rtb/platform-commerce";
import type { AuthContext } from "@/lib/kernel";
import { hasCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";
import {
  ENGINEERING_CERTIFIED_V1_MODULES,
  mapEntitlementReasonToUiState,
  moduleAccessLabel,
  resolveModuleMatrixPresentation,
  type EngineeringModuleAccessUiState,
  type EngineeringModuleMatrixAction,
  type EngineeringModuleMatrixState,
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
  entitled: boolean;
  installed: boolean;
  accessible: boolean;
  reasonCode?: string;
  uiState: EngineeringModuleAccessUiState;
  uiLabel: string;
  matrixState: EngineeringModuleMatrixState;
  matrixBadge: string;
  matrixAction: EngineeringModuleMatrixAction;
  matrixActionLabel: string;
  chipStatus: "complete" | "open" | "pending" | "ai-review" | "critical";
  name?: string;
  href?: string;
};

function canInstallApplications(roleSlug: string): boolean {
  try {
    ApplicationInstallationLifecycleService.assertInstallPermission(roleSlug);
    return true;
  } catch {
    return false;
  }
}

export async function loadCanonicalEngineeringAccess(ctx: AuthContext) {
  const base = {
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    productKey: "engineering-os" as const,
    action: "access" as const,
  };

  const [productAccess, aiAssistant, installations, ...appDecisions] = await Promise.all([
    ctx.commerce.entitlements.check(base),
    ctx.commerce.entitlements.check({ ...base, featureKey: "ai_assistant", action: "ai.execute" }),
    ctx.commerce.applicationInstallationLifecycle.listByTenant(ctx.tenantId),
    ...PILOT_APPLICATION_KEYS.map((applicationKey) =>
      ctx.commerce.entitlements.check({ ...base, applicationKey }),
    ),
  ]);

  const canInstall = canInstallApplications(ctx.roleSlug);
  const canReconcilePilot = hasCommerceAdmin(ctx) && canInstall;

  const modules: CanonicalModuleAccess[] = PILOT_APPLICATION_KEYS.map((applicationKey, index) => {
    const decision = appDecisions[index];
    const certified = ENGINEERING_CERTIFIED_V1_MODULES.find((m) => m.applicationKey === applicationKey);
    const allowed = Boolean(decision?.allowed);
    const uiState = mapEntitlementReasonToUiState(allowed, decision?.reasonCode);
    const installed = installations.some(
      (row) =>
        row.application_key === applicationKey &&
        InstallationStateMachine.isAccessGranting(
          InstallationStateMachine.normalizeAppStatus(row.status) as never,
        ),
    );
    const entitled =
      allowed ||
      decision?.reasonCode === "installation_not_found" ||
      decision?.reasonCode === "installation_not_active" ||
      decision?.reasonCode === "licence_not_found";
    const presentation = resolveModuleMatrixPresentation({
      releaseEligible: certified?.releaseEligible ?? false,
      entitled,
      installed,
      accessible: allowed,
      canInstall,
      reasonCode: decision?.reasonCode,
    });
    return {
      key: applicationKey,
      applicationKey,
      allowed,
      entitled,
      installed,
      accessible: allowed,
      reasonCode: decision?.reasonCode,
      uiState,
      uiLabel: moduleAccessLabel(uiState),
      matrixState: presentation.state,
      matrixBadge: presentation.badge,
      matrixAction: presentation.action,
      matrixActionLabel: presentation.actionLabel,
      chipStatus: presentation.chipStatus,
      name: certified?.name,
      href: certified?.href,
    };
  });

  const documents = modules.find((m) => m.applicationKey === "documents");
  if (documents && !ENGINEERING_CERTIFIED_V1_MODULES.some((m) => m.applicationKey === "documents")) {
    documents.name = "Documents";
    documents.href = "/engineering/documents";
  }

  const certifiedModules = modules.filter((module) =>
    ENGINEERING_CERTIFIED_V1_MODULES.some((certified) => certified.applicationKey === module.applicationKey),
  );

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
    certifiedModules,
    entitledApplicationKeys: modules.filter((m) => m.allowed).map((m) => m.applicationKey),
    entitledFeatureKeys: aiAssistant.allowed ? ["ai_assistant"] : [],
    canInstall,
    canReconcilePilot,
    needsPilotReconcile: certifiedModules.some((module) => module.reasonCode === "application_not_in_plan"),
    deploymentProfile: process.env.NEXT_PUBLIC_EOS_DEPLOYMENT_PROFILE ?? "ESSENTIAL",
  };
}

export function isReadOnlyEngineeringRole(roleSlug: string | undefined): boolean {
  return roleSlug === "viewer";
}
