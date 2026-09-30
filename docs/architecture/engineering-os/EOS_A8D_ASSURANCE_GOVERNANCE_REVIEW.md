# EOS-A8D Assurance Governance, Review Integration & Completeness Certification

Status: implemented over the EOS-A8C Assurance Condition foundation. Does not redesign Assurance Intelligence. Does not implement EOS-A9 Lifecycle Intelligence.

| Field | Value |
| --- | --- |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Baseline (start) | `a514f8e4589ae86c38f15cdbbf4c1fc85824fb57` (EOS-A8C) |
| Target | STAGING / NON-PRODUCTION `rntonzigxwxcjlcsadip` |
| Canonical source | Relational Core + `engineering_object_links` |
| Platform KG required | NO |
| KG reads default | OFF |
| Universal assurance / quality / traceability score | NO |
| Automatic Finding / Issue / defect / compliance / confirmed Impact | NO |
| Real solver execution | NOT IMPLEMENTED |
| Arbitrary rule DSL | NO |

## Purpose

EOS-A8D operationalizes A8C by closing four operational gaps:

1. Certify real **ASSURANCE CONDITION** ↔ Engineering Review composition.
2. Add governed enable/disable of **approved catalog rules**.
3. Make evaluation completeness explicit so a bounded scan cannot conclude “no conditions”.
4. Browser/AAL2-certify the Assurance experience where real MFA is available (otherwise NOT_TESTED).

An **ASSURANCE CONDITION** is **not a Review Finding**, **not an Issue**, not a defect, not non-compliance, not an unsafe-design declaration, and not a confirmed Impact.

EOS may detect and explain the condition. EOS must never silently convert that condition into an engineering conclusion.

## Review composition

Preferred path:

Assurance Condition → governed citation (`engineering_assurance_review_citations`) → canonical Review Package.

Engineering Review remains owner of Review Packages, Review workflow, Findings, and dispositions **inside Review**.

Assurance remains owner of Conditions, rule evidence, and Assurance dispositions.

Create Review from Condition uses the canonical Review service (`TrustedReviewService.createPackage`) from the web API, then cites the package. Engineering OS does not depend on `@rtb/engineering-review`.

Link Existing Review validates tenant, workspace, package existence, and caller authority before citing.

Bidirectional navigation:

- Condition detail lists linked Review Packages and human Findings owned by Review.
- Review Package page lists cited Conditions (code, type, status, rule/version, explanation, Digital Thread path, materiality) without duplicating Condition rows into Review persistence.

## Condition vs Finding

| | Assurance Condition | Engineering Review Finding |
| --- | --- | --- |
| Owner | Engineering OS | Engineering Review |
| Store | `engineering_assurance_conditions` | `engineering_review_findings` |
| Created by | Deterministic catalog rules | Human reviewer |
| Auto-created from a citation? | No | **No** |

Linking or creating a Review from a Condition does not mint a Finding, Issue, approval, defect, compliance decision, or confirmed Impact.

A human reviewer **may** later create a Finding. Traceability is Condition → Review Package → Finding. Finding ownership stays in Review.

## Condition vs Issue

An Assurance Condition is **not an Issue**. Issues remain the Engineering Core issue register. A8D does not auto-create Issues.

## Review linking integrity

`review_package_id` is not accepted without validation.

Service and trigger `engineering_assurance_citation_same_scope` require:

- Condition exists in the same tenant/workspace
- Review Package exists
- Same tenant
- Same workspace
- No cross-tenant citation
- No cross-workspace citation

Hidden packages remain inaccessible through Review/Assurance RLS. Unauthorized callers cannot cite them.

When a valid package is linked, OPEN / ACKNOWLEDGED may become UNDER_REVIEW. Review completion does **not** auto-resolve the Condition. Resolution still requires canonical engineering state change or an authorized Assurance disposition.

## Rule governance

Rule **logic** remains CODE-GOVERNED in `ASSURANCE_RULE_CATALOG`. There is no arbitrary DSL, SQL-expression editor, JavaScript editor, natural-language executable rule, or AI-authored authoritative rule.

`engineering_assurance_rule_settings` stores only version-aware enable/disable overrides:

- key: tenant + workspace + `rule_id` + `rule_version`
- `enabled` override
- `configured_by` / `configured_at`

Unknown `rule_id`/`rule_version` pairs **fail closed**.

Effective rule state:

catalog default (enabled) → workspace governed override → effective enabled/disabled.

Project users cannot author policy. Ordinary engineers may read effective rules. Only Engineering administrators (`settings.write` + `engineering.admin` RLS) may enable, disable, or restore default.

A8C-DEC-001 v1 configuration does **not** apply to a future A8C-DEC-001 v2. Historical conditions retain original `rule_id` and `rule_version`.

## Enable / disable semantics

Disable is **not** engineering resolution.

| Label | Meaning |
| --- | --- |
| `RULE_DISABLED` | Catalog rule is not evaluated. Historical Conditions are retained. Future evaluation does not generate/reopen that rule while disabled. |
| `ENGINEERING_STATE_RESOLVED` | Canonical evidence no longer matches the rule (`resolution_source = CANONICAL_STATE_CHANGED`) or an authorized human disposition resolved it. |

Disabling a rule does not delete history and does not set `CANONICAL_STATE_CHANGED`. Re-enable reevaluates current canonical state. Fingerprints prevent duplicates.

Rule governance and Condition disposition are separate audit trails (`rule_enabled` / `rule_disabled` / `rule_restored_default` vs Condition disposition actions) on `engineering_audit_links`.

## Evaluation completeness

Workspace scans remain bounded (`THREAD_LINK_SCAN_LIMIT` = 2000 links). Truncation is no longer silent.

Each evaluation records an `AssuranceEvaluationRun`:

- completeness: `COMPLETE` | `PARTIAL` | `FAILED`
- truncated, limit, link/object counts
- remaining scope unknown
- reason / failure reason
- ruleset fingerprint
- conditions detected / created / resolved

A PARTIAL or FAILED evaluation:

- must not report a conclusive “No Assurance Conditions”
- must not auto-resolve an existing OPEN Condition merely because its evidence was not encountered
- UI shows **Evaluation Incomplete** / **Evaluation Partial** / **Evaluation Failed**

Auto-resolution of unseen OPEN Conditions requires `COMPLETE` evaluation **and** the rule still enabled.

## Evaluation run / fingerprint

`engineering_assurance_evaluation_runs` is an execution summary, not a workflow engine. JobService `engineering.assurance.evaluate` remains the job type.

Ruleset fingerprint is SHA-256 over sorted `ruleId:ruleVersion:0|1` identity bits. Display descriptions are not fingerprinted.

## Optimization assurance rule

`A8D-OPT-001` v1 is **CERTIFIED** on canonical Decision → Optimization Run evidence (`SUPPORTED_BY` / `BASED_ON`).

It triggers only when a Decision actually references an Optimization Run that is stale, failed, cancelled, queued, or running.

It does **not** select a winner, recommend an alternative, or declare the Decision wrong.

## Digital Thread evidence

Canonical relational Digital Thread remains authoritative. A8D reuses `loadAuthorizedWorkspaceGraphMeta` / `traverseThread`. No second traversal service.

A Review-linked Condition composes:

Requirement → Analysis Result → Decision → Assurance Condition → Review Package → Finding (only if a human later creates one)

The Condition ↔ Review hop is the governed citation. Findings remain Review-owned.

**Platform KG is not assurance authority.** KG reads remain DEFAULT OFF. Assurance does not depend on Platform KG.

## Settings UI

Route: `/engineering/settings/assurance`

Shows approved catalog rules with Rule ID, Name, Version, Domain, Condition Type, Effective Status, Default Status, Configured Override, and applicability summary.

Allowed admin actions: Enable, Disable, Restore Default.

Rule governance is **not** an uncontrolled toggle inside the ordinary Assurance Workspace.

## Security / RLS

- same workspace authorized read
- same tenant different workspace deny
- different tenant deny
- anonymous deny
- ordinary engineer cannot mutate rule settings
- engineering admin can mutate permitted settings
- cross-workspace / cross-tenant Review linking denied (trigger + service)
- ordinary user cannot delete Assurance history

Hosted JWT tests: `packages/engineering-review-persistence/src/live-a8d-assurance-rls.test.ts`.

## AAL2 / browser certification

If real AAL2 cannot be completed in this environment, `BROWSER_CERTIFICATION = NOT_TESTED` and `AAL2 = NOT_TESTED`. MFA is not weakened.

## Tests

Crusher Expansion FEED fixture certifies:

- Create Review from Condition
- Review cites Condition
- zero automatic Findings
- human Finding composition
- Digital Thread Condition → Review → Finding path
- disable / reevaluate / history retained
- re-enable without duplicates
- truncated PARTIAL evaluation
- PARTIAL does not auto-resolve unseen OPEN Conditions
- version-aware fail-closed settings
- ordinary user cannot mutate rules

## Limitations

- Notifications remain out of scope.
- No tenant-wide rule override table; workspace override is the smallest model consistent with workspace-scoped evaluation and RLS.
- Create Review still requires canonical Review documents; Assurance does not bypass that Review invariant.
- Browser/AAL2 certification is independent of service/database PASS.
- EOS-A9A Lifecycle Intelligence is implemented as a distinct Engineering OS domain. It composes Assurance and Review; it does not replace this A8D model.
