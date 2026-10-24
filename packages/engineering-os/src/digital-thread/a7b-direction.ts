/**
 * EOS-A8A verification of A7B analysis dependency → governed relation mapping.
 *
 * REQUIRES_RESULT_FROM → DEPENDS_ON
 *   from = downstream analysis_request
 *   to   = upstream analysis_request | analysis_result
 *   Meaning: downstream depends on upstream. Direction matches DOMAIN_RELATIONSHIP_MODEL.
 *
 * USES_RESULT_FROM (A7B original) → USED_BY
 *   A7B wrote from=downstream, relationship=USED_BY, to=upstream.
 *   A1 USED_BY means "from is used by to" (assumption USED_BY consumer).
 *   Downstream USED_BY upstream inverted that meaning.
 *
 * EOS-A8A migration (mapping only, endpoints unchanged):
 *   USES_RESULT_FROM → USES
 *   from = downstream analysis_request
 *   to   = upstream request/result
 *   Meaning: downstream uses the upstream result. Matches A1 USES (subject uses object).
 *
 * Dual-read: listing still treats historical USED_BY rows from analysis_request as USES_RESULT_FROM.
 * Optimization composeOptimizationRequest remains USED_BY (A7B composition; not rewritten here).
 */

export const A7B_DEPENDENCY_DIRECTION = {
  REQUIRES_RESULT_FROM: {
    governed: "DEPENDS_ON",
    from: "downstream analysis_request",
    to: "upstream analysis_request|analysis_result",
    verified: "CORRECT",
  },
  USES_RESULT_FROM: {
    governed: "USES",
    from: "downstream analysis_request",
    to: "upstream analysis_request|analysis_result",
    previousGoverned: "USED_BY",
    verified: "MIGRATED_A8A",
    historicalRead: "USED_BY still maps back to USES_RESULT_FROM",
  },
} as const;
