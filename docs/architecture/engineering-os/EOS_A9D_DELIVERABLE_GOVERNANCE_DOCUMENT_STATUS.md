# EOS-A9D Deliverable Governance, Document Status Semantics & Live UI Certification

Status: **IMPLEMENTED** for staging / non-production. Additive after EOS-A9C. Does not redesign Deliverable Intelligence.

A Deliverable **template** says what a project **may** choose to require. A project Deliverable **Expectation** says what the project **does** require. A document status code says what the source system calls a document state. A governed mapping explains what that code means **in the project**. None of these independently constitutes engineering approval.

## Purpose

A9D closes remaining governance gaps on top of A9C:

1. Governed project/workspace adoption of EXAMPLE/TEMPLATE catalog items
2. Project-specific Deliverable definitions/expectations
3. Project/workspace document status mapping
4. Revision-aware artifact binding (`EXACT_REVISION`, `CURRENT_EFFECTIVE_REVISION`, `BASELINE_PINNED_REVISION`)
5. Status and revision as **contributing evidence** only
6. Targeted Engineering Review regression and live RLS

## Template vs project expectation

| Object | Authority |
| --- | --- |
| EXAMPLE / TEMPLATE catalog | Non-authoritative. Existence does not create a project requirement, missing-deliverable alert, or gate effect |
| Adopt template | Authorized Engineering administrator creates an active Expectation |
| Adopt with overrides | Same, with project-specific stage/scope/disciplines/purpose |
| Mark not applicable | Records `NOT_APPLICABLE`; excluded from gate required set |
| Project-specific definition | Project-scoped row; **must not** mutate the global catalog |

Unadopted templates are listed separately from Active Deliverables. Bulk adoption previews exactly what will be created and requires confirmation. No automatic AI selection.

## Document status governance

Canonical Document domain status on `engineering_documents` is `draft | issued | for_review | approved | superseded | obsolete`. IFR / IFA / IFC / AFC strings in document-identity are **revision tokens**, not status semantics, and are not used as maturity shortcuts.

A9D does **not** globally hard-code:

- IFR = X
- IFA = Y
- IFC = Z

`DocumentStatusMapping` is tenant/workspace scoped, optionally project-scoped, versioned, and audited (`configured_by`, `configured_at`). Ordinary engineers may inspect effective mapping. Only Engineering administrators may change it.

### Raw code vs canonical semantic

Possible purpose-oriented categories:

- `WORK_IN_PROGRESS`
- `FOR_COORDINATION`
- `FOR_REVIEW`
- `FOR_APPROVAL`
- `AUTHORIZED_FOR_CONFIGURED_USE`
- `FOR_CONSTRUCTION_USE`
- `RECORD`
- `SUPERSEDED`
- `VOID`
- `UNMAPPED`

Unknown or unmapped codes, including an unmapped `IFC` string, remain `UNMAPPED`. Acronym text is never inferred.

### Status mapping versioning

Historical maturity assessments retain mapping version in the evidence fingerprint. A material mapping change stales current assessments and does not rewrite history.

### Status vs approval

Mapped status may contribute to the CONTENT dimension. It does **not** by itself establish:

- engineering approval
- Review completion
- Configuration Baseline membership
- construction authorization
- code compliance
- human sign-off

`FOR_CONSTRUCTION_USE` still requires every configured maturity dimension (Review, frozen baseline revision match, etc.) before `READY_FOR_CONFIGURED_PURPOSE`. That still is not automatic human approval. `RECORD` / As-Built raw codes are the same: mapping plus configured lifecycle/configuration evidence.

Non-document artifacts (Analysis Results, Decisions, Review Packages, Configuration Baselines, Models, Registers) are unaffected by document status mapping.

## Revision authority

Bindings distinguish the evaluated revision. Policies:

| Policy | Authority |
| --- | --- |
| `EXACT_REVISION` | Binding pins one canonical revision. A newer revision does not silently replace it |
| `CURRENT_EFFECTIVE_REVISION` | Resolves using Document domain rules: exclude `superseded` / `obsolete`. No independent lexical “latest” algorithm |
| `BASELINE_PINNED_REVISION` | Uses the revision frozen into the applicable A4 Configuration Baseline item (`revision_ref`). Current document revision ≠ baseline revision |

Supersession uses canonical document status, not revision-string comparison.

If the governing policy resolves to materially different evidence, the previous assessment becomes `STALE`. Historical assessments keep the original fingerprint and revision evidence.

## Artifact binding provenance

Evaluate records enough to explain: canonical artifact, revision policy, resolved revision, raw status, mapped semantic/version, and governing baseline where relevant. Digital Thread:

Deliverable Expectation → Artifact Binding → Document → Revision → Status Mapping → Review → Configuration Baseline → Maturity Assessment → Lifecycle Gate

Platform KG is not required. KG reads remain OFF.

## Maturity composition

- **CONTENT:** required artifact exists; required revision resolves; configured status acceptable where the purpose requires it; not void/superseded where applicable. Not engineering correctness.
- **REVIEW:** canonical Engineering Review (or existing canonical approval). `FOR_REVIEW` / `approved` document status does not substitute.
- **CONFIGURATION:** for purposes requiring baseline inclusion, the **resolved** revision must belong to the frozen baseline.

Schedule complete remains descriptive. P6/activity complete does not set document status, Deliverable maturity, Review completion, Gate approval, or lifecycle stage.

## Lifecycle composition

Lifecycle gates operate only on **active** project Deliverable Expectations (`REQUIRED`). Unadopted templates have no gate effect. Gate evaluation consumes canonical Maturity Assessment, not raw acronyms. Gate approval and stage transition remain human.

`REQUIRED_DELIVERABLE_TEMPLATE_NOT_ADOPTED` is **not** created merely because templates exist.

## Assurance

Deterministic signals, where supported:

- `UNMAPPED_REQUIRED_DOCUMENT_STATUS`
- `BOUND_ARTIFACT_REVISION_SUPERSEDED`
- `REQUIRED_BASELINE_REVISION_MISMATCH`

These are assurance conditions, not automatic Findings.

## RLS / security

- Status mappings and project-specific definitions: member SELECT; Engineering admin INSERT/UPDATE/DELETE
- Document artifact bindings must resolve in the same tenant/workspace; otherwise `artifact_not_found` (no title/revision/status leak)
- Cross-workspace and cross-tenant binding denied
- Caller-supplied maturity claims still rejected except `TEST_FIXTURE`
- Ordinary users cannot set `maturity = READY`, `construction_authorized`, `review_complete`, or document semantic outside governed configuration

## AAL2 / browser certification

If real MFA enrollment/challenge is unavailable, `AAL2 = NOT_TESTED` and `BROWSER_CERTIFICATION = NOT_TESTED`. Domain/RLS pass may still yield `PASS_WITH_LIMITATIONS`. Authentication is not weakened.

## Tests

- Template safety (unadopted catalog has no expectation, no missing alert, no gate effect)
- Template adoption and project-specific definition
- Synthetic status codes `X1`/`X2`/`X3`; `ZZ` and unmapped `IFC` stay `UNMAPPED`
- Exact / current-effective / baseline-pinned revision
- Revision and mapping-change staleness
- Status alone insufficient for construction purpose
- Multidisciplinary and schedule-conflict regressions
- Live JWT RLS for mappings, project definitions, bindings, and denials

## Limitations

- Browser/AAL2 certification depends on a human MFA session
- Document storage, transmittals, and DMS replacement remain out of scope
- No automatic IFC, As-Built, gate, or engineering approval
- No universal maturity score or percent complete
- Engineering Information Intelligence full domain is not this phase
