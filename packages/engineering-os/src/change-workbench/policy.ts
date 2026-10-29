import {
  IMPACT_TRAVERSAL_RELATIONS,
  IMPACT_TRAVERSAL_MAX_DEPTH,
} from "../control-intelligence/invariants";
import { THREAD_HARD_MAX_DEPTH, THREAD_DEFAULT_NODE_LIMIT, THREAD_DEFAULT_EDGE_LIMIT } from "../digital-thread/types";

export const IMPACT_ASSESSMENT_POLICY = {
  code: "EOS-A11E-IMPACT-ASSESSMENT",
  version: "1.0.0",
  defaultMaxDepth: Math.max(IMPACT_TRAVERSAL_MAX_DEPTH, 6),
  hardMaxDepth: THREAD_HARD_MAX_DEPTH,
  defaultNodeLimit: THREAD_DEFAULT_NODE_LIMIT,
  defaultEdgeLimit: THREAD_DEFAULT_EDGE_LIMIT,
  allowedRelationTypes: IMPACT_TRAVERSAL_RELATIONS,
  additionalTraversalRelations: ["BASED_ON", "SCOPED_TO", "REVIEWS", "SUPERSEDES", "BASELINES", "SUPPORTED_BY"] as const,
  humanReviewRequired: true,
  autoConfirmImpact: false,
  autoSelectOptionWinner: false,
  autoApproveChange: false,
  autoApproveFieldChange: false,
  opaqueAiRelevanceScore: false,
} as const;

export type ImpactAssessmentPolicy = {
  code: string;
  version: string;
  maxDepth: number;
  nodeLimit: number;
  edgeLimit: number;
  relationTypes: string[];
  objectTypes?: string[];
};

export function resolveImpactPolicy(overrides?: Partial<Pick<ImpactAssessmentPolicy, "maxDepth" | "nodeLimit" | "edgeLimit" | "relationTypes" | "objectTypes">>): ImpactAssessmentPolicy {
  const requested = overrides?.maxDepth ?? IMPACT_ASSESSMENT_POLICY.defaultMaxDepth;
  const maxDepth = Math.min(Math.max(1, Math.floor(requested)), IMPACT_ASSESSMENT_POLICY.hardMaxDepth);
  return {
    code: IMPACT_ASSESSMENT_POLICY.code,
    version: IMPACT_ASSESSMENT_POLICY.version,
    maxDepth,
    nodeLimit: overrides?.nodeLimit ?? IMPACT_ASSESSMENT_POLICY.defaultNodeLimit,
    edgeLimit: overrides?.edgeLimit ?? IMPACT_ASSESSMENT_POLICY.defaultEdgeLimit,
    relationTypes: overrides?.relationTypes ?? [
      ...IMPACT_ASSESSMENT_POLICY.allowedRelationTypes,
      ...IMPACT_ASSESSMENT_POLICY.additionalTraversalRelations,
    ],
    objectTypes: overrides?.objectTypes,
  };
}
