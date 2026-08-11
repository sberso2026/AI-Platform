/**
 * Invoke certified intelligence via adapter hooks — fixtures for certification.
 * Never fabricates results when engine unavailable/errors.
 */

import type {
  EngineeringIntelligenceCapability,
  EngineeringIntelligenceResultEnvelope,
  EngineeringIntelligenceRouteRequest,
} from "./contracts";
import { rejectFabricatedIntelligence } from "./contracts";
import { EngineeringIntelligenceRouter } from "./router";

export type IntelligenceInvoker = (
  capability: EngineeringIntelligenceCapability,
  request: EngineeringIntelligenceRouteRequest,
) => Promise<EngineeringIntelligenceResultEnvelope>;

export type IntelligenceInvocationOptions = {
  /** Simulate engine outage for a capabilityId. */
  unavailableCapabilityIds?: string[];
  /** Simulate hard failure. */
  failingCapabilityIds?: string[];
  /** Force stale freshness. */
  staleCapabilityIds?: string[];
  /** Ownership/version mismatch block. */
  ownershipMismatchIds?: string[];
};

function baseEnvelope(
  capability: EngineeringIntelligenceCapability,
  partial: Partial<EngineeringIntelligenceResultEnvelope> & {
    result: Record<string, unknown>;
  },
): EngineeringIntelligenceResultEnvelope {
  return {
    capabilityId: capability.capabilityId,
    version: capability.version,
    owner: capability.owner,
    result: partial.result,
    evidenceRefs: partial.evidenceRefs ?? [],
    authorityStatus: capability.authorityClass,
    confidence: partial.confidence ?? null,
    uncertaintyNotes: partial.uncertaintyNotes ?? [],
    limitations: [
      ...(partial.limitations ?? []),
      "Intelligence is advisory — not approval, fact authority, or assurance sign-off.",
    ],
    reviewRequired: true,
    provenance: {
      engine: capability.owner,
      capabilityId: capability.capabilityId,
      version: capability.version,
      owner: capability.owner,
      sourceEvidenceRefs: partial.evidenceRefs ?? [],
      assumptions: partial.provenance?.assumptions ?? [],
      advisory: true,
      intelligenceIsNotApproval: true,
      predictionIsNotFact: true,
      scenarioIsNotForecastAuthority: true,
      riskSignalIsNotAcceptedRisk: true,
      assuranceFindingIsNotSignOff: true,
    },
    generatedAt: new Date().toISOString(),
    freshness: partial.freshness ?? "CURRENT",
    timingMs: partial.timingMs,
  };
}

/** Deterministic certified-engine fixture adapter (no ownership transfer). */
export const fixtureIntelligenceInvoker: IntelligenceInvoker = async (capability, request) => {
  const evidence = [
    request.objectId ? `obj:${request.objectId}` : null,
    request.projectId ? `project:${request.projectId}` : null,
  ].filter(Boolean) as string[];

  switch (capability.capabilityId) {
    case "project_intelligence.risk_attention":
      return baseEnvelope(capability, {
        result: {
          summary: "Major risks requiring attention (fixture from Project Intelligence contract)",
          items: [{ id: "risk-1", title: "Temporary bracing duration", severity: "high" }],
        },
        evidenceRefs: evidence,
      });
    case "asset_intelligence.condition":
      return baseEnvelope(capability, {
        result: {
          summary: "Condition delta (fixture from Asset Intelligence condition contract)",
          changed: true,
          prior: "fair",
          current: "poor",
        },
        evidenceRefs: evidence,
        confidence: capability.outputContract.mayIncludeConfidence ? 0.72 : null,
      });
    case "inspection_intelligence.condition":
      return baseEnvelope(capability, {
        result: {
          summary: "Inspection condition evidence (fixture)",
          rating: "C",
        },
        evidenceRefs: evidence,
      });
    case "project_controls.decision_support":
      return baseEnvelope(capability, {
        result: {
          summary: "Decision options (fixture from Decision Support Engine)",
          options: [
            { id: "opt-a", label: "Continue temporary repair", advisory: true },
            { id: "opt-b", label: "Accelerate permanent fix", advisory: true },
          ],
        },
        evidenceRefs: evidence,
        confidence: 0.61,
        provenance: {
          engine: capability.owner,
          capabilityId: capability.capabilityId,
          version: capability.version,
          owner: capability.owner,
          sourceEvidenceRefs: evidence,
          assumptions: ["Options are advisory only; human selects"],
          advisory: true,
          intelligenceIsNotApproval: true,
          predictionIsNotFact: true,
          scenarioIsNotForecastAuthority: true,
          riskSignalIsNotAcceptedRisk: true,
          assuranceFindingIsNotSignOff: true,
        },
      });
    case "project_controls.scenario_intelligence":
      return baseEnvelope(capability, {
        result: {
          summary: "Scenario outcome (fixture) — not forecast authority",
          hypothesis: request.providedInputs?.scenarioHypothesis ?? request.query,
        },
        evidenceRefs: evidence,
        provenance: {
          engine: capability.owner,
          capabilityId: capability.capabilityId,
          version: capability.version,
          owner: capability.owner,
          sourceEvidenceRefs: evidence,
          assumptions: ["Scenario is exploratory"],
          advisory: true,
          intelligenceIsNotApproval: true,
          predictionIsNotFact: true,
          scenarioIsNotForecastAuthority: true,
          riskSignalIsNotAcceptedRisk: true,
          assuranceFindingIsNotSignOff: true,
        },
      });
    case "project_controls.risk_opportunity_intelligence":
      return baseEnvelope(capability, {
        result: {
          summary: "Risk/opportunity signals (fixture) — not accepted risk",
          signals: [{ id: "ro-1", kind: "risk", title: "Schedule exposure" }],
        },
        evidenceRefs: evidence,
        confidence: 0.55,
      });
    case "project_controls.assurance_intelligence":
      return baseEnvelope(capability, {
        result: {
          summary: "Assurance findings (fixture) — not human sign-off",
          findings: [{ id: "as-1", title: "Evidence pack incomplete" }],
        },
        evidenceRefs: evidence,
      });
    case "project_controls.explainability_intelligence":
      return baseEnvelope(capability, {
        result: {
          summary: "Explainability trace (fixture)",
          finding: "Conclusion supported by composed contributors",
        },
        evidenceRefs: evidence,
      });
    default:
      rejectFabricatedIntelligence();
  }
};

export class EngineeringIntelligenceService {
  constructor(
    private readonly router: EngineeringIntelligenceRouter = new EngineeringIntelligenceRouter(),
    private readonly invoker: IntelligenceInvoker = fixtureIntelligenceInvoker,
    private readonly options: IntelligenceInvocationOptions = {},
  ) {}

  getRouter(): EngineeringIntelligenceRouter {
    return this.router;
  }

  async routeAndInvoke(request: EngineeringIntelligenceRouteRequest): Promise<{
    route: ReturnType<EngineeringIntelligenceRouter["route"]>;
    results: EngineeringIntelligenceResultEnvelope[];
    fallbackToEvidence: boolean;
    limitations: string[];
    timingMs: { routeMs: number; invokeMs: number; totalMs: number };
  }> {
    const totalT0 = Date.now();
    const route = this.router.route(request);
    const limitations: string[] = [];

    if (route.reasonCode !== "MATCHED" || !route.selected.length) {
      limitations.push(
        route.reasonCode === "UNSUPPORTED_INTENT"
          ? "No certified intelligence capability advertised for this intent; using evidence/reasoning fallback."
          : route.reasonCode === "MISSING_INPUT"
            ? `Intelligence missing required input(s): ${route.missingInputs.join(", ")}.`
            : route.reasonCode === "NO_ENTITLEMENT"
              ? "Intelligence capability not entitled for this workspace."
              : "Certified intelligence unavailable for this context; using evidence/reasoning fallback.",
      );
      return {
        route,
        results: [],
        fallbackToEvidence: true,
        limitations,
        timingMs: {
          routeMs: route.timingMs.routeMs,
          invokeMs: 0,
          totalMs: Date.now() - totalT0,
        },
      };
    }

    const results: EngineeringIntelligenceResultEnvelope[] = [];
    let invokeMs = 0;
    for (const cap of route.selected) {
      if (this.options.ownershipMismatchIds?.includes(cap.capabilityId)) {
        limitations.push(
          `Blocked ${cap.capabilityId}: ownership/version mismatch — invocation refused.`,
        );
        continue;
      }
      if (this.options.unavailableCapabilityIds?.includes(cap.capabilityId)) {
        limitations.push(`Engine unavailable: ${cap.capabilityId}; no fabricated substitute.`);
        continue;
      }
      if (this.options.failingCapabilityIds?.includes(cap.capabilityId)) {
        limitations.push(`Engine error: ${cap.capabilityId}; no substitute invented.`);
        continue;
      }
      const i0 = Date.now();
      try {
        const envelope = await this.invoker(cap, request);
        invokeMs += Date.now() - i0;
        if (this.options.staleCapabilityIds?.includes(cap.capabilityId)) {
          envelope.freshness = "STALE";
          envelope.limitations.push("Stale intelligence result — refresh recommended.");
        }
        envelope.timingMs = {
          routeMs: route.timingMs.routeMs,
          invokeMs: Date.now() - i0,
          totalMs: Date.now() - totalT0,
        };
        results.push(envelope);
      } catch {
        limitations.push(`Engine error: ${cap.capabilityId}; no substitute invented.`);
      }
    }

    const fallbackToEvidence = results.length === 0;
    if (fallbackToEvidence) {
      limitations.push("Falling back to E2/E5 evidence response.");
    }

    return {
      route,
      results,
      fallbackToEvidence,
      limitations,
      timingMs: {
        routeMs: route.timingMs.routeMs,
        invokeMs,
        totalMs: Date.now() - totalT0,
      },
    };
  }
}
