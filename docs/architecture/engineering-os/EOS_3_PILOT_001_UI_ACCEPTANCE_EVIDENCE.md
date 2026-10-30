# PILOT-001 UI Acceptance Evidence

Pilot scenario: **PILOT-001 — Process Plant Structural Modification Pilot**  
Harness: `apps/web/src/__tests__/eos3-pilot-ui-1-workspace.test.ts`  
Service: `eos3-project-workspace-service.ts` (`seed_pilot_001`, gates, mass change, thread)

## End-to-end object creation / navigation

| Object | Stable ID | Result |
|--------|-----------|--------|
| Requirement | REQ-001 | PASS |
| Engineering Basis | EB-001 | PASS |
| Assumption | ASM-001 | PASS |
| System | SYS-STR-001 | PASS |
| Interface | INT-001 | PASS |
| Calculation | CALC-001 | PASS (qualification QUALIFIED_BOUNDED displayed) |
| Decision | DEC-001 | PASS |
| Deliverable | DEL-001 | PASS |
| Review | REV-001 | PASS |
| Change | CHG-001 | PASS |
| Gate | G0 | PASS (evaluate + governed transition) |

`PILOT_001_END_TO_END_UI_SCENARIO=PASS`

## Change impact (12 t → 15 t)

`applyChangeMassPilot` marks/creates relationships for Assumption, Interface, Calculation, Decision, Deliverable under CHG-001. Impact Analysis panel lists governed states (STALE / IMPACT_CANDIDATE).

`PILOT_001_CHANGE_IMPACT_UI=PASS`

## Digital thread navigation

Traversal from REQ-001 reaches related basis/assumption/system (and further linked objects via canonical edges). Embeddings are not graph authority.

`PILOT_001_DIGITAL_THREAD_NAVIGATION=PASS`

## Stage gate blocking / reevaluation

- Without Requirement (and with incomplete jurisdiction as applicable): G0 → `HOLD` with blocking reason; transition denied.
- After seed / criteria satisfied: G0 → `PASS`; human-authority transition to G0 succeeds.

`PILOT_001_GATE_BLOCKING_BEHAVIOR=PASS`  
`PILOT_001_GATE_REEVALUATION=PASS`

## Authority boundaries

- AI is not decision/review approval authority in UI copy and decision payloads (`aiIsAuthority: false`, `aiMayApprove: false`).
- No duplicate canonical tables; workspace wraps `Eos3CanonicalObjectStore`.
- Qualification display: D1 `QUALIFIED_BOUNDED`; non-D1 / SPACE GASS / external solvers `NOT_QUALIFIED` / `NO`.
