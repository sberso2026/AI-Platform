# EOS 3 — UX Foundation Pilot Validation

## PILOT-001 / WP-STR-004

Validate engineering-language presentation of:

Project · Work Package · Asset/System · Maturity · Disciplines · Readiness · Blockers · Next action · Engineering Design · Dependencies · Decisions · Assumptions · Deliverables · Reviews · Changes

`PILOT_001_ARCHITECTURE_JARGON_REQUIRED=NO`

## Layout

Independent sidebar scroll · independent main content scroll · persistent active navigation context.

## Feedback

Pilot Feedback only when `NEXT_PUBLIC_EOS_PILOT_FEEDBACK=1` or localStorage `eos.pilot.feedback=1`.

## Controlled pilot

Deployment: `dpl_2GEqSJQwjZ53c4zECfmHgbHVmDqx` → https://eos-pilot.rtbea.com.au

Measured route P95 (HTTPS wall ms, n=12):
- Home `/engineering`: 442 ms
- My Work `/engineering/my`: 92 ms
- Work Package entry `/engineering/projects`: 90 ms
