# EOS-A15A Demonstrator Evidence Manifest

No secrets. No binary duplication. Object contents are not logged.

Canonical objects reuse existing Crusher Support / A11E fixtures.

## Identity

| Field | Value |
|---|---|
| Mode | DEMONSTRATION_ONLY |
| Classification | SYNTHETIC_DEMONSTRATION_DATA |
| Tenant | tenant-crusher-feed |
| Workspace | workspace-crusher-a1 |
| Project | proj-crusher-feed (Crusher Expansion Demonstrator) |
| System | sys-primary-crushing |
| Second project (isolation) | proj-a11e-beta |
| Named users (pilot, not enabled) | cert-er-a1, cert-er-a-admin |

## Workflow evidence

| Step | Lifecycle | Object | Result |
|---|---|---|---|
| Concept study | CONCEPT | EngineeringWorkPlan EWT-CONCEPT-STUDY | PASS — gaps include geotechnical |
| Concept artifact | CONCEPT | TECHNICAL_MEMORANDUM OBJECT_STORAGE EOS_DEFAULT | PASS |
| Option study | PREFEASIBILITY | steelConcreteOptions A/B/C | PASS — no automatic winner |
| Human option Decision | PREFEASIBILITY | dec-human-demo-1 → opt-a | PASS |
| PFS/Feasibility continuity | PFS / FEASIBILITY | inherited req-client-12mtpa, if-cr-cv-01 | PASS — assumptions VALIDATE |
| Information requirements | FEED | Structural criteria, Mechanical reactions, Geotech bearing, Survey | PASS BLOCKED → READY |
| FEED Work Plan | FEED | DESIGN_CALCULATION | PASS |
| FEED artifacts | FEED | XLSX EXAMPLE_ONLY, DOCX COMPANY_OFFICIAL, SPECIFICATION | PASS OBJECT_STORAGE |
| Cross-project object denial | FEED | assertObjectKeyAuthorization vs proj-a11e-beta | PASS OBJECT_KEY_SCOPE_DENIED |
| Pre-Issue Review + rerun | FEED | historical review ids preserved | PASS — engineeringApproved false |
| Vendor load change | FEED | Rev D fingerprint | PASS STALE + refresh |
| Impact | DETAILED_DESIGN_CHANGE | chg-mech-load 1250→1380 kN synthetic | PASS |
| Human confirmation | — | an-024 CONFIRMED_IMPACT; s-notes NOT_IMPACTED | PASS |
| Detailed Design | DETAILED_DESIGN | inherited decisions/interfaces | PASS |
| Solver | — | SPACE GASS NOT_CERTIFIED | NOT_APPLICABLE |
| Construction RFI | CONSTRUCTION | rfi-anchor-75 | PASS context assembled |
| Field change | FIELD_CHANGE | 75 mm move — no technical solution chosen | PASS |
| RFI response | CONSTRUCTION | RFI_RESPONSE DRAFT FOR ENGINEER REVIEW | PASS |
| RFI Pre-Issue | CONSTRUCTION | not issued / not answered | PASS |
| Commissioning | COMMISSIONING | open punchlist condition | PASS |
| Handover | COMMISSIONING | EWT-HANDOVER + TECHNICAL_MEMORANDUM | PASS |
| Late change | HANDOVER | ho-pkg stale | PASS |
| Operations reference | OPERATIONS | CR-101 | PASS — not Asset Management |
| Digital Thread | cross-lifecycle | explainWhyRelated / explainWhyAffected / Ask EOS deterministic | PASS |
| My Engineering Day | — | WAITING_ON_OTHERS, RECENTLY_READY/DO_NOW, REVIEW_REQUIRED, DECISION_REQUIRED | PASS |
| Multi-project | — | Crusher + proj-a11e-beta; unauthorized excluded | PASS |

## Artifact manifest (types)

Generated in `eos-a15a-demonstrator.test.ts` (in-memory object store; SHA-256 and byte size asserted at runtime, not copied here):

| Type | Template class | Storage |
|---|---|---|
| TECHNICAL_MEMORANDUM (concept) | EOS_DEFAULT | OBJECT_STORAGE |
| OPTION_STUDY_PRESENTATION | EOS_DEFAULT | OBJECT_STORAGE |
| CALCULATION_WORKBOOK | EOS_DEFAULT EXAMPLE_ONLY | OBJECT_STORAGE |
| DESIGN_REPORT | COMPANY_OFFICIAL | OBJECT_STORAGE |
| SPECIFICATION | EOS_DEFAULT | OBJECT_STORAGE |
| RFI_RESPONSE | EOS_DEFAULT | OBJECT_STORAGE |
| TECHNICAL_MEMORANDUM (handover) | EOS_DEFAULT | OBJECT_STORAGE |

Review status for all generated drafts: HUMAN_REQUIRED. No autonomous approval.

## Timings

Recorded as software execution time in the A15A unit demonstrator (not human interaction time; browser HITL not available). Values vary by machine. Classes:

- find governing information / create Work Plan
- generate XLSX / DOCX
- authorized object download
- Pre-Issue Review
- Impact Assessment
- RFI response generation
- Handover summary

These timings are **not** a productivity or ROI claim.

## Office native HITL

NOT_TESTED. Do not treat generated OpenXML validity as native Word/Excel/PowerPoint evidence.

## Returned upload

BLOCKED. Controlled internal generated artifacts are CONTROLLED_FIXTURE_NOT_USER_UPLOAD, not a pilot round-trip.
