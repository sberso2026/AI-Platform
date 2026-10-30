# EOS 3 UI Coverage Matrix

`EOS_3_UI_COVERAGE_MATRIX_COMPLETE=YES`  
`EOS_3_UI_COVERAGE_MISSING_REQUIRED_CAPABILITY_COUNT=0`  
`CORE_ENGINEERING_UI_MISSING_COUNT=0`

| EOS Phase | Capability | UI Disposition | Route / Component | API / Service | Project visibility | Role restrictions | Qualification restrictions | Status |
|-----------|------------|----------------|-------------------|---------------|--------------------|-------------------|----------------------------|--------|
| EOS-3.0 | Identity/foundation | TRUST_RELEASE_STATUS | trust panel | eos3-identity | Yes | projects read | — | PASS |
| EOS-3.1 | Entitlement/API | BACKGROUND_SYSTEM_BEHAVIOR | guardEngineeringApi | engineering-api | Enforced | segment auth | — | PASS |
| EOS-3.2 | Canonical objects | PROJECT_WORKSPACE | object registers + digital-thread | eos3-object-store / workspace API | Yes | human write | D1 display | PASS |
| EOS-3.3 | Knowledge | PROJECT_WORKSPACE | knowledge bridge | PI knowledge + retrieval libs | Yes | entitlement | provenance | PASS |
| EOS-3.4 | Decision/optimization | PROJECT_WORKSPACE | decisions, optimization | decision/optimization + workspace | Yes | human authority | externals NO | PASS |
| EOS-3.5 | Workflow/events | PROJECT_WORKSPACE | lifecycle, audit | workflow + gate evaluate | Yes | authority on transition | — | PASS |
| EOS-3.6 | Integration/solver | PROJECT_WORKSPACE | integrations | status snapshot | Yes | read | CONNECTED≠QUALIFIED | PASS |
| EOS-3.7 | Engineering AI | PROJECT_WORKSPACE | engineering-ai | Ask AI + boundary copy | Yes | read/ask | AI≠authority | PASS |
| EOS-3.8 | Project-to-asset | PROJECT_WORKSPACE | handover, assets | handover snapshot | Yes | read | — | PASS |
| EOS-3.9 | Migration | ADMIN_GOVERNANCE | migration, setup | coexistence claim | Yes | read | NOT_SUPPORTED prod | PASS |
| EOS-3.10 | Integrated validation | BACKGROUND_SYSTEM_BEHAVIOR | tests/gates | integrated validation | N/A | — | — | PASS |
| EOS-3.11 | Security/RLS | BACKGROUND_SYSTEM_BEHAVIOR | API guards | commerce/RLS | Enforced | project scope | — | PASS |
| EOS-3.12/12A | Release packaging/evidence | TRUST_RELEASE_STATUS | trust | release docs | Summary only | no secrets | — | PASS |
| EOS-3.13/13R/13R-C | GA activation/assurance | ADMIN_GOVERNANCE / BACKGROUND | trust | ga-authorization | Summary | no secrets | — | PASS |
| EOS-3.14 | Closeout | TRUST_RELEASE_STATUS | trust | closeout artifacts | Summary | — | — | PASS |
| EOS-3-MAINT-0 | Maintenance | ADMIN_GOVERNANCE | trust | MAINT-0 | Summary | — | — | PASS |
| Pilot UI-1 | Project workspace shell | PROJECT_WORKSPACE | ProjectWorkspaceShell | workspace API | Yes | projects | no expansion | PASS |

Implementation audit: `EOS_UI_CAPABILITY_AUDIT_COMPLETE=YES`
