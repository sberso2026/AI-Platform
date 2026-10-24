import type { FindingDisposition } from "./disposition";
import type { ReviewFinding } from "./finding";
import type { ReviewPackage } from "./review-package";
import type { ReviewRun } from "./review-run";

/**
 * Persisted Review Register — findings plus append-only disposition history
 * for a single review run.
 */
export type ReviewRegister = {
  pkg: ReviewPackage;
  run: ReviewRun;
  findings: readonly ReviewFinding[];
  dispositions: readonly FindingDisposition[];
};
