# Engineering Model Interoperability V1.0 — Commercial Packaging

## Capability groups (marketable)

1. **Model Federation Core** — references, versions, elements, mappings, change-impact
2. **IFC/openBIM Federation** — vendor-neutral first-class path (bounded schemas)
3. **Structural Analysis Model Federation** — governed analysis-model federation surface
4. **ETABS Federation** — export/fixture model + existing-result federation
5. **SPACE GASS Federation** — export/model + existing-result federation
6. **Existing Analysis Result Federation** — source_declared result references
7. **Digital Twin Model Binding** — twin binding without DT package mutation
8. **Controlled Engineering Execution Infrastructure** — host registry/health/isolation
   (Host certification ≠ solver certification.)

## Explicit commercial exclusions

Do **not** market live solver execution unless independently certified:

- SPACE GASS live API / live execution
- ETABS live COM / real execution
- SAP2000 / SAFE / CSiBridge
- analysis-model generation / source-model authoring
- automatic mapping approval / silent solver substitution
- full BIM viewer / enterprise BIM throughput

`external_solver.execute` entitlement must not be sold as provider availability.
