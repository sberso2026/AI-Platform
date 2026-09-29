# EOS-A1 Systems and Disciplines Model

Status: **FROZEN** vocabulary. EOS-A3 implemented `engineering_systems` (self-parent subsystems) and `engineering_interfaces` (CONNECTS endpoints via `engineering_object_links`). See `EOS_A3_IMPLEMENTATION.md`.

Evidence HEAD: `0dd05bf124c19e1fbb8099f396a904ec86a2d020`

---

## 1. Dual view (required)

Engineering OS **must** support both views over the same objects.

### Discipline view

Practice / delivery lens. Catalogue evidence: `engineering_disciplines` + `ENGINEERING_DISCIPLINES` in `packages/engineering-os/src/manifest.ts`:

Process, Mechanical, Piping, Structural, Electrical, Civil, Geotechnical, I&C (Instrumentation), Materials (when added), Safety (HSE), Environmental (when added), plus current extras: Marine, Construction, Project Controls, Quality.

Discipline Intelligence **classifies work** (documents, calculations, models, reviews, resources). It **must not own System identity**.

### System view

Functional / behavioural lens. Examples: Crushing System, Conveying System, Water System, Power System, Pumping System, Tailings System.

System objects are **multidisciplinary**. Systems Intelligence **consumes** outputs from multiple disciplines.

---

## 2. Object definitions (short)

| Object | Definition | Current evidence |
| --- | --- | --- |
| System | Multidisciplinary functional grouping | TEXT `engineering_assets.system` only — **legacy label** |
| Subsystem | Child functional grouping; real object when it has interfaces/requirements/assets of its own | TEXT `engineering_assets.subsystem` |
| Asset | Identifiable lifecycle-managed engineered item | `engineering_assets` (`asset_tag` unique per tenant) |
| Discipline | Professional practice classification | `engineering_disciplines` / manifest const |
| Component | Constituent of an asset, not independently tagged unless promoted | parent_asset or model element |

Full anti-definitions: `CANONICAL_DOMAIN_MODEL.md` §2.

---

## 3. Hierarchy rules

```
Project
  └── System (multidisciplinary)
        ├── Subsystem (optional real object)
        │     └── Asset(s) via CONTAINS / USES
        └── Asset(s) via CONTAINS / USES / DEPENDS_ON
Discipline ──classifies── Document, Model, Calculation, Review scope, Resource
Discipline does NOT parent System
```

- An Asset has at most one **parent asset** today (`parent_asset_id`). That is physical/logical breakdown, not system membership.
- System membership is n–n (`USES` / `CONTAINS`). Do not overload `parent_asset_id` to fake a system tree.
- A System spans zero or more Areas. Area is spatial, not functional.

---

## 4. Multidisciplinary interaction

A single System (Crushing) typically involves:

| Discipline | Typical contribution |
| --- | --- |
| Process | Duty, mass balance, control philosophy inputs |
| Mechanical | Equipment selection, datasheets |
| Structural | Supports, buildings, dynamic loads |
| Civil | Foundations, drainage |
| Electrical | Motors, MCC, power |
| I&C | Instruments, control |
| Piping | Process/utility piping |
| Geotechnical | Ground conditions (assumptions) |
| HSE / Safety | Hazardous events, SIL/LOPA inputs |
| Project Controls | Cost/schedule context (not system identity) |

Systems Intelligence aggregates these as **inputs to the System object**. Discipline Intelligence remains authoritative for discipline artefacts (`document_type`, `discipline_id`).

Interface objects (`CONNECTS`) are the governed boundaries between systems, assets, and **responsibility** (discipline/company). They are not owned by a single discipline even when the interface type is `mechanical` or `electrical`.

---

## 5. System / discipline matrix (planning pattern)

Not a table to implement now. Future query pattern:

| | Process | Mechanical | Structural | Electrical | I&C | Civil | … |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Crushing | R | R | C | C | C | C | |
| Conveying | C | R | C | C | C | I | |
| Water | R | C | I | C | C | R | |
| Power | I | I | I | R | C | I | |

R = responsible artefact owner for that cell; C = contributing; I = informed. This is an **RACI-like overlay**, not System identity.

---

## 6. Interface role

Interfaces prevent discipline silos from hiding coupling:

- Physical / mechanical / piping / structural / electrical / control
- Functional / process
- Data / information
- Responsibility / contract / schedule

Interface `CONNECTS` System, Asset, Discipline, or Responsibility. Review may find missing interfaces; PI may detect them; **neither owns the Interface object**.

Model mapping (`MAPPED_TO`) connects IFC/analytical elements to assets/spatial/twin — useful evidence for an interface, not the interface itself.

---

## 7. Anti-silo rules

1. Do not create `structural_systems` / `mechanical_systems` tables.
2. Do not let Discipline Intelligence mint `system_id`.
3. Do not use PI Knowledge Graph types as the System register.
4. Do not treat `engineering_assets.system` TEXT as a stable id after a System table exists (migration later; not A1).
5. ERA `discipline` on findings is a **classification**, not ownership of the reviewed system.
