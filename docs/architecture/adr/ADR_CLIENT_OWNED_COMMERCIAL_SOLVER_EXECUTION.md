# ADR — Client-Owned Commercial Solver Execution

Status: Accepted (post-GA architecture clarification) · Date: 2026-08-09

## Context

Engineering Model Interoperability V1.0 GA certifies federation and Controlled
Engineering Execution Host infrastructure without certifying live ETABS or
SPACE GASS execution. Commercial solvers are typically licensed and installed in
**client-controlled** environments. RTB must not become the license owner or
bypass vendor controls, yet must still orchestrate governed execution when
explicitly authorized and qualified.

Related:

- `docs/architecture/CLIENT_OWNED_COMMERCIAL_SOLVER_EXECUTION_ARCHITECTURE.md`
- `docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_SOLVER_STRATEGY.md`
- `docs/architecture/DIGITAL_TWIN_SOLVER_LICENSE_GOVERNANCE.md`
- Immutable Interop V1 tag: `engineering-model-interoperability-v1.0.0` → `4e55f32…`

## Decision

RTB supports three long-term solver deployment models:

1. **Federation without execution** — federate existing models/results without
   rerunning the source solver (`federationRequiresSolverExecution = false`).
2. **RTB-certified open execution** — operate qualified open solvers (e.g.
   CalculiX) through Engineering Tool Framework / Digital Twin ownership.
3. **Client-controlled commercial execution** — route requests through
   Engineering Tool Framework → four-layer qualification → Controlled
   Engineering Execution Host → **client-owned licensed application**.

Ownership:

- Client retains commercial license, entitlement, install, vendor compliance,
  execution environment, and project authorization.
- RTB owns orchestration, discovery, qualification enforcement, provenance,
  packaging, result federation, audit, and Digital Twin linkage.
- RTB does **not** own the client's commercial solver license
  (`commercialSolverLicenseOwnedByRTBRequired = false`).

Constraints preserved:

- Controlled Execution Host remains an execution boundary only (not license /
  method / engineering-approval authority).
- Four-layer qualification stages are not collapsed.
- Provider execution certifications remain independent.
- `silentSolverFallbackAllowed = false`, `licenseBypassAllowed = false`.
- Existing Interop V1 execution flags remain `false` until separately certified.

## Consequences

- Architecture documented without changing Interoperability V1.0 frozen surface.
- Future live commercial-solver work is a post-GA provider track requiring real
  licensed environments and provider-specific certification evidence.
- No migration, no COM/live SPACE GASS implementation, no V1 tag movement in
  this clarification.
