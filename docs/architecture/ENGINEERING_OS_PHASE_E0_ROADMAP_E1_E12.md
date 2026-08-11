# Engineering OS — Phase E0 Roadmap (E1–E12)

Status: Planning baseline (E0) · Does not certify future phases

| Phase | Theme | Outcomes (high level) | Must preserve |
| --- | --- | --- | --- |
| **E0** | Architecture & product contract | ADR, layers, SoR, connectors, profiles, UX policy, roadmap | V1 freezes |
| **E1** | Experience foundation | Ask / My / Explore / Intelligence shells; capability-based nav hide | Entitlements |
| **E2** | Ask Engineering OS MVP | Advisory assistant over native context + abstention/evidence | No fabrication |
| **E3** | Canonical Engineering Context & Relationship Model | Object refs, external identity mapping, provenance-backed relationships, bounded context resolver, E2 Ask enrichment | No second KG; no PI/II/connector ownership; no fabricated future domains. (Earlier draft labelled E3 “My Engineering” — superseded.) |
| **E4** | Enterprise Connector Framework | Vendor-neutral read-first connectors; ESSENTIAL zero-connector; E3 identity handoff; E2 optional evidence | No SoR ownership transfer; no live vendor hard deps; writes disabled. (Earlier draft labelled E4 “Explore & native search” — superseded.) |
| **E5** | Engineering Reasoning, Evidence & Explainability | Evidence-based Ask reasoning; fact/inference/assumption; Why?; abstention/conflict; advisory authority | No CoT; no tool/KG/connector ownership; no fabricated authority. (Earlier draft labelled E5 “Document intelligence hardening” — superseded.) |
| **E6** | Governed Engineering Tool Framework | Discover/invoke governed tools from Ask; units/certification/provenance; LLM cannot impersonate tools | No second Tool Registry; Platform Intelligence ownership preserved. (Earlier draft labelled E6 “Memory & KG publish” — superseded.) |
| **E7** | Passive Engineering Memory | Governed passive capture of decisions/outcomes/tool results into Platform Memory; Ask uses memory as context never authority | No second Memory/KG; Platform Kernel ownership preserved. (Earlier draft labelled E7 “Tool Registry UX” — superseded; absorbed by E6.) |
| **E8** | Engineering Action & Workflow Orchestration | Ask→proposal→human review→existing domain/workflow execute; provenance/audit; E7 memory handoff | No second workflow engine; Platform Workflow/Event Bus ownership; E4 external write remains gated. (Earlier draft labelled E8 “Connector framework productization” — superseded.) |
| **E9** | Unified Engineering Intelligence Integration | Route Ask/context to certified PI/AI/II/PC capabilities; coherent Intelligence landing; provenance; E7/E8 handoffs | No engine ownership duplication; Platform capability registry reused; no fabricated intelligence. (Earlier draft labelled E9 “PROFESSIONAL packaging” — superseded.) |
| **E10** | Deployment Profiles & Progressive UX | ESSENTIAL/PROFESSIONAL/ENTERPRISE packaging; progressive nav density; profile≠auth; deployment/identity abstraction; optional Copilot federation | Entitlement+RBAC; zero-connector ESSENTIAL; no provider hard deps. (Earlier draft labelled E10 “Enterprise federation” — superseded.) |
| **E11** | Evaluation, Performance & Engineer Adoption | Deterministic evaluation framework; engineering benchmarks A–N + KGP integrity workflow; KPI kind separation; performance budgets; resilience/adversarial gates; privacy-safe adoption telemetry; admin evaluation report | E0–E10 invariants; no unsupported ROI/accuracy claims; ESSENTIAL zero-connector. (Earlier draft labelled E11 “Ambient governance polish” — superseded.) |
| **E12** | Production Architecture & Product Certification | Final A1–A20 certification; ownership/profile/integration maturity matrices; E2E provenance; security/authority/failure-mode gates; ESSENTIAL zero-connector + enterprise packaging honesty | No V1 reopen; fixtures ≠ live integrations. (Earlier draft labelled E12 “Profile certification gate” — absorbed into this production certification.) |

## Sequencing rules

1. E1–E3 must not require enterprise connectors; E4 framework remains optional for ESSENTIAL (zero-connector mode).
2. E8+ may productize durable connector admin UX; connectors remain optional for ESSENTIAL certification.
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
