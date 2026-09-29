# EOS-A0 Legacy Engineering OS Inventory

## ACCESS_NOT_AVAILABLE

The EOS-A0 brief names this folder as **legacy / reference only**:

`C:\Users\sbers\OneDrive\Documents\RTB Eng\01_Apps\Engineering OS`

Expected child folders (from the brief, **not** verified on disk):

- Construction Intelligence
- Engineering Intelligence
- Inspection Intelligence
- Project Controls Intelligence
- Project Intelligence

This Cloud Agent workspace root is `/workspace` (Linux). Probes that failed:

- `/mnt/c/Users/sbers/OneDrive/Documents/RTB Eng/01_Apps/Engineering OS`
- `/Users/sbers/OneDrive/Documents/RTB Eng/01_Apps/Engineering OS`
- recursive name search under `/` limited to depth 4

**No files from that folder were read, copied, modified, renamed, moved, or deleted.**

Classification of those child products from the **AI Platform monorepo** (not from the legacy folder):

| Legacy name (brief) | Closest in-repo counterpart | In-repo status | Classification **if** the Windows folder were later reviewed |
| --- | --- | --- | --- |
| Construction Intelligence | No package; “Construction” is a discipline label in `ENGINEERING_DISCIPLINES` | MISSING product | UNKNOWN until the Windows tree is inspected |
| Engineering Intelligence | `@rtb/engineering-os` Core + registers | EXISTS in AI Platform | UNKNOWN vs legacy sources |
| Inspection Intelligence | `@rtb/inspection-intelligence` V1.0.0 | EXISTS | UNKNOWN vs legacy sources |
| Project Controls Intelligence | `@rtb/project-controls` V1.0.0 | EXISTS | UNKNOWN vs legacy sources |
| Project Intelligence | `@rtb/project-intelligence` V1.0.0 | EXISTS | UNKNOWN vs legacy sources |

Until a read-only reviewer on the Windows machine inventories the legacy folder, every legacy component remains **UNKNOWN**. Do not treat the table above as a migration inventory of that folder.

### Actions required to complete this inventory

1. Open the Windows path above in a local Cursor workspace **read-only**.
2. List top-level and significant nested projects.
3. Classify each as DUPLICATE / MIGRATION CANDIDATE / REFERENCE ONLY / OBSOLETE / UNKNOWN against this monorepo.
4. Append the classification to this file. Do not copy code in that pass.

---

## Related in-repo vendor baseline (not the legacy folder)

The monorepo contains a **separate** frozen Project Intelligence source archive:

| Item | Path / value |
| --- | --- |
| Location | `vendor/project-intelligence-baseline/` |
| Identity | `vendor/project-intelligence-baseline/IDENTITY.txt` |
| SHA | `ab1f44276715888123d9f669464987e6f7c39b6c` |
| Tag | `project-intelligence-integration-baseline-1` |
| Upstream | `https://github.com/sberso2026/rtb-project-intelligence.git` |
| Payload | `ab1f442-source.tar.gz` (not extracted into the working tree during EOS-A0) |

Read-only tarball listing (names only) includes material **absent as live monorepo routes**:

| Tarball path | Likely class vs current AI Platform | Notes |
| --- | --- | --- |
| `app/api/engineering-findings/**` | MIGRATION CANDIDATE / REFERENCE ONLY | Not present as `/api/engineering-findings` in `apps/web` |
| `security/authorization/TrustedRequestContext.ts` and `createTrustedContext.ts` | MIGRATION CANDIDATE (pattern) | Not the current monorepo API boundary |
| `supabase/migrations/20260611120000_engineering_finding_evidence_workflow.sql` | REFERENCE ONLY | No `engineering_findings` table in current `supabase/migrations/` |
| `supabase/migrations/20260417120000_decision_graph_schema.sql` | REFERENCE ONLY / DUPLICATE risk | Current Core uses `engineering_decisions`, not this graph schema |
| `app/decisions/`, `services/decision/` | DUPLICATE / REFERENCE ONLY | Superseded by Engineering Core Decision register for the OS shell |
| `engines/decisionEngine.ts` | REFERENCE ONLY | Inspect before any port; do not drop in blindly |
| `app/api/ai/review-queue/` | REFERENCE ONLY | PI Findings review queue is the live successor |

This vendor archive is **AI Platform repository content**, not the standalone Engineering OS folder. It must not be copied wholesale. It is evidence that a stronger Engineering Review / trusted-server / finding-evidence workflow existed upstream of the hosted module.

EOS-A0 did not extract the tarball into the repo and did not apply patches under `vendor/project-intelligence-baseline/patches`.
