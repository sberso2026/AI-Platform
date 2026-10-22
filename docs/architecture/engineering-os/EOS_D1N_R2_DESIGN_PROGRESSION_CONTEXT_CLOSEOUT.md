# EOS-D1N-R2 Design Progression Context Closeout

## 1. Purpose

R2 records where a Structural design is said to be in the D1N progression model. It records an explicitly supplied stage on an existing R1 orchestration context. It does not decide whether the design deserves to be at that stage.

## 2. Five-state progression vocabulary

The only authoritative states are CONCEPT, PREFEASIBILITY, FEASIBILITY, FEED, and DETAILED_DESIGN. An unknown token is rejected. A freeform label is rejected. The first record may be any of the five states. R2 does not require the design to have passed through an earlier state.

## 3. R1 context reuse

Every progression record is stored against an orchestration context created by the R1 runtime. R2 does not create a second orchestration-context identity. The R1 record remains unchanged, and its design-progression field stays empty.

## 4. Exact context binding

The caller supplies the orchestration context id and that context's canonical fingerprint. Floating labels such as latest context, current orchestration, and active project context are rejected. A missing context, a fingerprint that does not match, and a context that is no longer current are rejected.

## 5. Explicit stage assignment

The design-progression state comes only from the supplied input. Omitting it is rejected. Recording FEED, or DETAILED_DESIGN, does not mark prerequisites satisfied, a transition approved, engineering validated, engineering approved, or the work certified.

## 6. No stage inference

R2 does not infer a stage from evidence, elapsed time, AI judgment, analysis quantity, document completeness, or BIM maturity. An inference request is rejected.

## 7. Lifecycle-stage distinction

The R1 cited lifecycle stage is copied onto the progression record as a citation. It is not mapped into the design-progression state. The two fields may contain the same word and still remain different facts. Automatic lifecycle-to-progression mapping is not implemented.

## 8. Authority

The recording authority is the existing orchestration-context authority. That authority is not stage approval, engineering approval, engineering validation, or certification. AI and administrator actors are rejected. Administrator role alone cannot approve a transition.

## 9. Provenance

A non-empty provenance reference is required and remains on the record after supersession.

## 10. Fingerprint

The progression fingerprint uses the canonical EOS fingerprint function. It covers the progression id, orchestration context id and fingerprint, Structural identity, tenant, workspace, project, explicit stage, provenance, authority, and predecessor id. Record status is outside the fingerprint. A substituted fingerprint is rejected. A matching fingerprint is not stage approval, engineering validation, or certification.

## 11. Immutability

The stored record is frozen. Rewriting CONCEPT to FEED in place is rejected.

## 12. History

Creation and supersession append history. A later explicit record may name the current record as predecessor. The earlier record keeps its stage, provenance, and fingerprint. The later record is not treated as an approved transition.

## 13. Duplicate and replay governance

The same progression id and fingerprint returns the existing record. A different fingerprint on that id is a conflict. A second current progression record for the same orchestration context is rejected unless it supersedes the current record. An unchanged successor is rejected.

## 14. Spoofing protection

The runtime rejects substitution of the orchestration context, its fingerprint, tenant, workspace, project, Structural identity, lifecycle citation, progression state, authority, provenance, and progression fingerprint.

## 15. AI and administrator boundaries

AI cannot infer, assign, or advance an authoritative stage, mark prerequisites satisfied, or approve a transition. Administrator authority cannot record the stage and cannot approve a transition by role alone. Neither is engineering authority.

## 16. Consolidated R2 boundary matrix

The consolidated R2 boundary is the single statement of what this phase cannot do. Prerequisite assessment, evidence-gap assessment, next-action generation, stage-transition request and approval, human and review gates, alternative branches, currentness reassessment, and D1M, D1K, and D1L runtime integration stay at count zero. Engineering validation, engineering approval, solver execution, conformance, certification, structural-calculation authorship, and CAD or BIM interpretation stay at count zero. Automatic progression stays at count zero.

## 17. Cross-track boundaries

D1M remains complete with limitations and is not reopened. D1K internal integration and cross-discipline intelligence remain not ready, and D1K limitations remain. D1L remains complete with limitations. D9 and D2-D8 runtime remain not started and at count zero. No parallel currentness engine and no parallel digital thread were created. A stale or reassessment request is rejected.

## 18. Security evidence

Context binding, allowlist enforcement, scope isolation, provenance, authority, fingerprint, history, duplicate handling, and AI and administrator rejection are covered by the R2 runtime tests. The known EOS-A16D security baseline is unchanged. R2 does not weaken AAL2 guards and does not add a secret.

## 19. Release evidence

The runtime and capability manifest are release-sensitive. The closeout document is not. Release classification stays on the existing global release classification. R2 does not promote prerequisite assessment, stage transition, human gates, alternative branches, validation, approval, conformance, certification, D1K readiness, D1L eligibility, D9, D2-D8, or general availability.

## 20. Runtime and readiness

D1N runtime remains started. The runtime count is two: the R1 orchestration-context runtime and this progression-context runtime. Identity runtime stays ready. Design-progression runtime is ready. Prerequisite, stage-transition, human-gate, alternative-branch, currentness-reassessment, and handoff-integration runtime stay not ready. No database schema change and no new dependency were added. Open structural debt and the incomplete D1 structural pack remain.

## 21. Next authorized phase

The next phase is EOS-D1N-R3-PREREQUISITE-ASSESSMENT-AND-EVIDENCE-GAPS, type PREREQUISITE_ASSESSMENT_AND_EVIDENCE_GAPS. Its scope is bounded prerequisite and evidence-gap records against the current orchestration and progression context. R3 may record a required input as present, missing, stale, requiring external authority, or available with limitations. R3 must still not request or approve a stage transition, execute a human gate, select an alternative, validate engineering, approve engineering, or certify. R3 is not started by this closeout.
