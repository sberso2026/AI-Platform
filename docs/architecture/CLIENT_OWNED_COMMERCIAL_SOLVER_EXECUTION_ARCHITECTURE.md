# Client-Owned Commercial Solver Execution Architecture

Status: Accepted (post-GA architecture clarification)  
Date: 2026-08-09  
Scope: Architecture / governance policy only — **not** an execution certification

## Immutable baseline

| Surface | Identity |
| --- | --- |
| Engineering Model Interoperability V1.0 GA | commit `4e55f32f8b5727ae900915b20492bbdf1d60f6b9` · hosted `31293749417` · tag `engineering-model-interoperability-v1.0.0` |
| Digital Twin V1 | tag `digital-twin-v1.0.0` → `a94425ed009ca087c2f44c9d3757c0c82bd936b1` |
| Frozen V1 tags | `project-intelligence-v1.0.0`, `inspection-intelligence-v1.0.0`, `asset-intelligence-v1.0.0`, `project-controls-v1.0.0`, `digital-twin-v1.0.0`, `engineering-model-interoperability-v1.0.0` |

This clarification **does not** modify Interoperability V1 public contracts, module
manifest, release tag, or Digital Twin V1. It does **not** certify live ETABS or
SPACE GASS execution.

## Purpose

Document the long-term policy for using **client-owned licensed commercial
engineering solvers** through the existing Controlled Engineering Execution Host,
while preserving truthful separation of:

- federation vs execution
- RTB/open solver execution vs client-controlled commercial execution
- license ownership vs RTB orchestration ownership

## Three deployment models

### A. Federation without execution

Existing client models and existing analysis results may be federated **without**
rerunning the source solver.

```
Existing ETABS / SPACE GASS / IFC model + results
        ↓
Provider federation adapter (export / file path)
        ↓
Engineering Model Interoperability V1
        ↓
Digital Twin V1 binding (consume public contracts only)
```

Examples already certified in Interoperability V1:

- IFC/openBIM federation (bounded schema support)
- SPACE GASS export/model + existing-result federation
- ETABS export/model + existing-result federation

`federationRequiresSolverExecution = false`

### B. RTB-certified open execution

Example: CalculiX.

RTB may operate a qualified open-source solver through the existing Engineering
Tool Framework and governed Digital Twin simulation architecture.

Provider-specific execution remains independently certified
(e.g. CalculiX under Digital Twin / Engineering Tool Framework ownership — not
re-owned by Interoperability V1).

### C. Client-controlled commercial execution (preferred commercial path)

Examples: ETABS, SPACE GASS, SAP2000, SAFE, CSiBridge, STAAD, and other
project-approved commercial engineering applications.

```
RTB AI Platform
    ↓
Engineering Tool Framework
    ↓
Four-Layer Qualification
    ↓
Controlled Engineering Execution Host
    ↓
Client-Owned Licensed Engineering Application
    ↓
Governed Execution Artifacts / Simulation Package
    ↓
Engineer Review
    ↓
Digital Twin / Engineering Model Interoperability
```

#### Ownership split

| Party | Owns / responsible for |
| --- | --- |
| **Client** | commercial software license, license entitlement, installed application, vendor terms compliance, controlled execution environment, project authorization for use |
| **RTB** | orchestration, provider discovery, qualification enforcement, execution request governance, provenance, simulation packaging, result federation, audit trail, Digital Twin linkage |

**RTB does not own the client's commercial solver license.**

`commercialSolverLicenseOwnedByRTBRequired = false`  
`clientRetainsCommercialSolverLicenseOwnership = true`

## License governance (fail closed)

Never assume:

| Fallacy | Truth |
| --- | --- |
| installed software | ≠ execution authorization |
| valid license | ≠ automation authorization |
| model access | ≠ solver execution authorization |
| provider qualification | ≠ project qualification |
| execution success | ≠ engineering approval |

Before commercial solver execution, require explicit evidence for **all** of:

1. `providerInstalled`
2. `providerVersionKnown`
3. `providerLicensed`
4. `licenseUseAuthorized`
5. `automationInterfaceAvailable`
6. `methodQualified`
7. `providerQualified`
8. `projectApplicationQualified`
9. `executionQualified`

Execution **must fail closed** when any mandatory authorization or qualification
evidence is absent.

`commercialSolverExecutionRequiresExplicitAuthorization = true`  
`commercialSolverExecutionRequiresFourLayerQualification = true`  
`licenseBypassAllowed = false`  
`automaticEngineeringApprovalEnabled = false`

## License security

RTB **shall not**:

- copy commercial license keys into application code
- commit license credentials
- bypass vendor licensing controls
- emulate license servers to circumvent licensing
- redistribute client licenses
- silently substitute another solver
- claim federation as execution
- claim imported results as RTB-certified execution
- claim controlled execution without real execution evidence

Where possible, commercial license enforcement remains inside the
**client-controlled** engineering environment.

`silentSolverFallbackAllowed = false` (unchanged from Interoperability V1)

## Controlled Engineering Execution Host boundary

Preserve the existing provider-neutral `EngineeringExecutionHost`.

The host **shall not** become:

- qualification authority
- engineering approval authority
- license authority
- solver owner
- engineering method owner

It is an **execution boundary only**. Host certification ≠ solver certification.

## Four-layer qualification (do not collapse)

```
Method Qualification
    ↓
Provider Qualification
    ↓
Project / Application Qualification
    ↓
Execution Qualification
    ↓
Execution
    ↓
Validation
    ↓
Engineer Review
```

## Provider-specific certification

Each commercial solver requires **independent** execution certification.

- ETABS certification does **not** certify SPACE GASS
- SPACE GASS certification does **not** certify SAP2000
- Solver installation alone does **not** certify execution
- Export federation certification does **not** certify live execution

Future provider tracks must keep distinct flags, for example:

| Flag family | Meaning |
| --- | --- |
| `*ModelFederationReady` | export/model federation certified |
| `*ResultFederationReady` | existing-result federation certified |
| `*ControlledExecutionCertified` | live controlled execution certified with evidence |
| `CalculiXExecutionCertified` | open/RTB path under its owning framework |

### Interoperability V1 truthful execution flags (unchanged)

These remain **false** and must not be flipped by this clarification:

| Flag | Value |
| --- | --- |
| `ETABSControlledExecutionCertified` | `false` |
| `ETABSHostedExecutionCertified` | `false` |
| `spaceGassControlledExecutionCertified` | `false` |
| `spaceGassHostedExecutionCertified` | `false` |
| `SPACEGASSLiveProviderReady` | `false` |
| `SPACEGASSLiveExecutionCertified` | `false` |

## Architectural policy flags (documentation)

```
clientLicensedSolverExecutionArchitectureSupported = true
commercialSolverLicenseOwnedByRTBRequired = false
clientRetainsCommercialSolverLicenseOwnership = true
commercialSolverExecutionRequiresExplicitAuthorization = true
commercialSolverExecutionRequiresFourLayerQualification = true
federationRequiresSolverExecution = false
silentSolverFallbackAllowed = false
licenseBypassAllowed = false
automaticEngineeringApprovalEnabled = false
```

These policy flags describe **architecture intent**. They are **not** a claim that
any commercial solver live execution path is certified today.

## Relationship to Interoperability V1 GA

Interoperability V1 certifies the governed federation layer and Controlled
Engineering Execution Host **infrastructure**, plus fail-closed solver adapter
readiness for SPACE GASS and ETABS.

Live commercial-solver execution remains a **separately approved, provider-specific
post-GA track** that may proceed only when:

1. a licensed client-controlled (or otherwise authorized) execution environment exists
2. four-layer qualification evidence is complete
3. provider-specific certification gates pass with real execution evidence
4. no silent fallback or license bypass is introduced

## Non-goals of this clarification

- Modify frozen V1 public contracts or manifest
- Move or recreate `engineering-model-interoperability-v1.0.0`
- Implement ETABS COM / live SPACE GASS / SAP2000 / SAFE / CSiBridge / STAAD
- Install commercial software or introduce solver credentials
- Modify Digital Twin V1
- Introduce a migration
- Start the next implementation phase
