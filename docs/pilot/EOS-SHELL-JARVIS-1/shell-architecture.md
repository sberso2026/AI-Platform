# EOS-SHELL-JARVIS-1 shell architecture

Existing chrome is preserved. This ticket restyles it.

## Global shell

| Region | Component | Change |
| --- | --- | --- |
| Frame | `PlatformShell` | Dark EOS tokens, `data-eos-theme="enterprise-dark"`. Still `h-screen overflow-hidden`. |
| Left nav | `Sidebar` | Grouped canonical sections, 48px rows, luminous active state. |
| Brand | `ProductSwitcher` | RTB / Engineering OS / Enterprise Edition unchanged. |
| Top bar | `Header` | Command bar: workspace, canonical project selector, global search, notifications, user, sign out, visual AI core. |
| Main | page `main.page-main` | Vertical scroll only. |

No new route hierarchy. No duplicate project selectors.

## Project Intelligence module shell

`ProjectIntelligenceShell` retains:

Overview, Schedule, Cost, Risk & Change, Engineering, Decisions, Reports, Ask Project Intelligence, Records (Documents, Meetings, Findings, Queries), Administration / Diagnostics.

Back + Return remain. Project context remains `usePiProjectContext`. PI main stays `overflow-y-auto`.

## Visual-only AI motif

`EosAiCore` is a status ornament. It does not create a runtime, director, graph, or product brand named JARVIS.
