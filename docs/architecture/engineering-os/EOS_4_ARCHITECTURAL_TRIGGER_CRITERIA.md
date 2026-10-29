# EOS 4 Architectural Trigger Criteria

`EOS_4_ARCHITECTURAL_TRIGGER_CRITERIA_DEFINED=YES`

## Purpose

Define when work should open an **EOS 4** architecture program instead of continuously extending EOS 3.0 / future `3.x`.

**This phase does not start EOS 4.**

## Candidate triggers (any one may justify EOS 4 intake)

1. **Incompatible canonical object model** — breaking identity, revision, or relationship semantics that cannot be versioned additively inside EOS 3.
2. **Major authority-model redesign** — replacement of entitlement/enrollment/authority boundaries in a non-compatible way.
3. **Fundamentally new runtime architecture** — e.g. replacement of core execution/hosting model with incompatible contracts.
4. **Incompatible workflow/event architecture** — breaking event envelopes, authority grants, or workflow state machines.
5. **New multi-product operating model** — platform productization that cannot coexist under current EOS 3 product-key / generation contracts.
6. **Breaking API/data model change** — non-additive public API or stored data changes that invalidate EOS 3 clients/projects.
7. **Major engineering qualification model redesign** — replacement of D1/non-D1/solver qualification ontology rather than bounded expansion via tracks.

## Non-triggers (remain EOS 3 post-GA tracks / `3.0.x` / future `3.x`)

- Patch / security / operational hardening
- Bounded connector enablement under existing authority model
- Live LLM enablement under existing AI-authority denial defaults (after qualification track)
- Additive qualification expansions with evidence
- PITR / SLO / compliance readiness programs
- External customer release gate clearance

## Governance

Opening EOS 4 requires explicit human architectural authorization and a separate program charter. Capability tracks listed in the EOS 3 registry do not implicitly become EOS 4.
