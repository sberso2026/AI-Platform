# Phase 12I — First Real Solver Selection: CalculiX (ccx)

## Decision

**First real engineering solver adapter = CalculiX (`ccx`).**

## Rationale

1. **Open-source GPL** — no commercial license secrets in CI or Twin tables
2. **Automatable CLI** — `ccx` with version identity (`ccx -v` / banner)
3. **ONE bounded method** — linear elastic static structural analysis only
4. **CI-installable** — Ubuntu: `apt-get install -y calculix-ccx`
5. **Parseable artifacts** — `.inp` / `.dat` / `.frd`; sandboxable process spawn
6. **Engineering relevance** without claiming FEA product breadth

## Why not OpenSees first?

OpenSees is powerful for structural dynamics / nonlinear frameworks, but:

- Heavier / less uniform install story across CI images
- Broader method surface than the Phase 12I “one bounded method” goal
- Less “apt one-liner” predictability than CalculiX on Ubuntu runners

## Why not OpenFOAM first?

OpenFOAM is the open CFD stack of record, but:

- CFD scope exceeds the first structural linear-elastic method
- Large install footprint and longer CI times
- Less friendly for a minimal hosted truthfulness gate in Phase 12I

## Reserved (unavailable stubs)

ANSYS, Abaqus, OpenSees, OpenFOAM, SAP2000, ETABS, STAAD, SpaceGass (and related) remain
`status: reserved`, `implemented: false`, `activatable: false`.

## Certified method

`linear_elastic_static` — axial bar / tip-load idealization with analytical reference
`δ = PL/(AE)` and relative tolerance (default 5%).
