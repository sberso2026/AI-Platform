# EOS 2.0 GA Scope and Limitations

`EOS_2_GA_SUPPORTED_SCOPE_DEFINED=YES`

`EOS_2_GA_EXCLUDED_SCOPE_DEFINED=YES`

This statement describes product scope for General Availability **technical readiness**. It does **not** issue human GA GO and does **not** activate GA. Current Production remains `CONTROLLED_PILOT` with **two** enrolled Production workspaces (internal validation cohort).

## Supported scope (when human GA GO is later authorized)

EOS 2.0 is intended to support, within explicit bounds:

- Engineering Basis and delivery lifecycle governance
- Multidisciplinary engineering objects and discipline delivery workflows
- Controlled revisions and provenance
- Cross-discipline interfaces with source ownership and receiver acceptance
- Engineering changes and deterministic change-impact dependency discovery
- Human materiality assessment (not AI finalization)
- Governed deliverables and freeze/readiness snapshots
- Audit of governed actions
- Tenant/workspace RLS and role authority boundaries
- AI-assisted engineering reasoning with grounding/abstention and no approval authority
- Bounded qualified Structural D1 calculation capability (`QUALIFIED_BOUNDED`) where that path applies
- Controlled deterministic workflows already validated in pilot / multi-enrolled evidence
- Canonical `eos-2` commercial entitlement + explicit workspace enrollment (billing-independent authorization)

## Excluded / not qualified

- Unsupported deterministic engineering calculations outside validated paths
- Globally qualified external solver execution
- Autonomous engineering approval, materiality finalization, IFC release, or deliverable/release approval by AI
- Regulatory certification or professional engineering certification by the product
- Full enterprise DMS where not implemented
- Full construction management
- Unsupported discipline calculation engines
- Claiming Ask Engineering AI retrieves all EOS 2 canonical tables (current corpus excludes pilot-workflow tables; abstention is correct)
- Silent auto-migration of EOS 1 projects into EOS 2
- Automatic EOS 2 enablement for legacy Engineering OS entitlements
- Representing INTERNAL_GA_VALIDATION workspaces as paying commercial customers
- Formal SOC 2 / ISO 27001 / EU AI Act certification claims

## Qualification claims

`STRUCTURAL_D1_GA_CLAIM_STATUS=QUALIFIED_BOUNDED`

`NON_D1_DISCIPLINE_CALCULATION_GA_CLAIM=NOT_QUALIFIED`

`EXTERNAL_SOLVER_GLOBAL_GA_QUALIFICATION=NO`

`IMPLEMENTED != VALIDATED != QUALIFIED` remains in force.

## Known operational limitations retained at technical GA readiness

- Formal legal review of customer policy package pending before external customers
- PITR recommended, not enabled
- Ask AI retrieval READY_WITH_LIMITATIONS
- MDR usability READY_WITH_LIMITATIONS
- Authenticated interactive performance DEGRADED_NONBLOCKING; no formal SLO
- Bounded soak reliability only (not large-scale field evidence)
- Known moderate dependency `GHSA-w5hq-g745-h8pq` ACCEPTED_BOUNDED_RISK
