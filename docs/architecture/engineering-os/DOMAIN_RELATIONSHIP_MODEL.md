# EOS-A1 Domain Relationship Model

Status: **FROZEN** for planning (documentation-only). No new relationship tables in EOS-A1.

Evidence HEAD: `0dd05bf124c19e1fbb8099f396a904ec86a2d020`

This document defines the **minimum governed relation taxonomy** among canonical objects. Prefer a finite set of relation types over arbitrary strings.

---

## 1. Current persistence (evidence, not the freeze)

| Mechanism | Location | Role after A1 |
| --- | --- | --- |
| `engineering_object_links` | batch_205 | Engineering Core typed links (`from_type`, `from_id`, `to_type`, `to_id`, `relationship` TEXT). **Unconstrained relationship strings today.** Future writes should use this taxonomy. |
| `knowledge_edges` | Platform Kernel | Future host of Engineering Digital Thread (ADR-D3). Do not add a third graph. |
| `project_intelligence_knowledge_*` | PI | Projection / product graph. Do not expand as the canonical thread. |
| FKs | Core / ERA / PI | Ownership and containment where a single parent is true (package→run→finding). |
| `engineering_model_mappings` | batch_86 | Model-element correspondence. Relation type `MAPPED_TO`, not Interface. |

`engineering_object_links.relationship` is currently unconstrained TEXT with uniqueness `(from_type, from_id, to_type, to_id, relationship)`. EOS-A2+ should constrain new writes to the taxonomy below. Do not migrate historical strings in A1.

---

## 2. Relation type taxonomy (finite)

Direction is **from → to**. Inverse names are documentation-only unless a query projection needs them.

| Code | Verb (from → to) | Inverse (informal) | Cardinality (typical) | Temporal? | Provenance? |
| --- | --- | --- | --- | --- | --- |
| `CONTAINS` | parent contains child | `CONTAINED_IN` | 1–n | optional | optional |
| `USES` | system uses asset (participation without exclusive ownership) | `USED_IN` | n–n | optional | optional |
| `DEPENDS_ON` | object requires another to function | `DEPENDED_ON_BY` | n–n | optional | recommended |
| `ALLOCATED_TO` | requirement allocated to system/asset/interface | `HAS_ALLOCATION` | n–n | yes | recommended |
| `VERIFIED_BY` | requirement/change verified by evidence/review/analysis | `VERIFIES` | n–n | yes | **required** |
| `USED_BY` | assumption used by calculation/model/decision/optimization/requirement | `USES_ASSUMPTION` | n–n | yes | recommended |
| `CONNECTS` | interface connects two or more participants | `CONNECTED_BY` | n–n (via interface) | optional | recommended |
| `AFFECTS` | change affects an engineering object | `AFFECTED_BY` | 1–n | yes | **required** |
| `CAUSED_BY` | impact caused by change (or other event) | `CAUSES` | n–1 | yes | **required** |
| `SELECTS` | decision selects an alternative | `SELECTED_BY` | 1–1 (at a time) | yes | recommended |
| `SUPPORTED_BY` | decision/finding supported by evidence | `SUPPORTS` | n–n | yes | **required** |
| `BASED_ON` | decision/analysis based on assumption | `BASIS_FOR` | n–n | yes | recommended |
| `REVIEWS` | review package reviews engineering object(s) | `REVIEWED_BY` | n–n | via run | recommended |
| `FOUND_IN` | finding found in a review run | `HAS_FINDING` | n–1 | via run | **required** |
| `RESOLVES` | disposition resolves/accepts/rejects a finding | (finding has disposition) | n–1 per action | **required** | **required** |
| `BASELINES` | configuration baselines configuration items | `BASELINED_IN` | 1–n | **required** | **required** |
| `SUPERSEDES` | later object supersedes earlier | `SUPERSEDED_BY` | 1–1 chain | **required** | **required** |
| `MAPPED_TO` | model element mapped to platform object | `MAPPED_FROM` | n–1 confirmed | mapping state | recommended |
| `REPRESENTED_BY` | engineering object represented by KG node or twin | `REPRESENTS` | 0–1 | optional | optional |
| `RELATED_TO` | **discouraged residual** | — | n–n | no | required if used |

`RELATED_TO` is permitted only as a temporary import shim. New Engineering OS writes must not use it.

---

## 3. Required minimum graph

```
Project --CONTAINS--> System
System  --CONTAINS--> Subsystem
System  --CONTAINS | USES | DEPENDS_ON--> Asset
Requirement --ALLOCATED_TO--> System | Asset | Interface
Requirement --VERIFIED_BY--> Evidence | Review Package | Analysis Run
Assumption --USED_BY--> Document(Calculation) | Model | Decision | Optimization Study | Requirement
Interface --CONNECTS--> System | Asset | Discipline | Responsibility
Change --AFFECTS--> Engineering Object
Impact --CAUSED_BY--> Change
Decision --SELECTS--> Alternative
Decision --SUPPORTED_BY--> Evidence
Decision --BASED_ON--> Assumption
Decision --AFFECTS--> Configuration | System | Asset | Requirement
Review Package --REVIEWS--> Engineering Object(s)
Finding --FOUND_IN--> Review Run
Finding --SUPPORTED_BY--> Evidence
Disposition --RESOLVES--> Finding
Configuration --BASELINES--> Configuration Item
Digital Thread Relation --LINKS--> Canonical Engineering Objects
```

`LINKS` is not a write-time relation type. It is the Digital Thread *view* over the typed relations above (ADR-D3).

---

## 4. Relationship ownership

| Relation family | Canonical owner of the edge | Current implementation | Future store |
| --- | --- | --- | --- |
| Core FKs (project member, asset parent, document→asset) | Engineering Core | SQL FKs | remain FKs |
| Register links (decision→asset, action origin) | Engineering Core | FKs + `engineering_object_links` | Core links; project to Platform KG |
| ERA package/run/finding/evidence/disposition | Engineering Review | composite FKs + JSONB | remain ERA tables |
| PI finding source/core_record | Project Intelligence | `source_*`, `core_record_*` | remain PI; optional `RELATED` projection to ERA |
| Model mapping | Engineering Core (interop) | `engineering_model_mappings` | remain; expose as `MAPPED_TO` |
| Digital Thread projection | Platform Knowledge Graph | `knowledge_node_id` FKs on Core rows | `knowledge_edges` with typed `relation` |
| Twin representation | Operational Digital Twin | `digital_twin_id` / `kernel_twin_id` | `REPRESENTED_BY` only |

No relation type has two canonical owners. Consumers may read; they may not mint a parallel edge type for the same fact.

---

## 5. Direction and identity of an edge

1. **Subject (from)** is the object that “does” the verb.
2. **Object (to)** is the target.
3. Edge identity (future KG / constrained links): `(tenant_id, from_type, from_id, relation_code, to_type, to_id)` plus optional `valid_from`/`valid_to` for temporal edges.
4. Do not store the inverse as a second row unless a read model requires it. Query by swapping endpoints.
5. ERA uniqueness already encodes ownership: finding is found in exactly one run of one package.

---

## 6. Temporal and provenance

| Concern | Rule |
| --- | --- |
| Temporal validity | Configuration, allocation, assumption use, and supersession **must** be able to carry `valid_from` / `valid_to` or equivalent revision pins. Containment may omit temporal until Configuration Intelligence exists. |
| Provenance | `VERIFIED_BY`, `SUPPORTED_BY`, `AFFECTS`, `CAUSED_BY`, `FOUND_IN`, `RESOLVES`, `BASELINES`, `SUPERSEDES` require actor, timestamp, and source record id. |
| Confidence | Optional on `BASED_ON`, `USED_BY`, `ALLOCATED_TO` when inferred. ERA already stores finding confidence separately; do not duplicate it on the thread edge. |
| Evidence | Evidence is a node, not an edge attribute dump. The edge `SUPPORTED_BY` points at Evidence. |

Until KG hosting lands, provenance lives on the owning table (ERA evidence rows, decision `approved_by`, mapping reviews).

---

## 7. Examples

**Allocation**

- From: Requirement `CAP-50`
- Relation: `ALLOCATED_TO`
- To: System `CRUSH-01`
- Provenance: author, document revision of the basis of design
- Temporal: valid while requirement revision is current

**Review**

- Review Package `RP-12` `REVIEWS` Document `CALC-CR-101-001` Rev B and Asset `CR-101`
- Finding `F-88` `FOUND_IN` Run `RR-12-3`
- Finding `SUPPORTED_BY` Evidence (span in Rev B)
- Disposition `RESOLVES` Finding (`accept` / `reject` / …)

**Change vs impact**

- Change `ECN-003` `AFFECTS` Asset `CR-101` and Requirement `CAP-50`
- Impact `IMP-003-1` `CAUSED_BY` `ECN-003` (throughput derate)
- Decision `EDN-022` `SELECTS` Alternative “liner change” and `AFFECTS` Configuration Baseline `BL-CR-04`

---

## 8. Anti-patterns

- Do not encode System containment by creating an Asset whose tag is the system name.
- Do not use PI Findings as the only store of `ALLOCATED_TO` or `VERIFIED_BY`.
- Do not create `knowledge_edges` *and* unconstrained `engineering_object_links` for the same fact without a projection rule.
- Do not treat `engineering_model_mappings` as Interface `CONNECTS`.
- Do not add free-text relation types in new Engineering OS APIs.
