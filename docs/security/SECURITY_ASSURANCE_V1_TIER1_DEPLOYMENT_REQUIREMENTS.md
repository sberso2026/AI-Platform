# Security & Assurance V1 — Tier-1 Deployment Requirements

Status: Frozen with Security & Assurance V1.0 GA · Phase 15I

## Critical distinction

**Security & Assurance V1 GA ≠ Tier-1 customer production approval.**

Subsystem GA certifies that Security & Assurance (controls, evidence, assessment,
isolation/AI/compute assurance, compliance intelligence, customer assurance) is
production-ready as a platform capability.

It does **not** authorize Tier-1 enterprise customer production without additional
program and identity prerequisites.

## Tier-1 production currently requires at minimum

1. **S07** — independent external penetration testing  
   Status: `REQUIRED_BEFORE_TIER1_PRODUCTION` · `S07ExternalPenTestComplete=false`

2. **S08** — production-ready customer enterprise SSO  
   Status: `REQUIRED_BEFORE_TIER1_PRODUCTION` · `S08CustomerSsoProductionReady=false`  
   Owner: **Platform Identity** (not Security & Assurance)

3. Customer-specific procurement / security questionnaire / contractual requirements

## Ownership reminder

- S07: Platform Security program + external provider; Sec&A evidences/references only
- S08: Platform Identity OWNS; Sec&A evidences readiness only

Do not fabricate S07/S08 completion as part of Security & Assurance V1 GA.
