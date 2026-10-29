# EOS 3.0 Architecture and Program Boundary

## Decision

`PHASE=EOS-3.0-ARCHITECTURE-AND-PROGRAM-BOUNDARY`

`VERDICT=PASS_WITH_LIMITATIONS`

`EOS_2_0_GA_BASELINE_PRESERVED=YES`

`EOS_2_MAINTENANCE_AND_EOS_3_DEVELOPMENT_SEPARATED=YES`

`EOS_2_EXTERNAL_CUSTOMER_HOLD_PRESERVED=YES`

`EOS_3_MAJOR_VERSION_JUSTIFICATION=PASS`

`READY_FOR_NEXT_PHASE=YES`

`NEXT_PHASE=EOS-3.1-FOUNDATION-AND-COMPATIBILITY`

`APPLICATION_RUNTIME_CHANGED=NO`

`DATABASE_SCHEMA_CHANGED=NO`

This phase defines architecture and governance only. No broad EOS 3 capabilities were implemented. EOS 2.0 remains the frozen GA product baseline (`2.0.0` / `ACTIVE_CONTROLLED_GA`).

## Program objective

`EOS_3_PROGRAM_OBJECTIVE_DEFINED=YES`

EOS 3.0 is the next architectural generation of Engineering OS. It extends the governed engineering digital thread beyond EOS 2’s project-centric delivery model toward:

1. stronger systems-engineering traceability (requirements → systems → interfaces → verification);
2. revision-aware knowledge/retrieval with explicit source authority and abstention;
3. first-class Decision and Optimization Intelligence that remains non-autonomous;
4. optional project→asset continuity (design evidence into operations/inspection/modification) without becoming construction ERP;
5. hybrid deterministic calculation / external solver boundaries with independent qualification;
6. event-aware governed workflow evolution with fail-closed security and opt-in migration from EOS 2.

EOS 3 is **not** unfinished EOS 2 feature cleanup.

### What new class of problems EOS 3 solves

Cross-lifecycle engineering continuity, evidence-ranked knowledge use, decision/optimization records, and safer multi-system integration under the same authority/qualification rules.

### Limitations carried forward vs targeted

| EOS 2 limitation | Disposition |
| --- | --- |
| External customer legal hold | CARRY_FORWARD (EOS-2.23 product governance) |
| Pricing external / policy package | CARRY_FORWARD (commercial governance) |
| PITR recommended | CARRY_FORWARD / ops (not EOS 3 architecture driver) |
| Formal SLO / certifications | CARRY_FORWARD (ops/compliance programs) |
| GHSA moderate dependency | FIX_IN_EOS_2_MAINTENANCE when feasible |
| Ask AI corpus limitation | TARGET_IN_EOS_3 (knowledge/retrieval architecture) |
| MDR UX | FIX_IN_EOS_2_MAINTENANCE and/or minor UX; not major-version driver |
| Performance degraded/nonblocking | FIX_IN_EOS_2_MAINTENANCE + EOS 3 data architecture awareness |
| Non-D1 / external solvers unqualified | TARGET_IN_EOS_3 only via separate qualification tracks |

### Outside EOS entirely

Full ERP, universal CAD replacement, universal solver replacement, autonomous PE practice, full enterprise DMS, unrestricted AI agents — see `EOS_3_0_NON_GOALS.md`.

## Major version justification

`EOS_3_MAJOR_VERSION_JUSTIFICATION=PASS`

A major version is justified by concurrent architectural evolution:

- knowledge/retrieval authority model (structured state over embeddings);
- project-to-asset digital thread boundary;
- Decision/Optimization Intelligence as first-class governed layers;
- event + governed workflow evolution;
- systems-engineering deepening;
- hybrid calculation/solver framework with independent qualification;
- EOS 2 ↔ EOS 3 coexistence/migration contracts (no silent upgrade).

These exceed safe EOS `2.x` patch/minor scope. If only bugfix/legal/ops work remained, EOS `2.x` would be correct — that is not the case.

## Design principles preserved

`EOS_3_DESIGN_PRINCIPLES_PRESERVED=YES`

Assistant-first; vendor- and company-size-neutral; SME-usable; EPC/owner-compatible; deterministic calculations remain deterministic; AI does not approve/certify; evidence/provenance/authority; RLS/tenant isolation/least privilege; auditable human decisions; jurisdiction profiles; EU high-bar global compliance foundation; global deployability; standards extensibility; data residency; security by design.

## Separation from EOS 2 maintenance

EOS 2 bug fixes follow `EOS_2_0_POST_GA_CHANGE_GOVERNANCE.md` / `EOS_2_0_POST_GA_MAINTENANCE_POLICY.md`. EOS 3 work must not bypass EOS 2 change classes, security gates, or qualification invalidation rules.

## Recommended next phase

`EOS-3.1-FOUNDATION-AND-COMPATIBILITY` — scaffolding, ADR store, compatibility contracts, and non-breaking foundations before object-model or intelligence implementation.
