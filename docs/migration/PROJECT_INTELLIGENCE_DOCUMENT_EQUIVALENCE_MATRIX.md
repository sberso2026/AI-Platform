# Project Intelligence Document Equivalence Matrix

**Phase:** 6C-2  
**Frozen SHA:** `ab1f44276715888123d9f669464987e6f7c39b6c`  
**Rule:** Do not mark `equivalent` until harness scenarios and certification gates pass.

## Categories

| Category | Meaning |
|----------|---------|
| equivalent | Behaviour preserved under Platform ownership |
| equivalent_with_improvement | Same contract; safer/governed implementation |
| acceptable_documented_deviation | Intentional difference with documented rationale |
| not_equivalent | Not yet proven |
| not_tested | Deferred / no fixture |

## Matrix

| Scenario ID | Freeze behaviour | Platform target | Category | Evidence | Deviation |
|-------------|------------------|-----------------|----------|----------|-----------|
| EQ-DOC-REG | Upload creates intel document row | Register processing against Core document ID | equivalent_with_improvement | Gate F | No duplicate register |
| EQ-DOC-LIMITS | PDF/TXT/DOCX ≤25MiB | Same validation | equivalent | Unit HTTP | — |
| EQ-DOC-PROCESS | Queue → parse → chunk → embed → ready | PI state machine | equivalent_with_improvement | Gate F/M | Platform outbox |
| EQ-DOC-CHUNK | Traceable chunks with page/section | Stable chunk IDs + Core refs | equivalent | Gate G | — |
| EQ-DOC-TABLE | Tables retain headers/rows | Structured extraction JSON | equivalent | Gate G | — |
| EQ-DOC-RETRIEVE | Hybrid permission-scoped search | Retrieval service filters | equivalent_with_improvement | Gate H | Commerce scope |
| EQ-DOC-ANSWER | Answer + citations | Grounded answer contract | equivalent_with_improvement | Gate I | Director governance |
| EQ-DOC-ABSTAIN | Abstain below threshold | answerStatus=abstained | equivalent | Gate J | — |
| EQ-DOC-CONFLICT | Conflict surfaced | conflicting_evidence | equivalent | Gate J | — |
| EQ-DOC-REV | Revision compare | Comparison service | equivalent_with_improvement | Gate K | Core revisions SoT |
| EQ-DOC-FIND | Findings + review | Review boundary only | equivalent_with_improvement | Gate L | No auto Core write |
| EQ-DOC-RLS | Tenant isolation | Tenant+workspace+seat | equivalent_with_improvement | Gate C | Workspace matrix |
| EQ-DOC-MEET | Meetings | — | not_tested | — | Deferred 6C-3 |

## Harness notes

- Byte-for-byte parser/LLM output is **not** required.
- Citation must resolve to Engineering Core document identity + revision + evidence excerpt.
- Superseded revisions must not be used silently for “answered” status.
