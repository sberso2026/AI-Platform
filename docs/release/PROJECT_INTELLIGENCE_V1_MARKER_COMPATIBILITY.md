# Project Intelligence V1 — Marker Compatibility

**Phase:** 8I.1

| Marker | Status |
|--------|--------|
| `data-testid="engineering-reasoning-assistant-ready"` | **Authoritative** |
| `data-testid="project-intelligence-copilot-ready"` | **Deprecated compatibility alias** |

## Deprecation

- Alias retained for V1.0 certified behavior and existing Playwright suites.
- Do not remove in 8I.1.
- Removal criteria: automated usage analysis proves zero dependency **and**
  removal does not change certified v1.0 surfaces.
- Compatibility window: through next minor PI release after dependency proof.

## Location

Authoritative + alias both present on:
`apps/web/src/app/(platform)/engineering/apps/project-intelligence/reasoning/page.tsx`
