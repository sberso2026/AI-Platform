# ERA-PILOT-1 protocol

**TITLE:** ERA-PILOT-1 — Real Engineering Value and Capability-Envelope Validation

**STATUS:** Protocol only. Do not execute in ERA-PILOT-0. Do not run on real project data until `CONTROLLED_PILOT_READY = YES` and `ERA_PILOT_1_EXECUTION_READY = YES`.

**Prerequisite:** live AAL2 for the named staging pilot, hosted `RTB_REVIEW_CLAMAV_URL` operating, current Review/Core RLS + audit + schema evidence, valid dependency disposition, secret scan.

---

## Hypotheses (keep separate)

**PRIMARY — engineering value**

When used on representative engineering packages, ERA-assisted review enables competent engineers to identify and resolve materially relevant engineering issues more effectively than the existing review workflow, while maintaining traceable evidence, explicit epistemic boundaries, and acceptable engineering noise.

**SECONDARY — commercial**

Demonstrated engineering improvement is valuable enough to support repeated organizational use and eventual willingness to pay.

Do not optimize PILOT-1 around commercial metrics. Do not claim `review_time_saved` unless a valid baseline exists.

---

## Test classes

### A. NATURALISTIC

Representative real engineering packages (authorized, tenant-isolated, retention-compliant).

Purpose: real-world usefulness and failure modes.

### B. CONTROLLED

Realistic packages containing known, documented engineering mutations/defects.

Purpose: detection performance against a frozen reference set.

### C. BOUNDARY

Cases intentionally containing insufficient evidence, unsupported document classes, extraction failure, missing referenced documents, ambiguous authority, superseded revisions, incomplete design basis, or unsupported engineering reasoning.

Purpose: determine whether ERA correctly abstains or limits its conclusion. **Correct abstention is success.**

---

## Blinded reference standard

```text
FROZEN PACKAGE
    |
    +--> independent engineer baseline review
    |
    +--> ERA-assisted review
    |
    --> blinded/independent adjudication
             |
             --> reference issue set
```

Where practical, adjudicators initially must not know whether an issue originated from ERA or the baseline engineer.

Disagreement outcomes:

| Code | Meaning |
| --- | --- |
| ERA_WRONG | ERA asserted or missed incorrectly |
| HUMAN_WRONG | Baseline engineer asserted or missed incorrectly |
| BOTH_PARTLY_CORRECT | Partial overlap; neither fully establishes truth |
| MISSING_CONTEXT | Available package context was insufficient |
| INDETERMINATE | Cannot establish a reference truth |

Neither ERA output nor engineer disagreement is automatically ground truth (Law 10).

---

## Materiality model

Do not use one opaque materiality score. Adjudicators score **explicit dimensions**:

- safety
- technical integrity
- compliance
- cost
- schedule
- constructability
- operability
- maintainability
- procurement

**Severity** (critical / major / minor / observation) is the finding's engineering gravity.

**Materiality** is whether the issue would change a competent engineer's action, hold, or communication on this package.

Human adjudicators determine material relevance. ERA must not autonomously accept residual engineering risk.

---

## Error-cost model

| Class | Definition | Asymmetry |
| --- | --- | --- |
| TRUE_POSITIVE | Confirmed material or correctly scoped finding | Useful |
| FALSE_POSITIVE | Finding rejected as not a finding / not in scope | Noise cost; do not flood |
| FALSE_NEGATIVE | Material issue present in the reference set and missed | Highest engineering cost |
| CORRECT_ABSTENTION | ERA limited or abstained when evidence/authority was insufficient | Success on BOUNDARY |
| INCORRECT_ABSTENTION | ERA abstained where evidence supported a material finding | Treated as a miss |
| UNRESOLVED | Adjudication INDETERMINATE / MISSING_CONTEXT | Retain; do not force a score |

Objective: **maximum useful detection subject to acceptable engineering noise and explicit epistemic limits.** Do not optimize recall by flooding engineers.

---

## Metrics

### A. Product-learning

- false-negative causes
- false-positive causes
- extraction failure rate
- evidence resolution rate
- correct abstention rate
- incorrect assertion rate
- disagreement taxonomy
- source-authority errors
- review-type performance
- boundary-recognition performance

### B. Engineering-value

- engineer-confirmed finding rate
- material finding rate
- novel material finding rate
- material recall where reference truth is available
- attention precision where applicable (not implemented; record as NOT_TESTED)
- review effort (only with a valid baseline)
- evidence verification effort
- resolution time
- missed material issues

### C. Commercial (define, do not optimize PILOT-1)

- voluntary repeat usage
- retention
- deployment expansion
- willingness to pay
- paid conversion
- revenue per project

---

## Statistical discipline

- Always report the **denominator** with every percentage.
- Disclose package counts, document counts, finding counts, and materiality distribution.
- Use confidence intervals where statistically meaningful.
- Do not declare a capability **ESTABLISHED** from a trivial sample.
- Retain package-level results.
- Individually review material false negatives.
- Avoid aggregates that hide poor subdomain performance.
- Segment where sample size permits: discipline, document type, review type, materiality, package complexity, evidence quality, source authority/freshness, project phase.
- There is no universal arbitrary minimum N in this protocol. Evidence strength is graded in the capability envelope (sample count + quality + uncertainty + adjudicator notes).

---

## Capability envelope

Populate `docs/engineering-review/pilot/capability-envelope-template.md` from adjudicated results only. Do not invent performance.

Classifications: ESTABLISHED, EXPERIMENTAL, LIMITED, OUTSIDE_SCOPE, NOT_TESTED.

---

## Execution stop conditions

Stop or pause PILOT-1 if:

- MFA or malware fail-closed controls are weakened,
- cross-tenant or cross-workspace leakage is observed,
- live LLM is introduced without a separate authorized change,
- adjudicators cannot remain independent.

Do not start ERA-8 from this protocol.
