# Future ETABS Host Integration (Architecture Only)

Phase 13D.1 reserves ETABS on the same Controlled Engineering Execution Host
framework. **No ETABS adapter code** ships in this phase.

## Integration path (future)

1. Declare ETABS provider installation metadata on a registered host.
2. Implement `EngineeringProviderHostProbe` for ETABS process/API readiness.
3. Keep qualification (method/provider/application/execution) in the existing
   Engineering Tool Framework — not inside the host.
4. Authorize `EngineeringExecutionJob` with ETABS `providerId` and version policy.
5. Stage inputs/outputs via Platform Files refs into isolated job workspaces.

## Flags (current)

- `ETABSAdapterImplemented=false`
- `ETABSExecutionCertified=false`

## Constraints

- Do not redesign the host for ETABS.
- Do not store CSI license secrets in Platform tables.
- Do not silently fallback to CalculiX or SPACE GASS.
