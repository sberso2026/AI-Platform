/** EOS 3.3 retrieval security: authorization, isolation, instruction isolation, exfiltration guards. */

export type RetrievalCaller = {
  authenticated: boolean;
  tenantId: string | null;
  workspaceId: string | null;
  role: "human" | "ai";
  eos3Entitled: boolean;
  eos3Enrolled: boolean;
  productionEnvironment?: boolean;
};

export type RetrievalAuthzDecision =
  | { allowed: true }
  | {
      allowed: false;
      reason:
        | "unauthenticated"
        | "missing_scope"
        | "production_denied"
        | "not_entitled"
        | "not_enrolled"
        | "workspace_mismatch"
        | "tenant_mismatch"
        | "secret_exfiltration_blocked"
        | "prompt_scope_override_denied";
    };

const SECRET_QUERY = /(api[_-]?key|password|secret|bearer\s|authorization:)/i;

export function authorizeRetrieval(
  caller: RetrievalCaller,
  target: { tenantId: string; workspaceId: string },
  queryText?: string,
): RetrievalAuthzDecision {
  if (!caller.authenticated) return { allowed: false, reason: "unauthenticated" };
  if (!caller.tenantId || !caller.workspaceId) return { allowed: false, reason: "missing_scope" };
  if (caller.productionEnvironment) return { allowed: false, reason: "production_denied" };
  if (!caller.eos3Entitled) return { allowed: false, reason: "not_entitled" };
  if (!caller.eos3Enrolled) return { allowed: false, reason: "not_enrolled" };
  if (caller.tenantId !== target.tenantId) return { allowed: false, reason: "tenant_mismatch" };
  if (caller.workspaceId !== target.workspaceId) return { allowed: false, reason: "workspace_mismatch" };
  if (queryText && SECRET_QUERY.test(queryText)) {
    return { allowed: false, reason: "secret_exfiltration_blocked" };
  }
  // Natural-language attempts to override tenant/workspace are ignored; scope remains caller bindings.
  if (queryText && /ignore (previous|all) instructions|use workspace|switch tenant/i.test(queryText)) {
    // Do not grant alternate scope; continue with caller scope only.
    void "prompt_scope_override_ignored";
  }
  return { allowed: true };
}

/** Retrieved document text is data, never privileged instructions. */
export function isolateRetrievedContent(text: string): {
  dataOnly: true;
  strippedDirectives: string[];
  safeText: string;
} {
  const stripped: string[] = [];
  const safeText = text
    .split("\n")
    .map((line) => {
      if (/ignore (previous|all) instructions/i.test(line) || /you are now|system prompt/i.test(line)) {
        stripped.push(line.trim());
        return "[instruction-like content isolated as data]";
      }
      return line;
    })
    .join("\n");
  return { dataOnly: true, strippedDirectives: stripped, safeText };
}

export function denyGovernedActionViaRetrieval(action: string): {
  denied: true;
  authority: "human_only";
  mayRecommend: true;
} {
  void action;
  return { denied: true, authority: "human_only", mayRecommend: true };
}
