# EOS-3-PILOT-UI-1 — Complete Project Workspace & Canonical Capability Exposure

## Verdict target

Single-phase product UI/UX integration: existing EOS 3 capability → discoverable project UI → usable engineering workflow.

## What changed

1. **Grouped project navigation** (`ProjectWorkspaceShell` + `project-workspace-ia.ts`) replacing the flat Overview/Inspections/… tab row with the required IA groups.
2. **Engineering control-centre Overview** with lifecycle, jurisdiction, standards, qualification, requirements/assumptions/interfaces/changes/calculations/deliverables/reviews cards, setup readiness, next actions.
3. **Project Setup** with jurisdiction/standards profiles, roles, lifecycle template, checklist, post-create redirect to `/setup?checklist=1`.
4. **Capability pages** under `/engineering/projects/{id}/{slug}` for all core surfaces (registers for canonical types; bridges for existing EOS2 registers; dedicated lifecycle, digital thread, impact, AI, trust, migration, integrations).
5. **Thin workspace API** `/api/engineering/projects/{id}/workspace` wrapping `Eos3CanonicalObjectStore` (no duplicate tables, no authority expansion).
6. **Pilot affordances**: eos-controlled-pilot indicator; Report Bug / UX Issue / Product Gap feedback; PILOT-001 seed + mass-change + G0 gate tests.

## Non-goals preserved

- No EOS architecture redesign
- No duplicate canonical schemas (`DATABASE_SCHEMA_CHANGED=NO`, `DUPLICATE_CANONICAL_MODEL_CREATED=NO`)
- No qualification / AI / approval authority expansion
- Existing Inspections, Risks, TQs, Decisions, Actions, Documents, Models, Reports, Intelligence, AI preserved via bridges + superseding nav

## Key code

| Path | Role |
|------|------|
| `apps/web/src/lib/engineering/project-workspace-ia.ts` | IA + phase dispositions |
| `apps/web/src/lib/engineering/eos3-project-workspace-service.ts` | In-process project workspace |
| `apps/web/src/app/api/engineering/projects/[projectId]/workspace/route.ts` | HTTP surface |
| `apps/web/src/components/engineering/project-workspace/*` | Shell, overview, capability UI |
| `apps/web/src/app/(platform)/engineering/projects/[projectId]/layout.tsx` | Persistent shell |
| `apps/web/src/__tests__/eos3-pilot-ui-1-workspace.test.ts` | Automated acceptance |

## Related artifacts

- `EOS_3_UI_PHASE_CAPABILITY_MAPPING.md`
- `EOS_3_UI_ROUTE_CAPABILITY_INVENTORY.md`
- `EOS_3_PROJECT_WORKSPACE_INFORMATION_ARCHITECTURE.md`
- `EOS_3_UI_COVERAGE_MATRIX.md`
- `EOS_3_PILOT_001_UI_ACCEPTANCE_EVIDENCE.md`
- `EOS_3_PILOT_UI_1_MANIFEST.json`
