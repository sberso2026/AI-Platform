# EOS 3 — Proposed-to-Installed Asset Continuity

`EOS_PROPOSED_TO_INSTALLED_CONTINUITY=PASS`  
`EOS_ASSET_IDENTITY_CONTINUITY=PASS`

## Configuration states

Representative (not mandatory sequence for every asset):

`PROPOSED` → `SELECTED` → `DESIGNED` → `PROCURED` → `INSTALLED` → `COMMISSIONED` → `OPERATING` → `MODIFIED` → `RETIRED`

## Identity

`stableAssetId` is retained across configuration transitions. Digital thread must not break merely because lifecycle phase changes.

## Separation from engineering maturity

| Concept | Example |
| --- | --- |
| Asset configuration state | `INSTALLED` / `OPERATING` |
| Work Package maturity | `Detailed Engineering` / `Construction` |

`EOS_ASSET_STATE_MATURITY_SEPARATION=PASS`

Asset modeling does not grant engineering approval authority.
