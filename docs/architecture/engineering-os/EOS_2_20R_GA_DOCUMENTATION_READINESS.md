# EOS 2.20R GA Documentation Readiness

`GA_DOCUMENTATION_PACKAGE_COMPLETE=YES`

`GA_PRODUCT_CLAIMS_REVIEW=PASS`

`GA_COMPLIANCE_DOCUMENTATION_READY=YES`

`GA_DOCUMENTATION_STATUS=READY`

`GA_AI_RETRIEVAL_LIMITATION_DOCUMENTED=YES`

`GA_MDR_LIMITATION_DOCUMENTED=YES`

`FORMAL_SOC2_CERTIFIED=NO`

`FORMAL_ISO27001_CERTIFIED=NO`

`FORMAL_EU_AI_ACT_CERTIFIED=NO`

## Customer-facing package (bounded)

Primary entry points:

- `EOS_2_20_GA_SCOPE_AND_LIMITATIONS.md` — supported/excluded scope
- `EOS_2_20_GA_CLAIM_MATRIX.md` — IMPLEMENTED ≠ VALIDATED ≠ QUALIFIED
- This document — onboarding, AI limits, compliance honesty, MDR/Ask limitations
- `EOS_2_20R_GA_ONBOARDING_AND_OFFBOARDING.md` — access administration
- `EOS_2_20R_GA_COMMERCIAL_READINESS.md` — commercial structure / disclaimers
- `EOS_2_19_BACKUP_RECOVERY_AND_INCIDENT_RUNBOOK.md` — recovery/incident/support

## Required topics covered

| Topic | Coverage |
| --- | --- |
| Product overview / supported scope | Scope & limitations |
| Excluded/unqualified scope | Scope & limitations |
| Engineering Basis, disciplines, revisions, interfaces, change, deliverables, freeze | Claim matrix + prior EOS 2.x capability docs |
| Engineering AI + limits + authority | Ask corpus limitation; no approval/IFC/release/materiality |
| Structural D1 QUALIFIED_BOUNDED | Preserved |
| Non-D1 calc / external solvers | NOT_QUALIFIED / NO |
| Roles / authority | Enrollment + entitlement admin owner/admin; engineering authorities unchanged |
| EOS 1 coexistence | No auto-migration |
| Onboarding / offboarding | Dedicated doc + APIs |
| Data handling / privacy / security overview | Bounded compliance statements below |
| Backup/recovery / incident/support | EOS 2.19 runbook retained |
| Known limitations / release notes | Register + this remediation |

## Claims discipline

Eight discipline workflows ≠ eight qualified calculation engines. Connector availability ≠ solver qualification.

## AI retrieval limitation

Ask grounds on indexed documents/project intelligence. EOS 2 pilot-workflow / GA entitlement tables are outside that corpus; abstention is correct and preferred.

## MDR limitation

No separate MDR page; design-freeze/deliverable surfaces remain the governed path (`UX_LIMITATION`, usable).

## Compliance statements (bounded, non-certified)

- GDPR/privacy-by-design: tenant isolation, least privilege, minimization intent, audit of governed actions
- EU AI Act readiness: AI decision-support with human authority retained; not certified
- Least privilege / auditability: RLS + role gates + entitlement/enrollment audit
- NIS2-oriented cybersecurity controls: access control, logging, incident severity model — not a certification claim
- Configurable jurisdiction profiles / supported data residency: architecture supports profiles; not every jurisdiction commercially deployed
- SOC 2 readiness: control intent documented; **not SOC 2 certified**
