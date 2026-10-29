# Engineering OS Tool Framework Integration

Status: Phase 14A · `EngineeringOSToolFrameworkIntegrated = true`  
`duplicateEngineeringToolFrameworkDetected = false`

## Decision

All engineering computational/integration tools use **one** Engineering Tool
Framework (Platform Intelligence / ETF). Do not create a second framework.

## Inventory coverage

| Tool class | Framework path | Status |
| --- | --- | --- |
| CalculiX | ETF + DT adapters | production_bounded |
| Future client-owned ETABS | ETF → Exec Host → client app | architecture supported; execution not certified |
| Future client-owned SPACE GASS | ETF → Exec Host → client app | blocked_external_dependency for live |
| Structural calculators | ETF | as registered |
| Code / document tools | ETF / PI tools | production |
| Future FEA / calculators | ETF reserved | reserved |

## Framework concerns reviewed

Tool Registry · Discovery · Contracts · Permissions · Invocation · Timeout ·
Versioning · Certification · Sandbox · Approval

## Client-owned commercial solver modes (incorporated)

See `CLIENT_OWNED_COMMERCIAL_SOLVER_EXECUTION_ARCHITECTURE.md`:

- A Federation without execution
- B RTB-certified open execution
- C Client-controlled commercial solver execution

`clientLicensedSolverExecutionArchitectureSupported = true`  
`clientLicensedETABSExecutionCertified = false`  
`clientLicensedSPACEGASSExecutionCertified = false`  
`silentSolverFallbackAllowed = false`
