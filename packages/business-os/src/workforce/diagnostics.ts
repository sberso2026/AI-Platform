import type { WorkforceCatalogEntry } from "./catalog";
import type { WorkforceApproval, WorkforceInstallation, WorkforceRun, WorkforceSettings } from "./ports";

export type WorkforceFinding = {
  code:
    | "agent_registry_mismatch"
    | "orphaned_installation"
    | "invalid_authority"
    | "permission_tool_mismatch"
    | "forbidden_tool"
    | "stale_context"
    | "suppressed_context_leakage"
    | "cross_tenant_workspace_attempt"
    | "unbounded_handoff"
    | "budget_breach"
    | "missing_provenance"
    | "unresolved_context"
    | "policy_rejection";
  severity: "info" | "watch" | "warning" | "critical";
  message: string;
  repaired: false;
};

export function diagnoseWorkforce(input: {
  catalog: readonly WorkforceCatalogEntry[];
  installations: WorkforceInstallation[];
  runs: WorkforceRun[];
  approvals: WorkforceApproval[];
  settings: WorkforceSettings;
  registry: Array<{ slug: string; id: string; isActive: boolean }>;
  graphFindings: Array<{ code: string; repaired: false }>;
}): { findings: WorkforceFinding[]; repaired: false } {
  const findings: WorkforceFinding[] = [];
  const catalogSlugs = new Set(input.catalog.map((row) => row.slug));
  const registryBySlug = new Map(input.registry.map((row) => [row.slug, row]));

  for (const installation of input.installations) {
    if (!catalogSlugs.has(installation.catalogSlug)) {
      findings.push({
        code: "orphaned_installation",
        severity: "critical",
        message: `Installation ${installation.id} is not in the governed catalog`,
        repaired: false,
      });
    }
    const registered = registryBySlug.get(installation.catalogSlug);
    if (!registered || (installation.kernelAgentId && registered.id !== installation.kernelAgentId)) {
      findings.push({
        code: "agent_registry_mismatch",
        severity: "warning",
        message: `Kernel registry mismatch for ${installation.catalogSlug}`,
        repaired: false,
      });
    }
    const definition = input.catalog.find((row) => row.slug === installation.catalogSlug);
    if (definition && installation.authority !== definition.authority) {
      const rank = ["observe", "recommend", "prepare", "request_execution", "execute_with_approval"];
      if (rank.indexOf(installation.authority) > rank.indexOf(definition.authority)) {
        findings.push({
          code: "invalid_authority",
          severity: "critical",
          message: `Authority escalation on ${installation.catalogSlug}`,
          repaired: false,
        });
      }
    }
    if (installation.toolAllowlist.some((tool) => tool.startsWith("direct.") || tool.includes("canonical.write"))) {
      findings.push({
        code: "forbidden_tool",
        severity: "critical",
        message: `Forbidden tool on ${installation.catalogSlug}`,
        repaired: false,
      });
    }
    if (installation.toolAllowlist.some((tool) => !installation.permissions.length)) {
      findings.push({
        code: "permission_tool_mismatch",
        severity: "warning",
        message: `Tool allowlist without permissions on ${installation.catalogSlug}`,
        repaired: false,
      });
    }
  }

  for (const run of input.runs) {
    if (run.budgetUsed.handoffs > input.settings.maxHandoffs) {
      findings.push({
        code: "unbounded_handoff",
        severity: "critical",
        message: `Run ${run.id} exceeded handoff limit`,
        repaired: false,
      });
    }
    if (run.budgetUsed.toolCalls > input.settings.maxToolCalls || run.budgetUsed.tokens > input.settings.maxTokens) {
      findings.push({
        code: "budget_breach",
        severity: "warning",
        message: `Run ${run.id} exceeded budget`,
        repaired: false,
      });
    }
    if (run.failureCode === "policy_rejected") {
      findings.push({
        code: "policy_rejection",
        severity: "info",
        message: `Run ${run.id} was rejected by policy`,
        repaired: false,
      });
    }
    if (run.failureCode === "cross_tenant_agent_forbidden") {
      findings.push({
        code: "cross_tenant_workspace_attempt",
        severity: "critical",
        message: `Run ${run.id} attempted cross-tenant access`,
        repaired: false,
      });
    }
    if (run.explanation.missingEvidence.length > 0 && run.state === "blocked") {
      findings.push({
        code: run.blockedReason === "stale_context" ? "stale_context" : "unresolved_context",
        severity: "warning",
        message: `Run ${run.id} blocked on context quality`,
        repaired: false,
      });
    }
    if (run.contextRefs.length === 0 && run.state === "completed") {
      findings.push({
        code: "missing_provenance",
        severity: "warning",
        message: `Completed run ${run.id} is missing context provenance`,
        repaired: false,
      });
    }
  }

  if (input.graphFindings.some((row) => row.code === "suppressed_context_leakage")) {
    findings.push({
      code: "suppressed_context_leakage",
      severity: "critical",
      message: "Suppressed contact content leaked into graph context",
      repaired: false,
    });
  }

  return { findings, repaired: false };
}
