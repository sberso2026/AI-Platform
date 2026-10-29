# Digital Twin — Solver License Governance (Phase 12I)

## CalculiX (ccx)

CalculiX is distributed under the **GNU General Public License (GPL)**.

### Obligations (summary — not legal advice)

- Twin **adapters** spawn CalculiX as an **external process**; Twin does not embed
  CalculiX source into proprietary blobs.
- Solver binaries are **not** stored in Digital Twin product tables (Platform Files refs / hashes only).
- Downstream distributors who convey CalculiX itself must honor GPL source/license terms.
- Twin documentation must remain truthful: we provide an **adapter**, not a rebranded FEA product.

### Metadata

| Field | Value |
| --- | --- |
| `licenseFamily` | `open_source_gpl` |
| `solverId` | `calculix` |
| `adapterId` | `calculix-ccx-adapter` |
| Commercial secrets in CI | **none** |

### Reserved commercial solvers

ANSYS / Abaqus / SAP2000 / ETABS / STAAD / SpaceGass remain reserved stubs —
no license keys, no silent activation, no binary storage in Twin tables.
