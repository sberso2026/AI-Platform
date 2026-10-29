# EOS 3.0 Architectural Risk Register

`EOS_3_ARCHITECTURAL_RISK_REGISTER_CREATED=YES`

`EOS_2_TECHNICAL_DEBT_DISPOSITION_COMPLETE=YES`

## Initial risks

| ID | Risk | Severity | Mitigation |
| --- | --- | --- | --- |
| R3-01 | Architecture sprawl across too many layers | High | Phase map gating; ADR required for new layers |
| R3-02 | AI overreach into approval/release | Critical | AI authority escalation gate; fail-closed tests |
| R3-03 | Qualification complexity / false claims | High | Explicit qualification states; impact gate |
| R3-04 | EOS 2→3 migration harm | High | No auto-migration; opt-in; rollback |
| R3-05 | Cross-discipline semantic inconsistency | Medium | Object model ADRs; systems-engineering contracts |
| R3-06 | Uncontrolled event cascades | High | Bounded event catalog; no silent fan-out |
| R3-07 | Retrieval provenance loss | High | Authority hierarchy; abstention |
| R3-08 | Performance regression | Medium | Measure against EOS 2 baseline; class-based gates |
| R3-09 | Tenant isolation regression | Critical | Mandatory security gate; isolation blocker |
| R3-10 | Entitlement drift | High | Inherit EOS 2 GA model; product-specific fail-closed |
| R3-11 | Compatibility breakage for GA customers | High | Coexistence period; project-level opt-in |
| R3-12 | User adoption friction | Medium | Assistant-first UX; SME/EPC dual fitness |
| R3-13 | Enterprise integration complexity | Medium | Adapter architecture; explicit non-goals |

## EOS 2 technical debt disposition

| Item | Disposition |
| --- | --- |
| Ask AI corpus limitation | TARGET_IN_EOS_3 (3.3) |
| MDR UX | FIX_IN_EOS_2_MAINTENANCE |
| Performance degraded/nonblocking | FIX_IN_EOS_2_MAINTENANCE (+ EOS 3 awareness) |
| No formal SLO | CARRY_FORWARD (ops/commercial) |
| GHSA-w5hq-g745-h8pq | FIX_IN_EOS_2_MAINTENANCE when feasible |
| PITR recommended | CARRY_FORWARD (ops) |
| Customer legal hold | CARRY_FORWARD (EOS-2.23) |
| Policy package legal review | CARRY_FORWARD (commercial/legal) |
| Non-D1 / external solver qualification | TARGET_IN_EOS_3 only via separate qualification tracks |
| Certifications (SOC2/ISO/EU AI Act) | CARRY_FORWARD (compliance programs; never invent claims) |
