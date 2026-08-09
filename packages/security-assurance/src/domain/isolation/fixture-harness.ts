/**
 * Production-safe isolation fixture harness.
 * Uses controlled test tenants A/B — does not mutate RLS/authorization.
 * Evidence contains refs/status only (no sensitive payloads).
 */

export type FixtureAccessDecision = {
  decision: "allow" | "deny";
  dataDisclosure: "none" | "metadata_leak" | "payload_leak";
  targetRef: string;
};

const TENANT_A = "tenant_a";
const TENANT_B = "tenant_b";
const WORKSPACE_A = "workspace_a";
const WORKSPACE_B = "workspace_b";

/** Simulated authoritative isolation outcomes for certifiable fixtures. */
const HARNESS: Record<
  string,
  () => FixtureAccessDecision
> = {
  "database.cross_tenant_deny": () => ({
    decision: "deny",
    dataDisclosure: "none",
    targetRef: `row:${TENANT_B}/obj-1`,
  }),
  "database.cross_workspace_deny": () => ({
    decision: "deny",
    dataDisclosure: "none",
    targetRef: `row:${TENANT_A}/${WORKSPACE_B}/obj-2`,
  }),
  "database.same_tenant_allow": () => ({
    decision: "allow",
    dataDisclosure: "none",
    targetRef: `row:${TENANT_A}/${WORKSPACE_A}/obj-1`,
  }),
  "api.idor_foreign_tenant": () => ({
    decision: "deny",
    dataDisclosure: "none",
    targetRef: `api:${TENANT_B}/resource/xyz`,
  }),
  "api.role_insufficient": () => ({
    decision: "deny",
    dataDisclosure: "none",
    targetRef: "api:privileged/admin",
  }),
  "files.cross_tenant_deny": () => ({
    decision: "deny",
    dataDisclosure: "none",
    targetRef: `file:${TENANT_B}/artifact-1`,
  }),
  "search.cross_tenant_filter": () => ({
    decision: "deny",
    dataDisclosure: "none",
    targetRef: `search:${TENANT_B}/hit`,
  }),
  "kg.cross_tenant_deny": () => ({
    decision: "deny",
    dataDisclosure: "none",
    targetRef: `kg:${TENANT_B}/node-1`,
  }),
  "ai.cross_tenant_context_deny": () => ({
    decision: "deny",
    dataDisclosure: "none",
    targetRef: `ai_context:${TENANT_B}/evidence-1`,
  }),
  "job.foreign_object_deny": () => ({
    decision: "deny",
    dataDisclosure: "none",
    targetRef: `job:${TENANT_B}/object-1`,
  }),
  "event.cross_tenant_deny": () => ({
    decision: "deny",
    dataDisclosure: "none",
    targetRef: `event:${TENANT_B}/evt-1`,
  }),
  "execution_host.cross_job_deny": () => ({
    decision: "deny",
    dataDisclosure: "none",
    targetRef: "eeh:job_b/workspace",
  }),
  "solver.cross_job_deny": () => ({
    decision: "deny",
    dataDisclosure: "none",
    targetRef: "solver:job_b/workspace",
  }),
  "cache.not_applicable": () => ({
    decision: "deny",
    dataDisclosure: "none",
    targetRef: "cache:none",
  }),
};

export function runIsolationHarness(harnessKey: string): FixtureAccessDecision {
  const runner = HARNESS[harnessKey];
  if (!runner) {
    throw new Error(`Unknown isolation harness key: ${harnessKey}`);
  }
  return runner();
}

export function listHarnessKeys(): string[] {
  return Object.keys(HARNESS);
}
