import type { ReviewCoverageDeclaration } from "./coverage";
import { unmeasuredReviewCoverage } from "./coverage";
import type { ReviewFinding } from "./finding";
import type { ReviewRun } from "./review-run";
import { AI_ASSISTED_FIRST_PASS_DISCLAIMER } from "./version";

export type ReviewResult = {
  run: ReviewRun;
  findings: readonly ReviewFinding[];
  limitations: readonly string[];
  disclaimer: typeof AI_ASSISTED_FIRST_PASS_DISCLAIMER;
  coverage: ReviewCoverageDeclaration;
};

export function createReviewResult(input: {
  run: ReviewRun;
  findings: readonly ReviewFinding[];
  limitations?: readonly string[];
  coverage?: ReviewCoverageDeclaration;
}): ReviewResult {
  return {
    run: input.run,
    findings: input.findings,
    limitations: input.limitations ?? [
      "Deterministic fixture detectors only — not a production engineering rule library.",
      "Drawing and calculation visual interpretation is out of scope.",
    ],
    disclaimer: AI_ASSISTED_FIRST_PASS_DISCLAIMER,
    coverage: input.coverage ?? unmeasuredReviewCoverage({ reviewTypes: input.run.scope.reviewTypes }),
  };
}
