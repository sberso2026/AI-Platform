# EOS-3-HOTFIX-1B — Guided Engineering Interaction Freeze

## Repro

PILOT-011 Guided Engineering could render project data while main interaction felt frozen/dimmed after Setup edits or async actions.

## Root cause

1. **Orphan unsaved-dirty lock** — Project Setup set `isDirty` but did not clear it on unmount. Leftover dirty state armed the document-level navigation interceptor and could open the unsaved-changes modal over Guided Engineering.
2. **Low-contrast blocking modal** — The modal backdrop/`slate-900` dialog blended into the dark Guided surface, so a legitimate modal appeared as a non-interactive “freeze” with visible project data underneath.
3. **Stale local busy** — `captureChange` did not use `try/finally`, so a thrown request could leave `busy=true` and disable related controls.

## Fix (minimal)

- Clear Setup dirty on unmount; Guided mount clears orphan dirty.
- Split prepare/capture local locks; always clear in `finally` and on unmount.
- High-contrast unsaved modal; Keep editing always available; save path uses `finally`.
- Bounded error alerts; “Edit project definition” returns to Step 1.
- No page-wide `pointer-events` lock on Guided.

Preserves Hotfix-1 / 1A inference isolation. No schema change.
