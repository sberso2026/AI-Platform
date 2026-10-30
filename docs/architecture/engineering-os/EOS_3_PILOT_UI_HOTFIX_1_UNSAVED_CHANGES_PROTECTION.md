# EOS-3-PILOT-UI-HOTFIX-1 — Unsaved Changes Protection

## Defect

`PILOT-BUG-002 = UNSAVED_PROJECT_SETUP_NAVIGATION_DATA_LOSS` (P0)

Editing Project Setup and clicking another project nav item navigated away with no warning.

## Solution

Reusable guard: `apps/web/src/components/engineering/project-workspace/unsaved-changes-guard.tsx`

- Dirty-state detection via `isEditableFormDirty` (meaningful editable diffs only).
- Modal: **Unsaved changes** / Save and continue / Discard changes / Keep editing.
- Save failure **cancels** pending navigation and preserves edits.
- Intercepts: project left nav, document link capture (breadcrumbs/content), browser back/forward, `beforeunload`, project selector, workspace switcher, sign-out.
- Keyboard: Ctrl/Cmd+S uses the same governed save path.
- Accessibility: dialog role, labelled title/description, focus trap, Escape → Keep editing.

`EOS_REUSABLE_UNSAVED_CHANGES_GUARD_IMPLEMENTED=YES`
