# ERA-4 — Grounded review intelligence + trust & security baseline

**Status:** Deterministic evidence-grounded review on a controlled gold set + cumulative security register. **No commercial UI. No live LLM in tests. No certification claim.**

Preserves ERA-0–ERA-3A. Hosted Review RLS remains the authorization baseline.

---

## Product question

Can Engineering Review AI identify real engineering discrepancies from machine-readable documents with attributable evidence and a controlled false-positive rate?

ERA-4 answers this on a **synthetic but realistic** structural/civil gold set. It does **not** claim field performance, engineer time saved, or customer-ready accuracy.

---

## Review types in scope

A. Cross-document inconsistency  
B. Missing information (existing detector; not the primary gold packages)  
C. Limited design-basis inconsistency — only via explicit machine-readable values (material/load facts)  
F. Explicit requirement traceability  
G. Unsupported assumptions  
H. Revision inconsistency  
I. Missing engineering evidence (existing detector)

Out of scope: visual drawing reasoning, OCR, FEA, structural analysis, autonomous design, full code compliance, standards interpretation.

---

## Gold set

`packages/engineering-review/src/eval/gold-packages.ts`

| Package | Expected |
| --- | --- |
| 1 Material consistency (40 vs 32 MPa) | one `cross_document:compressive_strength` |
| 2 Consistent control (all 40 MPa) | **zero findings** (silence is success) |
| 3 Design load (250 vs 180 kN) | one `cross_document:operating_load` |
| 4 Unsupported assumption (250 kPa bearing, no geotech) | one `unsupported_assumption:...ASM-BEARING` |
| 5 Revision control (S-101 Rev B cited vs Rev D current) | one `revision_inconsistency:S-101` |
| 6 Requirement traceability (design life 50 years vs silent basis) | one `requirement_traceability:...REQ-DESIGN-LIFE` |
| 7 Compatible units (40 MPa = 40 N/mm²) | **zero findings** |

No copyrighted standards text.

---

## Fact model and pipeline

`EngineeringFact { subject, property, value, unit, qualifier, source, revision, span }`

Deterministic unit equality (not LLM): `40 MPa = 40 N/mm²`; `250 kN ≠ 180 kN`.

Pipeline (`runGroundedReviewPipeline`):

```text
PI-ready / machine-readable text
  → fact / requirement / assumption / revision-ref extraction
  → canonical facts
  → deterministic comparison
  → optional schema-validated AI (default reject / no network)
  → evidence resolver (span must exist in source)
  → verify → suppress unsupported
  → candidate findings
  → AWAITING_ENGINEER
```

Deduplication is by `detectionKey`. Fabricated AI locators/values are rejected and not presented.

---

## Evaluation (deterministic, reproducible)

Internal development targets (not customer claims):

| Metric | Target | Gold-set result |
| --- | --- | --- |
| evidence_grounding_rate | 100% presented | 100% |
| unsupported_claim_rate | 0% presented | 0% |
| false_positive_rate | ≤ 10% | 0% |
| precision | ≥ 90% | 100% |
| recall | ≥ 80% | 100% |
| duplicate_finding_rate | low | 0% |
| engineer_confirmed_finding_rate | — | **null** (no engineer eval) |
| review_time_saved | — | **null** |

Per-category metrics are computed in `evaluateEra4GoldSet()`.

---

## Human authority

Unchanged from ERA-1–3A. Pipeline findings are `awaiting_engineer`. AI cannot accept/reject/close/sign.

---

## Audit path (ERA-3A finding)

**Observation:** authenticated user JWT cannot insert `audit_events` (RLS).  
**Do not** grant users arbitrary audit INSERT.

**Designed trusted path:**

```text
user-authorized Review operation (JWT + RLS)
  → application server (service role, never in the browser)
  → AuditService.log / bindTrustedReviewAudit
  → audit_events
```

`bindTrustedReviewAudit` is the persistence adapter for that server client. It is **not** wired to a product HTTP route (no Review UI/API in ERA-4). ERA-5 should attach it to the first trusted server handler and prove a service-role insert after a JWT-authorized mutation, without treating service-role as user RLS proof.

---

## Security deliverables

- [`security/control-matrix.md`](./security/control-matrix.md)
- [`security/soc2-evidence-register.md`](./security/soc2-evidence-register.md)

No SOC 2 / ISO / NIST certification is claimed.

---

## CI

`.github/workflows/engineering-review-unit.yml` runs unit tests with `ENGINEERING_REVIEW_RLS=0` and `test:unit` for persistence so a skipped live suite cannot appear as a security pass.

Hosted RLS CI requires dedicated **staging** secrets for `rntonzigxwxcjlcsadip` (see control matrix). Existing GitHub `SUPABASE_*` secrets target the EOS certification project and must not be reused blindly.

---

## ERA-5 recommendation

1. Thin authenticated **server** API over `SupabaseEngineeringReviewStore` + `bindTrustedReviewAudit`
2. Required CI hosted RLS job once staging secrets exist (fail if missing; never skip-as-pass)
3. Separate Core document/project workspace RLS hardening
4. Optional live model behind allowlist + gold-set gate — still no commercial UI until quality + audit path operate
