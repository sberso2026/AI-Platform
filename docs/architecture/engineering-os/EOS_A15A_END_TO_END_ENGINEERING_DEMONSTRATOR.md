# EOS-A15A End-to-End Engineering Demonstrator

Target: STAGING / NON-PRODUCTION (`rntonzigxwxcjlcsadip`).  
Mode: **DEMONSTRATION_ONLY**. This is not a live engineering pilot, production trial, or certified design automation.

READY_FOR_PRODUCTION = NO.

## Scenario

**Crusher Expansion Demonstrator** — Crusher Support System / crusher-area engineering (mining / process-plant EPCM). Reuses the existing A12C / A11A Crusher Support fixtures (`proj-crusher-feed`, `sys-primary-crushing`) rather than a second test universe.

Disciplines actually used: Process / Mechanical, Structural, Civil / Geotechnical. Electrical and piping are not added merely to look comprehensive.

Environment label: DEMONSTRATION / NON-PRODUCTION.

## Data classification

Every demonstrator input is one of:

- SYNTHETIC_DEMONSTRATION_DATA
- ENGINEER_PROVIDED_FIXTURE
- EOS_GENERATED_DRAFT
- HUMAN_CONFIRMED_DEMONSTRATION_DECISION
- CONTROLLED_FIXTURE_NOT_USER_UPLOAD

Numerical values (loads, options scores, 75 mm field move) are synthetic demonstration data. They are **not** EOS-certified calculation output, code compliance, or design adequacy.

## Engineering story (certified composition)

1. Concept — client requirement to support a new crusher package; open geotechnical / vendor-load information.
2. Option Study — three alternatives (steel frame, concrete substructure + steel superstructure, modular). EOS shows trade-offs. EOS does **not** choose a winner.
3. Human Decision — Option A recorded as HUMAN_CONFIRMED_DEMONSTRATION_DECISION.
4. Concept → PFS / Feasibility — inherited requirements, decisions, interfaces; open assumptions remain VALIDATE, not facts.
5. FEED — Mechanical reactions, geotechnical bearing, structural criteria, survey. Structural work waits on Mechanical/Geotechnical (`WAITING_ON_OTHERS` → `RECENTLY_READY` / `DO_NOW`).
6. FEED Work Plan + artifacts — Design Report (COMPANY_OFFICIAL), Specification, EXAMPLE_ONLY workbook (not for design acceptance), Option Study PPTX. New binaries go to OBJECT_STORAGE.
7. Pre-Issue Review — deterministic conditions, human disposition, historical rerun preserved, no automatic approval.
8. Vendor load revision (synthetic Rev C → Rev D) — Work Plan fingerprint stale; previous Review remains historical; Impact Assessment finds interface / analysis / workbook / drawing / deliverable / review candidates. Human confirms selected impacts and marks an unrelated drawing NOT_IMPACTED.
9. Detailed Design — inherited context. SPACE GASS / real solver remains NOT_APPLICABLE.
10. Construction — governed current drawing, not “latest file”. RFI: anchor bolt / reinforcement clash. Context assembled from query, drawings, calculation, interface, configuration. Field-change impact does not choose a technical solution. RFI response is DRAFT FOR ENGINEER REVIEW, then Pre-Issue Review. No autonomous issue.
11. Commissioning — test/procedure context, open punchlist condition, query without automatic acceptance.
12. Handover — package with available / missing / stale / unaccepted information. Handover DOCX via template resolver + object storage. Human acceptance required.
13. Late change — handover completeness becomes STALE; Digital Thread explains why.
14. Operations reference — Crusher Support Structure / CR-101 traces to requirement, decision, design artifact, configuration, commissioning evidence, change history. Not an Asset Management product.

## Security / readiness carry-forward

A14B blockers are **not** reclassified as PASS:

- HUMAN_AAL2_GATE BLOCKED
- AUTHENTICATED_BROWSER_HITL / MULTI_PROJECT / LIFECYCLE NOT_TESTED
- HOSTED_MALWARE_SCANNER BLOCKED → returned user upload DISABLED
- DEPENDENCY_POLICY_GATE BLOCKED (expired exceptions not auto-renewed)

Private object storage, RLS, IDOR, service-role boundary, template security, Secrets, signed downloads, and Feature Freeze remain in force.

## Known limitations

- Browser HITL not completed (AAL2).
- Native Office open NOT_TESTED in this phase.
- No hosted malware; no untrusted returned-file round-trip.
- Soak/memory from A14B remain limited; A15A does not claim long-term stability.
- Live connectors, real solver, EXAMPLE_ONLY calculation for design acceptance, PDF export: NOT_APPLICABLE.

## Result

DEMONSTRATOR_READY = YES (synthetic end-to-end composition).  
CONTROLLED_PILOT_READY = NO.  
A15B is not eligible until pilot gates close.
