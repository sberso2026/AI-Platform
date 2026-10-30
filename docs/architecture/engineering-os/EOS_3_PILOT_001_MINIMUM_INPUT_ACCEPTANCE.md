# PILOT-001 — Minimum Input Acceptance

Harness: `apps/web/src/__tests__/eos3-pilot-ux-2-guided-engineering.test.ts`

## Workflow

1. Objective: *Install a new 12 t process equipment module on an existing steel-framed platform while minimising operational disruption.*
2. Owner defaulted from authenticated user.
3. Optional documents (names) enrich provenance.
4. EOS generates EB-001, REQ-001, ASM-001, SYS-STR-001, INT-001, CALC-001, DEC-001, DEL-001, REV-001, risks, gaps, options — all PROPOSED / NOT_APPROVED.
5. Relationships auto-linked; G0 readiness assembled without multi-register admin entry.
6. Natural utterance *Vendor increased equipment mass from 12 t to 15 t* creates CHG-001 + impact.

## Measurements

| Metric | Value |
|--------|-------|
| INITIAL_REQUIRED_INPUTS | 1–2 (≤3) with owner present |
| Manual input baseline | 35 (legacy setup + register CRUD for G0) |
| Manual input guided | 1–2 |
| Reduction | ≥90% (measured in harness as `manualInputReductionPercent`) |
| Time to first useful state | sub-second generation (≪ 5 minutes) |
| Duplicate input requests | 0 |

`PILOT_001_MINIMUM_INPUT_WORKFLOW=PASS`  
`PILOT_001_G0_GUIDED_WORKFLOW=PASS`
