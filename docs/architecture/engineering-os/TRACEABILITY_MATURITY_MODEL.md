# EOS-A1 Traceability Maturity Model

Status: **FROZEN** as a planning overlay. **Not enforced** in EOS-A1. No schema or workflow changes.

Evidence HEAD: `0dd05bf124c19e1fbb8099f396a904ec86a2d020`

## 1. Why a maturity model, not a universal mandate

Do **not** impose: “No engineering object exists without Requirement, Assumption, Evidence, Decision and Approval.”

That rule would reject legitimate DRAFT work, imported archives, and partial site data. Traceability is **proportional to maturity, criticality, and safety class**.

Existing object-local statuses remain (project `draft/active/…`, document `draft/issued/…`, ERA package `draft/ready/…`, PI finding `candidate/…`). Maturity is a **cross-cutting expectation**, not a replacement column in this phase.

---

## 2. Maturity states

| State | Meaning | Universal? |
| --- | --- | --- |
| `DRAFT` | Work in progress; identity and provenance only | Yes — all governed objects |
| `WORKING` | Internally used for design/analysis; not issued | Yes |
| `REVIEWED` | Has completed at least one governed review cycle | Objects that participate in Review |
| `VERIFIED` | Acceptance/verification evidence exists for the claim the object makes | Requirements, analyses, changes, value claims |
| `APPROVED` | Named authority has approved | Decisions, documents, baselines |
| `ISSUED` | Released for use by others (for construction, procurement, or operation) | Documents, models, baselines |
| `SUPERSEDED` | Replaced by a later revision/object | Versioned objects |
| `AS_BUILT` | Physical/constructed configuration recorded | Assets, systems, installed CIs |
| `COMMISSIONED` | Accepted into operation | Assets, systems, plants |

**Context-specific, not universal:** `AS_BUILT` and `COMMISSIONED` apply to physical/configuration objects, not to a Requirement or an ERA Finding. `ISSUED` applies to information/configuration, not to an Assumption (assumptions **validate** or **expire**).

Mapping to current enums is **approximate** and must not be used as a silent migration:

- Document `draft` ≈ DRAFT/WORKING; `for_review` ≈ WORKING; `approved` ≈ APPROVED; `issued` ≈ ISSUED; `superseded` ≈ SUPERSEDED.
- ERA package `completed` is REVIEWED at package level, not VERIFIED for every finding.
- Decision `approval_status` is APPROVED only when authority is recorded — current `pending` default is DRAFT/WORKING.

---

## 3. Traceability expectations by state

### DRAFT

- Provenance required (tenant, creator, timestamp).
- Requirement link **recommended where known**.
- Assumptions **explicit where material** (do not invent completeness).
- Evidence not required.
- Approval not required.

### WORKING

- Object identity stable (UUID + human code if the type has one).
- Links to Project (and System/Asset when known).
- Material assumptions listed or cited.
- Changes from DRAFT should not silently drop provenance.

### REVIEWED

- Review Package or equivalent governed review recorded, **or** an accepted waiver with authority.
- Findings either dispositioned or explicitly open.
- ERA Finding evidence rules still apply to ERA findings regardless of object maturity.

### VERIFIED

- Evidence required (`VERIFIED_BY` / ERA Evidence / analysis evidence package).
- Verification record required (method + status).
- Assumptions resolved, accepted, or explicitly carried as residual risk.
- Requirement traceability for the claim under verification.

### APPROVED / ISSUED

- Authority required (human; no autonomous design/safety approval — existing platform rule).
- Approval provenance required (`approved_by`, timestamp, scope).
- Applicable requirements traceable (`ALLOCATED_TO` / `VERIFIED_BY` as known).
- Critical assumptions explicit.
- Configuration context known (revision set / baseline / document revisions in the approval).
- ISSUED additionally requires a configuration or document revision identity others can cite.

### AS_BUILT / COMMISSIONED

- Physical/configuration identity required (Asset tag, installed CI, or equivalent).
- Acceptance evidence required where applicable (test, inspection, commissioning dossier).
- Thread back to ISSUED design configuration (`SUPERSEDES` / baseline comparison) recommended; required for safety-critical classes.

---

## 4. Approval and evidence expectations

| State | Evidence | Approval | Review |
| --- | --- | --- | --- |
| DRAFT | optional | none | none |
| WORKING | recommended for analyses | none | optional |
| REVIEWED | as required by review type | none or pending | required |
| VERIFIED | **required** | not sufficient alone | usually prior |
| APPROVED | required for safety/critical | **required** | required unless waived |
| ISSUED | required to reproduce | **required** | required unless waived |
| SUPERSEDED | freeze prior evidence | recorded supersession | n/a |
| AS_BUILT | installation/as-built records | as contract requires | inspection as required |
| COMMISSIONED | commissioning/acceptance | operations acceptance | as required |

ERA already fail-closes missing evidence on findings (`insufficient_evidence`). That engine rule is **stricter than** object maturity and stays owned by Engineering Review.

---

## 5. Safety and criticality

Use existing Asset `criticality` (`low | medium | high | critical`) and ERA `ReviewSeverity` as inputs to **how soon** higher maturity is required — not as a different maturity enum.

| Criticality | Additional expectation (planning) |
| --- | --- |
| low | WORKING may persist longer; requirement links recommended |
| medium | REVIEWED before ISSUED for design documents |
| high | VERIFIED + APPROVED before ISSUED; residual assumptions explicit |
| critical / safety | VERIFIED + APPROVED + configuration baseline; independent review type; no AI self-approval (`ai_self_approval` already false on model mappings) |

Safety, regulatory, and integrity requirements (when they exist as Requirement objects) cannot skip VERIFIED/APPROVED because a parent document is still WORKING.

---

## 6. Findings, decisions, and assumptions

- **ERA Finding** maturity is finding-lifecycle (`unverified` evidence state, disposition actions), not this overlay.
- **PI Finding** stays on PI status (`candidate`, …) until composed.
- **Decision** should reach APPROVED before it `AFFECTS` an ISSUED configuration. Current `approval_status` default `pending` is not APPROVED.
- **Assumption** uses Validation Status, not ISSUED. A critical assumption used by an ISSUED calculation must be `accepted` or `validated`, or the calculation must not be ISSUED.

---

## 7. Enforcement

EOS-A1: **documentation only**. Later phases may add warnings, then gates, by object type and criticality. Never a global “all five links required to insert a row” constraint.

EOS-A8A Digital Thread coverage queries report **assurance conditions** (review required, not automatic defects) and **do not** introduce a universal traceability, compliance, or truth score. EOS-A8C persists those conditions with versioned rules, fingerprints, human disposition, and Digital Thread evidence paths. EOS-A8D adds governed Review citations, catalog rule enable/disable, and explicit evaluation completeness so truncated scans cannot conclude “no conditions”. EOS-A9A may require a configured traceability-maturity overlay as a lifecycle gate criterion; it does not replace this model or treat lifecycle stage as proof of maturity. EOS-A9B traces Gate → Evaluation → Evidence Snapshot → canonical objects on the same relational thread; Platform KG remains optional with reads OFF. EOS-A9C may require configured requirement links as a deliverable TRACEABILITY dimension; that is purpose-specific evidence, not a universal percent complete or quality score. EOS-A9D traces Expectation → Binding → Document revision → status mapping → Review → Baseline → Assessment → Gate on the same relational thread; mapped document status is not approval. EOS-A10A may surface purpose-specific information authority and freshness on those same objects; authority is not traceability maturity and is not approval. See `EOS_A8A_ENGINEERING_DIGITAL_THREAD.md`, `EOS_A8C_ENGINEERING_ASSURANCE_INTELLIGENCE.md`, `EOS_A8D_ASSURANCE_GOVERNANCE_REVIEW.md`, `EOS_A9A_LIFECYCLE_INTELLIGENCE_FOUNDATION.md`, `EOS_A9B_LIFECYCLE_EVIDENCE_AND_PROJECT_CONTROLS.md`, `EOS_A9C_DELIVERABLE_MATURITY_INTELLIGENCE.md`, `EOS_A9D_DELIVERABLE_GOVERNANCE_DOCUMENT_STATUS.md`, and `EOS_A10A_ENGINEERING_INFORMATION_INTELLIGENCE_FOUNDATION.md`.
