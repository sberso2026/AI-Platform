# EOS 2.0.0 General Availability Release Notes

`EOS_2_GA_VERSION=2.0.0`

`EOS_2_GA_VERSION_DECLARED=YES`

`EOS_2_0_RELEASE_STATUS=GENERAL_AVAILABILITY`

`EOS_2_0_GA_ACTIVATION_STATUS=ACTIVE_CONTROLLED_GA`

## What is released

EOS 2.0 is released as a product under **controlled General Availability**:

- Engineering Basis and delivery lifecycle governance
- Multidisciplinary engineering objects, revisions, and discipline workflows
- Cross-discipline interfaces (source ownership + receiver acceptance)
- Change impact with human materiality determination
- Governed deliverables and freeze/readiness snapshots
- Engineering AI assistance with grounding/abstention (no approval authority)
- Structural D1 deterministic calculations at `QUALIFIED_BOUNDED`
- Canonical `eos-2` entitlement + explicit workspace enrollment
- Kill switch and application rollback retained
- Audit of governed rollout and entitlement actions

## Access model

`EXPLICIT_ENTITLEMENT_AND_ENROLLMENT`

GA does **not** auto-enable EOS 2 for legacy Engineering OS installations. EOS 1 projects are not auto-migrated.

## Qualification boundaries (do not overstate)

- Structural D1: `QUALIFIED_BOUNDED`
- Non-D1 deterministic discipline calculations: `NOT_QUALIFIED`
- External solvers: `NOT_GLOBALLY_QUALIFIED`
- AI cannot approve engineering, finalize materiality, release, IFC, or certify
- Not SOC 2 / ISO 27001 / EU AI Act certified

## External customer hold

External commercial customer onboarding and contracting remain **held** pending RTB legal review of the customer policy package. Internal validation may continue.

## Known limitations

- Formal legal review pending for external customers
- Pricing externally configured
- PITR recommended, not enabled
- Ask AI indexed-corpus limitation
- MDR UX limitation
- Accepted moderate dependency `GHSA-w5hq-g745-h8pq`
- Bounded reliability evidence (not large-scale field proof)
- Authenticated interactive performance degraded/nonblocking; no formal contractual GA SLO
