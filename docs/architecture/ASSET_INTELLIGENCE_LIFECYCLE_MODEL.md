# Asset Intelligence — Lifecycle Model (Phase 10G)

## Purpose

Asset Intelligence owns **lifecycle intelligence ABOUT** assets.
Engineering OS Shared Domain remains authoritative for **canonical Asset identity**
and **canonical lifecycle identity**.

## Distinct concepts (locked)

| Concept | Owner | Answers |
|---------|-------|---------|
| Canonical Lifecycle Stage | engineering_os_shared_domain | Broad lifecycle position (design → retired) |
| Operating State | context (AI may observe) | operating / standby / offline / … |
| Maintenance State | context (not CMMS) | available / under_inspection / … |
| Condition State | asset_intelligence | Current physical/functional state |
| Reliability State | asset_intelligence | Capability to perform required function |
| Failure State | asset_intelligence | Supported failure mode/mechanism/cause/effect |
| Degradation / Trend State | asset_intelligence | How deterioration is changing over time |
| Lifecycle Intelligence State | asset_intelligence | Interpreted lifecycle context from governed evidence |

Do **not** collapse these concepts.

## Canonical Lifecycle Stage (examples)

design, procurement, fabrication, construction, installation, commissioning,
operation, mothball, decommissioning, retired

## Operating State (examples)

operating, standby, offline, shutdown, isolated, unknown

## Maintenance State (examples)

available, inspection_due, under_inspection, maintenance_planned,
maintenance_in_progress, repair_pending

Phase 10G does **not** create CMMS ownership.

## Lifecycle Intelligence Context Class (examples — advisory)

normal_operational_context, ageing_context, degradation_attention,
life_extension_assessment_recommended, replacement_assessment_recommended,
insufficient_evidence, conflicting_context

These are **not** canonical lifecycle transitions.

## Boundaries

- Chronological age alone ≠ condition / degradation / RUL
- Failure presence alone ≠ lifecycle transition
- Operating ≠ healthy; retired ≠ failed; old ≠ poor condition
- Lifecycle intelligence must not mutate canonical lifecycle stage
- Lifecycle must not contribute to Health Index (`lifecycleHealthContributionEnabled = false`)
- No predictive ML, PoF, or certified RUL

## Engine

`LifecycleContextEngine` consumes only published/approved intelligence slices plus
read-only `AssetLifecycleReference`, produces advisory `AssetLifecycleIntelligenceState`,
and submits governed review (`asset_intelligence.lifecycle_review`).

## Version

`0.7.0-lifecycle`
