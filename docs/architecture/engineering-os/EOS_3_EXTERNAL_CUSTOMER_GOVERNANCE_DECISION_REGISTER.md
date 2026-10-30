# EOS 3 External Customer Governance Decision Register

`PHASE=EOS-3-EXTERNAL-CUSTOMER-GOVERNANCE-DECISION-RESOLUTION`  
`EOS_3_GOVERNANCE_DECISION_EVIDENCE_COMPLETE=YES`  
`EOS_3_GOVERNANCE_DECISION_FABRICATION_COUNT=0`  
`TIMESTAMP_UTC=2026-10-30T00:05:00Z`  
Evidence source: `EOS_3_EXTERNAL_CUSTOMER_GOVERNANCE_DECISION_BUNDLE.json`

Accountable decision authority for this bundle: **Silvestre Berso**, Founder, RTB Engineering & Analytics (business-risk / commercial / controlled external software-release governance).

---

## RG-001 — Contract acceptance

| Field | Value |
|-------|-------|
| Decision | `APPROVED_WITH_CONDITIONS` |
| Decision basis | Approve RTB standard controlled-design-partner contract framework as default external contracting basis |
| Conditions | Claims within frozen matrix; LLM/connectors NOT_SUPPORTED; D1 QUALIFIED_BOUNDED; non-D1 NOT_QUALIFIED; migration NOT_SUPPORTED_INITIAL_RELEASE; PITR disclosed; human engineering authority; non-standard → risk-based path; outside guardrails → escalate |
| Accountable authority | Silvestre Berso |
| Residual risk | Customer-specific non-standard terms may still require escalation |
| Release impact | NO longer release-blocking |
| Technical-reopen impact | NO |
| Release-blocking | NO |

## RG-002 — Pricing

| Field | Value |
|-------|-------|
| Decision | `APPROVED_WITH_CONDITIONS` |
| Pricing model | `CUSTOM_QUOTE_CONTROLLED_DESIGN_PARTNER` |
| Decision basis | No universal list price required for platform release eligibility; customer-specific quote before contract/invoice |
| Conditions | Document and commercially approve exact price before contract execution |
| Accountable authority | Silvestre Berso |
| Residual risk | Quote negotiation delay (commercial, not platform) |
| Release-blocking | NO |
| Technical-reopen impact | NO |
| Global list price required before release | NO |
| Customer-specific price before contract | YES |

## RG-003 — Insurance

| Field | Value |
|-------|-------|
| Decision | `ACCEPTED_WITH_LIMITATIONS` |
| Decision basis | Bounded governance without claiming unverified coverage |
| Conditions | No misrepresentation; no unverified coverage in contracts; customer-mandatory insurance met if required; residual business-risk retained; management may obtain PI/cyber/E&O as appropriate |
| Coverage claim verified | `NO_UNVERIFIED_CLAIM_MADE` |
| Accountable authority | Silvestre Berso |
| Residual risk | Unconfirmed broader insurance adequacy (business risk) |
| Release-blocking | NO |
| Technical-reopen impact | NO |

## RG-004 — Risk-based legal path

| Field | Value |
|-------|-------|
| Decision | `CONDITIONAL_PATH_ACTIVE` |
| Legal review required | `CONDITIONAL` |
| Legal path stable | YES |
| Decision basis | Preserve approved risk-based model; no customer-specific non-standard terms in this phase |
| Release-blocking | NO |
| Technical-reopen impact | NO |

## RG-005 — Commercial approval

| Field | Value |
|-------|-------|
| Decision | `APPROVED_WITH_CONDITIONS` |
| Release mode | `CONTROLLED_DESIGN_PARTNER_RELEASE` |
| Cohort maximum | 1 |
| Decision basis | Invite-only; entitlement+enrollment; default deny; no public signup; frozen claims; custom quote; controlled onboard/offboard |
| Accountable authority | Silvestre Berso |
| Residual risk | Pressure to expand cohort without new approval |
| Release-blocking | NO |
| Technical-reopen impact | NO |

## RG-006 — PITR / GHSA risk acceptance

| Field | Value |
|-------|-------|
| PITR decision | `ACCEPTED_WITH_CONDITIONS` |
| PITR enabled | NO |
| PITR customer claim accurate | PASS |
| PITR conditions | Accurate representation; backups/restore active; no PITR promise in contracts; recovery commitments match capability; PITR remains hardening backlog; future customer may block onboarding if PITR contractually required |
| GHSA decision | `ACCEPTED_WITH_CONDITIONS` |
| GHSA status | `ACCEPTED_BOUNDED_RISK_CONTROLLED_INVITE_ONLY` |
| GHSA conditions | No material exploitability change; mitigations remain; no new Critical/High; security gate PASS; monitor; reassess if exposure changes |
| Accountable authority | Silvestre Berso |
| Release-blocking | NO |
| Technical-reopen impact | NO |

## RG-007 — External release authority

| Field | Value |
|-------|-------|
| Decision | `RESOLVED_AUTHORITY_DESIGNATED` |
| Name | Silvestre Berso |
| Role | Founder, RTB Engineering & Analytics |
| Scope | `EOS_3_CONTROLLED_EXTERNAL_CUSTOMER_SOFTWARE_RELEASE_ONLY` |
| Does not grant | Engineering approval; IFC; PE certification; regulatory; customer engineering; solver qualification; deliverable approval |
| Release-blocking | NO |
| Technical-reopen impact | NO |

## RG-008 — Human external customer GO

| Field | Value |
|-------|-------|
| Decision | `APPROVED` |
| Human GO | `ISSUED` (2026-10-30T00:30:00Z) |
| Release-blocking | NO |
| Technical-reopen impact | NO |
| Evidence | Explicit authorization statement from Silvestre Berso; fingerprint `sha256:45d088c7386ad3c9c22cbfc144b6261aba2ca7dd9535ea9483621a9360f357ab` |
| Next phase | `EOS-3-EXTERNAL-CUSTOMER-CONTROLLED-ONBOARDING` |

---

## Closeout counts

| Metric | Value |
|--------|-------|
| Release-blocking items | 0 |
| Implementation blockers | 0 |
| Fabrication count | 0 |
| Owner coverage | 100% |
| Human GO | ISSUED |
