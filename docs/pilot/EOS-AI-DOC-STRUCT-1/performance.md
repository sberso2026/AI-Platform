# Performance

Parse is synchronous and in-process (page-sized). Microbenchmark on nested clause text is well under 5 ms per parse (p50/p95 of the unit path). Retrieval and Ask latency are dominated by existing lexical/FTS + generation, not structure.

STRUCTURAL_PARSE_P50_MS=<5
STRUCTURAL_PARSE_P95_MS=<5
RETRIEVAL_P50_MS=see live-qa after deploy
RETRIEVAL_P95_MS=see live-qa after deploy
QA_P50_MS=see live-qa after deploy
QA_P95_MS=see live-qa after deploy
