# EOS-D0 Discipline Capability Framework

One Engineering OS plus installable / activatable **discipline capability packs**. Not separate Structural, Civil, Mechanical, or Electrical operating systems.

## Architecture

- Contracts: `@rtb/types` `discipline-capability.ts`
- Registry and guards: `@rtb/engineering-os` `src/discipline-capability/`
- Inherits EOS-EU-0 global governance, jurisdiction, AI, privacy, security, and provenance profiles
- No D0 database migration

## Ownership

Engineering Core owns canonical registers: decisions, assumptions, actions, risks, issues, technical queries, lessons learned. Packs may reference, filter, enrich, and attach discipline metadata. They must not recreate those registers or duplicate authentication, commerce, AI stack, knowledge graph, event bus, audit, or managed repository.

## Discipline lifecycle

Statuses: `PLANNED`, `FOUNDATION`, `REFERENCE_PARTIALLY_IMPLEMENTED`, `PARTIALLY_IMPLEMENTED`, `PILOT`, `CERTIFIED`, `PRODUCTION`.

Activation (workspace Engineering OS + packs): `installed`, `enabled`, `disabled`, `pilot`, `not_entitled`.

Current registry:

| Discipline | Maturity |
|---|---|
| Structural | REFERENCE_PARTIALLY_IMPLEMENTED (existing work mapped; not rebuilt) |
| Civil | PLANNED |
| Geotechnical | PLANNED |
| Mechanical | PLANNED |
| Piping | PLANNED |
| Process | PLANNED |
| Electrical | PLANNED |
| Instrumentation & Control | PLANNED |

Generic EOS features are not completed discipline modules.

## Global governance inheritance

Every pack references jurisdiction, engineering standards, AI governance, privacy/data, security, and provenance profiles. EU is a high-water-mark profile, not an EU-only product. No pack may hard-code Australia, EU, or US as universal EOS behavior. National annexes remain jurisdiction-selected.

## Standards / calculations / tools

Calculation definitions are deterministic. LLMs must not originate governed numeric results. Uncertified external tools (including SPACE GASS) must not silently fall back. Structural currently maps the existing synthetic UDL demand engine and SPACE GASS governance boundary.

## AI, review, approval

Discipline AI capabilities register through the EOS-EU-0 AI contract: intended purpose, human oversight, no autonomous action, no autonomous engineering approval. AI recommendation ≠ review ≠ approval.

## Evidence and provenance

AI output is not approved engineering evidence merely because AI produced it. Every pack can link outputs to the global provenance contract.

## Cross-discipline interfaces

Relations include `PROVIDES_INPUT_TO`, `REQUIRES_INPUT_FROM`, `LOAD_TRANSFER`, `DATA_DEPENDENCY`, `DESIGN_CHANGE_IMPACT`, `INTERFACE_REQUIREMENT`, `REVIEW_REQUIRED`, `ASSUMPTION_DEPENDENCY`. Impact metadata is extensible; AI suggestions remain advisory. Example future chain: Process → Mechanical → Piping → Structural → Geotechnical.

## Roadmap

- EOS-D1: Structural gaps (design-code engines, certified solver execution, object models)
- Later dedicated packs for Civil, Geotechnical, Mechanical, Piping, Process, Electrical, I&C
- EOS-EU-D0: high-water-mark review of this framework
