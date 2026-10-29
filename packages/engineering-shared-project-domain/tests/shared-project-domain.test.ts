import { describe, expect, it } from "vitest";
import {
  assertConsumerMayNotMutateIdentity,
  assertReferenceIsReadOnly,
  assertSharedProjectDomainOwnershipLock,
  CANONICAL_ASSET_IDENTITY_OWNERSHIP,
  CANONICAL_PROJECT_HIERARCHY_OWNERSHIP,
  CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
  CANONICAL_PROJECT_IDENTITY_PHYSICAL_STORE,
  createInMemorySharedProjectDomainPort,
  createProjectReferenceFixture,
  createSharedProjectDomainPort,
  CPM_IN_SHARED_DOMAIN,
  DUPLICATE_PROJECT_OWNERSHIP_DETECTED,
  EARNED_VALUE_IN_SHARED_DOMAIN,
  ENGINEERING_SHARED_PROJECT_DOMAIN_KEY,
  ENGINEERING_SHARED_PROJECT_DOMAIN_PHASE,
  ENGINEERING_SHARED_PROJECT_DOMAIN_VERSION,
  getSharedProjectDomainDeclaration,
  isProjectScopeResolvable,
  PROGRESS_MEASUREMENT_IN_SHARED_DOMAIN,
  PROJECT_CONTROLS_MAY_OWN_PROJECT_IDENTITY,
  PROJECT_IDENTITY_MUTATION_BY_CONSUMERS_ALLOWED,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  requireProjectReference,
  resolveProjectReference,
  SHARED_PROJECT_DOMAIN_READY,
  SHARED_PROJECT_DOMAIN_REFERENCE_KINDS,
  SHARED_PROJECT_DOMAIN_REFERENCE_TABLES,
  type MilestoneReference,
  type PhaseReference,
  type WbsReference,
} from "../src/index";

const TENANT = "11111111-1111-1111-1111-111111111111";
const WORKSPACE = "22222222-2222-2222-2222-222222222222";
const PROJECT = "33333333-3333-3333-3333-333333333333";

function seededPort() {
  const project = createProjectReferenceFixture({
    tenantId: TENANT,
    workspaceId: WORKSPACE,
    projectId: PROJECT,
    projectCode: "PRJ-001",
    projectName: "Berth 7 Upgrade",
  });
  const phase: PhaseReference = {
    kind: "phase",
    owner: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
    mutable: false,
    tenantId: TENANT,
    workspaceId: WORKSPACE,
    phaseId: "phase-1",
    projectId: PROJECT,
    code: "PH-CONSTRUCTION",
    name: "Construction",
    status: "active",
    sequence: 3,
    resolvedAt: "2026-08-08T00:00:00.000Z",
  };
  const wbs: WbsReference = {
    kind: "wbs_node",
    owner: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
    mutable: false,
    tenantId: TENANT,
    workspaceId: WORKSPACE,
    wbsNodeId: "wbs-1",
    projectId: PROJECT,
    code: "1.2",
    name: "Deck slab",
    status: "active",
    level: 2,
    resolvedAt: "2026-08-08T00:00:00.000Z",
  };
  const milestone: MilestoneReference = {
    kind: "milestone",
    owner: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
    mutable: false,
    tenantId: TENANT,
    workspaceId: WORKSPACE,
    milestoneId: "ms-1",
    projectId: PROJECT,
    code: "MS-DECK",
    name: "Deck complete",
    status: "open",
    targetDate: "2026-10-01",
    resolvedAt: "2026-08-08T00:00:00.000Z",
  };
  return createInMemorySharedProjectDomainPort({
    projects: [project],
    phases: [phase],
    wbsNodes: [wbs],
    milestones: [milestone],
  });
}

describe("Engineering Shared Project Domain identity layer", () => {
  it("declares the shared project domain identity", () => {
    expect(ENGINEERING_SHARED_PROJECT_DOMAIN_KEY).toBe("engineering_os_shared_project_domain");
    expect(ENGINEERING_SHARED_PROJECT_DOMAIN_VERSION).toBe("0.1.0-shared-project-domain");
    expect(ENGINEERING_SHARED_PROJECT_DOMAIN_PHASE).toBe("11B");
    expect(SHARED_PROJECT_DOMAIN_READY).toBe(true);
    expect(CANONICAL_PROJECT_IDENTITY_PHYSICAL_STORE).toBe("engineering_projects");
    expect(SHARED_PROJECT_DOMAIN_REFERENCE_TABLES).toContain("engineering_projects");
    expect(SHARED_PROJECT_DOMAIN_REFERENCE_TABLES).toContain("engineering_wbs_nodes");
    expect(SHARED_PROJECT_DOMAIN_REFERENCE_KINDS.length).toBe(10);
  });

  it("owns canonical project identity and hierarchy", () => {
    const lock = assertSharedProjectDomainOwnershipLock();
    expect(lock.ok).toBe(true);
    expect(lock.canonicalProjectIdentityOwnership).toBe("engineering_os_shared_project_domain");
    expect(CANONICAL_PROJECT_IDENTITY_OWNERSHIP).toBe("engineering_os_shared_project_domain");
    expect(CANONICAL_PROJECT_HIERARCHY_OWNERSHIP).toBe("engineering_os_shared_project_domain");
    expect(CANONICAL_ASSET_IDENTITY_OWNERSHIP).toBe("engineering_os_shared_domain");
    expect(DUPLICATE_PROJECT_OWNERSHIP_DETECTED).toBe(false);
    expect(PROJECT_CONTROLS_MAY_OWN_PROJECT_IDENTITY).toBe(false);
    expect(PROJECT_IDENTITY_MUTATION_BY_CONSUMERS_ALLOWED).toBe(false);
  });

  it("holds no intelligence in the identity layer", () => {
    expect(PROGRESS_MEASUREMENT_IN_SHARED_DOMAIN).toBe(false);
    expect(EARNED_VALUE_IN_SHARED_DOMAIN).toBe(false);
    expect(CPM_IN_SHARED_DOMAIN).toBe(false);
  });

  it("resolves a project reference marked read-only and owner-stamped", async () => {
    const port = seededPort();
    const reference = await resolveProjectReference(port, {
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
    });
    expect(reference).not.toBeNull();
    expect(reference?.projectCode).toBe("PRJ-001");
    expect(reference?.owner).toBe("engineering_os_shared_project_domain");
    expect(reference?.mutable).toBe(false);
    expect(port.identityMutationAllowed).toBe(false);
    expect(() => assertReferenceIsReadOnly(reference!)).not.toThrow();
  });

  it("resolves phase, wbs and milestone scopes", async () => {
    const port = seededPort();
    const phase = await port.resolveScope({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "phase", projectId: PROJECT, referenceId: "phase-1" },
    });
    expect(phase?.kind).toBe("phase");
    const wbs = await port.resolveScope({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "wbs_node", projectId: PROJECT, referenceId: "wbs-1" },
    });
    expect(wbs?.kind).toBe("wbs_node");
    const milestone = await port.resolveScope({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "milestone", projectId: PROJECT, referenceId: "ms-1" },
    });
    expect(milestone?.kind).toBe("milestone");
    const missing = await port.resolveScope({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "activity", projectId: PROJECT, referenceId: "act-unknown" },
    });
    expect(missing).toBeNull();
  });

  it("fails closed when identity is unknown", async () => {
    const port = seededPort();
    await expect(
      requireProjectReference(port, {
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: "44444444-4444-4444-4444-444444444444",
      }),
    ).rejects.toThrow(/project_reference_not_found/);
  });

  it("isolates tenants", async () => {
    const port = seededPort();
    const reference = await port.resolveProjectReference({
      tenantId: "99999999-9999-9999-9999-999999999999",
      workspaceId: WORKSPACE,
      projectId: PROJECT,
    });
    expect(reference).toBeNull();
  });

  it("requires a reference id for non-project scopes", () => {
    expect(isProjectScopeResolvable({ kind: "project", projectId: PROJECT })).toBe(true);
    expect(isProjectScopeResolvable({ kind: "wbs_node", projectId: PROJECT })).toBe(false);
    expect(
      isProjectScopeResolvable({ kind: "wbs_node", projectId: PROJECT, referenceId: "wbs-1" }),
    ).toBe(true);
  });

  it("forbids the memory adapter in production", () => {
    expect(PRODUCTION_MEMORY_REPOSITORY_ALLOWED).toBe(false);
    expect(() =>
      createSharedProjectDomainPort({ adapter: "memory", nodeEnv: "production" }),
    ).toThrow(/production_memory_repository_forbidden/);
    expect(() =>
      createSharedProjectDomainPort({ adapter: "postgres", nodeEnv: "production" }),
    ).toThrow(/postgres_shared_project_domain_port_requires_supabase_client/);
  });

  it("never lets a consumer mutate identity", () => {
    expect(() => assertConsumerMayNotMutateIdentity("project_controls")).not.toThrow();
    const declaration = getSharedProjectDomainDeclaration();
    expect(declaration.projectIdentityMutationByConsumersAllowed).toBe(false);
    expect(declaration.sanctionedConsumers).toContain("project_controls");
    expect(declaration.hierarchy).toContain("Engineering Shared Project Domain");
  });
});
