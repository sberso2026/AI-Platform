# Issue register — EOS-PILOT-UAT-3

Severity rules: BLOCKER stops the cohort; HIGH is a core workflow failure after load; MEDIUM operable but misleading; LOW copy/a11y/latency; ENHANCEMENT is a want.

Issue freeze: log MEDIUM/LOW/ENHANCEMENT. Patch only BLOCKER/HIGH needed to continue.

## Carried from UAT-2 / 2R

| ID | Sev | Status | Finding |
|---|---|---|---|
| UAT-2-H1 | HIGH | **closed on Preview** | Project PATCH 403; re-file if an external PM hits 403 on Save |
| UAT-2-M1 | MEDIUM | open | Project workspace paints then “Loading project workspace…” |
| UAT-2-M2 | MEDIUM | **closed on Preview (EOS-AI-DOC-2R)** | Generation now routes through AI Director / OpenAI. Re-file if a human still sees unlabelled failure or lost evidence |
| UAT-2-M3 | MEDIUM | likely closed on Preview | Users directory copy; members load |
| UAT-2-M4 | MEDIUM | open | Trialing label on licensed 5-seat pool |
| UAT-2-L2 | LOW | open | Slow register pages; see [12-performance-evidence.md](./12-performance-evidence.md) |
| UAT-3-DOC-413 | HIGH when live | **remediated on Preview**; **not human-certified** | Signed upload path. Re-open as BLOCKER/HIGH if E11 fails |

## Known limitations (not certified; not new UAT-3 defects)

| ID | Track as | Status | Finding |
|---|---|---|---|
| UAT-3-KL-HYBRID | limitation | open | HYBRID_RETRIEVAL_PASS=false |
| UAT-3-KL-CITEDEDUP | limitation | open | CITATION_DEDUPLICATION_PASS=false |

## New from UAT-3 humans

None. Observation not started.

## Counts at this reconciliation

| Severity | Count | Notes |
|---|---|---|
| BLOCKER | 0 | |
| HIGH | 0 | DOC-413 not counted while Preview remediation holds |
| MEDIUM | 2 | M1, M4 carried |
| LOW | 1 | L2 carried |
| ENHANCEMENT | 0 | |
