# Project Controls V1.0 — Public Contracts

Public contract version: **1.0.0**

## Freeze policy

V1.0 public contracts are frozen at GA. Additive minor changes only within the 1.x line. Breaking changes require a new major contract version and a new certification phase.

## Service contract family

Fifteen service facades are registered in `service-registry.ts`, each at semantic version **1.0.0**, with duplicate runtimes forbidden.

## Event contract families

Fourteen event families map every `PROJECT_CONTROLS_EVENTS` entry. Payloads carry identifiers and governance flags only — no earned value, CPM output or financial posting.

## Public contract families

| Contract ID | Advisory | Owner |
| --- | --- | --- |
| `pc.contract.progress` | No | project_controls |
| `pc.contract.schedule` | No | project_controls |
| `pc.contract.change` | Yes | project_controls |
| `pc.contract.cost` | Yes | project_controls |
| `pc.contract.productivity` | Yes | project_controls |
| `pc.contract.forecast` | Yes | project_controls |
| `pc.contract.decision_support` | Yes | project_controls |
| `pc.contract.scenario` | Yes | project_controls |
| `pc.contract.risk_opportunity` | Yes | project_controls |
| `pc.contract.assurance` | Yes | project_controls |
| `pc.contract.explainability` | Yes | project_controls |
| `pc.contract.organizational_learning` | Yes | project_controls |
| `pc.contract.profile` | Yes | project_controls |
| `pc.contract.snapshot` | No | project_controls |
| `pc.contract.timeline` | No | project_controls |

All contracts require audit, idempotency on mutations, and forbid canonical state mutation.
