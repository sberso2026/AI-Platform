# EOS 3 External Customer Governance Decision Register

`EOS_3_RESIDUAL_GOVERNANCE_REGISTER_LOADED=YES`  
`EOS_3_RESIDUAL_GOVERNANCE_ITEM_COUNT_START=8`  
`EOS_3_GOVERNANCE_ITEM_STATE_MODEL_VERIFIED=YES`  
`EOS_3_GOVERNANCE_DECISION_EVIDENCE_MODEL=PASS`  
`PHASE=EOS-3-EXTERNAL-CUSTOMER-GOVERNANCE-DECISION-CLOSEOUT`  
`TIMESTAMP_UTC=2026-10-29T23:50:00Z`

State model: `OPEN` | `DECISION_REQUIRED` | `APPROVED` | `APPROVED_WITH_CONDITIONS` | `REJECTED` | `DEFERRED` | `NOT_REQUIRED` | `CLOSED`

No decisions invented. Prior technical readiness is preserved; this register records governance state only.

---

## RG-001 — Contract acceptance

| Field | Value |
|-------|-------|
| Category | `CONTRACT_ACCEPTANCE` |
| Description | Accept standard DESIGN_PARTNER contract package for controlled external release |
| Accountable owner | Silvestre Berso |
| Decision authority | Commercial / founder authority |
| Current state | `DECISION_REQUIRED` |
| Decision status | `DEFERRED` |
| Risk | Medium |
| Existing controls | Package elements defined; claim matrix frozen; limitations disclosure ready |
| Residual risk | Activation without binding terms |
| Decision required | Accept standard package or approve deviations |
| Decision made | **None recorded in this phase** — package defined, not accepted |
| Conditions | — |
| Release impact | Blocking for activation |
| Evidence reference | `EOS_3_EXTERNAL_CUSTOMER_LEGAL_COMMERCIAL_REQUIREMENTS.md` |
| Closure condition | Written acceptance / executed instrument |
| Implementation reopen required | NO |
| Timestamp | 2026-10-29T23:50:00Z |

## RG-002 — Pricing

| Field | Value |
|-------|-------|
| Category | `PRICING_APPROVAL` |
| Description | Finalize DESIGN_PARTNER pricing / deferred / nominal terms |
| Accountable owner | Silvestre Berso |
| Decision authority | Commercial authority |
| Current state | `DECISION_REQUIRED` |
| Pricing status | `DEFERRED` |
| Risk | Low–Medium |
| Existing controls | Commercial model defined; human-gated entitlement |
| Residual risk | Terms mismatch |
| Decision required | Written pricing decision |
| Decision made | **None** — status remains NOT_FINALIZED |
| Release impact | Blocking for paid activation; deferred-pricing needs commercial approval |
| Evidence reference | Legal/commercial requirements |
| Closure condition | DEFINED or DESIGN_PARTNER_DEFERRED approved in writing |
| Implementation reopen required | NO |
| Timestamp | 2026-10-29T23:50:00Z |

## RG-003 — Insurance

| Field | Value |
|-------|-------|
| Category | `INSURANCE_CONFIRMATION` |
| Description | Confirm insurance covers intended DESIGN_PARTNER software/customer activity |
| Accountable owner | Silvestre Berso |
| Decision authority | Founder / risk owner |
| Current state | `DECISION_REQUIRED` |
| Insurance status | `REVIEW_PENDING` |
| Risk | Medium |
| Existing controls | Review required flagged; no coverage claimed |
| Residual risk | Uninsured exposure |
| Decision required | Confirm policy adequacy or endorsement |
| Decision made | **None** — no broker/policy confirmation on file |
| Release-blocking | YES |
| Evidence reference | Residual governance register RG-003 |
| Closure condition | Documented confirmation |
| Implementation reopen required | NO |
| Timestamp | 2026-10-29T23:50:00Z |

## RG-004 — Risk-based legal path

| Field | Value |
|-------|-------|
| Category | `LEGAL_OR_SPECIALIST_REVIEW` |
| Description | Adopt and apply risk-based legal/specialist escalation path |
| Accountable owner | Silvestre Berso |
| Decision authority | Founder; escalate to counsel on triggers |
| Current state | `APPROVED` (path model) |
| Legal review required | `CONDITIONAL` |
| Legal review status | `PATH_DEFINED_PENDING_CUSTOMER_TERMS` |
| Risk | Conditional |
| Existing controls | Risk-based model + AI-assisted contract review classification |
| Residual risk | Non-standard terms accepted without escalation |
| Decision required | Apply path when customer terms exist |
| Decision made | **Path model APPROVED** in prior readiness phase; no customer-specific term review yet |
| Release impact | Blocking only if escalated material risk unresolved |
| Evidence reference | `EOS_3_AI_ASSISTED_CONTRACT_REVIEW_MODEL.md` |
| Closure condition | Per-customer classification logged; escalate if material |
| Implementation reopen required | NO |
| Timestamp | 2026-10-29T23:50:00Z |

## RG-005 — Commercial approval

| Field | Value |
|-------|-------|
| Category | `COMMERCIAL_APPROVAL` |
| Description | Approve controlled external DESIGN_PARTNER cohort (count=1, invite-only) |
| Accountable owner | Silvestre Berso |
| Decision authority | Commercial / founder |
| Current state | `DECISION_REQUIRED` |
| Commercial approval | `DEFERRED` |
| Risk | Medium |
| Existing controls | Cohort/model defined; hold ACTIVE; default deny |
| Residual risk | Premature expansion |
| Decision required | Written commercial approval of cohort constraints |
| Decision made | **None recorded** |
| Release impact | Blocking |
| Evidence reference | Claim matrix; release gate |
| Closure condition | Written approval on file |
| Implementation reopen required | NO |
| Timestamp | 2026-10-29T23:50:00Z |

## RG-006 — PITR / GHSA risk acceptance

| Field | Value |
|-------|-------|
| Category | `RISK_ACCEPTANCE` |
| Description | Formal external-customer acceptance of PITR=NO limitation and GHSA bounded risk for invite-only scope |
| Accountable owner | Silvestre Berso |
| Decision authority | Risk owner / designated release authority |
| Current state | `DECISION_REQUIRED` |
| PITR risk decision | (pending) — prior *technical* disposition was ACCEPTED_WITH_CONTRACTUAL_LIMITATION; **formal governance acceptance not re-issued this phase** |
| GHSA risk decision | (pending) — prior gate status ACCEPTED_BOUNDED_RISK_CONTROLLED_INVITE_ONLY; **formal governance acceptance not re-issued this phase** |
| Recorded decisions for phase output | Treat as not yet closed: require explicit ACCEPTED / ACCEPTED_WITH_CONDITIONS / REJECTED |
| Phase output values | `DEFERRED` mapping — see closeout: use explicit pending via REJECTED=no; status recorded as awaiting owner decision |
| Risk | Medium / Low–Moderate |
| Existing controls | WAL-G; restore procedure; dependency audit; invite-only |
| Residual risk | Recovery granularity; known moderate advisory |
| Release-blocking | YES until accepted or rejected with remediation |
| Evidence reference | External release gate; residual register RG-006 |
| Closure condition | Written risk acceptance or rejection + remediation track |
| Implementation reopen required | NO (unless REJECTED without alternative → remediation track) |
| Timestamp | 2026-10-29T23:50:00Z |

**Phase decision fields (honest):** Without new signed acceptance, do **not** mark ACCEPTED. Output uses pending via non-approval: for required enums, record risk decisions as not completed — closeout document maps to `DEFERRED` equivalent by leaving item OPEN and counting as release-blocking. Required output enums for RG-006 expect ACCEPTED|ACCEPTED_WITH_CONDITIONS|REJECTED — since none issued, item remains open and authorization readiness stays PENDING (not READY_FOR_HUMAN_GO).

## RG-007 — External release authority designation

| Field | Value |
|-------|-------|
| Category | `RELEASE_AUTHORITY_DESIGNATION` |
| Description | Designate authority for controlled external customer software release |
| Accountable owner | Silvestre Berso |
| Decision authority | Founder / org governance |
| Current state | `DECISION_REQUIRED` |
| Designated | NO |
| Name | NOT_DESIGNATED |
| Role | NOT_DESIGNATED |
| Scope | `EOS_3_CONTROLLED_EXTERNAL_CUSTOMER_SOFTWARE_RELEASE_ONLY` (required when designated) |
| Decision made | **None** — GA software authority does not transfer |
| Release impact | Blocking |
| Implementation reopen required | NO |
| Timestamp | 2026-10-29T23:50:00Z |

## RG-008 — Human external customer GO

| Field | Value |
|-------|-------|
| Category | `HUMAN_RELEASE_GO` |
| Description | Explicit human GO for external customer release |
| Accountable owner | Designated external release authority (after RG-007) |
| Decision authority | Designated external release authority |
| Current state | `OPEN` |
| Human GO | `NOT_ISSUED` |
| Decision made | **None** — this phase / prompt is not GO |
| Release impact | Blocking |
| Implementation reopen required | NO |
| Timestamp | 2026-10-29T23:50:00Z |

---

## Summary counts

| Metric | Value |
|--------|-------|
| Items start | 8 |
| Closed / approved (path only) | 1 (RG-004 path model) |
| Still decision-required / deferred | 7 |
| Release-blocking open | 7 (RG-001,002,003,005,006,007,008) |
| Implementation blockers | 0 |
| Owner coverage | 100% |
| Technical reopen | NO |
