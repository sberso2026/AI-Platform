# EOS-A10C Information Requirements, Exchange & Handover

Purpose: establish governed Engineering Information Requirements that lead to engineering action, plus information exchange and handover intelligence. This is not a passive register or a second document store.

## Information Requirement vs Engineering Requirement

Engineering Requirement = what the engineered system or product must satisfy (FUNCTIONAL, PERFORMANCE, SAFETY, and the existing A4 catalog).

Engineering Information Requirement = what information engineers need to perform, verify, coordinate, construct, commission, or hand over work.

These domains remain separate. Digital Thread may relate them (`DEPENDS_ON`) without merging them.

## Provider / consumer

Requirements record provider and consumer as discipline, organisation, or role kinds:

- discipline to discipline
- vendor to discipline
- contractor to engineering
- engineering to construction
- construction to engineering
- commissioning to operations
- project to owner

A named person is not required. Role/discipline ownership is preferred.

RECEIVED is not ACCEPTED_FOR_PURPOSE. ACCEPTED_FOR_PURPOSE is not ENGINEERING APPROVED.

## Lifecycle information profiles

Required information varies by lifecycle stage through templates/profiles:

- CONCEPT: coarse design basis, site constraints, production requirements, major assumptions
- PREFEASIBILITY: option inputs, preliminary loads, cost/constructability inputs
- FEASIBILITY: selected concept inputs, cross-discipline information, risk-reduction data
- FEED: design criteria, equipment data, loads, interfaces, specification inputs
- DETAILED_DESIGN: final design inputs, vendor information, analysis inputs, configuration data
- CONSTRUCTION: current construction information, RFIs/TQs, field data
- COMMISSIONING: test requirements, as-built information, vendor manuals
- OPERATIONS / handover: final configuration, O&M data, design basis, commissioning evidence

Projects instantiate templates. Every project is not hardcoded.

## Work readiness

`EngineeringWorkReadinessResolver` / `resolveWorkReadiness(...)` returns:

- READY
- READY_WITH_CONDITIONS
- BLOCKED_INFORMATION_MISSING
- BLOCKED_INFORMATION_UNACCEPTED
- BLOCKED_INFORMATION_STALE
- UNKNOWN

plus required, available, missing, stale, and unaccepted information. There is no universal project readiness score. Missing information blocks Start Work only where the requirement is configured as blocking.

## Action workflow

Governed actions: Request Information, Assign Provider, Open Source, Review Information, Accept for Purpose, Reject / Request Revision, Start Engineering Work.

There is no auto-approval. AI may explain missing information and suggest required information. AI may not accept for purpose, accept handover, or infer technical correctness.

## Interface composition

Interface Intelligence continues to own the cross-discipline agreement/context. The Information Requirement owns what information must be supplied. Example: Mechanical → Structural equipment loads. The Interface object remains Interface-owned.

## Deliverable composition

Deliverables may depend on Information Requirements. Existence of information does not automatically mark a Deliverable mature, reviewed, or approved.

## Analysis composition

Analysis Request / input manifests may consume satisfied Information Requirements. A10C does not execute a real solver.

## Construction information requests

RFI/TQ, field change, site condition, and contractor clarification create engineering-information needs. EOS models the engineering context around the request. Aconex/EDMS is not replaced and no real connector is implemented.

## Handover requirements and package

Handover Information Requirements reference canonical sources (drawings, calculations, vendor manuals, test evidence). `EngineeringHandoverPackage` is a governed collection of those requirement references.

States: DRAFT, ASSEMBLING, READY_FOR_REVIEW, UNDER_REVIEW, ACCEPTED, REJECTED, SUPERSEDED.

Completeness: COMPLETE, PARTIAL, INCOMPLETE, STALE, CONFLICTED. There is no universal completeness percentage. Human/authorized workflow determines package acceptance. EOS may show missing, stale, superseded, or unaccepted information.

## Digital Thread

Reuse the existing Digital Thread. Information Requirement → Information Source → Engineering Work → Deliverable → Configuration → Handover Package. No new graph store.

## Work events

A10B `EngineeringWorkEvent` is reused: INFORMATION_REQUESTED, INFORMATION_RECEIVED, INFORMATION_ACCEPTED, HANDOVER_INFORMATION_PUBLISHED / HANDOVER_PUBLISHED, HANDOVER_PACKAGE_READY, HANDOVER_PACKAGE_ACCEPTED / HANDOVER_ACCEPTED. No new Event Bus.

## Managed repository boundary

A10B is preserved. DEFAULT_CAPTURE_POLICY = DENY. Only managed sources may automatically satisfy information requirements. An unmanaged local file cannot silently satisfy a requirement. A user may explicitly publish controlled information into an approved repository.

## A11A compatibility

A10C exposes `getRequiredInformationForWork(...)` and `resolveWorkReadiness(...)`. Example: workType FOUNDATION_CALCULATION / system CRUSHER returns design criteria, equipment reactions, geotechnical parameters, survey level, and related inputs. Calculation generation is not implemented in A10C.

## Security

Live RLS: same-workspace authorized read; cross-workspace deny; cross-tenant deny; anonymous deny. Ordinary engineers may update permitted requirement workflows in their workspace. Admin-only delete is retained for packages and requirements. Template/policy catalog remains code-governed; AAL2 is required for the settings path. A9 MFA / project-context is not reopened.

## Limitations

- No real Excel/Word/SharePoint/Aconex connectors
- No calculation, report, or specification generation
- No solver execution
- Requirement templates are code-catalogued, not a live admin editor
- Notifications remain event-compatible for A12; provider/consumer notification delivery is later
- Assurance conditions are candidate-only; no automatic Finding
- READY_FOR_CONTROLLED_PILOT remains NO
- READY_FOR_PRODUCTION remains NO
