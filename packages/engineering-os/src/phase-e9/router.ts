/**
 * Bounded intelligence capability router — no fan-out to every engine.
 */

import type {
  EngineeringIntelligenceCapability,
  EngineeringIntelligenceIntent,
  EngineeringIntelligenceRouteRequest,
  EngineeringIntelligenceRouteResult,
} from "./contracts";
import { getDefaultIntelligenceCatalog } from "./catalog";

const INTENT_HINTS: Array<{ intent: EngineeringIntelligenceIntent; pattern: RegExp }> = [
  { intent: "what_changed", pattern: /\b(what changed|condition change|delta)\b/i },
  {
    intent: "what_requires_attention",
    pattern: /\b(require[s]? attention|major risks?|watchlist|critical)\b/i,
  },
  { intent: "why", pattern: /\b(why|explain|how come)\b/i },
  { intent: "what_is_predicted", pattern: /\b(predict|predicted|forecast|rul)\b/i },
  {
    intent: "what_are_the_options",
    pattern: /\b(options?|alternatives?|what (can|should) we)\b/i,
  },
  { intent: "what_happens_if", pattern: /\b(what if|what happens if|defer|scenario)\b/i },
  {
    intent: "what_evidence_supports",
    pattern: /\b(evidence|supports? this|based on)\b/i,
  },
  { intent: "what_is_uncertain", pattern: /\b(uncertain|uncertainty|confidence)\b/i },
  {
    intent: "what_needs_human_review",
    pattern: /\b(human review|needs review|assurance)\b/i,
  },
];

export function inferIntelligenceIntent(query: string): EngineeringIntelligenceIntent | null {
  for (const h of INTENT_HINTS) {
    if (h.pattern.test(query)) return h.intent;
  }
  return null;
}

export class EngineeringIntelligenceRouter {
  constructor(
    private readonly catalog: EngineeringIntelligenceCapability[] = getDefaultIntelligenceCatalog(),
  ) {}

  listCatalog(): EngineeringIntelligenceCapability[] {
    return this.catalog.map((c) => ({ ...c }));
  }

  route(request: EngineeringIntelligenceRouteRequest): EngineeringIntelligenceRouteResult {
    const t0 = Date.now();
    const intent = request.intent ?? inferIntelligenceIntent(request.query);
    const entitlementEnforced = request.entitledKeys !== undefined;
    const entitled = new Set(request.entitledKeys ?? []);
    const max = Math.min(Math.max(request.maxCapabilities ?? 2, 1), 3);
    const unavailable: EngineeringIntelligenceRouteResult["unavailable"] = [];

    if (!intent) {
      return {
        selected: [],
        reasonCode: "UNSUPPORTED_INTENT",
        requiredInputs: [],
        missingInputs: [],
        unavailable,
        timingMs: { routeMs: Date.now() - t0 },
      };
    }

    const objectType = (request.objectType ?? "").toLowerCase();
    const candidates = this.catalog.filter((c) => c.supportedIntents.includes(intent));

    if (!candidates.length) {
      return {
        selected: [],
        reasonCode: "UNSUPPORTED_INTENT",
        requiredInputs: [],
        missingInputs: [],
        unavailable,
        timingMs: { routeMs: Date.now() - t0 },
      };
    }

    const selected: EngineeringIntelligenceCapability[] = [];
    let missingInputs: string[] = [];
    let requiredInputs: string[] = [];

    for (const cap of candidates) {
      if (cap.availability === "UNAVAILABLE" || cap.capabilityOnly) {
        unavailable.push({ capabilityId: cap.capabilityId, reason: "capability_unavailable" });
        continue;
      }
      if (entitlementEnforced && !entitled.has(cap.entitlementKey)) {
        unavailable.push({ capabilityId: cap.capabilityId, reason: "not_entitled" });
        continue;
      }
      if (
        objectType &&
        cap.supportedObjectTypes.length &&
        !cap.supportedObjectTypes.some((t) => t.toLowerCase() === objectType)
      ) {
        // Object-type mismatch — skip unless project-scoped and projectId present for project caps
        if (!(request.projectId && cap.supportedObjectTypes.some((t) => /project/i.test(t)))) {
          continue;
        }
      }

      const inputs = { ...request.providedInputs };
      if (request.projectId) inputs.projectId = request.projectId;
      if (request.objectId && /asset/i.test(objectType)) inputs.assetId = request.objectId;
      if (request.objectId && /decision/i.test(objectType)) inputs.decisionId = request.objectId;
      if (request.objectId) inputs.subjectId = request.objectId;
      if (intent === "what_happens_if" && request.query) {
        inputs.scenarioHypothesis = inputs.scenarioHypothesis ?? request.query;
      }

      const missing = cap.inputContract.required.filter((k) => {
        const v = inputs[k];
        return v === undefined || v === null || v === "";
      });
      requiredInputs = [...new Set([...requiredInputs, ...cap.inputContract.required])];
      if (missing.length) {
        missingInputs = [...new Set([...missingInputs, ...missing])];
        unavailable.push({
          capabilityId: cap.capabilityId,
          reason: `missing_input:${missing.join(",")}`,
        });
        continue;
      }

      selected.push(cap);
      if (selected.length >= max) break;
    }

    if (!selected.length) {
      const reasonCode = missingInputs.length
        ? "MISSING_INPUT"
        : unavailable.some((u) => u.reason === "not_entitled")
          ? "NO_ENTITLEMENT"
          : unavailable.some((u) => u.reason === "capability_unavailable")
            ? "UNAVAILABLE"
            : "NO_APPLICABLE_CAPABILITY";
      return {
        selected: [],
        reasonCode,
        requiredInputs,
        missingInputs,
        unavailable,
        timingMs: { routeMs: Date.now() - t0 },
      };
    }

    return {
      selected,
      reasonCode: "MATCHED",
      requiredInputs,
      missingInputs: [],
      unavailable,
      timingMs: { routeMs: Date.now() - t0 },
    };
  }
}
