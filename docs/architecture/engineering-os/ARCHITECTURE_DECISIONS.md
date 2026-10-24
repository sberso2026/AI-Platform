# EOS-A0 Architecture Decisions

Status: accepted for planning. None of these ADRs authorize schema or application changes in EOS-A0. EOS-A0C adds ADR-013 and ADR-014; it does not authorize EOS-A1 implementation.

EOS-A1 duplication ADRs (D1–D6) live in `EOS_A1_ADRS.md`. They do not replace ADR-001–014.

Original evidence SHA: `135dd0b659497a7ac68543d50dd2998ee3fe7d0f`  
EOS-A0C local HEAD: `0dd05bf124c19e1fbb8099f396a904ec86a2d020`

---

## ADR-001 ÔÇö AI Platform remains the canonical repository

**Decision:** The RTB AI Platform monorepo (`rtb-ai-os` / `github.com/sberso2026/AI-Platform`) is the single implementation base for the revised Engineering OS.

**Context:** The brief also names a Windows checkout path. This reconnaissance ran at `/workspace`. Implementation still happens in this repository, not in a second product repo.

**Consequences:** New Engineering OS work lands as packages/modules/docs here. A second ÔÇ£Engineering OS platformÔÇØ repository is forbidden.

---

## ADR-002 ÔÇö Standalone Engineering OS folder is legacy/reference only

**Decision:** `C:\Users\sbers\OneDrive\Documents\RTB Eng\01_Apps\Engineering OS` is not an implementation root. It must not be modified, reorganized, or migrated during EOS-A0.

**Context:** EOS-A0 Cloud Agent recorded `ACCESS_NOT_AVAILABLE`. EOS-A0C inventoried the folder read-only on Windows. See `LEGACY_ENGINEERING_OS_INVENTORY.md`.

**Consequences:** Do not copy/paste from that tree. In-repo V1 modules are the live counterparts. Unique Python/desktop solvers in the legacy folder are **migration candidates for later adapter-bound phases (A5–A8)**, not EOS-A1 implementation.

---

## ADR-003 ÔÇö Engineering OS consumes shared platform services

**Decision:** Engineering OS composes Platform Kernel and Platform Intelligence. It must not create duplicate identity, RLS, event bus, jobs, workflow, knowledge graph, memory, audit, or connector stacks.

**Evidence:** `createEngineeringOS(supabase, kernel)` already takes `PlatformKernel`. Product boundary doc assigns identity, files, event bus, AI runtime, KG infrastructure, and plugin lifecycle to Platform.

**Consequences:** Gaps (connectors, full workflow step engine, real secret encryption) are platform debts, not excuses for an Engineering-owned parallel kernel.

---

## ADR-004 ÔÇö Engineering Review remains a bounded context

**Decision:** Engineering Review & Verification is a distinct bounded context. It is **not** identical to Project Intelligence Findings, module `review-workflow.ts` helpers, or the Core Decision register.

**Context:** EOS-A0 SHA `135dd0b` had no `@rtb/engineering-review` package and no `engineering_findings` table. **EOS-A0C local HEAD `0dd05bf` has changed that:** `@rtb/engineering-review` and `@rtb/engineering-review-persistence` exist, with `engineering_review_*` tables (not `engineering_findings`). Certified PI Findings (`project_intelligence_findings*`) still exist. Vendor PI baseline still contains `engineering-findings` APIs and `TrustedRequestContext`.

**Consequences:**

- Reuse PI Findings unchanged for document-sourced findings until a deliberate composition strategy exists.
- Do not weaken trusted-server / fail-closed membership if that vendor pattern is reconstituted.
- EOS-A1 must **not** treat Review as missing. It must ADR how the existing ERA bounded context composes with PI Findings and module `review-workflow.ts` before Optimization (A5).

---

## ADR-005 ÔÇö Optimization is a peer intelligence domain

**Decision:** Optimization Intelligence is a peer of Lifecycle, Systems, Discipline, Decision, and Value Intelligence. It is not a feature of a single discipline and not a Digital Twin goal.

**Evidence:** No `optim*` tables; Digital Twin documentation treats optimization as a non-goal; execution host already exists for controlled external runs.

**Consequences:** Implement as its own bounded context (A5+). LLMs do not become the numerical solver (ADR-009). Do not hide studies inside Structural or Process modules.

---

## ADR-006 ÔÇö Discipline Intelligence uses common platform contracts

**Decision:** Disciplines are lenses and methods on shared project/system/asset/requirement/interface/decision/evidence objects. They are not isolated applications with private cores.

**Evidence:** `engineering_disciplines` is already a catalog; V1 modules are hosted apps, not per-discipline OS copies.

**Consequences:** A7 generalizes contracts after a structural pilot (A6). New discipline packs must consume A1 identities.

---

## ADR-007 ÔÇö Digital Thread is distinct from operational Digital Twin

**Decision:** Engineering Digital Thread is the governed relationship/provenance layer. Digital Twin is operational/simulated state. Do not rename the thread to ÔÇ£Digital TwinÔÇØ.

**Evidence:** `@rtb/digital-twin` plus kernel `digital_twins*`; Asset Intelligence twin boundary doc; object links and platform KG already provide a thin thread.

**Consequences:** Extend platform KG + object links for thread semantics. Do not store thread-only objects exclusively inside twin tables.

---

## ADR-008 ÔÇö External engineering tools use adapters, not hardwired integrations

**Decision:** External analysis applications integrate through the Controlled Engineering Execution Host and a generic adapter contract. Engineering OS application services must not import vendor APIs directly.

**Evidence:** `docs/architecture/CONTROLLED_ENGINEERING_EXECUTION_HOST_CONTRACTS.md`; IFC / SPACE GASS / ETABS packages already follow an adapter/federation style.

**Consequences:** A8 extends host/interop rather than adding a second host. Host available Ôëá solver certified.

---

## ADR-009 ÔÇö LLMs do not replace deterministic engineering solvers

**Decision:** Large language models may orchestrate, explain, draft constraints, and summarize alternatives. Validated engineering analysis engines produce numerical results.

**Evidence:** Engineering AI prompts already forbid autonomous approval; execution host semantics separate control plane from solver plane; AI Director default adapter is mock.

**Consequences:** Optimization Core (A5) must call engines via jobs/host. Policy continues to require human approval for design/safety significance.

---

## ADR-010 ÔÇö Interface Intelligence is horizontal

**Decision:** Interfaces are a horizontal Engineering OS service used by Systems, Change, Review, Optimization, Construction, and Commissioning ÔÇö not a property exclusive to model interoperability.

**Evidence:** Current interface-like data is mostly `engineering_model_mappings` and spatial relationships.

**Consequences:** A3 creates a general interface register and treats model mappings as one class of interface.

---

## ADR-011 ÔÇö Configuration Intelligence is distinct from Change Intelligence

**Decision:** Change records what is requested/approved/propagated. Configuration records what is effective: baselines, freeze, revision applicability, IFC/installed/as-built/commissioned states, supersession.

**Evidence:** Project Controls already has a change domain. Document/model versions exist but are not configuration intelligence.

**Consequences:** A4 may compose PC change while still creating configuration objects. Do not overload `engineering_document_versions` as the configuration system.

---

## ADR-012 ÔÇö Value Intelligence distinguishes projected from realized value

**Decision:** Value Intelligence must separate projected, approved, committed, realized, and verified value. Project Controls cost/progress and Business OS finance are sources or siblings, not substitutes.

**Evidence:** No value-register tables in this checkout.

**Consequences:** A9 creates value objects with confidence/maturity and attribution to decisions/studies/changes. Do not claim realized value from an optimization run output alone.

---

## ADR-013 — EOS-A1 uses the local Windows AI Platform checkout as canonical

**Decision:** EOS-A1 proceeds from this Windows repository at the recorded local identity, not by resetting to EOS-A0 SHA `135dd0b` or switching to the BOS-1 / EOS-A0 reconnaissance branch.

**Context:** EOS-A0 ran in `/workspace` on `cursor/bos-1-owner-command-centre-2756` at `135dd0b`. The Windows checkout is `cursor/era-7a-engineering-review-pilot-gate` at `0dd05bf`. The histories diverged at `7771a574`. Forcing SHA alignment would drop Engineering Review or Business OS work depending on direction.

**Consequences:** Domain-model work in A1 must describe objects as they exist **here** (including ERA packages and excluding `@rtb/business-os` on this branch). Business OS remains a sibling OS on other branches; it is not invented inside Engineering OS.

---

## ADR-014 — Existing ERA packages are the Engineering Review bounded context seed

**Decision:** `@rtb/engineering-review` (domain engine) and `@rtb/engineering-review-persistence` (Supabase adapter + hosted RLS) are the canonical seed of the Engineering Review bounded context on this repository. They must not be discarded to “create Review from scratch” in A1.

**Context:** ERA-0 through ERA-7 and PILOT-0 landed on this branch after EOS-A0. Tables are `engineering_review_*`, not vendor `engineering_findings`. PI Findings remain a separate certified product.

**Consequences:** A1 glossary must include review package / run / finding / evidence / disposition as **existing** objects. Composition with PI Findings is a migration strategy, not a greenfield package decision. Do not start ERA-8 or EOS-A1 implementation in A0C.
