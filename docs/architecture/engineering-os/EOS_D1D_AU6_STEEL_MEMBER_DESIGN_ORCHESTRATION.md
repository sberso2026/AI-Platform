# EOS-D1D-AU-6 Australian Steel Member Design Orchestration

Bounded Australian-profile **member-design orchestration** that assembles AU-1 through AU-5 strength, stability, and interaction results with governed serviceability into one `SteelMemberDesignRecord`. Intended standard profile remains AS 4100. This phase does **not** certify AS 4100, invent serviceability limits, or approve members.

Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. AU steel pack remains **not certified**. Edition and amendment remain `UNKNOWN_PENDING_CONFIRMATION`. `AS4100_CONFORMANCE_VALIDATED = NO`.

## Complete member workflow

1. Validate member, section, material, demand, and standard profile.
2. Resolve applicable checks (applicability is not adequacy).
3. Collect D1C demand (ULS for strength; explicit SLS demand for serviceability).
4. Evaluate available AU-1 through AU-4 capacities and stability by reuse.
5. Evaluate required AU-5 interactions (currently framework-only).
6. Evaluate governed serviceability when requested.
7. Propagate incomplete and undetermined states.
8. Select a governing check deterministically.
9. Emit the member design record, completeness matrix, and optimization handoff.

## Applicability

Deterministic presence of tensile or compressive axial force, major/minor moment, shear axis, simultaneous actions, unbraced length, or an explicit serviceability request. Applicability does **not** equal pass.

## Check taxonomy

`TENSION`, `COMPRESSION`, `BENDING_MAJOR`, `BENDING_MINOR`, `SHEAR_MAJOR`, `SHEAR_MINOR`, `STABILITY_COMPRESSION`, `STABILITY_LTB`, `COMBINED_ACTION`, `DEFLECTION`, `OTHER_SERVICEABILITY`.

Not every category applies to every member.

## Completeness model

`COMPLETE`, `INCOMPLETE_REQUIRED_INPUT`, `INCOMPLETE_METHOD_UNAVAILABLE`, `INCOMPLETE_VALIDATION_REQUIRED`, `INCOMPLETE_INTERACTION`, `NOT_APPLICABLE`.

Incomplete reasons are classified separately: `NOT_APPLICABLE`, `METHOD_NOT_IMPLEMENTED`, `VALIDATION_REQUIRED`, `MISSING_INPUT`, `INTERACTION_RULE_VALIDATION_REQUIRED`, `SERVICEABILITY_CRITERION_REQUIRED`, `STALE_RESULT`, `UNSUPPORTED_METHOD`.

A member cannot be fully checked while a required applicable check is undetermined. FRAMEWORK_ONLY / VALIDATION_REQUIRED methods do not count as complete.

Overall engineering state:

- any applicable `CHECK_NOT_SATISFIED` → overall `CHECK_NOT_SATISFIED`
- else any required `CHECK_UNDETERMINED` → overall `CHECK_UNDETERMINED`
- else all required validated checks `CHECK_SATISFIED` → overall `CHECK_SATISFIED`
- `CHECK_SATISFIED` is never approval

## Serviceability

`SteelServiceabilityContext` plus `SteelServiceabilityResult`. Demand is reused from D1C deflection. AU-6 does not add a deflection solver.

Criteria must be explicit and governed (`PROJECT_REQUIREMENT`, `CLIENT_REQUIREMENT`, `ENGINEERING_DESIGN_CRITERIA`, `VALIDATED_STANDARD_RULE`, `HUMAN_CONFIRMED_RULE`, `OTHER_GOVERNED_SOURCE`). Absolute displacement limits and span-ratio `L/n` are supported only when the value and `n` are supplied. `L/250`, `L/300`, `L/360`, and `L/500` are never defaulted.

If serviceability is applicable without a governed criterion: `CHECK_UNDETERMINED` / `SERVICEABILITY_CRITERION_REQUIRED`. Absence of a limit is not pass.

## Deflection criteria

ULS strength demand is not used as serviceability by default. SLS demand and combination must be explicit.

## Interaction limitation

AU-5 `IMPLEMENTED_INTERACTION_METHODS = NONE`. Simultaneous actions that require interaction keep the member `CHECK_UNDETERMINED` even when individual component utilizations are below 1. Component checks cannot substitute for interaction.

## Governing check semantics

Priority is `CHECK_NOT_SATISFIED`, then `CHECK_UNDETERMINED`, then `CHECK_SATISFIED`, in canonical taxonomy order. Highest utilization does **not** always govern. There is no universal member utilization across incompatible checks.

## Stale-result invalidation

Fingerprints cover section, material, demand/combination, effective lengths, unbraced length, standard profile, criterion, and method versions. Changes emit invalidation tags. Stale result reuse fails closed.

## Conformance state

Member records report `INTENDED_PROFILE`. Orchestration is not code certification. `AS4100_COMPLIANT` is not returned.

AU steel pack summary: `FRAMEWORK_IMPLEMENTED`, `PARTIAL_METHODS_BENCHMARKED`, `CONFORMANCE_NOT_VALIDATED`. Not `CERTIFIED`.

## Review / approval separation

Human review: `NOT_REVIEWED` | `UNDER_REVIEW` | `REVIEWED` | `REQUIRES_REVISION`.  
Approval remains `not_approved`. AU-6 never auto-approves.

Governed report language includes: deterministic check satisfied / not satisfied; interaction validation required; serviceability criterion missing; member check incomplete; human engineering review required.

## AI explanation boundary

AI may explain incompleteness, governing checks, missing data, why interaction is required, and candidate sections. Explanation is advisory and traceable to deterministic results. AI cannot invent criteria, interaction equations, or promote approval. Any suggested section must be fully re-evaluated through this orchestration.

## Optimization handoff

The record exposes satisfied / failed / undetermined checks, governing constraint, section/material, serviceability state, interaction completeness, and validation state. Optimization itself is not implemented.

## General FEA limitation

AU-6 consumes bounded D1C statics demand. It does not support general 3D frame analysis or FEA.

## SPACE GASS limitation

SPACE GASS live execution remains `NOT_CERTIFIED`. AU-6 does not change that.

Member checks do not imply connection design or foundation/geotechnical adequacy.

## AU-7 validation dependency

EOS-D1D-AU-7: independent certification gate (handbook / worked example + human validation). AU-6 orchestration does not replace that gate.
