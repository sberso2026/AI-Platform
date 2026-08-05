# Cortex AI — Data Ownership

**Phase:** 7A  
**Rule:** Cross-domain references use typed IDs and events. Do not duplicate authoritative records.

## Platform Core owns

- Tenants, users, memberships, roles
- Workspaces
- Subscriptions, licences, seats
- OS / application installations
- Integrations, API keys, connector configuration
- Audit, platform events
- AI governance (models, prompts, policies, cost)
- Shared knowledge graph / memory **infrastructure**
- Marketplace catalogue metadata and plugin lifecycle

## Engineering OS owns

- Engineering projects, assets, registers
- Engineering document metadata (Core)
- Engineering timelines and domain activity
- Engineering-specific workflows that are not Platform services

## Project Intelligence owns

- Intelligence derivatives and mappings approved for PI
- Documents / Meetings features under PI (sessions, transcripts, proposals, review items, minutes drafts, evidence)
- PI does **not** auto-write Engineering Core without human review

## Connectors

Shared connector **framework and configuration** are Platform. Provider payloads normalize into domain contracts owned by the consuming application (e.g. PI Meetings transcript model).

## Unsafe / ambiguous (document only — no destructive move in 7A)

| Item | Status |
|------|--------|
| Commerce catalog keys naming Engineering apps inside `platform-core` adapters | Legacy / misplaced — document; gate nav by install |
| Static `OPERATING_SYSTEMS` “installed” defaults | Corrected to catalog `available` + install-derived status |
| `meeting_intelligence` registry stub | Keep disabled; not Platform Core domain data |

Do not move data destructively during Phase 7A.
