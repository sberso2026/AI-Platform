import type { FindingState, SecurityFinding } from "../contracts";

const ALLOWED: Record<FindingState, FindingState[]> = {
  open: ["accepted", "remediation_planned", "remediated", "closed", "false_positive"],
  accepted: ["remediation_planned", "closed"],
  remediation_planned: ["remediated", "closed"],
  remediated: ["closed"],
  closed: [],
  false_positive: ["closed"],
};

export class SecurityFindingRegistry {
  readonly kind = "security_finding_registry" as const;
  private findings = new Map<string, SecurityFinding>();

  open(finding: SecurityFinding): SecurityFinding {
    if (finding.isIncident !== false) {
      throw new Error("finding ≠ incident — do not mark findings as incidents");
    }
    if (finding.containsSensitivePayload !== false) {
      throw new Error("Sensitive finding payloads forbidden");
    }
    const stored = { ...finding, state: finding.state ?? ("open" as const) };
    this.findings.set(stored.findingId, stored);
    return stored;
  }

  transition(findingId: string, to: FindingState): SecurityFinding {
    const current = this.require(findingId);
    const allowed = ALLOWED[current.state];
    if (!allowed.includes(to)) {
      throw new Error(`Invalid finding transition ${current.state} → ${to}`);
    }
    const next = { ...current, state: to };
    this.findings.set(findingId, next);
    return next;
  }

  require(findingId: string): SecurityFinding {
    const f = this.findings.get(findingId);
    if (!f) throw new Error(`Unknown finding: ${findingId}`);
    return f;
  }

  list(state?: FindingState): SecurityFinding[] {
    const all = [...this.findings.values()];
    return state ? all.filter((f) => f.state === state) : all;
  }
}
