# EOS 3 — Work Package Execution Boundary

## Purpose

A Work Package is a bounded unit of engineering work that:

- has a defined purpose;
- affects one or more assets/systems;
- has responsible people/disciplines;
- consumes inputs and produces outputs;
- contains decisions, assumptions, deliverables, reviews, changes, evidence;
- has maturity independent of the project container;
- may depend on / block / be blocked by other Work Packages.

## Boundary rules

| Layer | Role |
| --- | --- |
| Project | Commercial / organizational container |
| Work Package | Primary engineering **execution** boundary |
| Asset/System | What the work affects (full ontology = DOMAIN-2) |
| Engineering objects | Created, reviewed, changed, approved once — associated, not copied |

`PROJECT_SINGLE_STAGE_ASSUMPTION=REMOVED_FROM_WORK_PACKAGE_MODEL`

## Out of scope (this phase)

- Full Asset/System ontology
- Full relationship-graph reasoning
- Engineering Pattern engine
- Context Resolution / My Work prioritization
- Stable shell / adaptive cockpit redesign
- Staleness / assumption propagation engines

`EOS_DOMAIN_1_SCOPE_DISCIPLINE=PASS`

## Product rules preserved

- `ENGINEERS_DO_ENGINEERING`
- `EOS_DOES_ADMINISTRATION`
- `ASK_ONCE` / `REUSE_EVERYWHERE`
- `COMPLEXITY_IN_BACKEND` / `SIMPLICITY_IN_FRONTEND`
- Human engineering authority remains with humans
