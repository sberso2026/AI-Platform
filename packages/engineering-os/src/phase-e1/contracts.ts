/**
 * Phase E1 — Assistant-first Engineering Experience foundation contracts.
 * Experience layer only; does not own certified module logic.
 */

import {
  E0ForbidsDuplicatePiIiOwnership,
  E0ForbidsForcedExternalDependency,
  E0PreservesCertifiedModuleOwnership,
  EngineeringIntelligenceLayerContractLocked,
  ExperienceSurfaces,
  CapabilityBasedUxHideUnavailable,
  HideDeadNonClickablePrimaryFeatures,
  NoMandatorySapM365CopilotDependency,
  PlatformComplexityHiddenFromEngineers,
  supportsZeroConnectorNativeDeployment,
} from "../phase-e0/contracts";

export const ENGINEERING_OS_EVOLUTION_PHASE_E1 = "E1" as const;
export const ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E1 = "0.1.0-e1" as const;

export const PhaseE1ExperienceFoundationComplete = true as const;
export const PhaseE1NoCertifiedOwnershipRegression = true as const;
export const PhaseE1NoMajorDbMigration = true as const;
export const PhaseE1EssentialZeroConnector = true as const;
export const PhaseE1ComposesExistingServicesOnly = true as const;
export const PhaseE1DoesNotOwnDomainLogic = true as const;
export const PhaseE1DoesNotOwnPiIiAiLogic = true as const;
export const PhaseE1DoesNotOwnToolExecution = true as const;
export const PhaseE1DoesNotOwnKgOrMemory = true as const;
export const PhaseE1DoesNotOwnConnectors = true as const;
export const PhaseE1HidePlatformInternalsFromEngineers = true as const;
export const PhaseE1NoFakeAiResponses = true as const;
export const PhaseE1EvidencePlaceholdersReady = true as const;

/** Primary experience routes (user-facing). */
export const E1_EXPERIENCE_ROUTES = {
  home: "/engineering",
  ask: "/engineering/ask",
  my: "/engineering/my",
  explore: "/engineering/explore",
  intelligence: "/engineering/intelligence",
} as const;

export type E1ExperienceRouteKey = keyof typeof E1_EXPERIENCE_ROUTES;

export const E1_PRIMARY_NAV_IDS = [
  "eng-home",
  "eng-ask",
  "eng-my",
  "eng-explore",
  "eng-intelligence",
] as const;

/** Surfaces that may require feature/application entitlement to appear in primary nav. */
export const E1_SURFACE_CAPABILITY_GATES = {
  home: { productKey: "engineering-os" },
  ask: { productKey: "engineering-os", featureKey: "ai_assistant" },
  my: { productKey: "engineering-os" },
  explore: { productKey: "engineering-os" },
  intelligence: { productKey: "engineering-os" },
} as const;

/** Platform internals that must remain hidden from ordinary engineer primary nav. */
export const E1_PLATFORM_INTERNALS_HIDDEN_FROM_ENGINEERS = [
  "prompt_registry",
  "model_registry",
  "tool_registry_internals",
  "event_bus",
  "knowledge_graph_internals",
  "telemetry",
  "provider_routing",
  "feature_flags",
  "secret_manager",
  "evaluation_framework",
] as const;

export type EngineeringContextObjectType =
  | "project"
  | "asset"
  | "document"
  | "technical_query"
  | "decision"
  | "action"
  | "risk"
  | "issue"
  | "inspection"
  | "other";

/** Developer contract for Engineering Context state (experience layer). */
export type EngineeringExperienceContext = {
  tenantId: string | null;
  workspaceId: string | null;
  userId: string | null;
  roleSlug: string | null;
  activeProfile: "ESSENTIAL" | "PROFESSIONAL" | "ENTERPRISE" | null;
  route: string;
  projectId: string | null;
  objectType: EngineeringContextObjectType | null;
  objectId: string | null;
  activeCapability: string | null;
  sessionId: string | null;
};

export const ENGINEERING_CONTEXT_STORAGE_KEY = "rtb.engineering.experience.context" as const;

export function createEmptyEngineeringContext(
  partial?: Partial<EngineeringExperienceContext>,
): EngineeringExperienceContext {
  return {
    tenantId: null,
    workspaceId: null,
    userId: null,
    roleSlug: null,
    activeProfile: "ESSENTIAL",
    route: E1_EXPERIENCE_ROUTES.home,
    projectId: null,
    objectType: null,
    objectId: null,
    activeCapability: null,
    sessionId: null,
    ...partial,
  };
}

export function assertTenantWorkspaceIsolation(
  a: Pick<EngineeringExperienceContext, "tenantId" | "workspaceId">,
  b: Pick<EngineeringExperienceContext, "tenantId" | "workspaceId">,
): boolean {
  if (!a.tenantId || !b.tenantId) return false;
  if (a.tenantId !== b.tenantId) return false;
  if (a.workspaceId && b.workspaceId && a.workspaceId !== b.workspaceId) return false;
  return true;
}

export function parseDeepLinkContext(input: {
  route: string;
  searchParams?: Record<string, string | string[] | undefined> | URLSearchParams | null;
}): Pick<
  EngineeringExperienceContext,
  "route" | "projectId" | "objectType" | "objectId" | "activeCapability"
> {
  const params =
    input.searchParams instanceof URLSearchParams
      ? input.searchParams
      : (() => {
          const next = new URLSearchParams();
          for (const [k, v] of Object.entries(input.searchParams ?? {})) {
            if (v == null) continue;
            if (Array.isArray(v)) {
              for (const item of v) next.append(k, item);
            } else {
              next.set(k, v);
            }
          }
          return next;
        })();

  const projectId = params.get("projectId") || params.get("project") || null;
  const objectTypeRaw = params.get("objectType") || params.get("type") || null;
  const objectId =
    params.get("objectId") ||
    params.get("assetId") ||
    params.get("documentId") ||
    params.get("tqId") ||
    params.get("decisionId") ||
    params.get("actionId") ||
    params.get("riskId") ||
    null;

  let objectType = objectTypeRaw as EngineeringContextObjectType | null;
  if (!objectType && params.get("assetId")) objectType = "asset";
  if (!objectType && params.get("documentId")) objectType = "document";
  if (!objectType && params.get("tqId")) objectType = "technical_query";
  if (!objectType && params.get("decisionId")) objectType = "decision";
  if (!objectType && params.get("actionId")) objectType = "action";
  if (!objectType && params.get("riskId")) objectType = "risk";
  if (!objectType && projectId && !objectId) objectType = "project";

  return {
    route: input.route,
    projectId,
    objectType,
    objectId,
    activeCapability: params.get("capability") || null,
  };
}

export function filterVisiblePrimaryNavIds(input: {
  entitledFeatureKeys: readonly string[];
  productEntitled: boolean;
}): string[] {
  if (!input.productEntitled) return [];
  const ids: string[] = ["eng-home", "eng-my", "eng-explore", "eng-intelligence"];
  if (input.entitledFeatureKeys.includes("ai_assistant")) {
    ids.splice(1, 0, "eng-ask");
  }
  return ids;
}

export function getPhaseE1Declaration() {
  return {
    evolutionPhase: ENGINEERING_OS_EVOLUTION_PHASE_E1,
    contractVersion: ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E1,
    PhaseE1ExperienceFoundationComplete,
    PhaseE1NoCertifiedOwnershipRegression,
    PhaseE1NoMajorDbMigration,
    PhaseE1EssentialZeroConnector,
    PhaseE1ComposesExistingServicesOnly,
    PhaseE1DoesNotOwnDomainLogic,
    PhaseE1DoesNotOwnPiIiAiLogic,
    PhaseE1DoesNotOwnToolExecution,
    PhaseE1DoesNotOwnKgOrMemory,
    PhaseE1DoesNotOwnConnectors,
    PhaseE1HidePlatformInternalsFromEngineers,
    PhaseE1NoFakeAiResponses,
    PhaseE1EvidencePlaceholdersReady,
    routes: E1_EXPERIENCE_ROUTES,
    primaryNavIds: E1_PRIMARY_NAV_IDS,
    experienceSurfaces: ExperienceSurfaces,
    CapabilityBasedUxHideUnavailable,
    HideDeadNonClickablePrimaryFeatures,
    PlatformComplexityHiddenFromEngineers,
    supportsZeroConnectorNativeDeployment,
    NoMandatorySapM365CopilotDependency,
    platformInternalsHidden: E1_PLATFORM_INTERNALS_HIDDEN_FROM_ENGINEERS,
  } as const;
}

export function assertPhaseE1Invariants(input: {
  ProjectIntelligenceV1Intact: boolean;
  InspectionIntelligenceV1Intact: boolean;
  AssetIntelligenceV1Intact: boolean;
  ProjectControlsV1Intact: boolean;
  DigitalTwinV1Intact: boolean;
  EngineeringModelInteroperabilityV1Intact: boolean;
  privateCrossModuleCouplingDetected: boolean;
  duplicateAssetOwnershipDetected: boolean;
  EngineeringOSProductBoundaryLocked: boolean;
}): void {
  if (!EngineeringIntelligenceLayerContractLocked) {
    throw new Error("E1 requires E0 contract locked");
  }
  if (!E0PreservesCertifiedModuleOwnership || !E0ForbidsDuplicatePiIiOwnership) {
    throw new Error("E1 requires E0 ownership invariants");
  }
  if (!E0ForbidsForcedExternalDependency || !NoMandatorySapM365CopilotDependency) {
    throw new Error("E1 forbids forced external dependency");
  }
  if (!PhaseE1EssentialZeroConnector || !supportsZeroConnectorNativeDeployment) {
    throw new Error("E1 ESSENTIAL must remain zero-connector");
  }
  if (!PhaseE1DoesNotOwnDomainLogic || !PhaseE1DoesNotOwnPiIiAiLogic) {
    throw new Error("E1 must not own domain/PI/II/AI logic");
  }
  if (!input.ProjectIntelligenceV1Intact || !input.InspectionIntelligenceV1Intact) {
    throw new Error("E1 regression: PI/II intact flags");
  }
  if (
    !input.AssetIntelligenceV1Intact ||
    !input.ProjectControlsV1Intact ||
    !input.DigitalTwinV1Intact ||
    !input.EngineeringModelInteroperabilityV1Intact
  ) {
    throw new Error("E1 regression: certified module intact flags");
  }
  if (input.privateCrossModuleCouplingDetected || input.duplicateAssetOwnershipDetected) {
    throw new Error("E1 regression: coupling/duplicate ownership");
  }
  if (!input.EngineeringOSProductBoundaryLocked) {
    throw new Error("E1 requires product boundary locked");
  }
}
