# EOS-A15A-V2 Quantity Basis & Multidisciplinary MTO

Target: STAGING / NON-PRODUCTION (`rntonzigxwxcjlcsadip`).  
Baseline: `06e99ffa5d6fecbf6a5ba3cd27a0069830b64655`.  
Mode: bounded composition overlay. **Not** an MTO, Cost, Carbon, or Constructability Intelligence domain.

READY_FOR_PRODUCTION = NO.  
CONTROLLED_PILOT_READY = NO.  
A15B_ELIGIBLE = NO.

Hosted malware remains **DEFERRED_EXTERNAL_DEPENDENCY**. Returned-artifact round trip remains **DEFERRED_DEPENDENT_GATE**. This phase does not accept unscanned returned user files.

## MTO-first principle

Canonical chain:

Engineering Information → Quantity Basis → MTO → optional Cost / Carbon / Constructability use → Option / Change evaluation → human engineering decision.

Cost is not the primary output. Cost = quantity × approved rate, otherwise `COST_NOT_CALCULATED`. Carbon remains conditional per A15A-V1. Constructability uses MTO as evidence, not an opaque score.

## Terminology

| Term | Meaning |
| --- | --- |
| Quantity Basis | Evidence of origin and derivation |
| MTO item | Governed quantity of a material/component/work item |
| MTO | Controlled snapshot of items for project/system/discipline/lifecycle/revision |
| BOM | Product/equipment bill; not automatically an MTO |
| Equipment schedule | Tagged equipment list; not automatically an MTO |
| BOQ | Commercial/contract document; not synonymous with engineering MTO |

## Quantity provenance

Origins: `SOURCE_MEASURED`, `SOURCE_EXTRACTED`, `DETERMINISTICALLY_DERIVED`, `ENGINEER_ENTERED_ASSUMPTION`, `PARAMETRIC_ALLOWANCE`, `MISSING`.

EOS does not originate a governed numeric quantity from generative AI. Missing basis is `QUANTITY_NOT_AVAILABLE`.

AI-extracted candidates remain `UNVERIFIED` until deterministic verification or engineer acceptance.

## Maturity

Item/snapshot evidence-based: CONCEPT_ALLOWANCE through AS_BUILT_QUANTITY. Lifecycle stage is not mechanically equated with maturity. A FEED project may still contain preliminary items.

## Discipline coverage

Structural, Civil, Geotechnical, Piping, Electrical bulk MTO categories; Mechanical as equipment schedule (tag preserved); Process as equipment/process quantities (not operating consumption); Instrumentation as index/counts when source exists; Materials as specification/grade enrichment rather than duplicated rows.

## Lifecycle coverage

Concept allowances → PFS preliminary → Feasibility developed → FEED controlled MTO → Detailed design → Construction design/procured/installed → Commissioning/handover as-built → Operations/modification retained/removed/added/replaced. Detail is not fabricated beyond information support.

## Cost derivation

`quantity × approved rate`. Rate requires value, unit, currency, base date, source, source revision, location applicability, and approved status (`VENDOR_QUOTE`, `CONTRACT_RATE`, `CLIENT_APPROVED_RATE`, `COMPANY_APPROVED_RATE`). `UNVERIFIED` / `MISSING` / `ESTIMATOR_ASSUMPTION` are not usable. AI knowledge is never an approved cost source.

## Carbon rules

Conditional per A15A-V1. `quantity × approved emission factor`. Project `NOT_APPLICABLE` does not request unnecessary factor evidence. REQUIRED without factor → `CARBON_NOT_CALCULATED`. No LLM-generated factor.

## Constructability

MTO supplies evidence (heavy members, lift mass, concrete/excavation volume, connections, cable length). No Constructability Score unless an approved deterministic client methodology exists (none in this phase).

## AI boundaries

AI may find sources, extract candidates, classify, map descriptions, normalize units, identify duplicates, reconcile revisions, explain changes, identify missing provenance, and draft narratives.

AI shall not invent quantity, rate, carbon factor, grade, or geometry, nor silently promote allowance to detailed MTO or change maturity.

## Review rules

Pre-Issue may verify missing source/revision/unit/derivation/assumption, incompatible maturity claims, cost without approved rate, carbon without approved factor. Review does not decide that quantity is technically correct, cost commercially acceptable, constructability acceptable, or carbon target satisfied.

## Digital Thread

Existing relation codes only (no new graph store):

- SOURCE_FOR ≡ `BASED_ON` (quantity basis based on drawing/document)
- PRODUCES ≡ `USED_BY` (basis used by MTO item)
- SUPERSEDES remains `SUPERSEDES`
- EVIDENCES ≡ `SUPPORTED_BY` (change/option/artifact supported by MTO snapshot)

## XLSX format

Sheets 01_Summary through 13_Revision_Changes always. 14_Cost / 15_Carbon only when a governed basis is supplied. Missing rates appear as `COST BASIS NOT AVAILABLE`, not invented amounts.

## Demonstrator evidence

Synthetic Crusher Expansion FEED multidisciplinary snapshot (Structural, Civil, Mechanical equipment tag, Piping, Electrical, Geotechnical). Rev A → Rev B: structural steel +18.4 t, concrete +96 m³, anchor bolts +16 ea. Steel has approved rate and factor; power cable demonstrates `COST_NOT_CALCULATED` and `CARBON_NOT_CALCULATED`.

## Feature freeze

No new top-level engineering intelligence domain, ScannerV2, graph, Event Bus, DMS, connector, or solver.
