# Digital Twin V1.0 — Public Contracts

Public contract version: **1.0.0**

## Freeze policy

V1.0 public contracts are frozen at GA. Compatibility: **semver_minor_additive_only**. Breaking changes require a new major contract version and a new certification phase. No private repository coupling is part of the public surface.

## Types and services

Ten public contract families are registered in `public-contracts.ts` (`dt.contract.*`). Thirteen service facades are registered in `service-registry.ts`, each at semantic version **1.0.0**, with duplicate runtimes forbidden and fail-closed persistence outages.

## HTTP surface

HTTP routes under `/api/engineering/digital-twin/*` expose identity, state, ingestion, snapshot/history, representation, Digital Thread, simulation packages, solver capabilities, and spatial binding navigation. Errors use `{ error: { code, message, requestId } }`.

## Event contract families

Eight event families map Digital Twin domain events. Payloads carry identifiers and governance flags only — never fabricate provenance, never mutate canonical Engineering OS state on consume.

## Errors

Standard codes include `missing_scope`, `forbidden_capability`, `entitlement_denied`, `idempotency_conflict`, `review_required`, `solver_fail_closed`.

## Versioning, compatibility, deprecation

- Module version: **1.0.0** / status **ga** / release tag `digital-twin-v1.0.0`
- Previous version: `0.11.0-digital-thread`
- Deprecation: none in V1.0 (additive only)

## Dependencies

- Engineering Shared Spatial Domain **0.2.0-spatial-core** (consume SpatialReference.id only)
- Frozen V1 tags: project-intelligence, inspection-intelligence, asset-intelligence, project-controls
- Shared Domain owns asset identity; Shared Project Domain owns project identity

## Consumer boundaries

Consumers may depend on public contract IDs, HTTP error codes, event family prefixes, and entitlement keys. Consumers must not import private repository modules or treat simulated state as observed state.
