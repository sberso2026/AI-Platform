# EOS-A8C Engineering Traceability & Assurance Intelligence

Status: implemented as a deterministic Assurance Condition layer over the canonical Engineering Digital Thread.

| Field | Value |
| --- | --- |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Baseline (start) | `f10c8d4b583ddc787512282cad34638040b81f01` (EOS-A8B-C) |
| Target | STAGING / NON-PRODUCTION `rntonzigxwxcjlcsadip` |
| Canonical source | Relational Core + `engineering_object_links` |
| Platform KG required | NO |
| KG reads default | OFF |
| Universal assurance / quality / traceability score | NO |
| Automatic defect / compliance / confirmed Impact | NO |
| Real solver execution | NOT IMPLEMENTED |
| Autonomous engineering approval | NO |

## Purpose

Engineering Assurance Intelligence identifies where engineering evidence, traceability, review, or coordination **may require attention**.

It answers:

- What condition exists?
- Why was it detected?
- Which deterministic rule detected it?
- Which engineering objects are involved?
- Which Digital Thread path proves it?
- What data would resolve it?
- Who, if anyone, has reviewed or dispositioned it?

It does **not** answer, without governed human engineering evidence:

- Is the design safe?
- Is the design compliant?
- Is this an engineering defect?
- Is this impact confirmed?
- Is this decision correct?

EOS surfaces assurance evidence. Engineers retain engineering authority.

## Assurance Condition

**ASSURANCE CONDITION** is a deterministic traceability/governance state detected by EOS. It is **not a Review Finding** and **not an Issue**.

An **Assurance Condition** is a deterministic traceability/governance state detected by EOS. Evaluation uses **canonical relational** Engineering Digital Thread data. **Platform KG is not assurance authority**.

Identity, classification, context, assessment, evidence, and governance fields persist on `engineering_assurance_conditions`.

Conditions are **not**:

- defects
- non-compliances
- design errors
- safety failures
- approval failures
- Review Findings
- Issues

Absence of evidence is not automatically evidence of engineering failure.

## Condition vs Finding

| | Assurance Condition | Engineering Review Finding |
| --- | --- | --- |
| Owner | Engineering OS / Core | Engineering Review |
| Meaning | Detected governance/traceability state | Reviewer conclusion inside a Review Package |
| Created by | Deterministic versioned rules | Human reviewer (or governed review process) |
| Auto-created from the other? | No | No |

A human may **cite or link** a Condition from a Review Package. EOS-A8C does not automatically create Findings.

## Condition vs Issue

An Assurance Condition is not an engineering Issue. Existing Engineering Core Issues remain the issue register. A human may link an Issue id onto a Condition. EOS-A8C does not automatically create Issues.

## Rule architecture

Rules are **code/config governed** (`ASSURANCE_RULE_CATALOG`). There is no user-authored executable DSL.

Each rule identifies: `rule_id`, `rule_version`, name, description, applicable object types, applicable maturity states, evaluation logic, produced condition type, evidence required, enabled status.

Applicability varies by object type, discipline, lifecycle/maturity, project context, and materiality. DRAFT objects are not forced through WORKING/APPROVED traceability expectations.

## Rule versioning

Every condition records `rule_id` and `rule_version` (example: `A8C-DEC-001` `v1`). A future rule change must not rewrite historical detections invisibly.

## Traceability maturity

EOS-A1 Traceability Maturity remains the overlay. A8C **reuses** it as applicability, and does not impose identical requirements on all objects. Low-materiality informational Decisions do not inherit the same evidence obligation as safety-critical Decisions.

## Materiality

Materiality is copied from canonical object fields where they exist (Assumption `low|medium|high|critical` → `LOW|MEDIUM|HIGH|CRITICAL`). Otherwise `UNASSESSED`. No LLM assigns safety criticality. No universal severity from object type alone.

## Status

`OPEN`, `ACKNOWLEDGED`, `UNDER_REVIEW`, `RESOLVED`, `ACCEPTED_WITH_JUSTIFICATION`, `NOT_APPLICABLE`, `SUPERSEDED`.

`CLOSED` is not used.

## Auto resolution

If canonical state later satisfies the rule, the existing row becomes `RESOLVED` with `resolution_source = CANONICAL_STATE_CHANGED`. Historical evidence is retained. Rows are not deleted.

## Human disposition

Authorized humans may `ACCEPT`, `NOT_APPLICABLE`, `DEFER`, `CREATE_REVIEW`, `CREATE_ISSUE`, or `RESOLVED_BY_ENGINEERING_CHANGE`. Actor, timestamp, and rationale are required for disposition. Disposition does not approve engineering consequences.

## Domain rules (initial catalog)

| Rule | Detects |
| --- | --- |
| A8C-REQ-001 v1 | Required Requirement allocation missing or allocated to an inaccessible target |
| A8C-DEC-001 v1 | Required Decision supporting evidence missing |
| A8C-DEC-002 v1 | Active Decision references stale Analysis Result |
| A8C-ANL-001 v1 | Required Analysis Review missing |
| A8C-ANL-002 v1 | Accepted Analysis Result became stale |
| A8C-IFC-001 v1 | Required Interface information incomplete / cross-discipline gap |
| A8C-CHG-001 v1 | Change has unassessed downstream dependency (not confirmed Impact) |
| A8C-CFG-001 v1 | Configuration Item missing required provenance |
| A8C-AST-001 v1 | Material Assumption invalid/expired while in use |

SPACE GASS 14.2 Trial remains uncertified. A8C does **not** globally warn merely because SPACE GASS is unavailable.

Optimization winner/recommendation logic is not implemented. Optimization composition is limited to Digital Thread evidence if an Optimization Run is already linked.

## Review composition

Engineering Review remains canonical. Conditions may detect missing/incomplete review. They do not reinterpret Review Findings. Human action may link `review_package_id`.

## Digital Thread evidence

Evaluation uses canonical relational Digital Thread (`loadAuthorizedWorkspaceGraph` + `traverseThread`). Evidence paths are deterministic. A second graph traversal engine is not created. Platform KG is optional infrastructure and **not** assurance authority. KG outage must not stop canonical evaluation.

## Condition fingerprint

Fingerprint = SHA-256 of `ruleId|workspaceId|rootType|rootId|relatedType|relatedId|contextKey`. Not derived from display text.

## Idempotency

Repeated evaluation with unchanged engineering data does not create duplicate OPEN rows, does not reset human disposition, and does not rewrite `detected_at`.

## AI boundary

AI may summarize, explain retrieved evidence, group conditions, draft Review/Issue text for humans, and help navigate the Digital Thread.

AI must **not** create authoritative conditions without deterministic rule evidence, change materiality, resolve conditions, accept risk, approve engineering, declare compliance, declare a design safe, or confirm Change Impact.

## Human authority

Read: workspace member. Acknowledge / assign / disposition / resolve / accept-with-justification: `engineering.execute` in the workspace. Delete / global rule change: `engineering.admin`. Rules are code-governed; ordinary users cannot mutate a rule catalog.

## Security / RLS

Tenant + `engineering_core_workspace_member`. Same-workspace member read. Same-tenant other-workspace deny. Different tenant deny. Anonymous deny.

## UI

Route: `/engineering/assurance`. Object panel on Requirement, Decision, Analysis, and Interface registers. Language: Assurance Condition, Evidence Gap, Traceability Gap, Stale Evidence, Incomplete Interface Information. Forbidden: FAILED DESIGN, UNSAFE, NON-COMPLIANT, INVALID ENGINEERING unless a canonical human-governed process already established that state.

Counts by type/status/discipline/materiality/object type are allowed. No red/amber/green universal correctness score.

## Tests

Synthetic Crusher Expansion FEED fixtures cover allocation, decision evidence, stale decision evidence, interface information, change candidates, configuration provenance, unreviewed analysis, expired assumption, auto-resolution, reopen, idempotency, and SPACE GASS non-warning. Hosted JWT RLS tests isolate workspace/tenant.

## Limitations

- Notifications are not required and are not implemented in A8C.
- No Settings DSL for arbitrary rule expressions.
- Incremental evaluation is available via JobService `engineering.assurance.evaluate`; unrestricted platform-wide scans are not implemented.
- Future KG-assisted discovery may accelerate candidate search; canonical relational evaluation remains authoritative.
- AAL2 browser certification is independent; core A8C may pass without browser MFA if service/database/security tests pass.
