# Inspection Intelligence — Mobile Integration

**Version:** `0.6.0-mobile-product`

Inspection Intelligence is the first certified consumer of the Engineering Mobile SDK.

## Consumes

- Engineering Module / Domain / Workflow / Mobile SDKs
- Inspection Pack SDK
- Platform Files, Audit, Notifications, Event Bus, Entitlements
- Engineering OS Shared Domain (asset/location references only)

## Does not fork

Domain models, workflow state machines, evidence, identity, permissions, audit, notifications,
file storage, reporting, commerce, AI runtime.

## Mobile shell

Single responsive host: desktop, landscape/portrait tablet, phone.
Marker: `data-testid="inspection-intelligence-mobile-ready"`.

## Offline

`offlineSyncImplemented = false`. Connectivity and draft states are sync-ready for Phase 9G.
