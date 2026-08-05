# Project Intelligence — Production Module (Phase 8B)

**Platform:** RTB AI Platform  
**Operating System:** Engineering OS  
**Module key:** `project_intelligence`

## Hierarchy

```text
RTB AI Platform
  → Engineering OS
      → Project Intelligence (module)
          → Document Intelligence
          → Meeting Intelligence
          → Findings Intelligence
          → Reporting Intelligence
```

## Purpose

Project Intelligence is the flagship production module of Engineering OS. It completes
feature registration, Eng OS shell navigation, shared-service consumption, and Platform
AI Runtime integration without introducing a new Operating System or a module-private AI stack.

## Feature structure

| Feature id | Route | Shared services (examples) |
|------------|-------|----------------------------|
| `document_intelligence` | `/engineering/apps/project-intelligence/documents` | document_references, version_history, ai_context |
| `meeting_intelligence` | `/engineering/apps/project-intelligence/meetings` | engineering_timelines, approvals, ai_context |
| `findings_intelligence` | `/engineering/apps/project-intelligence/findings` | document_references, reporting, ai_context |
| `reporting_intelligence` | `/engineering/apps/project-intelligence/reports` | reporting, audit, ai_context |

Features register in `@rtb/project-intelligence` and are mirrored in
`EngineeringModuleRegistry` (`@rtb/engineering-os`).

## Shell and dashboard

- Production shell: `data-testid="project-intelligence-shell"`
- Ready marker: `data-testid="project-intelligence-ready"`
- Dashboard: recent activity, assigned work, documents, meetings, findings, reports, AI insights

Navigation lives under Engineering OS (`/engineering/apps/project-intelligence/*`).

## Shared infrastructure

- **Engineering Domain:** owned by Engineering OS Core — PI must not claim ownership.
- **Shared Engineering Services:** catalog in `@rtb/engineering-os` shared-services.
- **Platform AI Runtime / Engineering Intelligence Framework:** PI sets
  `implementsOwnAiStack: false`. Deterministic local ports are cert-safe fallbacks of
  shared AI ports, not a private stack.

## Entitlement

Install, seat, workspace, and feature actions are unified under commerce application key
`project_intelligence` with `seatRequired` and `workspaceRequired`.

## Providers

- Manual meeting provider: certified
- Teams live connector: `conditionally_deferred`

## Certification

Hosted certification extends Phase 7B/8A gates with Phase 8B unit coverage for module
registration, feature registration, navigation, shared services, shared AI consumption,
entitlement, workspace isolation markers, and UI readiness markers.

## Related

- [ENGINEERING_OS_ARCHITECTURE_PHASE_8A.md](./ENGINEERING_OS_ARCHITECTURE_PHASE_8A.md)
- Package: `@rtb/project-intelligence`
