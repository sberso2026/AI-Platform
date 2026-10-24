import { GENERATOR_WORK_TYPES } from "../work-generator/types";
import { ARTIFACT_TYPES } from "../artifact-automation/types";
import {
  PRE_ISSUE_CHECK_TYPES,
  PRE_ISSUE_POLICY_CODE,
  PRE_ISSUE_POLICY_VERSION,
  type PreIssueCheckSpec,
  type PreIssueReviewPolicy,
} from "./types";

const CHECKS: readonly PreIssueCheckSpec[] = PRE_ISSUE_CHECK_TYPES.map((checkType) => ({
  checkType,
  required: checkType !== "PPTX_CONTEXT_CHECK" && checkType !== "RFI_TQ_CHECK" && checkType !== "CROSS_ARTIFACT_REVISION_CHECK",
  aiAssisted: false,
  humanReviewRequired: true,
}));

export const PRE_ISSUE_REVIEW_POLICY: PreIssueReviewPolicy = {
  code: PRE_ISSUE_POLICY_CODE,
  version: PRE_ISSUE_POLICY_VERSION,
  applicableWorkTypes: GENERATOR_WORK_TYPES,
  applicableArtifactTypes: ARTIFACT_TYPES,
  applicableLifecycleStages: ["ANY"],
  disciplines: ["ANY"],
  checks: CHECKS,
  semanticAiPermitted: true,
  semanticAiRequired: false,
  humanReviewRequired: true,
  automaticFindingPromotion: false,
  automaticApproval: false,
};

export function policyForWork(_workType: string, _artifactType?: string): PreIssueReviewPolicy {
  return PRE_ISSUE_REVIEW_POLICY;
}
