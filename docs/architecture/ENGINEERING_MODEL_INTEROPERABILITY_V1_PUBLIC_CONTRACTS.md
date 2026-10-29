# Engineering Model Interoperability V1.0 — Public Contracts

Public contract version: **1.0.0**

## Freeze policy

V1.0 public contracts are frozen at GA. Compatibility: **semver_minor_additive_only**. Breaking changes require a new major contract version and a new certification phase. Private vendor COM/API details are not public business contracts.

## Types and services

Public contract families include `EngineeringModelReference`, `EngineeringModelVersion`, `EngineeringModelElementReference`, `EngineeringModelAdapter`, `EngineeringModelFederationService`, `EngineeringModelMapping`, `EngineeringModelChangeImpact`, `EngineeringAnalysisResultReference`, provider capability declarations, `SPACEGASSSolverAdapter`, and `ETABSSolverAdapter`. Twelve service facades are registered in `service-registry.ts`, each at semantic version **1.0.0**, with duplicate runtimes forbidden and fail-closed persistence outages.

## HTTP surface

HTTP routes under `/api/engineering/model-interoperability/*` expose models, versions, elements, mappings, reviews, change-impacts, results, SPACE GASS, and ETABS. Errors use `{ error: { code, message, requestId } }`. Codes include `missing_scope`, `entitlement_denied`, `forbidden_interop_capability`, `invalid_operation`.

## Event contract families

Six event families map interoperability domain events (ids-only payloads). Consumers must not treat imported external results as RTB-certified execution.

## Versioning, compatibility, deprecation

- Module version: **1.0.0** / status **ga** / release tag `engineering-model-interoperability-v1.0.0`
- Previous version: `0.4.0-etabs-federation`
- Deprecation: none in V1.0 (additive only)

## Dependencies

- Digital Twin **1.0.0** (consume-only EngineeringSolverAdapter contracts; package unmodified)
- Controlled Engineering Execution Host **0.1.0-execution-host**
- Frozen V1 tags: project-intelligence, inspection-intelligence, asset-intelligence, project-controls, digital-twin
- Migration lineage: batches **86–89** (no batch_90 required for GA metadata)

## Consumer boundaries

Consumers may depend on public contract IDs, HTTP error codes, event family prefixes, and entitlement keys. `external_solver.execute` does **not** imply provider availability. Live SPACE GASS / live ETABS remain outside V1.0.
