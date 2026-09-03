/**
 * Deterministic Engineering Reasoning Service (E5).
 * Assembles evidence-grounded answers with explicit basis taxonomy and Why? explanation.
 * Optional reasoning provider may refine wording; failure degrades to E2 retrieval-only.
 */

import {
  classifyEvidenceState,
  type EngineeringEvidence,
  type EngineeringEvidenceState,
} from "../phase-e2/contracts";
import { buildDocumentGroundedAnswer, isDocumentBodyEvidence } from "../services/document-grounded-answer";
import type {
  EngineeringApplicableRuleRef,
  EngineeringAuthorityStatusE5,
  EngineeringExplanationStatus,
  EngineeringReasoningAssumption,
  EngineeringReasoningBasisItem,
  EngineeringReasoningMode,
  EngineeringReasoningRequest,
  EngineeringReasoningResponse,
  EngineeringRecommendedAction,
  EngineeringWhyExplanation,
} from "./contracts";

const DEFAULT_MAX_EVIDENCE = 12;

export type ReasoningProvider = {
  refine?: (input: {
    finding: string;
    evidenceSummary: string;
    mode: EngineeringReasoningMode;
  }) => Promise<{ content: string; failed?: boolean } | null>;
};

function detectMode(query: string, requested?: EngineeringReasoningMode | null): EngineeringReasoningMode {
  if (requested) return requested;
  const q = query.toLowerCase();
  if (/\b(compare|versus|vs\.?|difference)\b/.test(q)) return "compare";
  if (/\b(summar(y|ise|ize)|overview)\b/.test(q)) return "summarise";
  if (/\b(gap|missing|what.?s missing|incomplete)\b/.test(q)) return "identify_gaps";
  if (/\b(recommend|next step|what should|action)\b/.test(q)) return "recommend_next_action";
  if (/\b(conclude|therefore|derive|implies)\b/.test(q)) return "derive_supported_conclusion";
  if (/\b(why|explain|how come)\b/.test(q)) return "explain";
  return "explain";
}

function preferAuthorityOrder(status: string): number {
  switch (status) {
    case "APPROVED":
    case "CURRENT":
      return 0;
    case "DRAFT":
      return 1;
    case "SUPERSEDED":
      return 3;
    default:
      return 2;
  }
}

/**
 * Authorise evidence for reasoning — drop untrusted connector UNKNOWN-equivalent
 * (already filtered upstream) and bound the set. Never invents hidden counts.
 */
export function assembleAuthorisedEvidence(
  evidence: EngineeringEvidence[],
  maxEvidence = DEFAULT_MAX_EVIDENCE,
): {
  evidence: EngineeringEvidence[];
  assemblyMs: number;
  limitations: string[];
} {
  const started = Date.now();
  const limitations: string[] = [];
  const trusted = evidence.filter((e) => {
    if (e.permissionsApplied !== true) return false;
    if (
      e.provenance !== "engineering_os_native" &&
      e.provenance !== "connector_external"
    ) {
      return false;
    }
    return true;
  });

  const sorted = [...trusted].sort((a, b) => {
    const auth = preferAuthorityOrder(a.authorityStatus) - preferAuthorityOrder(b.authorityStatus);
    if (auth !== 0) return auth;
    return (b.retrievalScore ?? 0) - (a.retrievalScore ?? 0);
  });

  const bounded = sorted.slice(0, maxEvidence);
  if (trusted.some((e) => e.authorityStatus === "SUPERSEDED")) {
    limitations.push("Material superseded evidence is retained for review — not hidden.");
  }
  if (trusted.some((e) => e.conflicting)) {
    limitations.push("Conflicting sources detected among authorised evidence.");
  }
  const hasNative = bounded.some((e) => e.provenance === "engineering_os_native");
  const hasConnector = bounded.some((e) => e.provenance === "connector_external");
  if (hasNative && hasConnector) {
    limitations.push("Evidence includes both native Engineering OS and connector sources.");
  }

  return {
    evidence: bounded,
    assemblyMs: Date.now() - started,
    limitations,
  };
}

function resolveRules(
  governed?: EngineeringApplicableRuleRef[],
): EngineeringApplicableRuleRef[] {
  if (governed?.length) {
    return governed.map((r) => ({ ...r, applied: r.governed && r.applied }));
  }
  return [
    {
      ruleId: "none",
      label: "No applicable controlled rule",
      governed: false,
      applied: false,
      note: "No governed rule/intelligence contract was supplied for this query. E5 does not invent a rules engine or fabricate standards.",
    },
  ];
}

function buildAssumptions(
  evidence: EngineeringEvidence[],
  mode: EngineeringReasoningMode,
): EngineeringReasoningAssumption[] {
  const assumptions: EngineeringReasoningAssumption[] = [];
  if (evidence.every((e) => e.provenance === "connector_external")) {
    assumptions.push({
      statement:
        "Conclusion relies on connector-sourced records; external systems remain systems of record.",
      explicit: true,
      evidenceIds: evidence.map((e) => e.sourceId),
    });
  }
  if (mode === "derive_supported_conclusion" && evidence.length > 0) {
    assumptions.push({
      statement:
        "Derived conclusion assumes cited excerpts are complete for the asked scope; unverified calculations/design checks were not performed.",
      explicit: true,
    });
  }
  if (evidence.some((e) => e.authorityStatus === "DRAFT")) {
    assumptions.push({
      statement: "One or more supporting sources are DRAFT and may change.",
      explicit: true,
      evidenceIds: evidence
        .filter((e) => e.authorityStatus === "DRAFT")
        .map((e) => e.sourceId),
    });
  }
  return assumptions;
}

function buildBasis(
  evidence: EngineeringEvidence[],
  evidenceState: EngineeringEvidenceState,
  mode: EngineeringReasoningMode,
): EngineeringReasoningBasisItem[] {
  if (evidenceState === "INSUFFICIENT" || evidence.length === 0) {
    return [
      {
        kind: "INSUFFICIENT_EVIDENCE",
        statement:
          "Authorised evidence is inadequate to support a client-specific engineering claim.",
      },
    ];
  }
  if (evidenceState === "CONFLICTING" || evidence.some((e) => e.conflicting)) {
    return [
      {
        kind: "CONFLICTING",
        statement:
          "Authorised sources disagree; conclusions are not silently resolved without authority/revision justification.",
        evidenceIds: evidence.filter((e) => e.conflicting).map((e) => e.sourceId),
      },
      {
        kind: "EVIDENCE_BASED",
        statement: `Key sources retained for review: ${evidence
          .slice(0, 3)
          .map((e) => e.title)
          .join("; ")}.`,
        evidenceIds: evidence.slice(0, 3).map((e) => e.sourceId),
      },
    ];
  }

  const basis: EngineeringReasoningBasisItem[] = [
    {
      kind: "EVIDENCE_BASED",
      statement: `Findings cite ${evidence.length} authorised source(s) with preserved provenance.`,
      evidenceIds: evidence.map((e) => e.sourceId),
    },
  ];

  if (
    mode === "derive_supported_conclusion" ||
    mode === "recommend_next_action" ||
    mode === "compare"
  ) {
    basis.push({
      kind: "DERIVED",
      statement:
        "Additional statements are derived from authorised excerpts only — not independent calculation or design verification.",
      evidenceIds: evidence.slice(0, 4).map((e) => e.sourceId),
    });
  }

  return basis;
}

function mapExplanationStatus(
  evidenceState: EngineeringEvidenceState,
  abstained: boolean,
): EngineeringExplanationStatus {
  if (abstained || evidenceState === "INSUFFICIENT") return "unsupported";
  if (evidenceState === "CONFLICTING") return "conflicting";
  if (evidenceState === "PARTIAL") return "partially_supported";
  if (evidenceState === "UNKNOWN") return "unknown";
  if (evidenceState === "SUFFICIENT") return "supported";
  return "incomplete";
}

function mapAuthority(
  abstained: boolean,
  evidenceState: EngineeringEvidenceState,
): EngineeringAuthorityStatusE5 {
  if (abstained || evidenceState === "INSUFFICIENT") return "ABSTAINED";
  if (evidenceState === "CONFLICTING" || evidenceState === "PARTIAL") {
    return "REQUIRES_HUMAN_REVIEW";
  }
  return "ADVISORY";
}

function confidenceFor(
  evidenceState: EngineeringEvidenceState,
  evidence: EngineeringEvidence[],
): number | null {
  if (evidence.length === 0) return null;
  if (evidenceState === "INSUFFICIENT" || evidenceState === "UNKNOWN") return null;
  if (evidenceState === "CONFLICTING") return 0.35;
  if (evidenceState === "PARTIAL") return 0.55;
  if (evidence.every((e) => e.authorityStatus === "APPROVED" || e.authorityStatus === "CURRENT")) {
    return 0.75;
  }
  return 0.65;
}

function synthesiseFinding(
  query: string,
  mode: EngineeringReasoningMode,
  evidence: EngineeringEvidence[],
  evidenceState: EngineeringEvidenceState,
): { finding: string; answer: string; abstained: boolean; missing?: string[] } {
  if (isDocumentBodyEvidence(evidence) && evidenceState !== "INSUFFICIENT") {
    const grounded = buildDocumentGroundedAnswer({ query, evidence });
    return {
      abstained: grounded.abstained,
      finding: grounded.abstained ? "Insufficient authorised document evidence." : "Supported by authorised document excerpts.",
      answer: grounded.answer,
      missing: grounded.limitations,
    };
  }
  if (evidence.length === 0 || evidenceState === "INSUFFICIENT") {
    const missing = [
      "Authorised native or connector records matching the query",
      "Current approved revisions where document authority is required",
    ];
    return {
      abstained: true,
      finding: "Insufficient authorised evidence.",
      answer:
        "Engineering OS cannot support a client-specific engineering claim with the authorised evidence available. No standards, revisions, approvals, calculations, or asset history were invented.",
      missing,
    };
  }

  const lines = evidence.slice(0, 5).map((e, i) => {
    const auth = e.authorityStatus !== "UNKNOWN" ? ` [${e.authorityStatus}]` : "";
    const rev = e.revision ? ` rev ${e.revision}` : "";
    const src =
      e.provenance === "connector_external" ? "connector" : "Engineering OS";
    return `${i + 1}. (${src}) ${e.title}${rev}${auth} — ${e.excerpt}`;
  });

  if (evidenceState === "CONFLICTING" || evidence.some((e) => e.conflicting)) {
    return {
      abstained: false,
      finding: "Conflicting authorised sources — review required.",
      answer: [
        `Sources disagree for: “${query}”.`,
        "Affected conclusion: a single preferred fact cannot be asserted without human review of authority/revision metadata.",
        ...lines,
        "",
        "Advisory only. Humans retain engineering authority. No autonomous approval.",
      ].join("\n"),
    };
  }

  let header: string;
  switch (mode) {
    case "compare":
      header = "Comparison based on authorised evidence:";
      break;
    case "summarise":
      header = "Summary of authorised engineering records:";
      break;
    case "identify_gaps":
      header = "Evidence gaps relative to the asked scope:";
      break;
    case "derive_supported_conclusion":
      header = "Supported conclusion (derived from authorised excerpts only):";
      break;
    case "recommend_next_action":
      header = "Recommended next engineering action (advisory):";
      break;
    default:
      header = "Evidence-based finding:";
  }

  const gapNote =
    mode === "identify_gaps"
      ? "\n\nGaps: formal calculation/design verification was not performed; connector freshness may be incomplete where not stated."
      : "";

  return {
    abstained: false,
    finding: evidence[0]?.title
      ? `Supported by ${evidence.length} authorised source(s), led by “${evidence[0].title}”.`
      : `Supported by ${evidence.length} authorised source(s).`,
    answer: [
      header,
      ...lines,
      gapNote,
      "",
      "Fact statements are limited to retrieved excerpts. Inferences are labelled in Why?. Assumptions are explicit. This is advisory — not an engineering approval or certified calculation.",
    ].join("\n"),
  };
}

function recommendedActions(
  mode: EngineeringReasoningMode,
  abstained: boolean,
  evidenceState: EngineeringEvidenceState,
): EngineeringRecommendedAction[] {
  const actions: EngineeringRecommendedAction[] = [];
  if (abstained) {
    actions.push({
      action: "Provide or link authorised project/asset/document records relevant to the question",
      rationale: "Evidence is insufficient for a grounded answer",
      requiresHumanReview: true,
      autonomousApproval: false,
    });
    return actions;
  }
  if (evidenceState === "CONFLICTING") {
    actions.push({
      action: "Review conflicting sources and confirm which revision/authority governs",
      rationale: "Sources disagree; silent preference is not allowed",
      requiresHumanReview: true,
      autonomousApproval: false,
    });
  }
  if (mode === "recommend_next_action" || mode === "derive_supported_conclusion") {
    actions.push({
      action: "Have a qualified engineer review the cited evidence before acting",
      rationale: "AI output is advisory and does not grant approval authority",
      requiresHumanReview: true,
      autonomousApproval: false,
    });
  }
  actions.push({
    action: "Open cited sources and verify currency (approved vs superseded)",
    rationale: "Preserve human engineering authority over record interpretation",
    requiresHumanReview: true,
    autonomousApproval: false,
  });
  return actions;
}

function buildWhy(input: {
  finding: string;
  evidence: EngineeringEvidence[];
  assumptions: EngineeringReasoningAssumption[];
  limitations: string[];
  rules: EngineeringApplicableRuleRef[];
  authority: EngineeringAuthorityStatusE5;
}): EngineeringWhyExplanation {
  return {
    finding: input.finding,
    keyEvidence: input.evidence.slice(0, 6).map((e) => ({
      sourceId: e.sourceId,
      title: e.title,
      provenance: e.provenance,
      authorityStatus: e.authorityStatus,
    })),
    ruleOrToolBasis: input.rules.map((r) =>
      r.applied
        ? `${r.label} (${r.ruleId})`
        : r.note ?? `${r.label} — not applied`,
    ),
    assumptions: input.assumptions.map((a) => a.statement),
    uncertaintyAndLimitations: input.limitations,
    authorityState: input.authority,
    chainOfThoughtExposed: false,
    platformInternalsExposed: false,
  };
}

/**
 * Reject fabricated calculation/standard claims in provider output.
 */
export function stripFabricatedAuthorityClaims(text: string, evidencedText = ""): string {
  const evidenced = evidencedText.toLowerCase();
  const keepStandard = (match: string) => {
    const needle = match.replace(/\s+/g, " ").toLowerCase();
    const compact = needle.replace(/\s/g, "");
    if (!evidenced) return "[standard citation omitted — not evidenced]";
    return evidenced.includes(needle) || evidenced.includes(compact) ? match : "[standard citation omitted — not evidenced]";
  };
  return text
    .replace(/\b(?:AS\/NZS|AS|ISO)\s*[\d.]+/gi, keepStandard)
    .replace(/\bapproved\s+by\s+[A-Z][a-z]+/gi, "approval status not evidenced")
    .replace(/\bcalculated\s+(?:stress|load|deflection)\s*[:=]\s*[\d.]+/gi, "calculation not performed by an approved tool");
}

export class EngineeringReasoningService {
  constructor(private readonly provider: ReasoningProvider = {}) {}

  async reason(request: EngineeringReasoningRequest): Promise<EngineeringReasoningResponse> {
    const totalStarted = Date.now();
    try {
      return await this.reasonInner(request, totalStarted);
    } catch {
      // Provider/service failure → caller may also degrade; return retrieval-shaped abstention-safe payload
      const assembled = assembleAuthorisedEvidence(
        request.evidence,
        request.maxEvidence ?? DEFAULT_MAX_EVIDENCE,
      );
      const evidenceState = classifyEvidenceState({ evidence: assembled.evidence });
      return {
        answer:
          "Reasoning unavailable; showing authorised retrieval evidence only. No fabricated engineering claims were generated.",
        finding: "Degraded to retrieval-only",
        basis: [
          {
            kind: "UNKNOWN",
            statement: "Reasoning provider/service failed; E2 evidence retained without invented conclusions.",
          },
        ],
        evidence: assembled.evidence,
        assumptions: [],
        limitations: [
          ...assembled.limitations,
          "E5 reasoning failed; degraded to E2 retrieval-only.",
        ],
        applicableRules: resolveRules(request.governedRuleRefs),
        recommendedNextActions: recommendedActions("explain", evidenceState === "INSUFFICIENT", evidenceState),
        evidenceState,
        explanationStatus: "unknown",
        authorityStatus: "REQUIRES_HUMAN_REVIEW",
        confidence: null,
        mode: "explain",
        why: buildWhy({
          finding: "Degraded to retrieval-only",
          evidence: assembled.evidence,
          assumptions: [],
          limitations: ["E5 reasoning failed; degraded to E2 retrieval-only."],
          rules: resolveRules(request.governedRuleRefs),
          authority: "REQUIRES_HUMAN_REVIEW",
        }),
        abstained: evidenceState === "INSUFFICIENT" || assembled.evidence.length === 0,
        timingMs: {
          evidenceAssemblyMs: assembled.assemblyMs,
          reasoningMs: 0,
          totalMs: Date.now() - totalStarted,
        },
        degradedToRetrievalOnly: true,
        generatedAt: new Date().toISOString(),
      };
    }
  }

  private async reasonInner(
    request: EngineeringReasoningRequest,
    totalStarted: number,
  ): Promise<EngineeringReasoningResponse> {
    const assembled = assembleAuthorisedEvidence(
      request.evidence,
      request.maxEvidence ?? DEFAULT_MAX_EVIDENCE,
    );
    const reasoningStarted = Date.now();
    const mode = detectMode(request.query, request.requestedIntent);
    const evidenceState = classifyEvidenceState({ evidence: assembled.evidence });
    const synth = synthesiseFinding(
      request.query,
      mode,
      assembled.evidence,
      evidenceState,
    );
    const assumptions = buildAssumptions(assembled.evidence, mode);
    const basis = buildBasis(assembled.evidence, evidenceState, mode);
    if (assumptions.length) {
      for (const a of assumptions) {
        basis.push({
          kind: "ASSUMED",
          statement: a.statement,
          evidenceIds: a.evidenceIds,
        });
      }
    }

    const rules = resolveRules(request.governedRuleRefs);
    const limitations = [
      ...assembled.limitations,
      ...(synth.missing?.map((m) => `Missing: ${m}`) ?? []),
    ];
    if (request.applicableToolRefs?.length) {
      limitations.push(
        `Tool refs noted (${request.applicableToolRefs.join(", ")}) but E5 does not execute tools or claim formal verification.`,
      );
    }

    let answer = synth.answer;
    let degradedToRetrievalOnly = false;

    if (!synth.abstained && this.provider.refine) {
      try {
        const evidenceSummary = assembled.evidence
          .slice(0, 8)
          .map((e, i) => `[${i + 1}] ${e.title} :: ${e.excerpt}`)
          .join("\n");
        const refined = await this.provider.refine({
          finding: synth.finding,
          evidenceSummary,
          mode,
        });
        if (refined?.failed) {
          degradedToRetrievalOnly = true;
          limitations.push(
            "Reasoning provider failed; returned deterministic retrieval-grounded answer.",
          );
        } else if (refined?.content?.trim()) {
          answer = stripFabricatedAuthorityClaims(
            refined.content.trim(),
            assembled.evidence.map((item) => `${item.title} ${item.excerpt}`).join("\n"),
          );
          answer += "\n\n—\nAdvisory only. Humans retain engineering authority.";
        }
      } catch {
        degradedToRetrievalOnly = true;
        limitations.push(
          "Reasoning provider failed; returned deterministic retrieval-grounded answer.",
        );
        answer = synth.answer;
      }
    }

    const authorityStatus = mapAuthority(synth.abstained, evidenceState);
    const explanationStatus = mapExplanationStatus(evidenceState, synth.abstained);
    const why = buildWhy({
      finding: synth.finding,
      evidence: assembled.evidence,
      assumptions,
      limitations,
      rules,
      authority: authorityStatus,
    });

    const reasoningMs = Date.now() - reasoningStarted;
    return {
      answer,
      finding: synth.finding,
      basis,
      evidence: assembled.evidence,
      assumptions,
      limitations: [...new Set(limitations)],
      applicableRules: rules,
      recommendedNextActions: recommendedActions(mode, synth.abstained, evidenceState),
      evidenceState,
      explanationStatus,
      authorityStatus,
      confidence: confidenceFor(evidenceState, assembled.evidence),
      mode,
      why,
      abstained: synth.abstained,
      timingMs: {
        evidenceAssemblyMs: assembled.assemblyMs,
        reasoningMs,
        totalMs: Date.now() - totalStarted,
      },
      degradedToRetrievalOnly,
      generatedAt: new Date().toISOString(),
    };
  }
}
