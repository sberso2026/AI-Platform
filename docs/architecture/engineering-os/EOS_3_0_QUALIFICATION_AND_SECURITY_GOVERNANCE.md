# EOS 3.0 Qualification and Security Governance

`EOS_3_QUALIFICATION_MODEL_DEFINED=YES`

`EOS_3_SECURITY_ARCHITECTURE_DEFINED=YES`

`EOS_3_ENTITLEMENT_ARCHITECTURE=INHERIT_EOS_2_GA`

`EOS_3_SECURITY_RELEASE_GATE_MANDATORY=YES`

`EOS_3_QUALIFICATION_IMPACT_GATE_MANDATORY=YES`

`EOS_3_AI_AUTHORITY_ESCALATION_GATE_MANDATORY=YES`

`EOS_3_ADR_GOVERNANCE_DEFINED=YES`

## Qualification model

Retain practical levels aligned with EOS 2 terminology:

| Level | Meaning |
| --- | --- |
| `IMPLEMENTED` | Exists in product |
| `VERIFIED` | Tests/checks confirm intended behavior |
| `VALIDATED` | Validated against agreed use cases/evidence |
| `QUALIFIED_BOUNDED` | Qualified within documented bounds (e.g. Structural D1) |
| `QUALIFIED` | Reserved for broader qualification only with full evidence |

Rules:

- Every deterministic engineering capability has an explicit qualification state.
- AI capabilities **must not** borrow deterministic qualification status.
- `IMPLEMENTED != VALIDATED != QUALIFIED` remains in force.

## Qualification impact gate

Any EOS 3 phase changing engineering formulas, result semantics, deterministic decision rules, calculation workflows, or qualified standard implementation **must** run qualification impact assessment before Production claim changes.

## Security architecture

Preserve/evolve: RLS; workspace isolation; product entitlement; explicit enrollment; role authority; audit; secrets; storage isolation; least privilege; fail-closed authorization; kill switch; rollback; release governance.

Every EOS 3 phase closeout requires Security + Release Regression Gate. Tenant isolation regression is a release blocker.

## Entitlement

Inherit EOS 2 GA entitlement model (`eos-2` product grants billing-independent; fail closed). EOS 3-specific products/features, if introduced, remain product-specific and fail closed. No legacy auto-enable.

## AI authority escalation gate

Proposals for autonomous approval, release, IFC, certification, or final materiality are governance escalations and **cannot** inherit EOS 2 approvals.

## ADR governance

Material decisions require ADR-style records covering at least:

- object-model changes;
- workflow/event model;
- AI orchestration;
- deterministic solver architecture;
- migration strategy;
- new security boundaries;
- data architecture;
- compatibility-breaking APIs.

ADRs live under `docs/architecture/engineering-os/adrs/` (created as decisions land; none required to invent empty stubs in this phase).
