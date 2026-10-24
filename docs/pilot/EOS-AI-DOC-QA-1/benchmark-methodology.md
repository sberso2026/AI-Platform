# Benchmark methodology

Five in-memory authorised fixture documents (not runtime-visible expected answers).

- 256 supported questions (16 facts × 16 formulations)
- 50 unsupported questions
- Splits: development / founder-style / holdout
- Metrics computed in `packages/project-intelligence/tests/document-qa-benchmark.test.ts`
- Results: `benchmark-results.json`

Runtime code does not import expected answers.
