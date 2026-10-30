# EOS 3 UI — Route / Capability Inventory

`EOS_ROUTE_CAPABILITY_INVENTORY_COMPLETE=YES`

| Route | Capability | Scope | Canonical object / service | Read | Write | Qualification | Status |
|-------|------------|-------|----------------------------|------|-------|---------------|--------|
| `/engineering/projects/{id}` | Overview control centre | Project | workspace snapshot | projects | — | display | LIVE |
| `/engineering/projects/{id}/setup` | Project Setup + jurisdiction/standards | Project | setup profile | projects | projects | display | LIVE |
| `/engineering/projects/{id}/lifecycle` | Lifecycle & gates | Project | lifecycle service + workspace gates | projects | projects | — | LIVE |
| `/engineering/projects/{id}/requirements` | Requirements | Project | Requirement | projects | projects | — | LIVE |
| `/engineering/projects/{id}/engineering-basis` | Engineering Basis | Project | EngineeringBasis | projects | projects | — | LIVE |
| `/engineering/projects/{id}/assumptions` | Assumptions | Project | Assumption | projects | projects | — | LIVE |
| `/engineering/projects/{id}/systems` | Systems & Interfaces | Project | System, Interface | projects | projects | — | LIVE |
| `/engineering/projects/{id}/calculations` | Calculations | Project | Calculation | projects | projects | QUALIFIED_BOUNDED display | LIVE |
| `/engineering/projects/{id}/decisions` | Decision intelligence | Project | Decision (+ bridge) | projects | projects | AI≠authority | LIVE |
| `/engineering/projects/{id}/optimization` | Optimization | Project | OptimizationRun (+ bridge) | projects | projects | NOT_QUALIFIED externals | LIVE |
| `/engineering/projects/{id}/changes` | Change management | Project | Change | projects | projects | — | LIVE |
| `/engineering/projects/{id}/impact-analysis` | Impact analysis | Project | Impact / CHANGE_AFFECTS | projects | projects | staleness | LIVE |
| `/engineering/projects/{id}/technical-queries` | TQs | Project | bridge EOS2 TQ | projects | projects | — | LIVE |
| `/engineering/projects/{id}/risks` | Risks | Project | bridge EOS2 risks | projects | projects | — | LIVE |
| `/engineering/projects/{id}/deliverables` | Deliverables | Project | Deliverable | projects | projects | — | LIVE |
| `/engineering/projects/{id}/documents` | Documents | Project | bridge documents | projects | projects | — | LIVE |
| `/engineering/projects/{id}/models` | Models | Project | bridge models | projects | projects | — | LIVE |
| `/engineering/projects/{id}/reviews` | Reviews | Project | Review | projects | projects | AI≠approve | LIVE |
| `/engineering/projects/{id}/actions` | Actions | Project | bridge actions | projects | projects | — | LIVE |
| `/engineering/projects/{id}/digital-thread` | Digital thread | Project | Eos3 relationships | projects | projects | graph authority | LIVE |
| `/engineering/projects/{id}/knowledge` | Knowledge | Project | bridge PI knowledge | projects | — | provenance | LIVE |
| `/engineering/projects/{id}/engineering-ai` | Engineering AI | Project | Ask AI + boundary | projects | — | warnings | LIVE |
| `/engineering/projects/{id}/assets` | Assets | Project | Asset (+ bridge) | projects | projects | — | LIVE |
| `/engineering/projects/{id}/inspections` | Inspections | Project | Inspection (+ bridge) | projects | — | — | LIVE |
| `/engineering/projects/{id}/handover` | Handover | Project | project-to-asset | projects | — | — | LIVE |
| `/engineering/projects/{id}/configuration-history` | Configuration | Project | bridge configuration | projects | — | — | LIVE |
| `/engineering/projects/{id}/evidence` | Evidence/provenance | Project | Evidence + audit | projects | — | — | LIVE |
| `/engineering/projects/{id}/qualification` | Qualification context | Project | qualification snapshot | projects | — | accuracy | LIVE |
| `/engineering/projects/{id}/audit` | Audit/events | Project | workspace audit | projects | — | — | LIVE |
| `/engineering/projects/{id}/integrations` | Integrations/solvers | Project | connector/solver status | projects | — | NO≠qualified | LIVE |
| `/engineering/projects/{id}/trust` | Trust/release | Project | eos3-identity | projects | — | — | LIVE |
| `/engineering/projects/{id}/migration` | Migration status | Project | coexistence claim | projects | — | — | LIVE |
| `/engineering/projects/{id}/reports` | Reports | Project | bridge reports | projects | — | — | LIVE |
| `/api/engineering/projects/{id}/workspace` | Workspace API | Project | Eos3CanonicalObjectStore wrapper | projects | projects | no expansion | LIVE |

Bridges preserve existing global registers with `?projectId=` (requirements, decisions, changes, lifecycle, thread, etc.).
