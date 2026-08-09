# RTB Security Control Framework

Status: Defined · `SecurityControlFrameworkDefined = true` · Phase 15A

## One reusable control model

```
RTB SecurityControl
        ↓
Framework mappings
        ├── ISO/IEC 27001 themes
        ├── NIST CSF 2.0 outcomes
        ├── ASD Essential Eight strategies
        └── SOC 2 TSC (reserved)
```

Do **not** create independent duplicated control databases per framework.

## Control fields (conceptual)

`controlId` · `title` · `objective` · `owner` · `implementationStatus` ·
`evidenceRefs` · `exceptions` · `reviewStatus` · `frameworkMaps[]`

## Locks

| Statement | |
| --- | --- |
| frameworkMapping ≠ certification | true |
| controlPass ≠ auditOpinion | true |

Reconciles Phase 14C `RTB_ENTERPRISE_SECURITY_CONTROL_MATRIX.md` into future Sec&A ownership.
