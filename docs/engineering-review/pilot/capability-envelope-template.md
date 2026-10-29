# Capability envelope template

Use one record per (engineering domain × document class × review type × package characteristic set).  
Do **not** populate with invented performance. Empty fields mean NOT_TESTED.

| Field | Value |
| --- | --- |
| Envelope ID | |
| Classification | ESTABLISHED / EXPERIMENTAL / LIMITED / OUTSIDE_SCOPE / NOT_TESTED |
| Engineering domain | |
| Document class | |
| Review type | |
| Package characteristics | |
| Sample count (packages) | |
| Sample count (documents) | |
| Sample count (findings) | |
| Evidence quality | |
| Performance observations | |
| Material misses (list, not a score) | |
| Known limitations | |
| Statistical uncertainty | |
| Adjudicator notes | |
| Evidence references | |
| Date | |
| Assessor | |

## Classification rules

- **ESTABLISHED** — sufficient independent adjudication, denominators disclosed, no unreviewed material false negatives in the cell, limitations recorded.
- **EXPERIMENTAL** — some positive evidence; sample or quality insufficient to establish.
- **LIMITED** — works only under stated constraints (machine-readable text, current revisions, named review types).
- **OUTSIDE_SCOPE** — explicitly not a Review promise (CAD geometry, FEA, live LLM, autonomous approval).
- **NOT_TESTED** — no PILOT-1 evidence in this cell.

Silence (zero findings) in a cell is not ESTABLISHED correctness of the engineering.
