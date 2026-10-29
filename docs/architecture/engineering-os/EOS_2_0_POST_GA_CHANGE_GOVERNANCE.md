# EOS 2.0 Post-GA Change Governance

`EOS_2_POST_GA_CHANGE_CLASSIFICATION_DEFINED=YES`

`POST_GA_QUALIFICATION_INVALIDATION_RULE_READY=YES`

`POST_GA_SECURITY_RELEASE_GATE_MANDATORY=YES`

`POST_GA_TENANT_ISOLATION_RELEASE_BLOCKER=YES`

`POST_GA_AI_AUTHORITY_ESCALATION_REQUIRES_REAPPROVAL=YES`

## Change classes

### CLASS_0_DOCUMENTATION_ONLY

No runtime/schema/claim semantic impact.

- Staging: optional
- Tests: docs consistency / claim honesty review
- Qualification impact: none
- Security gate: not required for pure docs
- Release authority: documentation maintainer under GA authority oversight
- Production: N/A
- Rollback/recovery: N/A

### CLASS_1_LOW_RISK_RUNTIME

Bug fix with no engineering formula/result semantic impact.

- Staging: required
- Tests: targeted regression + release suite subset as applicable
- Qualification impact: assessment required; usually none if semantics unchanged
- Security gate: **mandatory** (`pnpm eos2:canonical-gates` or successor)
- Release authority: Production release authority
- Production: controlled deploy of exact candidate
- Rollback/recovery: prior Ready deployment retained

### CLASS_2_SCHEMA_OR_WORKFLOW

Additive schema or material workflow change.

- Staging: required; migration rehearsal required
- Tests: persistence + RLS + workflow + release suite
- Qualification impact: assessment required
- Security gate: mandatory
- Release authority: Production release authority
- Production: additive migrations only; ledger verify; recovery evidence
- Rollback/recovery: schema recoverability + app rollback plan

### CLASS_3_ENGINEERING_SEMANTIC

Engineering formula, result semantic, qualification, or governed engineering behavior change.

- Staging: required
- Tests: full engineering + security + qualification packs
- Qualification impact: **requalification required** before Production claim update
- Security gate: mandatory
- Release authority: human Production/GA release authority + qualification owner
- Production: blocked until requalification evidence accepted
- Rollback/recovery: mandatory plan; D1 baseline may invalidate

### CLASS_4_SECURITY_CRITICAL

Critical security or isolation remediation.

- Staging: required unless emergency procedure explicitly authorizes Production-first with immediate evidence
- Tests: isolation + authority + security suite
- Qualification impact: assess collateral engineering impact
- Security gate: mandatory; any RLS/tenant-isolation regression is a **release blocker**
- Release authority: security + Production release authority
- Production: controlled; kill switch / rollback ready
- Rollback/recovery: mandatory

## Qualification invalidation

Any change to engineering formula, result semantics, qualified calculation workflow, governing standards implementation, or deterministic decision semantics **must** trigger qualification impact assessment. GA status does **not** automatically transfer to materially changed engineering behavior.

## AI authority escalation

Any change granting AI engineering approval, materiality finalization, deliverable/release approval, IFC release, certification, or Product GA release authority requires new explicit human governance and qualification. Default remains `NO`.
