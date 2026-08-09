/**
 * Phase 14B — EngineeringContext (coordination only; not a domain registry).
 */

export interface EngineeringContext {
  tenantRef: string;
  workspaceRef: string;
  projectRef?: string;
  assetRef?: string;
  spatialRef?: string;
  twinRef?: string;
  modelRef?: string;
  userRef: string;
  permissions: string[];
  activeModule?: string;
  activeObject?: { type: string; id: string };
  correlationId: string;
}

export type EngineeringContextInput = Omit<EngineeringContext, "correlationId"> & {
  correlationId?: string;
};

export function createEngineeringContext(
  input: EngineeringContextInput,
): EngineeringContext {
  if (!input.tenantRef || !input.workspaceRef || !input.userRef) {
    throw new Error(
      "EngineeringContext requires tenantRef, workspaceRef, and userRef",
    );
  }
  return {
    tenantRef: input.tenantRef,
    workspaceRef: input.workspaceRef,
    projectRef: input.projectRef,
    assetRef: input.assetRef,
    spatialRef: input.spatialRef,
    twinRef: input.twinRef,
    modelRef: input.modelRef,
    userRef: input.userRef,
    permissions: [...input.permissions],
    activeModule: input.activeModule,
    activeObject: input.activeObject
      ? { ...input.activeObject }
      : undefined,
    correlationId: input.correlationId ?? cryptoRandomId(),
  };
}

export function withActiveModule(
  ctx: EngineeringContext,
  moduleKey: string,
): EngineeringContext {
  return { ...ctx, activeModule: moduleKey };
}

export function assertNotDomainRegistry(ctx: EngineeringContext): void {
  // Context holds refs only — never mutate canonical registries here.
  void ctx;
}

function cryptoRandomId(): string {
  return `engctx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
