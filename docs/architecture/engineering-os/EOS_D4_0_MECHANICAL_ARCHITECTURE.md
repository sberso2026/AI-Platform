# EOS-D4-0 Mechanical Architecture

## Purpose

D4 is the Mechanical engineering discipline inside Engineering OS. This phase defines Mechanical scope, ownership, objects, evidence, vendor information, design-condition and performance context, authority, currentness, interfaces to Structural, Civil, and Geotechnical, future interface contracts for Piping, Process, Electrical, and Instrumentation and Control, the future D9 source contract, and the later implementation sequence. It does not record a Mechanical object and it does not size or calculate equipment.

The Geotechnical track remains complete with the classification COMPLETE_BOUNDED_WITH_LIMITATIONS and a runtime count of eleven. The Civil track remains complete with the same classification and runtime count. This phase does not reopen D1, D2, or D3. D1 structural pack complete remains no. D1N stays closed.

## Scope

Canonical Mechanical scope is governed context for equipment and mechanical systems. That includes rotating equipment, static equipment, mechanical packages, HVAC and mechanical building-services equipment where the project assigns it to Mechanical, materials-handling and lifting equipment where applicable, equipment identification, service and function, technical requirements, mechanical attributes, operating and design-condition references supplied by an authoritative source, vendor and manufacturer information, package boundaries, arrangement, maintainability and access context, assumptions, requirements, decisions, evidence, review and validation, interfaces and handoffs, currentness and lineage, and a future D9 source contract.

## Non-scope

D4 does not absorb Structural, Civil, Geotechnical, Piping, Process, Electrical, or Instrumentation and Control authority. It does not route pipe, design piping lines, analyze piping stress, design piping supports, define piping material classes, or perform piping hydraulic design. It does not own process design basis, process calculations, heat and material balance, process simulation, process conditions, process sizing basis, or a Process-owned control philosophy. It does not calculate equipment, rotating machinery, static equipment, thermal-mechanical behavior, mechanical loads, vibration, fatigue, or a mechanical design optimum. It does not detect spatial clashes or optimize across disciplines. Cross-discipline intelligence remains D9. This phase does not claim validation, approval, certification, regulatory compliance, or general availability.

## Mechanical authority model

D4 is the discipline authority for the Mechanical context listed in the scope. It is not Structural authority, Civil authority, Geotechnical authority, Piping authority, Process authority, Electrical authority, or Instrumentation and Control authority. A Mechanical equipment or nozzle record does not make D4 the piping-system authority. A recorded equipment context is not a process design. A mechanical load or mass context is not a structural design. Equipment footprint or site requirements do not transfer Civil or Geotechnical authority. Electrical ownership of a motor remains D7 even when Mechanical records the motor as mechanical equipment context.

AI is not Mechanical engineering authority. An administrator is not Mechanical engineering authority. Authority roles for later records are author or designer, reviewer, approver, Mechanical engineering authority, lifecycle authority, source-system authority, AI assistant, and administrator. Those roles stay distinct.

## Object taxonomy

Adopted object types are MECHANICAL_SYSTEM_CONTEXT, MECHANICAL_EQUIPMENT, ROTATING_EQUIPMENT, STATIC_EQUIPMENT, MECHANICAL_PACKAGE, MECHANICAL_COMPONENT_CONTEXT, MECHANICAL_EQUIPMENT_REQUIREMENT, MECHANICAL_DESIGN_CONDITION_CONTEXT, MECHANICAL_PERFORMANCE_CONTEXT, MECHANICAL_INTERFACE_POINT, MECHANICAL_VENDOR_DOCUMENT_CONTEXT, MECHANICAL_MAINTAINABILITY_CONTEXT, MECHANICAL_GOVERNANCE_RECORD, MECHANICAL_REQUIREMENT, MECHANICAL_ASSUMPTION, MECHANICAL_DECISION, and MECHANICAL_EVIDENCE_REFERENCE. The last four are governed record types that sit beside the required equipment taxonomy. They do not create a second object model.

An unknown or freeform type does not become authoritative by being named. No freeform authoritative Mechanical object model is planned.

## Identity model

Each adopted object will have a stable identity inside tenant, workspace, and project scope, a canonical object type, a tag or reference where one applies, a service or function, a lifecycle or maturity stage, an exact revision, explicit relationships, provenance, currentness, a canonical fingerprint, and immutable history. Object identity is not the engineering content of the object. Object identity is not validated engineering. Relationships are declared. They are not inferred.

## Equipment categories

Rotating categories that the architecture can name are pumps, compressors, fans and blowers, turbines, motors only as Mechanical equipment context, and other rotating machinery. Static categories are vessels, tanks, heat exchangers, separators, mechanical skids, and packaged static equipment. Package categories are vendor packages, modular mechanical packages, and packaged utility systems where Mechanical owns them. Other Mechanical categories are HVAC equipment where the project assigns it to Mechanical, materials-handling equipment, and lifting or mechanical handling equipment where applicable. Naming a category does not implement that equipment type, and the architecture does not claim to cover every possible equipment type.

## Design-condition semantics

A source requirement is not a Mechanical interpretation. A process condition is not a Mechanical design condition. A Mechanical design condition is not a validated design condition. Vendor data is not engineering approval. A later phase may record a candidate or adopted Mechanical design-condition context only when a governed source and the appropriate authority support it. AI must not fabricate design pressure, design temperature, equipment duty, flow, power, capacity, speed, efficiency, mass, center of gravity, nozzle loads, dynamic loads, material selection, or allowable limits. This phase does not fabricate Process conditions.

## Performance-context semantics

The architecture can later record supplied or adopted performance context for capacity, duty, speed, power, efficiency, head, torque, temperature, pressure, vibration criteria, noise criteria, and a mechanical operating envelope. That context is governed data. It is not a Mechanical calculation and it is not validated performance.

## Vendor data and evidence

Vendor information covers datasheets, certified or vendor drawings, manuals, equipment curves, performance data, dimensions, weights, center of gravity, nozzle information, package interfaces, inspection and test records, deviations, and qualifications or exceptions. Each record keeps exact source, revision, vendor or manufacturer, provenance, authority, status, limitations, and currentness. Vendor data is not engineering validated and is not engineering approved.

Evidence classes are supplied calculations, datasheets, drawings, vendor documents, specifications, inspection and test reports, equipment curves, certificates where applicable, photographs, manufacturer literature, and project engineering records. Evidence does not establish Mechanical validation. AI cannot fabricate Mechanical evidence.

## Maintainability, access, and package context

The architecture names access, maintenance envelope, lifting and removal space, replacement path, service clearances, equipment orientation, maintenance requirements, and package access restrictions. This is contextual architecture. It is not spatial validation, clash detection, or multidisciplinary optimization.

## D1, D2, and D3 boundaries

Future D4 to D1 handoffs may carry equipment mass or load context, dynamic-load context, support or baseplate context, anchor or interface requirements, equipment footprint, and center-of-gravity context. Future D1 to D4 references may cite structural support geometry, support capacity context, and foundation or support references. Defining the interface does not transfer Structural authority.

Future Civil subjects are footprint, access, site arrangement, equipment pad or site requirements, and drainage or site constraints. Future Geotechnical references are foundation or site constraints, settlement context, and ground-condition limitations relevant to equipment support. D2 and D3 keep their authority. No Civil or Geotechnical engineering is implemented here.

## D5 through D8 interface contracts

These contracts are architecture only. Piping may later receive nozzle or interface points, allowable nozzle-load references, connection geometry, and equipment connection requirements. Process may later supply process duty, the operating or design-condition source, a process capacity requirement, and process service. Electrical may later receive electrical load or demand, motor requirements, supply characteristics, and hazardous-area or electrical interface references. Instrumentation and Control may later receive instrumentation interface points, control or monitoring requirements, trip or alarm interfaces, and package-control interfaces. No D5 through D8 runtime is started.

## Currentness, fingerprint, and digital thread

Currentness reuses the existing states CURRENT, STALE, REASSESSMENT_REQUIRED, and SUPERSEDED. Fingerprints reuse fingerprintCanonical. The digital thread remains packages/engineering-os/src/digital-thread. No parallel Mechanical currentness engine, digital thread, or second fingerprint algorithm is created. Exact revisions are required. History is immutable. Silent auto-repointing is not allowed. Maturity reuses CONCEPT, PREFEASIBILITY, FEASIBILITY, FEED, and DETAILED_DESIGN. A maturity stage is not validation, approval, or certification.

## Review and validation semantics

Later records keep source evidence, candidate information, adopted engineering information, reviewed, validated, conformant, approved, and certified as distinct states. Reviewed is not validated. Validated is not conformant, approved, or certified. This phase does not implement a validation, approval, or certification runtime. D4 uses the existing jurisdiction profile catalog and adds no profile id. It does not claim legal or regulatory compliance.

## Calculation prohibitions

Equipment sizing, rotating-equipment calculation, static-equipment calculation, thermal-mechanical calculation, mechanical-load calculation, vibration analysis, fatigue analysis, and mechanical design optimization remain at runtime count zero. The architecture must not be read as if those capabilities already exist.

## D9 source-contract architecture

A future D4 source contract may expose exact object revision, equipment identity and type, requirements, design-condition context, performance context, vendor information, Mechanical interfaces, maintainability constraints, assumptions, decisions, change or reassessment state, review and validation state, authority, currentness, provenance, limitations, lineage, and the canonical fingerprint. The source-contract runtime count is zero. D9 integration count is zero. D9 runtime remains unstarted. Multidisciplinary reasoning, conflict detection, conflict resolution, and multidisciplinary recommendation remain zero. D9 owns that future reasoning.

## R1 through R12 decomposition

Twelve later phases follow this architecture, each with one primary subject. R1 is identity and object foundation only. R2 is equipment and system context. R3 is design conditions and performance context. R4 is vendor data and evidence. R5 is Mechanical technical requirements that are not owned by Process, Piping, Electrical, or Instrumentation and Control. R6 is maintainability, access, and package context. R7 is requirements, assumptions, decisions, and change. R8 is discipline interfaces and handoffs. R9 is review and validation governance. R10 is currentness and the digital thread. R11 is the D9 source contract. R12 is bounded closeout only. No phase absorbs D5 through D8 authority.

The first phase is EOS-D4-R1-MECHANICAL-IDENTITY-AND-OBJECT-FOUNDATION, type MECHANICAL_IDENTITY_AND_OBJECT_FOUNDATION. It implements the governed Mechanical context and Mechanical-owned object identities using this taxonomy, canonical object identity, tenant workspace and project scope, lifecycle and maturity, explicit relationships, provenance, currentness, canonical fingerprint, and immutable history. It does not yet create substantive equipment engineering data, performance or design-condition records, vendor data, calculations, interfaces, validation, or D5 through D9 runtime. This architecture phase does not start R1.

## Runtime prohibition

Mechanical runtime has not started. Runtime count remains zero. Object, equipment-context, design-condition, performance, vendor-data, requirement, maintainability, requirements and change, interface, review and validation, dedicated currentness, source-contract, calculation, and cross-discipline counts remain zero. D5 through D9 remain unstarted. No database schema changes. No dependency is added.

## Limitations

This architecture defines what Mechanical information EOS may govern. It does not perform Mechanical engineering. It does not prove a live project, a code, or a professional practice requirement. D1 structural debt and the established security baseline remain outside D4.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 317 files and 1820 tests. Types typecheck passed. Web typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. Integration tests passed. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1. The moderate advisory remains GHSA-w5hq-g745-h8pq on uuid 8.3.2 through exceljs. Release governance typecheck passed, tests passed at 133, artifact classification passed, and the ledger returned ok.

## Acceptance

D4 architecture is defined and ready for the identity phase. The canonical phase count is twelve. Runtime count is zero. D1 remains incomplete. D2 and D3 remain closed and complete with limitations. The next phase is EOS-D4-R1-MECHANICAL-IDENTITY-AND-OBJECT-FOUNDATION. This document does not execute that phase.
