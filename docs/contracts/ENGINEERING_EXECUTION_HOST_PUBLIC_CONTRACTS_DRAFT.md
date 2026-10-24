# Engineering Execution Host — Public Contracts Draft

**Version:** `0.1.0-execution-host`  
**Status:** prerelease (not GA / not 1.0.0)  
**Phase:** 13D.1

## Families

1. EngineeringExecutionHostCore
2. EngineeringExecutionHostRegistryCore
3. ProviderInstallationDeclarationCore
4. EngineeringProviderHostProbeCore
5. EngineeringExecutionJobCore
6. ExecutionWorkspaceIsolationCore
7. ExecutionSandboxPolicyCore
8. LicenseStateClassificationCore
9. ProviderVersionPinningCore
10. ExecutionArtifactRefCore
11. ControlVsExecutionPlaneCore
12. EtabsHostReservation

## Required honesty flags

- `silentSolverFallbackAllowed=false`
- `SPACEGASSLiveExecutionCertified=false`
- `ETABSAdapterImplemented=false`
- `ETABSExecutionCertified=false`
- `DigitalTwinV1Intact=true`
- `releaseEligible=true`
- `phase13DReCertificationReady=true` (flag only)

## Notes

Contracts describe infrastructure surfaces. They do not certify commercial solver
execution or freeze Digital Twin V1.
