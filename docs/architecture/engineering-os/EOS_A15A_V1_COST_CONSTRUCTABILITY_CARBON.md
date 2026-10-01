# EOS-A15A-V1 Cross-Lifecycle Cost, Constructability & Carbon

Target: STAGING / NON-PRODUCTION (`rntonzigxwxcjlcsadip`).  
Baseline: `cce79453c7d77cd8a71ca73a66cd62c0170b58ac`.  
Mode: bounded composition overlay. **Not** a new Cost, Constructability, or Carbon Intelligence domain.

READY_FOR_PRODUCTION = NO.  
CONTROLLED_PILOT_READY is unchanged by this phase and remains the Pilot Gate Closeout result (currently NO).

## What this is

Cost and constructability are applicable throughout the engineering lifecycle. Carbon is applicable only when required by client, contract, project policy, regulation, or organizational policy. Lifecycle sets expected maturity. Discipline contributes only when assigned. Humans retain trade-off and decision authority.

This reuses Requirements, Lifecycle Intelligence, Discipline Intelligence, Systems Intelligence, Optimization, Decision Intelligence, Work Generator, Deliverables, Pre-Issue Review, Change/Impact, Digital Thread, and My Engineering Day.

## Safety hierarchy

Mandatory constraints:

- Safety
- Legal/regulatory requirements
- Code requirements
- Critical client requirements

These constrain the feasible option set. Weighted optimization cannot trade them against cost, constructability, carbon, or schedule. Safety is not a negotiable score.

## Project applicability

States: `REQUIRED` | `REPORT_ONLY` | `OPTIONAL` | `NOT_APPLICABLE`.

Default project policy: Cost REQUIRED, Constructability REQUIRED, Carbon **NOT_APPLICABLE**. Carbon cannot become REQUIRED without an explicit requirement source. `CARBON_GLOBAL_MANDATORY = NO`.

The Crusher Expansion Demonstrator sets Carbon REQUIRED because of a **client requirement**, and marks all values `SYNTHETIC_DEMONSTRATION_DATA`.

## Provenance

EOS does not fabricate CAPEX, OPEX, unit rates, quantities, carbon factors, or construction durations. Missing evidence is `UNKNOWN`, `REQUIRES_INPUT`, or `NOT_EVALUATED`.

If cost is quantified: quantity basis, rate/reference source, currency, base date, estimate class, assumptions, exclusions, uncertainty. This is not an estimating platform.

If carbon is quantified: quantity source, material/process, emission factor, factor source/version/date, unit, system boundary, method, assumptions. No universal carbon truth score.

Constructability evidence is a review/constraint/method/lifting/access/sequence record. It is not an opaque numeric score.

## Composition

- Work Plan exposes applicable evaluation requirements (example Structural FEED: quantity/cost basis, formal constructability review, embodied-carbon evidence only if carbon policy requires it).
- Option Study reuses A11E/Optimization. Criteria include Technical Performance, Safety (mandatory constraint), CAPEX, OPEX, Constructability, Schedule, Operability, Maintainability, Carbon, Environmental, Risk, Uncertainty. No universal weighting. No automatic winner.
- Decision records preserve criteria, explicit human-entered weights, evidence, trade-offs, and human rationale. Rationale is not inferred.
- Change/Impact presents TECHNICAL, COST, CONSTRUCTABILITY, SCHEDULE, and CARBON as **POTENTIAL** until human-confirmed. Unavailable cost/carbon is not auto-quantified.
- Pre-Issue Review may verify required evidence exists. It does not conclude cost acceptable, constructable, or carbon compliant.
- My Engineering Day may show Constructability Review required, Cost basis missing, Carbon evidence missing, Option Decision required. No notification storm: value gaps are projected only when supplied on the Work Plan snapshot.
- Digital Thread links evaluation evidence as `EVIDENCED_BY`. Thread remains non-authoritative.
- Generated artifacts include Cost / Constructability / Carbon sections only when applicability is REQUIRED or REPORT_ONLY.

## Demonstrator

The existing Crusher Expansion Demonstrator now carries synthetic cost, constructability, and carbon evaluation requirements from Concept through Handover, including PFS option comparison, FEED cost basis + constructability review + carbon target evidence, Detailed Design quantity/change implications, Construction field-change potential impacts, Commissioning deficiency implications, and Handover lessons.

## A15B measurement preparation

Future named-user pilot (only after CONTROLLED_PILOT_READY = YES) may measure time to assemble Cost/Constructability/Carbon evidence, compare options, identify affected context after change, prepare lifecycle reports, and support decisions. No employee surveillance.

## Feature freeze

No new engineering intelligence domain, lifecycle model, optimization engine, decision engine, graph, event bus, or DMS.
