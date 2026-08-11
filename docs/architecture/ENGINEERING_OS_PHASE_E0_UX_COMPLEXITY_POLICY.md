# Engineering OS — Phase E0 UX Complexity Policy

Status: Locked (E0) · `CapabilityBasedUxHideUnavailable = true`

## Goals

- Hide platform/vendor complexity from normal engineers.
- Prefer assistant-first flows; keep structured modules for specialists.
- Reduce search, clicks, duplicate entry, and context switching.

## Capability visibility

| State | Default UX |
| --- | --- |
| Installed + entitled + healthy | Visible and actionable |
| Entitled but not installed | Hidden in primary nav; may appear in Install/Administration |
| Installed but not entitled | Hidden in primary nav; access denied on direct URL |
| Unavailable / not certified | Hidden in primary workflows; may appear on Release/certification pages with explicit labels |
| Connector-backed feature without connector | Hidden or shown only as optional enablement in Administration |

**Rule:** Do not display dead/non-clickable module cards as if they were operational GA
surfaces in primary Experience.

## Experience priority

1. **Ask Engineering OS** — default entry for most engineers when AI entitled
2. **My Engineering** — assigned work and recent context
3. **Explore** — find projects/assets/documents/registers
4. **Intelligence** — installed modules only
5. Structured `/engineering/apps/*` and registers — retained, not deleted

## Assistant behaviour constraints

- Advisory by default
- Cite evidence / abstain when evidence insufficient
- Never fabricate missing data
- Propose governed tools; do not silently mutate systems of record
- Prefer deep-links into existing records over duplicate forms

## Administration vs engineer surfaces

| Audience | May see |
| --- | --- |
| Engineer | Installed capabilities, personal work, Ask/Explore |
| Tenant admin | Install, connectors, entitlements, health |
| Certification / Release | Explicit UNAVAILABLE / NOT CERTIFIED matrices |

## Implementation note

E0 locks the policy. E1+ implements capability-based navigation filtering against
commerce/module installation snapshots without weakening server-side entitlement.
