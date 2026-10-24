# ADR — Engineering Intelligence Layer (Phase E0)

Status: Accepted · Date: 2026-08-11 · Phase: E0  
Supersedes: none (extends Phase 14 product boundary; does not reopen V1 module freezes)

## Context

Engineering OS V1.0 is Production GA with certified modules (PI, II, AI, PC, DT, EMI)
and locked shared-domain ownership. Manual UAT and product strategy require Engineering OS
to operate as a **vendor-neutral Engineering Intelligence Layer** above client digital tools:

- usable by small firms with **no** enterprise Copilot / SAP / Fabric
- usable by enterprises that **optionally** federate M365, SAP, data platforms, DMS, GIS, twins
- assistant-first UX without forcing structured-module abandonment
- no duplication of authoritative external systems of record
- no rebuild of certified module internals

Existing docs already lock composition vs module ownership
(`ENGINEERING_OS_PRODUCT_BOUNDARY.md`, `RTB_AI_PLATFORM_DATA_OWNERSHIP.md`,
module compatibility matrix). E0 refines the **product contract** for progressive
deployment and connector neutrality without migrating databases or certified packages.

## Decision

1. **Engineering OS is the Engineering Intelligence Layer** above client tools and systems
   of record. It owns canonical **engineering context and intelligence**, not arbitrary
   copies of external enterprise systems.

2. **External record ≠ Engineering OS record.** Prefer references, mappings, and provenance.
   Local copies only when Engineering OS must own the authoritative engineering artefact.

3. **Native services are first-class.** Search/RAG, document intelligence, AI-provider
   abstraction, storage, identity, and workflow/event services must operate with
   **zero enterprise connectors**.

4. **Enterprise systems are optional connectors** behind a Connector Boundary Contract.
   Supabase / Vercel / OpenAI / Azure / SAP / M365 are **adapters/implementations**,
   never domain contracts.

5. **Capability-based UX.** Unavailable or uninstalled modules are normally **hidden**,
   not shown as dead/non-clickable features. Certification/Release surfaces may still
   disclose boundaries explicitly.

6. **Assistant-first, authority-preserving.** Conversation is interface; engineering
   context is intelligence; governed tools perform work; evidence establishes trust;
   humans retain engineering authority. AI output is **advisory** unless an explicit
   governed workflow states otherwise. Missing/conflicting/partial evidence is
   represented — never fabricated.

7. **Ambient governance.** Provenance, audit, versioning, and entitlement checks are
   captured automatically with minimal engineer friction.

8. **Preserve certified ownership.** Phase E0 and E1–E12 must not reopen frozen V1 tags,
   duplicate PI/II/AI ownership, or weaken RLS / commerce / spatial / shared-domain locks.

9. **Deployment profiles** ESSENTIAL / PROFESSIONAL / ENTERPRISE describe progressive
   capability sets over the same logical architecture (see deployment profile contract).

## Consequences

- Machine-readable E0 contracts live in `@rtb/engineering-os` (`phase-e0/contracts`).
- Product architecture, ownership matrix, SoR policy, connector boundary, UX complexity
  policy, migration assessment, and E1–E12 roadmap are published under `docs/architecture/`.
- No major UI or database migration in E0.
- E1 may begin implementing Experience shells and capability-based navigation **only**
  against these contracts.

## Non-goals (E0)

- Rebuilding PI / II / AI / PC / DT / EMI
- Claiming new module GA certification
- Mandating SAP / M365 / Copilot / Fabric
- Changing frozen V1 release tags or public contract versions
