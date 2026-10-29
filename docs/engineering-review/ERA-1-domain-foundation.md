# ERA-1 — Engineering Review AI domain foundation

**Status:** Domain contracts, detectors, lifecycle, and fixture evaluation — **no UI, no migrations**  
**Package:** `@rtb/engineering-review` (`packages/engineering-review`)  
**Preserves:** [`ERA-0-architecture.md`](./ERA-0-architecture.md)

| Field | Value |
| --- | --- |
| Phase | ERA-1 |
| Engine version | `review-engine/0.1.0-era-1` |
| Runtime deps | **none** (no Next.js, React, Supabase, EOS, PI, or platform packages) |

---

## Implemented architecture

The package is a **framework-independent domain engine**. Construction, detection, evidence verification, and human disposition are separate stages:

```text
ReviewPackage + ReviewScope
        ↓
   ReviewRun (provenance)
        ↓
   Detectors (deterministic)
        ↓
   Finding construction
        ↓
   Evidence verification
        ↓
   Awaiting engineer
        ↓
   Human disposition (accept / reject / modify / assign / close)
```

AI inference is an optional later stage behind `ReviewInferenceProvider`. ERA-1 unit tests use `RejectingInferenceProvider` only. No live model is required.

## Package dependency graph

```text
@rtb/engineering-review
        └── (no workspace or runtime dependencies)

Must NOT be imported by:
  @rtb/engineering-os
  @rtb/platform-core
  @rtb/platform-kernel
  @rtb/platform-intelligence

apps/web MAY import it in a later ERA (not ERA-1).
```

Contracts live in this package rather than `@rtb/types` so the types package remains a platform foundation and cannot grow a reverse product dependency. ERA-2 may hoist **type-only** public aliases if integration needs them.

## Domain contracts

| Contract | Role |
| --- | --- |
| `ReviewOwnership` | Required `tenantId`, `workspaceId`, `projectId` (workspace never optional) |
| `ReviewPackage` | Named document set; ownership immutable after creation |
| `ReviewScope` | MVP review types, required fields, expected evidence keys |
| `ReviewRun` | Execution record: scope, input documents, rule versions, model/prompt provenance, timestamps, status |
| `ReviewRule` | Versioned rule: type, applicable inputs, deterministic vs AI-assisted, evidence requirements, output category |
| `ReviewFinding` | Canonical finding; severity ≠ confidence ≠ verification ≠ disposition |
| `FindingEvidence` | Attributable citation (no full document copy; locators never invented) |
| `FindingDisposition` | Human action with actor id + timestamp |
| `ReviewResult` | Run + findings + limitations + disclaimer |

Branded IDs are local to this package (`TenantId`, `ReviewFindingId`, …). The rest of the monorepo does not yet share a Brand helper.

## Severity and confidence

**Severity** (engineering consequence): `informational | minor | moderate | major | critical`.

Existing PI findings use `low | medium | high | critical`. Mapping for later handoff:

| Review | PI |
| --- | --- |
| informational | low |
| minor | low |
| moderate | medium |
| major | high |
| critical | critical |

**Confidence** (detector/model self-support): band `low | medium | high` plus a score in `[0, 1]` quantized to two decimals. Not a calibrated probability of engineering truth. Confidence **must not** set severity. Tests construct high-confidence informational findings and low-confidence critical findings.

## State machine

Stored statuses (PI-compatible semantics, no PI import):

| Product | Stored | Who may enter |
| --- | --- | --- |
| CANDIDATE | `candidate` | AI / system / human (create) |
| AWAITING_ENGINEER | `awaiting_engineer` | AI/system after verification; human |
| ASSIGNED | `assigned` | **human only** |
| MODIFIED | `modified` | **human only** |
| ACCEPTED | `accepted` | **human only** |
| REJECTED | `rejected` | **human only** |
| CLOSED | `closed` | **human only** |

AI must not accept, reject, modify, assign, or close. Invalid transitions fail closed. Closing a candidate without accept/reject is invalid.

## Trust boundaries

- Extracted document text is `UntrustedDocumentText` (`trust: "untrusted_document"`).
- System instructions are a distinct `SystemInstruction` type.
- Document text cannot authorize actions, change tenant/workspace, or close findings.
- **Prompt injection is not claimed solved.** ERA-1 does not add a filter subsystem.

## Detector architecture

Reference deterministic detectors (not a production standards library):

| Type | Rule id | Signal |
| --- | --- | --- |
| A Cross-document inconsistency | `er.cross_document_inconsistency@1.0.0` | Same field, different values |
| B Missing information | `er.missing_information@1.0.0` | Required field absent |
| F Requirement traceability | `er.requirement_traceability@1.0.0` | Extracted requirement `mappedEvidence=false` |
| G Unsupported assumption | `er.unsupported_assumption@1.0.0` | Declared assumption `supported=false` |
| H Revision inconsistency | `er.revision_inconsistency@1.0.0` | Same document number, two current revisions |
| I Missing engineering evidence | `er.missing_engineering_evidence@1.0.0` | Expected evidence key absent |

Not implemented: C design-basis (would expand scope), D drawing-vs-spec vision, E calc-vs-drawing vision.

Pipeline helper: `runDeterministicReview` → detect → construct → verify → queue for engineer.

## Evaluation architecture

Synthetic gold-set in `src/eval/fixtures.ts` (no copyrighted standards text). Metrics in `src/eval/metrics.ts`:

- precision
- recall
- false-positive rate
- evidence-grounding rate
- duplicate-finding rate

These are **not** “AI accuracy”. Scores are deterministic. Platform `EvaluationFrameworkService` random scores are not used.

## Security invariants (domain only — no RLS migration)

- tenant / workspace / project required
- cross-tenant and cross-workspace evidence rejected
- package ownership immutable
- human disposition requires actor
- evidence cannot silently disappear (explicit revoke only)

### ERA-0 RLS prerequisite (not solved in ERA-1)

Engineering Core `engineering_documents` / `engineering_projects` RLS is **tenant-only**. PI document tables are tenant **and** workspace. When ERA-2+ persists review rows, copy the **PI document RLS pattern**, not Core tenant-only policies.

## Known limitations

- In-memory domain only; no persistence
- Detectors operate on structured fixtures, not live PI chunks
- No C/D/E review types
- No OCR / CAD / FEA
- Confidence is quantized self-support, not calibrated
- `@rtb/types` does not yet re-export these contracts
- Node engine mismatch (repo wants v22; local may be v24) is pre-existing

## Deferred scope

UI `/review`, migrations, production LLM calls, commerce catalog, EOS module registration, PI findings table integration, drawing/calc visual reasoning, full standards library.

## ERA-2 recommendation

1. Additive **new** tables for packages/runs/findings/evidence/dispositions (do not edit existing migrations).
2. RLS: tenant + workspace membership; fail closed.
3. Adapter from PI ready documents/chunks into `ReviewDocumentFixture` (still no reverse EOS import).
4. Persist review runs via kernel jobs; still no UI required for a persistence spike, or a thin `/review` stub if explicitly scoped.
5. Optional typed aliases in `@rtb/types` **without** depending on this package’s runtime.
6. Do not weaken human-only terminal states.
