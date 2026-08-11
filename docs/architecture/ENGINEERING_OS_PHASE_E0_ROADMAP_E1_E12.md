# Engineering OS — Phase E0 Roadmap (E1–E12)

Status: Planning baseline (E0) · Does not certify future phases

| Phase | Theme | Outcomes (high level) | Must preserve |
| --- | --- | --- | --- |
| **E0** | Architecture & product contract | ADR, layers, SoR, connectors, profiles, UX policy, roadmap | V1 freezes |
| **E1** | Experience foundation | Ask / My / Explore / Intelligence shells; capability-based nav hide | Entitlements |
| **E2** | Ask Engineering OS MVP | Advisory assistant over native context + abstention/evidence | No fabrication |
| **E3** | Canonical Engineering Context & Relationship Model | Object refs, external identity mapping, provenance-backed relationships, bounded context resolver, E2 Ask enrichment | No second KG; no PI/II/connector ownership; no fabricated future domains. (Earlier draft labelled E3 “My Engineering” — superseded.) |
| **E4** | Explore & native search | Unified search/RAG across shared domain | Zero-connector |
| **E5** | Document intelligence hardening | Native doc ingest/classify/cite without Fabric | Platform Files |
| **E6** | Engineering Memory & KG publish | Memory semantics on Platform KG infra | No KG fork |
| **E7** | Tool Registry UX | Governed tool invocation from Ask | Fail-closed solvers |
| **E8** | Connector framework productization | Install/health/mapping UX; first productivity connector optional | Optional only |
| **E9** | PROFESSIONAL packaging | Cross-company Explore/Intelligence + commercial profile | No forced SAP |
| **E10** | Enterprise federation | ERP/EAM/data-platform adapters; conflict representation | SoR policy |
| **E11** | Ambient governance polish | Automatic provenance/audit UX minimization | Security closure |
| **E12** | Profile certification gate | ESSENTIAL/PROFESSIONAL/ENTERPRISE evidence packs | No V1 reopen |

## Sequencing rules

1. E1–E5 must not require enterprise connectors.
2. E8+ connectors remain optional for ESSENTIAL certification.
3. Each phase ships tests proving no certified ownership regression.
4. No phase may set `commercialSolverLicenseOwnedByRTBRequired = true` without a new ADR.

## E1 readiness entry criteria (from E0)

- [x] ADR accepted
- [x] Product architecture published
- [x] Ownership matrix published
- [x] SoR + connector + profile + UX policies published
- [x] Migration assessment: no major migration required
- [x] Machine-readable contract flags in `@rtb/engineering-os`
- [x] E1 implementation kickoff (next phase)
