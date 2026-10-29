# Project Controls Productivity Model (terminology)

Phase 11F terminology for advisory productivity intelligence.

| Term | Meaning |
|------|---------|
| ProductivityIntelligenceEngine | Advisory execution-efficiency assessment engine |
| ProductivityAssessmentState | Versioned intelligence state; immutable when published |
| Productivity Evidence | Governed reference to progress, inspection, schedule/cost posture, approved changes, reviews, manual observations |
| Productivity Control Context | Scope plus execution-thread identity (`controlUnitId`) — never workforce, payroll or timesheet ownership |
| Productivity Posture | Qualitative only: `improving` \| `stable` \| `declining` \| `constrained` \| `recovering` \| `unknown` — never labour % |
| Productivity Factors | Evidence-backed: work_continuity, access_constraints, engineering_delays, inspection_hold_points, approved_design_changes, dependency_interruptions, environmental_constraints, logistics_constraints |
| Productivity Confidence | `sufficient` \| `limited` \| `insufficient` \| `conflicting` \| `stale` (+ abstain) |

Distinct from Progress, Schedule, Change and Cost intelligence. Never fabricate; abstain when insufficient.

ProductivityProvider (unit rates / productivity factor) remains reserved (`PRODUCTIVITY_ANALYSIS_IMPLEMENTED = false`).
