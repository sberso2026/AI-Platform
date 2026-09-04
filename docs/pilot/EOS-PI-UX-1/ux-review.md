# UX review

## A. Shell

PlatformShell stays `h-screen overflow-hidden`. PI layout fills the column. PI `main` is `flex-1 min-h-0 overflow-y-auto`. Header Back / Return is persistent. Loading skeletons and bounded empty/error states were added on operational pages.

## B. Project context

Persistent Project selector in the PI header. Selected project is stored in the URL (`projectId`) and `localStorage`. First authorized project is selected unless the user chooses All Projects. Meeting create uses a human-readable project select.

## C. Navigation

Primary nav is management-oriented. Admin concepts moved under Administration / Diagnostics.

## D–Q

Overview, Schedule, Cost, Risk & Change, Engineering, Decisions, Reports, and Ask Project Intelligence no longer render raw `sourceDomain:entityType:entityId` strings. Evidence is shown as a human source/type label. Snapshot IDs and AI_SUMMARY provider strings were removed from Reports.

## Remaining founder review

Cursor cannot grant visual acceptance. Nested page-level project selects still exist on some intelligence views for existing test compatibility. They inherit the same URL project context.
