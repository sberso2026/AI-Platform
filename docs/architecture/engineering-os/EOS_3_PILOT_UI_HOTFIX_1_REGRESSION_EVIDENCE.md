# EOS-3-PILOT-UI-HOTFIX-1 — Regression Evidence

Harness: `apps/web/src/__tests__/eos3-pilot-ui-hotfix-1-setup-save.test.ts`

## PILOT-001 Project Setup save

| Step | Result |
|------|--------|
| Modify jurisdiction / standards / roles / disciplines / description | Covered by persistence + dirty tests |
| Save with separated `project.read` / `project.create` commerce | PASS (action mismatch reproduced + fixed pattern asserted) |
| Reload/hydrate from `metadata.eos_project_setup` | PASS |
| Failed save preserves edited values | PASS |
| Unauthorized write denied (`project.read` cannot satisfy `project.create`) | PASS |
| Authorized write policy remains established `projects.write` | PASS |

`PILOT_001_PROJECT_SETUP_SAVE_REGRESSION=PASS`  
`PROJECT_SETUP_UNAUTHORIZED_UPDATE_DENIED=PASS`  
`PROJECT_SETUP_AUTHORIZED_UPDATE_ALLOWED=PASS`  
`PILOT_001_FAILED_SAVE_PRESERVATION_TEST=PASS`

## Unsaved navigation

| Behaviour | Result |
|-----------|--------|
| Dirty detection | PASS |
| Save and continue success vs failure (false cancels nav) | PASS |
| Modal actions defined | PASS |
| Guard wired to nav / unload / history / project+workspace switch / sign-out | PASS (implementation) |

`PILOT_001_UNSAVED_NAVIGATION_REGRESSION=PASS`  
`EOS_PROJECT_SETUP_SAVE_AUTOMATED_TESTS=PASS`  
`EOS_UNSAVED_CHANGES_AUTOMATED_TESTS=PASS`
