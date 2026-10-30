# EOS 3 — Work Package Maturity

`EOS_WORK_PACKAGE_INDEPENDENT_MATURITY=PASS`

## Principle

Work Package maturity is **independent** of Project lifecycle / maturity.

- Project may remain at historical P0 (or any gate/phase).
- A Work Package may be at `Detailed Engineering` simultaneously.
- Do not overwrite project lifecycle history to force WP demonstration.

`PROJECT_MATURITY != WORK_PACKAGE_MATURITY`

## Initial representative states

Flexible vocabulary (not a hard-coded single universal sequence):

1. Initiation  
2. Concept  
3. Feasibility  
4. FEED  
5. Detailed Engineering  
6. Verification / Review  
7. Ready for Construction  
8. Construction  
9. Commissioning  
10. Complete  
11. Closed  

Pattern-specific maturity definitions belong to `EOS-3-WORKFLOW-1-ENGINEERING-PATTERN-ENGINE` (not this phase).  
`engineeringPatternRef` is a nullable placeholder on the Work Package.

## Defaults

- Create default: `Initiation`
- Pilot brownfield WP-STR-004: explicitly configured `Detailed Engineering`
