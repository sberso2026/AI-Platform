/**
 * Internal adversarial attack evaluators and regression suite runner.
 * Results are INTERNAL only — never an external pen-test opinion.
 */
import {
  assertNoCrossTenantLeak,
  buildControlledEntraFixture,
  completeFederatedLogin,
  createEmptyStore,
  passwordFallbackAllowed,
} from "../engine";
import { validateRedirectUri } from "../oidc/validate";
import {
  authorizeResourceAccess,
  buildTenantAbAdversarialFixtures,
  type AdversarialPrincipal,
} from "./fixtures";
import {
  listOpenCriticalHigh,
  summarizeInternalFindings,
  type InternalSecurityFinding,
} from "./findings";

export type AdversarialCaseResult = {
  id: string;
  category: string;
  passed: boolean;
  detail: string;
};

export function evaluateAiContextAccess(input: {
  principalTenantId: string;
  contextTenantId: string;
  allowUntrustedDocumentInstructions?: boolean;
  toolAuthorized?: boolean;
  classificationAllowsProvider?: boolean;
}): { allowed: boolean; reason: string } {
  if (input.principalTenantId !== input.contextTenantId) {
    return { allowed: false, reason: "cross_tenant_ai_context_denied" };
  }
  if (input.allowUntrustedDocumentInstructions) {
    return { allowed: false, reason: "untrusted_document_instructions_denied" };
  }
  if (input.toolAuthorized === false) {
    return { allowed: false, reason: "tool_not_authorized" };
  }
  if (input.classificationAllowsProvider === false) {
    return { allowed: false, reason: "classification_blocks_provider" };
  }
  return { allowed: true, reason: "ai_context_permitted" };
}

export function evaluateExecutionHostAccess(input: {
  principalTenantId: string;
  jobTenantId: string;
  workspaceId: string;
  jobWorkspaceId: string;
  commandInjectionAttempt?: boolean;
  pathTraversalAttempt?: boolean;
  unapprovedSolver?: boolean;
  silentFallbackRequested?: boolean;
}): { allowed: boolean; reason: string } {
  if (input.principalTenantId !== input.jobTenantId) {
    return { allowed: false, reason: "cross_tenant_execution_denied" };
  }
  if (input.workspaceId !== input.jobWorkspaceId) {
    return { allowed: false, reason: "cross_workspace_execution_denied" };
  }
  if (input.commandInjectionAttempt) {
    return { allowed: false, reason: "command_injection_denied" };
  }
  if (input.pathTraversalAttempt) {
    return { allowed: false, reason: "path_traversal_denied" };
  }
  if (input.unapprovedSolver) {
    return { allowed: false, reason: "unapproved_solver_denied" };
  }
  if (input.silentFallbackRequested) {
    return { allowed: false, reason: "silent_solver_fallback_denied" };
  }
  return { allowed: true, reason: "execution_permitted" };
}

export function sanitizeArtifactPath(path: string): {
  ok: boolean;
  reason?: string;
} {
  if (path.includes("..") || path.includes("\\") || path.startsWith("/")) {
    return { ok: false, reason: "path_traversal_rejected" };
  }
  if (/[\0\r\n]/.test(path)) {
    return { ok: false, reason: "malformed_path_rejected" };
  }
  return { ok: true };
}

export function evaluateAssuranceDisclosure(input: {
  role: AdversarialPrincipal["role"];
  requestInternalFindings: boolean;
  attemptAutomaticApproval: boolean;
  claimWithoutEvidence: boolean;
}): { allowed: boolean; reason: string } {
  if (input.requestInternalFindings && input.role !== "owner" && input.role !== "manager") {
    return { allowed: false, reason: "internal_findings_restricted" };
  }
  if (input.attemptAutomaticApproval) {
    return { allowed: false, reason: "automatic_approval_forbidden" };
  }
  if (input.claimWithoutEvidence) {
    return { allowed: false, reason: "positive_claim_requires_evidence" };
  }
  return { allowed: true, reason: "disclosure_permitted" };
}

function expectDenied(allowed: boolean, id: string, category: string, detail: string): AdversarialCaseResult {
  return { id, category, passed: !allowed, detail: allowed ? `UNEXPECTED_ALLOW: ${detail}` : detail };
}

export function runTenantCrossTenantMatrix(): AdversarialCaseResult[] {
  const fx = buildTenantAbAdversarialFixtures();
  const attacker = fx.principals.find((p) => p.principalId === "a-engineer")!;
  const results: AdversarialCaseResult[] = [];
  for (const resource of fx.resources.filter((r) => r.tenantId === fx.tenantB.tenantId)) {
    const auth = authorizeResourceAccess(attacker, resource);
    results.push(
      expectDenied(
        auth.allowed,
        `tenant.cross.${resource.surface}`,
        "tenant_isolation",
        auth.reason,
      ),
    );
  }
  const anon = fx.principals.find((p) => p.principalId === "anon")!;
  const aResource = fx.resources.find((r) => r.tenantId === fx.tenantA.tenantId)!;
  results.push(
    expectDenied(
      authorizeResourceAccess(anon, aResource).allowed,
      "tenant.unauthenticated",
      "authentication",
      "unauthenticated_denied",
    ),
  );
  return results;
}

export function runPrivilegeNegativeMatrix(): AdversarialCaseResult[] {
  const fx = buildTenantAbAdversarialFixtures();
  const viewer = fx.principals.find((p) => p.principalId === "a-viewer")!;
  const assurance = fx.resources.find(
    (r) => r.tenantId === fx.tenantA.tenantId && r.surface === "security_assurance",
  )!;
  const exec = fx.resources.find(
    (r) => r.tenantId === fx.tenantA.tenantId && r.surface === "execution_host",
  )!;
  const disabled = fx.principals.find((p) => p.principalId === "a-disabled")!;
  const project = fx.resources.find(
    (r) => r.tenantId === fx.tenantA.tenantId && r.surface === "projects",
  )!;
  return [
    expectDenied(
      authorizeResourceAccess(viewer, assurance).allowed,
      "priv.viewer_assurance",
      "authorization",
      "viewer_assurance_denied",
    ),
    expectDenied(
      authorizeResourceAccess(viewer, exec).allowed,
      "priv.viewer_execution",
      "authorization",
      "viewer_execution_denied",
    ),
    expectDenied(
      authorizeResourceAccess(disabled, project).allowed,
      "priv.disabled_user",
      "authorization",
      "disabled_denied",
    ),
  ];
}

export function runSsoNegativeCases(): AdversarialCaseResult[] {
  const fx = buildControlledEntraFixture(createEmptyStore());
  const results: AdversarialCaseResult[] = [];

  const badIssuer = completeFederatedLogin(fx.store, {
    providerId: fx.providerId,
    idToken: fx.idToken,
    state: fx.state,
    expectedState: "wrong-state",
    expectedNonce: fx.nonce,
    authCode: "code-bad-state",
    redirectUri: "https://app.example/auth/callback",
    redirectAllowList: ["https://app.example/auth/callback"],
  });
  results.push(
    expectDenied(
      badIssuer.success,
      "sso.state_mismatch",
      "authentication",
      badIssuer.denialReason ?? "state_denied",
    ),
  );

  const policy = fx.store.policies.get(fx.tenantId)!;
  results.push(
    expectDenied(
      passwordFallbackAllowed(policy),
      "sso.password_fallback_denied",
      "authentication",
      "password_fallback_prohibited",
    ),
  );

  results.push({
    id: "sso.redirect_abuse",
    category: "authentication",
    passed: !validateRedirectUri(
      "https://evil.example/callback",
      ["https://app.example/auth/callback"],
    ),
    detail: "evil_redirect_rejected",
  });

  results.push({
    id: "sso.cross_tenant_binding",
    category: "tenant_isolation",
    passed: assertNoCrossTenantLeak(fx.store, fx.providerId, "victim-tenant"),
    detail: "no_cross_tenant_binding_leak",
  });

  return results;
}

export function runAiNegativeCases(): AdversarialCaseResult[] {
  return [
    expectDenied(
      evaluateAiContextAccess({
        principalTenantId: "tenant-a",
        contextTenantId: "tenant-b",
      }).allowed,
      "ai.cross_tenant_context",
      "ai_security",
      "cross_tenant_context_denied",
    ),
    expectDenied(
      evaluateAiContextAccess({
        principalTenantId: "tenant-a",
        contextTenantId: "tenant-a",
        allowUntrustedDocumentInstructions: true,
      }).allowed,
      "ai.untrusted_doc_instructions",
      "ai_security",
      "untrusted_instructions_denied",
    ),
    expectDenied(
      evaluateAiContextAccess({
        principalTenantId: "tenant-a",
        contextTenantId: "tenant-a",
        toolAuthorized: false,
      }).allowed,
      "ai.tool_unauthorized",
      "ai_security",
      "tool_denied",
    ),
    expectDenied(
      evaluateAiContextAccess({
        principalTenantId: "tenant-a",
        contextTenantId: "tenant-a",
        classificationAllowsProvider: false,
      }).allowed,
      "ai.classification_provider",
      "ai_security",
      "classification_denied",
    ),
  ];
}

export function runExecutionHostNegativeCases(): AdversarialCaseResult[] {
  return [
    expectDenied(
      evaluateExecutionHostAccess({
        principalTenantId: "tenant-a",
        jobTenantId: "tenant-b",
        workspaceId: "ws-a",
        jobWorkspaceId: "ws-b",
      }).allowed,
      "execution.cross_tenant",
      "execution_host",
      "cross_tenant_denied",
    ),
    expectDenied(
      evaluateExecutionHostAccess({
        principalTenantId: "tenant-a",
        jobTenantId: "tenant-a",
        workspaceId: "ws-a",
        jobWorkspaceId: "ws-a",
        commandInjectionAttempt: true,
      }).allowed,
      "execution.command_injection",
      "execution_host",
      "injection_denied",
    ),
    expectDenied(
      evaluateExecutionHostAccess({
        principalTenantId: "tenant-a",
        jobTenantId: "tenant-a",
        workspaceId: "ws-a",
        jobWorkspaceId: "ws-a",
        unapprovedSolver: true,
      }).allowed,
      "execution.unapproved_solver",
      "execution_host",
      "unapproved_solver_denied",
    ),
    expectDenied(
      evaluateExecutionHostAccess({
        principalTenantId: "tenant-a",
        jobTenantId: "tenant-a",
        workspaceId: "ws-a",
        jobWorkspaceId: "ws-a",
        silentFallbackRequested: true,
      }).allowed,
      "execution.silent_fallback",
      "execution_host",
      "silent_fallback_denied",
    ),
  ];
}

export function runFileNegativeCases(): AdversarialCaseResult[] {
  const fx = buildTenantAbAdversarialFixtures();
  const attacker = fx.principals.find((p) => p.principalId === "a-engineer")!;
  const foreignFile = fx.resources.find(
    (r) => r.tenantId === fx.tenantB.tenantId && r.surface === "files",
  )!;
  return [
    expectDenied(
      authorizeResourceAccess(attacker, foreignFile).allowed,
      "files.cross_tenant_idor",
      "files",
      "cross_tenant_file_denied",
    ),
    {
      id: "files.path_traversal",
      category: "files",
      passed: !sanitizeArtifactPath("../etc/passwd").ok,
      detail: "path_traversal_rejected",
    },
    {
      id: "files.absolute_path",
      category: "files",
      passed: !sanitizeArtifactPath("/var/secrets").ok,
      detail: "absolute_path_rejected",
    },
  ];
}

export function runAssuranceNegativeCases(): AdversarialCaseResult[] {
  return [
    expectDenied(
      evaluateAssuranceDisclosure({
        role: "viewer",
        requestInternalFindings: true,
        attemptAutomaticApproval: false,
        claimWithoutEvidence: false,
      }).allowed,
      "assurance.disclosure_negatives",
      "security_assurance",
      "viewer_internal_denied",
    ),
    expectDenied(
      evaluateAssuranceDisclosure({
        role: "owner",
        requestInternalFindings: false,
        attemptAutomaticApproval: true,
        claimWithoutEvidence: false,
      }).allowed,
      "assurance.auto_approval",
      "security_assurance",
      "auto_approval_denied",
    ),
    expectDenied(
      evaluateAssuranceDisclosure({
        role: "owner",
        requestInternalFindings: false,
        attemptAutomaticApproval: false,
        claimWithoutEvidence: true,
      }).allowed,
      "assurance.stale_claim",
      "security_assurance",
      "claim_without_evidence_denied",
    ),
  ];
}

export function runInternalAdversarialSuite(): {
  cases: AdversarialCaseResult[];
  failed: AdversarialCaseResult[];
  openCriticalHigh: InternalSecurityFinding[];
  summary: ReturnType<typeof summarizeInternalFindings>;
  passed: boolean;
  substitutesForExternalPenTest: false;
} {
  const cases = [
    ...runTenantCrossTenantMatrix(),
    ...runPrivilegeNegativeMatrix(),
    ...runSsoNegativeCases(),
    ...runAiNegativeCases(),
    ...runExecutionHostNegativeCases(),
    ...runFileNegativeCases(),
    ...runAssuranceNegativeCases(),
  ];
  const failed = cases.filter((c) => !c.passed);
  const openCriticalHigh = listOpenCriticalHigh();
  const summary = summarizeInternalFindings();
  return {
    cases,
    failed,
    openCriticalHigh,
    summary,
    passed: failed.length === 0 && openCriticalHigh.length === 0,
    substitutesForExternalPenTest: false,
  };
}

/** Convenience type export for matrix docs. */
export type { AdversarialResource };
