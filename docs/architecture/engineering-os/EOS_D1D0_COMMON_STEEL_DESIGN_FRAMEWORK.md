# EOS-D1D-0 Common Steel Design Framework

Canonical steel-design framework consumed by later D1D-AU / D1D-EU / D1D-US. Framework, adapter boundaries, and fail-closed orchestration only. **No AS 4100, EN 1993, or AISC 360 resistance equations.**

Package decision: contracts in `@rtb/types` `structural-steel.ts`; services in `@rtb/engineering-os` `src/structural-steel/`. Reuses D1A objects, D1B `StructuralStandardContext`, and D1C demand results. No persistence migration.

Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`.

## Risk ledger

D1C remaining listed `D0-R02` and `D0-R09`. Classification: **REPORTING_ERROR**. Those risks were already CLOSED (D1B / D1A) and were not reopened by D1C code. `D0-R07` / `D0-R08` were correctly REDUCED.

Canonical state: CLOSED `D0-R09` (D1A), `D0-R02` `D0-R06` (D1B). REDUCED `D0-R03` `D0-R05` `D0-R07` `D0-R08` plus `D0-R01` (D1D-0 steel pack contract). D1D-0 does not close remaining solver/capacity-implementation risks.

## Common architecture

```
D1C governed demand
        +
SteelDesignContext (member/section/material/stability/standard bind)
        ↓
SteelCapacityEngine (common)
        ↓
AU_STEEL | EU_STEEL | US_STEEL adapter
        ↓
CapacityResult (null while FRAMEWORK_ONLY)
        ↓
DesignCheck orchestration (CHECK_* ≠ approval)
```

Demand is referenced, not recalculated. Capacity engines must not duplicate D1C statics.

## Demand / capacity boundary

D1C results remain `capacityPresent = false`. Steel checks consume `demandRefs`. Simple utilization `D/C` is allowed only where a method declares `simpleUtilizationValid`. Combined actions require a standard-specific adapter. No universal interaction equation.

Check verdicts: `CHECK_SATISFIED` | `CHECK_NOT_SATISFIED` | `CHECK_UNDETERMINED`. Never `APPROVED` / `DESIGN_APPROVED` / `ISSUED_FOR_CONSTRUCTION`.

## Standard adapter boundary

Adapters are selected explicitly (`AU_STEEL`, `EU_STEEL`, `US_STEEL`). Unsupported jurisdiction, missing edition, or required National Annex absence fails closed. D1D-0 adapters are `FRAMEWORK_ONLY` / `implemented: false`. No certified editions yet (`assertImplementedSteelEdition` fails closed).

## Materials and sections

Governed properties (fy, fu, E, G, ν, density, A, I, Z, S, J, Iw, radii, dimensions) each carry unit, provenance, and source-authority type. Missing required properties fail closed. Values are not hard-coded by jurisdiction in the common core.

AUST300 / `VerifiedSteelSection` is an **AU catalog identity** (library name + mass). It is not a global default and must not infer I/Z/S from the designation.

## Stability and limit states

Taxonomy: TENSION, COMPRESSION, BENDING_MAJOR, BENDING_MINOR, SHEAR, COMBINED_ACTION, LOCAL_STABILITY, MEMBER_STABILITY, SERVICEABILITY, OTHER.

`SteelStabilityContext` holds explicit effective/unbraced length, restraint, buckling axis, moment gradient, torsional/lateral restraint, and evidence. Effective length is never assumed. Compression/member-stability checks fail closed without it.

Section classification is adapter-owned. There is no global classification system.

Serviceability consumes D1C deflection demand; statics are not duplicated.

## Capacity / result model

`evaluateSteelCapacity` validates bind, demand, properties, and stability, then returns `capacity: null` with FRAMEWORK_ONLY reason until a licensed subphase implements a method.

## Benchmark and source authority

Permitted authorities: LICENSED_STANDARD, USER_SUPPLIED_STANDARD_REFERENCE, VALIDATED_INTERNAL_ENGINEERING_RULE, APPROVED_ENGINEERING_HANDBOOK, CERTIFIED_EXTERNAL_TOOL, OTHER_GOVERNED_SOURCE.

Unsourced LLM/web/forum formulas are forbidden. Copyrighted standard text is not stored; identifiers, permitted clause refs, derived logic, and licensed metadata only.

Future AU/EU/US methods require independent hand-calc and, where appropriate, a trusted published example or independent software comparison. Self-consistency is insufficient. `SteelBenchmarkRecord` is the contract.

Units and numerical tolerance reuse D1C (`N`, `N.m`, `m`, relative/absolute tolerances). No exact float equality for engineering results.

## AI boundary

AI may suggest checks, explain utilization, list missing inputs, summarize governing cases, and propose candidate sections. AI may not invent capacity, alter deterministic results, select code factors, approve design, promote unvalidated methods, or fill stability inputs. Optimization candidates must be re-evaluated deterministically. No D1J certification here.

## AU / EU / US subphase plan

**AU (EOS-D1D-AU):** AU-1 tension with licensed AS 4100 authority; AU-2 compression/stability; AU-3 bending/LTB; AU-4 shear; AU-5 combined actions; AU-6 serviceability + orchestration; AU-7 independent certification gate.

**EU:** EU-1 EN 1993 + National Annex parameter bind; EU-2 tension; EU-3 compression/buckling curves as annex-selected parameters; EU-4 bending/LTB; EU-5 shear; EU-6 combined actions; EU-7 certification gate.

**US:** US-1 AISC 360 + explicit LRFD/ASD selection; US-2 tension; US-3 compression; US-4 bending/LTB; US-5 shear; US-6 combined actions; US-7 certification gate.

Next phase: **EOS-D1D-AU** (bounded AU-1). Profile A pilot is unchanged.
