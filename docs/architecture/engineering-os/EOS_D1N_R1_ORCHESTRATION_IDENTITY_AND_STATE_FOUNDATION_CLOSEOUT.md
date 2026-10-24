# EOS-D1N-R1 Orchestration Identity and State Foundation Closeout

## 1. Purpose

R1 records one governed Structural orchestration context. The context answers which identity exists, which Structural identity it cites, which tenant, workspace, and project own it, which lifecycle-stage context it cites, which authority recorded it, which provenance supports it, and which fingerprint and history identify it. R1 does not progress the design.

## 2. Orchestration-context identity

The runtime is one in-memory context record. Its identity is the caller-supplied context id. Floating labels are rejected. The same id with the same fingerprint is a replay and returns the existing record. The same id with a different fingerprint is a conflict. A second current context with the same scope, Structural identity, cited stage, and provenance is rejected.

## 3. D1A identity reuse

The context stores a reference to a Structural identity that already exists in the supplied catalog. The kind must be one of the D1A structural object kinds on that catalog entry. R1 does not create a Structural member, system, or parallel identity model.

## 4. Tenant, workspace, and project scope

The actor scope and the cited Structural identity must be the same tenant, workspace, and project. A caller-supplied tenant, workspace, or project that disagrees with the actor is rejected. Default behavior is strict isolation.

## 5. Lifecycle-stage citation

R1 accepts a citation of CONCEPT, PREFEASIBILITY, FEASIBILITY, FEED, or DETAILED_DESIGN. CONSTRUCTION, COMMISSIONING, OPERATIONS, and MODIFICATION are rejected as outside the D1N span. An unknown stage is rejected. The citation is not a design-progression state. R1 does not calculate, infer, advance, or approve a stage. Progression belongs to EOS-D1N-R2-DESIGN-PROGRESSION-CONTEXT.

## 6. Provenance

A non-empty provenance reference is required and stored on the record. An empty reference is rejected. The reference remains on the historical record after supersession.

## 7. Authority

The only accepted recording authority is ORCHESTRATION_CONTEXT_AUTHORITY. That authority is not engineering approval, engineering validation, or certification. AI and administrator actors are rejected.

## 8. Fingerprint

The context fingerprint uses the canonical EOS fingerprint function. Identity fields are the context id, Structural identity and kind, tenant, workspace, project, cited stage, provenance, recording authority, and predecessor id. Record status is outside the fingerprint. A caller-supplied fingerprint that does not match the canonical value is rejected. A matching fingerprint is not engineering validation, stage approval, or certification.

## 9. Immutability

The stored record is frozen. In-place mutation is rejected. A later change requires a new context id and a current predecessor.

## 10. History

Creation and supersession append history events. Reconstruction returns the stored record, including a superseded predecessor, with its original fingerprint and provenance.

## 11. Duplicate and replay governance

Replay of the same context id and fingerprint returns the existing record. A conflicting fingerprint on that id is rejected. An unchanged successor is rejected. A second current duplicate of the same scope, identity, stage, and provenance is rejected.

## 12. Spoofing controls

The runtime rejects substitution or stripping of tenant, workspace, project, Structural identity, lifecycle citation, provenance, authority, and fingerprint. A cited kind that disagrees with the catalog entry is rejected.

## 13. AI and administrator boundaries

AI cannot invent the context id, tenant, workspace, project, lifecycle citation, provenance, or authority, and cannot mark the context engineering-validated. Administrator authority cannot record the context and is not engineering authority.

## 14. Consolidated prohibited-runtime matrix

The D1N-0 consolidated boundary remains the single statement of what R1 cannot do. Design progression, prerequisite assessment, evidence-gap assessment, next-action generation, stage-transition request and approval, human and review gates, alternative branches, and D1M, D1K, and D1L runtime integration stay at count zero. Engineering validation, engineering approval, solver execution, conformance, certification, structural-calculation authorship, and CAD or BIM interpretation stay at count zero. Orchestration does not equal validation, approval, certification, or autonomous design authority.

## 15. Neighbour boundaries

D1M remains complete with limitations and is not reopened. D1K internal integration and cross-discipline intelligence remain not ready, and D1K limitations remain. D1L remains complete with limitations. D9 and D2-D8 runtime remain not started and at count zero. No parallel currentness engine and no parallel digital thread were created. The context cites currentness only as the existing current label. A stale or reassessment request is rejected.

## 16. Security evidence

Scope isolation, provenance, authority, fingerprint, history, duplicate handling, and AI and administrator rejection are covered by the R1 runtime tests. The known EOS-A16D security baseline is unchanged. R1 does not weaken AAL2 guards and does not add a secret.

## 17. Release evidence

The runtime and capability manifest are release-sensitive. The closeout document is not. Release classification stays on the existing global release classification. R1 does not promote validation, approval, certification, D1K readiness, D1L eligibility, D9, D2-D8, or general availability.

## 18. Runtime and readiness

D1N runtime has started. The runtime count is one, and that one runtime is the orchestration-context identity envelope. Identity runtime is ready. Design progression, prerequisites, stage transition, human gate, alternative branch, currentness reassessment, and handoff integration remain not ready.

## 19. Remaining debt

C10, D1F, D1G, D1H, D1I, D1J, D1K, and D1L remain limitations that do not block D1N. Post-D1J debt, the D1G certification blocker, D1K limitations, and the GA security debt remain. The D1 structural pack remains incomplete. R1 resolves none of this debt. No database schema change and no new dependency were added.

## 20. Next authorized phase

The next phase is EOS-D1N-R2-DESIGN-PROGRESSION-CONTEXT, type DESIGN_PROGRESSION_CONTEXT. Its scope is a governed design-progression context for CONCEPT, PREFEASIBILITY, FEASIBILITY, FEED, and DETAILED_DESIGN. R2 must still not assess prerequisites, generate evidence-gap assessments, request or approve stage transitions, execute human gates, select alternatives, validate engineering, approve engineering, or certify. R2 is not started by this closeout.
