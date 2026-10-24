# EOS-A13B Engineering, EDMS, Construction & Planning Connector Integration

FEATURE_FREEZE remains intact. A12C established `CORE_ENGINEERING_FEATURE_SET_COMPLETE = YES`. A13 is CONNECT. A13B does not introduce a new engineering intelligence domain, RFI/TQ module, Change domain, Review engine, Lifecycle domain, DMS, Event Bus, Job system, or graph store.

## Connector architecture reuse

A13A remains the certified Microsoft 365 / SharePoint connector. A13B extends that foundation with a generic `EngineeringExternalConnection` / `EngineeringExternalProjectBinding` / `EngineeringExternalObjectRef` composition. Secrets, JobService (`engineering.external.connector.sync`), Event Bus, Audit, Telemetry, ManagedEngineeringRepository, A10B Work Events, and A10A InformationRef are reused.

Vendor Adapter → normalized External Object → Managed Repository / Project Mapping → domain composition → EngineeringWorkEvent → Attention.

## EDMS integration

Aconex-style workflows are represented as normalized objects: DOCUMENT, DRAWING, REVISION metadata, TRANSMITTAL, RFI, TQ, CORRESPONDENCE, FIELD_CHANGE. Canonical EOS objects are reused. No `AconexRFI` table.

## Aconex boundary

LIVE_ACONEX_CONNECTION = NOT_TESTED. The adapter is CONTRACT_ONLY and FIXTURE_CERTIFIED. No undocumented endpoints, screen scraping, or browser automation.

## RFI/TQ ingestion

External RFI/TQ compose into existing A11E construction workflow and A11A `RFI_TQ_RESPONSE` Work Plans. Attention (A12B) projects DO_NOW Prepare Engineering Response. Engineers see `RFI-142` and `External system: Aconex`, not REST paths.

## Response publication

EOS may prepare a draft using A12A template resolution and A11D Pre-Issue Review. EOS must not automatically issue, submit, close, or transmit. Publication requires human confirmation, bounded write policy, project binding, and current external etag/version. Mismatch fails `EXTERNAL_STATE_CHANGED`. AI cannot issue or close external records.

## External concurrency

Newer delayed events cannot overwrite newer known state. Out-of-order records are ignored. Retries are idempotent on identity + fingerprint.

## Transmittals

Transmittals are delivery/publication evidence. They are not engineering approval. `transmittalIsNotApproval` remains true.

## Field changes

External field change / site instruction / deviation maps into A11E Change/Impact. Potential impact only. No second Change domain. No computer vision. No personal mobile photo libraries.

## BIM/CAD references

METADATA_ONLY. MODEL, DRAWING, SHEET, FILE, VERSION, ISSUE/CLASH references. No DWG/RVT/DGN geometry engine. Open Current Drawing / Open Model uses stored governed web links after server authorization. Issue/clash is a candidate for Impact Assessment, not automatic resolution.

## Planning / schedule integration

External planning system owns activity, milestone, WBS, dates, and logic. EOS is a read-only context consumer. schedule 100% does not auto-complete an engineering Deliverable. Needed-by dates may inform Information Requirements / Attention only where governed. No project-controls engine. LIVE_PLANNING_CONNECTION = NOT_TESTED.

## Specialist tool references

ETABS, SAP2000, STAAD, PLAXIS, CAESAR II, ETAP, HYSYS, and SPACE GASS compose with External Tool Governance and A7B Analysis Request/Result file references. A7C remains DEFERRED_EXTERNAL_DEPENDENCY. SPACE GASS 14.2 Trial: API_AVAILABLE = NO, AUTOMATION_PERMISSION = REQUIRES_CONFIRMATION, REAL_SOLVER_EXECUTION = NOT_CERTIFIED, PRODUCTION_USE_PERMITTED = NO. No GUI automation.

## Source ownership

External system owns the external object. EOS stores identity, project/workspace binding, references, provenance, relationships, workflow state, authority context, and derived Attention.

## Managed Repository

DEFAULT_CAPTURE_POLICY = DENY. Allowlisted managed repositories only. Unregistered external projects are not ingested.

## Project binding

Admin-governed mapping. No AI project guessing. Project A external objects never resolve under Project B.

## Event normalization and Attention

Existing A10B source-event map is reused (`RFI_CREATED`, `CAD_DRAWING_REVISED`, `CAD_DRAWING_ISSUED` only when vendor mapping proves issue status). A12B remains a derived projection.

## Template governance

A12A resolver cannot be bypassed. PROJECT_CLIENT_APPROVED, then COMPANY_OFFICIAL, then EOS_DEFAULT.

## Binary boundary

A13B_BINARY_DUPLICATION = NO. NEW_CONTENT_BASE64_USAGE = NO. ARTIFACT_BINARY_STORAGE_RISK remains HIGH. A13C/A14A must migrate generated artifact and template binaries from `engineering_generated_artifacts.content_base64` to object storage.

## Malware boundary

HOSTED_CLAMAV remains UNAVAILABLE. Metadata-only/reference ingestion proceeds without downloading binaries. Fail-closed inbound binary processing is unchanged.

## Security / RLS / AAL2

Live RLS on connections, bindings, object refs, and sync state. Admin mutate / engineer read. Cross-workspace deny. Cross-tenant deny. Anonymous deny. Connector administration and enabling WRITE reuse existing AAL2. No new MFA.

## Live vendor certification

| Connector | Contract | Fixture | Live read | Live write |
| --- | --- | --- | --- | --- |
| SharePoint | IMPLEMENTED | FIXTURE_CERTIFIED | NOT_TESTED | NOT_TESTED |
| Aconex/EDMS | CONTRACT_ONLY | FIXTURE_CERTIFIED | NOT_TESTED | NOT_TESTED |
| ACC/BIM | CONTRACT_ONLY | FIXTURE_CERTIFIED | NOT_TESTED | NOT_TESTED |
| P6/Planning | CONTRACT_ONLY | FIXTURE_CERTIFIED | NOT_TESTED | NOT_TESTED |
| SPACE GASS | CONTRACT_ONLY | FIXTURE_CERTIFIED | NOT_TESTED | NOT_TESTED |

A13A_LIVE_SHAREPOINT_ADDENDUM = NOT_TESTED (no approved Microsoft staging credentials). HUMAN_AAL2_GATE remains incomplete if MFA is still waiting.

## Connector matrix

See `CONNECTOR_CERTIFICATION_MATRIX` in `packages/engineering-os/src/connectors/engineering/types.ts`. Boolean "connected" is not used to hide incomplete capability.

## A13C handoff

EOS-A13C Platform Consolidation, Connector Hardening & Binary Storage Preparation: consolidate post-feature-freeze connectors, eliminate duplicate integration paths, establish the production object-storage migration plan, harden large-file/reference handling, and prepare A14 security/pilot-readiness without new engineering product domains.
