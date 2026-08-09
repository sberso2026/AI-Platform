# ASD Essential Eight — Applicability Assessment

Status: Phase 14C · `EssentialEightApplicabilityAssessed = true`  
`essentialEightMaturityClaimed = false`

Honest preliminary applicability for RTB SaaS + corporate admin environments.
This is **not** a maturity-level declaration.

| Strategy | SaaS runtime applicability | Corporate/admin IT applicability | Evidence posture |
| --- | --- | --- | --- |
| Application control | Partial (host/exec sandbox bounded) | Applicable | ready_bounded / gap |
| Patch applications | Partial (deps/SCA gap) | Applicable | requires_closure (S02) |
| Configure MS Office macros | Not applicable (SaaS) | Applicable if Office used | NOT_APPLICABLE (runtime) |
| User application hardening | Partial (browser clients) | Applicable | ready_bounded |
| Restrict administrative privileges | Applicable | Applicable | requires_closure (S01) |
| Patch operating systems | Provider-managed (hosted) | Applicable | external_provider |
| Multi-factor authentication | Applicable | Applicable | requires_closure (S01) |
| Regular backups | Applicable | Applicable | ready_bounded / restore test gap S06 |

Do not self-declare Maturity Level 1/2/3 without complete requirement evidence.
