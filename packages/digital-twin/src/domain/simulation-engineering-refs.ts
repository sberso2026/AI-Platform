/**
 * Phase 12H — Engineering property / boundary / load / discretization references.
 *
 * References only — no mesh generation or load generation engines.
 */

export type MaterialPropertyReference = {
  materialPropertyRefId: string;
  externalRef: string;
  label?: string;
  sourceSystem?: string;
  generatesMesh: false;
  storesPropertyPayload: false;
};

export type SectionPropertyReference = {
  sectionPropertyRefId: string;
  externalRef: string;
  label?: string;
  sourceSystem?: string;
  generatesMesh: false;
  storesPropertyPayload: false;
};

export type EngineeringPropertySetReference = {
  propertySetRefId: string;
  externalRef: string;
  materialRefs: string[];
  sectionRefs: string[];
  label?: string;
  storesPropertyPayload: false;
};

export type SimulationBoundaryConditionReference = {
  boundaryConditionRefId: string;
  externalRef: string;
  label?: string;
  generatesLoadCase: false;
  storesBoundaryPayload: false;
};

export type SimulationLoadCaseReference = {
  loadCaseRefId: string;
  externalRef: string;
  label?: string;
  generatesLoadCase: false;
  storesLoadPayload: false;
};

export type SimulationDiscretizationReference = {
  discretizationRefId: string;
  externalRef: string;
  label?: string;
  /** No mesh generation engine in Twin. */
  generatesMesh: false;
  storesMeshPayload: false;
};

export type SimulationExecutionEnvironmentMetadata = {
  environmentId: string;
  runtimeLabel: string;
  osFamily?: string;
  nodeVersion?: string;
  packageVersions?: Record<string, string>;
  locale?: string;
  timezone?: string;
  /** Explicit — never include secrets / credentials / tokens. */
  containsSecrets: false;
  recordedAt: string;
};

export function createMaterialPropertyReference(input: {
  materialPropertyRefId: string;
  externalRef: string;
  label?: string;
  sourceSystem?: string;
}): MaterialPropertyReference {
  return {
    materialPropertyRefId: input.materialPropertyRefId,
    externalRef: input.externalRef,
    label: input.label,
    sourceSystem: input.sourceSystem,
    generatesMesh: false,
    storesPropertyPayload: false,
  };
}

export function createSectionPropertyReference(input: {
  sectionPropertyRefId: string;
  externalRef: string;
  label?: string;
  sourceSystem?: string;
}): SectionPropertyReference {
  return {
    sectionPropertyRefId: input.sectionPropertyRefId,
    externalRef: input.externalRef,
    label: input.label,
    sourceSystem: input.sourceSystem,
    generatesMesh: false,
    storesPropertyPayload: false,
  };
}

export function createEngineeringPropertySetReference(input: {
  propertySetRefId: string;
  externalRef: string;
  materialRefs?: string[];
  sectionRefs?: string[];
  label?: string;
}): EngineeringPropertySetReference {
  return {
    propertySetRefId: input.propertySetRefId,
    externalRef: input.externalRef,
    materialRefs: input.materialRefs ?? [],
    sectionRefs: input.sectionRefs ?? [],
    label: input.label,
    storesPropertyPayload: false,
  };
}

export function createSimulationBoundaryConditionReference(input: {
  boundaryConditionRefId: string;
  externalRef: string;
  label?: string;
}): SimulationBoundaryConditionReference {
  return {
    boundaryConditionRefId: input.boundaryConditionRefId,
    externalRef: input.externalRef,
    label: input.label,
    generatesLoadCase: false,
    storesBoundaryPayload: false,
  };
}

export function createSimulationLoadCaseReference(input: {
  loadCaseRefId: string;
  externalRef: string;
  label?: string;
}): SimulationLoadCaseReference {
  return {
    loadCaseRefId: input.loadCaseRefId,
    externalRef: input.externalRef,
    label: input.label,
    generatesLoadCase: false,
    storesLoadPayload: false,
  };
}

export function createSimulationDiscretizationReference(input: {
  discretizationRefId: string;
  externalRef: string;
  label?: string;
}): SimulationDiscretizationReference {
  return {
    discretizationRefId: input.discretizationRefId,
    externalRef: input.externalRef,
    label: input.label,
    generatesMesh: false,
    storesMeshPayload: false,
  };
}

export function createSimulationExecutionEnvironmentMetadata(input: {
  environmentId: string;
  runtimeLabel: string;
  osFamily?: string;
  nodeVersion?: string;
  packageVersions?: Record<string, string>;
  locale?: string;
  timezone?: string;
}): SimulationExecutionEnvironmentMetadata {
  const forbiddenKeys = ["password", "secret", "token", "apiKey", "api_key", "credential"];
  const versions = input.packageVersions ?? {};
  for (const key of Object.keys(versions)) {
    if (forbiddenKeys.some((f) => key.toLowerCase().includes(f))) {
      throw new Error("execution_environment_must_not_contain_secrets");
    }
  }
  return {
    environmentId: input.environmentId,
    runtimeLabel: input.runtimeLabel,
    osFamily: input.osFamily,
    nodeVersion: input.nodeVersion,
    packageVersions: versions,
    locale: input.locale,
    timezone: input.timezone,
    containsSecrets: false,
    recordedAt: new Date().toISOString(),
  };
}
