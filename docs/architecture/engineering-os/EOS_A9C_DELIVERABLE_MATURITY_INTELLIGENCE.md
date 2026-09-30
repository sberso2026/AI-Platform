# EOS-A9C Deliverable & Engineering Maturity Intelligence

Status: **IMPLEMENTED** for staging / non-production. Additive after EOS-A9B.

A Deliverable is a **governed engineering expectation**, not a Document and not a Document Management System. Maturity is **purpose-specific, multidimensional evidence**. It does not prove that a design is correct, safe, compliant, IFC-authorized, or approved.

## Distinctions

| Concept | Meaning |
| --- | --- |
| Deliverable Definition | Versioned catalog of what engineering output is expected |
| Deliverable Expectation | Definition applied to tenant/workspace/project/stage/scope |
| Canonical Artifact | Existing Document, Analysis Result, Review Package, Decision, Baseline, Interface, etc. |
| Artifact Binding | Governed link from expectation to canonical object + role |
| Deliverable Maturity | Evidence-based readiness for a configured purpose |
| Document Status | Workflow/revision status owned by the Document domain |
| Review Status | Canonical Engineering Review state |
| Configuration Status | Baseline/configuration authority owned by A4 |
| Lifecycle Stage | A9A engineering lifecycle context |
| Gate Readiness | A9A/A9B evidence evaluation for a gate |
| Approval | Human authority only |

These must not collapse into one field.

## Deliverable vs Document

Documents remain owned by the Document / Engineering Information domain. Deliverable Intelligence may reference document id, revision, status, baseline membership, and Review. It does not store document bytes, revision history, transmittals, or document permissions.

Non-document artifacts are first-class: Analysis Result, Review Package, Configuration Baseline, Decision, Interface, Register, Dataset, Model. A Structural Analysis Package may bind an Analysis Result + Review Package without a placeholder document.

## Definition and expectation

Definitions live in the code catalog (`EXAMPLE` / `TEMPLATE`). They are not mandatory for every FEED project unless selected into a project/workspace profile. Historical assessments retain definition/profile version.

An Expectation records tenant, workspace, project, lifecycle profile/version, stage, discipline ownership, scope (project/system/asset/package identity), required/optional/not applicable, intended purpose, and maturity profile/version. AI cannot create authoritative deliverable requirements. Origins: lifecycle profile, project/discipline configuration, or human-governed setup.

## Artifact binding and roles

One expectation may bind many canonical artifacts. One artifact may contribute to many deliverables. Roles: `PRIMARY`, `SUPPORTING`, `EVIDENCE`, `MODEL`, `CALCULATION`, `REVIEW`, `DECISION`, `CONFIGURATION`. Bindings are references, not copies.

Cross-workspace and cross-tenant bindings are denied (RLS + expectation-scope trigger).

## Discipline ownership

Responsible discipline and contributing disciplines reuse A7A Discipline Intelligence codes. There are no Structural Deliverables / Mechanical Deliverables tables. Multidisciplinary examples (Plant Layout / Interface Data Package) require configured contributing disciplines; document count is not coordination.

## Maturity model

Dimensions (deterministic, no weighted score):

- **CONTENT** — required primary canonical artifacts exist with authoritative harvested state. Not technical correctness. No LLM prose inspection.
- **TRACEABILITY** — configured requirement/decision/analysis provenance. Reuses A1 / A8. Not identical for every deliverable.
- **COORDINATION** — contributing disciplines identified and configured interface information complete.
- **REVIEW** — canonical Engineering Review Package state. Review completion is not technical correctness. Review still owns Findings.
- **CONFIGURATION** — applicable frozen Configuration Baseline (A4). Filenames are not IFC/As-Built authority.
- **SUPPORTING_EVIDENCE** — configured Analysis/Decision/Assumption/Optimization evidence; stale analysis fails closed.

Dimension states: `NOT_EVALUATED`, `SATISFIED`, `PARTIAL`, `NOT_SATISFIED`, `NOT_APPLICABLE`, `UNKNOWN`. UNKNOWN required dimensions fail closed.

There is **no** universal Engineering Maturity Score, quality score, 0–100 rating, AI confidence, or engineering percent complete. Raw counts may be labeled only as: `N of M configured deliverable expectations have bound artifacts`.

## Purpose-specific maturity

Purposes are not a universal numeric ladder: `FOR_INTERNAL_COORDINATION`, `FOR_ENGINEERING_REVIEW`, `FOR_BASELINE`, `FOR_CONSTRUCTION_USE`, `FOR_COMMISSIONING`, `FOR_OPERATIONS`. Mature for internal coordination does not imply mature for construction.

Readiness: `NOT_EVALUATED`, `INCOMPLETE`, `PARTIAL`, `READY_FOR_REVIEW`, `READY_FOR_CONFIGURED_PURPOSE`, `STALE`, `FAILED`. `APPROVED` is not a maturity state.

## Canonical evidence harvest

Production callers request evaluate. They must not submit `contentComplete`, `reviewComplete`, or equivalent. Caller-supplied maturity is **REJECTED** unless `evidenceMode: TEST_FIXTURE`. Harvest reuses the A9B Canonical Evidence Harvester.

Assessment completeness: `COMPLETE` | `PARTIAL` | `FAILED`. PARTIAL cannot claim `READY_FOR_CONFIGURED_PURPOSE` or `READY_FOR_REVIEW`. Bounds that truncate traversal yield PARTIAL, not false completeness.

Fingerprint is SHA-256 of expectation identity/version, purpose, profile/version, bound artifact identities/revisions, and harvested maturity facts. Display labels are not fingerprinted.

Material evidence changes (artifact revision, Review, stale Analysis, Requirement, Interface, superseded baseline, profile version) mark the prior assessment STALE. Explicit reevaluation is sufficient; no new Event Bus.

## Waiver semantics

Authorized humans may record an exception with actor, timestamp, rationale, affected dimension, and supporting Decision/Review. A waiver does **not** make missing evidence exist and does **not** rewrite `NOT_SATISFIED` as `SATISFIED`. Governance shows `WAIVED` overlay.

## Lifecycle composition

Optional FEED EXIT criteria:

- `REQUIRED_DELIVERABLES_PRESENT`
- `DELIVERABLE_MATURITY_REQUIRED`

If Deliverable Intelligence is not composed, or no matching required expectations are configured, those criteria are `NOT_APPLICABLE` so A9A/A9B evaluations still pass. Incomplete configured deliverable maturity does not bypass other A9B criteria and does not approve the gate or transition the stage.

## Project Controls boundary

A schedule activity may map descriptively to an Expectation (`schedule_object_id`). Schedule 100% complete cannot set deliverable maturity, approve a gate, or transition a stage.

## Digital Thread and KG

Trace where canonical relationships exist:

Lifecycle Stage → Deliverable Expectation → Bound Artifact → Requirement → Analysis → Review → Configuration → Maturity Assessment → Lifecycle Gate.

Do not fabricate links. Platform KG remains optional. KG reads stay **OFF**. Relational Digital Thread remains authority. No new graph store.

## Assurance and Review composition

Assessment JSON may carry deterministic signals (`EXPECTED_DELIVERABLE_MISSING`, `DELIVERABLE_REQUIRED_REVIEW_MISSING`, `DELIVERABLE_REFERENCES_STALE_EVIDENCE`, `DELIVERABLE_CONFIGURATION_GAP`, `DELIVERABLE_INTERFACE_COORDINATION_GAP`). These are not automatic Findings or Issues. Engineering Review remains owner of Findings. Configuration remains owner of baselines.

## Security / RLS

Tables: `engineering_deliverable_profile_settings`, `_expectations`, `_artifact_bindings`, `_assessments`, `_waivers`. Workspace membership required. Catalog settings and waivers require `engineering.admin`. Ordinary users cannot mutate governed definitions. Assessments are server-harvested; API rejects caller-authored maturity. Anonymous, cross-workspace, and cross-tenant access denied.

## UI

- `/engineering/deliverables` — expected / missing / developing / review-ready / purpose-ready / stale / by discipline / by stage / by system. Not a document register. No traffic-light score.
- `/engineering/settings/deliverables` — catalog + maturity profile version. Not a rule-code editor.
- `/engineering/lifecycle` — required/missing deliverables and gate dependence, minimally.

Commerce uses existing Engineering OS product policies. No new SKU. Not coupled to Project Intelligence entitlement.

## Tests

Crusher Expansion FEED synthetic path: missing → bind analysis → review/supporting incomplete → interface incomplete → complete harvest → purpose-ready; stale after analysis change; schedule complete vs maturity incomplete; multidisciplinary coordination; waiver overlay; FEED EXIT gate composition. Live JWT RLS against staging `rntonzigxwxcjlcsadip`.

## Limitations

- Default catalog is a small EXAMPLE FEED set, not a complete engineering deliverable library.
- Document status codes (IFR/IFA/IFC/AS_BUILT) are not interpreted as maturity in A9C. EOS-A9D adds governed project/workspace status mapping and template adoption; see `EOS_A9D_DELIVERABLE_GOVERNANCE_DOCUMENT_STATUS.md`.
- No automatic reassessment bus; explicit evaluate is sufficient.
- AAL2 / browser certification may be NOT_TESTED. MFA is not weakened.
- No DMS replacement, Primavera connector, automatic schedule maturity, universal percent complete, AI quality scoring, automatic approval, IFC authorization, lifecycle transition, real solver, Value Intelligence, new job queue, or production deployment.

EOS-A10A may consume deliverable bindings as canonical sources. Authority and freshness are visible; they do not by themselves complete Deliverable maturity. See `EOS_A10A_ENGINEERING_INFORMATION_INTELLIGENCE_FOUNDATION.md`.
