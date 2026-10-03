# EOS-A16A Controlled Pilot Connectivity + Enterprise Integration Baseline

Phase: **CONNECT** only. V5B Structural Work Generator remains closed at `2ceae81aca55f89992a1897d449eedbc2920f92d`. This gate inventories and classifies existing A13/A14 connectivity. It does not rebuild connectors, start HARDEN, or reopen calculation / MTO / Design Report / REPORTBIND / PREISSUE-BIND.

## Architectural principle

Repository determines visibility. Context determines meaning. Events determine workflow. Humans determine engineering judgment. External systems remain systems of record. EOS stores governed references and does not copy repository authority.

Canonical source events already exist: `SOURCE_CREATED`, `SOURCE_REVISED`, `SOURCE_PUBLISHED`, `INFORMATION_RECEIVED`, `INFORMATION_ACCEPTED`. A16A does not invent duplicate `SOURCE_DISCOVERED` semantics.

## Profile A minimum connection set

Mandatory for a controlled Profile A pilot that consumes a real enterprise source:

- Private object storage (A14A)
- Internally generated artifact flow (generation + authorized Office handoff)
- Managed repository registration + Engineering Information source refs
- Pre-Issue source-present / missing / stale / unaccepted conditions
- SharePoint / Microsoft 365 **read-first** path (A13A fixture-certified)

Optional: generic EDMS, BIM, planning, SharePoint publish.

Deferred: hosted malware scanner, returned external artifact round trip, live SharePoint Graph, Teams, Outlook, SpaceGass solver, Office XML inspection of object-stored binaries.

SharePoint is the only implemented real enterprise system-of-record path. It is not mandatory merely because EDMS/BIM/planning adapters exist. Profile A Core EOS still operates on EOS-local sources without live Graph.

## Live SharePoint

`LIVE_SHAREPOINT_TEST = BLOCKED_EXTERNAL_CONFIGURATION`.

A13A implements repository discovery, metadata, managed registration, on-demand content, revision/provenance, and authorization against `MockGraphPort` / `LiveGraphPort`. Default write policy remains `READ_ONLY`. Personal OneDrive and personal email remain prohibited. No approved live Microsoft credentials or test site are wired in this repository. Missing credentials are not a product failure.

## Binary content and object storage

External files use the certified storage/reference model (`OBJECT_STORAGE` / `EXTERNAL_MANAGED`). Dual-write is not restored. Public buckets remain forbidden. Object keys are tenant / workspace / project scoped. Connector ingestion must not emit public artifact URLs.

## Office handoff vs inspection

Office handoff of generated DOCX/XLSX/PPTX is certified through authorized download / short-lived signed access. Pre-Issue `inspectArtifactTransient` still decodes `contentBase64`. A bounded adapter could call `ArtifactBinaryStore.openRead(pointer, auth)` without duplicating storage. That adapter is **not** implemented in A16A because it is not required for the minimum internally generated pilot path.

## Malware and returned artifacts

Contract remains `packages/engineering-review/src/malware-scan.ts`: `RTB_REVIEW_CLAMAV_URL`, POST raw bytes, `application/octet-stream`, 200 + OK/CLEAN => CLEAN, FOUND/INFECTED => INFECTED, failures fail closed.

Authentication model: **unauthenticated HTTP POST**. Enterprise deployment requires a private network / non-public endpoint before the scanner can be considered hosted. A16A does not deploy a scanner.

Internally generated artifact flow is ready. Returned external artifact flow stays disabled until hosted scanning is proven.

## Schema

No new document, repository, source, or binary-storage authority. No migration. No RLS change.
