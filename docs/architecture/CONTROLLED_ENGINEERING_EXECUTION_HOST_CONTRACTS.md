# Controlled Engineering Execution Host Contracts (Phase 13D.1)

Version: **0.1.0-execution-host** (prerelease — not 1.0.0)

## Hierarchy

```
RTB AI Platform
  → Engineering OS
    → Engineering Tool Framework
      → Engineering Execution Provider
        → Controlled Engineering Execution Host
          → Licensed External Engineering Software
```

## Contract families

- EngineeringExecutionHostCore
- EngineeringExecutionHostRegistryCore
- ProviderInstallationDeclarationCore
- EngineeringProviderHostProbeCore
- EngineeringExecutionJobCore
- ExecutionWorkspaceIsolationCore
- ExecutionSandboxPolicyCore
- LicenseStateClassificationCore
- ProviderVersionPinningCore
- ExecutionArtifactRefCore
- ControlVsExecutionPlaneCore
- EtabsHostReservation

## Ownership

| Concern | Owner |
| --- | --- |
| Tool Framework | existing Engineering Tool Framework |
| Execution Host | platform_or_engineering_execution_infrastructure |
| Solver | external_engineering_tool |
| Source model | client_or_source_engineering_application |
| Digital Twin | digital_twin |

## Semantics locks

host available ≠ solver available ≠ licensed ≠ healthy ≠ qualified ≠ project approved ≠ execution qualified ≠ engineering approved ≠ solver certification

## Non-goals

No second Tool Framework, no qualification engine inside the host, no ETABS adapter,
no fabricated SPACE GASS live execution certification, no Digital Twin package changes.
