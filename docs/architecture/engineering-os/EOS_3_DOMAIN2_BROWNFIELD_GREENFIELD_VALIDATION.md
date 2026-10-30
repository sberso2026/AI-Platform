# EOS 3 — Domain 2 Brownfield & Greenfield Validation

## Brownfield — PILOT-001 / WP-STR-004

`PILOT_001_ASSET_SYSTEM_CONTEXT=PASS`

| Element | Value |
| --- | --- |
| Facility | Synthetic Process Plant |
| Area | Process Area |
| System | Process Equipment Support |
| Primary Asset | PLT-201 existing steel-framed platform / support structure (`INSTALLED`) |
| Related Asset | New process equipment module (`DESIGNED`) |
| Component (optional) | Beam B23 with proposed section change |
| WP maturity | Detailed Engineering (≠ asset INSTALLED) |
| Disciplines | Structural lead; Mechanical participating — others not auto-added |

Project lifecycle history (e.g. P0) preserved.

## Greenfield — proposed pump package

`EOS_GREENFIELD_PROPOSED_ASSET_SCENARIO=PASS`

| Element | Value |
| --- | --- |
| Facility | New Processing Facility (`PROPOSED`) |
| System | Cooling Water (`PROPOSED`) |
| Asset | Pump P-101 (`PROPOSED` → `DESIGNED`) |
| Identity | `AST-P-101` retained across state change |

## Systems & Interfaces compatibility

Existing System objects remain engineering functional definitions.  
Interfaces remain typed engineering interfaces.  
Domain-2 context overlays typed location/functional/physical relationships without replacing those semantics.

`EOS_EXISTING_SYSTEM_INTERFACE_REGRESSION=PASS`  
`EOS_PROJECT_TO_ASSET_MODEL_PRESERVED=YES`
