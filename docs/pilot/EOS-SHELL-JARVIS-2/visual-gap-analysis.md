# EOS-SHELL-JARVIS-2 visual gap analysis

This pass is a composition remediation, not a theme overlay.

JARVIS-1 changed tokens (dark navy, cyan borders, larger type) while leaving conventional SaaS dashboard composition in place. Grayscale screenshots of JARVIS-1 still read as card grids, KPI tiles, and navigation catalogues.

Target: 70% enterprise engineering command platform / 30% futuristic AI interface. No JARVIS branding. No architecture change.

## Audit: conventional SaaS → command interface

| Surface | JARVIS-1 SaaS pattern | Command-interface target |
| --- | --- | --- |
| Engineering Command Center | Six equal MetricCards + module shortcut cards | Cockpit: health gauge \| intelligence core \| attention queue, then live signal strip, then change/decisions |
| Modules | Card grid showing snake_case keys (`project_intelligence`) | Systems matrix: MODULE / STATUS / PURPOSE / RELATIONSHIP / OPEN SYSTEM |
| PI Overview | Large navigation cards for Documents, Meetings, Findings, Reports | Health \| What changed \| Attention; dominant AI brief; risk/decisions; schedule/cost. Records stay as a contextual rail |
| PI Schedule | Stacked text cards and lists | Milestone timeline, overdue panel, published movement, blockers from attention items |
| PI Cost | Two summary cards that can read as a zero dashboard | Forecast/progress signals only; unpublished money shows “No published cost evidence available” |
| PI Risk & Change | Count paragraphs + attention lists | Severity distribution from published portfolio counts; no invented matrix coordinates |
| PI Engineering | Four KPI cards + nav sections | Interconnected signal panels + evidence chain of **counts**, not fabricated document→finding links |
| PI Decisions | Mixed TQ/decision/action cards with canonical-model jargon | Decisions required / overdue / recently resolved / evidence |
| PI Reports | Light cyan callout + report cards | Command panel + existing report snapshots |
| PI Analyst | Conventional labelled textarea + stacked answer cards | Intelligence console: large prompt, suggested actions, executive answer / why / evidence / limitations / next action |

## Depth layers (CSS only)

- Layer 0: `--eos-bg-primary` near-black/navy canvas
- Layer 1: `.page-main` low-opacity grid + radial cyan/teal wash
- Layer 2: `.eos-command-panel` translucent surfaces, clipped corners, selective accent edge

No background video, WebGL, or canvas runtime.

## Integrity constraints

- No invented health scores, trend arrows, financial values, or risk coordinates
- UNKNOWN remains a valid health state
- Existing APIs and testids retained
- Developer identifiers (`project_intelligence`, `engineering_technical_queries`) stay out of primary UI
