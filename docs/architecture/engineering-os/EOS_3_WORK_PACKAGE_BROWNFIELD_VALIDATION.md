# EOS 3 — Brownfield Work Package Validation

`EOS_BROWNFIELD_WORK_PACKAGE_SCENARIO=PASS`  
`PILOT_001_WORK_PACKAGE_CREATED_OR_MIGRATED=YES`  
`PILOT_001_PROJECT_LIFECYCLE_HISTORY_PRESERVED=YES`

## User intent

> Modify an existing steel platform to support new equipment.

## Expected mapping

| Concern | Value |
| --- | --- |
| Project | PILOT-001 (existing pilot; lifecycle history preserved, typically P0) |
| Work Package | `WP-STR-004` Support Frame Modification |
| WP maturity | `Detailed Engineering` (explicit WP config; ≠ project maturity) |
| Affected asset | Existing steel-framed process plant platform / support structure (placeholder-compatible) |
| Initiating / lead | Structural |
| Participating | Mechanical |
| Other disciplines | Not auto-confirmed without evidence |

## Minimum state evidenced

- Work Package exists with stable identity
- Affected asset reference / placeholder supported
- Lead + participating disciplines recorded
- Associations: Requirement, Engineering Basis, Assumption, System, Interface, Calculation, Decision, Deliverable, Review, Change, Evidence
- Blockers / readiness / next-action derived
- Independent maturity works
- No duplicate engineering object rows

## Seed

`seedPilot001SupportFrameWorkPackage(projectId)` — also invoked via API `?seedPilot=1` / `action: seed-pilot`.
