# ERA Target Architecture v1.0

**Status:** Architecture freeze document. Not an implementation authorization.  
**Baseline:** ERA-7C on branch `cursor/era-7a-engineering-review-pilot-gate`, SHA `0c32857efbe864bdcfa3fcebb33961aca5615466`.  
**Staging project:** `rntonzigxwxcjlcsadip` (do not migrate Review controls to EOS `wcydlhqiqdwgoaqrlget`).

Governing principle: **evidence before expansion**.

---

## Boundary

| System | Role |
| --- | --- |
| Engineering OS | **System of record** — projects, documents, assets, requirements, risks, decisions, actions, TQs, interfaces, vendors, workflow, approvals |
| ERA | **System of reasoning** — findings, observations, evidence relationships, future change/impact/attention/readiness assessments |
| Human | **System of authority** — disposition, risk acceptance, IFC, sign-off |

ERA must not autonomously approve engineering work, authorize IFC, accept residual engineering risk, modify authoritative engineering documents, close authoritative project decisions, override engineers, or create an alternative system of record.

Do not duplicate EOS registers inside ERA. Review findings may convert to Core objects only after a human disposition.

---

## Planes

### 1. Trust, Security & Governance

**CURRENTLY IMPLEMENTED**

- Tenant + workspace isolation on Review tables; Core workspace RLS for projects/documents used by Review
- Trusted Review service boundary; no service-role in the browser
- Tenant A `engineeringReview.requireMfa=true`; AAL1 rejected; MFA enroll/challenge UI
- Canonical Tenant A / WS A1 selection (ERA-7B)
- Fail-closed file ingest + local ClamAV (CLEAN / EICAR / timeout / unavailable / PENDING_SCAN)
- Trusted audit on package / run / disposition
- Security schema verification; secret scan; hosted RLS CI job (fail-closed if staging secrets missing)
- Deterministic default pipeline (no live LLM required)

**TARGET / EVIDENCE-DEPENDENT**

- Live AAL2 for named pilot `cert-er-a1`
- Hosted `RTB_REVIEW_CLAMAV_URL` on the Review app runtime (GitHub secret name absent; local/web `.env.local` key absent; process unset)
- Enterprise production hardening beyond the controlled-pilot residual-dependency acceptance

### 2. Observation & Evidence

**CURRENTLY IMPLEMENTED**

- Review Package membership references EOS/PI documents (no byte copy)
- Frozen `FindingEvidence` (document, revision, page/section/chunk/span, content hash)
- Evidence verification and suppression of unsupported claims
- Package inclusion `current | superseded`
- PI readiness gating (`READY_MACHINE_READABLE` vs OCR / unsupported / failed)

**TARGET / EVIDENCE-DEPENDENT**

- Temporal evidence graph
- Automatic approved-versus-draft EOS authority mapping on every citation
- Quantitative evidence-coverage scoring when underlying data is absent — **must not be invented**

### 3. Engineering Knowledge & Temporal Context

**CURRENTLY IMPLEMENTED**

- Fact / requirement / assumption / revision-ref extraction from machine-readable text
- Revision-inconsistency detector for conflicting current inclusions and stale references
- Superseded package members are not treated as current authority for ordinary claim support

**TARGET / EVIDENCE-DEPENDENT — TARGET_ARCHITECTURE_NOT_AUTHORIZED_FOR_BUILD**

- Change Intelligence
- Engineering Decision Memory expansion
- Full temporal / knowledge graph infrastructure

### 4. Engineering Reasoning

**CURRENTLY IMPLEMENTED**

- Deterministic detectors: cross-document inconsistency, missing information, design-basis (limited), requirement traceability, unsupported assumptions, revision inconsistency, missing evidence
- Rejecting inference provider (no network in default tests)
- Human-only accept / reject / modify / assign / close

**TARGET / EVIDENCE-DEPENDENT — TARGET_ARCHITECTURE_NOT_AUTHORIZED_FOR_BUILD**

- Impact Intelligence
- Contradiction Intelligence
- Assumption Intelligence expansion
- CAD/BIM reasoning
- FEA reasoning
- Live LLM review
- Autonomous engineering actions

### 5. Assurance & Epistemic State

**CURRENTLY IMPLEMENTED**

- Finding `reasoningBasis`: EVIDENCE_BASED / DERIVED / ASSUMED / INSUFFICIENT_EVIDENCE / CONFLICTING
- Finding `verificationState` separate from workflow `status`
- PILOT-0 derived epistemic states: SUPPORTED, CONTRADICTED, UNRESOLVED, INSUFFICIENT_EVIDENCE, OUTSIDE_SCOPE, NOT_ASSESSED
- Zero-finding package epistemic state is **NOT_ASSESSED** (silence is not assurance)
- Closed workflow does not prove technical correctness

**TARGET / EVIDENCE-DEPENDENT**

- Persisted epistemic column (not required for PILOT-1 if derived state remains sufficient)
- Readiness Intelligence — TARGET_ARCHITECTURE_NOT_AUTHORIZED_FOR_BUILD

### 6. Explainability & Attention

**CURRENTLY IMPLEMENTED**

- Finding → reasoning summary → evidence → source document / revision / locator
- PILOT-0 `explainFinding()`: why / evidence / sources / assumptions / unknowns / exclusions / coverage
- Coverage is declared unmeasured when no quantitative metric exists
- No stored chain-of-thought

**TARGET / EVIDENCE-DEPENDENT — TARGET_ARCHITECTURE_NOT_AUTHORIZED_FOR_BUILD**

- Attention Model
- Graph visualization
- Executive dashboard expansion

### 7. Human Authority & Learning

**CURRENTLY IMPLEMENTED**

- Append-only human dispositions
- Review Register
- AI cannot dispose
- Disclaimer on every result path

**TARGET / EVIDENCE-DEPENDENT**

- PILOT-1 blinded adjudication and capability envelope (protocol only in this phase)
- Engineering Decision Memory expansion — TARGET_ARCHITECTURE_NOT_AUTHORIZED_FOR_BUILD

---

## Currently implemented capability (summary)

Bounded first-pass Review: package, scope, run, deterministic findings, evidence verification, human register, MFA-gated `/review`, workspace-isolated RLS, fail-closed malware policy, trusted audit.

## Target capabilities not authorized for build

Change Intelligence; Impact Intelligence; Contradiction Intelligence; Assumption Intelligence expansion; Attention Model; Readiness Intelligence; Engineering Decision Memory expansion; CAD/BIM reasoning; FEA reasoning; autonomous engineering actions; AI risk scores; AI maturity scores; live LLM; graph visualization; billing / commercial packaging.

Do not implement speculative graph infrastructure because this document mentions it.

---

## Authority

This document freezes **intent**. Implementation of TARGET items requires:

1. PILOT-1 evidence of a material problem,
2. root-cause analysis supporting a software intervention,
3. an approved Capability Investment Case.
