# EOS-A13A Enterprise Connector Foundation & Microsoft 365 / SharePoint Integration

## Feature freeze

EOS-A12C certified `CORE_ENGINEERING_FEATURE_SET_COMPLETE = YES`. A13A is **CONNECT**. It does not add a new Engineering Intelligence domain, lifecycle model, work generator, review engine, change domain, graph store, Event Bus, Job system, or DMS.

A13 = CONNECT · A14 = HARDEN · A15 = PROVE · A16 = RELEASE.

## Connector architecture

External system owns the source. EOS stores engineering context, references, authority policy, provenance, relationships, and workflow state.

```
SharePoint DriveItem / ListItem
        ↓
External Source Identity (site + drive + item)
        ↓
ManagedEngineeringRepository (allowlisted)
        ↓
EngineeringInformationRef
        ↓
engineering context / Work Event / Attention
```

Source content remains externally owned unless an engineer explicitly publishes an EOS-generated artifact through a governed action.

## Existing infrastructure reused

| Capability | Classification |
|---|---|
| Integration Registry / E4 connector adapters | EXTEND |
| Platform Secrets service | REUSE |
| JobService | REUSE (`engineering.m365.sharepoint.sync`) |
| Event Bus | REUSE (A10B work-event envelope) |
| ManagedEngineeringRepository | EXTEND |
| EngineeringWorkEventNormalizer | COMPOSE |
| EngineeringInformationRef / A10A | COMPOSE |
| Search | COMPOSE |
| Audit / Telemetry | REUSE |
| Webhooks | DEFERRED — JobService delta sync is the A13A path |

No second enterprise-integration framework.

## Microsoft identity / authentication

Modern OAuth 2.0 client-credentials (application) authentication. Username/password, stored user passwords, screen scraping, browser automation, and basic auth are not used.

Staging may use a client secret **only** through the existing Secrets service (`credential_secret_id` is a reference). Certificate credentials and managed identity are supported as `auth_mode` values. Access tokens, refresh tokens, client secrets, and certificate private keys are never stored on `ManagedEngineeringRepository` or connection rows.

## Least privilege

Preferred Microsoft permission: **Sites.Selected** (application) on explicitly approved SharePoint sites/libraries. Optional write on the same approved site for governed artifact publication.

Not required and not used: tenant-wide `Sites.Read.All`, `Files.Read.All`, `Mail.Read`, `ChannelMessage.Read.All`, or personal OneDrive access.

A13A must not access every SharePoint site, every user's OneDrive, every mailbox, or every Teams channel.

## Secrets

Connection configuration stores Microsoft tenant id, application/client id, repository identifiers, and the Secrets reference. Secret values remain in Secrets. Secret scan must pass.

## Managed repository boundary

A10B remains authoritative.

- `DEFAULT_CAPTURE_POLICY = DENY`
- `ALLOWLISTED_REPOSITORIES_ONLY = YES`

A Microsoft repository becomes visible only after explicit registration as `ManagedEngineeringRepository` with `repository_type = SHAREPOINT_LIBRARY`. Unregistered sites are not ingested. Local Windows paths are not a trust boundary.

## Registration, approved root, project binding

An admin registers:

- connection (tenant, application, secret reference)
- site id, drive/library id
- optional approved folder/root item id
- display name, enabled, capture policy, content access policy
- canonical EOS project binding

Each managed scope has explicit project binding. Project A folder cannot produce EngineeringInformationRefs under Project B. Shared corporate sources require explicit TENANT/WORKSPACE scope, not inference from the same SharePoint site.

## Source identity and reference-first ingestion

Canonical identity is Microsoft `siteId + driveId + itemId`. Filename/path is display metadata. Rename does not create a new engineering source when Microsoft identity is stable.

Default ingestion is metadata-first: external identity, name, governed web URL, path within approved root, mime, size, eTag/cTag, timestamps, editor metadata where permitted, repository id, sync provenance. Binaries are not duplicated into EOS.

## Content access policy

`METADATA_ONLY` (default) · `ON_DEMAND_CONTENT` · `INDEX_APPROVED_TYPES`.

Content is not downloaded merely because metadata is visible. Approved indexable types: DOCX, XLSX, PPTX, PDF, text/csv. CAD/BIM (`DWG`, `DGN`, `RVT`, `IFC`) remain metadata/reference only. Macros are not executed.

## Personal OneDrive, email, Teams, Outlook

- `PERSONAL_ONEDRIVE_ACCESS = PROHIBITED` — no `/me/drive`
- `PERSONAL_EMAIL_ACCESS = PROHIBITED` — no user inbox scan
- Teams: **CONTRACT_ONLY** — approved project channel later; no chat ingestion
- Outlook: **CONTRACT_ONLY** — approved project mailbox or explicit Add to EOS

## Sync

Bounded initial discovery uses pagination inside the approved root only. Incremental Graph delta is used when a cursor exists. Stale/invalid delta marks `RESYNC_REQUIRED` and re-enumerates the approved repository only.

Webhook/change notifications are **DEFERRED**. JobService performs initial, delta, retry, and resync jobs.

Replay is idempotent (`source_system + source_event_id`). Out-of-order Graph events cannot overwrite a newer known `occurred_at`.

Rename / move-within-scope keep identity and project binding. Move outside approved root marks `MOVED_OUTSIDE_SCOPE` and stops following the item. Deletion marks `DELETED`/`UNAVAILABLE` and preserves historical Work Plan / Review / Decision provenance.

Throttling respects `Retry-After` with bounded exponential backoff and surfaces `RATE_LIMITED`. Transient network failure marks `DEGRADED` and does not delete managed state. Invalid authentication marks `AUTHENTICATION_REQUIRED`. Disabled repositories stop automatic ingestion.

## A10A / A10B / A12B composition

SharePoint presence creates/updates an `EngineeringInformationRef` with `eligibility = UNVERIFIED`. Presence does **not** set authoritative/approved/current. Authority remains `InformationAuthorityPolicy`. A9D document-status mappings are not hard-coded.

Meaningful changes normalize to existing Work Event types (`SOURCE_CREATED`, `SOURCE_REVISED`, `SOURCE_PUBLISHED`). Sync heartbeats, permission lookups, and polling cycles emit nothing. A10B deterministic materiality is reused so a source revision can become one Attention Item, not a notification storm. Connector events compose with A12B Attention after authority/work-context evaluation — engineers see engineering impact, not “SharePoint delta item changed”.

## Open managed source and SSRF

Workbench **Open Governing Source** re-authorizes server-side and returns only connector-stored Microsoft web URLs (or the EOS information route). Caller-supplied URLs are rejected. Graph HTTP is limited to `graph.microsoft.com` and `login.microsoftonline.com` with redirect validation. Open redirects and metadata hosts are blocked.

## Artifact publishing and round-trip

Explicit **Publish to Managed Repository** writes an EOS-generated artifact into the approved library/folder from repository policy, not from a browser-supplied path. Safe A11B filenames are reused. Silent overwrite is not the default. SharePoint version history remains repository history; EOS provenance remains engineering context. Publication is not engineering approval.

Target workflow: generate → publish → external edit → delta → InformationRef / Work Event → Work Plan / Review may become stale → Attention if material.

## Company / project template binaries

Approved `COMPANY_OFFICIAL` / `PROJECT_CLIENT_APPROVED` templates may reference a managed SharePoint item. Metadata stays EOS-governed. Binary is retrieved on demand, OpenXML-validated, and never copied into a new Postgres `content_base64` field. `OFFICIAL_TEMPLATE_REQUIRED` still fails closed (`TEMPLATE_UNAVAILABLE`). SME tenants without Microsoft 365 continue to use `EOS_DEFAULT`.

## Admin and engineer UX

Admin: `/engineering/settings/integrations` (Microsoft 365 / SharePoint) and `/engineering/settings/work-context` (Managed repositories). AAL2 is required for connection registration, repository scope, project binding, template-source registration, and manual resync.

Normal engineers use `/engineering/work` — Governing source **Open** and generated report **Publish to Managed Repository**. Graph terminology is not required.

## Security, RLS, malware, binary storage

Live RLS covers connections, scopes, sync state, external source refs, and connector audit. Cross-tenant connection use is denied. Unregistered sites are not ingested.

`NEW_CONTENT_BASE64_USAGE = NO`. `CONNECTOR_BINARY_DUPLICATION = NO`. Existing generated-artifact `content_base64` risk remains **HIGH**; migration stays A13C/A14A.

Hosted ClamAV remains unavailable. EOS inbound upload stays fail-closed. Outbound EOS-generated publication uses the current generated-artifact trust model. SharePoint does not close the malware requirement. Future inbound connector/content flows need malware scanning or an explicit enterprise-source trust policy before production.

## Performance and scale

Connector supports pagination, incremental sync, bounded jobs, resume/cursor, and backoff. Entire libraries are not loaded into memory. Claims are limited to bounded test repositories.

## Object storage / malware preparation (handoff)

Future object storage must cover generated artifacts, template binaries, large-file handling, external reference caching, retention, and signed downloads. A13A does not implement a new storage platform.

## Live connection certification

If staging Microsoft credentials and an approved test site are absent: `LIVE_SHAREPOINT_CONNECTION = NOT_TESTED`. Implementation is certified through contracts and controlled mocks. A real connection is not faked.

## A13B handoff

Extend this certified connector foundation to governed engineering/construction systems (EDMS/Aconex-style RFI/TQ/document workflows, BIM/CAD references, planning/schedule sources) while retaining source ownership, project isolation, managed-repository scope, and Feature Freeze.
