# EOS-MODULE-OPS-UX-1 capability map

Classification of **advertised** capabilities from frozen V1 registries. No invented
functions. Sources:

- `packages/asset-intelligence/src/domain/capability-registry.ts`
- `packages/digital-twin/src/domain/capability-registry.ts`
- `packages/engineering-model-interoperability/src/domain/capability-registry.ts`
- `packages/project-controls/src/domain/capability-registry.ts`

Hosted operational reads used by UX (existing):

| Application | Canonical ownership | Operational reads |
|---|---|---|
| Asset Intelligence | Engineering Shared Asset Domain owns identity | `GET /api/engineering/assets`, `GET /api/engineering/asset-intelligence/asset-snapshot`, condition/reliability/degradation/failure/maintenance GET (asset-scoped) |
| Digital Twin | Twin identity; consumes asset/spatial refs | `GET /api/engineering/digital-twin/workspace-snapshot`, `GET /api/engineering/digital-twin/twin-snapshot` |
| Engineering Models | Source-owned models; EMI federation | `GET /api/engineering/model-interoperability/workspace-snapshot` |
| Project Controls | Engineering Shared Project Domain owns identity | `GET /api/engineering/dashboard` (published work items). Progress/schedule/cost GET routes are contract-shape + governance flags — **not shown in primary UI**. |

Classes:

- **OPERATIONAL** — GA hosted function the user can operate (assess/read/register/review) without inventing a new product.
- **READ_ONLY_DATA** — GA composed or historical read of persisted records.
- **ADVISORY** — `ga_advisory` / labelled advice; never authority.
- **GOVERNANCE_ONLY** — certification, RLS, registries, predictive/solver governance.
- **NOT_IMPLEMENTED** — reserved or unavailable.
- **EXTERNAL_DEPENDENCY** — blocked on a provider/host that is not certified here.

OPERATIONAL counts (this ticket):

```
ASSET_OPERATIONAL_CAPABILITY_COUNT=7
TWIN_OPERATIONAL_CAPABILITY_COUNT=9
MODEL_OPERATIONAL_CAPABILITY_COUNT=11
PROJECT_CONTROLS_OPERATIONAL_CAPABILITY_COUNT=8
```

---

## 1. Asset Intelligence

Canonical asset identity: Engineering Shared Asset Domain (`GET /api/engineering/assets`).
Asset Intelligence does not duplicate asset identity.

| Capability id | Surface | Registry maturity | Class | UX |
|---|---|---|---|---|
| asset_intelligence.condition | condition | ga | OPERATIONAL | Overview / Condition / Asset 360 |
| asset_intelligence.criticality | criticality | ga | OPERATIONAL | Overview / Criticality / Asset 360 |
| asset_intelligence.reliability | reliability | ga_advisory | ADVISORY | Reliability (labelled) |
| asset_intelligence.failure | failure | ga | OPERATIONAL | Failure Modes / Asset 360 |
| asset_intelligence.time_series | time_series | ga | OPERATIONAL | Evidence (time series where recorded) |
| asset_intelligence.trend_degradation | trend_degradation | ga_advisory | ADVISORY | Degradation (labelled) |
| asset_intelligence.lifecycle | lifecycle | ga | READ_ONLY_DATA | Asset 360 |
| asset_intelligence.decision_context | decision_context | ga | OPERATIONAL | Recommendations / Asset 360 |
| asset_intelligence.risk_signal | risk_signal | ga_advisory | ADVISORY | Asset 360 |
| asset_intelligence.maintenance_recommendation | maintenance_recommendation | ga_advisory | ADVISORY | Recommendations |
| asset_intelligence.priority | priority | ga_advisory | ADVISORY | Asset 360 |
| asset_intelligence.fusion | fusion | ga | OPERATIONAL | Asset 360 |
| asset_intelligence.predictive_governance | predictive_governance | ga | GOVERNANCE_ONLY | Administration / Release |
| asset_intelligence.health_composition | health | ga | READ_ONLY_DATA | Overview / Condition (when present) |
| asset_intelligence.evidence_confidence | evidence_confidence | ga | READ_ONLY_DATA | Evidence |
| asset_intelligence.timeline | timeline | ga | READ_ONLY_DATA | Evidence / Asset 360 history |
| asset_intelligence.snapshot | snapshot | ga | READ_ONLY_DATA | Asset 360 |
| asset_intelligence.source_trust_model | fusion | reserved | NOT_IMPLEMENTED | not exposed |
| asset_intelligence.quantitative_reliability | reliability | reserved | NOT_IMPLEMENTED | not exposed |
| asset_intelligence.predictive_execution | predictive | unavailable | NOT_IMPLEMENTED | Release only |
| asset_intelligence.probability_of_failure | predictive | unavailable | NOT_IMPLEMENTED | Release only |
| asset_intelligence.remaining_useful_life | predictive | unavailable | NOT_IMPLEMENTED | Release only |
| asset_intelligence.predictive_ml | predictive | unavailable | NOT_IMPLEMENTED | Release only |
| asset_intelligence.cmms_work_order | maintenance_recommendation | unavailable | NOT_IMPLEMENTED | not exposed |
| asset_intelligence.digital_twin | digital_twin | unavailable | NOT_IMPLEMENTED | cross-link to Twin app only |

Persistence health (`GET .../asset-intelligence/health`) is diagnostics, not a product metric.

---

## 2. Digital Twin

| Capability id | Surface | Registry maturity | Class | UX |
|---|---|---|---|---|
| digital_twin.core | identity | ga | OPERATIONAL | Overview / Twins |
| digital_twin.state | state | ga | OPERATIONAL | State / twin detail |
| digital_twin.state_history | snapshot | ga | OPERATIONAL | History |
| digital_twin.state_ingestion | ingestion | ga | OPERATIONAL | twin detail (candidates not auto-published) |
| digital_twin.telemetry_binding | telemetry | ga | OPERATIONAL | Telemetry |
| digital_twin.representation | representation | ga | OPERATIONAL | Representation |
| digital_twin.digital_thread | digital_thread | ga | OPERATIONAL | Digital Thread |
| digital_twin.simulation_governance | simulation | ga_advisory | GOVERNANCE_ONLY | Administration |
| digital_twin.simulation_assurance | assurance | ga_advisory | GOVERNANCE_ONLY | Administration |
| digital_twin.engineering_simulation_integration | solver | ga | GOVERNANCE_ONLY | Administration (CalculiX linear static; not a new viewer) |
| digital_twin.solver_capability_registry | capabilities | ga | GOVERNANCE_ONLY | Administration |
| digital_twin.spatial_binding | spatial | ga | OPERATIONAL | Representation / Evidence |
| digital_twin.review_workflow | workflow | ga | OPERATIONAL | twin detail |
| digital_twin.rls | rls | ga | GOVERNANCE_ONLY | not a product tab |
| digital_twin.physical_actuation | actuation | unavailable | NOT_IMPLEMENTED | not exposed |
| digital_twin.automatic_control | control | unavailable | NOT_IMPLEMENTED | not exposed |
| digital_twin.predictive_twin | prediction | unavailable | NOT_IMPLEMENTED | not exposed |
| digital_twin.native_engineering_solver | solver | unavailable | NOT_IMPLEMENTED | not exposed |
| digital_twin.optimization | optimization | unavailable | NOT_IMPLEMENTED | not exposed |
| digital_twin.shm | shm | unavailable | NOT_IMPLEMENTED | not exposed |
| digital_twin.gis_runtime | spatial | unavailable | NOT_IMPLEMENTED | not exposed |

No new BIM viewer, GIS, native solver, or SHM runtime.

---

## 3. Engineering Models (EMI)

| Capability id | Surface | Registry maturity | Class | UX |
|---|---|---|---|---|
| emi.model_reference | models | ga | OPERATIONAL | Models / Overview |
| emi.model_versioning | versions | ga | OPERATIONAL | Versions / model detail |
| emi.element_references | elements | ga | OPERATIONAL | Elements |
| emi.federation_service | federation | ga | OPERATIONAL | Interoperability |
| emi.mapping | mappings | ga | OPERATIONAL | Mappings |
| emi.mapping_review | reviews | ga | OPERATIONAL | Mappings |
| emi.change_impact | change_impact | ga | OPERATIONAL | model detail |
| emi.result_references | results | ga | OPERATIONAL | Results |
| emi.ifc_federation | ifc | ga (flag) | OPERATIONAL | Interoperability (bounded IFC) |
| emi.spacegass_model_federation | spacegass | ga (flag) | OPERATIONAL | Interoperability |
| emi.spacegass_result_federation | spacegass | ga_bounded | READ_ONLY_DATA | Results |
| emi.spacegass_live_api | spacegass_live | blocked_external_dependency | EXTERNAL_DEPENDENCY | Administration |
| emi.spacegass_execution | spacegass_execution | blocked_external_dependency | EXTERNAL_DEPENDENCY | Administration |
| emi.etabs_model_federation | etabs | ga (flag) | OPERATIONAL | Interoperability |
| emi.etabs_result_federation | etabs | ga_bounded | READ_ONLY_DATA | Results |
| emi.etabs_live_com | etabs_live | unavailable | NOT_IMPLEMENTED | Administration |
| emi.etabs_execution | etabs_execution | unavailable | NOT_IMPLEMENTED | Administration |
| emi.execution_host | execution_host | ga | GOVERNANCE_ONLY | Administration (host ≠ solver) |
| emi.sap2000 | csi | reserved | NOT_IMPLEMENTED | not claimed |
| emi.safe | csi | reserved | NOT_IMPLEMENTED | not claimed |
| emi.csibridge | csi | reserved | NOT_IMPLEMENTED | not claimed |
| emi.analysis_model_generation | authoring | reserved | NOT_IMPLEMENTED | not claimed |
| emi.source_model_mutation | authoring | unavailable | NOT_IMPLEMENTED | not claimed |
| emi.automatic_mapping_approval | mappings | unavailable | NOT_IMPLEMENTED | not claimed |

Truthful result states: Imported, Federated, Results available, Execution unavailable, External result, Mapping required. Live execution is never claimed.

---

## 4. Project Controls

Distinct from Project Intelligence: this product presents governed published controls
information. It does not reason across the wider evidence graph.

HTTP GET for progress/schedule/cost/change/forecast currently returns **scope echo +
governance flags**, not evidence payloads. Primary UX must not render those flags.
Empty published-evidence states are truthful.

| Capability id | Surface | Registry maturity | Class | UX |
|---|---|---|---|---|
| project_controls.progress | progress | ga | OPERATIONAL | Overview / Progress |
| project_controls.schedule | schedule | ga | OPERATIONAL | Overview / Schedule |
| project_controls.change | change | ga | OPERATIONAL | Overview / Change |
| project_controls.cost | cost | ga | OPERATIONAL | Overview / Cost |
| project_controls.productivity | productivity | ga | OPERATIONAL | Productivity |
| project_controls.forecast | forecast | ga_advisory | ADVISORY | Forecast (labelled) |
| project_controls.decision_support | decision | ga_advisory | ADVISORY | not a PI duplicate; Assurance |
| project_controls.scenario_intelligence | scenario | ga_advisory | ADVISORY | Scenarios (labelled) |
| project_controls.risk_opportunity_intelligence | risk_opportunity | ga_advisory | ADVISORY | Overview attention (labelled) |
| project_controls.assurance_intelligence | assurance | ga_advisory | ADVISORY | Assurance |
| project_controls.explainability_intelligence | explainability | ga_advisory | ADVISORY | Administration |
| project_controls.organizational_learning | organizational_learning | ga_advisory | ADVISORY | not primary |
| project_controls.project_context | profile | ga | OPERATIONAL | Overview context |
| project_controls.project_context_composition | composition | ga | OPERATIONAL | Overview composition |
| project_controls.snapshot | snapshot | ga | READ_ONLY_DATA | not a landing |
| project_controls.timeline | timeline | ga | READ_ONLY_DATA | Overview “what changed” when present |
| project_controls.shared_project_domain | shared_domain | ga | GOVERNANCE_ONLY | consume-only |
| project_controls.review_workflow | workflow | ga | OPERATIONAL | Change / Assurance |
| project_controls.rls | rls | ga | GOVERNANCE_ONLY | not a product tab |
| project_controls.native_cpm | schedule | unavailable | NOT_IMPLEMENTED | not claimed |
| project_controls.critical_path_engine | schedule | unavailable | NOT_IMPLEMENTED | not claimed |
| project_controls.resource_leveling | schedule | unavailable | NOT_IMPLEMENTED | not claimed |
| project_controls.schedule_execution | schedule | unavailable | NOT_IMPLEMENTED | not claimed |
| project_controls.financial_posting | cost | unavailable | NOT_IMPLEMENTED | not claimed |
| project_controls.budget_ledger | cost | unavailable | NOT_IMPLEMENTED | not claimed |
| project_controls.accounting_ledger | cost | unavailable | NOT_IMPLEMENTED | not claimed |
| project_controls.autonomous_project_management | decision | unavailable | NOT_IMPLEMENTED | not claimed |
| project_controls.automatic_contract_instruction | change | unavailable | NOT_IMPLEMENTED | not claimed |
| project_controls.earned_value | progress | unavailable | NOT_IMPLEMENTED | not claimed |

Published attention currently comes from the existing dashboard composition
(actions owned by Project Controls). Risks/TQs remain source-owned registers and
are not re-homed.

---

## Additive endpoints

None. UX uses existing GETs. Project Controls flag-only GETs are not bound into
primary screens.

## Architecture freeze

- No route architecture redesign (existing `/release` URLs kept; demoted in nav).
- No schema, ownership, AI, graph, commerce, auth, or RBAC change.
