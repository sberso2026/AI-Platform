import { ARTIFACT_TEMPLATES, findArtifactTemplate } from "./catalog";
import type { ArtifactType, EngineeringArtifactTemplate, WorkPlanLike } from "./types";
import {
  DEFAULT_TEMPLATE_FALLBACK_POLICY,
  TEMPLATE_PRECEDENCE,
  type ArtifactBranding,
  type ArtifactTemplatePolicyRecord,
  type TemplateFallbackPolicy,
  type TemplateResolutionState,
  type TemplateSourceClass,
} from "./template-policy";

export type TemplateResolution = {
  ok: boolean;
  state: TemplateResolutionState;
  template: EngineeringArtifactTemplate | null;
  calculationDefinition: EngineeringArtifactTemplate | null;
  sourceClass: TemplateSourceClass | null;
  precedence: TemplateSourceClass[];
  reason: string;
  fallbackUsed: boolean;
  conflict: boolean;
  branding: ArtifactBranding;
  policyId: string | null;
  packagedAssetKey: string | null;
};

export type ResolveTemplateInput = {
  plan: WorkPlanLike;
  artifactType?: ArtifactType;
  requestedCode?: string;
  requestedVersion?: string;
  policies?: ArtifactTemplatePolicyRecord[];
  fallbackPolicy?: TemplateFallbackPolicy;
  branding?: ArtifactBranding;
};

function stampEos(row: EngineeringArtifactTemplate): EngineeringArtifactTemplate {
  return {
    ...row,
    sourceClass: row.sourceClass ?? "EOS_DEFAULT",
    presentationKind: row.presentationKind ?? (row.formulas.length ? "DEFINITION" : "COMBINED"),
  };
}

function matchesPolicy(policy: ArtifactTemplatePolicyRecord, input: ResolveTemplateInput, artifactType: ArtifactType) {
  if (!policy.active || policy.status !== "ACTIVE") return false;
  if (policy.artifactType !== artifactType) return false;
  if (policy.disciplines.length && input.plan.discipline && !policy.disciplines.includes(input.plan.discipline)) return false;
  if (policy.workTypes.length && !policy.workTypes.includes(input.plan.workType)) return false;
  if (policy.lifecycleStages.length && !policy.lifecycleStages.includes(input.plan.lifecycleStage)) return false;
  return true;
}

function overlayPolicy(packaged: EngineeringArtifactTemplate, policy: ArtifactTemplatePolicyRecord): EngineeringArtifactTemplate {
  return {
    ...packaged,
    id: policy.id,
    code: policy.templateCode,
    version: policy.templateVersion,
    name: policy.name,
    sourceClass: policy.sourceClass,
    presentationKind: policy.presentationKind,
    certification: packaged.certification,
    productionEngineeringUse: false,
  };
}

function eosDefaults(artifactType: ArtifactType, plan: WorkPlanLike, requestedCode?: string, requestedVersion?: string) {
  if (requestedCode) {
    const requested = findArtifactTemplate(requestedCode, requestedVersion);
    if (requested && requested.artifactType === artifactType) return stampEos(requested);
  }
  const exact = ARTIFACT_TEMPLATES.find(
    (row) =>
      row.artifactType === artifactType &&
      row.workTypes.includes(plan.workType) &&
      row.lifecycleStages.includes(plan.lifecycleStage),
  );
  if (exact) return stampEos(exact);
  const byWork = ARTIFACT_TEMPLATES.find((row) => row.artifactType === artifactType && row.workTypes.includes(plan.workType));
  if (byWork) return stampEos(byWork);
  const byType = ARTIFACT_TEMPLATES.find((row) => row.artifactType === artifactType);
  return byType ? stampEos(byType) : null;
}

function calculationDefinitionFor(plan: WorkPlanLike, presentation: EngineeringArtifactTemplate, packagedAssetKey?: string | null) {
  if (presentation.artifactType !== "CALCULATION_WORKBOOK") return null;
  if (presentation.presentationKind === "SHELL") {
    const key = packagedAssetKey && packagedAssetKey !== presentation.code ? packagedAssetKey : "EAT-CALC-EXAMPLE-BEARING";
    const definition = findArtifactTemplate(key) ?? ARTIFACT_TEMPLATES.find((row) => row.code === "EAT-CALC-EXAMPLE-BEARING");
    return definition ? stampEos(definition) : null;
  }
  if (presentation.presentationKind === "DEFINITION" || presentation.formulas.length) return stampEos(presentation);
  const definition = ARTIFACT_TEMPLATES.find(
    (row) =>
      row.artifactType === "CALCULATION_WORKBOOK" &&
      (row.presentationKind === "DEFINITION" || row.formulas.length > 0) &&
      row.workTypes.includes(plan.workType),
  ) ?? ARTIFACT_TEMPLATES.find((row) => row.code === "EAT-CALC-EXAMPLE-BEARING");
  return definition ? stampEos(definition) : null;
}

function composePresentation(presentation: EngineeringArtifactTemplate, definition: EngineeringArtifactTemplate | null): EngineeringArtifactTemplate {
  if (!definition || presentation.id === definition.id) return presentation;
  return {
    ...presentation,
    formulas: definition.formulas,
    sheetsOrSections: presentation.sheetsOrSections.length ? presentation.sheetsOrSections : definition.sheetsOrSections,
    certification: definition.certification,
    productionEngineeringUse: false,
  };
}

function resolveClass(
  input: ResolveTemplateInput,
  artifactType: ArtifactType,
  sourceClass: Exclude<TemplateSourceClass, "EOS_DEFAULT">,
  fallbackPolicy: TemplateFallbackPolicy,
): TemplateResolution | null {
  const scoped = (input.policies ?? []).filter((policy) => {
    if (policy.sourceClass !== sourceClass) return false;
    if (sourceClass === "PROJECT_CLIENT_APPROVED") return policy.projectId === input.plan.projectId;
    return policy.projectId == null;
  }).filter((policy) => matchesPolicy(policy, input, artifactType));
  if (scoped.length === 0) return null;
  if (scoped.length > 1) {
    return {
      ok: false,
      state: "TEMPLATE_RESOLUTION_CONFLICT",
      template: null,
      calculationDefinition: null,
      sourceClass,
      precedence: TEMPLATE_PRECEDENCE,
      reason: `TEMPLATE_RESOLUTION_CONFLICT: ${scoped.length} equally authoritative ${sourceClass} templates match this artifact type and scope. Generation blocked. No created/modified-date or AI selection.`,
      fallbackUsed: false,
      conflict: true,
      branding: input.branding ?? {},
      policyId: null,
      packagedAssetKey: null,
    };
  }
    const policy = scoped[0]!;
    const packaged = findArtifactTemplate(policy.packagedAssetKey) ?? (policy.binarySourceKind === "SHAREPOINT_MANAGED" ? eosDefaults(artifactType, input.plan) : null);
  if (!packaged) {
    if (fallbackPolicy === "ALLOW_EOS_DEFAULT_IF_OFFICIAL_UNAVAILABLE") {
      const fallback = eosDefaults(artifactType, input.plan, input.requestedCode, input.requestedVersion);
      if (!fallback) {
        return {
          ok: false,
          state: "TEMPLATE_UNAVAILABLE",
          template: null,
          calculationDefinition: null,
          sourceClass,
          precedence: TEMPLATE_PRECEDENCE,
          reason: `CONFIGURED_TEMPLATE_UNAVAILABLE: ${policy.templateCode}@${policy.templateVersion} cannot be loaded and no EOS default exists.`,
          fallbackUsed: false,
          conflict: false,
          branding: policy.branding,
          policyId: policy.id,
          packagedAssetKey: policy.packagedAssetKey,
        };
      }
      return {
        ok: true,
        state: "AVAILABLE",
        template: fallback,
        calculationDefinition: calculationDefinitionFor(input.plan, fallback, policy.packagedAssetKey),
        sourceClass: "EOS_DEFAULT",
        precedence: TEMPLATE_PRECEDENCE,
        reason: `Configured ${sourceClass} template ${policy.templateCode}@${policy.templateVersion} is unavailable. Tenant policy ALLOW_EOS_DEFAULT_IF_OFFICIAL_UNAVAILABLE selected EOS Default ${fallback.code}@${fallback.version}.`,
        fallbackUsed: true,
        conflict: false,
        branding: input.branding ?? {},
        policyId: policy.id,
        packagedAssetKey: policy.packagedAssetKey,
      };
    }
    return {
      ok: false,
      state: "TEMPLATE_UNAVAILABLE",
      template: null,
      calculationDefinition: null,
      sourceClass,
      precedence: TEMPLATE_PRECEDENCE,
      reason: `CONFIGURED_TEMPLATE_UNAVAILABLE: official template ${policy.templateCode}@${policy.templateVersion} (asset ${policy.packagedAssetKey}) cannot be loaded. Tenant policy OFFICIAL_TEMPLATE_REQUIRED fails closed. No silent EOS default.`,
      fallbackUsed: false,
      conflict: false,
      branding: policy.branding,
      policyId: policy.id,
      packagedAssetKey: policy.packagedAssetKey,
    };
  }
  const overlay = overlayPolicy(packaged, policy);
  const definition = calculationDefinitionFor(input.plan, overlay, policy.packagedAssetKey);
  return {
    ok: true,
    state: "AVAILABLE",
    template: composePresentation(overlay, definition),
    calculationDefinition: definition,
    sourceClass,
    precedence: TEMPLATE_PRECEDENCE,
    reason:
      sourceClass === "PROJECT_CLIENT_APPROVED"
        ? `Selected ${policy.templateCode}@${policy.templateVersion}. Reason: company-approved project/client template. Company Official is overridden for this project.`
        : `Selected ${policy.templateCode}@${policy.templateVersion}. Reason: Company Official template. Project-specific template: none configured. Fallback: NO.`,
    fallbackUsed: false,
    conflict: false,
    branding: { ...policy.branding, ...input.branding },
    policyId: policy.id,
    packagedAssetKey: policy.packagedAssetKey,
  };
}

export function resolveEngineeringArtifactTemplate(input: ResolveTemplateInput): TemplateResolution {
  const artifactType =
    input.artifactType ??
    (input.requestedCode ? findArtifactTemplate(input.requestedCode, input.requestedVersion)?.artifactType : undefined);
  if (!artifactType) {
    const expected = input.plan.context.expectedOutputs[0]?.outputType;
    const inferred = expected
      ? ARTIFACT_TEMPLATES.find((row) => row.expectedOutputType === expected) ?? null
      : null;
    if (!inferred) {
      return {
        ok: false,
        state: "NO_TEMPLATE_CONFIGURED",
        template: null,
        calculationDefinition: null,
        sourceClass: null,
        precedence: TEMPLATE_PRECEDENCE,
        reason: "No artifact type or expected output is available to resolve a template.",
        fallbackUsed: false,
        conflict: false,
        branding: input.branding ?? {},
        policyId: null,
        packagedAssetKey: null,
      };
    }
    return resolveEngineeringArtifactTemplate({ ...input, artifactType: inferred.artifactType });
  }

  const fallbackPolicy = input.fallbackPolicy ?? DEFAULT_TEMPLATE_FALLBACK_POLICY;
  const project = resolveClass(input, artifactType, "PROJECT_CLIENT_APPROVED", fallbackPolicy);
  if (project) return project;
  const company = resolveClass(input, artifactType, "COMPANY_OFFICIAL", fallbackPolicy);
  if (company) return company;

  const eos = eosDefaults(artifactType, input.plan, input.requestedCode, input.requestedVersion);
  if (!eos) {
    return {
      ok: false,
      state: "NO_TEMPLATE_CONFIGURED",
      template: null,
      calculationDefinition: null,
      sourceClass: null,
      precedence: TEMPLATE_PRECEDENCE,
      reason: `NO_TEMPLATE_CONFIGURED: no company/project template and no EOS default for ${artifactType}.`,
      fallbackUsed: false,
      conflict: false,
      branding: input.branding ?? {},
      policyId: null,
      packagedAssetKey: null,
    };
  }
  const definition = calculationDefinitionFor(input.plan, eos);
  return {
    ok: true,
    state: "AVAILABLE",
    template: composePresentation(eos, definition),
    calculationDefinition: definition,
    sourceClass: "EOS_DEFAULT",
    precedence: TEMPLATE_PRECEDENCE,
    reason: `Selected ${eos.code}@${eos.version}. Reason: EOS Professional Default. Company Official: none configured. Project-specific template: none configured. Fallback: YES (no official template).`,
    fallbackUsed: true,
    conflict: false,
    branding: input.branding ?? {},
    policyId: null,
    packagedAssetKey: eos.code,
  };
}

export function explainTemplateResolution(resolution: TemplateResolution) {
  return {
    selected: resolution.template ? `${resolution.template.code} ${resolution.template.version}` : null,
    sourceClass: resolution.sourceClass,
    reason: resolution.reason,
    fallbackUsed: resolution.fallbackUsed,
    conflict: resolution.conflict,
    state: resolution.state,
  };
}
