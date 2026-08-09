# Engineering Model Interoperability — Existing Footprint (Phase 13A)

Status: interop_discovery · Inventory only · **Do not modify** `packages/digital-twin/**`

## Digital Twin V1 pin

| Item | Value |
| --- | --- |
| Package | `@rtb/digital-twin` `1.0.0` |
| Tag | `digital-twin-v1.0.0` |
| Commit | `a94425ed009ca087c2f44c9d3757c0c82bd936b1` |

## Solver / tool framework already present

| Path | Role |
| --- | --- |
| `packages/digital-twin/src/domain/solvers/engineering-solver-adapter.ts` | Common `EngineeringSolverAdapter` contract |
| `packages/digital-twin/src/domain/solvers/calculix-adapter.ts` | First real adapter — CalculiX **linear_elastic_static** only |
| `packages/digital-twin/src/domain/simulation-external-solver-stubs.ts` | `RESERVED_EXTERNAL_SOLVER_ADAPTERS` reserved stubs |
| Four-layer qualification | method / provider / application / execution |
| ETF ownership | `platform_intelligence` (existing Engineering Tool Framework) |

## Reserved external solver stubs (document only)

From `RESERVED_EXTERNAL_SOLVER_ADAPTERS` (without modifying DT):

`ansys`, `abaqus`, `opensees`, `openfoam`, `sap2000`, `etabs`, `staad`,
`spacegass`, `nastran`, `comsol`, `other_external`

All remain `status: "reserved"`, `implemented: false`, `activatable: false`.

## Certified execution today

- **CalculiX** is the only certified real external solver execution path in Digital Twin V1
- Capability: linear-static (`linear_elastic_static`) only
- Phase 13A must **reuse** this framework — not duplicate it

## Representation / model touchpoints (existing)

- Twin representation elements may carry external element ids (e.g. IFC GUID) as
  thin references — not a production IFC ingestion pipeline
- No dedicated `packages/engineering-model-interoperability` existed before 13A

## Out of scope for this inventory phase

- No production ETABS / SPACE GASS / SAP2000 / Revit / Navisworks / IFC adapters
- No batch migrations for interop product tables
- No Phase 13B runtime
