import type {
  BusinessGrowthLeadScore,
  BusinessGrowthScoreComponent,
  BusinessGrowthTargetProfile,
} from "@rtb/types";
import { LEAD_SCORE_VERSION } from "@rtb/types";

export const LEAD_SCORE_WEIGHTS = {
  targetMarketFit: 15,
  industryFit: 15,
  geographyFit: 10,
  companySizeFit: 10,
  serviceFit: 15,
  evidenceOfNeed: 15,
  relationshipStrength: 10,
  dataCompleteness: 10,
} as const;

export const EMPTY_TARGET_PROFILE: BusinessGrowthTargetProfile = {
  industries: [],
  geographies: [],
  companySizeBands: [],
  services: [],
  targetMarkets: [],
};

function norm(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed || null;
}

function inList(value: string | null, allowed: string[]): boolean {
  if (!value) return false;
  return allowed.some((item) => item.trim().toLowerCase() === value);
}

function listMatch(
  id: string,
  label: string,
  weight: number,
  value: string | null | undefined,
  allowed: string[],
  missingKey: string,
): { component: BusinessGrowthScoreComponent; missing?: string } {
  const actual = norm(value);
  if (!allowed.length) {
    return {
      component: { id, label, weight, score: null, evidence: "Target profile list is empty." },
      missing: missingKey,
    };
  }
  if (!actual) {
    return {
      component: { id, label, weight, score: null, evidence: "Field not supplied." },
      missing: id,
    };
  }
  const matched = inList(actual, allowed);
  return {
    component: {
      id,
      label,
      weight,
      score: matched ? weight : 0,
      evidence: matched ? `Matched ${actual}.` : `${actual} is outside the target list.`,
    },
  };
}

export interface LeadScoreInput {
  organisationName?: string | null;
  industry?: string | null;
  geography?: string | null;
  companySizeBand?: string | null;
  services?: string | null;
  targetMarket?: string | null;
  website?: string | null;
  domain?: string | null;
  evidenceOfNeed?: boolean | null;
  relationshipKind?: string | null;
  sourceType?: string | null;
}

export function scoreLead(
  input: LeadScoreInput,
  profile: BusinessGrowthTargetProfile = EMPTY_TARGET_PROFILE,
): BusinessGrowthLeadScore {
  const missingInputs: string[] = [];
  const components: BusinessGrowthScoreComponent[] = [];

  const push = (result: { component: BusinessGrowthScoreComponent; missing?: string }) => {
    components.push(result.component);
    if (result.missing) missingInputs.push(result.missing);
  };

  push(
    listMatch(
      "target_market_fit",
      "Target-market fit",
      LEAD_SCORE_WEIGHTS.targetMarketFit,
      input.targetMarket,
      profile.targetMarkets,
      "target_profile.targetMarkets",
    ),
  );
  push(
    listMatch(
      "industry_fit",
      "Industry fit",
      LEAD_SCORE_WEIGHTS.industryFit,
      input.industry,
      profile.industries,
      "target_profile.industries",
    ),
  );
  push(
    listMatch(
      "geography_fit",
      "Geography fit",
      LEAD_SCORE_WEIGHTS.geographyFit,
      input.geography,
      profile.geographies,
      "target_profile.geographies",
    ),
  );
  push(
    listMatch(
      "company_size_fit",
      "Company-size fit",
      LEAD_SCORE_WEIGHTS.companySizeFit,
      input.companySizeBand,
      profile.companySizeBands,
      "target_profile.companySizeBands",
    ),
  );

  const serviceTokens = (input.services ?? "")
    .split(/[,/|]/)
    .map((part) => norm(part))
    .filter((part): part is string => Boolean(part));
  if (!profile.services.length) {
    components.push({
      id: "service_fit",
      label: "Service fit",
      weight: LEAD_SCORE_WEIGHTS.serviceFit,
      score: null,
      evidence: "Target profile services list is empty.",
    });
    missingInputs.push("target_profile.services");
  } else if (!serviceTokens.length) {
    components.push({
      id: "service_fit",
      label: "Service fit",
      weight: LEAD_SCORE_WEIGHTS.serviceFit,
      score: null,
      evidence: "Services not supplied.",
    });
    missingInputs.push("service_fit");
  } else {
    const matched = serviceTokens.some((token) => inList(token, profile.services));
    components.push({
      id: "service_fit",
      label: "Service fit",
      weight: LEAD_SCORE_WEIGHTS.serviceFit,
      score: matched ? LEAD_SCORE_WEIGHTS.serviceFit : 0,
      evidence: matched ? "At least one service matches the target profile." : "No listed service matches.",
    });
  }

  if (input.evidenceOfNeed === null || input.evidenceOfNeed === undefined) {
    components.push({
      id: "evidence_of_need",
      label: "Evidence of need",
      weight: LEAD_SCORE_WEIGHTS.evidenceOfNeed,
      score: null,
      evidence: "Need evidence was not supplied.",
    });
    missingInputs.push("evidence_of_need");
  } else {
    components.push({
      id: "evidence_of_need",
      label: "Evidence of need",
      weight: LEAD_SCORE_WEIGHTS.evidenceOfNeed,
      score: input.evidenceOfNeed ? LEAD_SCORE_WEIGHTS.evidenceOfNeed : 0,
      evidence: input.evidenceOfNeed ? "Need evidence was marked present." : "Need evidence was marked absent.",
    });
  }

  const relationship = norm(input.relationshipKind) ?? (input.sourceType === "referral" ? "referral" : null);
  if (!relationship) {
    components.push({
      id: "relationship_strength",
      label: "Relationship/referral strength",
      weight: LEAD_SCORE_WEIGHTS.relationshipStrength,
      score: null,
      evidence: "Relationship kind was not supplied.",
    });
    missingInputs.push("relationship_strength");
  } else {
    const score =
      relationship === "referral" || relationship === "known"
        ? LEAD_SCORE_WEIGHTS.relationshipStrength
        : relationship === "event" || relationship === "campaign"
          ? 5
          : 0;
    components.push({
      id: "relationship_strength",
      label: "Relationship/referral strength",
      weight: LEAD_SCORE_WEIGHTS.relationshipStrength,
      score,
      evidence: `Relationship kind is ${relationship}.`,
    });
  }

  const completenessFields = [
    input.organisationName,
    input.industry,
    input.geography,
    input.website ?? input.domain,
    input.companySizeBand,
    input.services,
  ];
  const filled = completenessFields.filter((field) => Boolean(norm(field ?? null))).length;
  const completenessScore = Math.round((filled / completenessFields.length) * LEAD_SCORE_WEIGHTS.dataCompleteness);
  components.push({
    id: "data_completeness",
    label: "Data completeness",
    weight: LEAD_SCORE_WEIGHTS.dataCompleteness,
    score: completenessScore,
    evidence: `${filled}/${completenessFields.length} organisation fields present. Personal contact is optional.`,
  });

  const scored = components.filter((c) => c.score !== null);
  const total = scored.length ? scored.reduce((sum, c) => sum + (c.score ?? 0), 0) : null;

  return {
    total,
    components,
    missingInputs,
    version: LEAD_SCORE_VERSION,
    method: "deterministic_lead_score_v1",
  };
}

export function enrichmentStatus(input: {
  organisationName?: string | null;
  industry?: string | null;
  geography?: string | null;
  website?: string | null;
  domain?: string | null;
  companySizeBand?: string | null;
  services?: string | null;
  enrichment?: object;
}): "none" | "partial" | "complete" {
  const has = (value: string | null | undefined) => Boolean(norm(value));
  const org = has(input.organisationName);
  const industry = has(input.industry);
  const geography = has(input.geography);
  const web = has(input.website) || has(input.domain);
  const size = has(input.companySizeBand);
  const services = has(input.services);
  const known = [org, industry, geography, web, size, services].filter(Boolean).length;
  if (known >= 5 && org && industry && geography && web) return "complete";
  if (known > 1 || Object.keys(input.enrichment ?? {}).length > 0) return "partial";
  return "none";
}
